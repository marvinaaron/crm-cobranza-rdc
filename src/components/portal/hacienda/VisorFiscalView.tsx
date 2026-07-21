"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAlcanceCfdi } from "@/context/AlcanceCfdiContext";
import { alcanceASearchParams, alcanceLabel } from "@/lib/cfdi/alcance-periodo";
import { fmtMxn, portalCard, portalCardTitle } from "@/components/portal/portal-ui";
import GraficoIngresosEgresos from "@/components/portal/hacienda/GraficoIngresosEgresos";
import AlcancePeriodoCfdiSelector from "@/components/portal/hacienda/AlcancePeriodoCfdiSelector";
import type { GrupoCategoriaVisor } from "@/lib/cfdi/categorias-visor";
import type { CategoriaDeduccion, ResumenDeduccionesAsalariado } from "@/lib/cfdi/deducciones-personales";
import type { PuntoTendenciaMes, ResumenMesCfdi } from "@/lib/cfdi/resumen-mes";

type VisorData = {
  periodo: {
    label: string;
    mes: number;
    anio: number;
    mesHasta?: number;
    anioHasta?: number;
    unMes?: boolean;
  };
  perfil: "asalariado" | "actividad";
  regimen: { clave: string; nombre: string };
  grupos?: GrupoCategoriaVisor[];
  categorias?: GrupoCategoriaVisor["lineas"];
  deducciones: ResumenDeduccionesAsalariado | null;
  resumenMes: ResumenMesCfdi | null;
  tendenciaAnual: PuntoTendenciaMes[];
  mesesActivos?: number[];
  catalogoDeducciones: CategoriaDeduccion[] | null;
  cliente?: { id: number; razonSocial: string; rfc: string };
};

type Props = {
  /** Portal (default) o consola admin con selector de cliente. */
  modo?: "portal" | "admin";
  clienteId?: number | null;
  /** Incrementar tras ingesta para refrescar el visor. */
  recargarSeñal?: number;
  clienteLabel?: string;
};

export default function VisorFiscalView({
  modo = "portal",
  clienteId = null,
  recargarSeñal = 0,
  clienteLabel,
}: Props) {
  const { alcance } = useAlcanceCfdi();
  const labelAlcance = alcanceLabel(alcance);
  const [data, setData] = useState<VisorData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (modo === "admin" && clienteId == null) {
      setData(null);
      setCargando(false);
      setError(null);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const params = alcanceASearchParams(alcance);
      const url =
        modo === "admin" && clienteId != null
          ? `/api/admin/cfdi/visor?clienteId=${clienteId}&${params}`
          : `/api/portal/hacienda/visor?${params}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error.");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error.");
      setData(null);
    } finally {
      setCargando(false);
    }
  }, [
    modo,
    clienteId,
    alcance.desde.mes,
    alcance.desde.anio,
    alcance.hasta.mes,
    alcance.hasta.anio,
    alcance.preset,
    recargarSeñal,
  ]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const grupos: GrupoCategoriaVisor[] =
    data?.grupos ??
    (data?.categorias?.length
      ? [{ id: "ingresos", label: "Comprobantes", lineas: data.categorias }]
      : []);
  const maxCat = Math.max(
    ...grupos.flatMap((g) => g.lineas.map((c) => c.total)),
    1
  );
  const hayCfdi = grupos.some((g) => g.lineas.some((l) => l.total > 0));
  const unMes =
    data?.periodo.unMes ??
    (alcance.desde.mes === alcance.hasta.mes &&
      alcance.desde.anio === alcance.hasta.anio);

  const gruposPrincipales = grupos.filter((g) => g.id === "ingresos" || g.id === "gastos");
  const grupoNomina = grupos.find((g) => g.id === "nomina");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <header className="min-w-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-0.5">
            CFDI
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Visor fiscal</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {modo === "admin" && (clienteLabel || data?.cliente?.razonSocial) ? (
              <>
                <span className="font-bold text-violet-700">
                  {clienteLabel ?? data?.cliente?.razonSocial}
                </span>
                {" · "}
              </>
            ) : null}
            {data?.periodo.label ?? labelAlcance}
            {data?.regimen ? ` · ${data.regimen.nombre}` : ""}
          </p>
          {modo === "admin" && (
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Vista previa — igual que el portal del cliente
            </p>
          )}
        </header>
        <AlcancePeriodoCfdiSelector className="shrink-0 self-start" />
      </div>

      {modo === "admin" && clienteId == null && (
        <p className="text-sm font-bold text-slate-500 text-center py-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          Selecciona un cliente para ver su visor fiscal.
        </p>
      )}

      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      {(cargando && (modo === "portal" || clienteId != null)) && (
        <p className="text-sm font-bold text-slate-400 text-center py-12">Cargando visor…</p>
      )}

      {data && !cargando && (
        <>
          {data.resumenMes && (
            <div className="grid gap-3 lg:grid-cols-2 lg:items-stretch">
              <ResumenMes
                resumen={data.resumenMes}
                perfil={data.perfil}
                unMes={unMes}
                modo={modo}
                clienteId={clienteId}
              />
              <GraficoIngresosEgresos
                puntos={data.tendenciaAnual ?? []}
                mesesActivos={
                  data.mesesActivos ??
                  (unMes ? [alcance.desde.mes] : undefined)
                }
                anio={data.periodo.anioHasta ?? data.periodo.anio}
              />
            </div>
          )}

          {/* Ingresos / Gastos por método de pago — dos columnas */}
          {hayCfdi ? (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
              <p className={portalCardTitle}>Ingresos y gastos</p>
              <div className="flex items-center gap-3 text-[9px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  Vigentes
                </span>
                <span className="flex items-center gap-1.5 text-red-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                  Cancelados
                </span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {gruposPrincipales.map((grupo) => (
                <div
                  key={grupo.id}
                  className={`${portalCard} !rounded-2xl !p-4 sm:!p-5`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                    {grupo.label}
                  </p>
                  <ul className="space-y-2">
                    {grupo.lineas.map((cat) => (
                      <li
                        key={cat.id}
                        className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_2.25rem] gap-2 items-center"
                      >
                        <p className="text-[11px] font-semibold text-slate-700 leading-snug pl-1.5 border-l-2 border-slate-200">
                          {cat.label}
                        </p>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                          {cat.vigentes > 0 && (
                            <div
                              className="h-full bg-emerald-500 transition-all"
                              style={{
                                width: `${(cat.vigentes / maxCat) * 100}%`,
                              }}
                            />
                          )}
                          {cat.cancelados > 0 && (
                            <div
                              className="h-full bg-red-400 transition-all"
                              style={{
                                width: `${(cat.cancelados / maxCat) * 100}%`,
                              }}
                            />
                          )}
                        </div>
                        <p className="text-xs font-black text-slate-800 text-right tabular-nums">
                          {cat.total}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {grupoNomina && (
              <div className={`${portalCard} !rounded-2xl !p-4 sm:!p-5`}>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3 flex items-baseline justify-between gap-2">
                  <span>{grupoNomina.label}</span>
                  {grupoNomina.montoTotal != null && (
                    <span className="text-xs font-black normal-case tracking-normal text-slate-700">
                      {fmtMxn(grupoNomina.montoTotal, 2)}
                    </span>
                  )}
                </p>
                <ul className="space-y-2">
                  {grupoNomina.lineas.map((cat) => (
                    <li
                      key={cat.id}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_2.25rem] gap-2 items-center"
                    >
                      <p className="text-[11px] font-semibold text-slate-700 leading-snug pl-1.5 border-l-2 border-slate-200">
                        {cat.label}
                      </p>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                        {cat.vigentes > 0 && (
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{
                              width: `${(cat.vigentes / maxCat) * 100}%`,
                            }}
                          />
                        )}
                        {cat.cancelados > 0 && (
                          <div
                            className="h-full bg-red-400 transition-all"
                            style={{
                              width: `${(cat.cancelados / maxCat) * 100}%`,
                            }}
                          />
                        )}
                      </div>
                      <p className="text-xs font-black text-slate-800 text-right tabular-nums">
                        {cat.total}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
          ) : (
            <section className={`${portalCard} !rounded-2xl !p-5 text-center py-6`}>
              <p className="text-sm font-bold text-slate-500">
                Sin CFDI en este periodo
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Cuando haya comprobantes en el periodo aparecerán aquí por método de pago.
              </p>
            </section>
          )}

          {data.perfil === "asalariado" && data.deducciones && data.catalogoDeducciones && (
            <DeduccionesDashboard
              deducciones={data.deducciones}
              catalogo={data.catalogoDeducciones}
            />
          )}
        </>
      )}
    </div>
  );
}

function DeduccionesDashboard({
  deducciones,
  catalogo,
}: {
  deducciones: ResumenDeduccionesAsalariado;
  catalogo: CategoriaDeduccion[];
}) {
  const pctUsado =
    deducciones.limiteDeduccion > 0
      ? Math.min(100, (deducciones.acumuladoEnTope / deducciones.limiteDeduccion) * 100)
      : 0;

  const montos = new Map(deducciones.porCategoria.map((p) => [p.id, p.monto]));

  return (
    <div className="space-y-6">
      <section className={`${portalCard} bg-gradient-to-br from-[var(--portal-navy)] to-[var(--portal-navy-hover)] text-white`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
          Deducción general acumulada
        </p>
        <p className="text-3xl font-black mt-2">{fmtMxn(deducciones.acumuladoEnTope, 2)}</p>
        <p className="text-sm text-white/80 mt-1">
          Disponible para deducir:{" "}
          <strong>{fmtMxn(deducciones.disponibleDeducir, 2)}</strong>
        </p>
        <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-white/90 rounded-full transition-all"
            style={{ width: `${pctUsado}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-white/60">15% ingresos anuales</p>
            <p className="font-bold mt-0.5">{fmtMxn(deducciones.topePorcentajeIngreso, 2)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-white/60">5 UMA anuales</p>
            <p className="font-bold mt-0.5">{fmtMxn(deducciones.topeUmas, 2)}</p>
          </div>
        </div>
        <p className="text-[10px] text-white/60 mt-3 leading-relaxed">
          Límite aplicable: el menor entre 15% de tus ingresos por nómina ({fmtMxn(deducciones.ingresoAnualNomina, 2)} acumulados en {new Date().getFullYear()}) y 5 UMA.
        </p>
      </section>

      <section className="space-y-3">
        <p className={portalCardTitle}>Deducciones que entran al tope</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {catalogo
            .filter((c) => c.entraAlTope)
            .map((c) => (
              <CardDeduccion key={c.id} cat={c} monto={montos.get(c.id) ?? 0} />
            ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className={portalCardTitle}>Deducciones que no entran al tope</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {catalogo
            .filter((c) => !c.entraAlTope)
            .map((c) => (
              <CardDeduccion key={c.id} cat={c} monto={montos.get(c.id) ?? 0} />
            ))}
        </div>
      </section>
    </div>
  );
}

function CardDeduccion({
  cat,
  monto,
}: {
  cat: CategoriaDeduccion;
  monto: number;
}) {
  return (
    <div className={`${portalCard} py-5`}>
      <p className="text-sm font-bold text-slate-900">{cat.titulo}</p>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.descripcion}</p>
      <p className="text-lg font-black text-[var(--portal-navy)] mt-3">{fmtMxn(monto, 2)}</p>
      <p className="text-[10px] text-slate-400 mt-2">{cat.fundamento}</p>
      <span
        className={`inline-block mt-3 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
          cat.entraAlTope
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-800"
        }`}
      >
        {cat.entraAlTope ? "Entra al tope" : cat.limitePropio ?? "Límite independiente"}
      </span>
    </div>
  );
}

function ResumenMes({
  resumen,
  perfil,
  unMes,
  modo,
  clienteId,
}: {
  resumen: ResumenMesCfdi;
  perfil: "asalariado" | "actividad";
  unMes: boolean;
  modo: "portal" | "admin";
  clienteId: number | null;
}) {
  const { setRango } = useAlcanceCfdi();
  const labelIngresos =
    perfil === "asalariado" ? "Ingresos por nómina" : "Ingresos facturados";
  const labelGastos =
    perfil === "asalariado" ? "Gastos con factura" : "Gastos comprobados";
  const esUtilidad = resumen.diferenciaMes >= 0;
  const etiquetaPeriodo = unMes ? "mes" : "periodo";

  const margenPct =
    resumen.ingresosMes > 0
      ? Math.round((resumen.diferenciaMes / resumen.ingresosMes) * 1000) / 10
      : null;

  const vs = resumen.vsMesAnterior;

  const fmtDelta = (pct: number | null) =>
    pct == null ? "—" : `${pct >= 0 ? "↑" : "↓"}${Math.abs(pct)}%`;

  const hrefClientes =
    modo === "admin" && clienteId != null
      ? `/cfdi?cliente=${clienteId}&tab=clientes`
      : modo === "portal"
        ? "/portal/hacienda/clientes"
        : null;
  const hrefProveedores =
    modo === "admin" && clienteId != null
      ? `/cfdi?cliente=${clienteId}&tab=proveedores`
      : modo === "portal"
        ? "/portal/hacienda/proveedores"
        : null;

  const irMesAnterior = () => {
    if (!vs) return;
    setRango(
      { mes: vs.mes, anio: vs.anio },
      { mes: vs.mes, anio: vs.anio }
    );
  };

  return (
    <section className={`${portalCard} !rounded-2xl !p-4 sm:!p-5 space-y-2.5 h-full flex flex-col`}>
      <p className={portalCardTitle}>
        {unMes ? "Resumen del mes" : "Resumen del periodo"}
      </p>
      <div className="grid gap-1.5 flex-1 content-start">
        <Metrica
          label={labelIngresos}
          valor={fmtMxn(resumen.ingresosMes, 2)}
          cfdi={resumen.cfdiIngresos}
          href={hrefClientes}
          hrefLabel="Ver clientes"
        />
        <Metrica
          label={labelGastos}
          valor={fmtMxn(resumen.gastosMes, 2)}
          cfdi={resumen.cfdiGastos}
          href={hrefProveedores}
          hrefLabel="Ver proveedores"
        />
        <Metrica
          label={`Resultado del ${etiquetaPeriodo}`}
          valor={
            resumen.diferenciaMes < 0
              ? `-${fmtMxn(Math.abs(resumen.diferenciaMes), 2)}`
              : fmtMxn(resumen.diferenciaMes, 2)
          }
          cfdi={resumen.cfdiIngresos + resumen.cfdiGastos}
          destacar
          utilidad={esUtilidad}
          info={`Utilidad o pérdida del ${etiquetaPeriodo} según tus CFDI vigentes: ingresos menos egresos. Positivo = utilidad; negativo = pérdida.`}
        />
      </div>

      {/* Chips grises en una sola fila */}
      <div className="mt-auto pt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <ChipDato
          etiqueta="Margen"
          valor={margenPct == null ? "—" : `${margenPct >= 0 ? "+" : ""}${margenPct}%`}
          titulo="Resultado ÷ ingresos del periodo"
        />
        <ChipDato
          etiqueta="Cancel."
          valor={String(resumen.cfdiCancelados ?? 0)}
          titulo="CFDI cancelados en este periodo"
        />
        <ChipDato
          etiqueta={vs ? `Ingr. vs ${vs.label}` : "Ingr. vs ant."}
          valor={fmtDelta(vs?.deltaIngresosPct ?? null)}
          titulo={
            vs
              ? `Ingresos vs ${vs.label}. Clic para abrir ese mes.`
              : "Solo disponible al ver un mes"
          }
          onClick={vs ? irMesAnterior : undefined}
        />
        <ChipDato
          etiqueta={vs ? `Gastos vs ${vs.label}` : "Gastos vs ant."}
          valor={fmtDelta(vs?.deltaGastosPct ?? null)}
          titulo={
            vs
              ? `Gastos vs ${vs.label}. Clic para abrir ese mes.`
              : "Solo disponible al ver un mes"
          }
          onClick={vs ? irMesAnterior : undefined}
        />
      </div>
    </section>
  );
}

function ChipDato({
  etiqueta,
  valor,
  titulo,
  onClick,
}: {
  etiqueta: string;
  valor: string;
  titulo?: string;
  onClick?: () => void;
}) {
  const clase = `rounded-md border border-slate-200 bg-slate-50 text-slate-700 px-2 py-2 text-center min-w-0 ${
    onClick
      ? "cursor-pointer hover:bg-slate-100 hover:ring-2 hover:ring-slate-300/80 active:scale-[0.98] transition"
      : ""
  }`;

  const contenido = (
    <>
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 truncate leading-none">
        {etiqueta}
      </p>
      <p className="text-xs sm:text-sm font-black tabular-nums text-slate-800 mt-1 leading-none truncate">
        {valor}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} title={titulo} className={clase}>
        {contenido}
      </button>
    );
  }

  return (
    <div title={titulo} className={clase}>
      {contenido}
    </div>
  );
}

function IconoInfo({ texto }: { texto: string }) {
  return (
    <span className="relative inline-flex group">
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200/80 text-slate-500 hover:bg-slate-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portal-navy)]"
        aria-label="Más información"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-2 w-52 -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-medium leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {texto}
      </span>
    </span>
  );
}

function Metrica({
  label,
  valor,
  cfdi,
  destacar,
  utilidad,
  info,
  href,
  hrefLabel,
}: {
  label: string;
  valor: string;
  cfdi: number;
  destacar?: boolean;
  utilidad?: boolean;
  info?: string;
  href?: string | null;
  hrefLabel?: string;
}) {
  const cuerpo = (
    <>
      <div className="min-w-0 flex-1 bg-slate-50 px-2.5 py-1.5">
        <div className="flex items-center gap-1">
          <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 leading-tight">
            {label}
          </p>
          {info && <IconoInfo texto={info} />}
          {href && (
            <span className="ml-auto text-[7px] font-black uppercase tracking-wider text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {hrefLabel ?? "Ver"} →
            </span>
          )}
        </div>
        <p
          className={`text-sm font-black mt-0.5 truncate tabular-nums ${
            destacar
              ? utilidad
                ? "text-emerald-600"
                : "text-red-600"
              : "text-slate-900"
          }`}
        >
          {valor}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-center justify-center border-l border-slate-100 bg-white px-2 py-1.5 min-w-[2.5rem]">
        <p className="text-sm font-black text-slate-800 leading-none tabular-nums">{cfdi}</p>
        <p className="text-[6px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
          CFDI
        </p>
      </div>
    </>
  );

  const baseCls =
    "flex overflow-hidden rounded-lg border border-slate-100 bg-white";

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseCls} group hover:border-violet-200 hover:ring-2 hover:ring-violet-100 transition`}
        title={hrefLabel}
      >
        {cuerpo}
      </Link>
    );
  }

  return <div className={baseCls}>{cuerpo}</div>;
}

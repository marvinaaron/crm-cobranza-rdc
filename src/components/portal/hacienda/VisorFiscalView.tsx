"use client";

import { useCallback, useEffect, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import { periodoLabel } from "@/lib/clientes";
import { fmtMxn, portalCard, portalCardTitle } from "@/components/portal/portal-ui";
import type { ResumenCategoriaVisor } from "@/lib/cfdi/categorias-visor";
import type { CategoriaDeduccion, ResumenDeduccionesAsalariado } from "@/lib/cfdi/deducciones-personales";

type ResumenMes = {
  ingresosMes: number;
  gastosMes: number;
  diferenciaMes: number;
  facturasEmitidas: number;
  facturasRecibidas: number;
};

type VisorData = {
  periodo: { label: string };
  perfil: "asalariado" | "actividad";
  regimen: { clave: string; nombre: string };
  categorias: ResumenCategoriaVisor[];
  deducciones: ResumenDeduccionesAsalariado | null;
  resumenMes: ResumenMes | null;
  catalogoDeducciones: CategoriaDeduccion[] | null;
};

export default function VisorFiscalView() {
  const { periodo } = useClientes();
  const [data, setData] = useState<VisorData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        mes: String(periodo.mes),
        anio: String(periodo.anio),
      });
      const res = await fetch(`/api/portal/hacienda/visor?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error.");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error.");
      setData(null);
    } finally {
      setCargando(false);
    }
  }, [periodo.mes, periodo.anio]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const maxCat = Math.max(...(data?.categorias.map((c) => c.total) ?? [1]), 1);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">
          CFDI
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Visor fiscal</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          {periodoLabel(periodo)}
          {data?.regimen ? ` · ${data.regimen.nombre}` : ""}
        </p>
      </header>

      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      {cargando && (
        <p className="text-sm font-bold text-slate-400 text-center py-12">Cargando visor…</p>
      )}

      {data && !cargando && (
        <>
          {data.resumenMes && (
            <ResumenMes
              resumen={data.resumenMes}
              perfil={data.perfil}
            />
          )}

          {/* CFDI por categoría */}
          {data.categorias.length > 0 ? (
          <section className={portalCard}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <p className={portalCardTitle}>CFDI por categoría</p>
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  Vigentes
                </span>
                <span className="flex items-center gap-1.5 text-red-600">
                  <span className="w-3 h-3 rounded-sm bg-red-400" />
                  Cancelados
                </span>
              </div>
            </div>
            <ul className="space-y-3">
              {data.categorias.map((cat) => (
                <li key={cat.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_3rem] gap-3 items-center">
                  <p className="text-xs font-semibold text-slate-700 leading-snug">{cat.label}</p>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
                    {cat.vigentes > 0 && (
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${(cat.vigentes / maxCat) * 100}%` }}
                      />
                    )}
                    {cat.cancelados > 0 && (
                      <div
                        className="h-full bg-red-400 transition-all"
                        style={{ width: `${(cat.cancelados / maxCat) * 100}%` }}
                      />
                    )}
                  </div>
                  <p className="text-sm font-black text-slate-800 text-right">{cat.total}</p>
                </li>
              ))}
            </ul>
          </section>
          ) : (
            <section className={`${portalCard} text-center py-8`}>
              <p className="text-sm font-bold text-slate-500">
                Sin CFDI en este periodo
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Cuando haya comprobantes del mes aparecerán aquí por categoría.
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
}: {
  resumen: ResumenMes;
  perfil: "asalariado" | "actividad";
}) {
  const labelIngresos =
    perfil === "asalariado" ? "Ingresos por nómina" : "Ingresos facturados";
  const labelGastos =
    perfil === "asalariado" ? "Gastos con factura" : "Gastos comprobados";

  return (
    <section className={`${portalCard} space-y-4`}>
      <p className={portalCardTitle}>Resumen del mes</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metrica label={labelIngresos} valor={fmtMxn(resumen.ingresosMes, 2)} />
        <Metrica label={labelGastos} valor={fmtMxn(resumen.gastosMes, 2)} />
        <Metrica
          label="Resultado del mes"
          valor={fmtMxn(resumen.diferenciaMes, 2)}
          destacar
        />
      </div>
      <p className="text-xs text-slate-400">
        {resumen.facturasEmitidas} CFDI emitidos · {resumen.facturasRecibidas} recibidos
      </p>
    </section>
  );
}

function Metrica({
  label,
  valor,
  destacar,
}: {
  label: string;
  valor: string;
  destacar?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p
        className={`text-xl font-black mt-1 ${
          destacar ? "text-[var(--portal-navy)]" : "text-slate-900"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

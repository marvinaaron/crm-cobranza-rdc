"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TARIFA_ISR_ANUAL_2026,
  ISR_RETENCIONES_2026,
  ISR_PROVISIONALES_PF_2026,
  ISR_RIF_BIMESTRAL_2026,
  SUBSIDIO_EMPLEO_2026,
  RECARGOS_2026,
  type RenglonTarifa,
  type TarifaIsr,
  type PeriodicidadRetencion,
  type MesProvisional,
  type BimestreRif,
} from "@/lib/fiscal/isr";
import { UMA_VIGENTE, UMA_HISTORICO } from "@/lib/fiscal/uma";
import {
  SALARIO_MINIMO_VIGENTE,
  SALARIO_MINIMO_HISTORICO,
  SALARIOS_MINIMOS_PROFESIONALES,
} from "@/lib/fiscal/salario-minimo";
import {
  INPC_FALLBACK,
  calcularVariacionAnual,
  formatearPeriodoInpc,
  type RegistroInpc,
} from "@/lib/fiscal/inpc";

const tabs = [
  { id: "isr", nombre: "ISR" },
  { id: "inpc", nombre: "INPC" },
  { id: "uma", nombre: "UMA" },
  { id: "salario", nombre: "Salario mínimo" },
  { id: "recargos", nombre: "Recargos" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function formatoMoneda(valor: number): string {
  return valor.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatoSinSigno(valor: number): string {
  if (!Number.isFinite(valor)) return "En adelante";
  return valor.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function TablaTarifaIsr({ tarifa }: { tarifa: { titulo: string; vigenciaDesde: string; renglones: RenglonTarifa[] } }) {
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-base font-bold text-slate-900">{tarifa.titulo}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{tarifa.vigenciaDesde}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Límite inferior</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Límite superior</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Cuota fija</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">% s/ excedente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tarifa.renglones.map((r, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                  {formatoSinSigno(r.limiteInferior)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                  {formatoSinSigno(r.limiteSuperior)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                  {formatoSinSigno(r.cuotaFija)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                  {r.porcentajeExcedente.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResumenSubsidio() {
  return (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-6">
      <h3 className="text-base font-bold text-slate-900">{SUBSIDIO_EMPLEO_2026.titulo}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{SUBSIDIO_EMPLEO_2026.vigenciaDesde}</p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-100">Monto fijo mensual</p>
          <p className="mt-2 text-3xl font-black tabular-nums">
            {formatoMoneda(SUBSIDIO_EMPLEO_2026.montoFijoMensual)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tope de ingreso</p>
          <p className="mt-2 text-lg font-bold text-slate-900">Hasta 1 SMG mensual</p>
          <p className="mt-1 text-sm text-slate-600">
            Aproximadamente {formatoMoneda(SUBSIDIO_EMPLEO_2026.limiteIngresoMensual)}/mes
          </p>
        </div>
      </div>
      <p className="mt-5 text-sm text-slate-600 leading-relaxed">{SUBSIDIO_EMPLEO_2026.nota}</p>
    </div>
  );
}

// ─── Panel ISR (con selectores deslizables) ─────────────────────────────────

type CategoriaIsr = "anual" | "retenciones" | "provisionales" | "rif";

const CATEGORIAS_ISR: Array<{ id: CategoriaIsr; label: string; descripcion: string }> = [
  {
    id: "anual",
    label: "Anual",
    descripcion: "Tarifa del ejercicio 2026 (arts. 97 y 152 LISR)",
  },
  {
    id: "retenciones",
    label: "Retenciones",
    descripcion: "Periódicas: diaria, semanal, decenal, quincenal y mensual",
  },
  {
    id: "provisionales",
    label: "Mensual PF (acumulada)",
    descripcion: "Pagos provisionales de personas físicas con actividad empresarial",
  },
  {
    id: "rif",
    label: "RIF bimestral",
    descripcion: "Régimen de Incorporación Fiscal · coeficiente de utilidad",
  },
];

const ORDEN_RETENCIONES: PeriodicidadRetencion[] = [
  "diaria",
  "semanal",
  "decenal",
  "quincenal",
  "mensual",
];

const ORDEN_MESES: MesProvisional[] = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const ORDEN_BIMESTRES: BimestreRif[] = [
  "ene-feb",
  "mar-abr",
  "may-jun",
  "jul-ago",
  "sep-oct",
  "nov-dic",
];

function SelectorDeslizable<T extends string>({
  opciones,
  seleccion,
  onSelect,
}: {
  opciones: Array<{ id: T; label: string }>;
  seleccion: T;
  onSelect: (id: T) => void;
}) {
  return (
    <div className="-mx-2 px-2 overflow-x-auto">
      <div className="flex gap-2 min-w-max pb-1">
        {opciones.map((opt) => {
          const activo = opt.id === seleccion;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                activo
                  ? "bg-gradient-to-br from-slate-900 to-indigo-900 text-white shadow-md"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-900 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PanelIsr() {
  const [categoria, setCategoria] = useState<CategoriaIsr>("anual");
  const [retencion, setRetencion] = useState<PeriodicidadRetencion>("mensual");
  const [mes, setMes] = useState<MesProvisional>("enero");
  const [bim, setBim] = useState<BimestreRif>("ene-feb");

  let tarifaActiva: TarifaIsr | null = null;
  let mostrarSubsidio = false;

  if (categoria === "anual") {
    tarifaActiva = TARIFA_ISR_ANUAL_2026;
  } else if (categoria === "retenciones") {
    tarifaActiva = ISR_RETENCIONES_2026[retencion];
    mostrarSubsidio = true;
  } else if (categoria === "provisionales") {
    tarifaActiva = ISR_PROVISIONALES_PF_2026[mes];
  } else if (categoria === "rif") {
    tarifaActiva = ISR_RIF_BIMESTRAL_2026[bim];
  }

  const descripcionCategoria = CATEGORIAS_ISR.find((c) => c.id === categoria)?.descripcion;

  return (
    <div className="space-y-5">
      {/* Selector primario: categoría */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 px-1">
          Tipo de tarifa
        </p>
        <SelectorDeslizable
          opciones={CATEGORIAS_ISR.map((c) => ({ id: c.id, label: c.label }))}
          seleccion={categoria}
          onSelect={setCategoria}
        />
        {descripcionCategoria ? (
          <p className="mt-2 px-1 text-xs text-slate-500">{descripcionCategoria}</p>
        ) : null}
      </div>

      {/* Selector secundario: período */}
      {categoria === "retenciones" ? (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 px-1">
            Periodicidad
          </p>
          <SelectorDeslizable
            opciones={ORDEN_RETENCIONES.map((r) => ({
              id: r,
              label: ISR_RETENCIONES_2026[r].etiquetaCorta,
            }))}
            seleccion={retencion}
            onSelect={setRetencion}
          />
        </div>
      ) : null}

      {categoria === "provisionales" ? (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 px-1">
            Mes acumulado
          </p>
          <SelectorDeslizable
            opciones={ORDEN_MESES.map((m) => ({
              id: m,
              label: ISR_PROVISIONALES_PF_2026[m].etiquetaCorta,
            }))}
            seleccion={mes}
            onSelect={setMes}
          />
        </div>
      ) : null}

      {categoria === "rif" ? (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 px-1">
            Bimestre
          </p>
          <SelectorDeslizable
            opciones={ORDEN_BIMESTRES.map((b) => ({
              id: b,
              label: ISR_RIF_BIMESTRAL_2026[b].etiquetaCorta,
            }))}
            seleccion={bim}
            onSelect={setBim}
          />
        </div>
      ) : null}

      {/* Tabla activa */}
      {tarifaActiva ? <TablaTarifaIsr tarifa={tarifaActiva} /> : null}

      {/* Subsidio al empleo (relacionado con retenciones) */}
      {mostrarSubsidio ? <ResumenSubsidio /> : null}
    </div>
  );
}

function PanelInpc() {
  const [serie, setSerie] = useState<RegistroInpc[]>(INPC_FALLBACK);
  const [fuente, setFuente] = useState<"INEGI" | "fallback">("fallback");
  const [actualizadoEn, setActualizadoEn] = useState("Datos locales");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    fetch("/api/fiscal/inpc")
      .then((r) => r.json())
      .then((data: { serie: RegistroInpc[]; fuente: "INEGI" | "fallback"; actualizadoEn: string }) => {
        if (!activo) return;
        if (data?.serie?.length) setSerie(data.serie);
        if (data?.fuente) setFuente(data.fuente);
        if (data?.actualizadoEn) setActualizadoEn(data.actualizadoEn);
      })
      .catch(() => {})
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const conVariacion = useMemo(() => calcularVariacionAnual(serie), [serie]);
  const ultimos18 = useMemo(() => conVariacion.slice(-18).reverse(), [conVariacion]);
  const ultimo = conVariacion[conVariacion.length - 1];
  const valoresGrafica = useMemo(() => conVariacion.slice(-24), [conVariacion]);

  const minValor = useMemo(() => Math.min(...valoresGrafica.map((r) => r.valor)), [valoresGrafica]);
  const maxValor = useMemo(() => Math.max(...valoresGrafica.map((r) => r.valor)), [valoresGrafica]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              INPC mensual · Índice Nacional de Precios al Consumidor
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Base 100 = 2da quincena julio 2018 · {cargando ? "Cargando…" : `Actualizado: ${actualizadoEn}`}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
              fuente === "INEGI"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {fuente === "INEGI" ? "Datos en vivo INEGI" : "Datos locales"}
          </span>
        </div>

        {ultimo ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Último dato</p>
              <p className="mt-1 text-2xl font-black tabular-nums">{ultimo.valor.toFixed(3)}</p>
              <p className="text-xs text-slate-300 mt-0.5">{formatearPeriodoInpc(ultimo)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Variación anual</p>
              <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums">
                {ultimo.variacion !== null ? `${ultimo.variacion.toFixed(2)}%` : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">vs. mismo mes año previo</p>
            </div>
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Variación 1 mes</p>
              <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums">
                {(() => {
                  const idx = conVariacion.length - 1;
                  const prev = conVariacion[idx - 1];
                  if (!prev) return "—";
                  const v = ((ultimo.valor - prev.valor) / prev.valor) * 100;
                  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
                })()}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">vs. mes previo</p>
            </div>
          </div>
        ) : null}

        {/* Mini gráfica de barras */}
        {valoresGrafica.length > 0 ? (
          <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
              Evolución últimos {valoresGrafica.length} meses
            </p>
            <div className="flex items-end gap-1 h-32">
              {valoresGrafica.map((r, idx) => {
                const altura = maxValor === minValor ? 50 : ((r.valor - minValor) / (maxValor - minValor)) * 100;
                const esUltimo = idx === valoresGrafica.length - 1;
                return (
                  <div
                    key={`${r.anio}-${r.mes}`}
                    className="group flex-1 flex flex-col items-center justify-end relative"
                  >
                    <div
                      className={`w-full rounded-t transition-all ${
                        esUltimo ? "bg-indigo-600" : "bg-slate-300 group-hover:bg-indigo-500"
                      }`}
                      style={{ height: `${Math.max(altura, 8)}%` }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                      {formatearPeriodoInpc(r)}: {r.valor.toFixed(3)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">Histórico mensual (últimos 18 meses)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Periodo</th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">INPC</th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Var. anual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ultimos18.map((r) => (
                <tr key={`${r.anio}-${r.mes}`} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-700">{formatearPeriodoInpc(r)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                    {r.valor.toFixed(3)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                    {r.variacion !== null ? `${r.variacion.toFixed(2)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PanelUma() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-slate-900">
          UMA vigente · Unidad de Medida y Actualización
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Vigencia: {UMA_VIGENTE.vigenciaDesde} al {UMA_VIGENTE.vigenciaHasta}
        </p>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Diaria</p>
            <p className="mt-1 text-2xl font-black tabular-nums">{formatoMoneda(UMA_VIGENTE.diaria)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mensual</p>
            <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums">{formatoMoneda(UMA_VIGENTE.mensual)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Anual</p>
            <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums">{formatoMoneda(UMA_VIGENTE.anual)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">Histórico anual</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Año</th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Diaria</th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Mensual</th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Anual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {UMA_HISTORICO.map((u) => (
                <tr key={u.anio} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{u.anio}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{formatoMoneda(u.diaria)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{formatoMoneda(u.mensual)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{formatoMoneda(u.anual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PanelSalarioMinimo() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-slate-900">Salario mínimo vigente</h3>
        <p className="text-xs text-slate-500 mt-0.5">Vigencia: {SALARIO_MINIMO_VIGENTE.vigenciaDesde}</p>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">General</p>
            <p className="mt-1 text-3xl font-black tabular-nums">{formatoMoneda(SALARIO_MINIMO_VIGENTE.general)}</p>
            <p className="text-xs text-slate-300 mt-0.5">diarios</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Frontera Norte</p>
            <p className="mt-1 text-3xl font-black tabular-nums">{formatoMoneda(SALARIO_MINIMO_VIGENTE.fronteraNorte)}</p>
            <p className="text-xs text-emerald-100 mt-0.5">diarios</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Histórico</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Año</th>
                  <th className="px-4 py-3 text-right font-semibold">General</th>
                  <th className="px-4 py-3 text-right font-semibold">F. Norte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SALARIO_MINIMO_HISTORICO.map((s) => (
                  <tr key={s.anio} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{s.anio}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{formatoMoneda(s.general)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{formatoMoneda(s.fronteraNorte)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Profesionales (extracto)</h3>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Oficio</th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Diario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SALARIOS_MINIMOS_PROFESIONALES.map((p) => (
                  <tr key={p.oficio} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-700">{p.oficio}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                      {formatoMoneda(p.diario)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelRecargos() {
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-base font-bold text-slate-900">{RECARGOS_2026.titulo}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{RECARGOS_2026.vigenciaDesde}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Concepto</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Tasa mensual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {RECARGOS_2026.filas.map((r) => (
              <tr key={r.concepto} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 text-slate-700">{r.concepto}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                  {r.tasaMensual.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HerramientasFiscales() {
  const [tab, setTab] = useState<TabId>("isr");

  return (
    <section id="herramientas" className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
            Herramientas fiscales
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Datos fiscales siempre a la mano
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Tarifas ISR, INPC, UMA, salario mínimo y recargos vigentes. El INPC se sincroniza
            con la API de INEGI; el resto se mantiene actualizado por nuestro despacho.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-2 mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  tab === t.id
                    ? "bg-gradient-to-br from-slate-900 to-indigo-900 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {t.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div>
          {tab === "isr" ? <PanelIsr /> : null}
          {tab === "inpc" ? <PanelInpc /> : null}
          {tab === "uma" ? <PanelUma /> : null}
          {tab === "salario" ? <PanelSalarioMinimo /> : null}
          {tab === "recargos" ? <PanelRecargos /> : null}
        </div>

        <p className="mt-6 text-xs text-slate-500 text-center">
          Información de referencia. Para casos específicos consulte con su contador.
          Fuentes: SAT, INEGI y CONASAMI.
        </p>
      </div>
    </section>
  );
}

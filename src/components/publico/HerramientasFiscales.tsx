"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
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
import BotonCopiar from "./BotonCopiar";

// Lazy-load del panel de Divisas: solo se descarga cuando el usuario
// selecciona la pestaña Divisas, ahorrando ~40 KB en el bundle inicial.
const PanelDivisas = dynamic(() => import("./PanelDivisas"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      Cargando mercados…
    </div>
  ),
});

const tabs = [
  { id: "isr", nombre: "ISR" },
  { id: "inpc", nombre: "INPC" },
  { id: "uma", nombre: "UMA" },
  { id: "salario", nombre: "Salario mínimo" },
  { id: "recargos", nombre: "Recargos" },
  { id: "divisas", nombre: "Divisas" },
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

const CATEGORIAS_ISR: Array<{
  id: CategoriaIsr;
  label: string;
  descripcion: string;
}> = [
  {
    id: "provisionales",
    label: "Mensual PF (acumulada)",
    descripcion: "Pagos provisionales de personas físicas con actividad empresarial",
  },
  {
    id: "rif",
    label: "Bimestral RIF",
    descripcion: "Régimen de Incorporación Fiscal · coeficiente de utilidad",
  },
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
    <div className="-mx-2 px-2 overflow-x-auto py-3 -my-3">
      <div className="flex gap-2 min-w-max">
        {opciones.map((opt) => {
          const activo = opt.id === seleccion;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all active:scale-[0.97] ${
                activo
                  ? "bg-slate-900 text-white shadow-md"
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

export function PanelIsr() {
  const [categoria, setCategoria] = useState<CategoriaIsr>("provisionales");
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
    <div className="space-y-5 pt-3">
      {/* Selector primario: categoría */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2 px-1">
          Tipo de tarifa
        </p>
        <div className="-mx-2 px-2 overflow-x-auto py-3 -my-3">
          <div className="flex gap-2 min-w-max">
            {CATEGORIAS_ISR.map((c) => {
              const activo = c.id === categoria;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoria(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all active:scale-[0.97] ${
                    activo
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-900 hover:text-slate-900"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
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

// Curva suave Catmull-Rom para SVG path d="…".
function curvaSuave(puntos: Array<{ x: number; y: number }>): string {
  if (puntos.length === 0) return "";
  if (puntos.length === 1) return `M ${puntos[0].x} ${puntos[0].y}`;
  let d = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i - 1] ?? puntos[i];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function GraficaInpc({ datos }: { datos: Array<{ anio: number; mes: number; valor: number }> }) {
  const W = 600;
  const H = 200;
  const PAD = { top: 24, right: 12, bottom: 28, left: 36 };

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const yBase = PAD.top + innerH;

  const valores = datos.map((r) => r.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const yPad = rango * 0.1;

  const puntos = datos.map((r, i) => {
    const x = PAD.left + (innerW * i) / Math.max(datos.length - 1, 1);
    const y = yBase - ((r.valor - (min - yPad)) / (rango + yPad * 2)) * innerH;
    return { x, y };
  });

  const linea = curvaSuave(puntos);
  const area = `${linea} L ${puntos[puntos.length - 1]?.x ?? PAD.left} ${yBase} L ${puntos[0]?.x ?? PAD.left} ${yBase} Z`;

  // Etiquetas eje X: solo los primeros de cada año + el último
  const indicesEtiqueta = new Set<number>();
  datos.forEach((r, i) => {
    if (r.mes === 1) indicesEtiqueta.add(i);
  });
  indicesEtiqueta.add(datos.length - 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-48 sm:h-52"
      role="img"
      aria-label="Evolución del INPC"
    >
      <defs>
        <linearGradient id="grad-inpc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.top + innerH * (1 - t);
        return (
          <line key={t} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f1f5f9" strokeWidth={1} />
        );
      })}

      <path d={area} fill="url(#grad-inpc)" />
      <path d={linea} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" />

      {/* Último punto destacado */}
      {puntos.length > 0 ? (
        <g>
          <circle
            cx={puntos[puntos.length - 1].x}
            cy={puntos[puntos.length - 1].y}
            r={5}
            fill="white"
            stroke="#6366f1"
            strokeWidth={2.5}
          />
        </g>
      ) : null}

      {datos.map((r, i) => {
        if (!indicesEtiqueta.has(i)) return null;
        const p = puntos[i];
        return (
          <text
            key={`lbl-${i}`}
            x={p.x}
            y={H - 8}
            textAnchor="middle"
            className="fill-slate-400 text-[9px] font-bold uppercase"
          >
            {r.mes === 1 ? r.anio : `${MESES_CORTOS[r.mes - 1]} ${String(r.anio).slice(2)}`}
          </text>
        );
      })}

      {/* Valor mín/máx en eje Y */}
      <text x={4} y={PAD.top + 6} className="fill-slate-400 text-[9px] font-bold tabular-nums">
        {max.toFixed(1)}
      </text>
      <text x={4} y={yBase + 2} className="fill-slate-400 text-[9px] font-bold tabular-nums">
        {min.toFixed(1)}
      </text>
    </svg>
  );
}

function HistoricoInpcMatriz({
  serie,
}: {
  serie: RegistroInpc[];
}) {
  // Agrupa por año → mes
  const porAnio = useMemo(() => {
    const map = new Map<number, Array<number | null>>();
    for (const r of serie) {
      if (!map.has(r.anio)) map.set(r.anio, Array(12).fill(null));
      const arr = map.get(r.anio)!;
      arr[r.mes - 1] = r.valor;
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [serie]);

  const ultimo = serie[serie.length - 1];

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-base font-bold text-slate-900">Histórico anual del INPC</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Desliza horizontalmente para ver todos los meses
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold sticky left-0 bg-slate-50 z-10">Año</th>
              {MESES_CORTOS.map((m) => (
                <th key={m} className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {porAnio.map(([anio, meses]) => (
              <tr key={anio} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-bold text-slate-900 sticky left-0 bg-white hover:bg-slate-50 z-10">
                  {anio}
                </td>
                {meses.map((v, i) => {
                  const esUltimo = ultimo && ultimo.anio === anio && ultimo.mes === i + 1;
                  return (
                    <td
                      key={i}
                      className={`px-3 py-2 text-right tabular-nums whitespace-nowrap ${
                        v === null
                          ? "text-slate-300"
                          : esUltimo
                          ? "font-black text-indigo-700 bg-indigo-50"
                          : "text-slate-700"
                      }`}
                    >
                      {v === null ? "—" : v.toFixed(3)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type RangoInpc = "2A" | "5A" | "todo";

const PREFERENCIA_RANGO_INPC = "rdc-inpc-rango";

function leerRangoInpc(): RangoInpc {
  if (typeof window === "undefined") return "5A";
  const v = localStorage.getItem(PREFERENCIA_RANGO_INPC);
  if (v === "2A" || v === "5A" || v === "todo") return v;
  return "5A";
}

export function PanelInpc() {
  const [serie, setSerie] = useState<RegistroInpc[]>(INPC_FALLBACK);
  const [fuente, setFuente] = useState<"INEGI" | "fallback">("fallback");
  const [actualizadoEn, setActualizadoEn] = useState("Datos locales");
  const [cargando, setCargando] = useState(true);
  const [rango, setRango] = useState<RangoInpc>("5A");

  useEffect(() => {
    setRango(leerRangoInpc());
  }, []);

  const cambiarRango = (r: RangoInpc) => {
    setRango(r);
    if (typeof window !== "undefined") {
      localStorage.setItem(PREFERENCIA_RANGO_INPC, r);
    }
  };

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
  const ultimo = conVariacion[conVariacion.length - 1];
  const valoresGrafica = useMemo(() => {
    if (rango === "2A") return conVariacion.slice(-24);
    if (rango === "5A") return conVariacion.slice(-60);
    return conVariacion;
  }, [conVariacion, rango]);

  const variacionMensual = useMemo(() => {
    const idx = conVariacion.length - 1;
    const prev = conVariacion[idx - 1];
    if (!prev || !ultimo) return null;
    return ((ultimo.valor - prev.valor) / prev.valor) * 100;
  }, [conVariacion, ultimo]);

  return (
    <div className="space-y-4 pt-3">
      <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              INPC · Índice Nacional de Precios al Consumidor
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Base 100 = 2.ª quincena julio 2018 ·{" "}
              {cargando ? "Cargando…" : actualizadoEn}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
              fuente === "INEGI"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            <span className="relative inline-flex h-1.5 w-1.5">
              {fuente === "INEGI" ? (
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              ) : null}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  fuente === "INEGI" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            {fuente === "INEGI" ? "INEGI en vivo" : "Datos locales"}
          </span>
        </div>

        {ultimo ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Último dato
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-2xl sm:text-3xl font-black text-indigo-600 tabular-nums leading-none">
                  {ultimo.valor.toFixed(3)}
                </p>
                <BotonCopiar valor={ultimo.valor.toFixed(3)} etiqueta="INPC" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{formatearPeriodoInpc(ultimo)}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Var. anual
              </p>
              <p
                className={`mt-1 text-2xl sm:text-3xl font-black tabular-nums leading-none ${
                  (ultimo.variacion ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {ultimo.variacion !== null
                  ? `${ultimo.variacion >= 0 ? "+" : ""}${ultimo.variacion.toFixed(2)}%`
                  : "—"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">vs. mismo mes año previo</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Var. mes
              </p>
              <p
                className={`mt-1 text-2xl sm:text-3xl font-black tabular-nums leading-none ${
                  (variacionMensual ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {variacionMensual !== null
                  ? `${variacionMensual >= 0 ? "+" : ""}${variacionMensual.toFixed(2)}%`
                  : "—"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">vs. mes previo</p>
            </div>
          </div>
        ) : null}

        {valoresGrafica.length > 0 ? (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Evolución del índice
              </p>
              <div className="flex gap-1 p-0.5 rounded-lg bg-slate-100">
                {(
                  [
                    { id: "2A", label: "2 años" },
                    { id: "5A", label: "5 años" },
                    { id: "todo", label: "Todo" },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => cambiarRango(r.id)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                      rango === r.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <GraficaInpc datos={valoresGrafica} />
          </div>
        ) : null}
      </div>

      <HistoricoInpcMatriz serie={serie} />
    </div>
  );
}

export function PanelUma() {
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
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Diaria</p>
              <BotonCopiar valor={UMA_VIGENTE.diaria} etiqueta="UMA diaria" variante="claro" />
            </div>
            <p className="mt-1 text-2xl font-black tabular-nums">{formatoMoneda(UMA_VIGENTE.diaria)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mensual</p>
              <BotonCopiar valor={UMA_VIGENTE.mensual} etiqueta="UMA mensual" />
            </div>
            <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums">{formatoMoneda(UMA_VIGENTE.mensual)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Anual</p>
              <BotonCopiar valor={UMA_VIGENTE.anual} etiqueta="UMA anual" />
            </div>
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

export function PanelSalarioMinimo() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-slate-900">Salario mínimo vigente</h3>
        <p className="text-xs text-slate-500 mt-0.5">Vigencia: {SALARIO_MINIMO_VIGENTE.vigenciaDesde}</p>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">General</p>
              <BotonCopiar valor={SALARIO_MINIMO_VIGENTE.general} etiqueta="salario general" variante="claro" />
            </div>
            <p className="mt-1 text-3xl font-black tabular-nums">{formatoMoneda(SALARIO_MINIMO_VIGENTE.general)}</p>
            <p className="text-xs text-slate-300 mt-0.5">diarios</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Frontera Norte</p>
              <BotonCopiar valor={SALARIO_MINIMO_VIGENTE.fronteraNorte} etiqueta="salario frontera" variante="claro" />
            </div>
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

export function PanelRecargos() {
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
    <section id="herramientas" className="pt-8 sm:pt-12 pb-16 sm:pb-24 bg-slate-50">
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
                    ? "bg-slate-900 text-white shadow"
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
          {tab === "divisas" ? <PanelDivisas /> : null}
        </div>

        <p className="mt-6 text-xs text-slate-500 text-center">
          Información de referencia. Para casos específicos consulte con su contador.
          Fuentes: SAT, INEGI y CONASAMI.
        </p>
      </div>
    </section>
  );
}

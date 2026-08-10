"use client";

import { FLUJO_CUMPLIMIENTO_LABELS } from "@/lib/cumplimiento";

export type PasoBucket =
  | "paso1"
  | "paso2"
  | "paso3"
  | "paso4"
  | "paso5"
  | "paso6"
  | "paso7";

const PASOS: {
  id: PasoBucket;
  num: number;
  label: string;
  tono: string;
  activo: string;
  hecho: string;
  omitido?: boolean;
}[] = [
  {
    id: "paso1",
    num: 1,
    label: FLUJO_CUMPLIMIENTO_LABELS.por_trabajar,
    tono: "border-slate-200 text-slate-400 bg-slate-50",
    activo: "border-slate-500 text-slate-800 bg-white ring-2 ring-slate-200",
    hecho: "border-slate-500 bg-slate-500 text-white",
  },
  {
    id: "paso2",
    num: 2,
    label: FLUJO_CUMPLIMIENTO_LABELS.iniciando_contabilidad,
    tono: "border-sky-200 text-sky-300 bg-sky-50/40",
    activo: "border-sky-500 text-sky-800 bg-sky-50 ring-2 ring-sky-100",
    hecho: "border-sky-500 bg-sky-500 text-white",
  },
  {
    id: "paso3",
    num: 3,
    label: FLUJO_CUMPLIMIENTO_LABELS.preliminar,
    tono: "border-amber-200 text-amber-300 bg-amber-50/40",
    activo: "border-amber-500 text-amber-900 bg-amber-50 ring-2 ring-amber-100",
    hecho: "border-amber-500 bg-amber-500 text-white",
  },
  {
    id: "paso4",
    num: 4,
    label: FLUJO_CUMPLIMIENTO_LABELS.aceptacion,
    tono: "border-teal-200 text-teal-300 bg-teal-50/40",
    activo: "border-teal-500 text-teal-900 bg-teal-50 ring-2 ring-teal-100",
    hecho: "border-teal-500 bg-teal-500 text-white",
  },
  {
    id: "paso5",
    num: 5,
    label: FLUJO_CUMPLIMIENTO_LABELS.declaraciones,
    tono: "border-violet-200 text-violet-300 bg-violet-50/40",
    activo: "border-violet-500 text-violet-900 bg-violet-50 ring-2 ring-violet-100",
    hecho: "border-violet-500 bg-violet-500 text-white",
  },
  {
    id: "paso6",
    num: 6,
    label: FLUJO_CUMPLIMIENTO_LABELS.pago,
    tono: "border-indigo-200 text-indigo-300 bg-indigo-50/40",
    activo: "border-indigo-500 text-indigo-900 bg-indigo-50 ring-2 ring-indigo-100",
    hecho: "border-indigo-500 bg-indigo-500 text-white",
  },
  {
    id: "paso7",
    num: 7,
    label: FLUJO_CUMPLIMIENTO_LABELS.completado,
    tono: "border-emerald-200 text-emerald-300 bg-emerald-50/40",
    activo: "border-emerald-500 text-emerald-900 bg-emerald-50 ring-2 ring-emerald-100",
    hecho: "border-emerald-600 bg-emerald-500 text-white",
  },
];

const ORDEN: PasoBucket[] = [
  "paso1",
  "paso2",
  "paso3",
  "paso4",
  "paso5",
  "paso6",
  "paso7",
];

function numPaso(b: PasoBucket): number {
  return ORDEN.indexOf(b) + 1;
}

type Props = {
  /** Paso real del registro (estado del periodo). */
  pasoActual: PasoBucket;
  /** Paso que el admin está editando (solo UI). */
  pasoSeleccionado: PasoBucket;
  onSeleccionar: (paso: PasoBucket) => void;
  /** En modo sin pago se omiten 3, 4 y 6. */
  sinPago?: boolean;
};

/**
 * Rail vertical de los 7 pasos. Clic solo cambia el foco de edición;
 * no muta el estado del periodo.
 */
export default function AdminCumplimientoPasosRail({
  pasoActual,
  pasoSeleccionado,
  onSeleccionar,
  sinPago = false,
}: Props) {
  const actualN = numPaso(pasoActual);
  const omitidos = sinPago
    ? new Set<PasoBucket>(["paso3", "paso4", "paso6"])
    : new Set<PasoBucket>();

  return (
    <nav
      aria-label="Pasos del periodo"
      className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 [scrollbar-width:none]"
    >
      <p className="hidden lg:block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 px-1">
        Pasos
      </p>
      {PASOS.map((paso) => {
        const omitido = omitidos.has(paso.id);
        const n = paso.num;
        const hecho = !omitido && n < actualN;
        const esActualRegistro = !omitido && paso.id === pasoActual;
        const seleccionado = paso.id === pasoSeleccionado;
        const claseCirculo = omitido
          ? "border-dashed border-slate-200 text-slate-300 bg-slate-50"
          : seleccionado
            ? paso.activo
            : hecho || esActualRegistro
              ? paso.hecho
              : paso.tono;

        return (
          <button
            key={paso.id}
            type="button"
            disabled={omitido}
            title={
              omitido
                ? `${paso.label} · no aplica (sin pago)`
                : `Paso ${n} · ${paso.label}`
            }
            onClick={() => onSeleccionar(paso.id)}
            className={`shrink-0 flex lg:w-full items-center gap-2.5 rounded-xl border px-2 py-2 text-left transition-colors ${
              seleccionado && !omitido
                ? "border-slate-300 bg-white shadow-sm"
                : omitido
                  ? "border-transparent opacity-50 cursor-not-allowed"
                  : "border-transparent hover:bg-slate-50"
            }`}
          >
            <span
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-black tabular-nums shrink-0 ${claseCirculo}`}
            >
              {omitido ? "—" : hecho && !seleccionado ? "✓" : n}
            </span>
            <span className="hidden lg:block min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Paso {n}
              </span>
              <span
                className={`block text-xs font-bold leading-snug truncate ${
                  seleccionado ? "text-slate-900" : "text-slate-600"
                }`}
              >
                {paso.label}
              </span>
              {esActualRegistro && (
                <span className="block text-[9px] font-bold text-indigo-600 mt-0.5">
                  Estado actual
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function tituloPaso(paso: PasoBucket): string {
  const found = PASOS.find((p) => p.id === paso);
  return found ? `Paso ${found.num} · ${found.label}` : paso;
}

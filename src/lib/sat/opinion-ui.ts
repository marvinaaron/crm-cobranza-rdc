import type { OpinionPublicaEstado } from "@/lib/sat/types";

export type OpinionUi = {
  etiqueta: string;
  detalle: string;
  tono: "ok" | "bad" | "warn" | "neutral";
  dot: string;
};

const MAP: Record<OpinionPublicaEstado, OpinionUi> = {
  positiva: {
    etiqueta: "Positiva",
    detalle: "Cumplimiento favorable ante el SAT.",
    tono: "ok",
    dot: "bg-emerald-500",
  },
  sin_obligaciones: {
    etiqueta: "Sin obligaciones",
    detalle: "Sin obligaciones fiscales reportadas.",
    tono: "ok",
    dot: "bg-emerald-500",
  },
  negativa: {
    etiqueta: "Negativa",
    detalle: "Requiere atención con su contador.",
    tono: "bad",
    dot: "bg-red-500",
  },
  no_autorizada: {
    etiqueta: "No autorizada",
    detalle: "Active la opinión pública en el SAT para verificar en línea.",
    tono: "warn",
    dot: "bg-amber-500",
  },
  pendiente: {
    etiqueta: "Sin consultar",
    detalle: "Aún no se ha verificado con el SAT.",
    tono: "neutral",
    dot: "bg-slate-300",
  },
  error: {
    etiqueta: "No disponible",
    detalle: "No se pudo obtener el estatus en este momento.",
    tono: "neutral",
    dot: "bg-slate-400",
  },
};

export function opinionUi(estado: OpinionPublicaEstado | undefined): OpinionUi {
  if (!estado) return MAP.pendiente;
  return MAP[estado] ?? MAP.error;
}

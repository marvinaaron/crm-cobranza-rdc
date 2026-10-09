import { HORARIO_ATENCION } from "@/lib/contacto-publico";
import type { EstatusLead } from "@/lib/lead-estatus";

export type SemaforoLead = "ok" | "atencion" | "urgente";

const TZ = HORARIO_ATENCION.zonaHoraria;
const HORAS_NUEVO_URGENTE = 4;
const DIAS_CONTACTADO_ATENCION = 2;
const DIAS_CONTACTADO_URGENTE = 3;

function partesMexico(d: Date): {
  y: number;
  m: number;
  day: number;
  h: number;
  min: number;
  dow: number;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const dowMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    y: Number(get("year")),
    m: Number(get("month")),
    day: Number(get("day")),
    h: Number(get("hour")),
    min: Number(get("minute")),
    dow: dowMap[get("weekday")] ?? 0,
  };
}

function esMinutoHabil(d: Date): boolean {
  const p = partesMexico(d);
  const dia = HORARIO_ATENCION.dias.find((x) => x.dia === p.dow);
  if (!dia) return false;
  const minutos = p.h * 60 + p.min;
  return minutos >= dia.abre * 60 && minutos < dia.cierra * 60;
}

/** Horas hábiles lun–vie 9–17 (Mexico City) entre dos instantes. */
export function horasHabilesEntre(desdeIso: string, hasta = new Date()): number {
  const desde = new Date(desdeIso);
  if (Number.isNaN(desde.getTime()) || hasta <= desde) return 0;
  const stepMs = 15 * 60 * 1000;
  let n = 0;
  const maxSteps = 16_000;
  let t = desde.getTime();
  let steps = 0;
  while (t < hasta.getTime() && steps < maxSteps) {
    if (esMinutoHabil(new Date(t))) n += 1;
    t += stepMs;
    steps += 1;
  }
  return (n * 15) / 60;
}

export function semaforoLead(lead: {
  estatus: EstatusLead;
  created_at: string;
  estatus_en: string;
  siguiente_paso_en?: string | null;
}): SemaforoLead {
  if (lead.estatus === "aceptado" || lead.estatus === "rechazado") return "ok";

  const ahora = new Date();

  if (lead.estatus === "nuevo") {
    return horasHabilesEntre(lead.created_at, ahora) >= HORAS_NUEVO_URGENTE
      ? "urgente"
      : "ok";
  }

  if (lead.siguiente_paso_en) {
    const cuando = new Date(lead.siguiente_paso_en);
    if (!Number.isNaN(cuando.getTime()) && cuando.getTime() <= ahora.getTime()) {
      return "urgente";
    }
    const ms = cuando.getTime() - ahora.getTime();
    if (ms > 0 && ms <= 4 * 60 * 60 * 1000) return "atencion";
    return "ok";
  }

  const ancla = new Date(lead.estatus_en || lead.created_at);
  const dias = (ahora.getTime() - ancla.getTime()) / (24 * 60 * 60 * 1000);
  if (dias >= DIAS_CONTACTADO_URGENTE) return "urgente";
  if (dias >= DIAS_CONTACTADO_ATENCION) return "atencion";
  return "ok";
}

export const SEMAFORO_LEAD_LABEL: Record<SemaforoLead, string> = {
  ok: "Al día",
  atencion: "Seguimiento",
  urgente: "Urgente",
};

export function etiquetaSemaforoLead(lead: {
  estatus: EstatusLead;
  created_at: string;
  estatus_en: string;
  siguiente_paso_en?: string | null;
}): string {
  const s = semaforoLead(lead);
  if (lead.estatus === "nuevo" && s === "urgente") {
    return "Lleva más de 4 h hábiles sin contactar";
  }
  if (lead.siguiente_paso_en && s === "urgente") {
    return "El siguiente paso ya venció";
  }
  if (lead.siguiente_paso_en && s === "atencion") {
    return "Siguiente paso en menos de 4 h";
  }
  if (s === "urgente") return "Contactado hace 3+ días, sin siguiente paso";
  if (s === "atencion") return "Contactado hace 2+ días, sin siguiente paso";
  return SEMAFORO_LEAD_LABEL[s];
}

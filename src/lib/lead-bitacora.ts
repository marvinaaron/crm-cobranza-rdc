export type EventoLeadTipo =
  | "whatsapp"
  | "cotizacion"
  | "llamada"
  | "estatus"
  | "alta"
  | "paso";

export type EventoLead = {
  id: string;
  tipo: EventoLeadTipo;
  en: string;
  detalle?: string;
};

export const EVENTO_LEAD_LABEL: Record<EventoLeadTipo, string> = {
  whatsapp: "WhatsApp",
  cotizacion: "Cotización enviada",
  llamada: "Llamada / reunión",
  estatus: "Estatus",
  alta: "Alta en cartera",
  paso: "Siguiente paso",
};

export const MAX_EVENTOS_LEAD = 40;

export function nuevoEventoLead(
  tipo: EventoLeadTipo,
  detalle?: string
): EventoLead {
  return {
    id: `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    tipo,
    en: new Date().toISOString(),
    detalle: detalle?.trim() || undefined,
  };
}

export function esEventoLead(v: unknown): v is EventoLead {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.en === "string" &&
    typeof o.tipo === "string" &&
    o.tipo in EVENTO_LEAD_LABEL
  );
}

export function normalizarBitacora(raw: unknown): EventoLead[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(esEventoLead).slice(0, MAX_EVENTOS_LEAD);
}

export function appendEventoLead(
  actual: EventoLead[] | unknown,
  evento: EventoLead
): EventoLead[] {
  return [evento, ...normalizarBitacora(actual)].slice(0, MAX_EVENTOS_LEAD);
}

/**
 * Urgencia derivada del checklist de autocalificación en /empezar y Nosotros.
 * Marcar ítems es opcional: 0 checks = tono neutro ("Solicitar cotización").
 */

export type TonoUrgencia = "neutro" | "calido" | "urgente";

export const ITEMS_AUTOCALIFICACION = [
  "Nunca te enteras de qué se declara ante el SAT",
  "Tu contador te manda todo por WhatsApp y la información importante se pierde entre mensajes",
  "No sabes con certeza si estás al corriente o si tienes algún adeudo con el SAT",
  "Tu contador tarda días — o semanas — en contestarte",
  "Quieres pagar tus honorarios con tarjeta de crédito y no puedes porque tienes que transferir forzosamente",
  "Ni tú ni tu contador recuerdan si quedó algún honorario pendiente del mes",
  "Te gustaría ver tu situación fiscal cuando quieras, desde el celular",
  "Buscar tus impuestos anteriores o saldos a favor te toma horas entre WhatsApp y correo",
] as const;

export function tonoDesdeChecks(total: number): TonoUrgencia {
  if (total >= 6) return "urgente";
  if (total >= 2) return "calido";
  return "neutro";
}

export function copyCtaUrgencia(tono: TonoUrgencia): string {
  if (tono === "urgente") return "Urgente — Hablemos hoy mismo";
  if (tono === "calido") return "Definitivamente debemos hablar";
  return "Solicitar cotización";
}

export function claseCtaUrgencia(tono: TonoUrgencia): string {
  if (tono === "urgente") {
    return "bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 shadow-lg shadow-rose-200/80 ring-1 ring-white/20 hover:opacity-95";
  }
  if (tono === "calido") {
    return "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-violet-200/80 ring-1 ring-white/20 hover:opacity-95";
  }
  return "bg-slate-900 hover:bg-slate-800 shadow-lg";
}

export function helperUrgencia(total: number): string {
  if (total === 0) return "Marca los que te suenen familiares — es opcional.";
  if (total === 1) return "Si marcaste 2 o más, hablemos. Cotización gratis en 24 hrs.";
  if (total >= 6) {
    return "Marcaste muchos — la buena noticia es que esto se arregla en una llamada.";
  }
  return "Suficientes señales para platicar. Cotización gratis en 24 hrs.";
}

export function fuenteLeadDesdeTono(tono: TonoUrgencia): string {
  if (tono === "urgente") return "empezar-urgente";
  if (tono === "calido") return "empezar-calido";
  return "empezar";
}

export function enriquecerMensajeConChecklist(
  mensaje: string,
  itemsMarcados: string[]
): string {
  if (itemsMarcados.length === 0) return mensaje;
  const lista = itemsMarcados.map((t) => `• ${t}`).join("\n");
  return `${mensaje.trim()}\n\n— Autocalificación (${itemsMarcados.length}):\n${lista}`;
}

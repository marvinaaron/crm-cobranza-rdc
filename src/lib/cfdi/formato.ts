import type { LineaConsultaCfdi } from "./consulta";

/** Ej. 27/05/26 */
export function fmtFechaCfdiCorta(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

/** PUE · PPD · PAGO (complemento). */
export function metodoPagoCorto(l: LineaConsultaCfdi): string {
  if (l.tipoComprobante === "P") return "PAGO";
  const raw = l.metodoPago.trim();
  const norm = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (raw.toUpperCase() === "PUE" || norm.includes("una sola exhib")) return "PUE";
  if (
    raw.toUpperCase() === "PPD" ||
    norm.includes("parcialidad") ||
    norm.includes("diferido")
  ) {
    return "PPD";
  }
  return raw.length <= 4 ? raw.toUpperCase() : raw;
}

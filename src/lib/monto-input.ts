/** Tope de dígitos del importe (pago admin y calculadoras). */
export const MAX_DIGITOS_IMPORTE = 6;

/** Solo dígitos, máximo 6, coma de miles. */
export function caparImporteMx(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, MAX_DIGITOS_IMPORTE);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Formatea un campo de monto: solo dígitos y coma de miles (es-MX). */
export function formatCurrencyInput(value: string, decimales = 0): string {
  if (decimales <= 0) {
    const numericValue = value.replace(/\D/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  const cleaned = value.replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");
  const intRaw = (dot === -1 ? cleaned : cleaned.slice(0, dot)).replace(/\D/g, "");
  const decRaw =
    dot === -1 ? "" : cleaned.slice(dot + 1).replace(/\D/g, "").slice(0, decimales);
  const intFmt = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (dot !== -1) return `${intFmt}.${decRaw}`;
  return intFmt;
}

export function parseMontoInput(value: string): number {
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

/** Para rellenar un input a partir de un número ya guardado. */
export function formatMontoDesdeNumero(n: number, decimales = 0): string {
  if (!Number.isFinite(n) || n === 0) return "";
  const abs = Math.abs(n);
  if (decimales <= 0) {
    return formatCurrencyInput(String(Math.round(abs)), 0);
  }
  const [entero = "0", frac = ""] = abs.toFixed(decimales).split(".");
  return formatCurrencyInput(`${entero}.${frac}`, decimales);
}

/** Solo dígitos del número (sin espacios, guiones ni +). */
export function digitosTelefono(valor: string | undefined | null): string {
  if (!valor) return "";
  return String(valor).replace(/\D/g, "");
}

/**
 * Normaliza teléfono/WhatsApp para guardar en CRM.
 * Conserva espacios legibles si el usuario los puso; si no, agrupa de 10 en 10.
 */
export function normalizarTelefonoDisplay(
  valor: string | undefined | null
): string {
  const raw = String(valor ?? "").trim();
  if (!raw) return "";
  const digits = digitosTelefono(raw);
  if (!digits) return "";

  // Si ya trae formato legible (espacios), conservarlo limpio.
  if (/\s/.test(raw) && digitosTelefono(raw) === digits) {
    return raw.replace(/\s+/g, " ").trim();
  }

  // México: 10 dígitos locales → "XX XXXX XXXX"
  if (digits.length === 10) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }

  // Con lada 52 + 10
  if (digits.length === 12 && digits.startsWith("52")) {
    const local = digits.slice(2);
    return `+52 ${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}`;
  }

  return raw.replace(/\s+/g, " ").trim();
}

/** true si hay al menos 10 dígitos (MX local o con lada). */
export function esTelefonoValido(valor: string | undefined | null): boolean {
  const d = digitosTelefono(valor);
  return d.length >= 10;
}

/** wa.me con lada 52 si son 10 dígitos locales. */
export function waLinkTelefono(
  telefono: string | undefined | null,
  mensaje?: string
): string | null {
  const digits = digitosTelefono(telefono);
  if (digits.length < 10) return null;
  const conLada =
    digits.length === 10
      ? `52${digits}`
      : digits.startsWith("52")
        ? digits
        : digits;
  const base = `https://wa.me/${conLada}`;
  if (!mensaje?.trim()) return base;
  return `${base}?text=${encodeURIComponent(mensaje.trim())}`;
}

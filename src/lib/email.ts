export const DOMINIOS_CORREO_SUGERIDOS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "live.com.mx",
  "icloud.com",
] as const;

export function parseEmailParts(value: string): {
  local: string;
  domain: string;
  hasAt: boolean;
} {
  const trimmed = value.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at === -1) {
    return { local: trimmed, domain: "", hasAt: false };
  }
  return {
    local: trimmed.slice(0, at),
    domain: trimmed.slice(at + 1),
    hasAt: true,
  };
}

export function isValidEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  if (!email) return false;
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

export function sugerirDominios(parcial: string): string[] {
  const q = parcial.trim().toLowerCase();
  if (!q) return [...DOMINIOS_CORREO_SUGERIDOS];
  return DOMINIOS_CORREO_SUGERIDOS.filter((d) => d.startsWith(q) || d.includes(q));
}

export function completarEmail(local: string, dominio: string): string {
  const l = local.trim().toLowerCase().replace(/@/g, "");
  const d = dominio.trim().toLowerCase().replace(/^@+/, "");
  return `${l}@${d}`;
}

export function normalizarEmail(value: string): string {
  return value.trim().toLowerCase();
}

import crypto from "crypto";

const PREFIJO = "contabilidad-despacho:";

function secretoCalendario(): string {
  return (
    process.env.CALENDAR_FEED_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "rdc-contabilidad-despacho-dev"
  );
}

export function generarTokenCalendarioContabilidad(userId: string): string {
  const payload = Buffer.from(userId, "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", secretoCalendario())
    .update(`${PREFIJO}${userId}`)
    .digest("base64url")
    .slice(0, 22);
  return `${payload}.${sig}`;
}

export function validarTokenCalendarioContabilidad(token: string): string | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  let userId: string;
  try {
    userId = Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!userId) return null;
  const esperado = crypto
    .createHmac("sha256", secretoCalendario())
    .update(`${PREFIJO}${userId}`)
    .digest("base64url")
    .slice(0, 22);
  if (sig !== esperado) return null;
  return userId;
}

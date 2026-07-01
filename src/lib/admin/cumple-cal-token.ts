import crypto from "crypto";

const PREFIJO = "cumple-despacho:";

function secretoCalendario(): string {
  return (
    process.env.CALENDAR_FEED_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "rdc-cumple-despacho-dev"
  );
}

/** Token opaco por usuario admin (para suscripción webcal sin cookies). */
export function generarTokenCalendarioCumple(userId: string): string {
  const payload = Buffer.from(userId, "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", secretoCalendario())
    .update(`${PREFIJO}${userId}`)
    .digest("base64url")
    .slice(0, 22);
  return `${payload}.${sig}`;
}

/** Devuelve el userId si el token es válido; si no, null. */
export function validarTokenCalendarioCumple(token: string): string | null {
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

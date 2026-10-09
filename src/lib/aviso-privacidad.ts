/**
 * Aviso de privacidad ligado al expediente del cliente (CRM).
 * La liga privada `/aviso/[token]` permite aceptar con evidencia (fecha/versión).
 */

export const AVISO_PRIVACIDAD_VERSION = "2026-07";

export type AvisoPrivacidadCliente = {
  /** Token opaco para `/aviso/[token]`. */
  token: string;
  /** ISO cuando se envió el correo formal. */
  enviadoEn?: string;
  /** ISO cuando el titular aceptó en la liga. */
  aceptadoEn?: string;
  /** Versión del aviso que aceptó. */
  version?: string;
};

export function nuevoTokenAvisoPrivacidad(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function avisoPrivacidadAceptado(
  aviso: AvisoPrivacidadCliente | undefined | null
): boolean {
  return Boolean(aviso?.aceptadoEn);
}

export function etiquetaEstadoAvisoPrivacidad(
  aviso: AvisoPrivacidadCliente | undefined | null
): { label: string; tono: "ok" | "pendiente" | "sin_envio" } {
  if (aviso?.aceptadoEn) return { label: "Aceptado", tono: "ok" };
  if (aviso?.enviadoEn) return { label: "Enviado · pendiente", tono: "pendiente" };
  return { label: "Sin enviar", tono: "sin_envio" };
}

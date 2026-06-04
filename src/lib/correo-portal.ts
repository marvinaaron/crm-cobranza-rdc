import { type Cliente } from "@/lib/clientes";
import { isValidEmail } from "@/lib/email";
import { getPortalLoginUrl } from "@/lib/portal-auth";
import {
  DESPACHO_NOMBRE,
  DESPACHO_EMAIL,
  abrirBorradorCorreo,
} from "@/lib/workspace-email";

export function buildCorreoClaveTemporal(
  cliente: Cliente,
  usuario: string,
  claveTemporal: string,
  baseUrl?: string
): { subject: string; texto: string } {
  const loginUrl = getPortalLoginUrl(baseUrl);
  const subject = `${DESPACHO_NOMBRE} · Contraseña temporal del portal`;

  const texto = [
    `Hola, ${cliente.razonSocial},`,
    "",
    "Tienes una contraseña temporal para acceder a tu portal de cliente.",
    "",
    `Usuario: ${usuario}`,
    `Contraseña temporal: ${claveTemporal}`,
    "",
    `Entra aquí: ${loginUrl}`,
    "",
    "Al iniciar sesión te pediremos crear una contraseña nueva y personal. Por seguridad, no compartas esta clave.",
    "",
    "Si tú no solicitaste este cambio, contacta al despacho de inmediato.",
    "",
    DESPACHO_NOMBRE,
    DESPACHO_EMAIL,
  ].join("\n");

  return { subject, texto };
}

/** Abre borrador en Gmail hacia el correo del cliente con la clave temporal. */
export function enviarCorreoClaveTemporal(
  cliente: Cliente,
  usuario: string,
  claveTemporal: string,
  baseUrl?: string
): boolean {
  if (!cliente.email?.trim() || !isValidEmail(cliente.email)) return false;
  const { subject, texto } = buildCorreoClaveTemporal(
    cliente,
    usuario,
    claveTemporal,
    baseUrl
  );
  abrirBorradorCorreo({
    to: cliente.email.trim(),
    subject,
    body: texto,
  });
  return true;
}

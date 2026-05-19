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
    `Estimado(a) ${cliente.razonSocial},`,
    "",
    "Recibió una contraseña temporal para acceder a su portal de cliente.",
    "",
    `Usuario: ${usuario}`,
    `Contraseña temporal: ${claveTemporal}`,
    "",
    `Ingrese aquí: ${loginUrl}`,
    "",
    "Al iniciar sesión se le pedirá crear una contraseña nueva y personal. Por seguridad, no comparta esta clave.",
    "",
    "Si usted no solicitó este cambio, contacte al despacho de inmediato.",
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

import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { getPortalClienteUrl } from "@/lib/correo";
import {
  type RegistroCumplimiento,
  formatFechaLimiteImpuesto,
  formatMontoImpuesto,
} from "@/lib/cumplimiento";
import { isValidEmail } from "@/lib/email";
import {
  DESPACHO_NOMBRE,
  DESPACHO_EMAIL,
  DESPACHO_SITIO,
  abrirBorradorCorreo,
} from "@/lib/workspace-email";

export type CorreoCumplimiento = {
  subject: string;
  texto: string;
  html: string;
  portalUrl: string;
};

export function getPortalCumplimientoUrl(clienteId: number, baseUrl?: string): string {
  return getPortalClienteUrl(clienteId, baseUrl);
}

export function buildCorreoCumplimientoListo(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): CorreoCumplimiento {
  const portalUrl = getPortalCumplimientoUrl(client.id, baseUrl);
  const periodoTxt = periodoLabel(periodo);
  const montoFmt = formatMontoImpuesto(registro.montoImpuesto);
  const limiteFmt = formatFechaLimiteImpuesto(registro.fechaLimite);
  const razon = client.razonSocial;

  const subject = `${DESPACHO_NOMBRE} · Impuestos listos · ${periodoTxt}`;

  const texto = [
    `Estimado(a) ${razon},`,
    "",
    `Le informamos que su documentación fiscal ante el SAT correspondiente a ${periodoTxt} ya está disponible en su portal de cliente.`,
    "",
    "En el portal podrá consultar y descargar su documentación (declaración, impuestos, IMSS, nómina, etc.).",
    "",
    `Monto a pagar: ${montoFmt}`,
    `Fecha límite de pago: ${limiteFmt}`,
    "",
    `Ingrese a su portal: ${portalUrl}`,
    "",
    "Si tiene dudas sobre el monto o la fecha, contáctenos con gusto.",
    "",
    DESPACHO_NOMBRE,
    DESPACHO_EMAIL,
    DESPACHO_SITIO,
  ].join("\n");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
<tr><td style="padding:28px 28px 20px;background:linear-gradient(135deg,#4f46e5,#6366f1);">
<p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.75);font-weight:700;">${DESPACHO_NOMBRE}</p>
<h1 style="margin:8px 0 0;font-size:20px;color:#ffffff;font-weight:800;">Documentación fiscal lista</h1>
</td></tr>
<tr><td style="padding:28px;">
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Estimado(a) <strong>${razon}</strong>,</p>
<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#64748b;">Su documentación de <strong>${periodoTxt}</strong> ya está publicada en el portal (declaración, impuestos, IMSS, nómina y demás archivos informativos).</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;">
<tr><td style="padding:20px;">
<p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#64748b;font-weight:800;">Monto a pagar</p>
<p style="margin:0;font-size:26px;font-weight:800;color:#0f172a;">${montoFmt}</p>
<p style="margin:16px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#64748b;font-weight:800;">Fecha límite</p>
<p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#b45309;">${limiteFmt}</p>
</td></tr>
</table>
<p style="margin:0 0 20px;text-align:center;">
<a href="${portalUrl}" style="display:inline-block;padding:14px 28px;background:#4f46e5;color:#ffffff;font-size:12px;font-weight:800;text-decoration:none;border-radius:12px;text-transform:uppercase;letter-spacing:0.08em;">Ver en mi portal</a>
</p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#94a3b8;">Enlace directo: <a href="${portalUrl}" style="color:#6366f1;">${portalUrl}</a></p>
</td></tr>
<tr><td style="padding:16px 28px 24px;border-top:1px solid #f1f5f9;">
<p style="margin:0;font-size:12px;color:#94a3b8;"><a href="mailto:${DESPACHO_EMAIL}" style="color:#6366f1;">${DESPACHO_EMAIL}</a> · <a href="${DESPACHO_SITIO}" style="color:#6366f1;">${DESPACHO_SITIO.replace(/^https?:\/\//, "")}</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { subject, texto, html, portalUrl };
}

export function abrirCorreoCumplimientoListo(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): boolean {
  if (!client.email?.trim() || !isValidEmail(client.email)) return false;
  const { subject, texto } = buildCorreoCumplimientoListo(
    client,
    periodo,
    registro,
    baseUrl
  );
  abrirBorradorCorreo({
    to: client.email.trim(),
    subject,
    body: texto,
  });
  return true;
}

export async function copiarCorreoCumplimientoHtml(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): Promise<void> {
  const { texto, html } = buildCorreoCumplimientoListo(client, periodo, registro, baseUrl);
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([texto], { type: "text/plain" }),
      }),
    ]);
  } catch {
    await navigator.clipboard.writeText(texto);
  }
}

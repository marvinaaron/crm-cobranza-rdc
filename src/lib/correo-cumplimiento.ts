import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { getPortalClienteUrl } from "@/lib/correo";
import {
  type RegistroCumplimiento,
  type CategoriaId,
  CATEGORIA_META,
  formatFechaLimiteImpuesto,
  formatFechaLimiteImpuestoCorta,
  formatMontoImpuesto,
  getSubtotalCategoria,
  getFechaLimiteCategoria,
  categoriaConPagoEnRegistro,
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

export type OpcionesCorreoCumplimientoListo = {
  /** Notificación de un solo concepto. */
  categoria?: CategoriaId;
  /** Desglose por concepto (gran total). */
  categorias?: CategoriaId[];
};

type LineaConceptoCorreo = {
  label: string;
  montoFmt: string;
  limiteFmt: string;
};

function lineasConceptoCorreo(
  registro: RegistroCumplimiento,
  categorias: CategoriaId[]
): LineaConceptoCorreo[] {
  return categorias
    .filter((cat) => categoriaConPagoEnRegistro(registro, cat))
    .map((cat) => {
      const fl = getFechaLimiteCategoria(registro, cat);
      return {
        label: CATEGORIA_META[cat].label,
        montoFmt: formatMontoImpuesto(getSubtotalCategoria(registro, cat)),
        limiteFmt: fl ? formatFechaLimiteImpuestoCorta(fl) : "—",
      };
    });
}

function totalLineasConcepto(
  categorias: CategoriaId[],
  registro: RegistroCumplimiento
): string {
  const sum = categorias.reduce((s, cat) => s + getSubtotalCategoria(registro, cat), 0);
  return formatMontoImpuesto(sum);
}

export function buildCorreoCumplimientoListo(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string,
  opts?: OpcionesCorreoCumplimientoListo
): CorreoCumplimiento {
  const portalUrl = getPortalCumplimientoUrl(client.id, baseUrl);
  const periodoTxt = periodoLabel(periodo);
  const razon = client.razonSocial;

  const catsTodas = (["federales", "imss", "estatales"] as CategoriaId[]).filter((c) =>
    categoriaConPagoEnRegistro(registro, c)
  );
  const categorias =
    opts?.categoria != null
      ? [opts.categoria]
      : opts?.categorias?.length
        ? opts.categorias.filter((c) => categoriaConPagoEnRegistro(registro, c))
        : catsTodas;

  const lineas = lineasConceptoCorreo(registro, categorias);
  const esUnConcepto = lineas.length === 1;
  const esDesglose = lineas.length > 1;
  const montoFmt = totalLineasConcepto(categorias, registro);
  const tituloConcepto = esUnConcepto ? lineas[0]!.label : "Impuestos";

  const subject = esUnConcepto
    ? `${DESPACHO_NOMBRE} · ${tituloConcepto} listos · ${periodoTxt}`
    : `${DESPACHO_NOMBRE} · Impuestos listos · ${periodoTxt}`;

  const bloqueTextoConceptos = lineas
    .map(
      (l) =>
        `· ${l.label}: ${l.montoFmt}${l.limiteFmt !== "—" ? ` (vence ${l.limiteFmt})` : ""}`
    )
    .join("\n");

  const texto = [
    `Estimado(a) ${razon},`,
    "",
    esUnConcepto
      ? `Le informamos que la documentación de ${tituloConcepto} correspondiente a ${periodoTxt} ya está disponible en su portal de cliente.`
      : `Le informamos que su documentación fiscal de ${periodoTxt} ya está disponible en su portal de cliente.`,
    "",
    "En el portal podrá consultar y descargar sus archivos.",
    "",
    esDesglose ? "Desglose por concepto:" : "Importe:",
    bloqueTextoConceptos,
    ...(esDesglose ? ["", `Total a pagar: ${montoFmt}`] : []),
    "",
    `Ingrese a su portal: ${portalUrl}`,
    "",
    DESPACHO_NOMBRE,
    DESPACHO_EMAIL,
    DESPACHO_SITIO,
  ].join("\n");

  const filasHtmlConceptos = lineas
    .map(
      (l) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;"><p style="margin:0;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:800;">${l.label}</p><p style="margin:4px 0 0;font-size:18px;font-weight:800;color:#0f172a;">${l.montoFmt}</p>${l.limiteFmt !== "—" ? `<p style="margin:4px 0 0;font-size:12px;color:#b45309;font-weight:700;">Vence ${l.limiteFmt}</p>` : ""}</td></tr>`
    )
    .join("");

  const bloqueTotalHtml = esDesglose
    ? `<p style="margin:16px 0 0;font-size:10px;text-transform:uppercase;color:#64748b;font-weight:800;">Total a pagar</p><p style="margin:4px 0 0;font-size:26px;font-weight:800;color:#0f172a;">${montoFmt}</p>`
    : "";

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
<tr><td style="padding:28px 28px 20px;background:linear-gradient(135deg,#4f46e5,#6366f1);">
<p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.75);font-weight:700;">${DESPACHO_NOMBRE}</p>
<h1 style="margin:8px 0 0;font-size:20px;color:#ffffff;font-weight:800;">${esUnConcepto ? `${tituloConcepto} listos` : "Documentación fiscal lista"}</h1>
</td></tr>
<tr><td style="padding:28px;">
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Estimado(a) <strong>${razon}</strong>,</p>
<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#64748b;">Su documentación de <strong>${periodoTxt}</strong> ya está publicada en el portal.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;">
<tr><td style="padding:20px;">
${filasHtmlConceptos}
${bloqueTotalHtml}
</td></tr>
</table>
<p style="margin:0 0 20px;text-align:center;">
<a href="${portalUrl}" style="display:inline-block;padding:14px 28px;background:#4f46e5;color:#ffffff;font-size:12px;font-weight:800;text-decoration:none;border-radius:12px;text-transform:uppercase;letter-spacing:0.08em;">Ver en mi portal</a>
</p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#94a3b8;">Enlace: <a href="${portalUrl}" style="color:#6366f1;">${portalUrl}</a></p>
</td></tr>
<tr><td style="padding:16px 28px 24px;border-top:1px solid #f1f5f9;">
<p style="margin:0;font-size:12px;color:#94a3b8;"><a href="mailto:${DESPACHO_EMAIL}" style="color:#6366f1;">${DESPACHO_EMAIL}</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { subject, texto, html, portalUrl };
}

export function buildCorreoImpuestosCalculados(
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

  const subject = `${DESPACHO_NOMBRE} · Sus impuestos ya están calculados · ${periodoTxt}`;

  const texto = [
    `Estimado(a) ${razon},`,
    "",
    `Hemos calculado el importe de sus impuestos correspondientes a ${periodoTxt}.`,
    "",
    `Monto estimado a pagar: ${montoFmt}`,
    `Fecha límite de pago: ${limiteFmt}`,
    "",
    "Ingrese a su portal, revise el importe y confirme que es correcto. Hasta que usted valide el previo, no publicaremos sus PDFs de declaración.",
    "",
    `Portal: ${portalUrl}`,
    "",
    DESPACHO_NOMBRE,
    DESPACHO_EMAIL,
    DESPACHO_SITIO,
  ].join("\n");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif;">
<table role="presentation" width="100%"><tr><td style="padding:32px 16px;">
<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;border:1px solid #e2e8f0;">
<tr><td style="padding:28px;background:linear-gradient(135deg,#d97706,#f59e0b);">
<p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.85);font-weight:700;">${DESPACHO_NOMBRE}</p>
<h1 style="margin:8px 0 0;font-size:20px;color:#fff;font-weight:800;">Sus impuestos ya están calculados</h1>
</td></tr>
<tr><td style="padding:28px;">
<p style="margin:0 0 16px;font-size:15px;color:#334155;">Estimado(a) <strong>${razon}</strong>,</p>
<p style="margin:0 0 20px;font-size:14px;color:#64748b;">Revise el previo de <strong>${periodoTxt}</strong> en su portal y confirme que el importe es correcto.</p>
<table width="100%" style="margin:0 0 24px;background:#fffbeb;border-radius:16px;border:1px solid #fde68a;">
<tr><td style="padding:20px;">
<p style="margin:0;font-size:10px;text-transform:uppercase;color:#92400e;font-weight:800;">Monto estimado</p>
<p style="margin:4px 0 0;font-size:26px;font-weight:800;color:#0f172a;">${montoFmt}</p>
<p style="margin:16px 0 0;font-size:10px;text-transform:uppercase;color:#92400e;font-weight:800;">Fecha límite</p>
<p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#b45309;">${limiteFmt}</p>
</td></tr></table>
<p style="text-align:center;margin:0 0 20px;">
<a href="${portalUrl}" style="display:inline-block;padding:14px 28px;background:#d97706;color:#fff;font-size:12px;font-weight:800;text-decoration:none;border-radius:12px;text-transform:uppercase;">Validar en mi portal</a>
</p>
</td></tr></table>
</td></tr></table></body></html>`;

  return { subject, texto, html, portalUrl };
}

export function buildCorreoRecordatorioLimite(
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

  const subject = `${DESPACHO_NOMBRE} · Recordatorio fecha límite impuestos · ${periodoTxt}`;

  const texto = [
    `Estimado(a) ${razon},`,
    "",
    `Le recordamos que la fecha límite para el pago de sus impuestos de ${periodoTxt} se acerca.`,
    "",
    `Monto: ${montoFmt}`,
    `Fecha límite: ${limiteFmt}`,
    "",
    documentosFiscalesCompletos(registro)
      ? "Ya puede subir su comprobante de pago en el portal una vez realizado el pago."
      : "Consulte su portal para ver el estatus de su documentación.",
    "",
    `Portal: ${portalUrl}`,
    "",
    DESPACHO_NOMBRE,
  ].join("\n");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif;">
<table width="100%"><tr><td style="padding:32px 16px;">
<table width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;border:1px solid #e2e8f0;">
<tr><td style="padding:28px;background:#dc2626;">
<h1 style="margin:0;font-size:18px;color:#fff;font-weight:800;">Recordatorio: fecha límite próxima</h1>
</td></tr>
<tr><td style="padding:28px;">
<p style="margin:0 0 12px;font-size:14px;color:#334155;">Estimado(a) <strong>${razon}</strong>,</p>
<p style="margin:0 0 20px;font-size:14px;color:#64748b;">Impuestos de <strong>${periodoTxt}</strong> · límite <strong>${limiteFmt}</strong> · <strong>${montoFmt}</strong></p>
<p style="text-align:center;"><a href="${portalUrl}" style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;font-weight:800;text-decoration:none;border-radius:12px;">Ir al portal</a></p>
</td></tr></table>
</td></tr></table></body></html>`;

  return { subject, texto, html, portalUrl };
}

function documentosFiscalesCompletos(reg: RegistroCumplimiento): boolean {
  const imssOk = !reg.aplicaImss || !!reg.imss;
  return !!reg.declaracion && !!reg.impuestos && imssOk;
}

export function abrirCorreoImpuestosCalculados(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): boolean {
  if (!client.email?.trim() || !isValidEmail(client.email)) return false;
  const { subject, texto } = buildCorreoImpuestosCalculados(
    client,
    periodo,
    registro,
    baseUrl
  );
  abrirBorradorCorreo({ to: client.email.trim(), subject, body: texto });
  return true;
}

export function abrirCorreoRecordatorioLimite(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): boolean {
  if (!client.email?.trim() || !isValidEmail(client.email)) return false;
  const { subject, texto } = buildCorreoRecordatorioLimite(
    client,
    periodo,
    registro,
    baseUrl
  );
  abrirBorradorCorreo({ to: client.email.trim(), subject, body: texto });
  return true;
}

export function abrirCorreoCumplimientoListo(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string,
  opts?: OpcionesCorreoCumplimientoListo
): boolean {
  if (!client.email?.trim() || !isValidEmail(client.email)) return false;
  const { subject, texto } = buildCorreoCumplimientoListo(
    client,
    periodo,
    registro,
    baseUrl,
    opts
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
  baseUrl?: string,
  opts?: OpcionesCorreoCumplimientoListo
): Promise<void> {
  const { texto, html } = buildCorreoCumplimientoListo(
    client,
    periodo,
    registro,
    baseUrl,
    opts
  );
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

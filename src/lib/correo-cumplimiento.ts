import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { getPortalClienteUrl } from "@/lib/correo";
import {
  type RegistroCumplimiento,
  type CategoriaId,
  CATEGORIA_META,
  asegurarBloques,
  formatFechaLimiteImpuesto,
  formatFechaLimiteImpuestoCorta,
  formatMontoImpuesto,
  categoriaConPagoEnRegistro,
} from "@/lib/cumplimiento";
import { isValidEmail } from "@/lib/email";
import {
  DESPACHO_NOMBRE,
  abrirBorradorCorreo,
  firmaHtmlCorreo,
  firmaCorreoTexto,
  logoCorreoHtml,
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
  montoNum: number;
};

/** Desglose línea por línea del previo (ISR, IVA, IMSS, etc.) para correos. */
function lineasDetallePrevioCorreo(
  registro: RegistroCumplimiento,
  categorias?: CategoriaId[]
): LineaConceptoCorreo[] {
  const r = asegurarBloques(registro);
  const cats =
    categorias ??
    (["federales", "imss", "estatales"] as CategoriaId[]).filter((c) =>
      categoriaConPagoEnRegistro(r, c)
    );

  const out: LineaConceptoCorreo[] = [];

  if (cats.includes("federales")) {
    for (const l of r.federales.lineasCaptura) {
      if (l.monto <= 0) continue;
      out.push({
        label: etiquetaCorreo(l.etiqueta, "Impuesto federal"),
        montoFmt: formatMontoImpuesto(l.monto),
        montoNum: l.monto,
        limiteFmt: l.fechaLimite
          ? formatFechaLimiteImpuestoCorta(l.fechaLimite)
          : "—",
      });
    }
  }

  if (cats.includes("imss") && r.imss.activo && r.imss.monto > 0) {
    const fl = r.imss.fechaLimite;
    out.push({
      label: CATEGORIA_META.imss.label,
      montoFmt: formatMontoImpuesto(r.imss.monto),
      montoNum: r.imss.monto,
      limiteFmt: fl ? formatFechaLimiteImpuestoCorta(fl) : "—",
    });
  }

  if (cats.includes("estatales") && r.estatales.activo) {
    const lineasEst = r.estatales.lineasCaptura.filter((l) => l.monto > 0);
    if (lineasEst.length > 0) {
      for (const l of lineasEst) {
        out.push({
          label: etiquetaCorreo(l.etiqueta, "Impuesto estatal"),
          montoFmt: formatMontoImpuesto(l.monto),
          montoNum: l.monto,
          limiteFmt: l.fechaLimite
            ? formatFechaLimiteImpuestoCorta(l.fechaLimite)
            : "—",
        });
      }
    } else if (r.estatales.monto > 0) {
      const fl = r.estatales.fechaLimite;
      out.push({
        label: "Impuestos estatales",
        montoFmt: formatMontoImpuesto(r.estatales.monto),
        montoNum: r.estatales.monto,
        limiteFmt: fl ? formatFechaLimiteImpuestoCorta(fl) : "—",
      });
    }
  }

  return out;
}

function totalLineasDetalle(lineas: LineaConceptoCorreo[]): string {
  const sum = lineas.reduce((s, l) => s + l.montoNum, 0);
  return formatMontoImpuesto(sum);
}

function etiquetaCorreo(raw: string, fallback: string): string {
  const limpio = raw.trim();
  if (!limpio || limpio.toLowerCase() === "impuestos federales") return fallback;
  return limpio;
}

function bloqueTextoLineas(lineas: LineaConceptoCorreo[]): string {
  return lineas
    .map(
      (l) =>
        `· ${l.label}: ${l.montoFmt}${l.limiteFmt !== "—" ? ` (vence ${l.limiteFmt})` : ""}`
    )
    .join("\n");
}

function filaHtmlConcepto(l: LineaConceptoCorreo, ultima: boolean): string {
  const borde = ultima ? "" : "border-bottom:1px solid #e2e8f0;";
  return `<tr><td style="padding:10px 0;${borde}"><p style="margin:0;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:800;">${l.label}</p><p style="margin:4px 0 0;font-size:18px;font-weight:800;color:#0f172a;">${l.montoFmt}</p>${l.limiteFmt !== "—" ? `<p style="margin:4px 0 0;font-size:12px;color:#b45309;font-weight:700;">Vence ${l.limiteFmt}</p>` : ""}</td></tr>`;
}

/** Tabla interna válida para clientes de correo (evita <tr> anidados en <td>). */
function htmlBloqueDesglose(lineas: LineaConceptoCorreo[], totalFmt: string): string {
  if (lineas.length === 0) return "";
  const filas = lineas
    .map((l, i) => filaHtmlConcepto(l, i === lineas.length - 1))
    .join("");
  const encabezado =
    lineas.length > 1
      ? `<p style="margin:0 0 12px;font-size:10px;text-transform:uppercase;color:#64748b;font-weight:800;">Desglose por concepto</p>`
      : "";
  const filaTotal =
    lineas.length > 1
      ? `<tr><td style="padding-top:16px;border-top:2px solid #cbd5e1;"><p style="margin:0;font-size:10px;text-transform:uppercase;color:#64748b;font-weight:800;">Total a pagar</p><p style="margin:4px 0 0;font-size:26px;font-weight:800;color:#0f172a;">${totalFmt}</p></td></tr>`
      : "";
  return `${encabezado}<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${filas}${filaTotal}</table>`;
}

/** Copia HTML al portapapeles y abre Gmail con destinatario/asunto. */
export async function abrirCorreoConFormato(opts: {
  to: string;
  subject: string;
  texto: string;
  html: string;
}): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([opts.html], { type: "text/html" }),
          "text/plain": new Blob([opts.texto], { type: "text/plain" }),
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(opts.texto);
    }
  } catch {
    await navigator.clipboard.writeText(opts.texto);
  }
  abrirBorradorCorreo({ to: opts.to, subject: opts.subject, body: opts.texto });
  return true;
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

  const lineas = lineasDetallePrevioCorreo(registro, categorias);
  const esUnConcepto = lineas.length === 1;
  const montoFmt = totalLineasDetalle(lineas);
  const tituloConcepto = esUnConcepto ? lineas[0]!.label : "Impuestos";
  const tituloCorreo = esUnConcepto ? `${tituloConcepto} listos` : "Documentación fiscal lista";

  const subject = esUnConcepto
    ? `${DESPACHO_NOMBRE} · ${tituloConcepto} listos · ${periodoTxt}`
    : `${DESPACHO_NOMBRE} · Impuestos listos · ${periodoTxt}`;

  const bloqueTextoConceptos = bloqueTextoLineas(lineas);

  const texto = [
    `Hola, ${razon},`,
    "",
    esUnConcepto
      ? `Tu documentación de ${tituloConcepto} correspondiente a ${periodoTxt} ya está disponible en tu portal de cliente.`
      : `Tu documentación fiscal de ${periodoTxt} ya está disponible en tu portal de cliente.`,
    "",
    "En el portal puedes consultar y descargar tus archivos.",
    "",
    lineas.length > 1 ? "Desglose por concepto:" : "Importe:",
    bloqueTextoConceptos,
    ...(lineas.length > 1 ? ["", `Total a pagar: ${montoFmt}`] : []),
    "",
    `Entra a tu portal: ${portalUrl}`,
    firmaCorreoTexto(),
  ].join("\n");

  const bloqueDesgloseHtml = htmlBloqueDesglose(lineas, montoFmt);

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
<tr><td style="padding:28px 28px 20px;background:linear-gradient(135deg,#4f46e5,#7c3aed);">
${logoCorreoHtml()}
<p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.75);font-weight:700;">${DESPACHO_NOMBRE}</p>
<h1 style="margin:8px 0 0;font-size:20px;color:#ffffff;font-weight:800;">${tituloCorreo}</h1>
</td></tr>
<tr><td style="padding:28px;">
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hola, <strong>${razon}</strong>,</p>
<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#64748b;">Tu documentación de <strong>${periodoTxt}</strong> ya está publicada en el portal.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;">
<tr><td style="padding:20px;">
${bloqueDesgloseHtml}
</td></tr>
</table>
<p style="margin:0 0 20px;text-align:center;">
<a href="${portalUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;font-size:12px;font-weight:800;text-decoration:none;border-radius:12px;text-transform:uppercase;letter-spacing:0.08em;">Ver en mi portal</a>
</p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#94a3b8;">Enlace: <a href="${portalUrl}" style="color:#6366f1;">${portalUrl}</a></p>
</td></tr>
<tr><td style="padding:8px 28px 24px;border-top:1px solid #f1f5f9;">
${firmaHtmlCorreo()}
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
  const razon = client.razonSocial;
  const lineas = lineasDetallePrevioCorreo(registro);
  const montoFmt = totalLineasDetalle(lineas);
  const limitePrincipal = registro.fechaLimite
    ? formatFechaLimiteImpuesto(registro.fechaLimite)
    : lineas.find((l) => l.limiteFmt !== "—")?.limiteFmt ?? "—";

  const subject = `${DESPACHO_NOMBRE} · Sus impuestos ya están calculados · ${periodoTxt}`;

  const bloqueTextoConceptos = bloqueTextoLineas(lineas);

  const texto = [
    `Hola, ${razon},`,
    "",
    `Calculamos el importe de tus impuestos correspondientes a ${periodoTxt}.`,
    "",
    "Desglose:",
    bloqueTextoConceptos,
    ...(lineas.length > 1 ? ["", `Total a pagar: ${montoFmt}`] : []),
    limitePrincipal !== "—" ? `Fecha límite de pago: ${limitePrincipal}` : "",
    "",
    "Entra a tu portal, revisa el importe y confirma que es correcto. Hasta que valides el previo, no publicaremos tus PDFs de declaración.",
    "",
    `Portal: ${portalUrl}`,
    firmaCorreoTexto(),
  ]
    .filter(Boolean)
    .join("\n");

  const bloqueDesgloseHtml = htmlBloqueDesglose(lineas, montoFmt);

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif;">
<table role="presentation" width="100%"><tr><td style="padding:32px 16px;">
<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;border:1px solid #e2e8f0;">
<tr><td style="padding:28px;background:linear-gradient(135deg,#4f46e5,#7c3aed);">
${logoCorreoHtml()}
<p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.85);font-weight:700;">${DESPACHO_NOMBRE}</p>
<h1 style="margin:8px 0 0;font-size:20px;color:#fff;font-weight:800;">Tus impuestos ya están calculados</h1>
</td></tr>
<tr><td style="padding:28px;">
<p style="margin:0 0 16px;font-size:15px;color:#334155;">Hola, <strong>${razon}</strong>,</p>
<p style="margin:0 0 20px;font-size:14px;color:#64748b;">Revisa el previo de <strong>${periodoTxt}</strong> en tu portal y confirma que el importe es correcto.</p>
<table width="100%" style="margin:0 0 24px;background:#fffbeb;border-radius:16px;border:1px solid #fde68a;">
<tr><td style="padding:20px;">
${bloqueDesgloseHtml}
${limitePrincipal !== "—" ? `<p style="margin:16px 0 0;font-size:10px;text-transform:uppercase;color:#92400e;font-weight:800;">Fecha límite</p><p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#b45309;">${limitePrincipal}</p>` : ""}
</td></tr></table>
<p style="text-align:center;margin:0 0 20px;">
<a href="${portalUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:12px;font-weight:800;text-decoration:none;border-radius:12px;text-transform:uppercase;">Validar en mi portal</a>
</p>
${firmaHtmlCorreo()}
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
    `Hola, ${razon},`,
    "",
    `Te recordamos que la fecha límite para el pago de tus impuestos de ${periodoTxt} se acerca.`,
    "",
    `Monto: ${montoFmt}`,
    `Fecha límite: ${limiteFmt}`,
    "",
    documentosFiscalesCompletos(registro)
      ? "Ya puedes subir tu comprobante de pago en el portal una vez que pagues."
      : "Consulta tu portal para ver el estatus de tu documentación.",
    "",
    `Portal: ${portalUrl}`,
    firmaCorreoTexto(),
  ].join("\n");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif;">
<table width="100%"><tr><td style="padding:32px 16px;">
<table width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;border:1px solid #e2e8f0;">
<tr><td style="padding:28px;background:linear-gradient(135deg,#991b1b,#dc2626);">
${logoCorreoHtml()}
<h1 style="margin:0;font-size:18px;color:#fff;font-weight:800;">Recordatorio: fecha límite próxima</h1>
</td></tr>
<tr><td style="padding:28px;">
<p style="margin:0 0 12px;font-size:14px;color:#334155;">Hola, <strong>${razon}</strong>,</p>
<p style="margin:0 0 20px;font-size:14px;color:#64748b;">Impuestos de <strong>${periodoTxt}</strong> · límite <strong>${limiteFmt}</strong> · <strong>${montoFmt}</strong></p>
<p style="text-align:center;margin:0 0 8px;"><a href="${portalUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-weight:800;text-decoration:none;border-radius:12px;">Ir al portal</a></p>
${firmaHtmlCorreo()}
</td></tr></table>
</td></tr></table></body></html>`;

  return { subject, texto, html, portalUrl };
}

function documentosFiscalesCompletos(reg: RegistroCumplimiento): boolean {
  const imssOk = !reg.aplicaImss || !!reg.imss;
  return !!reg.declaracion && !!reg.impuestos && imssOk;
}

export async function abrirCorreoImpuestosCalculados(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): Promise<boolean> {
  if (!client.email?.trim() || !isValidEmail(client.email)) return false;
  const { subject, texto, html } = buildCorreoImpuestosCalculados(
    client,
    periodo,
    registro,
    baseUrl
  );
  return abrirCorreoConFormato({
    to: client.email.trim(),
    subject,
    texto,
    html,
  });
}

export async function abrirCorreoRecordatorioLimite(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): Promise<boolean> {
  if (!client.email?.trim() || !isValidEmail(client.email)) return false;
  const { subject, texto, html } = buildCorreoRecordatorioLimite(
    client,
    periodo,
    registro,
    baseUrl
  );
  return abrirCorreoConFormato({
    to: client.email.trim(),
    subject,
    texto,
    html,
  });
}

export async function abrirCorreoCumplimientoListo(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string,
  opts?: OpcionesCorreoCumplimientoListo
): Promise<boolean> {
  if (!client.email?.trim() || !isValidEmail(client.email)) return false;
  const { subject, texto, html } = buildCorreoCumplimientoListo(
    client,
    periodo,
    registro,
    baseUrl,
    opts
  );
  return abrirCorreoConFormato({
    to: client.email.trim(),
    subject,
    texto,
    html,
  });
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

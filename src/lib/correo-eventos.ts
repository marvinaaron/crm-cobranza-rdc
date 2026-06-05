import {
  type Cliente,
  type Periodo,
  periodoLabel,
  getSaldoMes,
  getCompromisoMes,
  getTotalPendiente,
  listarMesesImpagos,
  calcularEstado,
} from "@/lib/clientes";
import { getPortalClienteUrl } from "@/lib/correo";
import {
  DESPACHO_NOMBRE,
  abrirBorradorCorreo,
  firmaHtmlCorreo,
  firmaCorreoTexto,
  logoCorreoHtml,
} from "@/lib/workspace-email";

export type CorreoEvento = {
  tipo: TipoCorreoEvento;
  subject: string;
  texto: string;
  html: string;
  portalUrl: string;
};
import { isValidEmail } from "@/lib/email";

export type TipoCorreoEvento = "comprobante_recibido" | "pago_confirmado";

export const CORREO_EVENTO_TIPOS: Record<
  TipoCorreoEvento,
  { label: string; descripcion: string }
> = {
  comprobante_recibido: {
    label: "Comprobante recibido",
    descripcion: "Al subir ticket en el portal; pago en validación.",
  },
  pago_confirmado: {
    label: "Pago confirmado",
    descripcion: "Cuando el despacho registra el pago en el CRM.",
  },
};

function formatMonto(n: number): string {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

export function buildHistorialHtmlBlock(client: Cliente, hasta: Periodo): string {
  const impagos = listarMesesImpagos(client, hasta);
  if (impagos.length === 0) return "";

  const filas = impagos
    .map(
      (m) => `
    <tr>
      <td style="padding:10px 12px;font-size:13px;color:#334155;border-bottom:1px solid #e2e8f0;">${m.label}</td>
      <td style="padding:10px 12px;font-size:13px;font-weight:bold;color:#0f172a;text-align:right;border-bottom:1px solid #e2e8f0;">${formatMonto(m.saldo)}</td>
    </tr>`
    )
    .join("");

  const total = getTotalPendiente(client, hasta);

  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#fff7ed;border-radius:16px;border:1px solid #fed7aa;">
    <tr><td style="padding:16px 20px 8px;">
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#9a3412;font-weight:bold;">Historial de pagos pendientes</p>
    </td></tr>
    <tr><td style="padding:0 12px 8px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${filas}</table>
    </td></tr>
    <tr><td style="padding:8px 20px 16px;border-top:2px solid #fdba74;">
      <p style="margin:0;font-size:12px;color:#7c2d12;"><strong>Total para estar al corriente:</strong></p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#9a3412;">${formatMonto(total)}</p>
    </td></tr>
  </table>`;
}

export function buildHistorialTextoBlock(client: Cliente, hasta: Periodo): string {
  const impagos = listarMesesImpagos(client, hasta);
  if (impagos.length === 0) return "";

  const lineas = impagos.map((m) => `  · ${m.label}: ${formatMonto(m.saldo)}`);
  const total = formatMonto(getTotalPendiente(client, hasta));
  return [
    "",
    "Historial de pagos pendientes:",
    ...lineas,
    "",
    `Total para estar al corriente: ${total}`,
    "",
  ].join("\n");
}

export function debeIncluirHistorialEnCorreo(client: Cliente, periodo: Periodo): boolean {
  return (
    calcularEstado(client, periodo) === "ATRASADO" &&
    listarMesesImpagos(client, periodo).length > 1
  );
}

export type DistribucionPago = { periodo: Periodo; monto: number };

export type OpcionesCorreoEvento = {
  baseUrl?: string;
  /** Monto que el admin recibió y va a notificar al cliente. */
  montoPagado?: number;
  /** Reparto del pago en varios meses (cuando es un comprobante dividido). */
  distribucion?: DistribucionPago[];
};

export function buildCorreoEvento(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoEvento,
  opciones?: OpcionesCorreoEvento
): CorreoEvento {
  const { baseUrl, montoPagado, distribucion } = opciones ?? {};
  const portalUrl = getPortalClienteUrl(client.id, baseUrl);
  const mesLabel = periodoLabel(periodo);
  const totalDistribuido = (distribucion ?? []).reduce(
    (s, d) => s + d.monto,
    0
  );
  const montoRef =
    montoPagado ??
    (totalDistribuido > 0
      ? totalDistribuido
      : getSaldoMes(client, periodo) || getCompromisoMes(client, periodo));
  const montoFmt = formatMonto(montoRef);
  const historialHtml = buildHistorialHtmlBlock(client, periodo);
  const historialTexto = buildHistorialTextoBlock(client, periodo);

  if (tipo === "comprobante_recibido") {
    const subject = `Comprobante recibido — ${mesLabel} | ${DESPACHO_NOMBRE}`;
    const texto = [
      `Hola, ${client.razonSocial},`,
      "",
      "Recibimos tu comprobante de pago correctamente.",
      "",
      `Periodo: ${mesLabel}`,
      `Monto de referencia: ${montoFmt}`,
      "",
      "Tu pago está en proceso de validación por nuestro equipo. Te avisamos cuando quede confirmado en tu expediente.",
      "",
      "Puedes consultar el estatus en tu portal:",
      portalUrl,
      firmaCorreoTexto(),
    ].join("\n");

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#334155;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:24px;border:1px solid #e2e8f0;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#065f46,#059669);padding:28px;text-align:center;color:#fff;">
${logoCorreoHtml()}
<p style="margin:0 0 6px;font-size:11px;opacity:0.85;text-transform:uppercase;letter-spacing:0.15em;">${DESPACHO_NOMBRE}</p>
<h1 style="margin:0;font-size:22px;">Comprobante recibido</h1>
<p style="margin:8px 0 0;font-size:13px;opacity:0.9;">${mesLabel}</p>
</td></tr>
<tr><td style="padding:32px;">
<p style="margin:0 0 12px;">Hola, <strong>${client.razonSocial}</strong>,</p>
<p style="margin:0 0 16px;line-height:1.6;">Confirmamos la recepción de tu comprobante. Tu pago está <strong>en validación</strong> y te avisamos cuando sea confirmado en nuestro sistema.</p>
<table width="100%" style="background:#f0fdf4;border-radius:12px;margin-bottom:20px;"><tr><td style="padding:16px;">
<p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#64748b;">Monto de referencia</p>
<p style="margin:0;font-size:24px;font-weight:bold;color:#0f172a;">${montoFmt}</p>
</td></tr></table>
<p style="margin:0 0 20px;line-height:1.6;color:#64748b;">No necesitas reenviar el mismo comprobante, salvo que quieras reemplazarlo desde tu portal.</p>
<a href="${portalUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#065f46,#059669);color:#fff;text-decoration:none;font-weight:bold;border-radius:999px;font-size:13px;text-transform:uppercase;">Ver mi portal</a>
${firmaHtmlCorreo()}
</td></tr>
</table></td></tr></table></body></html>`;

    return { tipo, subject, texto, html, portalUrl };
  }

  const subject = `Pago confirmado — ${mesLabel} | ${DESPACHO_NOMBRE}`;
  const estado = calcularEstado(client, periodo);
  const distribucionConDatos = (distribucion ?? []).filter((d) => d.monto > 0);
  const hayDistribucion = distribucionConDatos.length > 0;

  const distribucionTexto = hayDistribucion
    ? [
        "",
        "Aplicado de la siguiente forma:",
        ...distribucionConDatos.map(
          (d) => `  · ${periodoLabel(d.periodo)}: ${formatMonto(d.monto)}`
        ),
        "",
      ].join("\n")
    : "";

  const distribucionHtml = hayDistribucion
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#eef2ff;border-radius:16px;border:1px solid #c7d2fe;">
<tr><td style="padding:16px 20px 8px;">
<p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#3730a3;font-weight:bold;">Aplicado a</p>
</td></tr>
<tr><td style="padding:0 12px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${distribucionConDatos
        .map(
          (d) => `
  <tr>
    <td style="padding:8px 12px;font-size:13px;color:#1e293b;border-bottom:1px solid #c7d2fe;">${periodoLabel(d.periodo)}</td>
    <td style="padding:8px 12px;font-size:13px;font-weight:bold;color:#0f172a;text-align:right;border-bottom:1px solid #c7d2fe;">${formatMonto(d.monto)}</td>
  </tr>`
        )
        .join("")}</table>
</td></tr>
</table>`
    : "";

  const lineaPrincipal = hayDistribucion
    ? `Te confirmamos que recibimos tu pago por ${montoFmt} y lo aplicamos a las siguientes mensualidades:`
    : `Te confirmamos que recibimos tu pago por ${montoFmt} y lo aplicamos a ${mesLabel}.`;

  const texto = [
    `Hola, ${client.razonSocial},`,
    "",
    lineaPrincipal,
    distribucionTexto,
    estado === "AL CORRIENTE"
      ? "Tu cuenta está al corriente. ¡Gracias por tu puntualidad!"
      : estado === "PENDIENTE"
        ? "Aún tienes un mes pendiente en tu cuenta; puedes revisar el detalle en tu portal."
        : "Aún tienes saldos pendientes de meses anteriores; el detalle está en tu portal.",
    historialTexto,
    "",
    "Portal de cliente:",
    portalUrl,
    firmaCorreoTexto(),
  ].join("\n");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#334155;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:24px;border:1px solid #e2e8f0;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#065f46,#059669);padding:28px;text-align:center;color:#fff;">
${logoCorreoHtml()}
<p style="margin:0 0 6px;font-size:11px;opacity:0.85;text-transform:uppercase;letter-spacing:0.15em;">${DESPACHO_NOMBRE}</p>
<h1 style="margin:0;font-size:22px;">Pago confirmado</h1>
<p style="margin:8px 0 0;font-size:13px;opacity:0.9;">${hayDistribucion ? `Pago por ${montoFmt}` : mesLabel}</p>
</td></tr>
<tr><td style="padding:32px;">
<p style="margin:0 0 12px;">Hola, <strong>${client.razonSocial}</strong>,</p>
<p style="margin:0 0 16px;line-height:1.6;">${lineaPrincipal}</p>
${distribucionHtml}
${estado !== "AL CORRIENTE" ? historialHtml : `<p style="margin:0 0 16px;padding:12px;background:#ecfdf5;border-radius:12px;color:#047857;font-weight:bold;">Tu cuenta está al corriente.</p>`}
<a href="${portalUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#065f46,#059669);color:#fff;text-decoration:none;font-weight:bold;border-radius:999px;font-size:13px;text-transform:uppercase;margin-top:8px;">Ver mi portal</a>
${firmaHtmlCorreo()}
</td></tr>
</table></td></tr></table></body></html>`;

  return { tipo, subject, texto, html, portalUrl };
}

export function abrirCorreoEvento(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoEvento,
  opciones?: OpcionesCorreoEvento
): boolean {
  if (!client.email?.trim() || !isValidEmail(client.email)) return false;
  const { subject, texto } = buildCorreoEvento(client, periodo, tipo, opciones);
  abrirBorradorCorreo({
    to: client.email.trim(),
    subject,
    body: texto,
  });
  return true;
}

export async function copiarCorreoEventoHtml(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoEvento,
  opciones?: OpcionesCorreoEvento
): Promise<void> {
  const { texto, html } = buildCorreoEvento(client, periodo, tipo, opciones);
  if (typeof ClipboardItem !== "undefined") {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([texto], { type: "text/plain" }),
      }),
    ]);
    return;
  }
  await navigator.clipboard.writeText(texto);
}

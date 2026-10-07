import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  periodoLabel,
  getSaldoMes,
  getCompromisoMes,
  getMontoPagado,
  getTotalPendiente,
  getTotalDeudaPendiente,
  getTotalExtraPorCobrar,
  getExtrasEsperados,
  getSaldoExtraEsperado,
  labelPeriodoExtra,
  listarMesesImpagos,
  listarMesesCobrables,
  calcularEstado,
} from "@/lib/clientes";
import { getPortalClienteUrl } from "@/lib/correo";
import {
  DESPACHO_NOMBRE,
  abrirBorradorCorreo,
  firmaHtmlCorreo,
  firmaCorreoTexto,
  logoCorreoHtml,
  logoCorreoGrisHtml,
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

function formatMontoFactura(n: number): string {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function folioHonorarios(periodo: Periodo): string {
  const mes = String(periodo.mes + 1).padStart(2, "0");
  return `HON-${periodo.anio}-${mes}`;
}

function fechaPagoCorta(d = new Date()): string {
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type ExtraImpagoCorreo = {
  concepto: string;
  periodo: string;
  saldo: number;
};

/** Extras esperados con saldo pendiente (trabajo adicional por cobrar). */
export function listarExtrasImpagos(client: Cliente): ExtraImpagoCorreo[] {
  return getExtrasEsperados(client)
    .map((extra) => ({
      concepto: extra.concepto,
      periodo: labelPeriodoExtra(extra),
      saldo: getSaldoExtraEsperado(client, extra),
    }))
    .filter((x) => x.saldo > 0);
}

export function buildHistorialHtmlBlock(client: Cliente, hasta: Periodo): string {
  const impagos = listarMesesImpagos(client, hasta);
  const extras = listarExtrasImpagos(client);
  if (impagos.length === 0 && extras.length === 0) return "";

  const filasHonorarios = impagos
    .map(
      (m) => `
    <tr>
      <td style="padding:10px 12px;font-size:13px;color:#334155;border-bottom:1px solid #e2e8f0;">Honorarios · ${m.label}</td>
      <td style="padding:10px 12px;font-size:13px;font-weight:bold;color:#0f172a;text-align:right;border-bottom:1px solid #e2e8f0;">${formatMonto(m.saldo)}</td>
    </tr>`
    )
    .join("");

  const filasExtras = extras
    .map(
      (x) => `
    <tr>
      <td style="padding:10px 12px;font-size:13px;color:#92400e;border-bottom:1px solid #fde68a;">
        <span style="display:block;font-weight:bold;color:#78350f;">${x.concepto}</span>
        <span style="font-size:11px;color:#b45309;">Trabajo adicional · ${x.periodo}</span>
      </td>
      <td style="padding:10px 12px;font-size:13px;font-weight:bold;color:#92400e;text-align:right;border-bottom:1px solid #fde68a;">${formatMonto(x.saldo)}</td>
    </tr>`
    )
    .join("");

  const totalHonorarios = getTotalPendiente(client, hasta);
  const totalExtras = getTotalExtraPorCobrar(client);
  const total = getTotalDeudaPendiente(client, hasta);

  const pieTotal =
    extras.length > 0 && impagos.length > 0
      ? `<p style="margin:4px 0 0;font-size:11px;color:#7c2d12;">Honorarios ${formatMonto(totalHonorarios)} + adicionales ${formatMonto(totalExtras)}</p>`
      : "";

  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#fff7ed;border-radius:16px;border:1px solid #fed7aa;">
    <tr><td style="padding:16px 20px 8px;">
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#9a3412;font-weight:bold;">Estado de cuenta</p>
    </td></tr>
    <tr><td style="padding:0 12px 8px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${filasHonorarios}${filasExtras}</table>
    </td></tr>
    <tr><td style="padding:8px 20px 16px;border-top:2px solid #fdba74;">
      <p style="margin:0;font-size:12px;color:#7c2d12;"><strong>Total por pagar:</strong></p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#9a3412;">${formatMonto(total)}</p>
      ${pieTotal}
    </td></tr>
  </table>`;
}

export function buildHistorialTextoBlock(client: Cliente, hasta: Periodo): string {
  const impagos = listarMesesImpagos(client, hasta);
  const extras = listarExtrasImpagos(client);
  if (impagos.length === 0 && extras.length === 0) return "";

  const lineasHonorarios = impagos.map(
    (m) => `  · Honorarios ${m.label}: ${formatMonto(m.saldo)}`
  );
  const lineasExtras = extras.map(
    (x) => `  · ${x.concepto} (${x.periodo}): ${formatMonto(x.saldo)}`
  );
  const total = formatMonto(getTotalDeudaPendiente(client, hasta));
  return [
    "",
    "Estado de cuenta:",
    ...lineasHonorarios,
    ...lineasExtras,
    "",
    `Total por pagar: ${total}`,
    "",
  ].join("\n");
}

export function debeIncluirHistorialEnCorreo(client: Cliente, periodo: Periodo): boolean {
  if (getTotalExtraPorCobrar(client) > 0) return true;
  return (
    calcularEstado(client, periodo) === "ATRASADO" &&
    listarMesesImpagos(client, periodo).length > 1
  );
}

/**
 * Estado de cuenta completo para correo de pago confirmado.
 * Muestra los 12 meses del año del periodo con compromiso, pagado, saldo y
 * un indicador visual (✓ pagado, parcial, pendiente).
 */
export function buildEstadoCuentaCompletoHtml(
  client: Cliente,
  periodo: Periodo
): string {
  const anio = periodo.anio;
  const meses = listarMesesCobrables(client, { mes: 11, anio });
  const mesesAnio = meses.filter((m) => m.periodo.anio === anio);
  if (mesesAnio.length === 0) return "";

  const extras = listarExtrasImpagos(client);

  const totalCompromisoAnio = mesesAnio.reduce((s, m) => s + m.compromiso, 0);
  const totalPagadoAnio = mesesAnio.reduce((s, m) => s + m.pagado, 0);
  const totalSaldoAnio = mesesAnio.reduce((s, m) => s + m.saldo, 0);
  const totalExtras = extras.reduce((s, x) => s + x.saldo, 0);

  const filasMeses = MESES_NOM.map((nombre, i) => {
    const mes = mesesAnio.find((m) => m.periodo.mes === i);
    if (!mes) {
      return `<tr>
        <td style="padding:8px 12px;font-size:12px;color:#94a3b8;border-bottom:1px solid #f1f5f9;">${nombre}</td>
        <td style="padding:8px 8px;font-size:12px;color:#94a3b8;text-align:right;border-bottom:1px solid #f1f5f9;">—</td>
        <td style="padding:8px 8px;font-size:12px;color:#94a3b8;text-align:right;border-bottom:1px solid #f1f5f9;">—</td>
        <td style="padding:8px 8px;font-size:12px;color:#94a3b8;text-align:right;border-bottom:1px solid #f1f5f9;">—</td>
        <td style="padding:8px 8px;font-size:12px;text-align:center;border-bottom:1px solid #f1f5f9;">—</td>
      </tr>`;
    }

    const esMesActual = i === periodo.mes;
    const bgRow = esMesActual ? "background:#f0fdf4;" : "";
    const fontWeight = esMesActual ? "font-weight:bold;" : "";

    let statusIcon: string;
    let statusColor: string;
    if (mes.pagadoCompleto) {
      statusIcon = "✓";
      statusColor = "#059669";
    } else if (mes.parcial) {
      statusIcon = "◐";
      statusColor = "#d97706";
    } else if (mes.compromiso > 0) {
      statusIcon = "○";
      statusColor = "#dc2626";
    } else {
      statusIcon = "—";
      statusColor = "#94a3b8";
    }

    const saldoColor = mes.saldo > 0 ? "#dc2626" : "#059669";

    return `<tr style="${bgRow}">
      <td style="padding:8px 12px;font-size:12px;color:#334155;border-bottom:1px solid #f1f5f9;${fontWeight}">${nombre}</td>
      <td style="padding:8px 8px;font-size:12px;color:#64748b;text-align:right;border-bottom:1px solid #f1f5f9;">${formatMonto(mes.compromiso)}</td>
      <td style="padding:8px 8px;font-size:12px;color:#059669;text-align:right;border-bottom:1px solid #f1f5f9;font-weight:bold;">${mes.pagado > 0 ? formatMonto(mes.pagado) : "—"}</td>
      <td style="padding:8px 8px;font-size:12px;color:${saldoColor};text-align:right;border-bottom:1px solid #f1f5f9;font-weight:bold;">${mes.saldo > 0 ? formatMonto(mes.saldo) : "$0"}</td>
      <td style="padding:8px 8px;font-size:14px;text-align:center;border-bottom:1px solid #f1f5f9;color:${statusColor};">${statusIcon}</td>
    </tr>`;
  }).join("");

  const filasExtras = extras.length > 0
    ? extras.map(
        (x) => `<tr style="background:#fffbeb;">
      <td colspan="3" style="padding:8px 12px;font-size:12px;color:#92400e;border-bottom:1px solid #fde68a;">
        <strong>${x.concepto}</strong> <span style="font-size:10px;color:#b45309;">· ${x.periodo}</span>
      </td>
      <td style="padding:8px 8px;font-size:12px;font-weight:bold;color:#dc2626;text-align:right;border-bottom:1px solid #fde68a;">${formatMonto(x.saldo)}</td>
      <td style="padding:8px 8px;font-size:14px;text-align:center;border-bottom:1px solid #fde68a;color:#d97706;">○</td>
    </tr>`
      ).join("")
    : "";

  const granTotal = totalSaldoAnio + totalExtras;

  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;">
    <tr><td style="padding:16px 20px 8px;">
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#334155;font-weight:bold;">Estado de cuenta · ${anio}</p>
    </td></tr>
    <tr><td style="padding:0 8px 4px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr style="background:#f8fafc;">
          <th style="padding:8px 12px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;text-align:left;border-bottom:2px solid #e2e8f0;">Mes</th>
          <th style="padding:8px 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;text-align:right;border-bottom:2px solid #e2e8f0;">Cuota</th>
          <th style="padding:8px 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;text-align:right;border-bottom:2px solid #e2e8f0;">Pagado</th>
          <th style="padding:8px 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;text-align:right;border-bottom:2px solid #e2e8f0;">Saldo</th>
          <th style="padding:8px 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;text-align:center;border-bottom:2px solid #e2e8f0;">✓</th>
        </tr>
        ${filasMeses}
        ${filasExtras}
      </table>
    </td></tr>
    <tr><td style="padding:10px 20px 16px;border-top:2px solid #e2e8f0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size:12px;color:#334155;font-weight:bold;">Totales ${anio}</td>
          <td style="font-size:12px;color:#64748b;text-align:right;">${formatMonto(totalCompromisoAnio)}</td>
          <td style="font-size:12px;color:#059669;text-align:right;font-weight:bold;">${formatMonto(totalPagadoAnio)}</td>
          <td style="font-size:12px;color:${granTotal > 0 ? "#dc2626" : "#059669"};text-align:right;font-weight:bold;">${formatMonto(granTotal)}</td>
          <td style="width:40px;"></td>
        </tr>
      </table>
    </td></tr>
  </table>`;
}

export function buildEstadoCuentaCompletoTexto(
  client: Cliente,
  periodo: Periodo
): string {
  const anio = periodo.anio;
  const meses = listarMesesCobrables(client, { mes: 11, anio });
  const mesesAnio = meses.filter((m) => m.periodo.anio === anio);
  if (mesesAnio.length === 0) return "";

  const extras = listarExtrasImpagos(client);

  const lineas = [
    "",
    `Estado de cuenta · ${anio}`,
    "─".repeat(40),
  ];

  for (const nombre of MESES_NOM) {
    const i = MESES_NOM.indexOf(nombre);
    const mes = mesesAnio.find((m) => m.periodo.mes === i);
    if (!mes) {
      lineas.push(`  ${nombre.padEnd(12)} —`);
      continue;
    }
    const status = mes.pagadoCompleto ? "✓" : mes.parcial ? "◐" : "○";
    lineas.push(
      `  ${status} ${nombre.padEnd(12)} Cuota: ${formatMonto(mes.compromiso)}  Pagado: ${mes.pagado > 0 ? formatMonto(mes.pagado) : "—"}  Saldo: ${mes.saldo > 0 ? formatMonto(mes.saldo) : "$0"}`
    );
  }

  if (extras.length > 0) {
    lineas.push("");
    lineas.push("  Trabajo adicional:");
    for (const x of extras) {
      lineas.push(`  ○ ${x.concepto} (${x.periodo}): ${formatMonto(x.saldo)}`);
    }
  }

  const totalSaldo = mesesAnio.reduce((s, m) => s + m.saldo, 0) +
    extras.reduce((s, x) => s + x.saldo, 0);
  lineas.push("─".repeat(40));
  lineas.push(`  Total pendiente: ${formatMonto(totalSaldo)}`);
  lineas.push("");

  return lineas.join("\n");
}

export type DistribucionPago = { periodo: Periodo; monto: number };

export type AdjuntoCorreoEvento = {
  filename: string;
  content: string;
  contentType?: string;
};

export type AdjuntoStorageCorreo = {
  destino: "facturas";
  path: string;
  filename: string;
};

export type OpcionesCorreoEvento = {
  baseUrl?: string;
  /** Monto que el admin recibió y va a notificar al cliente. */
  montoPagado?: number;
  /** Reparto del pago en varios meses (cuando es un comprobante dividido). */
  distribucion?: DistribucionPago[];
  adjuntos?: AdjuntoCorreoEvento[];
  storageAdjuntos?: AdjuntoStorageCorreo[];
  /** Folio impreso en la factura (p. ej. AR-10210). */
  folioFactura?: string;
};

function nombrePdfSeguro(nombre: string | undefined): string {
  const limpio = (nombre ?? "factura.pdf").replace(/[^\w.\-áéíóúñÁÉÍÓÚÑ ]/g, "_");
  return limpio.toLowerCase().endsWith(".pdf") ? limpio : `${limpio}.pdf`;
}

function adjuntoDesdeDataUrl(
  filename: string,
  dataUrl: string,
  tipoMime?: string
): AdjuntoCorreoEvento | null {
  const coma = dataUrl.indexOf(",");
  if (coma < 0) return null;
  const content = dataUrl.slice(coma + 1).replace(/\s/g, "");
  if (!content) return null;
  return {
    filename: nombrePdfSeguro(filename),
    content,
    contentType: tipoMime || "application/pdf",
  };
}

async function fetchUrlABase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo leer el PDF de la factura.");
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/** Prepara el PDF de la factura para adjuntarlo al correo (Storage o data URL). */
export async function prepararAdjuntoFactura(f: {
  nombreArchivo: string;
  tipoMime: string;
  dataUrl: string;
  storagePath?: string;
}): Promise<{
  adjuntos?: AdjuntoCorreoEvento[];
  storageAdjuntos?: AdjuntoStorageCorreo[];
}> {
  const filename = nombrePdfSeguro(f.nombreArchivo);
  if (f.storagePath?.trim()) {
    return {
      storageAdjuntos: [
        { destino: "facturas", path: f.storagePath.trim(), filename },
      ],
    };
  }
  const url = f.dataUrl?.trim();
  if (!url) {
    throw new Error("La factura no tiene PDF disponible.");
  }
  if (url.startsWith("data:")) {
    const adj = adjuntoDesdeDataUrl(filename, url, f.tipoMime);
    if (!adj) throw new Error("No se pudo leer el PDF de la factura.");
    return { adjuntos: [adj] };
  }
  const content = await fetchUrlABase64(url);
  return {
    adjuntos: [
      {
        filename,
        content,
        contentType: f.tipoMime || "application/pdf",
      },
    ],
  };
}

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
      : getMontoPagado(client, periodo) || getCompromisoMes(client, periodo));
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

  const distribucionConDatos = (distribucion ?? []).filter((d) => d.monto > 0);
  const hayDistribucion = distribucionConDatos.length > 0;
  const facturaUrl = getPortalClienteUrl(
    client.id,
    baseUrl,
    "/portal/honorarios"
  );
  const folio =
    opciones?.folioFactura?.trim() ||
    folioHonorarios(
      hayDistribucion ? distribucionConDatos[0].periodo : periodo
    );
  const montoFactura = formatMontoFactura(montoRef);
  const pagadoEl = fechaPagoCorta();
  const conceptoMemo = hayDistribucion
    ? distribucionConDatos
        .map(
          (d) =>
            `${periodoLabel(d.periodo)} (${formatMontoFactura(d.monto)})`
        )
        .join(" · ")
    : `Honorarios de ${mesLabel}`;

  const subject = `Pago recibido · ${mesLabel} · ${DESPACHO_NOMBRE}`;
  const texto = [
    `Hola, ${client.razonSocial},`,
    "",
    `Recibimos tu pago de ${montoFactura}.`,
    `Folio: ${folio}`,
    `Pagado el ${pagadoEl}`,
    `Concepto: ${conceptoMemo}`,
    "",
    "Adjuntamos el PDF de tu factura. También queda en el portal:",
    facturaUrl,
    firmaCorreoTexto("Gracias,"),
  ].join("\n");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f4f6f8;"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:480px;">
<tr><td style="padding:8px 0 20px;text-align:center;">${logoCorreoGrisHtml()}</td></tr>
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;">
<tr><td style="padding:32px 28px 28px;">
<p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">Factura ${folio}</p>
<p style="margin:0 0 12px;font-size:36px;line-height:1.1;font-weight:800;color:#0f172a;">${montoFactura}</p>
<p style="margin:0 0 24px;font-size:14px;color:#047857;font-weight:600;">Pagado el ${pagadoEl}</p>
<a href="${facturaUrl}" style="display:block;padding:14px 20px;background:#0f2747;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;text-align:center;border-radius:10px;">Ver factura</a>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#f8fafc;border-radius:12px;">
<tr><td style="padding:16px 18px;">
<p style="margin:0 0 6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">Concepto</p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#334155;">${conceptoMemo}</p>
<p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#64748b;">Adjuntamos el PDF de tu factura. También queda en tu portal.</p>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
<tr><td style="padding:8px 4px 0;">
${firmaHtmlCorreo("Gracias,")}
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { tipo, subject, texto, html, portalUrl: facturaUrl };
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

export type ResultadoEnvioCorreoEvento = {
  ok: boolean;
  error?: string;
  id?: string;
};

/** Envía correo de evento (p. ej. pago confirmado) vía Resend. */
export async function enviarCorreoEventoResend(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoEvento,
  opciones?: OpcionesCorreoEvento
): Promise<ResultadoEnvioCorreoEvento> {
  const correoCliente = client.email?.trim();
  if (!correoCliente || !isValidEmail(correoCliente)) {
    return {
      ok: false,
      error: "El cliente no tiene correo válido registrado.",
    };
  }
  const { subject, html, texto } = buildCorreoEvento(
    client,
    periodo,
    tipo,
    opciones
  );
  try {
    const res = await fetch("/api/admin/correo/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: correoCliente,
        subject,
        html,
        text: texto,
        attachments: opciones?.adjuntos,
        storageAttachments: opciones?.storageAdjuntos,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      id?: string;
      error?: string;
    };
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error:
          data.error ??
          `Error ${res.status} al enviar el correo. Revisa la configuración de Resend.`,
      };
    }
    return { ok: true, id: data.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error de red al enviar.",
    };
  }
}

/** Tras validar un pago: envía el correo de confirmación al cliente. */
export async function notificarClientePagoValidado(
  client: Cliente,
  periodo: Periodo,
  opciones?: OpcionesCorreoEvento
): Promise<ResultadoEnvioCorreoEvento> {
  return enviarCorreoEventoResend(client, periodo, "pago_confirmado", opciones);
}

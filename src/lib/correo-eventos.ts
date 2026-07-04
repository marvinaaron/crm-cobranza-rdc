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

  const remanente = getTotalDeudaPendiente(client, periodo);
  const cuentaLimpia = remanente <= 0;

  const estadoCuentaHtml = buildEstadoCuentaCompletoHtml(client, periodo);
  const estadoCuentaTexto = buildEstadoCuentaCompletoTexto(client, periodo);

  const bloqueAlCorrienteHtml = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#ecfdf5;border-radius:16px;border:1px solid #a7f3d0;">
<tr><td style="padding:20px;text-align:center;">
<p style="margin:0 0 8px;font-size:28px;line-height:1;">✓</p>
<p style="margin:0;font-size:15px;font-weight:bold;color:#047857;line-height:1.5;">¡Gracias por tu pago!</p>
<p style="margin:8px 0 0;font-size:13px;color:#065f46;line-height:1.6;">Tu cuenta está al corriente con tus honorarios. Seguimos a tu servicio.</p>
</td></tr></table>`;

  const bloqueAlCorrienteTexto =
    "¡Gracias por tu pago! Tu cuenta está al corriente con tus honorarios.";

  const checkmarkHeader = `<div style="width:72px;height:72px;margin:0 auto 14px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
</div>`;

  const subject = `Pago confirmado — ${mesLabel} | ${DESPACHO_NOMBRE}`;
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
    cuentaLimpia
      ? bloqueAlCorrienteTexto
      : remanente > 0
        ? `Aún queda un remanente de ${formatMonto(remanente)} en tu cuenta.`
        : "Tu cuenta está al corriente.",
    estadoCuentaTexto,
    "",
    "Portal de cliente:",
    portalUrl,
    firmaCorreoTexto(),
  ].join("\n");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#334155;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:24px;border:1px solid #e2e8f0;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:28px;text-align:center;color:#fff;">
${checkmarkHeader}
${logoCorreoHtml()}
<p style="margin:0 0 6px;font-size:11px;opacity:0.9;text-transform:uppercase;letter-spacing:0.15em;">${DESPACHO_NOMBRE}</p>
<h1 style="margin:0;font-size:22px;">Pago completado</h1>
<p style="margin:8px 0 0;font-size:13px;opacity:0.95;">Recibimos tu pago satisfactoriamente</p>
<p style="margin:4px 0 0;font-size:12px;opacity:0.85;">${hayDistribucion ? `Pago por ${montoFmt}` : mesLabel}</p>
</td></tr>
<tr><td style="padding:32px;">
<p style="margin:0 0 12px;">Hola, <strong>${client.razonSocial}</strong>,</p>
<p style="margin:0 0 16px;line-height:1.6;">${lineaPrincipal}</p>
<table width="100%" style="background:#f0fdf4;border-radius:12px;margin-bottom:20px;border:1px solid #bbf7d0;"><tr><td style="padding:16px;text-align:center;">
<p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#64748b;">Monto confirmado</p>
<p style="margin:0;font-size:26px;font-weight:bold;color:#047857;">${montoFmt}</p>
</td></tr></table>
${distribucionHtml}
${cuentaLimpia ? bloqueAlCorrienteHtml : ""}
${estadoCuentaHtml}
<a href="${portalUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#059669,#047857);color:#fff;text-decoration:none;font-weight:bold;border-radius:999px;font-size:13px;text-transform:uppercase;margin-top:8px;">Ver mi portal</a>
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

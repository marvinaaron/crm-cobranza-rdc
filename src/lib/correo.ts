import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  periodoLabel,
  getSaldoMes,
  getCompromisoMes,
  estaPagado,
  getTotalPendiente,
  clienteActivoEnPeriodo,
  calcularEstado,
  listarMesesImpagos,
  periodoKey,
} from "@/lib/clientes";
import { isValidEmail } from "@/lib/email";
import {
  buildHistorialHtmlBlock,
  buildHistorialTextoBlock,
  debeIncluirHistorialEnCorreo,
} from "@/lib/correo-eventos";

import {
  DESPACHO_NOMBRE,
  DESPACHO_EMAIL,
  DESPACHO_SITIO,
  abrirBorradorCorreo,
  firmaHtmlCorreo,
  firmaCorreoTexto,
} from "@/lib/workspace-email";

export { DESPACHO_NOMBRE, DESPACHO_EMAIL, DESPACHO_SITIO };

export type TipoCorreoCobranza = "recordatorio" | "vencido" | "cierre_mes";

export const CORREO_TIPOS: Record<
  TipoCorreoCobranza,
  {
    label: string;
    labelCorto: string;
    descripcion: string;
    momento: string;
  }
> = {
  recordatorio: {
    label: "Recordatorio amable",
    labelCorto: "Inicio de mes",
    descripcion: "Cordial, con fecha límite de pago y enlace al portal.",
    momento: "Ideal al inicio del mes (día 1).",
  },
  vencido: {
    label: "Pago vencido",
    labelCorto: "Post-vencimiento",
    descripcion: "Un día después del vencimiento; invita a ponerse al corriente.",
    momento: "Al día siguiente de la fecha límite del cliente.",
  },
  cierre_mes: {
    label: "Cierre de mes",
    labelCorto: "Fin de mes",
    descripcion: "Último recordatorio del periodo antes de cerrar el mes.",
    momento: "Último día del mes.",
  },
};

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getPortalClienteUrl(
  clienteId: number,
  baseUrl?: string,
  destino?: string
): string {
  const base = baseUrl ?? getBaseUrl();
  const url = `${base}/portal/login?cliente=${clienteId}`;
  return destino ? `${url}&next=${encodeURIComponent(destino)}` : url;
}

export function fechaLimitePago(client: Cliente, periodo: Periodo): string {
  const dia = Number(client.fechaPago);
  const mes = MESES_NOM[periodo.mes];
  return `${dia} de ${mes} de ${periodo.anio}`;
}

export function getFechaLimiteDate(client: Cliente, periodo: Periodo): Date {
  const dia = Math.min(
    Number(client.fechaPago) || 1,
    diasEnMes(periodo.mes, periodo.anio)
  );
  return new Date(periodo.anio, periodo.mes, dia);
}

export function diasEnMes(mes: number, anio: number): number {
  return new Date(anio, mes + 1, 0).getDate();
}

export function ultimoDiaDelMes(periodo: Periodo): number {
  return diasEnMes(periodo.mes, periodo.anio);
}

function mismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function inicioDeMes(fecha: Date): boolean {
  return fecha.getDate() === 1;
}

function finDeMes(fecha: Date, periodo: Periodo): boolean {
  return fecha.getDate() === ultimoDiaDelMes(periodo);
}

export function clienteTieneSaldoPendiente(client: Cliente, periodo: Periodo): boolean {
  if (!clienteActivoEnPeriodo(client, periodo)) return false;
  if (estaPagado(client, periodo)) return false;
  const estado = calcularEstado(client, periodo);
  return estado === "PENDIENTE" || estado === "ATRASADO";
}

/** Día 1 del mes: recordatorio amable */
export function aplicaCorreoRecordatorio(
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): boolean {
  if (!clienteTieneSaldoPendiente(client, periodo)) return false;
  return inicioDeMes(fechaRef);
}

/** Día siguiente a la fecha límite del cliente */
export function aplicaCorreoVencido(
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): boolean {
  if (!clienteTieneSaldoPendiente(client, periodo)) return false;
  const limite = getFechaLimiteDate(client, periodo);
  const diaSiguiente = new Date(limite);
  diaSiguiente.setDate(diaSiguiente.getDate() + 1);
  return mismoDia(fechaRef, diaSiguiente);
}

/** Último día del mes */
export function aplicaCorreoCierreMes(
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): boolean {
  if (!clienteTieneSaldoPendiente(client, periodo)) return false;
  return (
    finDeMes(fechaRef, periodo) &&
    fechaRef.getMonth() === periodo.mes &&
    fechaRef.getFullYear() === periodo.anio
  );
}

export function aplicaCorreoPorTipo(
  tipo: TipoCorreoCobranza,
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): boolean {
  switch (tipo) {
    case "recordatorio":
      return aplicaCorreoRecordatorio(client, periodo, fechaRef);
    case "vencido":
      return aplicaCorreoVencido(client, periodo, fechaRef);
    case "cierre_mes":
      return aplicaCorreoCierreMes(client, periodo, fechaRef);
  }
}

export function filtrarClientesParaCorreo(
  tipo: TipoCorreoCobranza,
  clientes: Cliente[],
  periodo: Periodo,
  fechaRef = new Date()
): Cliente[] {
  return clientes.filter((c) => aplicaCorreoPorTipo(tipo, c, periodo, fechaRef));
}

function inicioDelDia(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

/** Clientes que deben recibir este correo según saldo y fechas (para revisión y envío). */
export function elegibleParaCorreo(
  tipo: TipoCorreoCobranza,
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): boolean {
  if (!clienteTieneSaldoPendiente(client, periodo)) return false;

  switch (tipo) {
    case "recordatorio":
      return true;
    case "vencido": {
      const limite = inicioDelDia(getFechaLimiteDate(client, periodo));
      const hoy = inicioDelDia(fechaRef);
      return hoy > limite;
    }
    case "cierre_mes":
      return true;
  }
}

export function filtrarClientesElegiblesCorreo(
  tipo: TipoCorreoCobranza,
  clientes: Cliente[],
  periodo: Periodo,
  fechaRef = new Date()
): Cliente[] {
  return clientes.filter((c) => elegibleParaCorreo(tipo, c, periodo, fechaRef));
}

export type CorreoIndividualCliente =
  | {
      habilitado: true;
      tipo: TipoCorreoCobranza;
      titulo: string;
      descripcion: string;
      labelCorto: string;
    }
  | {
      habilitado: false;
      motivo: string;
    };

/**
 * Correo individual en fila de cobranza, según estatus del cliente.
 * AL CORRIENTE → deshabilitado. PENDIENTE / ATRASADO → tipo acorde al caso.
 */
export function getCorreoIndividualCliente(
  client: Cliente,
  periodo: Periodo,
  fechaRef = new Date()
): CorreoIndividualCliente {
  const estado = calcularEstado(client, periodo);

  if (!client.activo || !clienteActivoEnPeriodo(client, periodo)) {
    return { habilitado: false, motivo: "Cliente inactivo en este periodo" };
  }

  if (estado === "AL CORRIENTE" || !clienteTieneSaldoPendiente(client, periodo)) {
    return {
      habilitado: false,
      motivo: "Al corriente — no hay recordatorio por enviar",
    };
  }

  if (!client.email?.trim() || !isValidEmail(client.email)) {
    return { habilitado: false, motivo: "Sin correo válido en el expediente" };
  }

  const limite = inicioDelDia(getFechaLimiteDate(client, periodo));
  const hoy = inicioDelDia(fechaRef);
  const pasoVencimiento = hoy > limite;
  const mesesImpagos = listarMesesImpagos(client, periodo);
  const tieneMesesAnteriores = mesesImpagos.some(
    (m) => periodoKey(m.periodo) < periodoKey(periodo)
  );

  let tipo: TipoCorreoCobranza;

  if (estado === "ATRASADO") {
    if (
      finDeMes(fechaRef, periodo) &&
      fechaRef.getMonth() === periodo.mes &&
      fechaRef.getFullYear() === periodo.anio
    ) {
      tipo = "cierre_mes";
    } else if (pasoVencimiento || tieneMesesAnteriores) {
      tipo = "vencido";
    } else {
      tipo = "recordatorio";
    }
  } else {
    tipo = pasoVencimiento ? "vencido" : "recordatorio";
  }

  const meta = CORREO_TIPOS[tipo];
  return {
    habilitado: true,
    tipo,
    titulo: `Enviar ${meta.labelCorto.toLowerCase()}`,
    descripcion: meta.descripcion,
    labelCorto: meta.labelCorto,
  };
}

/** Si hoy es el día programado del calendario para este tipo de correo. */
export function esDiaProgramadoCorreo(
  tipo: TipoCorreoCobranza,
  fechaRef = new Date()
): boolean {
  switch (tipo) {
    case "recordatorio":
      return inicioDeMes(fechaRef);
    case "vencido":
      return false;
    case "cierre_mes":
      return finDeMes(fechaRef, {
        mes: fechaRef.getMonth(),
        anio: fechaRef.getFullYear(),
      });
  }
}

export function enviarCorreosMasivo(
  clientes: Cliente[],
  periodo: Periodo,
  tipo: TipoCorreoCobranza,
  baseUrl?: string,
  delayMs = 400
): void {
  clientes.forEach((cliente, i) => {
    setTimeout(() => abrirCorreoCobranza(cliente, periodo, tipo, baseUrl), i * delayMs);
  });
}

export type CorreoCobranza = {
  tipo: TipoCorreoCobranza;
  subject: string;
  texto: string;
  html: string;
  portalUrl: string;
};

function formatMonto(client: Cliente, periodo: Periodo): string {
  const monto = getSaldoMes(client, periodo) || getCompromisoMes(client, periodo);
  return monto.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function formatMontoTotal(client: Cliente, periodo: Periodo): string {
  return getTotalPendiente(client, periodo).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

type PlantillaCorreo = {
  subject: string;
  headerTitle: string;
  headerGradient: string;
  buttonGradient: string;
  intro: string;
  cuerpo: string;
  cta: string;
  pie: string;
  badgeMonto?: string;
  extraCaja?: string;
};

function plantillaPorTipo(
  tipo: TipoCorreoCobranza,
  client: Cliente,
  periodo: Periodo
): PlantillaCorreo {
  const mesLabel = periodoLabel(periodo);
  const limite = fechaLimitePago(client, periodo);
  const montoFmt = formatMonto(client, periodo);
  const totalFmt = formatMontoTotal(client, periodo);

  switch (tipo) {
    case "recordatorio":
      return {
        subject: `Recordatorio de honorarios — ${mesLabel} | ${DESPACHO_NOMBRE}`,
        headerTitle: "Recordatorio de honorarios",
        headerGradient: "linear-gradient(135deg,#ea580c 0%,#f97316 100%)",
        buttonGradient: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
        intro: `Esperamos que estés muy bien. Te escribimos para recordarte de manera cordial que tienes un <strong>pago pendiente</strong> por concepto de honorarios profesionales del periodo <strong>${mesLabel}</strong>.`,
        cuerpo: `Te pedimos cubrir el importe a más tardar el <strong>${limite}</strong>, fecha límite establecida en tu expediente.`,
        cta: "También puedes revisar el detalle de tu cuenta en línea:",
        pie: "Estamos para ayudarte con cualquier aclaración.",
        badgeMonto: "Monto pendiente",
        extraCaja: `<p style="margin:0;font-size:13px;color:#475569;"><strong>Fecha límite de pago:</strong> ${limite}</p>`,
      };
    case "vencido":
      return {
        subject: `Aviso: fecha de pago vencida — ${mesLabel} | ${DESPACHO_NOMBRE}`,
        headerTitle: "Fecha de pago vencida",
        headerGradient: "linear-gradient(135deg,#991b1b 0%,#dc2626 100%)",
        buttonGradient: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
        intro: `Te escribimos respecto a tu cuenta de honorarios del periodo <strong>${mesLabel}</strong>. La <strong>fecha límite de pago (${limite}) ya pasó</strong> y, al día de hoy, aún registramos saldo pendiente por <strong>${montoFmt}</strong>.`,
        cuerpo: `Te pedimos <strong>ponerte al corriente</strong> a la brevedad posible. Si ya pagaste, haznos saber para actualizar tu expediente.`,
        cta: "Consulta el detalle de tu cuenta y el estatus de tus pagos en tu portal:",
        pie: "Gracias por tu atención. Estamos para ayudarte.",
        badgeMonto: "Saldo del periodo",
        extraCaja: `<p style="margin:8px 0 0;font-size:13px;color:#7f1d1d;"><strong>Vencimiento:</strong> ${limite} (vencido)</p>`,
      };
    case "cierre_mes":
      return {
        subject: `Recordatorio final — ${mesLabel} | ${DESPACHO_NOMBRE}`,
        headerTitle: "Recordatorio de cierre de mes",
        headerGradient: "linear-gradient(135deg,#1e1b4b 0%,#4f46e5 100%)",
        buttonGradient: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
        intro: `Al acercarse el cierre de <strong>${mesLabel}</strong>, te enviamos este último recordatorio amable sobre tu pago de honorarios profesionales, aún pendiente por <strong>${montoFmt}</strong>.`,
        cuerpo: `Te agradecemos regularizar tu cuenta antes de finalizar el mes. Si necesitas apoyo o aclaración sobre el monto, con gusto te atendemos.`,
        cta: "Revisa tu estado de cuenta y pagos en el portal del despacho:",
        pie: "Gracias por tu confianza. Estamos para ayudarte.",
        badgeMonto: "Pendiente del mes",
        extraCaja:
          totalFmt !== montoFmt
            ? `<p style="margin:8px 0 0;font-size:13px;color:#475569;"><strong>Total pendiente acumulado:</strong> ${totalFmt}</p>`
            : `<p style="margin:8px 0 0;font-size:13px;color:#475569;"><strong>Fecha límite acordada:</strong> día ${client.fechaPago} de cada mes</p>`,
      };
  }
}

function buildHtmlCorreo(
  client: Cliente,
  periodo: Periodo,
  portalUrl: string,
  plantilla: PlantillaCorreo,
  montoFmt: string
): string {
  const mesLabel = periodoLabel(periodo);
  const historialBlock = debeIncluirHistorialEnCorreo(client, periodo)
    ? buildHistorialHtmlBlock(client, periodo)
    : "";
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:${plantilla.headerGradient};padding:28px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);font-weight:bold;">${DESPACHO_NOMBRE}</p>
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:bold;">${plantilla.headerTitle}</h1>
              <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.9);">${mesLabel}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hola, <strong>${client.razonSocial}</strong>,</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${plantilla.intro}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#64748b;font-weight:bold;">${plantilla.badgeMonto ?? "Monto"}</p>
                    <p style="margin:0 0 12px;font-size:28px;font-weight:bold;color:#0f172a;">${montoFmt}</p>
                    ${plantilla.extraCaja ?? ""}
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${plantilla.cuerpo}</p>
              ${historialBlock}
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">${plantilla.cta}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius:999px;background:${plantilla.buttonGradient};">
                    <a href="${portalUrl}" target="_blank" style="display:inline-block;padding:16px 36px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;">Ir a mi portal de cliente</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">${plantilla.pie}</p>
              ${firmaHtmlCorreo()}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.5;">Si el botón no funciona, copia este enlace en tu navegador:<br><a href="${portalUrl}" style="color:#2563eb;word-break:break-all;">${portalUrl}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildTextoCorreo(
  client: Cliente,
  periodo: Periodo,
  portalUrl: string,
  plantilla: PlantillaCorreo,
  montoFmt: string
): string {
  const mesLabel = periodoLabel(periodo);
  const limite = fechaLimitePago(client, periodo);
  const totalFmt = formatMontoTotal(client, periodo);

  const parrafos: string[] = [
    `Hola, ${client.razonSocial},`,
    "",
    "Esperamos que estés muy bien.",
    "",
  ];

  const historialTxt = debeIncluirHistorialEnCorreo(client, periodo)
    ? buildHistorialTextoBlock(client, periodo)
    : "";

  if (plantilla.headerTitle === "Recordatorio de honorarios") {
    parrafos.push(
      `Te recordamos de manera cordial que tienes un pago pendiente por concepto de honorarios profesionales del periodo de ${mesLabel}, por un monto de ${montoFmt}.`,
      "",
      `Te pedimos realizar el pago a más tardar el ${limite}, fecha límite establecida en tu expediente.`
    );
  } else if (plantilla.headerTitle === "Fecha de pago vencida") {
    parrafos.push(
      `La fecha límite de pago (${limite}) del periodo ${mesLabel} ya pasó, y aún registramos un saldo pendiente de ${montoFmt}.`,
      "",
      `Te pedimos ponerte al corriente a la brevedad posible. Si ya pagaste, haznos saber para actualizar tu expediente.`
    );
  } else {
    parrafos.push(
      `Al acercarse el cierre de ${mesLabel}, te enviamos este último recordatorio sobre tu pago de honorarios, pendiente por ${montoFmt}.`,
      "",
      `Te agradecemos regularizar tu cuenta antes de finalizar el mes.`
    );
    if (totalFmt !== montoFmt && !historialTxt) {
      parrafos.push("", `Total pendiente acumulado: ${totalFmt}.`);
    }
  }

  if (historialTxt) parrafos.push(historialTxt);

  parrafos.push(
    "",
    "Puedes consultar el detalle de tu cuenta en tu portal de cliente:",
    portalUrl,
    "",
    "Estamos para ayudarte con cualquier aclaración.",
    firmaCorreoTexto()
  );

  return parrafos.join("\n");
}

export function buildCorreoCobranza(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoCobranza = "recordatorio",
  baseUrl?: string
): CorreoCobranza {
  const portalUrl = getPortalClienteUrl(client.id, baseUrl, "/portal/honorarios");
  const plantilla = plantillaPorTipo(tipo, client, periodo);
  const montoFmt = formatMonto(client, periodo);
  const texto = buildTextoCorreo(client, periodo, portalUrl, plantilla, montoFmt);
  const html = buildHtmlCorreo(client, periodo, portalUrl, plantilla, montoFmt);

  return { tipo, subject: plantilla.subject, texto, html, portalUrl };
}

export function abrirCorreoCobranza(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoCobranza = "recordatorio",
  baseUrl?: string
): void {
  const { subject, texto } = buildCorreoCobranza(client, periodo, tipo, baseUrl);
  abrirBorradorCorreo({
    to: client.email?.trim(),
    subject,
    body: texto,
  });
}

export type ResultadoEnvioResend = {
  ok: boolean;
  error?: string;
  id?: string;
};

/**
 * Envía el correo de cobranza por Resend (HTML completo + texto de respaldo)
 * usando el endpoint `/api/admin/correo/enviar`. El admin debe estar
 * autenticado. Devuelve un resultado plano para que la UI muestre toast.
 */
export async function enviarCorreoCobranzaResend(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoCobranza = "recordatorio",
  baseUrl?: string
): Promise<ResultadoEnvioResend> {
  const correoCliente = client.email?.trim();
  if (!correoCliente) {
    return {
      ok: false,
      error: "El cliente no tiene correo registrado.",
    };
  }
  const { subject, html, texto } = buildCorreoCobranza(
    client,
    periodo,
    tipo,
    baseUrl
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

export async function copiarCorreoHtml(
  client: Cliente,
  periodo: Periodo,
  tipo: TipoCorreoCobranza = "recordatorio",
  baseUrl?: string
): Promise<void> {
  const { texto, html } = buildCorreoCobranza(client, periodo, tipo, baseUrl);
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

/** @deprecated Use buildCorreoCobranza con tipo */
export function buildRecordatorio(client: Cliente, periodo: Periodo): string {
  return buildCorreoCobranza(client, periodo, "recordatorio").texto;
}

function escaparHtmlCorreo(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Convierte texto libre en párrafos HTML (doble salto = párrafo, salto simple = <br>). */
function cuerpoLibreAHtml(cuerpo: string): string {
  return cuerpo
    .split(/\n{2,}/)
    .map((bloque) => bloque.trim())
    .filter(Boolean)
    .map(
      (bloque) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${escaparHtmlCorreo(
          bloque
        ).replace(/\n/g, "<br>")}</p>`
    )
    .join("");
}

/**
 * Envuelve un texto libre (un "script") en la misma plantilla de marca del
 * despacho (encabezado, tipografía y firma) para que, al copiarlo y pegarlo en
 * Gmail / Apple Mail, conserve el diseño en lugar de pegarse como texto plano.
 */
export function buildCorreoLibre(cuerpo: string): { html: string; texto: string } {
  const cuerpoHtml =
    cuerpoLibreAHtml(cuerpo) ||
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;"></p>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#4f46e5 100%);padding:24px 32px;text-align:center;">
              <p style="margin:0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#ffffff;font-weight:bold;">${DESPACHO_NOMBRE}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${cuerpoHtml}
              ${firmaHtmlCorreo()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const texto = `${cuerpo.trim()}\n${firmaCorreoTexto()}`;
  return { html, texto };
}

/** Copia un script al portapapeles con formato HTML de marca (y respaldo en texto). */
export async function copiarCorreoLibreHtml(cuerpo: string): Promise<void> {
  const { html, texto } = buildCorreoLibre(cuerpo);
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

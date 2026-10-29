import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import type { ResultadoEnvioResend } from "@/lib/correo";
import { getPortalClienteUrl } from "@/lib/correo";
import {
  type RegistroCumplimiento,
  type CategoriaId,
  type DocumentoHacienda,
  CATEGORIA_META,
  asegurarBloques,
  formatFechaLimiteImpuesto,
  formatMontoImpuesto,
  categoriaConPagoEnRegistro,
  documentosFiscalesCompletos,
  getDocumentoSingular,
} from "@/lib/cumplimiento";
import { isValidEmail } from "@/lib/email";
import {
  DESPACHO_NOMBRE,
  CORREO_UI,
  abrirBorradorCorreo,
  firmaCorreoTexto,
  armarCorreoHtml,
  cardCorreoHtml,
  ctaCorreoHtml,
  duoMontoFechaCorreoHtml,
  formatFechaCorreoDesdeIso,
} from "@/lib/workspace-email";

export type CorreoCumplimiento = {
  subject: string;
  texto: string;
  html: string;
  portalUrl: string;
  /** PDFs en Storage para adjuntar al enviar por Resend. */
  storageAttachments?: {
    destino: "cumplimiento";
    path: string;
    filename: string;
  }[];
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
  /** ISO YYYY-MM-DD si aplica (para una sola fecha de vencimiento). */
  limiteIso?: string;
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
      const limiteIso = l.fechaLimite || undefined;
      if (l.conceptos && l.conceptos.length > 0) {
        for (const c of l.conceptos) {
          if (c.monto <= 0) continue;
          const nombre = etiquetaCorreo(c.etiqueta, "Impuesto federal");
          out.push({
            label: c.aFavor ? `${nombre} a favor` : nombre,
            montoFmt: formatMontoImpuesto(c.monto),
            montoNum: c.aFavor ? 0 : c.monto,
            limiteIso: c.aFavor ? undefined : limiteIso,
          });
        }
      } else {
        out.push({
          label: etiquetaCorreo(l.etiqueta, "Impuesto federal"),
          montoFmt: formatMontoImpuesto(l.monto),
          montoNum: l.monto,
          limiteIso,
        });
      }
    }
  }

  if (cats.includes("imss") && r.imss.activo && r.imss.monto > 0) {
    const fl = r.imss.fechaLimite;
    out.push({
      label: CATEGORIA_META.imss.label,
      montoFmt: formatMontoImpuesto(r.imss.monto),
      montoNum: r.imss.monto,
      limiteIso: fl || undefined,
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
          limiteIso: l.fechaLimite || undefined,
        });
      }
    } else if (r.estatales.monto > 0) {
      const fl = r.estatales.fechaLimite;
      out.push({
        label: "Impuestos estatales",
        montoFmt: formatMontoImpuesto(r.estatales.monto),
        montoNum: r.estatales.monto,
        limiteIso: fl || undefined,
      });
    }
  }

  return out;
}

/** Una sola fecha de vencimiento (estilo portal), si todas coinciden. */
function venceUnicoFmt(
  lineas: LineaConceptoCorreo[],
  registro?: RegistroCumplimiento
): string | null {
  const isos = [
    ...new Set(
      lineas.map((l) => l.limiteIso).filter((x): x is string => Boolean(x))
    ),
  ];
  if (isos.length === 1) return formatFechaCorreoDesdeIso(isos[0]);
  if (isos.length === 0 && registro?.fechaLimite) {
    return formatFechaCorreoDesdeIso(registro.fechaLimite);
  }
  return null;
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

function bloqueTextoLineas(
  lineas: LineaConceptoCorreo[],
  registro?: RegistroCumplimiento
): string {
  const conceptos = lineas.map((l) => `· ${l.label}: ${l.montoFmt}`).join("\n");
  const vence = venceUnicoFmt(lineas, registro);
  return vence ? `${conceptos}\nVence ${vence}` : conceptos;
}

/** Fila portal: etiqueta a la izquierda, monto a la derecha. */
function filaHtmlConcepto(l: LineaConceptoCorreo, ultima: boolean): string {
  const borde = ultima ? "" : `border-bottom:1px solid ${CORREO_UI.line};`;
  return `<tr><td style="padding:10px 0;${borde}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="font-size:14px;font-weight:700;color:${CORREO_UI.navy};">${l.label}</td><td align="right" style="font-size:14px;font-weight:800;color:${CORREO_UI.navy};white-space:nowrap;">${l.montoFmt}</td></tr></table></td></tr>`;
}

/**
 * Importe + fecha en 2 cuadros (como honorarios).
 * Si hay varios conceptos, lista corta debajo sin repetir fechas.
 */
function htmlBloqueDesglose(
  lineas: LineaConceptoCorreo[],
  totalFmt: string,
  registro?: RegistroCumplimiento
): string {
  if (lineas.length === 0) return "";
  const vence = venceUnicoFmt(lineas, registro) ?? "—";
  const duo = duoMontoFechaCorreoHtml({
    labelMonto: "Total a pagar",
    monto: totalFmt,
    labelFecha: "Fecha límite",
    fecha: vence,
    familia: "cumplimiento",
  });
  if (lineas.length <= 1) return duo;
  const filas = lineas
    .map((l, i) => filaHtmlConcepto(l, i === lineas.length - 1))
    .join("");
  return `${duo}${cardCorreoHtml(
    `<p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:${CORREO_UI.mute};font-weight:800;">Desglose</p>
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${filas}</table>`,
    "cumplimiento"
  )}`;
}

/**
 * Tipos estratégicos de cumplimiento:
 * - listo: impuestos + PDFs (declaración / impuestos)
 * - pre_limite: faltan pocos días para la fecha límite
 * - cerrado / sin_pago: mes cerrado, sin pendientes
 * - recordatorio_limite: plazo vencido (solo con PDFs)
 * - previo: legado → mismo contenido que listo (ya no “confirma importe”)
 */
export type TipoCorreoCumplimiento =
  | "listo"
  | "pre_limite"
  | "cerrado"
  | "sin_pago"
  | "recordatorio_limite"
  | "previo";

/** Pasos de la barra (escalación + cierre). `sin_pago` cuenta como cerrado. */
export type TipoPasoCorreoCumplimiento =
  | "listo"
  | "pre_limite"
  | "recordatorio_limite"
  | "cerrado";

export const PASOS_CORREO_CUMPLIMIENTO: TipoPasoCorreoCumplimiento[] = [
  "listo",
  "pre_limite",
  "recordatorio_limite",
  "cerrado",
];

export const CORREO_CUMPLIMIENTO_BOTON_LABEL: Record<
  TipoPasoCorreoCumplimiento,
  string
> = {
  listo: "Listo",
  pre_limite: "Pre-límite",
  recordatorio_limite: "Plazo",
  cerrado: "Cerrado",
};

/** Días antes del límite SAT para el pre-aviso de impuestos. */
export const DIAS_PRE_LIMITE_IMPUESTOS = 5;

export function normalizarPasoCorreoCumplimiento(
  tipo: TipoCorreoCumplimiento | undefined | null
): TipoPasoCorreoCumplimiento | null {
  if (!tipo) return null;
  if (tipo === "sin_pago" || tipo === "cerrado") return "cerrado";
  if (tipo === "previo") return "listo";
  if (
    tipo === "listo" ||
    tipo === "pre_limite" ||
    tipo === "recordatorio_limite"
  ) {
    return tipo;
  }
  return null;
}

export function indicePasoCorreoCumplimiento(
  tipo: TipoCorreoCumplimiento | TipoPasoCorreoCumplimiento | undefined | null
): number {
  const paso = normalizarPasoCorreoCumplimiento(
    tipo as TipoCorreoCumplimiento | null
  );
  if (!paso) return -1;
  return PASOS_CORREO_CUMPLIMIENTO.indexOf(paso);
}

/** 0 = nada · 1 = listo · 2 = pre-límite · 3 = plazo · 4 = cerrado. */
export function posicionCorreoCumplimiento(
  ultima?: { tipo: TipoCorreoCumplimiento } | null,
  reg?: {
    notificadoEn?: string;
    preLimiteEnviadoEn?: string;
    recordatorioLimiteEnviadoEn?: string;
    ultimoCorreoTipo?: TipoCorreoCumplimiento;
  } | null
): number {
  if (ultima?.tipo) {
    const i = indicePasoCorreoCumplimiento(ultima.tipo);
    return i < 0 ? 0 : i + 1;
  }
  if (reg?.ultimoCorreoTipo) {
    const i = indicePasoCorreoCumplimiento(reg.ultimoCorreoTipo);
    return i < 0 ? 0 : i + 1;
  }
  if (reg?.recordatorioLimiteEnviadoEn) return 3;
  if (reg?.preLimiteEnviadoEn) return 2;
  if (reg?.notificadoEn) return 1;
  return 0;
}

export function siguientePasoCorreoCumplimiento(
  ultima?: { tipo: TipoCorreoCumplimiento } | null,
  reg?: {
    notificadoEn?: string;
    preLimiteEnviadoEn?: string;
    recordatorioLimiteEnviadoEn?: string;
    ultimoCorreoTipo?: TipoCorreoCumplimiento;
  } | null
): TipoPasoCorreoCumplimiento | null {
  const pos = posicionCorreoCumplimiento(ultima, reg);
  return pos >= PASOS_CORREO_CUMPLIMIENTO.length
    ? null
    : PASOS_CORREO_CUMPLIMIENTO[pos];
}

type AdjuntoStorage = {
  destino: "cumplimiento";
  path: string;
  filename: string;
};

function adjuntoDeDoc(
  doc: DocumentoHacienda | undefined,
  filenameFallback: string
): AdjuntoStorage | null {
  if (!doc?.storagePath) return null;
  return {
    destino: "cumplimiento",
    path: doc.storagePath,
    filename: doc.nombreArchivo || filenameFallback,
  };
}

/** Adjuntos declaración + impuestos (línea de captura) cuando existen en Storage. */
export function adjuntosPdfCumplimiento(
  registro: RegistroCumplimiento
): AdjuntoStorage[] {
  const out: AdjuntoStorage[] = [];
  const dec = adjuntoDeDoc(
    getDocumentoSingular(registro, "declaracion"),
    "declaracion.pdf"
  );
  const imp = adjuntoDeDoc(
    getDocumentoSingular(registro, "impuestos"),
    "impuestos.pdf"
  );
  if (dec) out.push(dec);
  if (imp) out.push(imp);
  return out;
}

async function enviarCorreoHtmlResend(
  to: string,
  subject: string,
  html: string,
  text?: string,
  storageAttachments?: CorreoCumplimiento["storageAttachments"]
): Promise<ResultadoEnvioResend> {
  const correoCliente = to.trim();
  if (!correoCliente) {
    return { ok: false, error: "El cliente no tiene correo registrado." };
  }
  try {
    const res = await fetch("/api/admin/correo/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: correoCliente,
        subject,
        html,
        text,
        ...(storageAttachments?.length
          ? { storageAttachments }
          : {}),
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
          `Error ${res.status} al enviar el correo. Revisa Resend y el dominio verificado.`,
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

async function copiarCorreoAlPortapapeles(
  texto: string,
  html: string
): Promise<void> {
  try {
    if (typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([texto], { type: "text/plain" }),
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(texto);
    }
  } catch {
    await navigator.clipboard.writeText(texto);
  }
}

/** Mail 2 — mes cerrado / todo en orden (también sin impuestos a pagar). */
export function buildCorreoMesCerrado(
  client: Cliente,
  periodo: Periodo,
  baseUrl?: string,
  opts?: { sinImpuestos?: boolean }
): CorreoCumplimiento {
  const portalUrl = getPortalCumplimientoUrl(client.id, baseUrl);
  const periodoTxt = periodoLabel(periodo);
  const razon = client.razonSocial;
  const sinImpuestos = opts?.sinImpuestos === true;
  const subject = `${DESPACHO_NOMBRE} · Mes cerrado · ${periodoTxt}`;

  const texto = [
    `Hola, ${razon},`,
    "",
    `El cierre de ${periodoTxt} ya quedó en orden.`,
    sinImpuestos
      ? "En este periodo no hubo impuestos a pagar. Tu declaración quedó presentada y al corriente."
      : "No tienes pendientes de este mes con nosotros. Ya estamos listos para el siguiente cierre mensual.",
    "",
    `Puedes consultar todo en tu portal: ${portalUrl}`,
    firmaCorreoTexto({ horario: true }),
  ].join("\n");

  const cuerpo = `
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#334155;">Hola, <strong>${razon}</strong>,</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:${CORREO_UI.mute};">El cierre de <strong>${periodoTxt}</strong> ya quedó en orden.</p>
${cardCorreoHtml(
  `<table role="presentation" cellspacing="0" cellpadding="0"><tr>
<td valign="middle" style="width:44px;padding-right:14px;">
<div style="width:36px;height:36px;border-radius:50%;background:#d1fae5;text-align:center;line-height:36px;color:#059669;font-size:18px;font-weight:800;">✓</div>
</td>
<td valign="middle">${
    sinImpuestos
      ? `<p style="margin:0;font-size:14px;line-height:1.5;color:${CORREO_UI.navy};font-weight:700;">Sin impuestos a pagar</p><p style="margin:4px 0 0;font-size:13px;line-height:1.45;color:${CORREO_UI.mute};">Tu declaración quedó presentada. Estás al corriente.</p>`
      : `<p style="margin:0;font-size:14px;line-height:1.5;color:${CORREO_UI.navy};font-weight:700;">Sin pendientes</p><p style="margin:4px 0 0;font-size:13px;line-height:1.45;color:${CORREO_UI.mute};">Todo listo para el siguiente cierre mensual.</p>`
  }</td>
</tr></table>`,
  "cumplimiento"
)}
${ctaCorreoHtml(portalUrl, "Ver en mi portal", "cumplimiento")}
<p style="margin:0 0 8px;font-size:12px;line-height:1.45;color:#94a3b8;">Enlace: <a href="${portalUrl}" style="color:${CORREO_UI.navy};">${portalUrl}</a></p>`;

  const html = armarCorreoHtml({
    encabezado: {
      color: "#059669",
      titulo: "Mes cerrado",
      descripcion: sinImpuestos
        ? `${periodoTxt} · al corriente, sin impuestos a pagar`
        : `${periodoTxt} · sin pendientes · listos para el siguiente cierre`,
      familia: "cumplimiento",
    },
    cuerpoHtml: cuerpo,
  });

  return { subject, texto, html, portalUrl };
}

/** @deprecated Alias de buildCorreoMesCerrado (sin impuestos). */
export function buildCorreoSinPagoImpuestos(
  client: Cliente,
  periodo: Periodo,
  baseUrl?: string
): CorreoCumplimiento {
  return buildCorreoMesCerrado(client, periodo, baseUrl, { sinImpuestos: true });
}

export async function abrirCorreoSinPagoImpuestos(
  client: Cliente,
  periodo: Periodo,
  baseUrl?: string
): Promise<boolean> {
  if (!client.email?.trim() || !isValidEmail(client.email)) return false;
  const { subject, texto, html } = buildCorreoSinPagoImpuestos(
    client,
    periodo,
    baseUrl
  );
  return abrirCorreoConFormato({
    to: client.email.trim(),
    subject,
    texto,
    html,
  });
}

export async function enviarCorreoSinPagoImpuestosResend(
  client: Cliente,
  periodo: Periodo,
  baseUrl?: string
): Promise<ResultadoEnvioResend> {
  if (!client.email?.trim() || !isValidEmail(client.email)) {
    return { ok: false, error: "El cliente no tiene correo válido." };
  }
  const { subject, html, texto } = buildCorreoSinPagoImpuestos(
    client,
    periodo,
    baseUrl
  );
  return enviarCorreoHtmlResend(client.email.trim(), subject, html, texto);
}

export async function copiarCorreoSinPagoHtml(
  client: Cliente,
  periodo: Periodo,
  baseUrl?: string
): Promise<void> {
  const { texto, html } = buildCorreoSinPagoImpuestos(client, periodo, baseUrl);
  await copiarCorreoAlPortapapeles(texto, html);
}

export async function abrirCorreoConFormato(opts: {
  to: string;
  subject: string;
  texto: string;
  html: string;
}): Promise<boolean> {
  try {
    await copiarCorreoAlPortapapeles(opts.texto, opts.html);
  } catch {
    await navigator.clipboard.writeText(opts.texto);
  }
  abrirBorradorCorreo({ to: opts.to, subject: opts.subject, body: opts.texto });
  return true;
}

/** Encabezado del correo “listo” según la obligación, no el concepto (ISR/IVA). */
export function encabezadoCorreoListo(categorias: CategoriaId[]): string {
  if (categorias.length === 1 && categorias[0] === "imss") return "Línea de captura lista";
  if (categorias.length === 1 && categorias[0] === "estatales") return "Línea de captura lista";
  if (categorias.length > 0 && categorias.every((c) => c === "imss" || c === "estatales")) {
    return "Línea de captura lista";
  }
  return "Impuestos listos";
}

/** Mail 1 — impuestos listos + desglose; PDFs van adjuntos al enviar. */
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
  const montoFmt = totalLineasDetalle(lineas);
  const tituloCorreo = encabezadoCorreoListo(categorias);
  const subject = `${DESPACHO_NOMBRE} · ${tituloCorreo} · ${periodoTxt}`;
  const adjuntos = adjuntosPdfCumplimiento(registro);
  const notaPdf =
    adjuntos.length > 0
      ? "PDFs adjuntos. También en tu portal."
      : "Ya puedes descargarlos y revisarlos en tu portal.";

  const texto = [
    `Hola, ${razon},`,
    "",
    `Impuestos de ${periodoTxt}: listos.`,
    "",
    notaPdf,
    "",
    `Total a pagar: ${montoFmt}`,
    bloqueTextoLineas(lineas, registro),
    "",
    `Portal: ${portalUrl}`,
    firmaCorreoTexto({ horario: true }),
  ].join("\n");

  const cuerpo = `
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#334155;">Hola, <strong>${razon}</strong>,</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:${CORREO_UI.mute};">Ya puedes descargar y revisar tus impuestos de <strong>${periodoTxt}</strong> en tu portal.</p>
${htmlBloqueDesglose(lineas, montoFmt, registro)}
${adjuntos.length > 0 ? `<p style="margin:0 0 16px;font-size:11px;line-height:1.4;color:#94a3b8;">${notaPdf}</p>` : ""}
${ctaCorreoHtml(portalUrl, "Abrir mi portal", "cumplimiento")}
<p style="margin:0 0 8px;font-size:12px;line-height:1.45;color:#94a3b8;">Enlace: <a href="${portalUrl}" style="color:${CORREO_UI.navy};">${portalUrl}</a></p>`;

  const html = armarCorreoHtml({
    encabezado: {
      color: CORREO_UI.navy,
      titulo: tituloCorreo,
      descripcion: `${periodoTxt} · listos para pagar`,
      familia: "cumplimiento",
    },
    cuerpoHtml: cuerpo,
  });

  return {
    subject,
    texto,
    html,
    portalUrl,
    storageAttachments: adjuntos.length ? adjuntos : undefined,
  };
}

/** @deprecated El preliminar ya no se usa: mismo contenido que “Impuestos listos”. */
export function buildCorreoImpuestosCalculados(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): CorreoCumplimiento {
  return buildCorreoCumplimientoListo(client, periodo, registro, baseUrl);
}

function diasHastaLimiteIso(iso: string | undefined, fechaRef = new Date()): number | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return null;
  const limite = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const hoy = new Date(
    fechaRef.getFullYear(),
    fechaRef.getMonth(),
    fechaRef.getDate()
  );
  return Math.round((limite.getTime() - hoy.getTime()) / 86_400_000);
}

/** Mail — faltan pocos días para la fecha límite de impuestos. */
export function buildCorreoPreLimite(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): CorreoCumplimiento {
  const portalUrl = getPortalCumplimientoUrl(client.id, baseUrl);
  const periodoTxt = periodoLabel(periodo);
  const lineas = lineasDetallePrevioCorreo(registro);
  const montoFmt = totalLineasDetalle(lineas);
  const limiteIso = registro.fechaLimite;
  const limiteCorta = limiteIso
    ? formatFechaCorreoDesdeIso(limiteIso)
    : "—";
  const dias = diasHastaLimiteIso(limiteIso);
  const diasTxt =
    dias == null
      ? "pronto"
      : dias <= 0
        ? "hoy"
        : dias === 1
          ? "mañana"
          : `en ${dias} días`;
  const razon = client.razonSocial;
  const subject = `${DESPACHO_NOMBRE} · Pronto vence · ${periodoTxt}`;

  const texto = [
    `Hola, ${razon},`,
    "",
    `La fecha límite de tus impuestos de ${periodoTxt} es ${diasTxt} (${limiteCorta}).`,
    "",
    `Total: ${montoFmt}`,
    "",
    "Si aún no pagas, hazlo antes del vencimiento. Si ya pagaste, sube el comprobante a tu portal.",
    "",
    `Portal: ${portalUrl}`,
    firmaCorreoTexto({ horario: true }),
  ].join("\n");

  const cuerpo = `
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#334155;">Hola, <strong>${razon}</strong>,</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:${CORREO_UI.mute};">La fecha límite de <strong>${periodoTxt}</strong> es <strong>${diasTxt}</strong>.</p>
${duoMontoFechaCorreoHtml({
  labelMonto: "Total a pagar",
  monto: montoFmt,
  labelFecha: "Fecha límite",
  fecha: limiteCorta,
  familia: "cumplimiento",
})}
<p style="margin:0 0 18px;font-size:14px;line-height:1.55;color:#334155;">Si aún no pagas, hazlo antes del vencimiento. Si ya pagaste, sube el comprobante a tu portal.</p>
${ctaCorreoHtml(portalUrl, "Abrir mi portal", "cumplimiento")}
<p style="margin:0 0 8px;font-size:12px;line-height:1.45;color:#94a3b8;">Enlace: <a href="${portalUrl}" style="color:${CORREO_UI.navy};">${portalUrl}</a></p>`;

  const html = armarCorreoHtml({
    encabezado: {
      color: CORREO_UI.violeta,
      titulo: "Pronto vence",
      descripcion: `${periodoTxt} · fecha límite ${limiteCorta}`,
      familia: "cumplimiento",
    },
    cuerpoHtml: cuerpo,
  });

  return { subject, texto, html, portalUrl };
}

/** Mail 3 — plazo vencido; solo tiene sentido si ya hay PDFs. */
export function buildCorreoRecordatorioLimite(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): CorreoCumplimiento {
  const portalUrl = getPortalCumplimientoUrl(client.id, baseUrl);
  const periodoTxt = periodoLabel(periodo);
  const lineas = lineasDetallePrevioCorreo(registro);
  const montoFmt = totalLineasDetalle(lineas);
  const limiteLarga = formatFechaLimiteImpuesto(registro.fechaLimite);
  const limiteCorta = registro.fechaLimite
    ? formatFechaCorreoDesdeIso(registro.fechaLimite)
    : limiteLarga;
  const razon = client.razonSocial;
  const subject = `${DESPACHO_NOMBRE} · Plazo vencido · ${periodoTxt}`;

  const texto = [
    `Hola, ${razon},`,
    "",
    `La fecha límite de tus impuestos de ${periodoTxt} (${limiteLarga}) ya pasó.`,
    "",
    `Total: ${montoFmt}`,
    "",
    "Si ya pagaste, sube el comprobante a tu portal para validarlo. Si aún no, ponte al corriente lo antes posible.",
    "",
    `Portal: ${portalUrl}`,
    firmaCorreoTexto({ horario: true }),
  ].join("\n");

  const cuerpo = `
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#334155;">Hola, <strong>${razon}</strong>,</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:${CORREO_UI.mute};">La fecha límite de <strong>${periodoTxt}</strong> ya pasó.</p>
${duoMontoFechaCorreoHtml({
  labelMonto: "Total a pagar",
  monto: montoFmt,
  labelFecha: "Venció",
  fecha: limiteCorta,
  familia: "cumplimiento",
})}
<p style="margin:0 0 18px;font-size:14px;line-height:1.55;color:#334155;">Si ya pagaste, sube el comprobante a tu portal para validarlo. Si aún no, ponte al corriente lo antes posible.</p>
${ctaCorreoHtml(portalUrl, "Subir comprobante", "cumplimiento")}
<p style="margin:0 0 8px;font-size:12px;line-height:1.45;color:#94a3b8;">Enlace: <a href="${portalUrl}" style="color:${CORREO_UI.navy};">${portalUrl}</a></p>`;

  const html = armarCorreoHtml({
    encabezado: {
      color: "#991b1b",
      titulo: "Plazo vencido",
      descripcion: `${periodoTxt} · sube tu comprobante o ponte al corriente`,
      familia: "cumplimiento",
    },
    cuerpoHtml: cuerpo,
  });

  return { subject, texto, html, portalUrl };
}

/** ¿Hay PDFs suficientes para avisar plazo vencido? */
export function puedeCorreoPlazoVencido(
  reg: RegistroCumplimiento | undefined
): boolean {
  return documentosFiscalesCompletos(reg);
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
  await copiarCorreoAlPortapapeles(texto, html);
}

export async function copiarCorreoImpuestosCalculadosHtml(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): Promise<void> {
  const { texto, html } = buildCorreoImpuestosCalculados(
    client,
    periodo,
    registro,
    baseUrl
  );
  await copiarCorreoAlPortapapeles(texto, html);
}

export async function copiarCorreoRecordatorioLimiteHtml(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): Promise<void> {
  const { texto, html } = buildCorreoRecordatorioLimite(
    client,
    periodo,
    registro,
    baseUrl
  );
  await copiarCorreoAlPortapapeles(texto, html);
}

export async function copiarCorreoPreLimiteHtml(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): Promise<void> {
  const { texto, html } = buildCorreoPreLimite(
    client,
    periodo,
    registro,
    baseUrl
  );
  await copiarCorreoAlPortapapeles(texto, html);
}

export async function enviarCorreoCumplimientoListoResend(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string,
  opts?: OpcionesCorreoCumplimientoListo
): Promise<ResultadoEnvioResend> {
  if (!client.email?.trim() || !isValidEmail(client.email)) {
    return { ok: false, error: "El cliente no tiene correo válido." };
  }
  const { subject, html, texto, storageAttachments } =
    buildCorreoCumplimientoListo(client, periodo, registro, baseUrl, opts);
  return enviarCorreoHtmlResend(
    client.email.trim(),
    subject,
    html,
    texto,
    storageAttachments
  );
}

export async function enviarCorreoImpuestosCalculadosResend(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): Promise<ResultadoEnvioResend> {
  return enviarCorreoCumplimientoListoResend(
    client,
    periodo,
    registro,
    baseUrl
  );
}

export async function enviarCorreoRecordatorioLimiteResend(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): Promise<ResultadoEnvioResend> {
  if (!client.email?.trim() || !isValidEmail(client.email)) {
    return { ok: false, error: "El cliente no tiene correo válido." };
  }
  if (!puedeCorreoPlazoVencido(registro)) {
    return {
      ok: false,
      error: "Sube declaración e impuestos (PDFs) antes de avisar el plazo.",
    };
  }
  const { subject, html, texto } = buildCorreoRecordatorioLimite(
    client,
    periodo,
    registro,
    baseUrl
  );
  return enviarCorreoHtmlResend(client.email.trim(), subject, html, texto);
}

export async function enviarCorreoPreLimiteResend(
  client: Cliente,
  periodo: Periodo,
  registro: RegistroCumplimiento,
  baseUrl?: string
): Promise<ResultadoEnvioResend> {
  if (!client.email?.trim() || !isValidEmail(client.email)) {
    return { ok: false, error: "El cliente no tiene correo válido." };
  }
  if (!puedeCorreoPlazoVencido(registro)) {
    return {
      ok: false,
      error: "Sube declaración e impuestos (PDFs) antes del pre-aviso.",
    };
  }
  const { subject, html, texto } = buildCorreoPreLimite(
    client,
    periodo,
    registro,
    baseUrl
  );
  return enviarCorreoHtmlResend(client.email.trim(), subject, html, texto);
}

export async function enviarCorreoMesCerradoResend(
  client: Cliente,
  periodo: Periodo,
  baseUrl?: string,
  opts?: { sinImpuestos?: boolean }
): Promise<ResultadoEnvioResend> {
  if (!client.email?.trim() || !isValidEmail(client.email)) {
    return { ok: false, error: "El cliente no tiene correo válido." };
  }
  const { subject, html, texto } = buildCorreoMesCerrado(
    client,
    periodo,
    baseUrl,
    opts
  );
  return enviarCorreoHtmlResend(client.email.trim(), subject, html, texto);
}

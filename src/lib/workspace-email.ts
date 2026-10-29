/**
 * Envío manual vía Google Workspace (Gmail en el navegador).
 * Inicia sesión en Gmail con cp.aaronr@rdcontadores.com; el borrador usará esa cuenta.
 */

export const DESPACHO_NOMBRE =
  process.env.NEXT_PUBLIC_DESPACHO_NOMBRE ?? "RDC Contadores";

export const DESPACHO_EMAIL =
  process.env.NEXT_PUBLIC_DESPACHO_EMAIL ?? "cp.aaronr@rdcontadores.com";

export const DESPACHO_SITIO =
  process.env.NEXT_PUBLIC_DESPACHO_SITIO ?? "https://www.rdcontadores.com";

/**
 * Base pública para imágenes de los correos (logo y redes). Debe ser una URL
 * absoluta y accesible sin autenticación: los clientes de correo no cargan
 * rutas relativas. El sitio público sirve `/logos/...`.
 */
export const EMAIL_ASSET_BASE =
  process.env.NEXT_PUBLIC_DESPACHO_SITIO ?? "https://www.rdcontadores.com";

/**
 * Mensaje pre-escrito que se abre al tocar el icono de WhatsApp en un correo,
 * para que el cliente arranque la conversación con contexto.
 */
export const WHATSAPP_MENSAJE_CORREO =
  "Hola Contador, tengo una duda respecto al correo que me llegó.";

/** Link de WhatsApp con el mensaje pre-escrito ya cargado. */
export const WHATSAPP_URL_CORREO = `https://wa.me/523322032992?text=${encodeURIComponent(
  WHATSAPP_MENSAJE_CORREO
)}`;

/** Redes sociales del despacho que se muestran en el pie de los correos. */
export const REDES_CORREO = [
  {
    nombre: "WhatsApp",
    archivo: "whatsapp",
    url: WHATSAPP_URL_CORREO,
  },
  {
    nombre: "Instagram",
    archivo: "instagram",
    url: "https://www.instagram.com/rdccontadores/",
  },
  {
    nombre: "Facebook",
    archivo: "facebook",
    url: "https://www.facebook.com/rd.contadores.mx/",
  },
  {
    nombre: "YouTube",
    archivo: "youtube",
    url: "https://www.youtube.com/@rdccontadores",
  },
] as const;

/** Persona que firma los correos (contexto humano). */
export const DESPACHO_FIRMANTE =
  process.env.NEXT_PUBLIC_DESPACHO_FIRMANTE ?? "Aaron Rosales";
export const DESPACHO_FIRMANTE_ROL = "Contador";
export const DESPACHO_HORARIO =
  "Horario comercial · Lunes a Viernes 9:00 – 17:00";
/** Alias corto para la firma (misma franja). */
export const DESPACHO_HORARIO_CORTO = "Lun–Vie 9:00 – 17:00";

/**
 * Tokens del rediseño:
 * - bg gris suave (alrededor del mail)
 * - paper = plantilla blanca
 * - soft = cuadros grises encima
 */
export const CORREO_UI = {
  bg: "#f2f2f7",
  paper: "#ffffff",
  navy: "#0f1d2e",
  mute: "#64748b",
  line: "#e2e8f0",
  soft: "#f8fafc",
  /** Acento de marca (headers claros / avisos). */
  naranja: "#fdb203",
  /** Header adeudo: rojo brillante + tipografía negra (no pastel). */
  rojoBrillante: "#ef4444",
  /** Header pago validado: lima de referencia + tipografía negra. */
  verdeValidado: "#d8fa51",
  /** Violeta popular del sitio (`marca-acento` / portal-purple). */
  violeta: "#7c3aed",
  /** Lienzo “cine” del sitio público. */
  cine: "#f6f6f6",
} as const;

const MES_CORTO_CORREO = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
] as const;

/** Formato portal / honorarios: «10 OCT 2026». */
export function formatFechaCorreoDiaMesAnio(
  dia: number,
  mes0: number,
  anio: number
): string {
  const m = MES_CORTO_CORREO[Math.max(0, Math.min(11, mes0))] ?? "—";
  return `${dia} ${m} ${anio}`;
}

/** ISO YYYY-MM-DD → «17 OCT 2026». */
export function formatFechaCorreoDesdeIso(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return iso;
  return formatFechaCorreoDiaMesAnio(
    Number(m[3]),
    Number(m[2]) - 1,
    Number(m[1])
  );
}

function dominioDespacho(): string {
  return DESPACHO_SITIO.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export type FamiliaCorreo = "cumplimiento" | "cobranza";

export type EncabezadoCorreo = {
  /** Color sólido o gradient CSS del header. */
  color: string;
  titulo: string;
  /** Una línea corta bajo el título (qué está pasando). */
  descripcion?: string;
  /**
   * `claro` = fondo claro (p. ej. naranja marca): tipografía navy + logo negro.
   * Default oscuro: tipografía blanca + logo blanco.
   */
  variante?: "oscuro" | "claro";
  /** Separa visualmente impuestos vs honorarios. */
  familia?: FamiliaCorreo;
};

function familiaLabel(familia?: FamiliaCorreo): string {
  return familia === "cobranza" ? "Honorarios" : "Cumplimiento";
}

/**
 * Shell HTML: plantilla blanca, cuadros planos grises (sin relieve).
 * Etiqueta de familia bajo el logo a la derecha.
 * Títulos en mayúsculas.
 */
export function armarCorreoHtml(opts: {
  encabezado: EncabezadoCorreo;
  cuerpoHtml: string;
  /** Pie legal corto bajo la firma (opcional). */
  pieLegal?: string;
}): string {
  const familia = opts.encabezado.familia ?? "cumplimiento";
  const claro = opts.encabezado.variante === "claro";
  const colorTitulo = claro ? CORREO_UI.navy : "#ffffff";
  const colorMeta = claro
    ? "rgba(15,29,46,0.55)"
    : "rgba(255,255,255,0.7)";
  const colorDesc = claro
    ? "rgba(15,29,46,0.75)"
    : "rgba(255,255,255,0.88)";
  const logo = claro
    ? logoCorreoNegroHtml({ align: "right" })
    : logoCorreoHtml({ align: "right" });
  const radius = familia === "cobranza" ? "20px" : "12px";
  const titulo = opts.encabezado.titulo.toLocaleUpperCase("es-MX");
  const etiquetaFam = familiaLabel(familia);
  const desc = opts.encabezado.descripcion
    ? `<p style="margin:10px 0 0;font-size:13px;line-height:1.45;color:${colorDesc};">${opts.encabezado.descripcion}</p>`
    : "";
  const pie = opts.pieLegal
    ? `<tr><td style="padding:14px 28px 22px;background:${CORREO_UI.paper};border-top:1px solid ${CORREO_UI.line};">
        <p style="margin:0;font-size:11px;line-height:1.5;color:#94a3b8;text-align:center;">${opts.pieLegal}</p>
      </td></tr>`
    : "";

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:${CORREO_UI.bg};font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${CORREO_UI.navy};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${CORREO_UI.bg};"><tr><td style="padding:28px 14px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:${CORREO_UI.paper};border-radius:${radius};overflow:hidden;border:1px solid ${CORREO_UI.line};">
<tr><td style="padding:22px 24px 20px;background:${opts.encabezado.color};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
<td valign="top" style="padding-right:16px;">
<p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${colorMeta};font-weight:700;">${DESPACHO_NOMBRE}</p>
<h1 style="margin:10px 0 0;font-size:20px;line-height:1.2;color:${colorTitulo};font-weight:800;letter-spacing:0.04em;text-transform:uppercase;">${titulo}</h1>
${desc}
</td>
<td valign="top" align="right" style="width:72px;white-space:nowrap;">
${logo}
<p style="margin:8px 0 0;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:${colorMeta};font-weight:800;text-align:right;line-height:1.2;">${etiquetaFam}</p>
</td>
</tr></table>
</td></tr>
<tr><td style="padding:26px 28px 8px;background:${CORREO_UI.paper};">
${opts.cuerpoHtml}
</td></tr>
<tr><td style="padding:4px 28px 22px;background:${CORREO_UI.paper};">
${firmaHtmlCorreo({ horario: familia === "cumplimiento" })}
</td></tr>
${pie}
</table>
</td></tr></table>
</body></html>`;
}

/** Cuadro gris plano sobre plantilla blanca (sin relieve / franja). */
export function cardCorreoHtml(
  inner: string,
  familia: FamiliaCorreo = "cumplimiento"
): string {
  const radius = familia === "cobranza" ? "16px" : "10px";
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:${CORREO_UI.soft};border-radius:${radius};border:1px solid ${CORREO_UI.line};"><tr><td style="padding:18px 20px;">${inner}</td></tr></table>`;
}

/** Dos cuadros planos: importe | fecha límite. */
export function duoMontoFechaCorreoHtml(opts: {
  labelMonto: string;
  monto: string;
  labelFecha: string;
  fecha: string;
  familia?: FamiliaCorreo;
}): string {
  const familia = opts.familia ?? "cumplimiento";
  const radius = familia === "cobranza" ? "16px" : "10px";
  const mini = (label: string, value: string) =>
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${CORREO_UI.soft};border-radius:${radius};border:1px solid ${CORREO_UI.line};"><tr><td style="padding:16px 18px;"><p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:${CORREO_UI.mute};font-weight:800;">${label}</p><p style="margin:0;font-size:22px;font-weight:800;color:${CORREO_UI.navy};letter-spacing:-0.02em;">${value}</p></td></tr></table>`;
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;"><tr>
<td width="50%" valign="top" style="padding-right:6px;">${mini(opts.labelMonto, opts.monto)}</td>
<td width="50%" valign="top" style="padding-left:6px;">${mini(opts.labelFecha, opts.fecha)}</td>
</tr></table>`;
}

/** CTA principal navy (pill en cobranza, angular en cumplimiento). */
export function ctaCorreoHtml(
  href: string,
  label: string,
  familia: FamiliaCorreo = "cumplimiento"
): string {
  const radius = familia === "cobranza" ? "999px" : "8px";
  return `<p style="margin:0 0 18px;text-align:center;"><a href="${href}" style="display:inline-block;padding:14px 28px;background:${CORREO_UI.navy};color:#ffffff;font-size:12px;font-weight:800;text-decoration:none;border-radius:${radius};letter-spacing:0.06em;text-transform:uppercase;">${label}</a></p>`;
}

/**
 * Logo del despacho (RDC) en blanco, para encabezados oscuros.
 */
export function logoCorreoHtml(opts?: { align?: "left" | "right" | "center" }): string {
  const align =
    opts?.align === "right"
      ? "margin:0 0 0 auto;display:block;"
      : opts?.align === "center"
        ? "margin:0 auto 12px;display:block;"
        : "margin:0 0 12px;display:inline-block;";
  return `<img src="${EMAIL_ASSET_BASE}/logos/rdc-white.png" alt="${DESPACHO_NOMBRE}" height="32" style="height:32px;width:auto;${align}border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />`;
}

/** Logo gris para fondos claros (recibos, facturas). */
export function logoCorreoGrisHtml(opts?: {
  align?: "left" | "right" | "center";
}): string {
  const align =
    opts?.align === "right"
      ? "margin:0 0 0 auto;display:block;"
      : opts?.align === "left"
        ? "margin:0;display:inline-block;"
        : "margin:0 auto;display:block;";
  return `<img src="${EMAIL_ASSET_BASE}/logos/rdc-gray.png?v=3" alt="${DESPACHO_NOMBRE}" height="28" style="height:28px;width:auto;${align}border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />`;
}

/** Logo negro para headers claros con tipografía navy (p. ej. naranja marca). */
export function logoCorreoNegroHtml(opts?: {
  align?: "left" | "right" | "center";
}): string {
  const align =
    opts?.align === "right"
      ? "margin:0 0 0 auto;display:block;"
      : opts?.align === "left"
        ? "margin:0;display:inline-block;"
        : "margin:0 auto;display:block;";
  return `<img src="${EMAIL_ASSET_BASE}/logos/rdc-black.png" alt="${DESPACHO_NOMBRE}" height="28" style="height:28px;width:auto;${align}border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />`;
}

/**
 * Bloque de redes sociales (mismas que el footer del sitio + YouTube), con
 * iconos en PNG porque el SVG inline no es confiable en clientes de correo.
 * Pensado para ir debajo de la firma en todos los correos.
 */
export function redesCorreoHtml(): string {
  const iconos = REDES_CORREO.map(
    (r) =>
      `<td style="padding:0 7px;"><a href="${r.url}" target="_blank" style="text-decoration:none;"><img src="${EMAIL_ASSET_BASE}/logos/redes/${r.archivo}.png" alt="${r.nombre}" width="24" height="24" style="display:block;width:24px;height:24px;border:0;outline:none;text-decoration:none;" /></a></td>`
  ).join("");

  /* Línea inset (no toca bordes del recuadro). */
  return `
              <table role="presentation" cellspacing="0" cellpadding="0" align="left" style="margin:18px 0 0;width:100%;">
                <tr><td style="padding:16px 4px 0;">
                  <div style="border-top:1px solid ${CORREO_UI.line};padding-top:14px;">
                    <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;font-weight:bold;">Síguenos</p>
                    <table role="presentation" cellspacing="0" cellpadding="0"><tr>${iconos}</tr></table>
                  </div>
                </td></tr>
              </table>`;
}

export type OpcionesFirmaCorreo = {
  cierre?: string;
  /** Horario comercial — solo mails de cumplimiento. */
  horario?: boolean;
  /** Bloque “Síguenos” — off en operativos (cobranza / cumplimiento). */
  redes?: boolean;
};

function normalizarOpcionesFirma(
  cierreOrOpts: string | OpcionesFirmaCorreo = "Atentamente,"
): Required<Pick<OpcionesFirmaCorreo, "cierre" | "horario" | "redes">> {
  if (typeof cierreOrOpts === "string") {
    return { cierre: cierreOrOpts, horario: false, redes: false };
  }
  return {
    cierre: cierreOrOpts.cierre ?? "Atentamente,",
    horario: cierreOrOpts.horario === true,
    redes: cierreOrOpts.redes === true,
  };
}

/** Firma corta en texto plano (para borradores Gmail / fallback). */
export function firmaCorreoTexto(
  cierreOrOpts: string | OpcionesFirmaCorreo = "Atentamente,"
): string {
  const { cierre, horario } = normalizarOpcionesFirma(cierreOrOpts);
  const lineas = [
    "",
    cierre,
    DESPACHO_FIRMANTE,
    DESPACHO_FIRMANTE_ROL,
    `${DESPACHO_EMAIL} · ${dominioDespacho()}`,
  ];
  if (horario) lineas.push(DESPACHO_HORARIO);
  return lineas.join("\n");
}

/**
 * Firma corta HTML: cierre + nombre + rol + email · sitio.
 * Horario solo si `horario: true` (cumplimiento). Sin redes por defecto.
 */
export function firmaHtmlCorreo(
  cierreOrOpts: string | OpcionesFirmaCorreo = "Atentamente,"
): string {
  const { cierre, horario, redes } = normalizarOpcionesFirma(cierreOrOpts);
  const lineaHorario = horario
    ? `<p style="margin:8px 0 0;font-size:12px;line-height:1.45;color:#94a3b8;">${DESPACHO_HORARIO}</p>`
    : "";
  const bloqueRedes = redes ? redesCorreoHtml() : "";
  return `
              <p style="margin:22px 0 0;font-size:14px;line-height:1.5;color:#334155;">${cierre}</p>
              <p style="margin:4px 0 0;font-size:15px;line-height:1.4;color:${CORREO_UI.navy};font-weight:800;">${DESPACHO_FIRMANTE}</p>
              <p style="margin:2px 0 0;font-size:13px;line-height:1.4;color:#475569;">${DESPACHO_FIRMANTE_ROL}</p>
              <p style="margin:2px 0 0;font-size:13px;line-height:1.4;color:#475569;"><a href="mailto:${DESPACHO_EMAIL}" style="color:${CORREO_UI.navy};text-decoration:none;">${DESPACHO_EMAIL}</a> · <a href="${DESPACHO_SITIO}" style="color:${CORREO_UI.navy};text-decoration:none;">${dominioDespacho()}</a></p>
              ${lineaHorario}
              ${bloqueRedes}`;
}

export function enriquecerCuerpoCorreo(texto: string): string {
  const limpio = texto.trimEnd();
  if (limpio.includes(DESPACHO_EMAIL)) return limpio;
  return limpio + firmaCorreoTexto();
}

type BorradorCorreo = {
  to?: string;
  subject: string;
  body: string;
  cc?: string;
};

/** Abre Gmail (compose) — ideal con Google Workspace ya iniciado. */
export function abrirBorradorGmail({ to, subject, body, cc }: BorradorCorreo): void {
  const params = new URLSearchParams();
  params.set("view", "cm");
  params.set("fs", "1");
  if (to?.trim()) params.set("to", to.trim());
  if (cc?.trim()) params.set("cc", cc.trim());
  params.set("su", subject);
  params.set("body", enriquecerCuerpoCorreo(body));

  const url = `https://mail.google.com/mail/?${params.toString()}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Respaldo si Gmail no abre (cliente de correo del sistema). */
export function abrirBorradorMailto({ to, subject, body }: BorradorCorreo): void {
  const cuerpo = encodeURIComponent(enriquecerCuerpoCorreo(body));
  const asunto = encodeURIComponent(subject);
  const destino = to?.trim() ? encodeURIComponent(to.trim()) : "";
  const base = destino ? `mailto:${destino}` : "mailto:";
  window.open(`${base}?subject=${asunto}&body=${cuerpo}`, "_blank");
}

/** Por defecto: Gmail (Workspace). */
export function abrirBorradorCorreo(opts: BorradorCorreo): void {
  abrirBorradorGmail(opts);
}

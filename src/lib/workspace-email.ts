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
export const DESPACHO_FIRMANTE_ROL = "Tu contador";
export const DESPACHO_HORARIO =
  "Respondemos en horario hábil · Lun–Vie 9:00–17:00";

function dominioDespacho(): string {
  return DESPACHO_SITIO.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * Logo del despacho (RDC) en blanco, para colocar dentro del encabezado de
 * color de los correos. Es `<img>` inline: hereda el `text-align` del td
 * contenedor (centrado o izquierda según la plantilla).
 */
export function logoCorreoHtml(): string {
  return `<img src="${EMAIL_ASSET_BASE}/logos/rdc-white.png" alt="${DESPACHO_NOMBRE}" height="32" style="height:32px;width:auto;display:inline-block;margin:0 0 12px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />`;
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

  return `
              <table role="presentation" cellspacing="0" cellpadding="0" align="left" style="margin:20px 0 0;border-top:1px solid #e2e8f0;width:100%;">
                <tr><td style="padding:18px 0 0;">
                  <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;font-weight:bold;">Síguenos</p>
                  <table role="presentation" cellspacing="0" cellpadding="0"><tr>${iconos}</tr></table>
                </td></tr>
              </table>`;
}

/** Firma personalizada en texto plano (para borradores Gmail / fallback). */
export function firmaCorreoTexto(cierre = "Atentamente,"): string {
  return [
    "",
    cierre,
    DESPACHO_FIRMANTE,
    `${DESPACHO_FIRMANTE_ROL} · ${DESPACHO_NOMBRE}`,
    `${DESPACHO_EMAIL} · ${dominioDespacho()}`,
    DESPACHO_HORARIO,
    "",
    `WhatsApp: ${WHATSAPP_URL_CORREO}`,
    `Instagram: ${REDES_CORREO[1].url}`,
    `Facebook: ${REDES_CORREO[2].url}`,
    `YouTube: ${REDES_CORREO[3].url}`,
  ].join("\n");
}

/** Firma personalizada en HTML inline para los templates de Resend. */
export function firmaHtmlCorreo(cierre = "Atentamente,"): string {
  return `
              <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#334155;">${cierre}</p>
              <p style="margin:2px 0 0;font-size:15px;line-height:1.5;color:#0f172a;font-weight:bold;">${DESPACHO_FIRMANTE}</p>
              <p style="margin:2px 0 0;font-size:13px;line-height:1.5;color:#475569;">${DESPACHO_FIRMANTE_ROL} · ${DESPACHO_NOMBRE}</p>
              <p style="margin:2px 0 0;font-size:13px;line-height:1.5;color:#475569;"><a href="mailto:${DESPACHO_EMAIL}" style="color:#4f46e5;text-decoration:none;">${DESPACHO_EMAIL}</a> · <a href="${DESPACHO_SITIO}" style="color:#4f46e5;text-decoration:none;">${dominioDespacho()}</a></p>
              <p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#9ca3af;">${DESPACHO_HORARIO}</p>
              ${redesCorreoHtml()}`;
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

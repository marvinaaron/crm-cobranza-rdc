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

/** Persona que firma los correos (contexto humano). */
export const DESPACHO_FIRMANTE =
  process.env.NEXT_PUBLIC_DESPACHO_FIRMANTE ?? "Aaron Rosales";
export const DESPACHO_FIRMANTE_ROL = "Tu contador";
export const DESPACHO_HORARIO =
  "Respondemos en horario hábil · Lun–Vie 9:00–17:00";

function dominioDespacho(): string {
  return DESPACHO_SITIO.replace(/^https?:\/\//, "").replace(/\/$/, "");
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
  ].join("\n");
}

/** Firma personalizada en HTML inline para los templates de Resend. */
export function firmaHtmlCorreo(cierre = "Atentamente,"): string {
  return `
              <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#334155;">${cierre}</p>
              <p style="margin:2px 0 0;font-size:15px;line-height:1.5;color:#0f172a;font-weight:bold;">${DESPACHO_FIRMANTE}</p>
              <p style="margin:2px 0 0;font-size:13px;line-height:1.5;color:#475569;">${DESPACHO_FIRMANTE_ROL} · ${DESPACHO_NOMBRE}</p>
              <p style="margin:2px 0 0;font-size:13px;line-height:1.5;color:#475569;"><a href="mailto:${DESPACHO_EMAIL}" style="color:#4f46e5;text-decoration:none;">${DESPACHO_EMAIL}</a> · <a href="${DESPACHO_SITIO}" style="color:#4f46e5;text-decoration:none;">${dominioDespacho()}</a></p>
              <p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#9ca3af;">${DESPACHO_HORARIO}</p>`;
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

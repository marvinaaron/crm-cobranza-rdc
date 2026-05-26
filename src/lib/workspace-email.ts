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

export function firmaCorreoTexto(): string {
  return [
    "",
    "--",
    DESPACHO_NOMBRE,
    DESPACHO_EMAIL,
    DESPACHO_SITIO,
  ].join("\n");
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

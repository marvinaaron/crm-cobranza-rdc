import { Resend } from "resend";

/**
 * Mailer transaccional unificado.
 *
 * Prioriza Resend si `RESEND_API_KEY` está definida (recomendado). Si no, lanza
 * un error claro para que el admin lo configure. Para correos genéricos de
 * Supabase (verificación, reset) se sigue usando el SMTP de Supabase como
 * fallback en sus propios endpoints, pero todos los correos custom del CRM
 * pasan por aquí.
 */

export type EnvioCorreo = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type ResultadoEnvio = {
  ok: boolean;
  provider: "resend" | "ninguno";
  id?: string;
  error?: string;
};

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  resendClient = new Resend(key);
  return resendClient;
}

/**
 * Remitente "From" del correo. Debes verificar el dominio (rdcontadores.com)
 * en Resend → Domains para usar tu propio dominio. Mientras lo verificas
 * puedes usar `onboarding@resend.dev` (dominio de prueba de Resend) como
 * fallback.
 */
function getRemitente(): string {
  const explicit = process.env.RESEND_FROM_EMAIL?.trim();
  if (explicit) return explicit;
  const nombre =
    process.env.NEXT_PUBLIC_DESPACHO_NOMBRE?.trim() || "RDC Contadores";
  return `${nombre} <no-reply@rdcontadores.com>`;
}

export async function enviarCorreo(
  envio: EnvioCorreo
): Promise<ResultadoEnvio> {
  const client = getResend();
  if (!client) {
    return {
      ok: false,
      provider: "ninguno",
      error:
        "Falta RESEND_API_KEY en .env.local. Crea cuenta gratis en https://resend.com, genera una API key y agrégala como RESEND_API_KEY.",
    };
  }

  const replyTo =
    envio.replyTo ?? process.env.NEXT_PUBLIC_DESPACHO_EMAIL?.trim();

  try {
    const { data, error } = await client.emails.send({
      from: getRemitente(),
      to: envio.to,
      subject: envio.subject,
      html: envio.html,
      text: envio.text,
      replyTo,
    });
    if (error) {
      return { ok: false, provider: "resend", error: error.message };
    }
    return { ok: true, provider: "resend", id: data?.id };
  } catch (e) {
    return {
      ok: false,
      provider: "resend",
      error: e instanceof Error ? e.message : "Error inesperado en Resend.",
    };
  }
}

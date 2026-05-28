import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { enviarCorreo } from "@/lib/mailer";

export const runtime = "nodejs";

/**
 * POST /api/admin/correo/enviar
 *
 * Endpoint genérico para enviar un correo HTML a un cliente desde el CRM
 * usando Resend. El navegador construye el HTML (con `buildCorreoCobranza`
 * o cualquier plantilla del módulo `mailer/templates`) y aquí solo lo
 * entregamos. Esto evita duplicar la lógica de plantillas en el servidor
 * y permite reutilizar el endpoint para cobranza, recordatorios de e.firma,
 * cumpleaños, avisos futuros, etc.
 */

type BodyEnvio = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function POST(req: Request) {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  const user = sess.user;
  if (!user) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  if (appMeta.rol !== "admin") {
    return NextResponse.json(
      { error: "Solo administradores." },
      { status: 403 }
    );
  }

  let body: BodyEnvio;
  try {
    body = (await req.json()) as BodyEnvio;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.to || !body.subject || !body.html) {
    return NextResponse.json(
      { error: "Faltan campos requeridos (to, subject, html)." },
      { status: 400 }
    );
  }

  const resultado = await enviarCorreo({
    to: body.to,
    subject: body.subject,
    html: body.html,
    text: body.text,
    replyTo: body.replyTo,
  });

  if (!resultado.ok) {
    return NextResponse.json(
      { error: resultado.error ?? "No se pudo enviar el correo." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, id: resultado.id });
}

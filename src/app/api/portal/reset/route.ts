import { NextResponse, type NextRequest } from "next/server";
import { generarLinkAccesoPortal } from "@/lib/supabase/portal-acceso";
import { enviarCorreo } from "@/lib/mailer";
import { plantillaRecuperacionPortal } from "@/lib/mailer/templates";

/**
 * POST /api/portal/reset  body: {email, nombreCliente?, tipo?}
 *
 * Genera un magic link de recuperación con Supabase Admin y envía el correo
 * profesional con Resend. Si el correo no existe en Auth, devolvemos `{ok:true}`
 * de todos modos por seguridad (no revelar quién está dado de alta).
 *
 * No requiere autenticación admin (lo usa el cliente desde /portal/recuperar).
 */
export async function POST(request: NextRequest) {
  let body: {
    email?: string;
    nombreCliente?: string;
    tipo?: "recovery" | "invite";
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Captura tu correo." }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const redirectTo = `${origin}/portal/cambiar-clave`;
  const tipo = body.tipo === "invite" ? "invite" : "recovery";

  try {
    const url = await generarLinkAccesoPortal({ email, redirectTo, tipo });

    const plantilla = plantillaRecuperacionPortal({
      nombreCliente: body.nombreCliente?.trim() || "cliente",
      url,
      nombreDespacho:
        process.env.NEXT_PUBLIC_DESPACHO_NOMBRE?.trim() || "RDC Contadores",
      correoSoporte:
        process.env.NEXT_PUBLIC_DESPACHO_EMAIL?.trim() ||
        "contacto@rdcontadores.com",
      sitioWeb: process.env.NEXT_PUBLIC_DESPACHO_SITIO?.trim(),
    });

    const envio = await enviarCorreo({
      to: email,
      subject: plantilla.asunto,
      html: plantilla.html,
      text: plantilla.texto,
    });

    if (!envio.ok) {
      console.error("Reset correo error:", envio.error);
    }
    // Siempre devolvemos ok por privacidad.
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error reset password portal:", e);
    // Tampoco fallamos públicamente por privacidad.
    return NextResponse.json({ ok: true });
  }
}

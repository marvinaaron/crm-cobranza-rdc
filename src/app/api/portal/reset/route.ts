import { NextResponse, type NextRequest } from "next/server";
import { resetearPasswordPortal } from "@/lib/supabase/portal-acceso";
import { enviarCorreo } from "@/lib/mailer";
import { plantillaRecuperacionPortal } from "@/lib/mailer/templates";

/**
 * POST /api/portal/reset  body: {email, nombreCliente?}
 *
 * Genera una nueva contraseña temporal para el usuario, la guarda en Supabase
 * Auth (marcando `requiereCambioClave=true`) y envía un correo profesional
 * con Resend mostrándola al cliente.
 *
 * Por privacidad: si el correo no existe, devolvemos {ok:true} igualmente.
 */
export async function POST(request: NextRequest) {
  let body: { email?: string; nombreCliente?: string } = {};
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
  const urlPortal = `${origin}/portal/login`;

  const nombreDespacho =
    process.env.NEXT_PUBLIC_DESPACHO_NOMBRE?.trim() || "RDC Contadores";
  const correoSoporte =
    process.env.NEXT_PUBLIC_DESPACHO_EMAIL?.trim() ||
    "contacto@rdcontadores.com";
  const sitioWeb = process.env.NEXT_PUBLIC_DESPACHO_SITIO?.trim();
  const nombreCliente = body.nombreCliente?.trim() || "cliente";

  try {
    const result = await resetearPasswordPortal({ email });
    if (!result) {
      // Por privacidad, no revelamos que el correo no existe.
      return NextResponse.json({ ok: true });
    }

    const plantilla = plantillaRecuperacionPortal({
      nombreCliente,
      correoCliente: email,
      passwordTemporal: result.passwordTemporal,
      urlPortal,
      nombreDespacho,
      correoSoporte,
      sitioWeb,
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
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error reset password portal:", e);
    // Tampoco fallamos públicamente por privacidad.
    return NextResponse.json({ ok: true });
  }
}

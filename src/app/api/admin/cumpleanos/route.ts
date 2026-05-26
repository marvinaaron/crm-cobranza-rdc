import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { enviarCorreo } from "@/lib/mailer";
import { plantillaCumpleanos } from "@/lib/mailer/templates";
import { isValidEmail } from "@/lib/email";

/**
 * POST /api/admin/cumpleanos
 * body: { email, nombreCliente }
 *
 * Envía una felicitación de cumpleaños desde el dominio del despacho.
 * El flujo de validación (que sea hoy y que no se haya enviado antes este
 * año) ocurre en el cliente, porque los datos de cumpleNotificadoAnios viven
 * en el snapshot del CRM en navegador. Aquí solo verificamos sesión admin
 * y datos mínimos antes de disparar el correo.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: { email?: string; nombreCliente?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const email = body.email?.trim();
  const nombreCliente = body.nombreCliente?.trim();
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Correo del cliente inválido." },
      { status: 400 }
    );
  }
  if (!nombreCliente) {
    return NextResponse.json(
      { error: "nombreCliente requerido." },
      { status: 400 }
    );
  }

  const nombreDespacho =
    process.env.NEXT_PUBLIC_DESPACHO_NOMBRE?.trim() || "RDC Contadores";
  const correoSoporte =
    process.env.NEXT_PUBLIC_DESPACHO_EMAIL?.trim() ||
    "contacto@rdcontadores.com";
  const sitioWeb = process.env.NEXT_PUBLIC_DESPACHO_SITIO?.trim();

  const plantilla = plantillaCumpleanos({
    nombreCliente,
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
    return NextResponse.json(
      { error: envio.error ?? "No se pudo enviar el correo." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: envio.id });
}

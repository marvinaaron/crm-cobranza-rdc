import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { prepararEnvioAvisoPrivacidad } from "@/lib/supabase/crm-estado-db";
import { enviarCorreo } from "@/lib/mailer";
import { plantillaAvisoPrivacidadCliente } from "@/lib/mailer/templates";

export const runtime = "nodejs";

/**
 * POST /api/admin/clientes/aviso-privacidad
 * body: { clienteId: number, contextoEfirma?: boolean }
 *
 * Genera (o reutiliza) la liga privada, marca enviadoEn en el expediente
 * y manda el correo formal de aceptación.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: { clienteId?: number; contextoEfirma?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const clienteId = Number(body.clienteId);
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  let cliente;
  try {
    cliente = await prepararEnvioAvisoPrivacidad(clienteId);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cliente no encontrado." },
      { status: 404 }
    );
  }

  if (!cliente.email?.trim()) {
    return NextResponse.json(
      { error: "El cliente no tiene correo registrado." },
      { status: 400 }
    );
  }

  const token = cliente.avisoPrivacidad?.token;
  if (!token) {
    return NextResponse.json(
      { error: "No se pudo generar el enlace de aceptación." },
      { status: 500 }
    );
  }

  const nombreDespacho =
    process.env.NEXT_PUBLIC_DESPACHO_NOMBRE?.trim() || "RDC Contadores";
  const correoSoporte =
    process.env.NEXT_PUBLIC_DESPACHO_EMAIL?.trim() ||
    "contacto@rdcontadores.com";
  const sitioWeb = process.env.NEXT_PUBLIC_DESPACHO_SITIO?.trim();
  const origin = request.nextUrl.origin;
  const urlAceptar = `${origin}/aviso/${token}`;

  const plantilla = plantillaAvisoPrivacidadCliente({
    nombreCliente: cliente.razonSocial,
    urlAceptar,
    nombreDespacho,
    correoSoporte,
    sitioWeb,
    contextoEfirma: Boolean(body.contextoEfirma),
  });

  const envio = await enviarCorreo({
    to: cliente.email.trim(),
    subject: plantilla.asunto,
    html: plantilla.html,
    text: plantilla.texto,
    replyTo: correoSoporte,
  });

  if (!envio.ok) {
    return NextResponse.json(
      { error: envio.error ?? "No se pudo enviar el correo." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    to: cliente.email.trim(),
    urlAceptar,
    avisoPrivacidad: cliente.avisoPrivacidad,
  });
}

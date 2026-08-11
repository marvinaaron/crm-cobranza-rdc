import { NextResponse, type NextRequest } from "next/server";
import { requireModulo } from "@/lib/supabase/require-modulo";
import { enviarCorreo } from "@/lib/mailer";
import { plantillaAvisoPrivacidadEfirma } from "@/lib/mailer/templates";
import type { ClienteBasico } from "@/lib/efirma/notificar";

export const runtime = "nodejs";

/**
 * POST /api/admin/efirmas/aviso-privacidad
 * body: { clienteId, clientes?: ClienteBasico[] }
 *
 * Envía al cliente el aviso de privacidad para que autorice la custodia de e.firma.
 */
export async function POST(request: NextRequest) {
  const guard = await requireModulo("efirmas");
  if (guard instanceof NextResponse) return guard;

  let body: { clienteId?: number; clientes?: ClienteBasico[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const clienteId = Number(body.clienteId);
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  const clientes = Array.isArray(body.clientes) ? body.clientes : [];
  const cliente = clientes.find((c) => c.id === clienteId);
  if (!cliente) {
    return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
  }
  if (!cliente.email?.trim()) {
    return NextResponse.json(
      { error: "El cliente no tiene correo registrado." },
      { status: 400 }
    );
  }

  const nombreDespacho =
    process.env.NEXT_PUBLIC_DESPACHO_NOMBRE?.trim() || "RDC Contadores";
  const correoSoporte =
    process.env.NEXT_PUBLIC_DESPACHO_EMAIL?.trim() ||
    "contacto@rdcontadores.com";
  const sitioWeb = process.env.NEXT_PUBLIC_DESPACHO_SITIO?.trim();
  const origin = request.nextUrl.origin;
  const urlAviso = `${origin}/aviso-de-privacidad`;

  const plantilla = plantillaAvisoPrivacidadEfirma({
    nombreCliente: cliente.razonSocial,
    urlAviso,
    nombreDespacho,
    correoSoporte,
    sitioWeb,
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

  return NextResponse.json({ ok: true, to: cliente.email.trim() });
}

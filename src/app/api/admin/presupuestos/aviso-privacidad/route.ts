import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  prepararEnvioAvisoPrivacidad,
  prepararEnvioAvisoPrivacidadPresupuesto,
} from "@/lib/supabase/crm-estado-db";
import { enviarCorreo } from "@/lib/mailer";
import { plantillaAvisoPrivacidadCliente } from "@/lib/mailer/templates";

export const runtime = "nodejs";

/**
 * POST /api/admin/presupuestos/aviso-privacidad
 * body: { presupuestoId: string }
 *
 * Envía el aviso formal al prospecto. Si el presupuesto ya está ligado a un
 * cliente CRM, el estatus se guarda en ese expediente; si no, en el presupuesto
 * (y se copia al convertir en cliente).
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: { presupuestoId?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const presupuestoId = String(body.presupuestoId ?? "").trim();
  if (!presupuestoId) {
    return NextResponse.json(
      { error: "presupuestoId requerido." },
      { status: 400 }
    );
  }

  let presupuesto;
  try {
    presupuesto = await prepararEnvioAvisoPrivacidadPresupuesto(presupuestoId);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Presupuesto no encontrado." },
      { status: 404 }
    );
  }

  const email = presupuesto.cliente.email?.trim();
  if (!email) {
    return NextResponse.json(
      { error: "El prospecto no tiene correo en el presupuesto." },
      { status: 400 }
    );
  }

  let nombreTitular = presupuesto.cliente.razonSocial || "Estimado(a)";
  let avisoPrivacidad = presupuesto.avisoPrivacidad;
  const clienteIdExistente = presupuesto.cliente.clienteId;

  if (clienteIdExistente) {
    try {
      const cliente = await prepararEnvioAvisoPrivacidad(clienteIdExistente);
      avisoPrivacidad = cliente.avisoPrivacidad;
      nombreTitular = cliente.razonSocial;
    } catch {
      // Si el cliente ligado ya no existe, seguimos con el del presupuesto.
    }
  }

  const token = avisoPrivacidad?.token;
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
    nombreCliente: nombreTitular,
    urlAceptar,
    nombreDespacho,
    correoSoporte,
    sitioWeb,
  });

  const envio = await enviarCorreo({
    to: email,
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
    to: email,
    urlAceptar,
    avisoPrivacidad: presupuesto.avisoPrivacidad,
    avisoPrivacidadCliente: clienteIdExistente ? avisoPrivacidad : undefined,
  });
}

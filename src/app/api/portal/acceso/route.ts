import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  buscarAuthUserPorClienteId,
  crearOActualizarAccesoPortal,
  CorreoYaVinculadoError,
  eliminarAccesoPortal,
  generarLinkAccesoPortal,
} from "@/lib/supabase/portal-acceso";
import { enviarCorreo } from "@/lib/mailer";
import {
  plantillaInvitacionPortal,
  plantillaRecuperacionPortal,
} from "@/lib/mailer/templates";

/**
 * GET  /api/portal/acceso?clienteId=123       → estado del acceso
 * POST /api/portal/acceso   body: {clienteId, email, nombreCliente?, enviarInvitacion?}  → crear/actualizar (+ correo)
 * DELETE /api/portal/acceso body: {clienteId} → eliminar
 */

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const clienteIdParam = request.nextUrl.searchParams.get("clienteId");
  const clienteId = Number(clienteIdParam);
  if (!clienteIdParam || !Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId inválido." }, { status: 400 });
  }

  try {
    const info = await buscarAuthUserPorClienteId(clienteId);
    return NextResponse.json(info);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error inesperado." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: {
    clienteId?: number;
    email?: string;
    nombreCliente?: string;
    enviarInvitacion?: boolean;
    forzarReasignar?: boolean;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (typeof body.clienteId !== "number" || !Number.isFinite(body.clienteId)) {
    return NextResponse.json(
      { error: "clienteId requerido." },
      { status: 400 }
    );
  }
  if (!body.email?.trim()) {
    return NextResponse.json({ error: "email requerido." }, { status: 400 });
  }

  try {
    // 1. Verifica si ya existía antes (para decidir si es invite o recovery).
    const previo = await buscarAuthUserPorClienteId(body.clienteId);

    // 2. Crea/actualiza el usuario auth (siempre password aleatorio interno).
    const result = await crearOActualizarAccesoPortal({
      clienteId: body.clienteId,
      email: body.email,
      forzarReasignar: body.forzarReasignar === true,
    });

    // 3. Genera el link de acceso (invite si es nuevo, recovery si ya existía).
    const enviarInvitacion = body.enviarInvitacion !== false;
    let correoEnviado = false;
    let correoError: string | undefined;

    if (enviarInvitacion) {
      const origin = request.nextUrl.origin;
      const redirectTo = `${origin}/portal/cambiar-clave`;
      const tipo = previo.exists ? "recovery" : "invite";

      try {
        const url = await generarLinkAccesoPortal({
          email: result.email,
          redirectTo,
          tipo,
        });

        const nombreCliente = body.nombreCliente?.trim() || "cliente";
        const nombreDespacho =
          process.env.NEXT_PUBLIC_DESPACHO_NOMBRE?.trim() || "RDC Contadores";
        const correoSoporte =
          process.env.NEXT_PUBLIC_DESPACHO_EMAIL?.trim() ||
          "contacto@rdcontadores.com";
        const sitioWeb = process.env.NEXT_PUBLIC_DESPACHO_SITIO?.trim();

        const plantilla =
          tipo === "invite"
            ? plantillaInvitacionPortal({
                nombreCliente,
                correoCliente: result.email,
                url,
                nombreDespacho,
                correoSoporte,
                sitioWeb,
              })
            : plantillaRecuperacionPortal({
                nombreCliente,
                url,
                nombreDespacho,
                correoSoporte,
                sitioWeb,
              });

        const envio = await enviarCorreo({
          to: result.email,
          subject: plantilla.asunto,
          html: plantilla.html,
          text: plantilla.texto,
        });

        if (envio.ok) {
          correoEnviado = true;
        } else {
          correoError = envio.error;
        }
      } catch (e) {
        correoError = e instanceof Error ? e.message : "Error inesperado.";
      }
    }

    return NextResponse.json({
      authUserId: result.authUserId,
      email: result.email,
      correoEnviado,
      correoError,
    });
  } catch (e) {
    if (e instanceof CorreoYaVinculadoError) {
      return NextResponse.json(
        {
          error: e.message,
          codigo: e.codigo,
          clienteIdExistente: e.clienteIdExistente ?? null,
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error inesperado." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: { clienteId?: number } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (typeof body.clienteId !== "number" || !Number.isFinite(body.clienteId)) {
    return NextResponse.json(
      { error: "clienteId requerido." },
      { status: 400 }
    );
  }

  try {
    const result = await eliminarAccesoPortal(body.clienteId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error inesperado." },
      { status: 400 }
    );
  }
}

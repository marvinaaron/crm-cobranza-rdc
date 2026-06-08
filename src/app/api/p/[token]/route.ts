import { NextResponse } from "next/server";
import {
  leerPresupuestoPorToken,
  responderPresupuestoPublico,
} from "@/lib/supabase/crm-estado-db";
import type { MotivoObjecion } from "@/lib/presupuestos";

export const dynamic = "force-dynamic";

const MOTIVOS_VALIDOS: MotivoObjecion[] = [
  "caro",
  "pensarlo",
  "tengo_contador",
  "no_entiendo",
  "mucho",
];

/** GET /api/p/[token] — Estado público de un presupuesto (para refrescar). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const p = await leerPresupuestoPorToken(token);
  if (!p) {
    return NextResponse.json({ error: "no-encontrado" }, { status: 404 });
  }
  return NextResponse.json({ estado: p.estado });
}

/**
 * POST /api/p/[token] — El prospecto acepta o rechaza el presupuesto.
 * Body: { accion: "aceptar" | "rechazar", motivo?, comentario? }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  let body: {
    accion?: string;
    motivo?: string;
    comentario?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const accion = body.accion;
  if (accion !== "aceptar" && accion !== "rechazar") {
    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  }

  const motivo =
    accion === "rechazar" &&
    body.motivo &&
    MOTIVOS_VALIDOS.includes(body.motivo as MotivoObjecion)
      ? (body.motivo as MotivoObjecion)
      : undefined;

  try {
    const actualizado = await responderPresupuestoPublico({
      token,
      accion,
      motivo,
      comentario:
        typeof body.comentario === "string" ? body.comentario : undefined,
    });
    if (!actualizado) {
      return NextResponse.json({ error: "no-encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, estado: actualizado.estado });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al registrar." },
      { status: 500 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { requireModulo } from "@/lib/supabase/require-modulo";
import {
  actualizarPermisosAdmin,
  asegurarPropietario,
  crearAdmin,
  eliminarAdmin,
  listarEquipoAdmin,
} from "@/lib/admin/equipo";
import { MODULOS, type Modulo } from "@/lib/admin/permisos";

/**
 * GET    /api/admin/equipo                → lista de admins
 * POST   /api/admin/equipo                → crear admin
 * PATCH  /api/admin/equipo  body: { id, permisos } → actualizar permisos
 * DELETE /api/admin/equipo  body: { id }  → eliminar admin
 *
 * Solo accesible para admins con módulo `configuracion`.
 */

function sanearPermisos(v: unknown): Modulo[] {
  if (!Array.isArray(v)) return [];
  return v.filter((m): m is Modulo =>
    (MODULOS as readonly string[]).includes(m as string)
  );
}

export async function GET() {
  const guard = await requireModulo("configuracion");
  if (guard instanceof NextResponse) return guard;
  try {
    // Garantiza que siempre haya un propietario (auto-promueve al primer admin).
    await asegurarPropietario();
    const equipo = await listarEquipoAdmin();
    return NextResponse.json({ equipo });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error inesperado." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireModulo("configuracion");
  if (guard instanceof NextResponse) return guard;
  let body: {
    email?: string;
    nombreCompleto?: string;
    cargo?: string;
    permisos?: Modulo[];
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!body.email?.trim()) {
    return NextResponse.json({ error: "Captura un correo." }, { status: 400 });
  }
  const permisos = sanearPermisos(body.permisos);
  try {
    const admin = await crearAdmin({
      email: body.email,
      nombreCompleto: body.nombreCompleto,
      cargo: body.cargo,
      permisos,
      origin: request.nextUrl.origin,
    });
    return NextResponse.json({ ok: true, admin });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error inesperado." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireModulo("configuracion");
  if (guard instanceof NextResponse) return guard;
  let body: { id?: string; permisos?: Modulo[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "id requerido." }, { status: 400 });
  }
  try {
    const admin = await actualizarPermisosAdmin({
      authUserId: body.id,
      permisos: sanearPermisos(body.permisos),
    });
    return NextResponse.json({ ok: true, admin });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error inesperado." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireModulo("configuracion");
  if (guard instanceof NextResponse) return guard;
  let body: { id?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "id requerido." }, { status: 400 });
  }
  // No permitir auto-eliminarse
  if (body.id === guard.user.id) {
    return NextResponse.json(
      { error: "No puedes eliminarte a ti mismo." },
      { status: 400 }
    );
  }
  try {
    await eliminarAdmin(body.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error inesperado." },
      { status: 400 }
    );
  }
}

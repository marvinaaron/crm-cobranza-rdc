import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esAdmin } from "@/lib/supabase/roles";
import {
  esPropietario,
  getPermisos,
  type PerfilAdminUserMetadata,
} from "@/lib/admin/permisos";

/**
 * GET  /api/admin/perfil  → devuelve los datos del admin logueado.
 * PUT  /api/admin/perfil  → actualiza datos personales (user_metadata).
 */

/**
 * Obtiene el usuario admin SIEMPRE con datos frescos desde la BD.
 * - Primero valida la sesión (vía cookie) para conocer el id.
 * - Luego re-lee el usuario con el service role para evitar usar el JWT
 *   cacheado, garantizando ver cambios recientes de app_metadata.
 */
async function getUsuarioAdmin() {
  const supabase = await getSupabaseServer();
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();
  if (!sessionUser) return null;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.getUserById(sessionUser.id);
  if (error || !data.user) return null;
  if (!esAdmin(data.user)) return null;
  return data.user;
}

function leerUserMeta(user: { user_metadata?: unknown }): PerfilAdminUserMetadata {
  const m = user.user_metadata as Record<string, unknown> | undefined;
  if (!m) return {};
  return {
    nombreCompleto:
      typeof m.nombreCompleto === "string" ? m.nombreCompleto : undefined,
    cargo: typeof m.cargo === "string" ? m.cargo : undefined,
    telefono: typeof m.telefono === "string" ? m.telefono : undefined,
    cedulaProfesional:
      typeof m.cedulaProfesional === "string" ? m.cedulaProfesional : undefined,
    ubicacion: typeof m.ubicacion === "string" ? m.ubicacion : undefined,
    notas: typeof m.notas === "string" ? m.notas : undefined,
    avatarPath: typeof m.avatarPath === "string" ? m.avatarPath : undefined,
    avatarUrl: typeof m.avatarUrl === "string" ? m.avatarUrl : undefined,
  };
}

export async function GET() {
  const user = await getUsuarioAdmin();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    propietario: esPropietario(user),
    permisos: getPermisos(user),
    perfil: leerUserMeta(user),
  });
}

export async function PUT(request: NextRequest) {
  const user = await getUsuarioAdmin();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body: Partial<PerfilAdminUserMetadata> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const limpiar = (s: unknown): string | undefined => {
    if (typeof s !== "string") return undefined;
    const t = s.trim();
    return t.length ? t : undefined;
  };

  const nuevoMeta: PerfilAdminUserMetadata = {
    ...leerUserMeta(user),
    nombreCompleto: limpiar(body.nombreCompleto),
    cargo: limpiar(body.cargo),
    telefono: limpiar(body.telefono),
    cedulaProfesional: limpiar(body.cedulaProfesional),
    ubicacion: limpiar(body.ubicacion),
    notas: limpiar(body.notas),
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: nuevoMeta,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, perfil: nuevoMeta });
}

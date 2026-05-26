import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/portal/contador-asignado
 *
 * Devuelve los datos de contacto del contador principal del despacho
 * (propietario o, en su defecto, el primer admin) para mostrarlos en el
 * inicio del portal del cliente.
 *
 * Solo expone información pública/de contacto: nombre, cargo, correo,
 * teléfono, cédula y avatar. Nunca incluye permisos, ids internos ni
 * datos sensibles.
 */
export type ContadorAsignadoPortal = {
  nombre: string;
  cargo?: string;
  email?: string;
  telefono?: string;
  cedulaProfesional?: string;
  avatarUrl?: string;
};

function limpiar(s: unknown): string | undefined {
  if (typeof s !== "string") return undefined;
  const t = s.trim();
  return t.length ? t : undefined;
}

export async function GET() {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  const user = sess.user;
  if (!user) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  if (appMeta.rol !== "cliente") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const admin = getSupabaseAdmin();
    type UserLite = {
      email?: string | null;
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
    };
    // Buscamos a todos los admins y elegimos al propietario.
    let propietario: UserLite | null = null;
    let primero: UserLite | null = null;
    let page = 1;
    while (page <= 10 && !propietario) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) throw new Error(error.message);
      for (const u of data.users) {
        const am = (u.app_metadata ?? {}) as Record<string, unknown>;
        if (am.rol !== "admin") continue;
        if (!primero) primero = u as UserLite;
        if (am.propietario === true) {
          propietario = u as UserLite;
          break;
        }
      }
      if (data.users.length < 200) break;
      page += 1;
    }
    const elegido = propietario ?? primero;
    if (!elegido) return NextResponse.json({ contador: null });

    const meta = elegido.user_metadata ?? {};
    const email = elegido.email ?? undefined;
    const nombre =
      limpiar(meta.nombreCompleto) ||
      (email ? email.split("@")[0] : undefined);
    if (!nombre) return NextResponse.json({ contador: null });

    const contador: ContadorAsignadoPortal = {
      nombre,
      cargo: limpiar(meta.cargo),
      email,
      telefono: limpiar(meta.telefono),
      cedulaProfesional: limpiar(meta.cedulaProfesional),
      avatarUrl: limpiar(meta.avatarUrl),
    };
    return NextResponse.json({ contador });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "No se pudo cargar el contador.",
      },
      { status: 500 }
    );
  }
}

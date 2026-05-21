import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { esAdmin } from "@/lib/supabase/roles";

/**
 * Verifica que el request venga de un admin logueado. Si no, devuelve un
 * NextResponse listo para retornar; si sí, devuelve el usuario.
 *
 * Uso:
 *   const guard = await requireAdmin();
 *   if (guard instanceof NextResponse) return guard;
 *   const { user } = guard;
 */
export async function requireAdmin() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  if (!esAdmin(user)) {
    return NextResponse.json({ error: "Solo admin." }, { status: 403 });
  }
  return { user };
}

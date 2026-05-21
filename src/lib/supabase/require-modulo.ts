import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { esAdmin } from "@/lib/supabase/roles";
import { tienePermiso, type Modulo } from "@/lib/admin/permisos";

/**
 * Verifica que el request venga de un admin con permiso para el módulo dado.
 * Uso:
 *   const guard = await requireModulo("configuracion");
 *   if (guard instanceof NextResponse) return guard;
 */
export async function requireModulo(modulo: Modulo) {
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
  if (!tienePermiso(user, modulo)) {
    return NextResponse.json(
      { error: "No tienes permiso para este módulo." },
      { status: 403 }
    );
  }
  return { user };
}

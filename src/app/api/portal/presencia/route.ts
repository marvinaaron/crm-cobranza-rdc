import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esCliente } from "@/lib/supabase/roles";

const MINIMO_MS = 6 * 60 * 60 * 1000;

/**
 * POST /api/portal/presencia
 * Marca que el cliente abrió el portal/app (throttled).
 */
export async function POST() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esCliente(user)) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data } = await admin.auth.admin.getUserById(user.id);
  const fresco = data.user;
  if (!fresco) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }
  const meta = (fresco.user_metadata ?? {}) as Record<string, unknown>;
  const previo =
    typeof meta.lastPortalAt === "string" ? Date.parse(meta.lastPortalAt) : 0;
  if (Number.isFinite(previo) && Date.now() - previo < MINIMO_MS) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...meta,
      lastPortalAt: new Date().toISOString(),
    },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

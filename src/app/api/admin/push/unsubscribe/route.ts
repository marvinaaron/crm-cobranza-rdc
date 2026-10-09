import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esAdmin } from "@/lib/supabase/roles";

export const runtime = "nodejs";

/** Elimina una suscripción del admin autenticado por endpoint. */
export async function POST(req: Request) {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  const user = sess.user;
  if (!user) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }
  if (!esAdmin(user)) {
    return NextResponse.json({ error: "Solo admin." }, { status: 403 });
  }

  let endpoint: string | undefined;
  try {
    const body = (await req.json()) as { endpoint?: string };
    endpoint = body.endpoint;
  } catch {}

  const admin = getSupabaseAdmin();
  const query = admin
    .from("admin_push_subscriptions")
    .delete()
    .eq("admin_user_id", user.id);

  const { error } = endpoint
    ? await query.eq("endpoint", endpoint)
    : await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

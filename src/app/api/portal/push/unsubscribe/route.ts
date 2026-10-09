import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/portal/push/unsubscribe
 *
 * Elimina una suscripción del cliente autenticado por endpoint.
 */
export async function POST(req: Request) {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  const user = sess.user;
  if (!user) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  if (appMeta.rol !== "cliente") {
    return NextResponse.json({ error: "Solo clientes." }, { status: 403 });
  }
  const clienteId = Number(appMeta.clienteId);
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "Cliente sin id." }, { status: 400 });
  }

  let endpoint: string | undefined;
  try {
    const body = (await req.json()) as { endpoint?: string };
    endpoint = body.endpoint;
  } catch {
    // ok, sin endpoint borra todas las del cliente
  }

  const admin = getSupabaseAdmin();
  const query = admin
    .from("push_subscriptions")
    .delete()
    .eq("cliente_id", clienteId);

  const { error } = endpoint ? await query.eq("endpoint", endpoint) : await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

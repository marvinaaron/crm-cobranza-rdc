import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  enviarPushATodosLosAdmins,
  type PushPayload,
} from "@/lib/push/server";

export const runtime = "nodejs";

/**
 * POST /api/admin/push/broadcast
 *
 * Envía Web Push a todos los admins suscritos (p. ej. desde el navegador
 * al crear una notificación interna).
 */
export async function POST(req: Request) {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  const user = sess.user;
  if (!user) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  if (appMeta.rol !== "admin") {
    return NextResponse.json({ error: "Solo administradores." }, { status: 403 });
  }

  type Body = { payload?: PushPayload };
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.payload?.title) {
    return NextResponse.json({ error: "payload.title requerido." }, { status: 400 });
  }

  try {
    const resultado = await enviarPushATodosLosAdmins(body.payload);
    return NextResponse.json({ ok: true, ...resultado });
  } catch (err: unknown) {
    const mensaje = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esAdmin } from "@/lib/supabase/roles";
import { enviarPushASuscripcion } from "@/lib/push/server";

export const runtime = "nodejs";

/**
 * Notificación de prueba que llega al dispositivo justo al activar.
 * Confirma al admin que las push están funcionando bien (escritorio
 * o móvil) y le da el "hola" del despacho.
 */
const PUSH_BIENVENIDA_ADMIN = {
  title: "¡Hola! 👋 Soy tu portal del despacho",
  body: "Notificaciones activadas. Será un gusto trabajar juntos — aquí te avisaré de cobros, comprobantes y cumplimiento.",
  url: "/dashboard",
  tag: "bienvenida-admin",
  data: { tipo: "bienvenida_push" as const },
};

type Body = {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
};

/** Registra la suscripción Web Push del admin autenticado. */
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

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const sub = body.subscription;
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Suscripción incompleta." },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();
  const ahora = new Date().toISOString();
  const userAgent = req.headers.get("user-agent")?.slice(0, 255) ?? null;

  const { error } = await admin.from("admin_push_subscriptions").upsert(
    {
      admin_user_id: user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: userAgent,
      updated_at: ahora,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Push de bienvenida al dispositivo recién suscrito. Lo
  // ESPERAMOS antes de responder porque, en serverless, una promesa
  // flotante (`void ... .catch(...)`) puede no llegar a ejecutarse:
  // Vercel cierra la función en cuanto se envía la respuesta y la
  // push se pierde. El envío toma ~200ms y, si falla, lo logueamos
  // pero la suscripción ya quedó guardada arriba — la operación de
  // alta no se invalida.
  const saludoResult = await enviarPushASuscripcion(
    { endpoint, p256dh, auth },
    PUSH_BIENVENIDA_ADMIN
  );
  if (!saludoResult.ok) {
    console.warn(
      "[admin/push/subscribe] saludo de bienvenida no se pudo enviar",
      saludoResult
    );
  }

  return NextResponse.json({ ok: true });
}

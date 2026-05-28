import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enviarPushASuscripcion } from "@/lib/push/server";

export const runtime = "nodejs";

/**
 * Notificación de prueba que llega al dispositivo del cliente justo
 * al activar. Confirma que las push funcionan y le da la bienvenida
 * al portal del despacho.
 */
const PUSH_BIENVENIDA_CLIENTE = {
  title: "¡Hola! 👋 Soy tu portal de RDC",
  body: "Notificaciones activadas. Será un gusto trabajar juntos — aquí te avisaré de tus impuestos, recordatorios de pago y cuando recibamos tu comprobante.",
  url: "/portal/inicio",
  tag: "bienvenida-cliente",
  data: { tipo: "bienvenida_push" as const },
};

type Body = {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
};

/**
 * POST /api/portal/push/subscribe
 *
 * Registra la suscripción Web Push del cliente autenticado.
 * Si ya existe (por endpoint único), la actualiza.
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

  const { error } = await admin.from("push_subscriptions").upsert(
    {
      cliente_id: clienteId,
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

  // Push de bienvenida al dispositivo recién suscrito. Sin await para
  // no bloquear la respuesta y tolerante a fallos (no debe invalidar
  // el alta de la suscripción si el envío push falla).
  void enviarPushASuscripcion(
    { endpoint, p256dh, auth },
    PUSH_BIENVENIDA_CLIENTE
  ).catch(() => {
    // Silenciamos: la suscripción quedó OK aunque el saludo falle.
  });

  return NextResponse.json({ ok: true });
}

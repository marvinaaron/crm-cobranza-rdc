import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esCliente } from "@/lib/supabase/roles";

/**
 * PUT /api/portal/perfil/contrasena  body: { actual, nueva }
 *
 * Cambia la contraseña del cliente del portal. Requiere conocer la
 * contraseña actual: la validamos con un cliente Supabase aislado para no
 * tocar la sesión real.
 */
export async function PUT(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esCliente(user) || !user.email) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body: { actual?: string; nueva?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const actual = body.actual?.trim();
  const nueva = body.nueva?.trim();
  if (!actual || !nueva) {
    return NextResponse.json(
      { error: "Captura la contraseña actual y la nueva." },
      { status: 400 }
    );
  }
  if (nueva.length < 6) {
    return NextResponse.json(
      { error: "La nueva contraseña debe tener al menos 6 caracteres." },
      { status: 400 }
    );
  }
  if (actual === nueva) {
    return NextResponse.json(
      { error: "La nueva contraseña debe ser distinta a la actual." },
      { status: 400 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const tester = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signinErr } = await tester.auth.signInWithPassword({
    email: user.email,
    password: actual,
  });
  if (signinErr) {
    return NextResponse.json(
      { error: "La contraseña actual no es correcta." },
      { status: 400 }
    );
  }

  // Cambia password y limpia la marca de requiereCambioClave (si la tenía)
  // para no volver a forzar la pantalla de bienvenida.
  const admin = getSupabaseAdmin();
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const { requiereCambioClave: _ignore, ...restoMeta } = meta;
  void _ignore;
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password: nueva,
    user_metadata: restoMeta,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";
import { esAdmin } from "@/lib/supabase/roles";

/**
 * PUT /api/admin/perfil/contrasena  body: { actual, nueva }
 *
 * Cambia la contraseña del admin. Requiere conocer la contraseña actual.
 * Validamos creando un cliente "temporal" sin sesión y haciendo
 * signInWithPassword. Si funciona, actualizamos con la sesión existente.
 */
export async function PUT(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esAdmin(user) || !user.email) {
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
  if (nueva.length < 8) {
    return NextResponse.json(
      { error: "La nueva contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }
  if (actual === nueva) {
    return NextResponse.json(
      { error: "La nueva contraseña debe ser distinta a la actual." },
      { status: 400 }
    );
  }

  // Cliente aislado para validar la contraseña actual sin tocar la sesión real.
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

  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

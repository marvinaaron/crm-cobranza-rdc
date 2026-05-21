import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esAdmin } from "@/lib/supabase/roles";

/**
 * PUT /api/admin/perfil/correo  body: { nuevoEmail }
 *
 * Cambia el correo del admin logueado. Por seguridad, Supabase envía un
 * correo de confirmación al nuevo correo; hasta que el usuario haga click
 * en ese enlace, el cambio NO se aplica.
 */
export async function PUT(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esAdmin(user)) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body: { nuevoEmail?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const nuevo = body.nuevoEmail?.trim().toLowerCase();
  if (!nuevo) {
    return NextResponse.json(
      { error: "Captura el nuevo correo." },
      { status: 400 }
    );
  }
  if (nuevo === user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: "Ese ya es tu correo actual." },
      { status: 400 }
    );
  }

  // Verifica que no esté en uso por otro auth.user
  const admin = getSupabaseAdmin();
  const { data: lista, error: listErr } = await admin.auth.admin.listUsers({
    perPage: 200,
  });
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }
  const duplicado = lista.users.find(
    (u) => u.id !== user.id && u.email?.toLowerCase() === nuevo
  );
  if (duplicado) {
    return NextResponse.json(
      { error: "Ese correo ya está en uso por otra cuenta." },
      { status: 409 }
    );
  }

  // updateUser desde la sesión del propio usuario dispara el correo de confirmación.
  const { error } = await supabase.auth.updateUser({ email: nuevo });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    mensaje:
      "Te enviamos un correo de confirmación al nuevo correo. El cambio se aplica cuando hagas click en ese enlace.",
  });
}

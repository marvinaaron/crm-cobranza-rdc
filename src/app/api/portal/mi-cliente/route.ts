import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/portal/mi-cliente
 *
 * Devuelve el snapshot del cliente autenticado (lo que el admin guardó en
 * `app_metadata.snapshot` al crear/actualizar su acceso). Lo usa el portal
 * del cliente cuando no encuentra al cliente en su localStorage local, para
 * que pueda al menos mostrar sus datos básicos sin quedarse en "Cargando…".
 */
export async function GET() {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  const user = sess.user;
  if (!user) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }

  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  if (appMeta.rol !== "cliente") {
    return NextResponse.json(
      { error: "Esta cuenta no es de cliente del portal." },
      { status: 403 }
    );
  }

  const clienteIdRaw = appMeta.clienteId;
  const clienteId =
    typeof clienteIdRaw === "number"
      ? clienteIdRaw
      : typeof clienteIdRaw === "string"
        ? Number(clienteIdRaw)
        : NaN;
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json(
      { error: "La cuenta no tiene un cliente vinculado." },
      { status: 404 }
    );
  }

  // Si hay snapshot, lo devolvemos. Si no, traemos el user via admin para
  // intentar recuperarlo (algunos clientes pueden no tener snapshot todavía
  // si su acceso se creó antes de implementar esta función).
  let snapshot = appMeta.snapshot as Record<string, unknown> | undefined;
  if (!snapshot) {
    try {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin.auth.admin.getUserById(user.id);
      if (!error && data.user) {
        const meta = (data.user.app_metadata ?? {}) as Record<string, unknown>;
        snapshot = meta.snapshot as Record<string, unknown> | undefined;
      }
    } catch {
      // ignoramos; respondemos con stub
    }
  }

  return NextResponse.json({
    clienteId,
    email: user.email ?? "",
    snapshot: snapshot ?? null,
  });
}

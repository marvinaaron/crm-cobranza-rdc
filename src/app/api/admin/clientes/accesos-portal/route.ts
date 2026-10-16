import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listarActividadPortalPorCliente } from "@/lib/supabase/portal-acceso";

/** GET /api/admin/clientes/accesos-portal → { accesos: { [clienteId]: { lastSignInAt, lastPortalAt } } } */

export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const accesos = await listarActividadPortalPorCliente();
    return NextResponse.json({ ok: true, accesos });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudieron leer los accesos.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

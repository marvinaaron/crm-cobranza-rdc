import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  actualizarSnapshotCliente,
  type SnapshotCliente,
} from "@/lib/supabase/portal-acceso";

/**
 * POST /api/portal/sincronizar  body: {clienteId, snapshot}
 *
 * Actualiza el snapshot del cliente en su `app_metadata` para que el portal
 * del cliente vea los datos más recientes (razón social, honorarios, día
 * de pago, etc.). Si el cliente aún no tiene acceso al portal, no hace
 * nada y devuelve `{ok:false, razon:"sin_acceso_portal"}`.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: { clienteId?: number; snapshot?: SnapshotCliente } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (typeof body.clienteId !== "number" || !Number.isFinite(body.clienteId)) {
    return NextResponse.json(
      { error: "clienteId requerido." },
      { status: 400 }
    );
  }
  if (!body.snapshot || typeof body.snapshot !== "object") {
    return NextResponse.json(
      { error: "snapshot requerido." },
      { status: 400 }
    );
  }

  try {
    const result = await actualizarSnapshotCliente({
      clienteId: body.clienteId,
      snapshot: body.snapshot,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error inesperado." },
      { status: 400 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { requireModulo } from "@/lib/supabase/require-modulo";
import { notificarClienteEfirmaManual } from "@/lib/efirma/notificar";
import type { ClienteBasico } from "@/lib/efirma/notificar";

/**
 * POST /api/admin/efirmas/notificar
 * body: { clienteId, clientes?: ClienteBasico[] }
 */
export async function POST(request: NextRequest) {
  const guard = await requireModulo("efirmas");
  if (guard instanceof NextResponse) return guard;

  let body: { clienteId?: number; clientes?: ClienteBasico[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const clienteId = Number(body.clienteId);
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  const clientes = Array.isArray(body.clientes) ? body.clientes : [];
  const origin = request.nextUrl.origin;

  try {
    const resultado = await notificarClienteEfirmaManual(
      clienteId,
      clientes,
      origin
    );
    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, diasRestantes: resultado.diasRestantes });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al notificar." },
      { status: 500 }
    );
  }
}

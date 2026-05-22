import { NextResponse, type NextRequest } from "next/server";
import { requireModulo } from "@/lib/supabase/require-modulo";
import { procesarRecordatoriosAutomaticos } from "@/lib/efirma/notificar";
import type { ClienteBasico } from "@/lib/efirma/notificar";

/**
 * POST /api/admin/efirmas/procesar-recordatorios
 * Evalúa certificados y envía correos en umbrales 30/15/7/3 días.
 */
export async function POST(request: NextRequest) {
  const guard = await requireModulo("efirmas");
  if (guard instanceof NextResponse) return guard;

  let body: { clientes?: ClienteBasico[] } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const clientes = Array.isArray(body.clientes) ? body.clientes : [];
  const origin = request.nextUrl.origin;

  try {
    const resultado = await procesarRecordatoriosAutomaticos(clientes, origin);
    return NextResponse.json({ ok: true, ...resultado });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al procesar." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { verificarInfraCfdi } from "@/lib/cfdi/infra";

export const runtime = "nodejs";

/** GET — diagnóstico: tabla cliente_cfdi + bucket cfdi */
export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const estado = await verificarInfraCfdi();
    return NextResponse.json({ ok: true, ...estado });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error al verificar infra." },
      { status: 500 }
    );
  }
}

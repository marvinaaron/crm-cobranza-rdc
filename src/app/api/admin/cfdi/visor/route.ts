import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { construirVisorFiscal } from "@/lib/cfdi/visor-fiscal";
import { parseAlcanceDesdeSearchParams } from "@/lib/cfdi/alcance-periodo";

export const runtime = "nodejs";

/** GET — visor fiscal admin ?clienteId=&mes=&anio=&mesHasta=&anioHasta= */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const clienteId = Number.parseInt(req.nextUrl.searchParams.get("clienteId") ?? "", 10);
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  const parsed = parseAlcanceDesdeSearchParams(req.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const payload = await construirVisorFiscal({
      clienteId,
      mes: parsed.alcance.desde.mes,
      anio: parsed.alcance.desde.anio,
      mesHasta: parsed.alcance.hasta.mes,
      anioHasta: parsed.alcance.hasta.anio,
    });
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en visor." },
      { status: 500 }
    );
  }
}

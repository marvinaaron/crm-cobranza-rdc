import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import { construirVisorFiscal } from "@/lib/cfdi/visor-fiscal";
import { parseAlcanceDesdeSearchParams } from "@/lib/cfdi/alcance-periodo";

/** GET — visor fiscal: categorías del alcance + dashboard según régimen. */
export async function GET(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const clienteId = clienteIdDesdeUsuarioPortal(user);
  if (clienteId == null) {
    return NextResponse.json({ error: "Sin cliente asociado." }, { status: 403 });
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
    const { cliente: _c, ...resto } = payload;
    return NextResponse.json(resto);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en visor." },
      { status: 500 }
    );
  }
}

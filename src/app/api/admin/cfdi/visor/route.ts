import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { construirVisorFiscal } from "@/lib/cfdi/visor-fiscal";
import { getPeriodoFiscalVigente } from "@/lib/clientes";

export const runtime = "nodejs";

function parsePeriodo(searchParams: URLSearchParams) {
  const fiscal = getPeriodoFiscalVigente();
  const mes = Number.parseInt(searchParams.get("mes") ?? String(fiscal.mes), 10);
  const anio = Number.parseInt(searchParams.get("anio") ?? String(fiscal.anio), 10);
  if (!Number.isFinite(mes) || mes < 0 || mes > 11) return { error: "Mes inválido." as const };
  if (!Number.isFinite(anio) || anio < 2000) return { error: "Año inválido." as const };
  return { mes, anio };
}

/** GET — visor fiscal admin ?clienteId=&mes=&anio= */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const clienteId = Number.parseInt(req.nextUrl.searchParams.get("clienteId") ?? "", 10);
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  const periodo = parsePeriodo(req.nextUrl.searchParams);
  if ("error" in periodo) {
    return NextResponse.json({ error: periodo.error }, { status: 400 });
  }

  try {
    const payload = await construirVisorFiscal({
      clienteId,
      mes: periodo.mes,
      anio: periodo.anio,
    });
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en visor." },
      { status: 500 }
    );
  }
}

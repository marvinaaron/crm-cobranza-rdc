import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { armarPayloadConsultaCfdi } from "@/lib/cfdi/consulta-response";
import type { TipoCfdi } from "@/lib/cfdi/types";
import { getPeriodoFiscalVigente, periodoLabel } from "@/lib/clientes";

export const runtime = "nodejs";

function parsePeriodo(searchParams: URLSearchParams) {
  const fiscal = getPeriodoFiscalVigente();
  const mes = Number.parseInt(searchParams.get("mes") ?? String(fiscal.mes), 10);
  const anio = Number.parseInt(searchParams.get("anio") ?? String(fiscal.anio), 10);
  if (!Number.isFinite(mes) || mes < 0 || mes > 11) {
    return { error: "Mes inválido." as const };
  }
  if (!Number.isFinite(anio) || anio < 2000 || anio > 2100) {
    return { error: "Año inválido." as const };
  }
  return { mes, anio };
}

/** GET — consulta CFDI admin ?clienteId=&vista=clientes|proveedores&mes=&anio=&q= */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const clienteId = Number.parseInt(req.nextUrl.searchParams.get("clienteId") ?? "", 10);
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  const vistaRaw = req.nextUrl.searchParams.get("vista");
  const vista: TipoCfdi =
    vistaRaw === "proveedores" ? "recibido" : "emitido";

  const periodo = parsePeriodo(req.nextUrl.searchParams);
  if ("error" in periodo) {
    return NextResponse.json({ error: periodo.error }, { status: 400 });
  }

  const busqueda = req.nextUrl.searchParams.get("q") ?? undefined;

  try {
    const payload = await armarPayloadConsultaCfdi({
      clienteId,
      mes: periodo.mes,
      anio: periodo.anio,
      tipo: vista,
      busqueda,
    });

    return NextResponse.json({
      ok: true,
      vista: vistaRaw === "proveedores" ? "proveedores" : "clientes",
      periodo: { ...periodo, label: periodoLabel(periodo) },
      ...payload,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en consulta." },
      { status: 500 }
    );
  }
}

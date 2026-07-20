import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  armarPayloadConsultaCfdi,
  labelPeriodoConsulta,
} from "@/lib/cfdi/consulta-response";
import type { TipoCfdi } from "@/lib/cfdi/types";
import { parseAlcanceDesdeSearchParams } from "@/lib/cfdi/alcance-periodo";

export const runtime = "nodejs";

/** GET — consulta CFDI admin ?clienteId=&vista=&mes=&anio=&mesHasta=&anioHasta=&q= */
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

  const parsed = parseAlcanceDesdeSearchParams(req.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const busqueda = req.nextUrl.searchParams.get("q") ?? undefined;
  const { desde, hasta } = parsed.alcance;

  try {
    const payload = await armarPayloadConsultaCfdi({
      clienteId,
      mes: desde.mes,
      anio: desde.anio,
      mesHasta: hasta.mes,
      anioHasta: hasta.anio,
      tipo: vista,
      busqueda,
    });

    return NextResponse.json({
      ok: true,
      vista: vistaRaw === "proveedores" ? "proveedores" : "clientes",
      periodo: {
        mes: desde.mes,
        anio: desde.anio,
        mesHasta: hasta.mes,
        anioHasta: hasta.anio,
        label: labelPeriodoConsulta({
          mes: desde.mes,
          anio: desde.anio,
          mesHasta: hasta.mes,
          anioHasta: hasta.anio,
        }),
      },
      ...payload,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en consulta." },
      { status: 500 }
    );
  }
}

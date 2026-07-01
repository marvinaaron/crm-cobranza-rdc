import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import { listarCfdiCliente } from "@/lib/cfdi/db";
import { registroALineaConsulta } from "@/lib/cfdi/consulta";
import type { TipoCfdi } from "@/lib/cfdi/types";
import { getPeriodoFiscalVigente, periodoLabel } from "@/lib/clientes";

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

/** GET — consulta numérica de CFDI (clientes o proveedores). Sin descarga. */
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

  const vistaRaw = req.nextUrl.searchParams.get("vista");
  const vista: TipoCfdi =
    vistaRaw === "proveedores" ? "recibido" : "emitido";

  const periodo = parsePeriodo(req.nextUrl.searchParams);
  if ("error" in periodo) {
    return NextResponse.json({ error: periodo.error }, { status: 400 });
  }

  const busqueda = req.nextUrl.searchParams.get("q") ?? undefined;

  try {
    const { items } = await listarCfdiCliente({
      clienteId,
      mes: periodo.mes,
      anio: periodo.anio,
      tipo: vista,
      busqueda,
    });

    const lineas = items.map((r) => registroALineaConsulta(r, vista));
    const totalMes = Math.round(
      lineas
        .filter((l) => l.estatus === "vigente")
        .reduce((s, l) => s + l.total, 0) * 100
    ) / 100;

    return NextResponse.json({
      ok: true,
      vista: vistaRaw === "proveedores" ? "proveedores" : "clientes",
      periodo: { ...periodo, label: periodoLabel(periodo) },
      totalMes,
      cantidad: lineas.length,
      lineas,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en consulta." },
      { status: 500 }
    );
  }
}

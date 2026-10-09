import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import { listarCfdiCliente } from "@/lib/cfdi/db";
import type { TipoCfdi } from "@/lib/cfdi/types";
import { getPeriodoFiscalVigente, periodoLabel } from "@/lib/clientes";

function parsePeriodo(searchParams: URLSearchParams) {
  const fiscal = getPeriodoFiscalVigente();
  const mesRaw = searchParams.get("mes");
  const anioRaw = searchParams.get("anio");
  const mes = mesRaw != null ? Number.parseInt(mesRaw, 10) : fiscal.mes;
  const anio = anioRaw != null ? Number.parseInt(anioRaw, 10) : fiscal.anio;
  if (!Number.isFinite(mes) || mes < 0 || mes > 11) {
    return { error: "Mes inválido." as const };
  }
  if (!Number.isFinite(anio) || anio < 2000 || anio > 2100) {
    return { error: "Año inválido." as const };
  }
  return { mes, anio };
}

/** GET — listado de CFDI del cliente por periodo, tipo y búsqueda. */
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

  const periodo = parsePeriodo(req.nextUrl.searchParams);
  if ("error" in periodo) {
    return NextResponse.json({ error: periodo.error }, { status: 400 });
  }

  const tipoRaw = req.nextUrl.searchParams.get("tipo");
  const tipo: TipoCfdi | "todos" =
    tipoRaw === "emitido" || tipoRaw === "recibido" ? tipoRaw : "todos";
  const busqueda = req.nextUrl.searchParams.get("q") ?? undefined;

  try {
    const { items, resumen } = await listarCfdiCliente({
      clienteId,
      mes: periodo.mes,
      anio: periodo.anio,
      tipo,
      busqueda,
    });

    return NextResponse.json({
      ok: true,
      periodo: {
        mes: periodo.mes,
        anio: periodo.anio,
        label: periodoLabel(periodo),
      },
      filtro: { tipo, busqueda: busqueda ?? null },
      resumen,
      comprobantes: items.map((c) => ({
        id: c.id,
        uuid: c.uuidSat,
        tipo: c.tipo,
        tipoComprobante: c.tipoComprobante,
        fecha: c.fecha,
        rfcEmisor: c.rfcEmisor,
        nombreEmisor: c.nombreEmisor,
        rfcReceptor: c.rfcReceptor,
        nombreReceptor: c.nombreReceptor,
        contraparte:
          c.tipo === "emitido"
            ? { rfc: c.rfcReceptor, nombre: c.nombreReceptor }
            : { rfc: c.rfcEmisor, nombre: c.nombreEmisor },
        concepto: c.conceptoResumen,
        subtotal: c.subtotal,
        total: c.total,
        moneda: c.moneda,
        metadata: c.metadata,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al listar CFDI." },
      { status: 500 }
    );
  }
}

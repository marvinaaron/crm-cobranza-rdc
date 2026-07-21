import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  eliminarCfdiPeriodoCliente,
  eliminarCfdiPorUuid,
  listarCfdiRecientesCliente,
} from "@/lib/cfdi/db";
import type { TipoCfdi } from "@/lib/cfdi/types";

export const runtime = "nodejs";

/** GET — últimos CFDI de un cliente ?clienteId=&limit=10 */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const clienteId = Number(request.nextUrl.searchParams.get("clienteId"));
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  const limiteRaw = request.nextUrl.searchParams.get("limit");
  const limite = limiteRaw ? Number.parseInt(limiteRaw, 10) : 10;
  const limiteSeguro = Number.isFinite(limite) ? Math.min(Math.max(limite, 1), 50) : 10;

  try {
    const items = await listarCfdiRecientesCliente(clienteId, limiteSeguro);
    return NextResponse.json({
      ok: true,
      items: items.map((r) => ({
        id: r.id,
        uuid: r.uuidSat,
        tipo: r.tipo,
        total: r.total,
        moneda: r.moneda,
        fecha: r.fecha,
        mes: r.mes,
        anio: r.anio,
        concepto: r.conceptoResumen,
        nombreArchivo: r.nombreArchivo,
        categoriaVisor: r.categoriaVisor,
        estatus: r.estatus,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al listar CFDI." },
      { status: 500 }
    );
  }
}

/**
 * DELETE — elimina CFDI de un cliente.
 * ?clienteId=&uuid=           → un comprobante
 * ?clienteId=&mes=&anio=&vista=clientes|proveedores  → todo el periodo de esa vista
 */
export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const params = request.nextUrl.searchParams;
  const clienteId = Number(params.get("clienteId"));
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ error: "clienteId requerido." }, { status: 400 });
  }

  const uuid = params.get("uuid")?.trim().toUpperCase();
  if (uuid) {
    try {
      const eliminado = await eliminarCfdiPorUuid(clienteId, uuid);
      if (!eliminado) {
        return NextResponse.json({ error: "Comprobante no encontrado." }, { status: 404 });
      }
      return NextResponse.json({ ok: true, eliminados: 1 });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Error al eliminar." },
        { status: 500 }
      );
    }
  }

  const mes = Number(params.get("mes"));
  const anio = Number(params.get("anio"));
  if (!Number.isFinite(mes) || !Number.isFinite(anio)) {
    return NextResponse.json(
      { error: "Indica uuid o mes y anio para eliminar en lote." },
      { status: 400 }
    );
  }

  const vista = params.get("vista");
  let tipo: TipoCfdi | undefined;
  if (vista === "clientes") tipo = "emitido";
  else if (vista === "proveedores") tipo = "recibido";
  else if (vista != null && vista !== "todos") {
    return NextResponse.json({ error: "vista inválida." }, { status: 400 });
  }

  try {
    const eliminados = await eliminarCfdiPeriodoCliente({
      clienteId,
      mes,
      anio,
      tipo,
    });
    return NextResponse.json({ ok: true, eliminados });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al eliminar periodo." },
      { status: 500 }
    );
  }
}

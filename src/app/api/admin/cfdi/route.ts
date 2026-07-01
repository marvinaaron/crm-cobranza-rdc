import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listarCfdiRecientesCliente } from "@/lib/cfdi/db";

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
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al listar CFDI." },
      { status: 500 }
    );
  }
}

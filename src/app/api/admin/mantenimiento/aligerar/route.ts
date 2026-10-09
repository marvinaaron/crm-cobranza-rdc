import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { ejecutarRetencionArchivos } from "@/lib/mantenimiento-cumplimiento";

export const runtime = "nodejs";

/**
 * POST /api/admin/mantenimiento/aligerar  body { mesesConservar? }
 * Respalda el estado actual y quita los archivos embebidos de cumplimiento de
 * más de 3 meses en cumplimiento y 12 en facturas de honorarios. Conserva metadata.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const resultado = await ejecutarRetencionArchivos();
    const liberadoMb = (resultado.cumplimiento.liberados / 1024 / 1024).toFixed(2);
    return NextResponse.json({
      ok: true,
      aligerados: resultado.cumplimiento.aligerados,
      facturasArchivadas: resultado.facturas.aligeradas,
      bytesAntes: resultado.cumplimiento.bytesAntes,
      bytesDespues: resultado.cumplimiento.bytesDespues,
      liberados: resultado.cumplimiento.liberados,
      liberadoMb,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo optimizar." },
      { status: 500 }
    );
  }
}

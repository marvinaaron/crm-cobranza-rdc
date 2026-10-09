import { NextResponse, type NextRequest } from "next/server";
import { ejecutarRetencionArchivos } from "@/lib/mantenimiento-cumplimiento";
import {
  RETENCION_PDF_CUMPLIMIENTO_MESES,
  RETENCION_FACTURAS_HONORARIOS_MESES,
} from "@/lib/mantenimiento";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/retencion-cumplimiento
 *
 * Cron semanal: quita PDFs embebidos de cumplimiento (>3 meses) y facturas de
 * honorarios (>12 meses). Conserva metadata e iconos de “facturado”.
 * Respaldo automático previo vía `crearBackup("auto")`.
 */
export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET?.trim();
  const provided = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const resultado = await ejecutarRetencionArchivos();
    return NextResponse.json({
      ok: true,
      cumplimientoMeses: RETENCION_PDF_CUMPLIMIENTO_MESES,
      facturasMeses: RETENCION_FACTURAS_HONORARIOS_MESES,
      ...resultado,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "No se pudo aplicar la retención de cumplimiento.",
      },
      { status: 500 }
    );
  }
}

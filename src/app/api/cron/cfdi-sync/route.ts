import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/cfdi-sync
 * Desactivado: el SAT limita solicitudes de Descarga Masiva de por vida por e.firma.
 * La carga de CFDI es manual (admin → Carga, carpetas + metadata de cancelados).
 */
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    ok: true,
    omitido: true,
    motivo:
      "Sincronización automática CFDI desactivada. Usa carga manual de carpetas/XML + metadata para marcar cancelados.",
  });
}

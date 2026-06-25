import { NextResponse, type NextRequest } from "next/server";
import { ejecutarRecordatoriosFiscales } from "@/lib/portal/ejecutar-recordatorios-fiscales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/recordatorios-fiscales
 *
 * Cron diario (~8 AM CDMX): escalones de recordatorio fiscal y cobranza
 * (SAT sin cerrar, comprobante vencido, honorarios atrasados).
 *
 * Seguridad: `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron).
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
    const resultado = await ejecutarRecordatoriosFiscales();
    return NextResponse.json({ ok: true, ...resultado });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "No se pudieron procesar los recordatorios fiscales.",
      },
      { status: 500 }
    );
  }
}

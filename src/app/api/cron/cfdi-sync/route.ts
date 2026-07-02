import { NextResponse, type NextRequest } from "next/server";
import {
  ejecutarLoteSyncCfdi,
  urlContinuacionSyncCfdi,
} from "@/lib/cfdi/sync-job";
import { cfdiSyncAutomaticaActiva } from "@/lib/cfdi/sync-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET /api/cron/cfdi-sync?offset=0
 *
 * Cron semanal (lunes ~4 AM CDMX): descarga CFDI emitidos/recibidos de la
 * semana anterior para todos los clientes con e.firma + contraseña FIEL.
 *
 * Procesa lotes de 5 clientes y encadena el siguiente lote si quedan pendientes.
 * Urgencias: carga manual en admin → CFDI → Carga XML.
 *
 * Seguridad: Authorization: Bearer ${CRON_SECRET}
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

  if (!cfdiSyncAutomaticaActiva()) {
    return NextResponse.json({
      ok: true,
      omitido: true,
      motivo: "Sync automático programado a partir de julio 2026.",
    });
  }

  const offsetParam = request.nextUrl.searchParams.get("offset");
  const offset = Math.max(0, Number(offsetParam ?? "0") || 0);

  try {
    const resultado = await ejecutarLoteSyncCfdi(offset);

    if (resultado.pendientes > 0) {
      const siguiente = offset + resultado.procesados;
      const secret = process.env.CRON_SECRET?.trim();
      if (secret) {
        const url = urlContinuacionSyncCfdi(siguiente);
        void fetch(url, {
          headers: { Authorization: `Bearer ${secret}` },
        }).catch(() => {
          /* el siguiente lote se reintentará el próximo lunes */
        });
      }
    }

    return NextResponse.json({ ok: true, ...resultado });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "No se pudo ejecutar la sincronización CFDI.",
      },
      { status: 500 }
    );
  }
}

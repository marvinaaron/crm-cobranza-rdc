import { NextResponse, type NextRequest } from "next/server";
import { enviarPushATodosLosAdmins } from "@/lib/push/server";
import { leerAgendaCierreRegistros } from "@/lib/supabase/agenda-cierre-db";
import {
  alertasWorkflowParaHoy,
  ahoraEnCdmx,
  pushesParaEnviar,
  type SlotCron,
} from "@/lib/agenda-cierre-notificaciones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/workflow-despacho?slot=manana|tarde
 *
 * Cron diario (ver `vercel.json`). Revisa las 9 tareas del workflow del
 * despacho con fecha de vencimiento y envía push a todos los admins:
 *
 *   · Mañana vence (1 día antes) — solo slot "manana"
 *   · HOY vence (día del deadline) — ambos slots
 *   · ATRASADA — ambos slots (re-recuerda cada slot mientras no se cierre)
 *
 * Slots:
 *   - 9 AM CDMX → ?slot=manana (default)
 *   - 3 PM CDMX → ?slot=tarde (recordatorio si aún no marcas la tarea)
 *
 * El progreso se lee desde Supabase (`crm_estado`, clave `agenda_cierre`),
 * sincronizado cuando marcas tareas en el dashboard.
 *
 * Seguridad: `Authorization: Bearer ${CRON_SECRET}` (estándar Vercel Cron).
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

  const slotParam = request.nextUrl.searchParams.get("slot");
  const slot: SlotCron = slotParam === "tarde" ? "tarde" : "manana";

  const hoy = ahoraEnCdmx();
  const registros = await leerAgendaCierreRegistros();
  const alertas = alertasWorkflowParaHoy(hoy, registros, slot);
  const pushes = pushesParaEnviar(alertas, slot, hoy);

  if (pushes.length === 0) {
    return NextResponse.json({
      ok: true,
      alertas: 0,
      slot,
      fecha: hoy.toISOString().slice(0, 10),
    });
  }

  let pushEnviadas = 0;
  for (const push of pushes) {
    const resultado = await enviarPushATodosLosAdmins({
      title: push.title,
      body: push.body,
      url: "/dashboard",
      tag: push.tag,
      renotify: true,
      requireInteraction: push.requireInteraction,
      data: {
        tipo: "workflow_despacho_admin",
        modo: push.modo,
        tareaIds: push.tareaIds,
        tipoDominante: push.tipoDominante,
        slot,
      },
    });
    pushEnviadas += resultado.enviadas;
  }

  return NextResponse.json({
    ok: true,
    alertas: alertas.length,
    pushes: pushes.length,
    pushEnviadas,
    slot,
    fecha: hoy.toISOString().slice(0, 10),
    detalle: alertas.map((a) => ({
      id: a.tarea.id,
      tipo: a.tipo,
      titulo: a.tarea.titulo,
    })),
  });
}

import { NextResponse, type NextRequest } from "next/server";
import { enviarPushATodosLosAdmins } from "@/lib/push/server";
import { leerAgendaCierreRegistros } from "@/lib/supabase/agenda-cierre-db";
import {
  alertasWorkflowParaHoy,
  ahoraEnCdmx,
} from "@/lib/agenda-cierre-notificaciones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/workflow-despacho
 *
 * Cron diario (ver `vercel.json`). Revisa las 9 tareas del workflow del
 * despacho con fecha de vencimiento y envía push a todos los admins:
 *
 *   · Mañana vence (1 día antes)
 *   · HOY vence (día del deadline)
 *   · ATRASADA (cada mañana mientras no esté marcada como completada)
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

  const hoy = ahoraEnCdmx();
  const registros = await leerAgendaCierreRegistros();
  const alertas = alertasWorkflowParaHoy(hoy, registros);

  if (alertas.length === 0) {
    return NextResponse.json({
      ok: true,
      alertas: 0,
      fecha: hoy.toISOString().slice(0, 10),
    });
  }

  let pushEnviadas = 0;
  for (const alerta of alertas) {
    const resultado = await enviarPushATodosLosAdmins({
      title: alerta.title,
      body: alerta.body,
      url: "/dashboard",
      tag: alerta.tag,
      requireInteraction: alerta.tipo !== "manana",
      data: {
        tipo: "workflow_despacho_admin",
        tareaId: alerta.tarea.id,
        mes: alerta.tarea.mes,
        anio: alerta.tarea.anio,
        alertaTipo: alerta.tipo,
      },
    });
    pushEnviadas += resultado.enviadas;
  }

  return NextResponse.json({
    ok: true,
    alertas: alertas.length,
    pushEnviadas,
    fecha: hoy.toISOString().slice(0, 10),
    detalle: alertas.map((a) => ({
      id: a.tarea.id,
      tipo: a.tipo,
      titulo: a.tarea.titulo,
    })),
  });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
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
 * POST /api/admin/workflow-despacho/probar
 *
 * Endpoint de prueba manual: cualquier admin autenticado puede dispararlo
 * para validar que las notificaciones del workflow del despacho llegan
 * bien al celular. Replica la lógica del cron sin esperar a las 9 AM.
 *
 * Body (todo opcional):
 *   { slot?: "manana" | "tarde", force?: boolean }
 *
 *   - `slot`: por defecto "manana". Cambia a "tarde" para probar el
 *     recordatorio vespertino.
 *   - `force`: si es true y NO hay alertas reales hoy, manda una push de
 *     prueba para confirmar que el canal funciona.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: { slot?: string; force?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // sin body es válido
  }

  const slot: SlotCron = body.slot === "tarde" ? "tarde" : "manana";
  const force = body.force === true;

  const hoy = ahoraEnCdmx();
  const registros = await leerAgendaCierreRegistros();
  const alertas = alertasWorkflowParaHoy(hoy, registros, slot);
  const pushes = pushesParaEnviar(alertas, slot, hoy);

  if (pushes.length === 0) {
    if (!force) {
      return NextResponse.json({
        ok: true,
        modo: "prueba",
        slot,
        alertas: 0,
        mensaje:
          "Hoy no hay tareas que reportar (todas completadas o ninguna vence/atrasada). Vuelve a llamar con { force: true } si quieres una push de prueba de todas formas.",
        fecha: hoy.toISOString().slice(0, 10),
      });
    }
    const resultado = await enviarPushATodosLosAdmins({
      title: "🧪 Prueba — Workflow del despacho",
      body: `Canal de push activo. Slot: ${slot}. No hay alertas reales hoy.`,
      url: "/dashboard",
      tag: `workflow-prueba-${Date.now()}`,
      renotify: true,
      requireInteraction: false,
      data: { tipo: "workflow_despacho_admin", modo: "prueba", slot },
    });
    return NextResponse.json({
      ok: true,
      modo: "prueba",
      slot,
      alertas: 0,
      pushEnviadas: resultado.enviadas,
      mensaje: "Push de prueba enviada (no había alertas reales).",
    });
  }

  let pushEnviadas = 0;
  for (const push of pushes) {
    const resultado = await enviarPushATodosLosAdmins({
      title: push.title,
      body: push.body,
      url: "/dashboard",
      tag: `${push.tag}-prueba-${Date.now()}`,
      renotify: true,
      requireInteraction: push.requireInteraction,
      data: {
        tipo: "workflow_despacho_admin",
        modo: "prueba",
        submodo: push.modo,
        tareaIds: push.tareaIds,
        tipoDominante: push.tipoDominante,
        slot,
      },
    });
    pushEnviadas += resultado.enviadas;
  }

  return NextResponse.json({
    ok: true,
    modo: "prueba",
    slot,
    alertas: alertas.length,
    pushes: pushes.length,
    pushEnviadas,
    fecha: hoy.toISOString().slice(0, 10),
    detalle: alertas.map((a) => ({
      id: a.tarea.id,
      tipo: a.tipo,
      titulo: a.tarea.titulo,
    })),
  });
}

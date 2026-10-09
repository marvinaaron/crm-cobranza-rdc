import {
  leerCrmEstadoCompleto,
  guardarCrmEstadoCompleto,
  type CrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";
import {
  aplicarMarcasEscalamiento,
  planificadoANotificacion,
  planificarRecordatoriosFiscales,
  type RecordatorioFiscalPlanificado,
} from "@/lib/portal/recordatorios-fiscales";
import {
  normalizarNotificaciones,
  type Notificacion,
} from "@/lib/notificaciones";
import { buildAdminPushExtras, buildClientePushExtras } from "@/lib/push/payload";
import {
  enviarPushACliente,
  enviarPushATodosLosAdmins,
} from "@/lib/push/server";
import { ahoraEnCdmx } from "@/lib/agenda-cierre-notificaciones";

export type ResultadoCronRecordatoriosFiscales = {
  planes: number;
  notificacionesCliente: number;
  notificacionesAdmin: number;
  pushCliente: number;
  pushAdmin: number;
};

function esDuplicada(notif: Notificacion, nueva: Notificacion): boolean {
  return (
    !notif.leidaEn &&
    notif.tipo === nueva.tipo &&
    notif.destinatario === nueva.destinatario &&
    notif.clienteId === nueva.clienteId &&
    notif.periodo.mes === nueva.periodo.mes &&
    notif.periodo.anio === nueva.periodo.anio &&
    (notif.categoria ?? null) === (nueva.categoria ?? null) &&
    (notif.escalamientoClave ?? null) === (nueva.escalamientoClave ?? null) &&
    (notif.encargoId ?? null) === (nueva.encargoId ?? null)
  );
}

function mergeNotificaciones(
  prev: Notificacion[],
  nuevas: Notificacion[]
): Notificacion[] {
  let out = [...prev];
  for (const n of nuevas) {
    out = [n, ...out.filter((p) => !esDuplicada(p, n))];
  }
  return normalizarNotificaciones(out);
}

async function enviarPushPlan(
  p: RecordatorioFiscalPlanificado,
  notif: Notificacion
): Promise<number> {
  if (p.destinatario === "cliente") {
    const extras = buildClientePushExtras({
      tipo: p.tipo,
      href: p.href,
    });
    const res = await enviarPushACliente(p.clienteId, {
      title: p.titulo,
      body: p.detalle,
      url: extras.url,
      tag: `cli-${p.clienteId}-${p.escalamientoClave}`,
      renotify: true,
      requireInteraction: p.requireInteraction,
      actions: extras.actions,
      data: {
        tipo: p.tipo,
        escalamientoClave: p.escalamientoClave,
        actionUrls: extras.actionUrls,
      },
    });
    return res.enviadas;
  }

  const extras = buildAdminPushExtras({
    tipo: p.tipo,
    clienteId: p.clienteId,
    href: p.href,
  });
  const res = await enviarPushATodosLosAdmins({
    title: p.titulo,
    body: p.detalle,
    url: extras.url,
    tag: `admin-${p.escalamientoClave}`,
    renotify: true,
    requireInteraction: p.requireInteraction,
    actions: extras.actions,
    data: {
      tipo: p.tipo,
      clienteId: p.clienteId,
      notificacionId: notif.id,
      actionUrls: extras.actionUrls,
    },
  });
  return res.enviadas;
}

/**
 * Evalúa recordatorios fiscales del día, persiste estado y envía push.
 * Usado por el cron diario y testeable desde admin si hace falta.
 */
export async function ejecutarRecordatoriosFiscales(
  hoy = ahoraEnCdmx()
): Promise<ResultadoCronRecordatoriosFiscales> {
  const estado = await leerCrmEstadoCompleto();
  const planes = planificarRecordatoriosFiscales({
    clientes: estado.clientes,
    cumplimiento: estado.cumplimiento,
    hoy,
  });

  if (planes.length === 0) {
    return {
      planes: 0,
      notificacionesCliente: 0,
      notificacionesAdmin: 0,
      pushCliente: 0,
      pushAdmin: 0,
    };
  }

  const ahora = new Date().toISOString();
  const notificacionesNuevas = planes.map((p) => planificadoANotificacion(p, ahora));

  const marcas = aplicarMarcasEscalamiento(
    { cumplimiento: estado.cumplimiento, clientes: estado.clientes },
    planes,
    ahora
  );

  const estadoActualizado: CrmEstadoCompleto = {
    ...estado,
    cumplimiento: marcas.cumplimiento,
    clientes: marcas.clientes,
    notificaciones: mergeNotificaciones(estado.notificaciones, notificacionesNuevas),
  };

  await guardarCrmEstadoCompleto(estadoActualizado);

  let pushCliente = 0;
  let pushAdmin = 0;
  for (let i = 0; i < planes.length; i += 1) {
    const enviadas = await enviarPushPlan(planes[i], notificacionesNuevas[i]);
    if (planes[i].destinatario === "cliente") pushCliente += enviadas;
    else pushAdmin += enviadas;
  }

  return {
    planes: planes.length,
    notificacionesCliente: planes.filter((p) => p.destinatario === "cliente").length,
    notificacionesAdmin: planes.filter((p) => p.destinatario === "admin").length,
    pushCliente,
    pushAdmin,
  };
}

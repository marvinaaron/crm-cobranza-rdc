import {
  esCompletada,
  generarTareasMes,
  keyTarea,
  urgenciaTarea,
  type CategoriaTarea,
  type TareaCierre,
} from "@/lib/agenda-cierre";
import type { MapaAgendaCierre } from "@/lib/supabase/agenda-cierre-db";

export type AlertaWorkflowDespacho = {
  tarea: TareaCierre;
  tipo: "hoy" | "manana" | "atrasada";
  tag: string;
  title: string;
  body: string;
};

/**
 * Slot del día en que corre el cron. Sirve para diferenciar el tag de la push
 * y para decidir qué tipos de alerta enviar:
 *   - "manana": cron matutino (9 AM). Envia "mañana", "hoy", "atrasada".
 *   - "tarde":  cron vespertino (3 PM). Envia solo "hoy" y "atrasada" si
 *               todavía no está completada (segunda llamada del día).
 */
export type SlotCron = "manana" | "tarde";

const NOMBRES_MES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const EMOJI_CATEGORIA: Record<CategoriaTarea, string> = {
  documentos: "📄",
  contabilidad: "📊",
  nominas: "💼",
  sat: "🏛️",
  imss: "🏥",
};

const LABEL_CATEGORIA: Record<CategoriaTarea, string> = {
  documentos: "Documentos",
  contabilidad: "Contabilidad",
  nominas: "Nóminas",
  sat: "SAT",
  imss: "IMSS",
};

function soloFecha(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function sumarDias(d: Date, dias: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + dias);
  return out;
}

function formatoFechaCorta(d: Date): string {
  return d
    .toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .replace(/\./g, "")
    .toLowerCase();
}

function etiquetaMes(tarea: TareaCierre): string {
  return `${NOMBRES_MES[tarea.mes]} ${tarea.anio}`;
}

function construirMensaje(
  tarea: TareaCierre,
  tipo: AlertaWorkflowDespacho["tipo"],
  slot: SlotCron
): { title: string; body: string } {
  const emoji = EMOJI_CATEGORIA[tarea.categoria];
  const categoria = LABEL_CATEGORIA[tarea.categoria];
  const mes = etiquetaMes(tarea);
  const fecha = formatoFechaCorta(tarea.fechaDeadline);
  const recordatorio = slot === "tarde" ? " (recordatorio de la tarde)" : "";

  if (tipo === "hoy") {
    return {
      title: `${emoji} HOY vence — ${tarea.titulo}`,
      body: `${categoria} · ${mes}${recordatorio}. Toca para abrir el workflow del despacho.`,
    };
  }
  if (tipo === "manana") {
    return {
      title: `⏰ Mañana vence — ${tarea.titulo}`,
      body: `${categoria} · ${mes} · ${fecha}. Prepáralo hoy desde el dashboard.`,
    };
  }
  return {
    title: `⚠️ ATRASADA — ${tarea.titulo}`,
    body: `${categoria} · debió cerrarse el ${fecha}${recordatorio}. Revisa el workflow del despacho.`,
  };
}

/**
 * Devuelve las alertas push que corresponden enviar hoy para el mes en curso.
 *
 * - Slot "mañana" (cron 9 AM): envía "mañana", "hoy" y "atrasada".
 * - Slot "tarde" (cron 3 PM): envía solo "hoy" y "atrasada" como recordatorio
 *   si la tarea aún no se marcó como completada.
 *
 * Omite tareas ya marcadas como completadas en Supabase.
 */
export function alertasWorkflowParaHoy(
  hoy: Date,
  registros: MapaAgendaCierre,
  slot: SlotCron = "manana"
): AlertaWorkflowDespacho[] {
  const ref = soloFecha(hoy);
  const manana = sumarDias(ref, 1);
  const tareas = generarTareasMes(ref.getMonth(), ref.getFullYear());
  const alertas: AlertaWorkflowDespacho[] = [];
  const isoHoy = ref.toISOString().slice(0, 10);

  for (const tarea of tareas) {
    const reg = registros[keyTarea(tarea)] ?? null;
    if (esCompletada(reg)) continue;

    const deadline = soloFecha(tarea.fechaDeadline);
    const urgencia = urgenciaTarea(tarea, ref);
    const baseKey = `${tarea.anio}-${String(tarea.mes + 1).padStart(2, "0")}-${tarea.id}`;

    if (urgencia === "hoy") {
      const tipo = "hoy" as const;
      alertas.push({
        tarea,
        tipo,
        tag: `workflow-hoy-${baseKey}-${slot}`,
        ...construirMensaje(tarea, tipo, slot),
      });
      continue;
    }

    if (urgencia === "atrasada") {
      const tipo = "atrasada" as const;
      alertas.push({
        tarea,
        tipo,
        tag: `workflow-atrasada-${baseKey}-${isoHoy}-${slot}`,
        ...construirMensaje(tarea, tipo, slot),
      });
      continue;
    }

    // "mañana" solo en el cron matutino: por la tarde sería ruido.
    if (slot === "manana" && deadline.getTime() === manana.getTime()) {
      const tipo = "manana" as const;
      alertas.push({
        tarea,
        tipo,
        tag: `workflow-manana-${baseKey}`,
        ...construirMensaje(tarea, tipo, slot),
      });
    }
  }

  return alertas;
}

/**
 * Push a enviar (sea individual o resumen agrupado). Es el shape final
 * que consumen los handlers de cron y el endpoint de prueba.
 */
export type PushWorkflowDespacho = {
  title: string;
  body: string;
  tag: string;
  requireInteraction: boolean;
  /** Para que `data` incluya los IDs de las tareas involucradas. */
  tareaIds: string[];
  /** "individual" si vino de una sola alerta; "resumen" si agrupa 2+. */
  modo: "individual" | "resumen";
  /** Tipo dominante (para diagnóstico/data). */
  tipoDominante: AlertaWorkflowDespacho["tipo"];
};

/**
 * Genera el resumen de varias alertas en UNA sola push.
 *
 * Ejemplo body: "🚨 3 atrasadas · 🔴 1 hoy · ⏰ 1 mañana — CSF, EMA y 3 más"
 */
function construirResumen(
  alertas: AlertaWorkflowDespacho[],
  slot: SlotCron,
  isoHoy: string
): PushWorkflowDespacho {
  const atrasadas = alertas.filter((a) => a.tipo === "atrasada");
  const hoy = alertas.filter((a) => a.tipo === "hoy");
  const manana = alertas.filter((a) => a.tipo === "manana");

  const partes: string[] = [];
  if (atrasadas.length > 0) partes.push(`🚨 ${atrasadas.length} atrasada${atrasadas.length > 1 ? "s" : ""}`);
  if (hoy.length > 0) partes.push(`🔴 ${hoy.length} hoy`);
  if (manana.length > 0) partes.push(`⏰ ${manana.length} mañana`);
  const resumenConteo = partes.join(" · ");

  // Lista corta de títulos para que se vea concreto sin saturar.
  const ordenadas = [...atrasadas, ...hoy, ...manana];
  const muestras = ordenadas.slice(0, 3).map((a) => a.tarea.titulo);
  const resto = ordenadas.length - muestras.length;
  const listado =
    resto > 0
      ? `${muestras.join(", ")} y ${resto} más`
      : muestras.join(", ");

  const recordatorio = slot === "tarde" ? " (recordatorio de la tarde)" : "";
  const total = alertas.length;
  const emojiTitulo = atrasadas.length > 0 ? "⚠️" : hoy.length > 0 ? "📋" : "⏰";

  const tipoDominante: AlertaWorkflowDespacho["tipo"] =
    atrasadas.length > 0 ? "atrasada" : hoy.length > 0 ? "hoy" : "manana";

  return {
    title: `${emojiTitulo} ${total} tareas del workflow del despacho`,
    body: `${resumenConteo}${recordatorio}. ${listado}. Toca para abrir el dashboard.`,
    tag: `workflow-resumen-${isoHoy}-${slot}`,
    requireInteraction: atrasadas.length > 0 || hoy.length > 0,
    tareaIds: ordenadas.map((a) => a.tarea.id),
    modo: "resumen",
    tipoDominante,
  };
}

/**
 * Convierte la lista de alertas en las pushes finales a enviar:
 *
 *   - 0 alertas → []
 *   - 1 alerta → 1 push con detalle completo (igual que antes).
 *   - 2+ alertas → 1 sola push resumen ("3 atrasadas · 1 hoy · 1 mañana").
 *
 * Esto evita el spam de N pushes por N tareas pendientes.
 */
export function pushesParaEnviar(
  alertas: AlertaWorkflowDespacho[],
  slot: SlotCron,
  hoy: Date
): PushWorkflowDespacho[] {
  if (alertas.length === 0) return [];

  if (alertas.length === 1) {
    const a = alertas[0];
    return [
      {
        title: a.title,
        body: a.body,
        tag: a.tag,
        requireInteraction: a.tipo !== "manana",
        tareaIds: [a.tarea.id],
        modo: "individual",
        tipoDominante: a.tipo,
      },
    ];
  }

  const isoHoy = soloFecha(hoy).toISOString().slice(0, 10);
  return [construirResumen(alertas, slot, isoHoy)];
}

/** Fecha actual en zona horaria Ciudad de México (para el cron). */
export function ahoraEnCdmx(): Date {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (tipo: string) =>
    Number(parts.find((p) => p.type === tipo)?.value ?? "0");
  return new Date(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute")
  );
}

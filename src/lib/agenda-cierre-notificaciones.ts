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
  tipo: AlertaWorkflowDespacho["tipo"]
): { title: string; body: string } {
  const emoji = EMOJI_CATEGORIA[tarea.categoria];
  const categoria = LABEL_CATEGORIA[tarea.categoria];
  const mes = etiquetaMes(tarea);
  const fecha = formatoFechaCorta(tarea.fechaDeadline);

  if (tipo === "hoy") {
    return {
      title: `${emoji} HOY vence — ${tarea.titulo}`,
      body: `${categoria} · ${mes}. Toca para abrir el workflow del despacho.`,
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
    body: `${categoria} · debió cerrarse el ${fecha}. Revisa el workflow del despacho.`,
  };
}

/**
 * Devuelve las alertas push que corresponden enviar hoy para el mes en curso.
 * Omite tareas ya marcadas como completadas en Supabase.
 */
export function alertasWorkflowParaHoy(
  hoy: Date,
  registros: MapaAgendaCierre
): AlertaWorkflowDespacho[] {
  const ref = soloFecha(hoy);
  const manana = sumarDias(ref, 1);
  const tareas = generarTareasMes(ref.getMonth(), ref.getFullYear());
  const alertas: AlertaWorkflowDespacho[] = [];

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
        tag: `workflow-hoy-${baseKey}`,
        ...construirMensaje(tarea, tipo),
      });
      continue;
    }

    if (urgencia === "atrasada") {
      const tipo = "atrasada" as const;
      const isoHoy = ref.toISOString().slice(0, 10);
      alertas.push({
        tarea,
        tipo,
        tag: `workflow-atrasada-${baseKey}-${isoHoy}`,
        ...construirMensaje(tarea, tipo),
      });
      continue;
    }

    if (deadline.getTime() === manana.getTime()) {
      const tipo = "manana" as const;
      alertas.push({
        tarea,
        tipo,
        tag: `workflow-manana-${baseKey}`,
        ...construirMensaje(tarea, tipo),
      });
    }
  }

  return alertas;
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

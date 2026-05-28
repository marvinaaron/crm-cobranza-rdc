/**
 * Agenda de cierre del despacho RDC.
 *
 * Tareas internas que NO dependen del cliente individual sino del flujo
 * operativo del despacho mes a mes. Son tareas binarias (hechas / no
 * hechas) por mes calendario completo.
 *
 * Plantilla acordada con Aaron (mayo 2026):
 *
 *   Día 1-3   · Descarga de CSF + Opinión de Cumplimiento (por cliente)
 *   Día 4-6   · Descarga de EMA, EBA, SIPARE y ISN
 *   Día 7-13  · Contabilidades (cálculo de impuestos)
 *   Día 14    · Nóminas + altas IMSS + lista de raya (1ª quincena)
 *   Día 15    · Timbrado de nómina (1ª quincena)
 *   Día 16    · Envío de líneas de captura SAT
 *   Día 17    · Bajas de IMSS
 *   Día 28    · Nóminas + lista de raya (2ª quincena)
 *   Día 29-30 · Timbrado de nómina (2ª quincena)
 *
 * Las fechas se ajustan a día hábil (L-V) más cercano:
 *   - Sábado o festivo en sábado → viernes anterior (anticipar entrega).
 *   - Domingo o festivo en domingo → lunes siguiente.
 *   - Festivo entre semana → mismo criterio (busca el hábil más cercano,
 *     prefiriendo atrás en empate para que el cierre vaya antes).
 *
 * Persistencia del progreso:
 *   - `localStorage` (formato JSON), key `agenda-cierre-completadas`.
 *   - Cada entrada es `${anio}-${mesPadded}-${tareaId} → true`.
 *   - Si más adelante queremos histórico cross-device, migrar a tabla
 *     simple `agenda_cierre_completadas`. ~108 filas/año, trivial.
 */

import { esInhabil } from "@/lib/portal/fechas-fiscales";

export type CategoriaTarea =
  | "documentos"
  | "contabilidad"
  | "nominas"
  | "sat"
  | "imss";

/** Definición estática de una tarea, sin fecha resuelta todavía. */
type PlantillaTarea = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaTarea;
  /** Día natural en que termina la tarea. Es el "deadline" interno. */
  diaDeadline: number;
  /** Si es rango (ej. 1-3), opcionalmente día de inicio. */
  diaInicio?: number;
};

/** Tarea ya resuelta para un mes/año concreto. */
export type TareaCierre = PlantillaTarea & {
  /** Fecha real del deadline una vez ajustada a día hábil. */
  fechaDeadline: Date;
  /** Mes calendario al que pertenece la tarea (mes 0-11, año 4 dígitos). */
  mes: number;
  anio: number;
};

/** Estado vivo de una tarea cuando se muestra en el dashboard. */
export type EstadoTarea =
  | "atrasada" // fecha pasó y no está completada
  | "hoy" // fecha es hoy
  | "proxima" // fecha futura, no completada
  | "completada"; // marcada como hecha (sin importar la fecha)

export const PLANTILLA_AGENDA: PlantillaTarea[] = [
  {
    id: "csf-opinion",
    titulo: "CSF y Opinión de Cumplimiento",
    descripcion:
      "Descarga de Constancias de Situación Fiscal y Opiniones del SAT (32-D) para todos los clientes activos.",
    categoria: "documentos",
    diaInicio: 1,
    diaDeadline: 3,
  },
  {
    id: "ema-sipare-isn",
    titulo: "EMA, EBA, SIPARE e ISN",
    descripcion:
      "Descarga de cédulas EMA/EBA, línea SIPARE para IMSS y línea del Impuesto Sobre Nómina estatal.",
    categoria: "imss",
    diaInicio: 4,
    diaDeadline: 6,
  },
  {
    id: "contabilidades",
    titulo: "Contabilidades del mes",
    descripcion:
      "Cálculo de contabilidades para determinar impuestos por cliente (ISR/IVA).",
    categoria: "contabilidad",
    diaInicio: 7,
    diaDeadline: 13,
  },
  {
    id: "nominas-q1",
    titulo: "Nóminas y altas IMSS (1ª quincena)",
    descripcion:
      "Procesamiento de nóminas de la 1ª quincena, altas en IMSS y envío de lista de raya.",
    categoria: "nominas",
    diaDeadline: 14,
  },
  {
    id: "timbrado-q1",
    titulo: "Timbrado de nómina (1ª quincena)",
    descripcion: "Envío del timbrado fiscal de la nómina de la 1ª quincena.",
    categoria: "nominas",
    diaDeadline: 15,
  },
  {
    id: "sat-lineas-captura",
    titulo: "Líneas de captura SAT enviadas",
    descripcion:
      "Hito de cierre: todas las líneas de captura de impuestos SAT entregadas a los clientes.",
    categoria: "sat",
    diaDeadline: 16,
  },
  {
    id: "bajas-imss",
    titulo: "Bajas de IMSS",
    descripcion: "Tramitación de bajas mensuales ante el IMSS.",
    categoria: "imss",
    diaDeadline: 17,
  },
  {
    id: "nominas-q2",
    titulo: "Nóminas (2ª quincena)",
    descripcion:
      "Procesamiento de nóminas de la 2ª quincena y envío de lista de raya.",
    categoria: "nominas",
    diaDeadline: 28,
  },
  {
    id: "timbrado-q2",
    titulo: "Timbrado de nómina (2ª quincena)",
    descripcion:
      "Envío del timbrado fiscal de la nómina de la 2ª quincena (días 29-30).",
    categoria: "nominas",
    diaInicio: 29,
    diaDeadline: 30,
  },
];

/**
 * Ajusta una fecha al día hábil L-V más cercano.
 * Empata → prefiere ir atrás (las tareas internas se anticipan).
 */
function ajustarADiaHabilCercano(d: Date): Date {
  if (!esInhabil(d)) return d;

  // Buscar día hábil hacia atrás
  let atras = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
  let distAtras = 1;
  while (esInhabil(atras) && distAtras < 14) {
    atras = new Date(atras.getFullYear(), atras.getMonth(), atras.getDate() - 1);
    distAtras += 1;
  }

  // Buscar día hábil hacia adelante
  let adelante = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  let distAdelante = 1;
  while (esInhabil(adelante) && distAdelante < 14) {
    adelante = new Date(
      adelante.getFullYear(),
      adelante.getMonth(),
      adelante.getDate() + 1
    );
    distAdelante += 1;
  }

  // Empate o atrás más cerca → atrás. Adelante estrictamente menor → adelante.
  return distAdelante < distAtras ? adelante : atras;
}

/** Devuelve el último día natural del mes (28-31). */
function ultimoDiaDelMes(mes: number, anio: number): number {
  return new Date(anio, mes + 1, 0).getDate();
}

/**
 * Genera las 9 tareas del cierre para un mes calendario concreto, con sus
 * fechas ajustadas a día hábil L-V. Si el "diaDeadline" definido en la
 * plantilla excede el número de días reales del mes (ej. febrero con
 * 28 días y diaDeadline=30), usa el último día del mes como base.
 */
export function generarTareasMes(mes: number, anio: number): TareaCierre[] {
  const ultDia = ultimoDiaDelMes(mes, anio);
  return PLANTILLA_AGENDA.map((p) => {
    const dia = Math.min(p.diaDeadline, ultDia);
    const fechaBase = new Date(anio, mes, dia);
    const fechaAjustada = ajustarADiaHabilCercano(fechaBase);
    return {
      ...p,
      fechaDeadline: fechaAjustada,
      mes,
      anio,
    };
  });
}

// ── Persistencia en localStorage ────────────────────────────────────

const STORAGE_KEY = "agenda-cierre-completadas";

type Mapa = Record<string, true>;

function keyTarea(tarea: TareaCierre): string {
  return `${tarea.anio}-${String(tarea.mes + 1).padStart(2, "0")}-${tarea.id}`;
}

function leerMapa(): Mapa {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Mapa;
  } catch {
    return {};
  }
}

function escribirMapa(mapa: Mapa) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mapa));
  } catch {
    // Sin acceso a localStorage (modo privado): silencioso.
  }
}

export function estaCompletada(tarea: TareaCierre): boolean {
  return leerMapa()[keyTarea(tarea)] === true;
}

export function marcarCompletada(tarea: TareaCierre, valor: boolean) {
  const mapa = leerMapa();
  const k = keyTarea(tarea);
  if (valor) {
    mapa[k] = true;
  } else {
    delete mapa[k];
  }
  escribirMapa(mapa);
}

// ── Helpers de estado ───────────────────────────────────────────────

export function estadoTarea(
  tarea: TareaCierre,
  completada: boolean,
  hoy: Date
): EstadoTarea {
  if (completada) return "completada";
  const fecha = new Date(
    tarea.fechaDeadline.getFullYear(),
    tarea.fechaDeadline.getMonth(),
    tarea.fechaDeadline.getDate()
  );
  const ref = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (fecha.getTime() === ref.getTime()) return "hoy";
  if (fecha.getTime() < ref.getTime()) return "atrasada";
  return "proxima";
}

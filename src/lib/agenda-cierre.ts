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

/**
 * Estado de ejecución que el usuario marca manualmente.
 * `sin_marcar` es el default cuando la tarea no se ha tocado.
 */
export type EstadoEjecucion =
  | "sin_marcar"
  | "completada"
  | "pendiente"
  | "error";

/**
 * Estado temporal / urgencia que se deriva de la fecha vs hoy.
 * Es distinto al `EstadoEjecucion` (que es decisión del usuario).
 */
export type UrgenciaTarea =
  | "atrasada" // fecha pasó y no está completada
  | "hoy" // fecha es hoy
  | "proxima"; // fecha futura, no completada

/** Registro persistido por tarea cuando el usuario interactúa con ella. */
export type RegistroTarea = {
  estado: EstadoEjecucion;
  /** Nota libre opcional. Útil para "pendiente" y "error". */
  nota?: string;
  /** Timestamp ISO de la última actualización. */
  actualizadoEn: string;
};

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
// Nuevo formato (v2): registros con estado + nota + timestamp.
// Migración silenciosa: si encontramos una clave con valor `true` (formato
// v1 antiguo), la interpretamos como `completada` sin nota.

const STORAGE_KEY = "agenda-cierre-registros";
const STORAGE_KEY_LEGACY = "agenda-cierre-completadas";

type Mapa = Record<string, RegistroTarea>;

function keyTarea(tarea: TareaCierre): string {
  return `${tarea.anio}-${String(tarea.mes + 1).padStart(2, "0")}-${tarea.id}`;
}

/** Clave estable de una tarea (para persistencia y cron). */
export { keyTarea };

function leerMapa(): Mapa {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Mapa;

    // Migración desde el formato v1 (Record<string, true>).
    const rawLegacy = window.localStorage.getItem(STORAGE_KEY_LEGACY);
    if (rawLegacy) {
      const legacy = JSON.parse(rawLegacy) as Record<string, true>;
      const migrado: Mapa = {};
      const ahora = new Date().toISOString();
      for (const [k, v] of Object.entries(legacy)) {
        if (v === true) {
          migrado[k] = { estado: "completada", actualizadoEn: ahora };
        }
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrado));
      return migrado;
    }
    return {};
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

export function getRegistroTarea(tarea: TareaCierre): RegistroTarea | null {
  return leerMapa()[keyTarea(tarea)] ?? null;
}

/**
 * Actualiza el estado y/o la nota de una tarea. Si `estado` es
 * `"sin_marcar"`, elimina el registro (estado limpio).
 */
export function actualizarTarea(
  tarea: TareaCierre,
  cambios: { estado?: EstadoEjecucion; nota?: string }
) {
  const mapa = leerMapa();
  const k = keyTarea(tarea);
  const prev = mapa[k];
  const estadoNuevo = cambios.estado ?? prev?.estado ?? "sin_marcar";
  const notaNueva = cambios.nota ?? prev?.nota;

  if (estadoNuevo === "sin_marcar" && !notaNueva) {
    delete mapa[k];
  } else {
    mapa[k] = {
      estado: estadoNuevo,
      nota: notaNueva ? notaNueva.trim() || undefined : undefined,
      actualizadoEn: new Date().toISOString(),
    };
  }
  escribirMapa(mapa);
  void sincronizarAgendaConNube();
}

/** Sube el mapa local a Supabase (fire-and-forget desde el cliente). */
export async function sincronizarAgendaConNube(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const mapa = leerMapa();
    await fetch("/api/admin/agenda-cierre", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registros: mapa }),
    });
  } catch {
    // Sin red o sesión expirada: silencioso; el cron usará el último sync exitoso.
  }
}

/**
 * Descarga el progreso desde Supabase y fusiona con localStorage.
 * Gana el registro con `actualizadoEn` más reciente por clave.
 */
export async function cargarAgendaDesdeNube(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/admin/agenda-cierre", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { registros?: Mapa };
    if (!data.registros || typeof data.registros !== "object") return;

    const local = leerMapa();
    const merged: Mapa = { ...local };
    for (const [k, remoto] of Object.entries(data.registros)) {
      const prev = merged[k];
      if (
        !prev ||
        !prev.actualizadoEn ||
        remoto.actualizadoEn > prev.actualizadoEn
      ) {
        merged[k] = remoto;
      }
    }
    escribirMapa(merged);
  } catch {
    // Silencioso: se sigue usando localStorage local.
  }
}

// ── Helpers de estado / urgencia ────────────────────────────────────

export function urgenciaTarea(tarea: TareaCierre, hoy: Date): UrgenciaTarea {
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

/** Devuelve `true` si la tarea cuenta como "completada" para progreso. */
export function esCompletada(reg: RegistroTarea | null): boolean {
  return reg?.estado === "completada";
}

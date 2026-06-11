"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  actualizarTarea,
  cargarAgendaDesdeNube,
  esCompletada,
  generarTareasMes,
  getRegistroTarea,
  sincronizarAgendaConNube,
  urgenciaTarea,
  type CategoriaTarea,
  type EstadoEjecucion,
  type TareaCierre,
  type UrgenciaTarea,
} from "@/lib/agenda-cierre";
import { descargarIcs } from "@/lib/portal/ics";
import type { EventoFiscal } from "@/lib/portal/fechas-fiscales";

/**
 * Timeline vertical del cierre del despacho.
 *
 * Diseño:
 *  - Las tareas con fecha muy lejos del día de hoy se atenúan con
 *    blur progresivo + opacidad (focus en lo de hoy/próximo).
 *  - Hover quita el blur (puedes echarle un ojo al pasar el mouse).
 *  - Los botones de estado NO están fijos: cada nodo es clickeable y
 *    abre un mini-popover con las tres opciones (✓ Hecha · ⏸ Pendiente
 *    · ⚠ Error) y la edición de la nota.
 *  - Estado "error" o urgencia "hoy" pulsan estilo radar (mismo
 *    keyframe que el gráfico de ingresos).
 */

type Props = {
  /** Mes del calendario (no del periodo fiscal) sobre el que corre la agenda. */
  mesActual: number;
  /** Año del calendario. */
  anioActual: number;
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

/**
 * Colores de categoría alineados con `COLORES_EVENTO`
 * (`src/lib/portal/fechas-fiscales.ts`) y con `/cumplimiento`:
 *
 *   SAT       → azul     (blue)
 *   IMSS      → verde    (emerald)
 *   Estatal   → ámbar    (amber)
 *   REPSE     → violeta  (violet)
 *
 * Para las categorías propias de la agenda (no tienen evento fiscal
 * directo) usamos tonos neutros que no compitan con las anteriores:
 *
 *   Documentos    → slate  (descargas iniciales mixtas SAT+IMSS+Estatal)
 *   Contabilidad  → indigo (cálculo interno del despacho)
 *   Nóminas       → fuchsia (cierre de nómina, color de marca secundario)
 */
const ESTILO_CATEGORIA: Record<
  CategoriaTarea,
  { dot: string; text: string; bg: string; border: string; label: string }
> = {
  documentos: {
    dot: "bg-slate-500",
    text: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: "Documentos",
  },
  contabilidad: {
    dot: "bg-indigo-500",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    label: "Contabilidad",
  },
  nominas: {
    dot: "bg-fuchsia-500",
    text: "text-fuchsia-700",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-100",
    label: "Nóminas",
  },
  sat: {
    dot: "bg-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
    label: "SAT",
  },
  imss: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "IMSS",
  },
};

type EstiloEstado = {
  /** Clase TW para el círculo principal (background, border). */
  nodo: string;
  /** Color del anillo "estático" alrededor del nodo. */
  anillo: string;
  /** Color del "radar pulse" (hex/rgb), solo si aplica. */
  radarColor: string | null;
  /** Icono dentro del nodo. */
  icono: React.ReactNode;
  /** Pill compacta con etiqueta del estado. */
  pillBg: string;
  pillText: string;
  pillLabel: string;
};

const ICONO_CHECK = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ICONO_PAUSA = (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="white"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const ICONO_ERROR = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function estiloNodo(
  estado: EstadoEjecucion,
  urgencia: UrgenciaTarea
): EstiloEstado {
  if (estado === "completada") {
    return {
      nodo: "bg-emerald-500",
      anillo: "ring-4 ring-emerald-100",
      radarColor: null,
      icono: ICONO_CHECK,
      pillBg: "bg-emerald-100",
      pillText: "text-emerald-700",
      pillLabel: "Completada",
    };
  }
  if (estado === "pendiente") {
    return {
      nodo: "bg-amber-500",
      anillo: "ring-4 ring-amber-100",
      radarColor: null,
      icono: ICONO_PAUSA,
      pillBg: "bg-amber-100",
      pillText: "text-amber-700",
      pillLabel: "Pendiente",
    };
  }
  if (estado === "error") {
    return {
      nodo: "bg-rose-500",
      anillo: "ring-4 ring-rose-100",
      radarColor: "rgba(244,63,94,0.55)", // rose-500
      icono: ICONO_ERROR,
      pillBg: "bg-rose-100",
      pillText: "text-rose-700",
      pillLabel: "Error",
    };
  }
  // Sin marcar: estilo depende de la urgencia.
  if (urgencia === "hoy") {
    return {
      nodo: "bg-white border-2 border-red-400",
      anillo: "ring-4 ring-red-100",
      radarColor: "rgba(239,68,68,0.6)", // red-500
      icono: <span className="block w-1.5 h-1.5 rounded-full bg-red-500" />,
      pillBg: "bg-red-100",
      pillText: "text-red-700",
      pillLabel: "Hoy",
    };
  }
  if (urgencia === "atrasada") {
    return {
      nodo: "bg-white border-2 border-rose-300",
      anillo: "ring-2 ring-rose-50",
      radarColor: null,
      icono: <span className="block w-1 h-1 rounded-full bg-rose-400" />,
      pillBg: "bg-rose-50",
      pillText: "text-rose-600",
      pillLabel: "Atrasada",
    };
  }
  return {
    nodo: "bg-white border-2 border-slate-300",
    anillo: "ring-2 ring-slate-100",
    radarColor: null,
    icono: <span className="block w-1 h-1 rounded-full bg-slate-300" />,
    pillBg: "bg-slate-100",
    pillText: "text-slate-500",
    pillLabel: "Próxima",
  };
}

function formatearFecha(d: Date): string {
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function diasDesdeHoy(fecha: Date, hoy: Date): number {
  const a = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const b = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

export default function TimelineCierreDespacho({
  mesActual,
  anioActual,
}: Props) {
  const [mesVista, setMesVista] = useState(mesActual);
  const [anioVista, setAnioVista] = useState(anioActual);
  const [reload, setReload] = useState(0);

  // Popover de acciones (id de tarea o null).
  const [popoverAbierto, setPopoverAbierto] = useState<string | null>(null);
  // Editor de nota (id de tarea o null) + borrador en curso.
  const [editandoNota, setEditandoNota] = useState<string | null>(null);
  const [borradorNota, setBorradorNota] = useState("");

  // Estado del botón "probar push" (idle | enviando | ok | error).
  const [estadoPrueba, setEstadoPrueba] = useState<
    "idle" | "enviando" | "ok" | "error"
  >("idle");
  const [msgPrueba, setMsgPrueba] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement | null>(null);

  const tareas = useMemo(
    () => generarTareasMes(mesVista, anioVista),
    [mesVista, anioVista]
  );

  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tareasConRegistro = useMemo(() => {
    return tareas.map((t) => {
      const reg = getRegistroTarea(t);
      return {
        ...t,
        registro: reg,
        urgencia: urgenciaTarea(t, hoy),
        dias: diasDesdeHoy(t.fechaDeadline, hoy),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareas, hoy, reload]);

  // Índice de la tarea "actual" — la más cercana a hoy en valor absoluto
  // que NO esté completada. Sirve para autoscroll al abrir el componente.
  const indiceActual = useMemo(() => {
    let mejor = -1;
    let mejorDist = Infinity;
    tareasConRegistro.forEach((t, i) => {
      if (t.registro?.estado === "completada") return;
      const d = Math.abs(t.dias);
      if (d < mejorDist) {
        mejorDist = d;
        mejor = i;
      }
    });
    return mejor;
  }, [tareasConRegistro]);

  const total = tareasConRegistro.length;
  const completadas = tareasConRegistro.filter((t) =>
    esCompletada(t.registro)
  ).length;
  const conErrores = tareasConRegistro.filter(
    (t) => t.registro?.estado === "error"
  ).length;
  const pendientesMarcadas = tareasConRegistro.filter(
    (t) => t.registro?.estado === "pendiente"
  ).length;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const enMesActual = mesVista === mesActual && anioVista === anioActual;

  // Sincroniza progreso del workflow desde Supabase (para push en celular).
  useEffect(() => {
    void cargarAgendaDesdeNube()
      .then(() => sincronizarAgendaConNube())
      .then(() => setReload((n) => n + 1));
  }, []);

  useEffect(() => {
    setReload((n) => n + 1);
    setPopoverAbierto(null);
    setEditandoNota(null);
  }, [mesVista, anioVista]);

  // Cierra popover al hacer click fuera o al presionar Escape.
  useEffect(() => {
    if (!popoverAbierto) return;
    const onClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setPopoverAbierto(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopoverAbierto(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [popoverAbierto]);

  // Autoscroll a la tarea actual cuando se carga el componente.
  const listaRef = useRef<HTMLUListElement | null>(null);
  useEffect(() => {
    if (indiceActual < 0 || !listaRef.current) return;
    const item = listaRef.current.querySelectorAll("li")[indiceActual];
    if (item) {
      item.scrollIntoView({ block: "center", behavior: "auto" });
    }
    // Solo al montar / cambiar de mes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesVista, anioVista]);

  const cambiarEstado = (tarea: TareaCierre, estado: EstadoEjecucion) => {
    actualizarTarea(tarea, { estado });
    setReload((n) => n + 1);
  };

  const abrirEditorNota = (
    tarea: TareaCierre,
    notaActual: string | undefined
  ) => {
    setEditandoNota(tarea.id);
    setBorradorNota(notaActual ?? "");
    setPopoverAbierto(null);
  };

  const guardarNota = (tarea: TareaCierre) => {
    actualizarTarea(tarea, { nota: borradorNota });
    setEditandoNota(null);
    setBorradorNota("");
    setReload((n) => n + 1);
  };

  const irMesAnterior = () => {
    if (mesVista === 0) {
      setMesVista(11);
      setAnioVista((y) => y - 1);
    } else {
      setMesVista((m) => m - 1);
    }
  };
  const irMesSiguiente = () => {
    if (mesVista === 11) {
      setMesVista(0);
      setAnioVista((y) => y + 1);
    } else {
      setMesVista((m) => m + 1);
    }
  };
  const irHoy = () => {
    setMesVista(mesActual);
    setAnioVista(anioActual);
  };

  const probarNotificaciones = async () => {
    setEstadoPrueba("enviando");
    setMsgPrueba(null);
    try {
      const res = await fetch("/api/admin/workflow-despacho/probar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: "manana", force: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error al probar.");
      setEstadoPrueba("ok");
      const pushes = data.pushes ?? (data.pushEnviadas > 0 ? 1 : 0);
      const alertas = data.alertas ?? 0;
      if (alertas === 0) {
        setMsgPrueba("Push de prueba enviada (no había tareas pendientes).");
      } else {
        setMsgPrueba(
          `Enviada ${pushes === 1 ? "1 push" : `${pushes} pushes`} para ${alertas} tarea${alertas > 1 ? "s" : ""}.`
        );
      }
      setTimeout(() => setEstadoPrueba("idle"), 4000);
    } catch (e) {
      setEstadoPrueba("error");
      setMsgPrueba(e instanceof Error ? e.message : "Error al probar.");
      setTimeout(() => setEstadoPrueba("idle"), 5000);
    }
  };

  const exportarIcs = () => {
    const eventos: EventoFiscal[] = tareasConRegistro.map((t) => ({
      tipo: "honorarios",
      etiqueta: `RDC · ${t.titulo}`,
      fecha: t.fechaDeadline,
      periodo: { mes: mesVista, anio: anioVista },
      descripcion: `Agenda de cierre RDC: ${t.descripcion}`,
    }));
    descargarIcs(
      eventos,
      `agenda-cierre-rdc-${anioVista}-${String(mesVista + 1).padStart(2, "0")}.ics`,
      "Despacho RDC"
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header compacto */}
      <div className="mb-3 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
              Workflow del despacho
            </p>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              {NOMBRES_MES[mesVista]} {anioVista}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={irMesAnterior}
              className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Mes anterior"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            {!enMesActual && (
              <button
                type="button"
                onClick={irHoy}
                className="px-2 py-1 rounded-full bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Hoy
              </button>
            )}
            <button
              type="button"
              onClick={irMesSiguiente}
              className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Mes siguiente"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Barra de progreso + stats */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
              Progreso
            </span>
            <span className="text-[10px] font-black tabular-nums text-slate-700">
              {completadas}/{total} · {porcentaje}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                porcentaje === 100
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                  : conErrores > 0
                    ? "bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-500"
                    : "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500"
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          {(conErrores > 0 || pendientesMarcadas > 0) && (
            <p className="text-[9px] font-bold text-slate-500 mt-1">
              {conErrores > 0 && (
                <span className="text-rose-600">
                  {conErrores} error{conErrores === 1 ? "" : "es"}
                </span>
              )}
              {conErrores > 0 && pendientesMarcadas > 0 && (
                <span className="text-slate-300"> · </span>
              )}
              {pendientesMarcadas > 0 && (
                <span className="text-amber-600">
                  {pendientesMarcadas} pendiente
                  {pendientesMarcadas === 1 ? "" : "s"}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Botón verde: alcance LOCAL — sólo las 9 tareas internas
            del despacho de este mes. Visualmente distinto al botón
            negro del header (que descarga vencimientos de clientes). */}
        <button
          type="button"
          onClick={exportarIcs}
          className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-colors"
          title="Descarga las 9 tareas internas de cierre del despacho como .ics (iPhone, Apple Calendar, Google, Outlook). NO incluye vencimientos de clientes."
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Bajar mi agenda del mes
        </button>

        {/* Probar notificación push — solo visible en el mes actual.
            Llama al endpoint `/api/admin/workflow-despacho/probar` que
            replica la lógica del cron (agrupa si hay 2+ tareas). */}
        {enMesActual && (
          <div className="mt-1.5 flex items-center justify-end">
            <button
              type="button"
              onClick={probarNotificaciones}
              disabled={estadoPrueba === "enviando"}
              className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest transition-colors ${
                estadoPrueba === "ok"
                  ? "text-emerald-600"
                  : estadoPrueba === "error"
                    ? "text-rose-600"
                    : "text-slate-400 hover:text-slate-700"
              } disabled:opacity-60`}
              title="Envía una push de prueba al celular con la misma lógica del cron diario (agrupa si hay 2+ tareas pendientes)."
            >
              {estadoPrueba === "enviando" ? (
                <>
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                  </svg>
                  Enviando…
                </>
              ) : estadoPrueba === "ok" ? (
                <>✓ Push enviada</>
              ) : estadoPrueba === "error" ? (
                <>✗ Error</>
              ) : (
                <>🔔 Probar notificación al celular</>
              )}
            </button>
          </div>
        )}
        {msgPrueba && estadoPrueba !== "idle" && (
          <p
            className={`mt-0.5 text-right text-[8px] ${
              estadoPrueba === "error" ? "text-rose-600" : "text-slate-500"
            }`}
          >
            {msgPrueba}
          </p>
        )}
      </div>

      {/* TIMELINE vertical.
          - `pl-1 -ml-1` deja aire para que el radar pulse no se corte
            por el borde izquierdo cuando el navegador hace zoom-in.
          - SIN mask-image: las 9 tareas casi siempre caben en 640px
            sin scroll, así que el fade gradient sólo metería ruido
            visual. Si en algún mes hay scroll real, el navegador
            muestra la scrollbar nativa que ya indica overflow. */}
      <ul
        ref={listaRef}
        className="flex-1 overflow-y-auto pl-1 pr-1 -mr-1 -ml-1 min-h-0 timeline-lista relative"
      >
        {tareasConRegistro.map((t, idx) => {
          const cat = ESTILO_CATEGORIA[t.categoria];
          const estado = t.registro?.estado ?? "sin_marcar";
          const est = estiloNodo(estado, t.urgencia);
          const esUltimo = idx === tareasConRegistro.length - 1;
          const nota = t.registro?.nota;
          const editando = editandoNota === t.id;
          const popover = popoverAbierto === t.id;
          const esActual = idx === indiceActual;

          return (
            <li
              key={t.id}
              className="timeline-item relative pl-11 pb-3.5 last:pb-0 transition-all duration-200"
            >
              {/* Línea vertical entre nodos (alineada al centro del dot) */}
              {!esUltimo && (
                <span
                  className="absolute left-[19px] top-7 bottom-0 w-px bg-slate-200"
                  aria-hidden="true"
                />
              )}

              {/* Nodo (círculo de estado) — clickeable, abre popover.
                  Lo dejamos a `left-2` (no `left-0`) para que el radar
                  pulse exterior no se recorte al hacer zoom. */}
              <button
                type="button"
                onClick={() => setPopoverAbierto(popover ? null : t.id)}
                className={`absolute left-2 top-1 w-6 h-6 rounded-full ${est.nodo} ${est.anillo} flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10`}
                aria-label="Cambiar estado de la tarea"
                aria-expanded={popover}
              >
                {est.icono}
                {/* Radar pulse — solo en error / hoy */}
                {est.radarColor && (
                  <>
                    <span
                      className="absolute inset-0 rounded-full"
                      style={
                        {
                          background: est.radarColor,
                          transformOrigin: "center",
                          animation:
                            "timelineRadarPulse 1.8s ease-out infinite",
                        } as CSSProperties
                      }
                      aria-hidden="true"
                    />
                    <span
                      className="absolute inset-0 rounded-full"
                      style={
                        {
                          background: est.radarColor,
                          transformOrigin: "center",
                          animation:
                            "timelineRadarPulse 1.8s ease-out 0.9s infinite",
                        } as CSSProperties
                      }
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>

              {/* Cabecera (pill estado + categoria + fecha) */}
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${est.pillBg} ${est.pillText}`}
                  >
                    {est.pillLabel}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${cat.bg} ${cat.text} border ${cat.border}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${cat.dot}`} />
                    {cat.label}
                  </span>
                  {esActual && (
                    <span className="inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-900 text-white">
                      Ahora
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest tabular-nums text-slate-500 shrink-0">
                  {formatearFecha(t.fechaDeadline)}
                </span>
              </div>

              {/* Título */}
              <p
                className={`text-sm font-bold leading-tight ${
                  estado === "completada"
                    ? "text-slate-400 line-through"
                    : "text-slate-800"
                }`}
              >
                {t.titulo}
              </p>

              {/* Nota existente */}
              {nota && !editando && (
                <button
                  type="button"
                  onClick={() => abrirEditorNota(t, nota)}
                  className="mt-1.5 w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group"
                  title="Click para editar la nota"
                >
                  <div className="flex items-start gap-1.5">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-400 shrink-0 mt-0.5"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    <p className="text-[10px] text-slate-600 font-medium leading-snug flex-1">
                      {nota}
                    </p>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 group-hover:text-slate-500 shrink-0">
                      Editar
                    </span>
                  </div>
                </button>
              )}

              {/* Editor de nota inline */}
              {editando && (
                <div className="mt-1.5">
                  <textarea
                    value={borradorNota}
                    onChange={(e) => setBorradorNota(e.target.value)}
                    placeholder={
                      estado === "error"
                        ? "¿Qué falló? (cliente, sistema, documento...)"
                        : estado === "pendiente"
                          ? "¿Por qué quedó pendiente?"
                          : "Anotación libre..."
                    }
                    rows={2}
                    className="w-full px-2 py-1.5 text-[11px] rounded-lg border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none resize-y min-h-[44px] font-medium text-slate-700"
                    autoFocus
                  />
                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => guardarNota(t)}
                      className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditandoNota(null);
                        setBorradorNota("");
                      }}
                      className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-500 text-[8px] font-black uppercase tracking-widest hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    {nota && (
                      <button
                        type="button"
                        onClick={() => {
                          actualizarTarea(t, { nota: "" });
                          setEditandoNota(null);
                          setBorradorNota("");
                          setReload((n) => n + 1);
                        }}
                        className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[8px] font-black uppercase tracking-widest hover:bg-rose-100 ml-auto"
                      >
                        Borrar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Popover de acciones (3 estados + editar nota) */}
              {popover && (
                <div
                  ref={popoverRef}
                  className="absolute left-11 top-8 z-20 bg-white rounded-2xl shadow-2xl shadow-slate-200 ring-1 ring-slate-200 p-2 flex items-center gap-1 animate-[fadeInDown_0.15s_ease-out]"
                  role="menu"
                >
                  <BotonPopover
                    activo={estado === "completada"}
                    tono="emerald"
                    label="Hecha"
                    onClick={() => {
                      cambiarEstado(
                        t,
                        estado === "completada" ? "sin_marcar" : "completada"
                      );
                      setPopoverAbierto(null);
                    }}
                    icono={
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    }
                  />
                  <BotonPopover
                    activo={estado === "pendiente"}
                    tono="amber"
                    label="Pendiente"
                    onClick={() => {
                      if (estado === "pendiente") {
                        cambiarEstado(t, "sin_marcar");
                        setPopoverAbierto(null);
                      } else {
                        cambiarEstado(t, "pendiente");
                        if (!t.registro?.nota) {
                          abrirEditorNota(t, "");
                        } else {
                          setPopoverAbierto(null);
                        }
                      }
                    }}
                    icono={
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    }
                  />
                  <BotonPopover
                    activo={estado === "error"}
                    tono="rose"
                    label="Error"
                    onClick={() => {
                      if (estado === "error") {
                        cambiarEstado(t, "sin_marcar");
                        setPopoverAbierto(null);
                      } else {
                        cambiarEstado(t, "error");
                        if (!t.registro?.nota) {
                          abrirEditorNota(t, "");
                        } else {
                          setPopoverAbierto(null);
                        }
                      }
                    }}
                    icono={
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    }
                  />
                  <span className="w-px h-6 bg-slate-100" />
                  <button
                    type="button"
                    onClick={() => abrirEditorNota(t, nota ?? "")}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900 transition-colors"
                    title="Editar nota"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Keyframes locales: radar pulse del nodo + fade del popover.
          Misma curva que en GraficoIngresosAnual, pero con scale
          máximo 2.0 (no 2.4) para que el anillo no se salga del
          contenedor cuando el navegador hace zoom-in. */}
      <style jsx global>{`
        @keyframes timelineRadarPulse {
          0% {
            transform: scale(0.85);
            opacity: 0.65;
          }
          70% {
            transform: scale(2);
            opacity: 0;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function BotonPopover({
  activo,
  onClick,
  tono,
  icono,
  label,
}: {
  activo: boolean;
  onClick: () => void;
  tono: "emerald" | "amber" | "rose";
  icono: React.ReactNode;
  label: string;
}) {
  const colores = {
    emerald: {
      activo: "bg-emerald-500 text-white border-emerald-500 shadow-sm",
      inactivo:
        "bg-white border-slate-200 text-slate-500 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600",
    },
    amber: {
      activo: "bg-amber-500 text-white border-amber-500 shadow-sm",
      inactivo:
        "bg-white border-slate-200 text-slate-500 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600",
    },
    rose: {
      activo: "bg-rose-500 text-white border-rose-500 shadow-sm",
      inactivo:
        "bg-white border-slate-200 text-slate-500 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600",
    },
  };
  const c = colores[tono];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
        activo ? c.activo : c.inactivo
      }`}
      title={label}
      aria-label={label}
    >
      {icono}
    </button>
  );
}

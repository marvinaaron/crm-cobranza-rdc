"use client";

import { useEffect, useMemo, useState } from "react";
import {
  actualizarTarea,
  esCompletada,
  generarTareasMes,
  getRegistroTarea,
  urgenciaTarea,
  type CategoriaTarea,
  type EstadoEjecucion,
  type RegistroTarea,
  type TareaCierre,
  type UrgenciaTarea,
} from "@/lib/agenda-cierre";
import { descargarIcs } from "@/lib/portal/ics";
import type { EventoFiscal } from "@/lib/portal/fechas-fiscales";

/**
 * Timeline vertical del cierre del despacho.
 *
 * Cada tarea tiene 3 botones de estado:
 *   ✓ Completada · ⏸ Pendiente · ⚠ Error
 *
 * Si se elige Pendiente o Error, aparece un textarea para anotar
 * el motivo. Todo se persiste en localStorage (formato v2 con
 * estado + nota + timestamp). Hay migración silenciosa desde el
 * formato v1 (sólo booleano de completado).
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

const ESTILO_CATEGORIA: Record<
  CategoriaTarea,
  { dot: string; text: string; bg: string; border: string; label: string }
> = {
  documentos: {
    dot: "bg-sky-500",
    text: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-100",
    label: "Documentos",
  },
  contabilidad: {
    dot: "bg-violet-500",
    text: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-100",
    label: "Contabilidad",
  },
  nominas: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "Nóminas",
  },
  sat: {
    dot: "bg-indigo-600",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    label: "SAT",
  },
  imss: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
    label: "IMSS",
  },
};

type EstiloEstado = {
  /** Color del nodo (círculo grande) en la timeline. */
  nodo: string;
  /** Color del anillo alrededor del nodo. */
  anillo: string;
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
      icono: <span className="block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />,
      pillBg: "bg-red-100",
      pillText: "text-red-700",
      pillLabel: "Hoy",
    };
  }
  if (urgencia === "atrasada") {
    return {
      nodo: "bg-white border-2 border-rose-300",
      anillo: "ring-2 ring-rose-50",
      icono: <span className="block w-1 h-1 rounded-full bg-rose-400" />,
      pillBg: "bg-rose-50",
      pillText: "text-rose-600",
      pillLabel: "Atrasada",
    };
  }
  return {
    nodo: "bg-white border-2 border-slate-300",
    anillo: "ring-2 ring-slate-100",
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

function descripcionTarea(tarea: TareaCierre): string {
  if (tarea.diaInicio && tarea.diaInicio !== tarea.diaDeadline) {
    return `${tarea.descripcion} (rango día ${tarea.diaInicio} al ${tarea.diaDeadline})`;
  }
  return tarea.descripcion;
}

export default function TimelineCierreDespacho({
  mesActual,
  anioActual,
}: Props) {
  const [mesVista, setMesVista] = useState(mesActual);
  const [anioVista, setAnioVista] = useState(anioActual);
  const [reload, setReload] = useState(0);
  // Tarea que está editando la nota (id de tarea o null). Cuando hay
  // textarea abierto, mostramos un editor inline.
  const [editandoNota, setEditandoNota] = useState<string | null>(null);
  const [borradorNota, setBorradorNota] = useState("");

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
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareas, hoy, reload]);

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

  useEffect(() => {
    setReload((n) => n + 1);
    setEditandoNota(null);
  }, [mesVista, anioVista]);

  const cambiarEstado = (
    tarea: TareaCierre,
    estado: EstadoEjecucion,
    notaNueva?: string
  ) => {
    actualizarTarea(tarea, { estado, nota: notaNueva });
    setReload((n) => n + 1);
  };

  const abrirEditorNota = (
    tarea: TareaCierre,
    notaActual: string | undefined
  ) => {
    setEditandoNota(tarea.id);
    setBorradorNota(notaActual ?? "");
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

  const exportarIcs = () => {
    const eventos: EventoFiscal[] = tareasConRegistro.map((t) => ({
      tipo: "honorarios", // reusamos un tipo existente para no expandir el enum
      etiqueta: `RDC · ${t.titulo}`,
      fecha: t.fechaDeadline,
      periodo: { mes: mesVista, anio: anioVista },
      descripcion: `Agenda de cierre RDC: ${descripcionTarea(t)}`,
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
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
              Workflow del despacho
            </p>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              🗓️ {NOMBRES_MES[mesVista]} {anioVista}
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

        <button
          type="button"
          onClick={exportarIcs}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-colors"
          title="Descargar agenda como .ics (iPhone, Apple Calendar, Google, Outlook)"
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
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Exportar al calendario
        </button>
      </div>

      {/* TIMELINE vertical */}
      <ul className="flex-1 overflow-y-auto pr-1 -mr-1 min-h-0">
        {tareasConRegistro.map((t, idx) => {
          const cat = ESTILO_CATEGORIA[t.categoria];
          const estado = t.registro?.estado ?? "sin_marcar";
          const est = estiloNodo(estado, t.urgencia);
          const esUltimo = idx === tareasConRegistro.length - 1;
          const nota = t.registro?.nota;
          const editando = editandoNota === t.id;

          return (
            <li key={t.id} className="relative pl-9 pb-4 last:pb-0">
              {/* Línea vertical */}
              {!esUltimo && (
                <span
                  className="absolute left-3 top-7 bottom-0 w-px bg-slate-200"
                  aria-hidden="true"
                />
              )}

              {/* Nodo (círculo de estado) */}
              <span
                className={`absolute left-0 top-1 w-6 h-6 rounded-full ${est.nodo} ${est.anillo} flex items-center justify-center shadow-sm`}
                aria-hidden="true"
              >
                {est.icono}
              </span>

              {/* Cabecera */}
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

              {/* Nota existente (si está) */}
              {nota && !editando && (
                <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
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
                    <button
                      type="button"
                      onClick={() => abrirEditorNota(t, nota)}
                      className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 shrink-0"
                      title="Editar nota"
                    >
                      Editar
                    </button>
                  </div>
                </div>
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
                        Borrar nota
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Botones de estado */}
              <div className="mt-2 flex items-center gap-1">
                <BotonEstado
                  activo={estado === "completada"}
                  onClick={() => {
                    const nuevo = estado === "completada" ? "sin_marcar" : "completada";
                    cambiarEstado(t, nuevo);
                  }}
                  tono="emerald"
                  icono={
                    <svg
                      width="9"
                      height="9"
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
                  label="Hecha"
                />
                <BotonEstado
                  activo={estado === "pendiente"}
                  onClick={() => {
                    if (estado === "pendiente") {
                      cambiarEstado(t, "sin_marcar");
                    } else {
                      cambiarEstado(t, "pendiente");
                      // Si no hay nota, abrir editor sugiriendo escribir motivo.
                      if (!t.registro?.nota) {
                        abrirEditorNota(t, "");
                      }
                    }
                  }}
                  tono="amber"
                  icono={
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  }
                  label="Pendiente"
                />
                <BotonEstado
                  activo={estado === "error"}
                  onClick={() => {
                    if (estado === "error") {
                      cambiarEstado(t, "sin_marcar");
                    } else {
                      cambiarEstado(t, "error");
                      if (!t.registro?.nota) {
                        abrirEditorNota(t, "");
                      }
                    }
                  }}
                  tono="rose"
                  icono={
                    <svg
                      width="9"
                      height="9"
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
                  label="Error"
                />
                {!editando && !nota && (estado === "pendiente" || estado === "error") && (
                  <button
                    type="button"
                    onClick={() => abrirEditorNota(t, "")}
                    className="ml-auto text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700"
                  >
                    + nota
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BotonEstado({
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
        "bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600",
    },
    amber: {
      activo: "bg-amber-500 text-white border-amber-500 shadow-sm",
      inactivo:
        "bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600",
    },
    rose: {
      activo: "bg-rose-500 text-white border-rose-500 shadow-sm",
      inactivo:
        "bg-white border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600",
    },
  };
  const c = colores[tono];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest transition-colors ${
        activo ? c.activo : c.inactivo
      }`}
      title={label}
    >
      {icono}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

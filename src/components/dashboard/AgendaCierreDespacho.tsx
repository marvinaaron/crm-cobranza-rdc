"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PLANTILLA_AGENDA,
  estadoTarea,
  estaCompletada,
  generarTareasMes,
  marcarCompletada,
  type CategoriaTarea,
  type EstadoTarea,
  type TareaCierre,
} from "@/lib/agenda-cierre";
import { descargarIcs } from "@/lib/portal/ics";
import type { EventoFiscal } from "@/lib/portal/fechas-fiscales";

/**
 * Tarjeta de agenda de cierre del despacho.
 *
 * Muestra las 9 tareas del cierre del mes con:
 *  - Barra de progreso (X/Y completadas + %).
 *  - Estado por tarea (hoy / próxima / atrasada / completada).
 *  - Checkbox tipo iOS para marcar hecho (persistido en localStorage).
 *  - Navegación entre meses para revisar progreso histórico.
 *  - Botón "Exportar al calendario" → .ics que iPhone/Apple/Google abren.
 */

type Props = {
  /** Mes actual del calendario (no del periodo fiscal). */
  mesActual: number;
  /** Año actual del calendario. */
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

const ESTILO_ESTADO: Record<
  EstadoTarea,
  { fila: string; pill: string; pillText: string }
> = {
  hoy: {
    fila: "bg-gradient-to-r from-red-50/80 via-amber-50/40 to-transparent ring-1 ring-red-200/60",
    pill: "bg-red-500 text-white animate-pulse",
    pillText: "HOY",
  },
  atrasada: {
    fila: "bg-rose-50/40",
    pill: "bg-rose-500 text-white",
    pillText: "ATRASADA",
  },
  proxima: {
    fila: "bg-white",
    pill: "bg-slate-100 text-slate-600",
    pillText: "PRÓXIMA",
  },
  completada: {
    fila: "bg-emerald-50/30",
    pill: "bg-emerald-500 text-white",
    pillText: "HECHA",
  },
};

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

export default function AgendaCierreDespacho({
  mesActual,
  anioActual,
}: Props) {
  const [mesVista, setMesVista] = useState(mesActual);
  const [anioVista, setAnioVista] = useState(anioActual);
  // Reload de la persistencia: cuando marcamos algo, forzamos re-render
  // bumpeando este estado (localStorage no dispara cambios solo).
  const [reload, setReload] = useState(0);

  const tareas = useMemo(
    () => generarTareasMes(mesVista, anioVista),
    [mesVista, anioVista]
  );

  // Hoy (estabilizado para no re-renderizar cada tick).
  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Estado por tarea (memoizado y re-evaluado cuando bumpeamos `reload`).
  const tareasConEstado = useMemo(() => {
    return tareas.map((t) => {
      const completada = estaCompletada(t);
      return {
        ...t,
        completada,
        estado: estadoTarea(t, completada, hoy),
      };
    });
    // ⚠️ depende intencionalmente de `reload` para releer localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareas, hoy, reload]);

  // Ordenadas para mostrar: hoy/atrasadas arriba, luego próximas por fecha,
  // luego completadas al final.
  const tareasOrdenadas = useMemo(() => {
    const orden: Record<EstadoTarea, number> = {
      hoy: 0,
      atrasada: 1,
      proxima: 2,
      completada: 3,
    };
    return [...tareasConEstado].sort((a, b) => {
      const dx = orden[a.estado] - orden[b.estado];
      if (dx !== 0) return dx;
      return a.fechaDeadline.getTime() - b.fechaDeadline.getTime();
    });
  }, [tareasConEstado]);

  const completadas = tareasConEstado.filter((t) => t.completada).length;
  const total = tareasConEstado.length;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
  const atrasadas = tareasConEstado.filter(
    (t) => t.estado === "atrasada"
  ).length;
  const tareaHoy = tareasConEstado.find((t) => t.estado === "hoy") ?? null;

  // Estabilizamos `mesActual`/`anioActual` que vienen del padre (no van a
  // cambiar a media página). Solo lo usamos para detectar "estamos viendo
  // el mes actual o uno histórico".
  const enMesActual = mesVista === mesActual && anioVista === anioActual;

  // Aseguramos rehidratar el estado tras el primer render del cliente
  // (localStorage no está disponible en SSR).
  useEffect(() => {
    setReload((n) => n + 1);
  }, [mesVista, anioVista]);

  const toggleTarea = (t: TareaCierre, completada: boolean) => {
    marcarCompletada(t, !completada);
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

  // Exporta las tareas del mes vista como .ics (con descripción propia
  // que aclara que son tareas internas del despacho).
  const exportarIcs = () => {
    const eventos: EventoFiscal[] = tareasConEstado.map((t) => ({
      // Reusamos un tipo existente para no expandir el enum global. La
      // descripción + etiqueta dejan claro que es tarea interna.
      tipo: "honorarios",
      etiqueta: `RDC · ${t.titulo}`,
      fecha: t.fechaDeadline,
      periodo: { mes: mesVista, anio: anioVista },
      descripcion: `Agenda de cierre del despacho RDC: ${descripcionTarea(t)}`,
    }));
    descargarIcs(
      eventos,
      `agenda-cierre-rdc-${anioVista}-${String(mesVista + 1).padStart(2, "0")}.ics`,
      "Despacho RDC"
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-slate-50">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
              Workflow interno del despacho
            </p>
            <h3 className="text-lg lg:text-xl font-black text-slate-800 uppercase tracking-tight">
              🗓️ Agenda de cierre · {NOMBRES_MES[mesVista]} {anioVista}
            </h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1">
              {tareaHoy
                ? `Hoy toca: ${tareaHoy.titulo}`
                : atrasadas > 0
                  ? `${atrasadas} tarea${atrasadas === 1 ? "" : "s"} atrasada${atrasadas === 1 ? "" : "s"}`
                  : `${completadas} de ${total} tareas completadas`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={irMesAnterior}
              className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Mes anterior"
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
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            {!enMesActual && (
              <button
                type="button"
                onClick={irHoy}
                className="px-2.5 py-1.5 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Mes actual
              </button>
            )}
            <button
              type="button"
              onClick={irMesSiguiente}
              className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Mes siguiente"
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
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={exportarIcs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-colors"
              title="Descargar agenda como .ics (iPhone, Apple Calendar, Google Calendar, Outlook)"
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
              Exportar
            </button>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Progreso del mes
            </span>
            <span className="text-[11px] font-black tabular-nums text-slate-700">
              {completadas} / {total} · {porcentaje}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                porcentaje === 100
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                  : atrasadas > 0
                    ? "bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-500"
                    : "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500"
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </div>

      {/* LISTA */}
      <ul className="divide-y divide-slate-50 max-h-[440px] overflow-y-auto">
        {tareasOrdenadas.map((t) => {
          const cat = ESTILO_CATEGORIA[t.categoria];
          const est = ESTILO_ESTADO[t.estado];
          return (
            <li
              key={t.id}
              className={`px-5 lg:px-6 py-3 flex items-start gap-3 transition-colors ${est.fila}`}
            >
              {/* Checkbox circular iOS */}
              <button
                type="button"
                onClick={() => toggleTarea(t, t.completada)}
                aria-label={
                  t.completada
                    ? `Desmarcar ${t.titulo}`
                    : `Marcar ${t.titulo} como completada`
                }
                className={`shrink-0 w-6 h-6 mt-0.5 rounded-full flex items-center justify-center transition-all ${
                  t.completada
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-white border-2 border-slate-300 hover:border-emerald-400"
                }`}
              >
                {t.completada && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${cat.bg} ${cat.text} border ${cat.border}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                    {cat.label}
                  </span>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${est.pill}`}
                  >
                    {est.pillText}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest tabular-nums text-slate-500">
                    {formatearFecha(t.fechaDeadline)}
                  </span>
                </div>
                <p
                  className={`text-sm font-bold ${
                    t.completada
                      ? "text-slate-400 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {t.titulo}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug">
                  {descripcionTarea(t)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* FOOTER */}
      <div className="px-5 lg:px-6 py-2.5 bg-slate-50/60 border-t border-slate-100">
        <p className="text-[9px] font-bold text-slate-400 text-center">
          📲 Tu progreso se guarda solo en este navegador · Botón
          &quot;Exportar&quot; lleva las fechas a tu iPhone
        </p>
      </div>
    </div>
  );
}

// Export auxiliar para tests / debugging.
export { PLANTILLA_AGENDA };

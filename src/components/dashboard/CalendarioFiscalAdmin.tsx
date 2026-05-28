"use client";

import { useMemo, useState } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
import {
  eventosFiscalesParaCliente,
  COLORES_EVENTO,
  type EventoFiscal,
  type TipoEventoFiscal,
} from "@/lib/portal/fechas-fiscales";
import { descargarIcs } from "@/lib/portal/ics";

/**
 * Calendario fiscal agregado del despacho.
 *
 * - Reúne TODOS los vencimientos próximos de TODOS los clientes activos
 *   (SAT, IMSS, REPSE y estatal) usando los helpers que ya existen para
 *   el portal del cliente, así que la lógica de cálculo (días hábiles
 *   por 6º dígito de RFC, festivos federales, recorridos por inhábil)
 *   es exactamente la misma.
 * - Agrupa por FECHA para identificar visualmente días pesados.
 * - Cada día permite descargar un .ics que iPhone, Apple Calendar,
 *   Google Calendar y Outlook abren nativamente (con recordatorio
 *   un día antes ya configurado en el generador).
 * - Filtro por tipo (SAT/IMSS/Estatal/REPSE) y por ventana de tiempo
 *   (30/60/90 días).
 */

type Props = {
  clientes: Cliente[];
  /** Mes/año actual del CRM; el calendario empieza en este periodo. */
  periodo: Periodo;
};

// Evento "enriquecido" con cliente — para agrupar y descargar.
type EventoConCliente = EventoFiscal & {
  cliente: Cliente;
};

type FiltroTipo = "todos" | TipoEventoFiscal;
type VentanaDias = 30 | 60 | 90;

const ETIQUETA_TIPO_CORTA: Record<TipoEventoFiscal, string> = {
  sat: "SAT",
  imss: "IMSS",
  estatal: "Estatal",
  repse: "REPSE",
  honorarios: "Honorarios",
};

const ICONO_TIPO: Record<TipoEventoFiscal, string> = {
  sat: "🏛️",
  imss: "🩺",
  estatal: "📍",
  repse: "🛠️",
  honorarios: "💼",
};

function formatearFecha(d: Date): string {
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function diasHasta(d: Date): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000);
}

function claveFecha(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarioFiscalAdmin({ clientes, periodo }: Props) {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [ventana, setVentana] = useState<VentanaDias>(30);

  // Genera la lista plana de eventos de todos los clientes activos.
  // El cálculo es 100% client-side y baratísimo: solo hace aritmética
  // de fechas para los 3-4 meses siguientes por cliente activo.
  const eventos = useMemo<EventoConCliente[]>(() => {
    const mesesAdelante = ventana === 30 ? 2 : ventana === 60 ? 3 : 4;
    const out: EventoConCliente[] = [];
    for (const c of clientes) {
      if (!c.activo) continue;
      const evs = eventosFiscalesParaCliente(c, periodo, mesesAdelante);
      for (const e of evs) out.push({ ...e, cliente: c });
    }
    // Filtra por la ventana de días seleccionada y por tipo.
    return out
      .filter((e) => {
        const dias = diasHasta(e.fecha);
        if (dias < 0 || dias > ventana) return false;
        if (filtroTipo !== "todos" && e.tipo !== filtroTipo) return false;
        return true;
      })
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }, [clientes, periodo, ventana, filtroTipo]);

  // Agrupa por día para mostrar la "agenda".
  const agrupadoPorDia = useMemo(() => {
    const mapa = new Map<string, { fecha: Date; eventos: EventoConCliente[] }>();
    for (const e of eventos) {
      const k = claveFecha(e.fecha);
      const ya = mapa.get(k);
      if (ya) {
        ya.eventos.push(e);
      } else {
        mapa.set(k, { fecha: e.fecha, eventos: [e] });
      }
    }
    return Array.from(mapa.values());
  }, [eventos]);

  // Conteo total por tipo (sin importar el filtro actual) para los chips.
  // Recorremos los eventos del despacho con la misma ventana de días.
  const conteoPorTipo = useMemo(() => {
    const mesesAdelante = ventana === 30 ? 2 : ventana === 60 ? 3 : 4;
    const totales: Record<TipoEventoFiscal, number> = {
      sat: 0,
      imss: 0,
      estatal: 0,
      repse: 0,
      honorarios: 0,
    };
    for (const cli of clientes) {
      if (!cli.activo) continue;
      const evs = eventosFiscalesParaCliente(cli, periodo, mesesAdelante);
      for (const ev of evs) {
        const dias = diasHasta(ev.fecha);
        if (dias < 0 || dias > ventana) continue;
        totales[ev.tipo] += 1;
      }
    }
    return totales;
  }, [clientes, periodo, ventana]);

  const totalVisibles = eventos.length;

  // Descarga un .ics consolidado con TODOS los eventos visibles del despacho.
  const descargarTodos = () => {
    if (eventos.length === 0) return;
    const evsParaIcs: EventoFiscal[] = eventos.map((e) => ({
      tipo: e.tipo,
      etiqueta: `${e.etiqueta} · ${e.cliente.razonSocial}`,
      fecha: e.fecha,
      periodo: e.periodo,
    }));
    descargarIcs(
      evsParaIcs,
      `calendario-fiscal-rdc-${ventana}d.ics`,
      "Despacho RDC"
    );
  };

  // Descarga un .ics solo para un cliente puntual con todos sus eventos
  // dentro de la ventana.
  const descargarCliente = (cliente: Cliente) => {
    const suyos: EventoFiscal[] = eventos
      .filter((e) => e.cliente.id === cliente.id)
      .map((e) => ({
        tipo: e.tipo,
        etiqueta: e.etiqueta,
        fecha: e.fecha,
        periodo: e.periodo,
      }));
    if (suyos.length === 0) return;
    descargarIcs(
      suyos,
      `calendario-fiscal-${cliente.rfc.toLowerCase()}.ics`,
      cliente.razonSocial
    );
  };

  // Descarga un .ics con un evento puntual.
  const descargarEvento = (e: EventoConCliente) => {
    descargarIcs(
      [
        {
          tipo: e.tipo,
          etiqueta: `${e.etiqueta} · ${e.cliente.razonSocial}`,
          fecha: e.fecha,
          periodo: e.periodo,
        },
      ],
      `evento-${e.tipo}-${claveFecha(e.fecha)}.ics`,
      e.cliente.razonSocial
    );
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-5 lg:px-7 py-5 lg:py-6 border-b border-slate-50">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-1">
              Agenda fiscal del despacho
            </p>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              📅 Calendario fiscal
            </h2>
            <p className="text-[11px] font-bold text-slate-400 mt-1">
              {totalVisibles} vencimiento{totalVisibles === 1 ? "" : "s"} en los
              próximos {ventana} días
            </p>
          </div>
          <button
            type="button"
            onClick={descargarTodos}
            disabled={totalVisibles === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-slate-200 transition-colors"
            title="Descarga un archivo .ics que iPhone, Google Calendar y Outlook abren nativamente"
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
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Exportar al calendario
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            {([30, 60, 90] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVentana(v)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  ventana === v
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {v} días
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFiltroTipo("todos")}
              className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
                filtroTipo === "todos"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              Todos · {totalVisibles}
            </button>
            {(["sat", "imss", "estatal", "repse"] as const).map((t) => {
              const cnt = conteoPorTipo[t];
              if (cnt === 0) return null;
              const color = COLORES_EVENTO[t];
              const activo = filtroTipo === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFiltroTipo(activo ? "todos" : t)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
                    activo
                      ? `${color.fondoBadge} ${color.textoBadge} ${color.borde} shadow-sm ring-2 ring-offset-1 ring-slate-200`
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                  {ETIQUETA_TIPO_CORTA[t]} · {cnt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AGENDA */}
      {agrupadoPorDia.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="text-3xl mb-2">🌴</p>
          <p className="text-sm font-bold text-slate-400">
            Sin vencimientos fiscales en los próximos {ventana} días con este filtro.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-50 max-h-[520px] overflow-y-auto">
          {agrupadoPorDia.map((grupo) => {
            const dias = diasHasta(grupo.fecha);
            const esHoy = dias === 0;
            const esManana = dias === 1;
            const esUrgente = dias <= 3;
            const esProximo = dias <= 7;

            // Eventos únicos por cliente para agrupar visualmente.
            // En la práctica suelen ser pocos por día.
            return (
              <li key={claveFecha(grupo.fecha)} className="px-5 lg:px-7 py-4">
                <div className="flex items-start gap-4">
                  {/* Columna fecha */}
                  <div className="shrink-0 text-center w-16">
                    <div
                      className={`rounded-2xl px-2 py-2 border-2 ${
                        esHoy
                          ? "bg-red-50 border-red-300 text-red-700"
                          : esUrgente
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : esProximo
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <p className="text-[8px] font-black uppercase tracking-widest leading-tight">
                        {grupo.fecha.toLocaleDateString("es-MX", {
                          weekday: "short",
                        })}
                      </p>
                      <p className="text-2xl font-black tabular-nums leading-none mt-0.5">
                        {grupo.fecha.getDate()}
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-widest mt-0.5">
                        {grupo.fecha.toLocaleDateString("es-MX", {
                          month: "short",
                        })}
                      </p>
                    </div>
                    <p
                      className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${
                        esHoy
                          ? "text-red-600 animate-pulse"
                          : esManana
                            ? "text-amber-600"
                            : esUrgente
                              ? "text-amber-600"
                              : "text-slate-400"
                      }`}
                    >
                      {esHoy
                        ? "Hoy"
                        : esManana
                          ? "Mañana"
                          : `en ${dias}d`}
                    </p>
                  </div>

                  {/* Columna eventos */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {formatearFecha(grupo.fecha)}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 tabular-nums">
                        {grupo.eventos.length} evento
                        {grupo.eventos.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    {grupo.eventos.map((e, idx) => {
                      const color = COLORES_EVENTO[e.tipo];
                      return (
                        <div
                          key={`${e.cliente.id}-${e.tipo}-${idx}`}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl border ${color.borde} ${color.fondoBadge} hover:shadow-md transition-shadow`}
                        >
                          <span className="text-lg shrink-0" aria-hidden="true">
                            {ICONO_TIPO[e.tipo]}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/70 ${color.textoBadge}`}
                              >
                                {ETIQUETA_TIPO_CORTA[e.tipo]}
                              </span>
                              <p className="text-[11px] font-bold text-slate-800 truncate">
                                {e.cliente.razonSocial}
                              </p>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 truncate">
                              {e.etiqueta}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => descargarEvento(e)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-[8px] font-black uppercase tracking-widest border border-slate-200 transition-colors"
                              title="Descargar este evento como .ics (lo abre tu iPhone/Calendario)"
                            >
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
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              ICS
                            </button>
                            <button
                              type="button"
                              onClick={() => descargarCliente(e.cliente)}
                              className="px-2 py-1 rounded-md bg-white text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 text-[8px] font-black uppercase tracking-widest border border-slate-200 transition-colors whitespace-nowrap"
                              title={`Descargar TODOS los eventos próximos de ${e.cliente.razonSocial}`}
                            >
                              Todos
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* FOOTER explicativo */}
      <div className="px-5 lg:px-7 py-3 bg-slate-50/60 border-t border-slate-100">
        <p className="text-[9px] font-bold text-slate-400 text-center">
          📲 El archivo .ics se abre en iPhone, Apple Calendar, Google Calendar y
          Outlook · incluye recordatorio 1 día antes
        </p>
      </div>
    </div>
  );
}


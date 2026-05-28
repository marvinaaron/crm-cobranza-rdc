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
import TimelineCierreDespacho from "@/components/dashboard/TimelineCierreDespacho";

/**
 * Calendario fiscal agregado del despacho.
 *
 * Layout en dos columnas (en desktop):
 *   ├─ Izquierda: agenda en lista (agrupada por día)
 *   └─ Derecha:   mini-calendario tipo iOS (mes en grid 7×N)
 *
 * Comportamiento:
 *   - Click en un día del mini-calendario filtra la lista a ese día.
 *   - Click en "Limpiar día" vuelve a mostrar la ventana de 30/60/90.
 *   - Flechas del mini-calendario permiten navegar meses adelante;
 *     los eventos para meses fuera de la ventana se calculan al vuelo
 *     desde el periodo base extendiendo `mesesAdelante` lo necesario.
 *
 * Reutiliza `eventosFiscalesParaCliente` y `descargarIcs` que ya
 * usa el portal del cliente, así que la lógica de fechas (SAT por
 * 6º dígito de RFC, festivos federales, IMSS día 17, etc.) es idéntica.
 */

type Props = {
  clientes: Cliente[];
  /** Mes/año actual del CRM; el calendario empieza en este periodo. */
  periodo: Periodo;
};

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

const NOMBRES_MES_CORTO = [
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

// El calendario tipo iOS arranca en LUNES (en es-MX es la convención
// común). El array sigue ese orden.
const DIAS_SEMANA_CORTO = ["L", "M", "M", "J", "V", "S", "D"];

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

function mismaFecha(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Diferencia en meses entre dos periodos (b - a). Útil para saber
 * cuántos meses adelante hay que calcular eventos cuando el usuario
 * navega el mini-calendario hacia un mes futuro.
 */
function diferenciaMeses(a: Periodo, b: Periodo): number {
  return (b.anio - a.anio) * 12 + (b.mes - a.mes);
}

export default function CalendarioFiscalAdmin({ clientes, periodo }: Props) {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [ventana, setVentana] = useState<VentanaDias>(30);
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);

  // Mini-calendario: mes/año visible. Arranca en el mes actual del navegador.
  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [calMes, setCalMes] = useState(() => hoy.getMonth());
  const [calAnio, setCalAnio] = useState(() => hoy.getFullYear());

  // Genera TODOS los eventos del despacho con un horizonte generoso
  // (hasta donde llegue la navegación del mini-calendario + ventana).
  // Memoizado por clientes/periodo/mesCalendario para no recalcular
  // cuando solo cambia el filtro.
  const eventosTodos = useMemo<EventoConCliente[]>(() => {
    // Cuántos meses adelante necesitamos:
    //   - max(ventana en meses, distancia al mes navegado en mini-cal)
    //   - mínimo 4 meses para que siempre haya datos en el calendario.
    const mesesVentana = ventana === 30 ? 2 : ventana === 60 ? 3 : 4;
    const mesesCal =
      diferenciaMeses(periodo, { mes: calMes, anio: calAnio }) + 2;
    const mesesAdelante = Math.max(4, mesesVentana, mesesCal);

    const out: EventoConCliente[] = [];
    for (const c of clientes) {
      if (!c.activo) continue;
      const evs = eventosFiscalesParaCliente(c, periodo, mesesAdelante);
      for (const e of evs) out.push({ ...e, cliente: c });
    }
    return out.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }, [clientes, periodo, ventana, calMes, calAnio]);

  // Mapa día → eventos. Se usa para pintar dots en el mini-calendario
  // y para filtrar la lista cuando hay día seleccionado.
  const eventosPorDia = useMemo(() => {
    const map = new Map<string, EventoConCliente[]>();
    for (const e of eventosTodos) {
      const k = claveFecha(e.fecha);
      const ya = map.get(k);
      if (ya) ya.push(e);
      else map.set(k, [e]);
    }
    return map;
  }, [eventosTodos]);

  // Lista filtrada que se renderiza a la izquierda.
  const eventosVisibles = useMemo<EventoConCliente[]>(() => {
    return eventosTodos.filter((e) => {
      if (filtroTipo !== "todos" && e.tipo !== filtroTipo) return false;
      if (diaSeleccionado) {
        return mismaFecha(e.fecha, diaSeleccionado);
      }
      // Modo "ventana": solo eventos dentro de los próximos N días desde hoy.
      const dias = diasHasta(e.fecha);
      return dias >= 0 && dias <= ventana;
    });
  }, [eventosTodos, filtroTipo, ventana, diaSeleccionado]);

  // Agrupado por día para la lista (cuando NO hay día seleccionado).
  const agrupadoPorDia = useMemo(() => {
    const mapa = new Map<string, { fecha: Date; eventos: EventoConCliente[] }>();
    for (const e of eventosVisibles) {
      const k = claveFecha(e.fecha);
      const ya = mapa.get(k);
      if (ya) {
        ya.eventos.push(e);
      } else {
        mapa.set(k, { fecha: e.fecha, eventos: [e] });
      }
    }
    return Array.from(mapa.values());
  }, [eventosVisibles]);

  // Conteo total por tipo (en la ventana actual, sin filtro de tipo
  // ni día seleccionado).
  const conteoPorTipo = useMemo(() => {
    const totales: Record<TipoEventoFiscal, number> = {
      sat: 0,
      imss: 0,
      estatal: 0,
      repse: 0,
      honorarios: 0,
    };
    for (const e of eventosTodos) {
      const dias = diasHasta(e.fecha);
      if (dias < 0 || dias > ventana) continue;
      totales[e.tipo] += 1;
    }
    return totales;
  }, [eventosTodos, ventana]);

  const totalVisibles = eventosVisibles.length;
  const totalEnVentana = useMemo(
    () =>
      eventosTodos.filter((e) => {
        const d = diasHasta(e.fecha);
        return d >= 0 && d <= ventana;
      }).length,
    [eventosTodos, ventana]
  );

  // Descarga consolidada (.ics) de TODOS los eventos visibles.
  const descargarTodos = () => {
    if (eventosVisibles.length === 0) return;
    const evs: EventoFiscal[] = eventosVisibles.map((e) => ({
      tipo: e.tipo,
      etiqueta: `${e.etiqueta} · ${e.cliente.razonSocial}`,
      fecha: e.fecha,
      periodo: e.periodo,
    }));
    descargarIcs(
      evs,
      `calendario-fiscal-rdc-${ventana}d.ics`,
      "Despacho RDC"
    );
  };

  const descargarCliente = (cliente: Cliente) => {
    const suyos: EventoFiscal[] = eventosVisibles
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

  // ── Navegación del mini-calendario ────────────────────────────
  const irMesAnterior = () => {
    if (calMes === 0) {
      setCalMes(11);
      setCalAnio((y) => y - 1);
    } else {
      setCalMes((m) => m - 1);
    }
  };
  const irMesSiguiente = () => {
    if (calMes === 11) {
      setCalMes(0);
      setCalAnio((y) => y + 1);
    } else {
      setCalMes((m) => m + 1);
    }
  };
  const irHoy = () => {
    setCalMes(hoy.getMonth());
    setCalAnio(hoy.getFullYear());
    setDiaSeleccionado(hoy);
  };

  // ── Construcción de la grilla del mini-calendario ─────────────
  // Devuelve un array de 6 filas × 7 columnas (siempre 42 celdas)
  // empezando en lunes para que sea estable visualmente.
  const grillaCalendario = useMemo(() => {
    const primerDia = new Date(calAnio, calMes, 1);
    // getDay() devuelve 0=Dom..6=Sab; convertimos a 0=Lun..6=Dom.
    const offsetLunes = (primerDia.getDay() + 6) % 7;
    const inicio = new Date(calAnio, calMes, 1 - offsetLunes);
    const celdas: Date[] = [];
    for (let i = 0; i < 42; i += 1) {
      celdas.push(
        new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i)
      );
    }
    return celdas;
  }, [calMes, calAnio]);

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
              Calendario fiscal
            </h2>
            <p className="text-[11px] font-bold text-slate-400 mt-1">
              {diaSeleccionado
                ? `Día seleccionado: ${formatearFecha(diaSeleccionado)} · ${totalVisibles} evento${totalVisibles === 1 ? "" : "s"}`
                : `${totalEnVentana} vencimiento${totalEnVentana === 1 ? "" : "s"} en los próximos ${ventana} días`}
            </p>
          </div>
          {/* Botón global: descarga todos los eventos visibles
              (respeta filtro de tipo + ventana 30/60/90). Es el
              botón "primario" — por eso el slate-900 sólido. */}
          <button
            type="button"
            onClick={descargarTodos}
            disabled={totalVisibles === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-slate-200 transition-colors"
            title="Descarga TODOS los vencimientos visibles (respeta filtro de tipo y ventana de días). Genera un .ics que iPhone, Google Calendar y Outlook abren nativamente."
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Bajar todos los vencimientos
          </button>
        </div>

        {/* Filtros + indicador de día seleccionado */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            {([30, 60, 90] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setVentana(v);
                  setDiaSeleccionado(null);
                }}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  ventana === v && !diaSeleccionado
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
              Todos · {totalEnVentana}
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

          {diaSeleccionado && (
            <button
              type="button"
              onClick={() => setDiaSeleccionado(null)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
            >
              <svg
                width="10"
                height="10"
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
              Limpiar día
            </button>
          )}
        </div>
      </div>

      {/* CUERPO:
           - mobile: solo lista (sin altura fija)
           - lg: 2 cols arriba (lista | mini-cal) cada una a 640px de alto,
                 timeline ocupando ancho completo abajo con su propia altura.
           - xl: 3 cols en 1 sola fila, todas a 640px → sin huecos blancos. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.2fr_0.95fr_0.95fr] lg:divide-x divide-slate-50">
        {/* ─── COLUMNA IZQUIERDA: lista ─────────────────────────
             Mask gradient en bordes superior/inferior: al hacer
             scroll el contenido se desvanece en lugar de cortarse
             seco (mismo gesto de iOS). Sólo es visual, no afecta
             interacción. */}
        <div
          className="min-w-0 lg:h-[640px] lg:overflow-y-auto"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
          }}
        >
          {agrupadoPorDia.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-3xl mb-2">🌴</p>
              <p className="text-sm font-bold text-slate-400">
                {diaSeleccionado
                  ? "Sin eventos en este día."
                  : `Sin vencimientos fiscales en los próximos ${ventana} días con este filtro.`}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {agrupadoPorDia.map((grupo) => {
                const dias = diasHasta(grupo.fecha);
                const esHoy = dias === 0;
                const esManana = dias === 1;
                const esUrgente = dias <= 3;
                const esProximo = dias <= 7;
                return (
                  <li key={claveFecha(grupo.fecha)} className="px-5 lg:px-6 py-4">
                    <div className="flex items-start gap-3">
                      {/* Columna fecha — chip oscuro estilo widget iOS.
                           El acento de color (rojo/ámbar/índigo/slate)
                           ahora va en el degradado y en el shadow para
                           dar más presencia visual. */}
                      <div className="shrink-0 text-center w-14">
                        <div
                          className={`rounded-2xl px-1.5 py-2 shadow-lg text-white bg-gradient-to-br ${
                            esHoy
                              ? "from-red-500 to-red-700 shadow-red-200"
                              : esUrgente
                                ? "from-amber-500 to-amber-700 shadow-amber-200"
                                : esProximo
                                  ? "from-indigo-600 to-indigo-800 shadow-indigo-200"
                                  : "from-slate-700 to-slate-900 shadow-slate-300"
                          }`}
                        >
                          <p className="text-[8px] font-black uppercase tracking-widest leading-tight text-white/70">
                            {grupo.fecha.toLocaleDateString("es-MX", {
                              weekday: "short",
                            })}
                          </p>
                          <p className="text-xl font-black tabular-nums leading-none mt-0.5">
                            {grupo.fecha.getDate()}
                          </p>
                          <p className="text-[8px] font-black uppercase tracking-widest mt-0.5 text-white/70">
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
                              : dias < 0
                                ? `${Math.abs(dias)}d`
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
                              className={`group flex items-center gap-2.5 p-2 rounded-xl border ${color.borde} ${color.fondoBadge} hover:shadow-md transition-shadow`}
                            >
                              <span
                                className="text-base shrink-0"
                                aria-hidden="true"
                              >
                                {ICONO_TIPO[e.tipo]}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-0.5">
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
                              {/* Dos botones de descarga con scope claro:
                                  · "Este vencimiento" → solo este evento puntual.
                                  · "Todos del cliente" → todos los próximos
                                    eventos fiscales de ese cliente. */}
                              <div className="flex flex-col gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => descargarEvento(e)}
                                  className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-[8px] font-black uppercase tracking-widest transition-colors whitespace-nowrap"
                                  title={`Descargar SOLO este vencimiento (${e.etiqueta}) al calendario`}
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
                                  Este vencimiento
                                </button>
                                <button
                                  type="button"
                                  onClick={() => descargarCliente(e.cliente)}
                                  className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-white text-indigo-700 hover:bg-indigo-50 text-[8px] font-black uppercase tracking-widest border border-indigo-200 transition-colors whitespace-nowrap"
                                  title={`Descargar TODOS los próximos eventos fiscales de ${e.cliente.razonSocial}`}
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
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="20" y1="8" x2="20" y2="14" />
                                    <line x1="17" y1="11" x2="23" y2="11" />
                                  </svg>
                                  Todos del cliente
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
        </div>

        {/* ─── COLUMNA DERECHA: mini-calendario iOS ──────────── */}
        <div className="hidden lg:block lg:h-[640px] lg:overflow-y-auto px-5 lg:px-6 py-5 bg-gradient-to-br from-white via-slate-50/40 to-indigo-50/20">
          <MiniCalendarioIOS
            mes={calMes}
            anio={calAnio}
            grilla={grillaCalendario}
            eventosPorDia={eventosPorDia}
            hoy={hoy}
            diaSeleccionado={diaSeleccionado}
            onSeleccionarDia={setDiaSeleccionado}
            onMesAnterior={irMesAnterior}
            onMesSiguiente={irMesSiguiente}
            onIrHoy={irHoy}
          />
        </div>

        {/* ─── COLUMNA DERECHA: timeline del cierre ──────────── */}
        {/* En lg ocupa el ancho completo de la fila (debajo);
            en xl entra como tercera columna lateral con misma altura
            que las otras dos para evitar huecos en blanco. */}
        <div className="hidden lg:block lg:col-span-2 xl:col-span-1 lg:h-[640px] lg:overflow-hidden lg:border-t xl:border-t-0 lg:border-slate-50 px-5 lg:px-6 py-5 bg-gradient-to-br from-white via-emerald-50/20 to-slate-50/40">
          <TimelineCierreDespacho
            mesActual={hoy.getMonth()}
            anioActual={hoy.getFullYear()}
          />
        </div>
      </div>

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

/* -------------------------------------------------------------------------- */
/* MINI-CALENDARIO ESTILO iOS                                                  */
/* -------------------------------------------------------------------------- */

function MiniCalendarioIOS({
  mes,
  anio,
  grilla,
  eventosPorDia,
  hoy,
  diaSeleccionado,
  onSeleccionarDia,
  onMesAnterior,
  onMesSiguiente,
  onIrHoy,
}: {
  mes: number;
  anio: number;
  grilla: Date[];
  eventosPorDia: Map<string, EventoConCliente[]>;
  hoy: Date;
  diaSeleccionado: Date | null;
  onSeleccionarDia: (d: Date | null) => void;
  onMesAnterior: () => void;
  onMesSiguiente: () => void;
  onIrHoy: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Header del calendario: mes/año + navegación */}
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-700">
            Vista mensual
          </p>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            {NOMBRES_MES_CORTO[mes]} {anio}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onIrHoy}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={onMesAnterior}
            aria-label="Mes anterior"
            className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
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
          <button
            type="button"
            onClick={onMesSiguiente}
            aria-label="Mes siguiente"
            className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
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
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA_CORTO.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-1">
        {grilla.map((dia, i) => {
          const esMesActual = dia.getMonth() === mes;
          const esHoy = mismaFecha(dia, hoy);
          const esSeleccionado =
            !!diaSeleccionado && mismaFecha(dia, diaSeleccionado);
          const eventosDelDia = eventosPorDia.get(claveFecha(dia)) ?? [];
          const tieneEventos = eventosDelDia.length > 0;

          // Tipos únicos para los dots (máx 3 dots distintos).
          const tiposUnicos = Array.from(
            new Set(eventosDelDia.map((e) => e.tipo))
          ).slice(0, 3);
          const extraEventos = eventosDelDia.length - tiposUnicos.length;

          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (esSeleccionado) {
                  onSeleccionarDia(null);
                } else {
                  onSeleccionarDia(dia);
                }
              }}
              className={`group relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl transition-all ${
                esSeleccionado
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : esHoy
                    ? "bg-red-500 text-white shadow-md shadow-red-200"
                    : tieneEventos
                      ? esMesActual
                        ? "bg-white hover:bg-indigo-50 ring-1 ring-slate-100 hover:ring-indigo-200"
                        : "bg-slate-50/60 hover:bg-indigo-50/50"
                      : esMesActual
                        ? "hover:bg-slate-50"
                        : ""
              }`}
            >
              <span
                className={`text-[11px] font-black tabular-nums leading-none ${
                  esSeleccionado || esHoy
                    ? "text-white"
                    : esMesActual
                      ? "text-slate-800"
                      : "text-slate-300"
                }`}
              >
                {dia.getDate()}
              </span>
              {tieneEventos && (
                <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center gap-0.5">
                  {tiposUnicos.map((t) => {
                    const color = COLORES_EVENTO[t];
                    return (
                      <span
                        key={t}
                        className={`w-1 h-1 rounded-full ${
                          esSeleccionado || esHoy
                            ? "bg-white/90"
                            : color.dot
                        }`}
                      />
                    );
                  })}
                  {extraEventos > 0 && (
                    <span
                      className={`text-[7px] font-black leading-none ${
                        esSeleccionado || esHoy
                          ? "text-white/80"
                          : "text-slate-400"
                      }`}
                    >
                      +{extraEventos}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda de colores */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">
          Tipos de evento
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {(["sat", "imss", "estatal", "repse"] as const).map((t) => {
            const color = COLORES_EVENTO[t];
            return (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                {ETIQUETA_TIPO_CORTA[t]}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tip uso */}
      <p className="mt-3 text-[9px] font-bold text-slate-400 text-center">
        Click en un día para filtrar la lista · Hoy aparece en rojo, día
        seleccionado en azul
      </p>
    </div>
  );
}

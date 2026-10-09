"use client";

import { useMemo, useState } from "react";
import {
  COLORES_EVENTO,
  esFestivoFederal,
  type EventoFiscal,
  type TipoEventoFiscal,
} from "@/lib/portal/fechas-fiscales";

const DIAS_SEMANA_CORTOS = ["L", "M", "M", "J", "V", "S", "D"];
const MES_NOMBRES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export type MesActivoCalendario = { mes: number; anio: number };

type Props = {
  eventos: EventoFiscal[];
  hoy: Date;
  /** Sin card exterior ni cabecera (para agenda unificada). */
  embedded?: boolean;
  mesActivo?: MesActivoCalendario;
  onMesActivoChange?: (m: MesActivoCalendario) => void;
  diaSel?: number;
  onDiaSelChange?: (dia: number) => void;
  /** Resalta el próximo vencimiento con anillo morado. */
  fechaProxima?: Date | null;
  showDetalleDia?: boolean;
  showLeyenda?: boolean;
  /** Celdas más bajas para móvil. */
  compacto?: boolean;
};

function mismaFecha(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function diasEntre(a: Date, b: Date): number {
  const x = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const y = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((y - x) / 86_400_000);
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dir === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

const LEYENDA: Array<{ tipo: TipoEventoFiscal; label: string }> = [
  { tipo: "honorarios", label: "Hon." },
  { tipo: "sat", label: "SAT" },
  { tipo: "imss", label: "IMSS" },
  { tipo: "estatal", label: "Est." },
  { tipo: "repse", label: "REPSE" },
];

export default function PortalCalendarioFiscal({
  eventos,
  hoy,
  embedded = false,
  mesActivo: mesControlado,
  onMesActivoChange,
  diaSel: diaControlado,
  onDiaSelChange,
  fechaProxima = null,
  showDetalleDia = true,
  showLeyenda = true,
  compacto = false,
}: Props) {
  const [mesInterno, setMesInterno] = useState<MesActivoCalendario>(() => ({
    mes: hoy.getMonth(),
    anio: hoy.getFullYear(),
  }));
  const [diaInterno, setDiaInterno] = useState(() => hoy.getDate());

  const mesActivo = mesControlado ?? mesInterno;
  const diaSel = diaControlado ?? diaInterno;

  const setMesActivo = (m: MesActivoCalendario) => {
    if (onMesActivoChange) onMesActivoChange(m);
    else setMesInterno(m);
  };

  const setDiaSel = (d: number) => {
    if (onDiaSelChange) onDiaSelChange(d);
    else setDiaInterno(d);
  };

  const eventosPorDia = useMemo(() => {
    const m = new Map<number, EventoFiscal[]>();
    for (const e of eventos) {
      if (
        e.fecha.getMonth() === mesActivo.mes &&
        e.fecha.getFullYear() === mesActivo.anio
      ) {
        const arr = m.get(e.fecha.getDate()) ?? [];
        arr.push(e);
        m.set(e.fecha.getDate(), arr);
      }
    }
    return m;
  }, [eventos, mesActivo]);

  const ajustarDiaPara = (nuevo: MesActivoCalendario) => {
    if (nuevo.mes === hoy.getMonth() && nuevo.anio === hoy.getFullYear()) {
      setDiaSel(hoy.getDate());
      return;
    }
    const diasConEventos = eventos
      .filter(
        (e) =>
          e.fecha.getMonth() === nuevo.mes &&
          e.fecha.getFullYear() === nuevo.anio
      )
      .map((e) => e.fecha.getDate())
      .sort((a, b) => a - b);
    setDiaSel(diasConEventos[0] ?? 1);
  };

  const irMes = (delta: number) => {
    const total = mesActivo.anio * 12 + mesActivo.mes + delta;
    const nuevo: MesActivoCalendario = {
      mes: ((total % 12) + 12) % 12,
      anio: Math.floor(total / 12),
    };
    ajustarDiaPara(nuevo);
    setMesActivo(nuevo);
  };

  const irHoy = () => {
    const nuevo = { mes: hoy.getMonth(), anio: hoy.getFullYear() };
    setMesActivo(nuevo);
    setDiaSel(hoy.getDate());
  };

  const primerDiaMes = new Date(mesActivo.anio, mesActivo.mes, 1);
  const diasEnMes = new Date(mesActivo.anio, mesActivo.mes + 1, 0).getDate();
  const inicioOffset = (primerDiaMes.getDay() + 6) % 7;
  const totalCeldas = Math.ceil((inicioOffset + diasEnMes) / 7) * 7;

  const eventosSel = eventosPorDia.get(diaSel) ?? [];
  const fechaSel = new Date(mesActivo.anio, mesActivo.mes, diaSel);

  const contenido = (
    <>
      <div className="flex items-center justify-center gap-1 mb-3">
        <button
          type="button"
          onClick={() => irMes(-1)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 active:bg-slate-200"
          aria-label="Mes anterior"
        >
          <ChevronIcon dir="left" />
        </button>
        <p className="min-w-[9rem] text-center text-[12px] font-black text-slate-800 uppercase tracking-wider">
          {MES_NOMBRES[mesActivo.mes]} {mesActivo.anio}
        </p>
        <button
          type="button"
          onClick={() => irMes(1)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 active:bg-slate-200"
          aria-label="Mes siguiente"
        >
          <ChevronIcon dir="right" />
        </button>
        <button
          type="button"
          onClick={irHoy}
          className="ml-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-[var(--portal-navy)] bg-[var(--portal-navy-soft)] hover:bg-[var(--portal-navy-muted)]"
        >
          Hoy
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-0.5">
        {DIAS_SEMANA_CORTOS.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className={`text-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
              i >= 5 ? "text-slate-300" : "text-slate-400"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {Array.from({ length: totalCeldas }).map((_, idx) => {
          const dia = idx - inicioOffset + 1;
          if (dia < 1 || dia > diasEnMes) {
            return <div key={idx} aria-hidden />;
          }
          const fecha = new Date(mesActivo.anio, mesActivo.mes, dia);
          const eventosDia = eventosPorDia.get(dia) ?? [];
          const esHoy = mismaFecha(fecha, hoy);
          const esSeleccionado = dia === diaSel;
          const esProximo = fechaProxima ? mismaFecha(fecha, fechaProxima) : false;
          const dow = fecha.getDay();
          const inhabil = dow === 0 || dow === 6 || esFestivoFederal(fecha);
          const tiposUnicos = Array.from(
            new Set(eventosDia.map((e) => e.tipo))
          ).slice(0, 3);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setDiaSel(dia)}
              className={`relative rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-colors ${
                compacto ? "min-h-[2rem] sm:min-h-[2.35rem]" : "aspect-square"
              } ${
                esSeleccionado
                  ? "bg-[var(--portal-navy)] text-white"
                  : esHoy
                    ? "bg-[var(--portal-navy-soft)] text-[var(--portal-navy)] ring-2 ring-[var(--portal-navy-border)]"
                    : inhabil
                      ? "text-slate-300 hover:bg-slate-50"
                      : "text-slate-700 hover:bg-slate-50"
              } ${esProximo && !esSeleccionado ? "ring-2 ring-[var(--portal-purple)] ring-offset-1" : ""}`}
              aria-label={`${dia} de ${MES_NOMBRES[mesActivo.mes]}${
                eventosDia.length ? `, ${eventosDia.length} eventos` : ""
              }`}
            >
              <span
                className={`text-[11px] sm:text-[12px] font-bold ${
                  esSeleccionado
                    ? "text-white"
                    : esHoy
                      ? "text-[var(--portal-navy)] font-black"
                      : ""
                }`}
              >
                {dia}
              </span>
              {tiposUnicos.length > 0 && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-[2px]">
                  {tiposUnicos.map((t) => (
                    <span
                      key={t}
                      className={`w-1 h-1 rounded-full ${
                        esSeleccionado ? "bg-white/80" : COLORES_EVENTO[t].dot
                      }`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showDetalleDia && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {fechaSel.toLocaleDateString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          {eventosSel.length === 0 ? (
            <p className="text-[12px] font-bold text-slate-400 mt-1">
              Sin vencimientos para este día.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {eventosSel.map((e, i) => {
                const c = COLORES_EVENTO[e.tipo];
                const d = diasEntre(hoy, e.fecha);
                const tono =
                  d < 0
                    ? "text-red-600"
                    : d <= 5
                      ? "text-amber-600"
                      : "text-slate-500";
                const detalle =
                  d < 0
                    ? "Ya pasó"
                    : d === 0
                      ? "Hoy"
                      : `En ${d} día${d === 1 ? "" : "s"}`;
                return (
                  <li
                    key={`${e.tipo}-${i}`}
                    className={`flex items-center justify-between gap-3 py-2 px-3 rounded-xl border ${c.borde} ${c.fondoBadge}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />
                      <p className={`text-[12px] font-bold ${c.textoBadge} truncate`}>
                        {e.etiqueta}
                      </p>
                    </div>
                    <p className={`text-[11px] font-black uppercase tracking-widest shrink-0 ${tono}`}>
                      {detalle}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {showLeyenda && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 sm:gap-3">
          {LEYENDA.map((l) => (
            <div key={l.tipo} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${COLORES_EVENTO[l.tipo].dot}`} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                {l.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (embedded) return <div className="min-w-0">{contenido}</div>;

  return (
    <div className="rdc-card bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-sm p-5 sm:p-6 flex flex-col">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
        Calendario fiscal
      </p>
      {contenido}
    </div>
  );
}

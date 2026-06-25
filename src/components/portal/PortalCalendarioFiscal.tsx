"use client";

import { useMemo, useState } from "react";
import {
  COLORES_EVENTO,
  esFestivoFederal,
  type EventoFiscal,
  type TipoEventoFiscal,
} from "@/lib/portal/fechas-fiscales";
import { descargarIcs } from "@/lib/portal/ics";

/**
 * Calendario fiscal mensual tipo "app Calendario" para el inicio del portal.
 *
 * - Muestra un mes a la vez con navegación hacia adelante/atrás.
 * - Cada día con eventos lleva dots de color según el tipo de obligación.
 * - Al tocar un día, se muestra el detalle de sus eventos abajo.
 * - Resalta el día de HOY y los inhábiles (sábado, domingo, festivo).
 */

const DIAS_SEMANA_CORTOS = ["L", "M", "M", "J", "V", "S", "D"]; // Lunes primero
const MES_NOMBRES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

const LEYENDA: Array<{ tipo: TipoEventoFiscal; label: string }> = [
  { tipo: "honorarios", label: "Honorarios" },
  { tipo: "sat", label: "SAT" },
  { tipo: "imss", label: "IMSS" },
  { tipo: "estatal", label: "Estatal" },
  { tipo: "repse", label: "REPSE" },
];

export default function PortalCalendarioFiscal({
  eventos,
  hoy,
  nombreCliente,
}: {
  eventos: EventoFiscal[];
  hoy: Date;
  nombreCliente?: string;
}) {
  const [mesActivo, setMesActivo] = useState<{ mes: number; anio: number }>(
    () => ({ mes: hoy.getMonth(), anio: hoy.getFullYear() })
  );

  // Eventos del mes activo agrupados por día (1-31).
  const eventosPorDia = useMemo(() => {
    const m = new Map<number, EventoFiscal[]>();
    for (const e of eventos) {
      if (e.fecha.getMonth() === mesActivo.mes && e.fecha.getFullYear() === mesActivo.anio) {
        const arr = m.get(e.fecha.getDate()) ?? [];
        arr.push(e);
        m.set(e.fecha.getDate(), arr);
      }
    }
    return m;
  }, [eventos, mesActivo]);

  // Día seleccionado: si el mes activo es el de hoy, arranca en hoy; si no, en el día 1.
  const [diaSel, setDiaSel] = useState<number>(() => hoy.getDate());

  // Si cambia el mes activo, ajustamos el día seleccionado para que sea válido.
  // Si el nuevo mes es el actual, vamos al día de hoy; si no, al primer día con eventos o al 1.
  const ajustarDiaPara = (nuevo: { mes: number; anio: number }) => {
    if (nuevo.mes === hoy.getMonth() && nuevo.anio === hoy.getFullYear()) {
      setDiaSel(hoy.getDate());
      return;
    }
    // Busca el primer día del mes con eventos
    const diasConEventos = eventos
      .filter(
        (e) =>
          e.fecha.getMonth() === nuevo.mes && e.fecha.getFullYear() === nuevo.anio
      )
      .map((e) => e.fecha.getDate())
      .sort((a, b) => a - b);
    setDiaSel(diasConEventos[0] ?? 1);
  };

  const irMes = (delta: number) => {
    setMesActivo((prev) => {
      const total = prev.anio * 12 + prev.mes + delta;
      const nuevo = { mes: ((total % 12) + 12) % 12, anio: Math.floor(total / 12) };
      ajustarDiaPara(nuevo);
      return nuevo;
    });
  };

  const primerDiaMes = new Date(mesActivo.anio, mesActivo.mes, 1);
  const diasEnMes = new Date(mesActivo.anio, mesActivo.mes + 1, 0).getDate();
  // Lunes primero: domingo=0 lo movemos al final
  const inicioOffset = (primerDiaMes.getDay() + 6) % 7;
  const totalCeldas = Math.ceil((inicioOffset + diasEnMes) / 7) * 7;

  const eventosSel = eventosPorDia.get(diaSel) ?? [];
  const fechaSel = new Date(mesActivo.anio, mesActivo.mes, diaSel);

  const handleExportar = () => {
    if (eventos.length === 0) return;
    descargarIcs(eventos, "calendario-fiscal-rdc.ics", nombreCliente);
  };

  return (
    <div className="rdc-card bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-sm p-5 sm:p-6 flex flex-col">
      {/* Cabecera: título + botón exportar */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Calendario fiscal
        </p>
        <button
          type="button"
          onClick={handleExportar}
          disabled={eventos.length === 0}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[var(--portal-navy)] bg-[var(--portal-navy-soft)] hover:bg-[var(--portal-navy-muted)] active:bg-[var(--portal-navy-muted)] disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest transition-colors"
          aria-label="Agregar al calendario de tu teléfono"
          title="Descargar archivo .ics para tu app de calendario"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
            <path d="M12 14v6" />
            <path d="m9 17 3 3 3-3" />
          </svg>
          Agregar a mi calendario
        </button>
      </div>

      {/* Navegación del mes */}
      <div className="flex items-center justify-center gap-1 mb-4">
        <button
          type="button"
          onClick={() => irMes(-1)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 active:bg-slate-200"
          aria-label="Mes anterior"
        >
          <ChevronIcon dir="left" />
        </button>
        <p className="min-w-[10rem] text-center text-[13px] font-black text-slate-800 uppercase tracking-wider">
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
      </div>

      {/* Encabezado L M M J V S D */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA_CORTOS.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className={`text-center text-[10px] font-black uppercase tracking-widest ${
              i >= 5 ? "text-slate-300" : "text-slate-400"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid del mes */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: totalCeldas }).map((_, idx) => {
          const dia = idx - inicioOffset + 1;
          if (dia < 1 || dia > diasEnMes) {
            return <div key={idx} aria-hidden />;
          }
          const fecha = new Date(mesActivo.anio, mesActivo.mes, dia);
          const eventosDia = eventosPorDia.get(dia) ?? [];
          const esHoy = mismaFecha(fecha, hoy);
          const esSeleccionado = dia === diaSel;
          const dow = fecha.getDay();
          const esFinSem = dow === 0 || dow === 6;
          const esFestivo = esFestivoFederal(fecha);
          const inhabil = esFinSem || esFestivo;
          // Hasta 4 dots únicos por tipo
          const tiposUnicos = Array.from(
            new Set(eventosDia.map((e) => e.tipo))
          ).slice(0, 4);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setDiaSel(dia)}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-colors ${
                esSeleccionado
                  ? "bg-[var(--portal-navy)] text-white"
                  : esHoy
                    ? "bg-[var(--portal-navy-soft)] text-[var(--portal-navy)] ring-2 ring-[var(--portal-navy-border)]"
                    : inhabil
                      ? "text-slate-300 hover:bg-slate-50"
                      : "text-slate-700 hover:bg-slate-50"
              }`}
              aria-label={`${dia} de ${MES_NOMBRES[mesActivo.mes]}${
                eventosDia.length ? `, ${eventosDia.length} eventos` : ""
              }`}
            >
              <span
                className={`text-[12px] font-bold ${
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
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-[2px]">
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

      {/* Detalle del día seleccionado */}
      <div className="mt-5 pt-5 border-t border-slate-100">
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

      {/* Leyenda */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
        {LEYENDA.map((l) => (
          <div key={l.tipo} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${COLORES_EVENTO[l.tipo].dot}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

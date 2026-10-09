"use client";

import { useEffect, useRef, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import {
  MESES_NOM,
  esMismoPeriodo,
  periodoLabel,
} from "@/lib/clientes";

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const ChevronUpDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="opacity-40"
    aria-hidden
  >
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

type Props = {
  modoFiscal?: boolean;
  acento?: "violet" | "navy";
};

/**
 * Selector compacto de mes/año en la barra superior (solo escritorio).
 */
export default function PeriodoSelectorTopBar({
  modoFiscal = false,
  acento = "violet",
}: Props) {
  const {
    periodo,
    periodoHoy,
    periodoFiscalVigente,
    setPeriodoMes,
    setPeriodoAnio,
    irAPeriodoActual,
    irAPeriodoFiscalVigente,
    aniosDisponibles,
  } = useClientes();

  const [abierto, setAbierto] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const referencia = modoFiscal ? periodoFiscalVigente : periodoHoy;
  const enReferencia = esMismoPeriodo(periodo, referencia);

  const colorPunto =
    acento === "navy" ? "bg-[var(--portal-navy)]" : "bg-violet-500";
  const colorTexto =
    acento === "navy"
      ? "text-[var(--portal-navy)]"
      : "text-violet-700 dark:text-violet-300";
  const colorBotonReset =
    acento === "navy"
      ? "text-[var(--portal-navy)] bg-[var(--portal-navy-soft)] hover:bg-[var(--portal-navy-border)]"
      : "text-violet-700 bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/15 dark:hover:bg-violet-500/25";

  useEffect(() => {
    if (!abierto) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [abierto]);

  return (
    <div ref={rootRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Cambiar periodo de consulta"
        aria-expanded={abierto}
        title={`${modoFiscal ? "Periodo fiscal" : "Periodo de consulta"}: ${periodoLabel(periodo)}`}
        className={`relative flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${abierto ? colorTexto : ""}`}
      >
        <CalendarIcon />
        <span className={`hidden xl:inline text-[11px] font-bold tabular-nums ${colorTexto}`}>
          {MESES_NOM[periodo.mes].slice(0, 3)} {periodo.anio}
        </span>
        {!enReferencia && (
          <span
            className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${colorPunto} ring-2 ring-[#fafbfc] dark:ring-slate-900`}
          />
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[17.5rem] rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-white/10 shadow-xl shadow-slate-900/10 p-3.5">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2.5">
            {modoFiscal ? "Periodo fiscal" : "Periodo de consulta"}
          </p>

          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <select
                value={periodo.mes}
                onChange={(e) => setPeriodoMes(Number(e.target.value))}
                aria-label="Mes"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg pl-2.5 pr-7 py-2 text-[12px] font-bold text-slate-700 dark:text-slate-100 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-violet-200"
              >
                {MESES_NOM.map((nombre, i) => (
                  <option key={nombre} value={i}>
                    {nombre}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronUpDown />
              </div>
            </div>

            <div className="relative w-[5.25rem] shrink-0">
              <select
                value={periodo.anio}
                onChange={(e) => setPeriodoAnio(Number(e.target.value))}
                aria-label="Año"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg pl-2.5 pr-7 py-2 text-[12px] font-bold text-slate-700 dark:text-slate-100 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-violet-200"
              >
                {aniosDisponibles.map((anio) => (
                  <option key={anio} value={anio}>
                    {anio}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronUpDown />
              </div>
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2.5 leading-snug">
            Viendo:{" "}
            <span className={colorTexto}>{periodoLabel(periodo)}</span>
          </p>

          {modoFiscal && (
            <p className="text-[9px] font-bold text-slate-400 mt-1 leading-snug">
              Vigente: {periodoLabel(periodoFiscalVigente)}
            </p>
          )}

          {!enReferencia && (
            <button
              type="button"
              onClick={() => {
                if (modoFiscal) irAPeriodoFiscalVigente();
                else irAPeriodoActual();
              }}
              className={`mt-2.5 w-full text-[9px] font-black uppercase tracking-widest rounded-lg py-2 transition-colors ${colorBotonReset}`}
            >
              {modoFiscal
                ? `Periodo vigente (${periodoLabel(periodoFiscalVigente)})`
                : `Ir a hoy (${periodoLabel(periodoHoy)})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

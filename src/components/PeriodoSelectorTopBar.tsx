"use client";

import { useEffect, useRef, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import {
  MESES_NOM,
  esMismoPeriodo,
  periodoLabel,
} from "@/lib/clientes";

const ChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/** Calendario con el día de hoy — box 18×18, tipografía centrada ópticamente. */
function CalendarioConDia({
  dia,
  acentoClass,
}: {
  dia: number;
  acentoClass: string;
}) {
  return (
    <span className="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center overflow-hidden text-slate-400 -translate-y-[3px]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 1 24 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="block"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      <span
        className={`pointer-events-none absolute left-0 right-0 top-[8px] flex h-[9px] items-center justify-center text-[8px] font-bold leading-none tabular-nums ${acentoClass}`}
      >
        {dia}
      </span>
    </span>
  );
}

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";
const POP_MS = 160;

type Props = {
  modoFiscal?: boolean;
  acento?: "violet" | "navy";
};

/**
 * Selector compacto de mes/año en la barra superior (solo escritorio).
 * Trigger: día de hoy en el icono + Nov 2026. Panel: flechas + mes desplegable.
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
  const [montado, setMontado] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mesesAbiertos, setMesesAbiertos] = useState(false);
  const [mesFlash, setMesFlash] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const mesPrevRef = useRef(periodo.mes);

  const referencia = modoFiscal ? periodoFiscalVigente : periodoHoy;
  const enReferencia = esMismoPeriodo(periodo, referencia);
  const puedeAnterior = periodo.mes > 0;
  const puedeSiguiente = periodo.mes < 11;
  const diaHoy = new Date().getDate();
  const mesCorto = MESES_NOM[periodo.mes].slice(0, 3);

  /** Mismo token que producción (`text-violet-700` / navy). */
  const colorTexto =
    acento === "navy"
      ? "text-[#1a164d] dark:text-indigo-200"
      : "text-violet-700 dark:text-violet-300";
  const colorAnillo =
    acento === "navy"
      ? "focus-visible:ring-[#1a164d]/30"
      : "focus-visible:ring-violet-400/40";
  const colorHoy =
    acento === "navy"
      ? "text-[#1a164d] hover:bg-[#f2f2f7] dark:text-indigo-200 dark:hover:bg-white/10"
      : "text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/15";
  const colorPunto =
    acento === "navy" ? "bg-[#1a164d]" : "bg-violet-500";
  const mesActivo =
    acento === "navy"
      ? "bg-[#1a164d] text-white"
      : "bg-violet-600 text-white";

  useEffect(() => {
    if (abierto) {
      setMontado(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    setMesesAbiertos(false);
    if (!montado) return;
    const id = window.setTimeout(() => setMontado(false), POP_MS);
    return () => window.clearTimeout(id);
  }, [abierto, montado]);

  useEffect(() => {
    if (mesPrevRef.current === periodo.mes) return;
    mesPrevRef.current = periodo.mes;
    setMesFlash(true);
    const id = window.setTimeout(() => setMesFlash(false), 180);
    return () => window.clearTimeout(id);
  }, [periodo.mes]);

  useEffect(() => {
    if (!abierto) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mesesAbiertos) setMesesAbiertos(false);
        else setAbierto(false);
      }
      if (e.key === "ArrowLeft" && periodo.mes > 0) {
        e.preventDefault();
        setPeriodoMes(periodo.mes - 1);
      }
      if (e.key === "ArrowRight" && periodo.mes < 11) {
        e.preventDefault();
        setPeriodoMes(periodo.mes + 1);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [abierto, mesesAbiertos, periodo.mes, setPeriodoMes]);

  return (
    <div ref={rootRef} className="relative hidden lg:flex items-center self-center">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={`Periodo ${mesCorto} ${periodo.anio}. Hoy día ${diaHoy}`}
        aria-expanded={abierto}
        title={`${modoFiscal ? "Periodo fiscal" : "Periodo de consulta"}: ${periodoLabel(periodo)} · Hoy ${diaHoy}`}
        className={`relative inline-flex items-center justify-center gap-2 h-9 pl-2.5 pr-3 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-[background-color,transform] duration-150 ${EASE} active:scale-[0.97] outline-none focus-visible:ring-2 ${colorAnillo}`}
      >
        <CalendarioConDia dia={diaHoy} acentoClass={colorTexto} />
        <span
          className={`hidden xl:inline text-[11px] font-bold leading-none tabular-nums ${colorTexto}`}
        >
          {mesCorto} {periodo.anio}
        </span>
        {!enReferencia && (
          <span
            className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${colorPunto} ring-2 ring-[#fafbfc] dark:ring-slate-900`}
          />
        )}
      </button>

      {montado && (
        <div
          data-open={visible ? "true" : "false"}
          className="periodo-popover absolute right-0 top-full mt-2 z-50 w-[15.75rem] origin-top-right rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-black/[0.06] dark:ring-white/10 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.22)] p-3"
          role="dialog"
          aria-label={modoFiscal ? "Periodo fiscal" : "Periodo de consulta"}
          aria-hidden={!visible}
        >
          <p className="px-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {modoFiscal ? "Periodo fiscal" : "Periodo"}
          </p>

          <div className="mt-2 flex items-center gap-1">
            <button
              type="button"
              aria-label="Mes anterior"
              disabled={!puedeAnterior}
              onClick={() => setPeriodoMes(periodo.mes - 1)}
              className={`shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-[background-color,transform,opacity] duration-150 ${EASE} active:scale-[0.94] disabled:opacity-25 disabled:pointer-events-none ${colorAnillo} focus-visible:outline-none focus-visible:ring-2`}
            >
              <ChevronLeft />
            </button>

            <button
              type="button"
              aria-expanded={mesesAbiertos}
              aria-label="Elegir mes"
              onClick={() => setMesesAbiertos((v) => !v)}
              className={`flex-1 min-w-0 h-9 inline-flex items-center justify-center rounded-xl px-2 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/5 transition-[background-color,transform] duration-150 ${EASE} active:scale-[0.98] ${colorAnillo} focus-visible:outline-none focus-visible:ring-2`}
            >
              <span
                className={`text-[14px] font-semibold tracking-tight leading-none truncate transition-[filter,opacity] duration-150 ${EASE} ${
                  mesFlash ? "opacity-70 blur-[2px]" : "opacity-100 blur-0"
                }`}
              >
                {MESES_NOM[periodo.mes]}
              </span>
            </button>

            <button
              type="button"
              aria-label="Mes siguiente"
              disabled={!puedeSiguiente}
              onClick={() => setPeriodoMes(periodo.mes + 1)}
              className={`shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-[background-color,transform,opacity] duration-150 ${EASE} active:scale-[0.94] disabled:opacity-25 disabled:pointer-events-none ${colorAnillo} focus-visible:outline-none focus-visible:ring-2`}
            >
              <ChevronRight />
            </button>
          </div>

          <div
            className={`overflow-hidden transition-[max-height,opacity,margin] duration-200 ${EASE} ${
              mesesAbiertos
                ? "max-h-28 opacity-100 mt-2"
                : "max-h-0 opacity-0 mt-0 pointer-events-none"
            }`}
            aria-hidden={!mesesAbiertos}
          >
            <div
              className="grid grid-cols-4 gap-1"
              role="listbox"
              aria-label="Meses"
            >
              {MESES_NOM.map((nombre, i) => {
                const activo = i === periodo.mes;
                return (
                  <button
                    key={nombre}
                    type="button"
                    role="option"
                    aria-selected={activo}
                    tabIndex={mesesAbiertos ? 0 : -1}
                    onClick={() => {
                      setPeriodoMes(i);
                      setMesesAbiertos(false);
                    }}
                    className={`h-8 rounded-lg text-[11px] font-semibold tracking-tight transition-[background-color,color,transform] duration-150 ${EASE} active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 ${colorAnillo} ${
                      activo
                        ? mesActivo
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                    }`}
                  >
                    {nombre.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 px-0.5">
            <label className="sr-only" htmlFor="periodo-anio-topbar">
              Año
            </label>
            <select
              id="periodo-anio-topbar"
              value={periodo.anio}
              onChange={(e) => setPeriodoAnio(Number(e.target.value))}
              className="w-full appearance-none bg-transparent rounded-xl px-3 py-1.5 text-center text-[12px] font-semibold tabular-nums text-slate-500 dark:text-slate-400 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 focus:bg-slate-50 dark:focus:bg-white/5 transition-[background-color] duration-150"
            >
              {aniosDisponibles.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
          </div>

          {modoFiscal && (
            <p className="mt-1 px-1 text-[11px] text-slate-400 leading-snug">
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
              className={`mt-1 w-full text-[12px] font-semibold rounded-xl py-2 transition-[background-color,transform] duration-150 ${EASE} active:scale-[0.98] ${colorHoy}`}
            >
              {modoFiscal
                ? `Ir a vigente · ${periodoLabel(periodoFiscalVigente)}`
                : `Ir a hoy · ${periodoLabel(periodoHoy)}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

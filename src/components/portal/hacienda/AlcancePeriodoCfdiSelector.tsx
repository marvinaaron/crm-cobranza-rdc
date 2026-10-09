"use client";

import { useEffect, useRef, useState } from "react";
import { MESES_NOM } from "@/lib/clientes";
import {
  PRESETS_ALCANCE_CFDI,
  alcanceLabel,
  type PresetAlcanceCfdi,
} from "@/lib/cfdi/alcance-periodo";
import { useAlcanceCfdi } from "@/context/AlcanceCfdiContext";

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
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

type Props = {
  className?: string;
};

/**
 * Selector de alcance CFDI: presets (este mes, mes anterior, YTD, año) + de mes a mes.
 */
export default function AlcancePeriodoCfdiSelector({ className = "" }: Props) {
  const { alcance, aniosDisponibles, setPreset, setRango, setAnioRef } =
    useAlcanceCfdi();
  const [abierto, setAbierto] = useState(false);
  const [modoRango, setModoRango] = useState(alcance.preset === "rango");
  const [desdeMes, setDesdeMes] = useState(alcance.desde.mes);
  const [desdeAnio, setDesdeAnio] = useState(alcance.desde.anio);
  const [hastaMes, setHastaMes] = useState(alcance.hasta.mes);
  const [hastaAnio, setHastaAnio] = useState(alcance.hasta.anio);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    setModoRango(alcance.preset === "rango");
    setDesdeMes(alcance.desde.mes);
    setDesdeAnio(alcance.desde.anio);
    setHastaMes(alcance.hasta.mes);
    setHastaAnio(alcance.hasta.anio);
  }, [abierto, alcance]);

  useEffect(() => {
    if (!abierto) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setAbierto(false);
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

  const aplicarPreset = (id: Exclude<PresetAlcanceCfdi, "rango">) => {
    setModoRango(false);
    setPreset(id, alcance.anioRef ?? alcance.hasta.anio);
    if (id !== "ytd" && id !== "anio_completo") setAbierto(false);
  };

  const aplicarRango = () => {
    setRango(
      { mes: desdeMes, anio: desdeAnio },
      { mes: hastaMes, anio: hastaAnio }
    );
    setAbierto(false);
  };

  const selectCls =
    "h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50"
        aria-expanded={abierto}
        aria-haspopup="dialog"
      >
        <span className="text-slate-400">
          <CalendarIcon />
        </span>
        <span className="max-w-[14rem] truncate">{alcanceLabel(alcance)}</span>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Periodo
        </span>
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label="Seleccionar periodo CFDI"
          className="absolute right-0 z-40 mt-2 w-[min(100vw-2rem,20rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
        >
          <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Accesos rápidos
          </p>
          <ul className="space-y-1">
            {PRESETS_ALCANCE_CFDI.map((p) => {
              const activo = !modoRango && alcance.preset === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => aplicarPreset(p.id)}
                    className={`flex w-full flex-col rounded-xl px-3 py-2 text-left transition ${
                      activo
                        ? "bg-slate-900 text-white"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <span className="text-sm font-bold">{p.label}</span>
                    <span
                      className={`text-[11px] font-medium ${
                        activo ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {p.descripcion}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {(alcance.preset === "ytd" || alcance.preset === "anio_completo") &&
            !modoRango && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <label className="mb-1.5 block px-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Año
                </label>
                <select
                  className={`${selectCls} w-full`}
                  value={alcance.anioRef ?? alcance.desde.anio}
                  onChange={(e) => setAnioRef(Number(e.target.value))}
                >
                  {aniosDisponibles.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            )}

          <div className="mt-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setModoRango(true)}
              className={`mb-2 w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                modoRango || alcance.preset === "rango"
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-50 text-slate-800"
              }`}
            >
              De mes a mes
              <span
                className={`mt-0.5 block text-[11px] font-medium ${
                  modoRango || alcance.preset === "rango"
                    ? "text-slate-300"
                    : "text-slate-400"
                }`}
              >
                Elige inicio y fin
              </span>
            </button>

            {modoRango && (
              <div className="space-y-2 rounded-xl bg-slate-50 p-2.5">
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Desde
                  </p>
                  <div className="flex gap-1.5">
                    <select
                      className={`${selectCls} flex-1`}
                      value={desdeMes}
                      onChange={(e) => setDesdeMes(Number(e.target.value))}
                    >
                      {MESES_NOM.map((m, i) => (
                        <option key={m} value={i}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      className={`${selectCls} w-[5.5rem]`}
                      value={desdeAnio}
                      onChange={(e) => setDesdeAnio(Number(e.target.value))}
                    >
                      {aniosDisponibles.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Hasta
                  </p>
                  <div className="flex gap-1.5">
                    <select
                      className={`${selectCls} flex-1`}
                      value={hastaMes}
                      onChange={(e) => setHastaMes(Number(e.target.value))}
                    >
                      {MESES_NOM.map((m, i) => (
                        <option key={m} value={i}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      className={`${selectCls} w-[5.5rem]`}
                      value={hastaAnio}
                      onChange={(e) => setHastaAnio(Number(e.target.value))}
                    >
                      {aniosDisponibles.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={aplicarRango}
                  className="mt-1 h-9 w-full rounded-lg bg-[var(--portal-navy,#1e3a5f)] text-xs font-black uppercase tracking-wider text-white hover:opacity-90"
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

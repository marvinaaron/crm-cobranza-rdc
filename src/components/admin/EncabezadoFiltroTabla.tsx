"use client";

import { useEffect, useRef, useState } from "react";

type OpcionFiltro = {
  id: string;
  label: string;
  count?: number;
};

type Props = {
  label: string;
  opciones: OpcionFiltro[];
  seleccionados: Set<string>;
  onChange: (next: Set<string>) => void;
  className?: string;
  alineacion?: "left" | "center";
  rowSpan?: number;
};

export default function EncabezadoFiltroTabla({
  label,
  opciones,
  seleccionados,
  onChange,
  className = "",
  alineacion = "left",
  rowSpan,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const activo = seleccionados.size > 0;

  useEffect(() => {
    if (!abierto) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [abierto]);

  const toggle = (id: string) => {
    const next = new Set(seleccionados);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  const align =
    alineacion === "center" ? "text-center justify-center" : "text-left justify-start";

  return (
    <th
      ref={ref}
      rowSpan={rowSpan}
      className={`px-3 py-4 align-bottom relative ${className}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setAbierto((v) => !v);
        }}
        className={`inline-flex items-center gap-1 max-w-full ${align} text-[9px] font-black uppercase tracking-widest transition-colors ${
          activo ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
        }`}
      >
        <span className="truncate">{label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform ${abierto ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {activo && (
          <span className="shrink-0 min-w-[14px] h-[14px] px-0.5 rounded-full bg-indigo-600 text-white text-[8px] font-black flex items-center justify-center">
            {seleccionados.size}
          </span>
        )}
      </button>

      {abierto && (
        <div
          className={`absolute z-50 top-full mt-1 min-w-[180px] max-w-[240px] rounded-xl bg-white border border-slate-100 shadow-xl py-2 ${
            alineacion === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 pb-2 flex items-center justify-between gap-2 border-b border-slate-50">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              Filtrar
            </span>
            {activo && (
              <button
                type="button"
                onClick={() => onChange(new Set())}
                className="text-[8px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {opciones.length === 0 ? (
              <p className="px-3 py-2 text-[10px] text-slate-400 font-medium">
                Sin opciones
              </p>
            ) : (
              opciones.map((op) => {
                const marcado = seleccionados.has(op.id);
                return (
                  <label
                    key={op.id}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => toggle(op.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] font-bold text-slate-700 truncate flex-1">
                      {op.label}
                    </span>
                    {op.count != null && (
                      <span className="text-[9px] font-black text-slate-400 tabular-nums">
                        {op.count}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </th>
  );
}

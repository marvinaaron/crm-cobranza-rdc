"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatFechaCorta,
  pendienteAtrasado,
  progresoTimeline,
  type Pendiente,
} from "@/lib/pendientes";

type Props = {
  pendiente: Pendiente;
  onCambiarFechas: (patch: {
    inicio?: string;
    fin?: string;
    deadlineInterno?: string;
  }) => void;
};

export default function TimelinePendiente({
  pendiente,
  onCambiarFechas,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pct = progresoTimeline(pendiente.inicio, pendiente.fin);

  useEffect(() => {
    if (!abierto) return;
    function cerrar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, [abierto]);

  return (
    <div className="relative min-w-[11rem]" ref={ref}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="w-full text-left"
        title="Inicio, fin y avance"
        aria-expanded={abierto}
      >
        <p className="text-[10px] font-bold text-slate-500 tabular-nums mb-1">
          {formatFechaCorta(pendiente.inicio)} – {formatFechaCorta(pendiente.fin)}
        </p>
        <div
          className="h-3 rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={`Avance ${pct}%`}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background:
                pendiente.estado === "hecho"
                  ? "#10b981"
                  : pendienteAtrasado(pendiente)
                    ? "#dc2626"
                    : "#06b6d4",
            }}
          />
        </div>
      </button>

      {abierto && (
        <div className="absolute z-40 right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70 space-y-2.5">
          <p className="text-[9px] font-black uppercase tracking-widest text-violet-600">
            Timeline · {pct}%
          </p>
          <label className="block space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Inicio
            </span>
            <input
              type="date"
              value={pendiente.inicio}
              onChange={(e) => onCambiarFechas({ inicio: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-sm font-semibold"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Fin
            </span>
            <input
              type="date"
              value={pendiente.fin}
              onChange={(e) => onCambiarFechas({ fin: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-sm font-semibold"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Tu deadline
            </span>
            <input
              type="date"
              value={pendiente.deadlineInterno ?? ""}
              onChange={(e) =>
                onCambiarFechas({ deadlineInterno: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-sm font-semibold"
            />
          </label>
        </div>
      )}
    </div>
  );
}

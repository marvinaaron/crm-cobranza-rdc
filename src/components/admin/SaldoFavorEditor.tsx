"use client";

import { useEffect, useState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch";
import { CONCEPTOS_FEDERALES } from "@/lib/cumplimiento-categorias";
import type { LineaSaldoFavor } from "@/lib/cumplimiento";

/**
 * Editor de saldo a favor por conceptos federales (ISR, IVA, retenciones, etc.).
 */
function formatearInput(s: string): string {
  const limpio = s.replace(/[^\d.]/g, "");
  const partes = limpio.split(".");
  if (partes.length <= 1) return limpio;
  return `${partes[0]}.${partes.slice(1).join("").slice(0, 2)}`;
}

function aNumero(s: string): number {
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function fmtMxn(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(n);
}

function lineaVacia(): LineaSaldoFavor {
  return { etiqueta: CONCEPTOS_FEDERALES[0], monto: 0 };
}

function opcionesEtiqueta(actual: string): string[] {
  const base = [...CONCEPTOS_FEDERALES];
  const limpio = actual.trim();
  if (limpio && !base.includes(limpio as (typeof CONCEPTOS_FEDERALES)[number])) {
    return [limpio, ...base];
  }
  return base;
}

export default function SaldoFavorEditor({
  activo,
  lineas: lineasProp,
  onToggle,
  onGuardar,
}: {
  activo: boolean;
  lineas: LineaSaldoFavor[];
  onToggle: (next: boolean) => void;
  onGuardar: (lineas: LineaSaldoFavor[]) => void;
}) {
  const [lineas, setLineas] = useState<LineaSaldoFavor[]>(
    lineasProp.length ? lineasProp : [lineaVacia()]
  );
  const [montosTexto, setMontosTexto] = useState<string[]>(
    (lineasProp.length ? lineasProp : [lineaVacia()]).map((l) =>
      l.monto ? String(l.monto) : ""
    )
  );
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (editando) return;
    const base = lineasProp.length ? lineasProp : [lineaVacia()];
    setLineas(base);
    setMontosTexto(base.map((l) => (l.monto ? String(l.monto) : "")));
  }, [lineasProp, editando]);

  const guardar = (nextLineas: LineaSaldoFavor[], nextMontos: string[]) => {
    setEditando(false);
    const limpias = nextLineas.map((l, i) => ({
      etiqueta: l.etiqueta.trim() || CONCEPTOS_FEDERALES[0],
      monto: aNumero(nextMontos[i] ?? String(l.monto)),
    }));
    onGuardar(limpias);
  };

  const total = lineas.reduce(
    (s, l, i) => s + aNumero(montosTexto[i] ?? String(l.monto)),
    0
  );

  return (
    <div className="mb-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
      <ToggleSwitch
        checked={activo}
        onChange={onToggle}
        label="¿Hay saldo a favor?"
        description={
          activo
            ? "Agrega uno o más conceptos federales a favor (0 si no aplica)."
            : "Activa si hay saldo a favor aunque otro impuesto vaya a pagar."
        }
        tono="emerald"
      />

      {activo && (
        <div className="mt-3 space-y-3">
          {lineas.map((l, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_auto] gap-2 items-end"
            >
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                  Concepto
                </label>
                <select
                  value={l.etiqueta}
                  onChange={(e) => {
                    setEditando(true);
                    const next = [...lineas];
                    next[i] = { ...next[i], etiqueta: e.target.value };
                    setLineas(next);
                  }}
                  onBlur={() => guardar(lineas, montosTexto)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  {opcionesEtiqueta(l.etiqueta).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                  Monto a favor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={montosTexto[i] ?? ""}
                    onChange={(e) => {
                      setEditando(true);
                      const next = [...montosTexto];
                      next[i] = formatearInput(e.target.value);
                      setMontosTexto(next);
                    }}
                    onBlur={() => guardar(lineas, montosTexto)}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 font-black text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
                  />
                </div>
              </div>
              {lineas.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextLineas = lineas.filter((_, j) => j !== i);
                    const nextMontos = montosTexto.filter((_, j) => j !== i);
                    setLineas(nextLineas);
                    setMontosTexto(nextMontos);
                    guardar(nextLineas, nextMontos);
                  }}
                  className="text-[9px] font-black uppercase text-red-500 pb-2.5 sm:pb-0"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const next = [...lineas, lineaVacia()];
              setLineas(next);
              setMontosTexto([...montosTexto, ""]);
              setEditando(true);
            }}
            className="text-[9px] font-black uppercase tracking-widest text-emerald-700"
          >
            + Agregar concepto
          </button>

          <div className="flex items-center justify-between gap-3 pt-1 border-t border-emerald-100">
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
              Total a favor
            </p>
            <p className="text-base font-black text-emerald-700 tabular-nums">
              {fmtMxn(total)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

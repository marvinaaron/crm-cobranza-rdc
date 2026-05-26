"use client";

import { useEffect, useState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch";

/**
 * Editor de saldo a favor (ISR / IVA) para periodos marcados como
 * "sin pago de impuestos". Se monta debajo del toggle de "Sin pago".
 *
 * - Primer paso: el admin activa "¿Hay saldo a favor?".
 * - Segundo paso: aparecen dos inputs (ISR y IVA). El admin captura
 *   cualquier combinación incluyendo cero. Al perder foco o tocar guardar,
 *   se persiste.
 */
function formatearInput(s: string): string {
  // Solo permitir números + un punto decimal.
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

export default function SaldoFavorEditor({
  activo,
  isr,
  iva,
  onToggle,
  onGuardar,
}: {
  activo: boolean;
  isr: number;
  iva: number;
  onToggle: (next: boolean) => void;
  onGuardar: (isr: number, iva: number) => void;
}) {
  const [valIsr, setValIsr] = useState<string>(activo ? String(isr) : "");
  const [valIva, setValIva] = useState<string>(activo ? String(iva) : "");
  const [editando, setEditando] = useState(false);

  // Sincronizamos cuando llegan props nuevas (cambio de periodo / cliente).
  useEffect(() => {
    if (!editando) {
      setValIsr(activo ? String(isr) : "");
      setValIva(activo ? String(iva) : "");
    }
  }, [activo, isr, iva, editando]);

  const guardar = () => {
    setEditando(false);
    onGuardar(aNumero(valIsr), aNumero(valIva));
  };

  const total = aNumero(valIsr) + aNumero(valIva);

  return (
    <div className="mb-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
      <ToggleSwitch
        checked={activo}
        onChange={onToggle}
        label="¿Hay saldo a favor?"
        description={
          activo
            ? "Captura el saldo a favor de ISR o IVA del periodo (0 si no aplica)."
            : "Activa si el cliente generó saldo a favor de ISR o IVA en este periodo."
        }
        tono="emerald"
      />

      {activo && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
              ISR a favor
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={valIsr}
                onChange={(e) => {
                  setEditando(true);
                  setValIsr(formatearInput(e.target.value));
                }}
                onBlur={guardar}
                placeholder="0.00"
                className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 font-black text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
              IVA a favor
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={valIva}
                onChange={(e) => {
                  setEditando(true);
                  setValIva(formatearInput(e.target.value));
                }}
                onBlur={guardar}
                placeholder="0.00"
                className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 font-black text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
              />
            </div>
          </div>
          <div className="col-span-2 flex items-center justify-between gap-3 mt-1">
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

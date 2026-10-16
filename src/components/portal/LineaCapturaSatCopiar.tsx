"use client";

import { useState } from "react";
import {
  esLineaCapturaSatValida,
  formatearLineaCapturaSat,
  normalizarLineaCapturaSat,
} from "@/lib/sat-linea-captura";

type Props = {
  referencia: string;
  montoLabel?: string;
};

export default function LineaCapturaSatCopiar({ referencia, montoLabel }: Props) {
  const [copiada, setCopiada] = useState(false);
  const compacta = normalizarLineaCapturaSat(referencia);
  if (!esLineaCapturaSatValida(compacta)) return null;
  const display = formatearLineaCapturaSat(compacta);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(compacta);
      setCopiada(true);
      setTimeout(() => setCopiada(false), 2500);
    } catch {
      setCopiada(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
      <p className="text-[13px] text-slate-500">Línea de captura SAT</p>
      <div className="mt-1 flex items-center gap-2">
        <p
          className="min-w-0 flex-1 text-[18px] sm:text-[20px] font-bold text-slate-900 tabular-nums tracking-wide leading-snug"
          onCopy={(e) => {
            e.preventDefault();
            e.clipboardData.setData("text/plain", compacta);
          }}
        >
          {display}
        </p>
        <button
          type="button"
          onClick={() => void copiar()}
          title={copiada ? "Copiada" : "Copiar línea de captura"}
          aria-label={copiada ? "Línea copiada" : "Copiar línea de captura"}
          className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center transition-colors ${
            copiada
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-500 hover:bg-[var(--portal-navy-soft)] hover:text-[var(--portal-navy)]"
          }`}
        >
          {copiada ? <CheckIcon /> : <CopiarIcon />}
        </button>
      </div>
      <p className="mt-2 text-[13px] text-slate-500 leading-snug">
        Pégala en tu banca móvil · Pago de impuestos / SAT.
        {montoLabel ? ` ${montoLabel}` : ""}
      </p>
    </div>
  );
}

function CopiarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

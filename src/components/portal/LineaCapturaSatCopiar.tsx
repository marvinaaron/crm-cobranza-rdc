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
  /** Una sola línea, icono de copiar sin fondo. */
  compacta?: boolean;
};

export default function LineaCapturaSatCopiar({
  referencia,
  montoLabel,
  compacta = false,
}: Props) {
  const [copiada, setCopiada] = useState(false);
  const compacto = normalizarLineaCapturaSat(referencia);
  const valida = esLineaCapturaSatValida(compacto);
  const paraCopiar = compacto || referencia.replace(/\s+/g, "");
  if (!paraCopiar) return null;
  const grupos = valida ? formatearLineaCapturaSat(compacto) : referencia.trim();
  if (!compacta && !valida) return null;
  const display = compacta ? grupos.replace(/ /g, "\u202F") : grupos;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(paraCopiar);
      setCopiada(true);
      setTimeout(() => setCopiada(false), 2500);
    } catch {
      setCopiada(false);
    }
  };

  if (compacta) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <div className="min-w-0 flex-1 overflow-x-auto [container-type:inline-size] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <p
            className="font-bold tabular-nums tracking-tighter text-slate-900 whitespace-nowrap leading-none [font-size:min(18px,calc(100cqw/15.6))]"
            onCopy={(e) => {
              e.preventDefault();
              e.clipboardData.setData("text/plain", paraCopiar);
            }}
          >
            {display}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void copiar()}
          title={copiada ? "Copiada" : "Copiar línea de captura"}
          aria-label={copiada ? "Línea copiada" : "Copiar línea de captura"}
          className={`shrink-0 p-1 -mr-0.5 ${
            copiada ? "text-emerald-600" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          {copiada ? <CheckIcon size={18} /> : <CopiarIcon size={18} />}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
      <p className="text-[13px] text-slate-500">Línea de captura SAT</p>
      <div className="mt-1 flex items-center gap-2">
        <p
          className="min-w-0 flex-1 text-[18px] sm:text-[20px] font-bold text-slate-900 tabular-nums leading-snug"
          onCopy={(e) => {
            e.preventDefault();
            e.clipboardData.setData("text/plain", paraCopiar);
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

function CopiarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

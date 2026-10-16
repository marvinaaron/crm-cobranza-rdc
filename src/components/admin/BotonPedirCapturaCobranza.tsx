"use client";

import { useState } from "react";
import type { Cliente } from "@/lib/clientes";
import {
  ligaComprobantePortal,
  type TipoLigaComprobante,
  waPedirComprobante,
} from "@/lib/portal/liga-comprobante";

function CreditCardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

type Props = {
  cliente: Cliente;
  tipo?: TipoLigaComprobante;
  variante?: "compacto" | "ancho";
};

export default function BotonPedirCapturaCobranza({
  cliente,
  tipo = "honorarios",
  variante = "compacto",
}: Props) {
  const [copiado, setCopiado] = useState(false);
  const wa = waPedirComprobante(cliente, tipo);
  const liga = ligaComprobantePortal(cliente.id, tipo);

  async function copiar(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(liga);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    } catch {
      window.prompt("Copia esta liga para el cliente:", liga);
    }
  }

  const titulo = wa
    ? "Pedir captura por WhatsApp"
    : "Sin WhatsApp en ficha · copiar liga del portal";

  if (variante === "ancho") {
    if (wa) {
      return (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title={titulo}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100"
        >
          <CreditCardIcon size={14} />
          Pedir captura
        </a>
      );
    }
    return (
      <button
        type="button"
        onClick={copiar}
        title={titulo}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-100"
      >
        <CreditCardIcon size={14} />
        {copiado ? "Liga copiada" : "Copiar liga"}
      </button>
    );
  }

  if (wa) {
    return (
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={titulo}
        className="p-3 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all inline-flex"
      >
        <CreditCardIcon />
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={copiar}
      title={titulo}
      className="p-3 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all inline-flex"
    >
      <CreditCardIcon />
    </button>
  );
}

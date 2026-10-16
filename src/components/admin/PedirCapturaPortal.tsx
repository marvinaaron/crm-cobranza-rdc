"use client";

import { useState } from "react";
import type { Cliente } from "@/lib/clientes";
import {
  etiquetaLigaComprobante,
  ligaComprobantePortal,
  type TipoLigaComprobante,
  waPedirComprobante,
} from "@/lib/portal/liga-comprobante";

const Ico = {
  wa: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  copy: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
};

type Props = {
  cliente: Cliente;
  tipo: TipoLigaComprobante;
  variante?: "card" | "compacto";
};

export default function PedirCapturaPortal({
  cliente,
  tipo,
  variante = "card",
}: Props) {
  const [copiado, setCopiado] = useState(false);
  const liga = ligaComprobantePortal(cliente.id, tipo);
  const wa = waPedirComprobante(cliente, tipo);
  const etiqueta = etiquetaLigaComprobante(tipo);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(liga);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    } catch {
      window.prompt("Copia esta liga para el cliente:", liga);
    }
  }

  if (variante === "compacto") {
    const nombre = tipo === "impuestos" ? "Impuestos" : "Honorarios";
    return (
      <div className="flex flex-wrap gap-1.5">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            title={`WhatsApp para que suba la captura de ${etiqueta}`}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700"
          >
            {Ico.wa}
            {nombre}
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => void copiar()}
          title={`Copia la liga para que suba la captura de ${etiqueta}`}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-50"
        >
          {Ico.copy}
          {copiado ? "Copiada" : "Copiar liga"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-800 mb-1">
        Pedir captura en el portal
      </p>
      <p className="text-[10px] font-bold text-emerald-800/80 leading-snug mb-2.5">
        WhatsApp con la liga a su portal ({etiqueta}) y una portada de pago.
        Ellos suben la captura; tú la validas aquí.
      </p>
      <div className="flex flex-col gap-1.5">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700"
          >
            WhatsApp con liga
          </a>
        ) : (
          <p className="text-[10px] font-bold text-amber-700 leading-snug">
            Este cliente no tiene WhatsApp en la ficha. Copia la liga y pégala
            donde le escribas.
          </p>
        )}
        <button
          type="button"
          onClick={() => void copiar()}
          className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-[9px] font-black uppercase tracking-widest hover:bg-white/80"
        >
          {copiado ? "Liga copiada" : "Copiar liga"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Cliente } from "@/lib/clientes";
import {
  etiquetaLigaComprobante,
  ligaComprobantePortal,
  type TipoLigaComprobante,
  waPedirComprobante,
} from "@/lib/portal/liga-comprobante";

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
    const pedir =
      tipo === "impuestos"
        ? "Pedir impuestos por WhatsApp"
        : "Pedir honorarios por WhatsApp";
    const copiarLbl =
      tipo === "impuestos"
        ? "Copiar liga de impuestos"
        : "Copiar liga de honorarios";
    return (
      <div className="flex flex-col gap-1.5">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            title={`Abre WhatsApp con la liga para que suba la captura de ${etiqueta}`}
            className="inline-flex items-center justify-center px-3 py-2 rounded-full bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700"
          >
            {pedir}
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => void copiar()}
          title={`Copia la liga del portal para que suba la captura de ${etiqueta}`}
          className="inline-flex items-center justify-center px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-[12px] font-semibold hover:bg-slate-50"
        >
          {copiado ? "Liga copiada" : copiarLbl}
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

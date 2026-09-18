"use client";

import { useState } from "react";

type Props = {
  valor: string;
  etiqueta?: string;
};

/**
 * Botón de texto para copiar una tabla o una tasa (SUA, Excel).
 */
export default function BotonCopiarTexto({
  valor,
  etiqueta = "Copiar",
}: Props) {
  const [copiado, setCopiado] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // sin clipboard
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
        copiado
          ? "bg-emerald-100 text-emerald-800"
          : "bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white"
      }`}
    >
      {copiado ? "Copiado" : etiqueta}
    </button>
  );
}

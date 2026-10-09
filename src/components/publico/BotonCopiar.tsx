"use client";

import { useState } from "react";

type Props = {
  valor: string | number;
  etiqueta?: string;
  /** "claro" sobre fondo oscuro, "oscuro" sobre fondo claro. */
  variante?: "claro" | "oscuro";
  className?: string;
};

/**
 * Botón compacto para copiar un valor al portapapeles.
 * Muestra check verde temporal al copiar y soporta variante para fondos oscuros.
 */
export default function BotonCopiar({
  valor,
  etiqueta,
  variante = "oscuro",
  className = "",
}: Props) {
  const [copiado, setCopiado] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(String(valor));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // navegador sin clipboard API
    }
  };

  const basePorVariante =
    variante === "claro"
      ? copiado
        ? "bg-white/30 text-white"
        : "bg-white/15 text-white/80 hover:bg-white/30"
      : copiado
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white";

  return (
    <button
      type="button"
      onClick={handleClick}
      title={copiado ? "¡Copiado!" : `Copiar ${etiqueta ?? "valor"}`}
      aria-label={copiado ? "Copiado" : `Copiar ${etiqueta ?? "valor"}`}
      className={`inline-flex items-center justify-center h-6 w-6 rounded-md transition-all ${basePorVariante} ${className}`}
    >
      {copiado ? (
        <svg
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 10l3 3 7-7" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="7" y="3" width="10" height="12" rx="2" />
          <path d="M13 17H5a2 2 0 0 1-2-2V7" />
        </svg>
      )}
    </button>
  );
}

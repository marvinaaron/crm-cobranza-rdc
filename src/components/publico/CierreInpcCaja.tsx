"use client";

import { useState } from "react";

/**
 * Recuadro del dato vigente (INPC, UMA…): el número vive en el HTML
 * (Google lo lee) y todo el recuadro copia al portapapeles.
 */
export default function CierreInpcCaja({
  valor,
  periodo,
  etiqueta = "INPC actual",
  ariaNombre = "INPC",
}: {
  valor: string;
  periodo: string;
  etiqueta?: string;
  ariaNombre?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* sin clipboard */
    }
  };

  return (
    <button
      type="button"
      className="tb-cierre-caja"
      onClick={copiar}
      aria-label={
        copiado ? `${ariaNombre} copiado` : `Copiar ${ariaNombre} ${valor}`
      }
    >
      <span>{etiqueta}</span>
      <b>
        {valor}
        <svg
          viewBox="0 0 20 20"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth={copiado ? 2.5 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {copiado ? (
            <path d="M5 10l3 3 7-7" />
          ) : (
            <>
              <rect x="7" y="3" width="10" height="12" rx="2" />
              <path d="M13 17H5a2 2 0 0 1-2-2V7" />
            </>
          )}
        </svg>
      </b>
      <i>{periodo}</i>
    </button>
  );
}

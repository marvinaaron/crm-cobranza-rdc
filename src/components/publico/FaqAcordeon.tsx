"use client";

import { useState } from "react";

type ItemFaq = {
  pregunta: string;
  respuesta: string;
};

type Props = {
  items: ItemFaq[];
  /** id para `aria-labelledby` del encabezado externo (opcional). */
  labelledBy?: string;
  /** Índice abierto por defecto. `null` para todas cerradas. */
  defaultOpen?: number | null;
};

/**
 * Acordeón de preguntas frecuentes para la sección de Herramientas.
 *
 * Comportamiento y estilo IDÉNTICOS al de `PreguntasFrecuentesContenido`
 * (la página oficial `/preguntas-frecuentes`):
 *   - Solo una pregunta abierta a la vez (cerrar la actual para abrir otra)
 *   - Primera pregunta abierta por defecto
 *   - Fondo indigo + ring indigo cuando está abierta
 *   - Chevron rotando al expandir
 */
function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform shrink-0 ${abierto ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function FaqAcordeon({
  items,
  labelledBy,
  defaultOpen = 0,
}: Props) {
  const [abierta, setAbierta] = useState<number | null>(defaultOpen);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3" aria-labelledby={labelledBy}>
      {items.map((faq, idx) => {
        const abiertoEsta = abierta === idx;
        return (
          <div
            key={faq.pregunta}
            className={`rounded-2xl ring-1 transition-all ${
              abiertoEsta
                ? "bg-marca-navy/5 ring-marca-navy/20 shadow-sm"
                : "bg-white ring-slate-200 hover:ring-slate-300"
            }`}
          >
            <button
              type="button"
              onClick={() => setAbierta(abiertoEsta ? null : idx)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={abiertoEsta}
            >
              <span className="text-[15px] font-black text-slate-900">
                {faq.pregunta}
              </span>
              <span
                className={
                  abiertoEsta ? "text-marca-navy" : "text-slate-500"
                }
              >
                <Chevron abierto={abiertoEsta} />
              </span>
            </button>
            {abiertoEsta ? (
              <div className="px-5 pb-5 -mt-1 text-sm text-slate-700 leading-relaxed">
                {faq.respuesta}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

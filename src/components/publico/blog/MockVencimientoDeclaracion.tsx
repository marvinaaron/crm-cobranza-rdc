"use client";

import PanelVencimientoDeclaracion from "@/components/publico/PanelVencimientoDeclaracion";

/**
 * Embed interactivo del blog: calculadora de vencimiento de declaración SAT.
 */
export default function MockVencimientoDeclaracion({
  titulo,
  pie,
}: {
  titulo?: string;
  pie?: string;
}) {
  return (
    <figure className="my-8">
      {titulo && (
        <figcaption className="mb-3 text-center text-[11px] font-black uppercase tracking-widest text-amber-600">
          {titulo}
        </figcaption>
      )}
      <PanelVencimientoDeclaracion variante="blog" />
      {pie && (
        <p className="mt-3 text-center text-[11px] text-slate-500 leading-relaxed px-4">
          {pie}
        </p>
      )}
    </figure>
  );
}

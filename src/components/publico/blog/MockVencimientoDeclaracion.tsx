"use client";

import PanelVencimientoDeclaracion from "@/components/publico/PanelVencimientoDeclaracion";
import CalculadoraUsoEnvoltorio from "@/components/publico/CalculadoraUsoEnvoltorio";

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
        <figcaption className="mb-3 text-center text-xs font-black tracking-wide text-amber-600">
          {titulo}
        </figcaption>
      )}
      <CalculadoraUsoEnvoltorio herramienta="vencimiento" ocultarContador>
        <PanelVencimientoDeclaracion variante="blog" />
      </CalculadoraUsoEnvoltorio>
      {pie && (
        <p className="mt-3 text-center text-[11px] text-slate-500 leading-relaxed px-4">
          {pie}
        </p>
      )}
    </figure>
  );
}

"use client";

import type { EstadoUsoCalculadora } from "@/lib/herramientas/uso-calculadora";

type Props = {
  uso: EstadoUsoCalculadora | null;
  onDesbloquear?: () => void;
};

/** Contador discreto de consultas gratis. */
export default function ContadorUsoCalculadora({ uso, onDesbloquear }: Props) {
  const restantesLabel =
    uso && Number.isFinite(uso.restantes) && !uso.esPro
      ? `${uso.restantes} consulta${uso.restantes === 1 ? "" : "s"} gratis`
      : uso?.esPro
        ? "Cliente Pro · ilimitado"
        : "3 consultas gratis";

  const mostrarPro = !uso?.esPro && onDesbloquear;

  return (
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>{restantesLabel}</span>
      {mostrarPro ? (
        <button
          type="button"
          onClick={onDesbloquear}
          className="font-semibold text-amber-600 hover:text-amber-800"
        >
          Cliente Pro
        </button>
      ) : null}
    </div>
  );
}

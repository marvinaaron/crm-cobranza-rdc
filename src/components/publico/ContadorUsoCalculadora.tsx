"use client";

import type { EstadoUsoCalculadora } from "@/lib/herramientas/uso-calculadora";

type Props = {
  uso: EstadoUsoCalculadora | null;
  onDesbloquear?: () => void;
};

/** Contador discreto de consultas gratis. */
export default function ContadorUsoCalculadora({ uso, onDesbloquear }: Props) {
  const ilimitadoPruebas =
    Boolean(uso) && !uso!.esPro && !Number.isFinite(uso!.restantes);
  const restantesLabel = uso?.esPro
    ? "Cliente Pro · ilimitado"
    : ilimitadoPruebas
      ? "Pruebas · ilimitado"
      : uso && Number.isFinite(uso.restantes)
        ? `${uso.restantes} consulta${uso.restantes === 1 ? "" : "s"} gratis`
        : "3 consultas gratis";

  const mostrarPro = Boolean(onDesbloquear) && !uso?.esPro && !ilimitadoPruebas;

  return (
    <div className="hz-uso-meta flex w-full items-center justify-between gap-3 text-xs text-slate-500">
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

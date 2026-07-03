"use client";

import { createContext, useContext } from "react";
import type { EstadoUsoCalculadora } from "@/lib/herramientas/uso-calculadora";

export type CalculadoraUsoContextValue = {
  consumirIntento: () => Promise<{ ok: boolean }>;
  abrirPaywall: () => void;
  uso: EstadoUsoCalculadora | null;
  cargarUso: () => Promise<void>;
};

const CalculadoraUsoContext = createContext<CalculadoraUsoContextValue | null>(
  null
);

export function useCalculadoraUso(): CalculadoraUsoContextValue {
  const ctx = useContext(CalculadoraUsoContext);
  if (!ctx) {
    throw new Error(
      "useCalculadoraUso debe usarse dentro de CalculadoraUsoEnvoltorio"
    );
  }
  return ctx;
}

export default CalculadoraUsoContext;

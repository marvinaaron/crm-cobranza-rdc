"use client";

import { useMemo } from "react";
import { useClientes } from "@/context/ClientesContext";
import { esMismoPeriodo, periodoKey, type Periodo } from "@/lib/clientes";

/** Honorarios: mes calendario en curso (en mayo se paga y consulta mayo). */
export function usePeriodoHonorarios() {
  const { periodo, periodoHoy, irAPeriodoActual } = useClientes();

  const periodoVista = useMemo((): Periodo => {
    const hoyKey = periodoKey(periodoHoy);
    const selKey = periodoKey(periodo);
    return selKey <= hoyKey ? periodo : periodoHoy;
  }, [periodo, periodoHoy]);

  const esPeriodoActual = esMismoPeriodo(periodoVista, periodoHoy);

  return {
    periodoVista,
    periodoHoy,
    esPeriodoActual,
    irAPeriodoActual,
  };
}

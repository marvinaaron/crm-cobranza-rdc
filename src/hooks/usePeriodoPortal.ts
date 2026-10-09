"use client";

import { useMemo } from "react";
import { useClientes } from "@/context/ClientesContext";
import {
  esMismoPeriodo,
  resolverPeriodoCumplimiento,
  type Periodo,
} from "@/lib/clientes";

/** Cumplimiento fiscal: mes vencido (en mayo se consulta abril). */
export function usePeriodoFiscal() {
  const {
    periodo,
    periodoFiscalVigente,
    irAPeriodoFiscalVigente,
  } = useClientes();

  const periodoVista = useMemo(
    (): Periodo => resolverPeriodoCumplimiento(periodo, periodoFiscalVigente),
    [periodo, periodoFiscalVigente]
  );

  const esPeriodoVigente = esMismoPeriodo(periodoVista, periodoFiscalVigente);

  return {
    periodoVista,
    periodoFiscalVigente,
    esPeriodoVigente,
    irAPeriodoFiscalVigente,
  };
}

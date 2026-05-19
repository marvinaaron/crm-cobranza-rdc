"use client";

import { useMemo } from "react";
import { useClientes } from "@/context/ClientesContext";
import { esMismoPeriodo, periodoKey, type Periodo } from "@/lib/clientes";

/** Cumplimiento fiscal: mes vencido (en mayo se consulta abril). */
export function usePeriodoFiscal() {
  const {
    periodo,
    periodoFiscalVigente,
    irAPeriodoFiscalVigente,
  } = useClientes();

  const periodoVista = useMemo((): Periodo => {
    const vigenteKey = periodoKey(periodoFiscalVigente);
    const selKey = periodoKey(periodo);
    return selKey <= vigenteKey ? periodo : periodoFiscalVigente;
  }, [periodo, periodoFiscalVigente]);

  const esPeriodoVigente = esMismoPeriodo(periodoVista, periodoFiscalVigente);

  return {
    periodoVista,
    periodoFiscalVigente,
    esPeriodoVigente,
    irAPeriodoFiscalVigente,
  };
}

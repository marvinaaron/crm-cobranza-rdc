"use client";

import type { Cliente, Periodo } from "@/lib/clientes";
import FlujoCumplimientoTimeline from "@/components/FlujoCumplimientoTimeline";

type Props = { cliente: Cliente; periodo: Periodo };

/**
 * Wrapper compacto del stepper de cumplimiento para el inicio del portal.
 * Reutiliza el componente existente (`FlujoCumplimientoTimeline`) con la
 * variante `inicio` para no duplicar la lógica de derivación de pasos.
 */
export default function PortalStepperInicio({ cliente, periodo }: Props) {
  return (
    <FlujoCumplimientoTimeline
      cliente={cliente}
      periodo={periodo}
      variante="inicio"
    />
  );
}

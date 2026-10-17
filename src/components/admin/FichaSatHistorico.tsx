"use client";

import type { Cliente, Periodo } from "@/lib/clientes";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import FichaSatMeses from "@/components/admin/FichaSatMeses";

export default function FichaSatHistorico({
  cliente,
  anio,
  mesDefault,
  getCumplimientoPeriodo,
}: {
  cliente: Cliente;
  anio: number;
  mesDefault: number;
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined;
}) {
  return (
    <FichaSatMeses
      modo="historico"
      cliente={cliente}
      anio={anio}
      mesDefault={mesDefault}
      getCumplimientoPeriodo={getCumplimientoPeriodo}
    />
  );
}

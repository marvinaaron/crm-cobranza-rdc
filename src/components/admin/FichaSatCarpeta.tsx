"use client";

import type { Cliente, Periodo } from "@/lib/clientes";
import type { RegistroCumplimiento, TipoDocumentoSingular } from "@/lib/cumplimiento";
import FichaSatMeses from "@/components/admin/FichaSatMeses";

export default function FichaSatCarpeta({
  cliente,
  anio,
  mesDefault,
  getCumplimientoPeriodo,
  onCargar,
  onAbrirTipo,
}: {
  cliente: Cliente;
  anio: number;
  mesDefault: number;
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined;
  onCargar: (d: {
    file: File;
    tipo: TipoDocumentoSingular;
    periodo: Periodo;
  }) => void;
  onAbrirTipo: (tipo: TipoDocumentoSingular, periodo: Periodo) => void;
}) {
  return (
    <FichaSatMeses
      modo="carpeta"
      cliente={cliente}
      anio={anio}
      mesDefault={mesDefault}
      getCumplimientoPeriodo={getCumplimientoPeriodo}
      onCargar={onCargar}
      onAbrirTipo={onAbrirTipo}
    />
  );
}

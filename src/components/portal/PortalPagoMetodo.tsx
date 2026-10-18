"use client";

import { useState, type ReactNode } from "react";
import PillPaginas from "@/components/portal/PillPaginas";
import type { MetodoPago } from "@/components/portal/metodo-pago-ui";

const METODOS: { value: MetodoPago; label: string }[] = [
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
];

type Props = {
  transferencia: ReactNode;
  tarjeta: ReactNode;
  inicial?: MetodoPago;
};

export default function PortalPagoMetodo({
  transferencia,
  tarjeta,
  inicial = "transferencia",
}: Props) {
  const [metodo, setMetodo] = useState<MetodoPago>(inicial);

  return (
    <PillPaginas
      acento="portal"
      value={metodo}
      onChange={setMetodo}
      opciones={METODOS}
      paneles={{
        transferencia,
        tarjeta,
      }}
    />
  );
}

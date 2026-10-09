"use client";

import { useMemo, useState } from "react";
import ContadorUsoCalculadora from "@/components/publico/ContadorUsoCalculadora";
import ModalClientePro from "@/components/publico/ModalClientePro";
import CalculadoraUsoContext from "@/context/CalculadoraUsoContext";
import { useUsoCalculadora } from "@/hooks/useUsoCalculadora";
import type { CalculadoraId } from "@/lib/herramientas/uso-calculadora";

type Props = {
  herramienta: CalculadoraId;
  children: React.ReactNode;
  ocultarContador?: boolean;
};

/** Contador arriba del panel + modal Pro; el panel va en `children`. */
export default function CalculadoraUsoEnvoltorio({
  herramienta,
  children,
  ocultarContador = false,
}: Props) {
  const { uso, consumirIntento, cargarUso } = useUsoCalculadora(herramienta);
  const [paywallAbierto, setPaywallAbierto] = useState(false);

  const value = useMemo(
    () => ({
      consumirIntento,
      abrirPaywall: () => setPaywallAbierto(true),
      uso,
      cargarUso,
    }),
    [consumirIntento, uso, cargarUso]
  );

  return (
    <CalculadoraUsoContext.Provider value={value}>
      {!ocultarContador ? (
        <div className="mb-3">
          <ContadorUsoCalculadora
            uso={uso}
            onDesbloquear={() => setPaywallAbierto(true)}
          />
        </div>
      ) : null}
      {children}
      <ModalClientePro
        abierto={paywallAbierto}
        onCerrar={() => setPaywallAbierto(false)}
      />
    </CalculadoraUsoContext.Provider>
  );
}

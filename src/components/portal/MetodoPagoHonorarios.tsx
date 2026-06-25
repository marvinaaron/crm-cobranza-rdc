"use client";

import { useCallback, useState } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
import { periodoLabel } from "@/lib/clientes";
import { calcularCobroHonorarios } from "@/lib/stripe-honorarios";
import { fmtMxn } from "@/components/portal/portal-ui";
import { DATOS_BANCARIOS_PORTAL } from "@/lib/datos-bancarios";
import PortalSection from "@/components/portal/PortalSection";
import DatosTransferenciaPortal from "@/components/portal/DatosTransferenciaPortal";
import SubirComprobante from "@/components/SubirComprobante";
import PagoStripeHonorarios from "@/components/portal/PagoStripeHonorarios";
import {
  CardIcon,
  GridMetodosPago,
  MetodoCard,
  ModalPagoSheet,
  SpeiIcon,
  type MetodoPago,
} from "@/components/portal/metodo-pago-ui";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  montoHonorarios: number;
};

export default function MetodoPagoHonorarios({
  cliente,
  periodo,
  montoHonorarios,
}: Props) {
  const [modalAbierto, setModalAbierto] = useState<MetodoPago | null>(null);
  const totalTarjeta = calcularCobroHonorarios(montoHonorarios).total;
  const desglose = calcularCobroHonorarios(montoHonorarios);

  const cerrarModal = useCallback(() => setModalAbierto(null), []);

  return (
    <>
      <PortalSection title="Pagar honorarios">
        <p className="text-[11px] font-bold text-slate-500 mb-4 leading-relaxed">
          Elige cómo quieres pagar{" "}
          <span className="font-black text-slate-800 tabular-nums">
            {fmtMxn(montoHonorarios, 2)}
          </span>{" "}
          de {periodoLabel(periodo)}.
        </p>

        <GridMetodosPago>
          <MetodoCard
            onSelect={() => setModalAbierto("transferencia")}
            titulo="Transferencia SPEI"
            subtitulo="Recomendado · sin costo extra"
            etiquetaMarca={DATOS_BANCARIOS_PORTAL.banco}
            monto={fmtMxn(montoHonorarios, 2)}
            tono="bbva"
            icono={<SpeiIcon />}
            badge="Recomendado"
          />
          <MetodoCard
            onSelect={() => setModalAbierto("tarjeta")}
            titulo="Tarjeta"
            subtitulo="Visa, MC, Amex"
            etiquetaMarca="Stripe"
            monto={fmtMxn(totalTarjeta, 2)}
            tono="stripe"
            icono={<CardIcon />}
          />
        </GridMetodosPago>
      </PortalSection>

      {modalAbierto && (
        <ModalPagoSheet
          metodo={modalAbierto}
          titulo={periodoLabel(periodo)}
          subtituloAccion={
            modalAbierto === "transferencia"
              ? "Transfiere y sube tu comprobante"
              : "Pago seguro con Stripe"
          }
          montoDisplay={
            modalAbierto === "transferencia" ? montoHonorarios : desglose.total
          }
          detalleTarjeta={`Honorarios ${fmtMxn(montoHonorarios, 2)} + costo de procesamiento`}
          onClose={cerrarModal}
        >
          {modalAbierto === "transferencia" ? (
            <>
              <DatosTransferenciaPortal montoReferencia={montoHonorarios} embedded />
              <SubirComprobante
                clienteId={cliente.id}
                periodo={periodo}
                className="min-w-0 flex flex-col"
              />
            </>
          ) : (
            <PagoStripeHonorarios
              cliente={cliente}
              periodo={periodo}
              montoHonorarios={montoHonorarios}
              embedded
            />
          )}
        </ModalPagoSheet>
      )}
    </>
  );
}

"use client";

import { useMemo } from "react";
import {
  type Cliente,
  type Periodo,
  listarMesesImpagos,
  getTotalPendiente,
} from "@/lib/clientes";
import { calcularCobroHonorarios } from "@/lib/stripe-honorarios";
import { portalCard, fmtMxn } from "@/components/portal/portal-ui";
import PagoStripeHonorarios from "@/components/portal/PagoStripeHonorarios";
import type { PagoHonorarioStripe } from "@/lib/stripe-checkout-types";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
};

export default function HistorialPendienteCliente({ cliente, periodo }: Props) {
  const impagos = listarMesesImpagos(cliente, periodo);
  if (impagos.length <= 1) return null;

  const total = getTotalPendiente(cliente, periodo);
  const totalConComision = calcularCobroHonorarios(total).total;

  const pagosStripe: PagoHonorarioStripe[] = useMemo(
    () =>
      impagos.map((m) => ({
        periodo: m.periodo,
        montoHonorarios: m.saldo,
      })),
    [cliente, periodo]
  );

  return (
    <div className={`${portalCard} border-red-200 border-2 shadow-md shadow-red-100/50 bg-red-50/30 py-6 sm:py-7`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-1">
        Pagos pendientes por regularizar
      </p>
      <p className="text-[10px] font-bold text-red-600/90 mb-4">Saldo vencido</p>

      <ul className="divide-y divide-red-100 mb-4">
        {impagos.map((m) => (
          <li
            key={m.label}
            className="flex items-center justify-between gap-3 py-2.5 sm:py-3 first:pt-0"
          >
            <span className="text-sm font-bold text-slate-800 min-w-0">
              {m.label}
              <span className="block sm:inline sm:ml-2 text-lg font-black text-red-700 tabular-nums mt-0.5 sm:mt-0">
                ${m.saldo.toLocaleString("es-MX")}
              </span>
            </span>
            <PagoStripeHonorarios
              cliente={cliente}
              periodo={m.periodo}
              montoHonorarios={m.saldo}
              compacto
              compactoGrande
              etiquetaBoton="Pagar mes"
            />
          </li>
        ))}
      </ul>

      <div className="rounded-2xl bg-red-100/80 border border-red-200 px-4 py-4 sm:px-5 sm:py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-red-800 mb-1">
            Total vencido
          </p>
          <p className="text-2xl font-black text-red-800 tabular-nums leading-tight">
            ${total.toLocaleString("es-MX")}
          </p>
          <p className="text-[11px] font-bold text-red-700/90 mt-1">
            {fmtMxn(totalConComision, 2)} con tarjeta (incl. costo de procesamiento)
          </p>
        </div>
        <PagoStripeHonorarios
          cliente={cliente}
          montoHonorarios={total}
          pagos={pagosStripe}
          compacto
          compactoGrande
          etiquetaBoton="Pagar todo"
        />
      </div>

      <p className="text-[10px] font-bold text-red-600/70 mt-3 leading-relaxed">
        Regularice su cuenta cuanto antes · transferencia sin comisión arriba
      </p>
    </div>
  );
}

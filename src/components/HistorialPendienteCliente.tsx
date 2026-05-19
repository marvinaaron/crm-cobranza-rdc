"use client";

import { type Cliente, type Periodo, listarMesesImpagos, getTotalPendiente } from "@/lib/clientes";
import { portalCard, portalCardTitle } from "@/components/portal/portal-ui";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
};

export default function HistorialPendienteCliente({ cliente, periodo }: Props) {
  const impagos = listarMesesImpagos(cliente, periodo);
  if (impagos.length <= 1) return null;

  const total = getTotalPendiente(cliente, periodo);

  return (
    <div className={`${portalCard} border-amber-100`}>
      <p className={`${portalCardTitle} text-amber-700 mb-3`}>
        Pagos pendientes por regularizar
      </p>
      <div className="space-y-2 mb-4">
        {impagos.map((m) => (
          <div key={m.label} className="flex justify-between items-center py-2 border-b border-amber-50 last:border-0">
            <span className="text-sm font-bold text-slate-700">{m.label}</span>
            <span className="text-sm font-black text-amber-700">
              ${m.saldo.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-amber-50 px-4 py-3 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
          Total al corriente
        </span>
        <span className="text-lg font-black text-amber-900">
          ${total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

"use client";

import BancoPanel from "@/components/admin/BancoPanel";
import { periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";

export default function BancoPage() {
  const { periodo } = useClientes();
  const mesLabel = periodoLabel(periodo);

  return (
    <div className="space-y-6 w-full max-w-[100rem] mx-auto overflow-x-hidden pb-8">
      <header>
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1.5">
          Finanzas · Caja
        </p>
        <h1 className="text-2xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight">
          Banco
        </h1>
        <p className="text-slate-400 font-bold text-xs lg:text-sm mt-1.5">
          Ingresos reales por fecha de depósito · {mesLabel}
        </p>
      </header>

      <BancoPanel />
    </div>
  );
}

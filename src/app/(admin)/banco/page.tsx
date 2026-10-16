"use client";

import BancoPanel from "@/components/admin/BancoPanel";
import { periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import AdminPageHeading from "@/components/admin/AdminPageHeading";

export default function BancoPage() {
  const { periodo } = useClientes();
  const mesLabel = periodoLabel(periodo);

  return (
    <div className="space-y-6 w-full max-w-[100rem] mx-auto overflow-x-hidden pb-8">
      <AdminPageHeading
        titulo="Banco"
        subtitulo={`Ingresos reales por fecha de depósito · ${mesLabel}`}
      />

      <BancoPanel />
    </div>
  );
}

"use client";

import { useState } from "react";
import { type Cliente } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { usePeriodoFiscal } from "@/hooks/usePeriodoPortal";
import {
  construirExportCumplimientoAnualCliente,
  exportarCumplimientoAnualCliente,
} from "@/lib/cumplimiento-export";

type Props = {
  cliente: Cliente;
  /** Compacto para cabeceras de sección. */
  compacto?: boolean;
};

export default function BotonExportarCumplimientoAnual({
  cliente,
  compacto = false,
}: Props) {
  const { getCumplimientoPeriodo } = useClientes();
  const { periodoVista } = usePeriodoFiscal();
  const [exportando, setExportando] = useState(false);
  const anio = periodoVista.anio;

  async function exportar() {
    if (exportando) return;
    setExportando(true);
    try {
      const datos = construirExportCumplimientoAnualCliente({
        cliente,
        anio,
        getRegistro: (p) => getCumplimientoPeriodo(cliente.id, p),
      });
      await exportarCumplimientoAnualCliente(datos, cliente, anio);
    } finally {
      setExportando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void exportar()}
      disabled={exportando}
      className={
        compacto
          ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[var(--portal-navy)] bg-[var(--portal-navy-soft)] hover:bg-[var(--portal-navy-muted)] disabled:opacity-50 shrink-0"
          : "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[15px] font-semibold border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-50"
      }
      aria-label={`Exportar cumplimiento ${anio} a Excel`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {exportando ? "Exportando…" : compacto ? `Excel ${anio}` : `Exportar ${anio}`}
    </button>
  );
}

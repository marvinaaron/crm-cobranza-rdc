"use client";

import { useState } from "react";
import { type Periodo } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import AccionesFacturaPdf from "@/components/AccionesFacturaPdf";

type Props = {
  clienteId: number;
  periodo: Periodo;
  pagado: boolean;
};

const PdfIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export default function FacturaHistorialIcono({ clienteId, periodo, pagado }: Props) {
  const { getFacturaPeriodo } = useClientes();
  const [abierto, setAbierto] = useState(false);

  if (!pagado) return null;

  const factura = getFacturaPeriodo(clienteId, periodo);

  if (!factura) {
    return (
      <span
        className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed"
        title="Factura PDF: pendiente de publicación por el despacho"
      >
        <PdfIcon />
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors"
        title="Ver factura PDF"
        aria-label="Ver factura PDF"
      >
        <PdfIcon />
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Factura PDF"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60"
            aria-label="Cerrar"
            onClick={() => setAbierto(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden mx-0 sm:mx-4">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                Factura PDF
              </p>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <AccionesFacturaPdf factura={factura} alturaVisor="h-72" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

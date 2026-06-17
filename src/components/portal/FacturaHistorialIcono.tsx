"use client";

import { useState } from "react";
import { type Periodo } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import AccionesFacturaPdf from "@/components/AccionesFacturaPdf";
import {
  facturaPdfArchivada,
  facturaPdfDisponible,
  facturaRegistrada,
} from "@/lib/facturas";

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

  if (!facturaRegistrada(factura)) {
    return (
      <span
        className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed"
        title="Factura PDF: pendiente de publicación por el despacho"
      >
        <PdfIcon />
      </span>
    );
  }

  const archivada = facturaPdfArchivada(factura);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`p-1.5 rounded-lg border transition-colors ${
          facturaPdfDisponible(factura)
            ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
        }`}
        title={
          archivada
            ? "Facturado · PDF archivado (consulta tus archivos o el SAT)"
            : "Ver factura PDF"
        }
        aria-label={archivada ? "Factura archivada" : "Ver factura PDF"}
      >
        <PdfIcon />
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4"
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
          <div className="rdc-glass-sheet rdc-sheet-anim relative w-full lg:max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-t-2xl lg:rounded-2xl shadow-2xl flex flex-col overflow-hidden mx-0 lg:mx-4">
            <div className="rdc-sheet-handle mt-2.5 mb-1 lg:hidden" aria-hidden />
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10 shrink-0">
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
              {factura && <AccionesFacturaPdf factura={factura} alturaVisor="h-72" />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

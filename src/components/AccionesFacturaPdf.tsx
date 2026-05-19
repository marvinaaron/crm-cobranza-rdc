"use client";

import { useState } from "react";
import { type FacturaPago, formatFechaFactura } from "@/lib/facturas";
import { abrirPdfEnNuevaPestana, descargarPdf } from "@/lib/pdf-blob";
import VisorPdfInline from "@/components/VisorPdfInline";

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
);

type Props = {
  factura: FacturaPago;
  alturaVisor?: string;
};

export default function AccionesFacturaPdf({ factura, alturaVisor }: Props) {
  const [verEnLinea, setVerEnLinea] = useState(false);

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-emerald-600 shrink-0">
          <PdfIcon />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-700 truncate">{factura.nombreArchivo}</p>
          <p className="text-[10px] text-slate-400">{formatFechaFactura(factura.subidoEn)}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => setVerEnLinea((v) => !v)}
          className="py-2 rounded-lg bg-white border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
        >
          {verEnLinea ? "Ocultar" : "Ver"}
        </button>
        <button
          type="button"
          onClick={() => abrirPdfEnNuevaPestana(factura.dataUrl)}
          className="py-2 rounded-lg bg-white border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
        >
          Abrir
        </button>
        <button
          type="button"
          onClick={() => descargarPdf(factura.dataUrl, factura.nombreArchivo)}
          className="py-2 rounded-lg bg-indigo-600 text-[8px] font-black uppercase tracking-widest text-white hover:bg-indigo-700"
        >
          PDF
        </button>
      </div>
      {verEnLinea && (
        <VisorPdfInline
          dataUrl={factura.dataUrl}
          titulo={factura.nombreArchivo}
          altura={alturaVisor}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { type FacturaPago, facturaPdfDisponible } from "@/lib/facturas";
import { abrirPdfEnNuevaPestana, descargarPdf } from "@/lib/pdf-blob";
import VisorPdfInline from "@/components/VisorPdfInline";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.36 19.36 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.66 19.66 0 0 1-3.17 4.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ExternalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

type Props = {
  factura: FacturaPago;
  alturaVisor?: string;
};

export default function AccionesFacturaPdf({ factura, alturaVisor }: Props) {
  const [verEnLinea, setVerEnLinea] = useState(false);
  const pdfOk = facturaPdfDisponible(factura);

  const baseBtn =
    "p-2 rounded-lg border transition-colors flex items-center justify-center";

  if (!pdfOk) {
    return (
      <p className="text-[10px] font-bold text-slate-500 leading-snug">
        Factura registrada · el PDF ya no está en el portal (archivado tras 12 meses).
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setVerEnLinea((v) => !v)}
          title={verEnLinea ? "Ocultar vista previa" : "Ver factura"}
          aria-label={verEnLinea ? "Ocultar vista previa" : "Ver factura"}
          aria-pressed={verEnLinea}
          className={`${baseBtn} ${
            verEnLinea
              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
              : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
          }`}
        >
          {verEnLinea ? <EyeOffIcon /> : <EyeIcon />}
        </button>
        <button
          type="button"
          onClick={() => abrirPdfEnNuevaPestana(factura.dataUrl)}
          title="Abrir en pestaña nueva"
          aria-label="Abrir factura en pestaña nueva"
          className={`${baseBtn} bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-700`}
        >
          <ExternalIcon />
        </button>
        <button
          type="button"
          onClick={() => descargarPdf(factura.dataUrl, factura.nombreArchivo)}
          title="Descargar PDF"
          aria-label="Descargar factura PDF"
          className={`${baseBtn} bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700`}
        >
          <DownloadIcon />
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

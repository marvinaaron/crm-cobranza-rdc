"use client";

import { useState } from "react";
import {
  type DocumentoHacienda,
  formatFechaCumplimiento,
  esArchivoXml,
} from "@/lib/cumplimiento";
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";
import VisorPdfInline from "@/components/VisorPdfInline";

type Props = {
  documento: DocumentoHacienda;
  titulo: string;
  subtitulo?: string;
  onClose: () => void;
};

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export default function ModalDocumentoPortal({
  documento,
  titulo,
  subtitulo,
  onClose,
}: Props) {
  const [verEnLinea, setVerEnLinea] = useState(true);
  const esXml = esArchivoXml(documento);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white w-full max-w-lg rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-50 flex justify-between items-start gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Documento fiscal
            </p>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-snug">
              {titulo}
            </h2>
            {subtitulo && (
              <p className="text-xs font-bold text-slate-500 mt-1">{subtitulo}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-red-500"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white text-indigo-600 shrink-0">
                <FileIcon />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-700">
                  {esXml ? "Archivo XML" : "PDF cargado"}
                </p>
                <p className="text-xs font-bold text-slate-700 truncate mt-1">
                  {documento.nombreArchivo}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {formatFechaCumplimiento(documento.subidoEn)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {!esXml && (
                <button
                  type="button"
                  onClick={() => setVerEnLinea((v) => !v)}
                  className="flex-1 min-w-[80px] py-2 rounded-xl bg-white border border-indigo-200 text-[9px] font-black uppercase tracking-widest text-indigo-700 hover:bg-indigo-50"
                >
                  {verEnLinea ? "Ocultar" : "Ver PDF"}
                </button>
              )}
              {!esXml && (
                <button
                  type="button"
                  onClick={() => abrirPdfEnNuevaPestana(documento.dataUrl)}
                  className="flex-1 min-w-[80px] py-2 rounded-xl bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                >
                  Abrir
                </button>
              )}
              <button
                type="button"
                onClick={() => descargarArchivo(documento.dataUrl, documento.nombreArchivo)}
                className="flex-1 min-w-[80px] py-2 rounded-xl bg-blue-900 text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-800"
              >
                Descargar
              </button>
            </div>
          </div>

          {!esXml && verEnLinea && (
            <VisorPdfInline
              dataUrl={documento.dataUrl}
              titulo={documento.nombreArchivo}
              altura="h-[55vh]"
            />
          )}
        </div>
      </div>
    </div>
  );
}

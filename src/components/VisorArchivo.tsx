"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { descargarArchivo } from "@/lib/pdf-blob";
import { esVistaImagen } from "@/lib/archivos";
import VisorPdfInline from "@/components/VisorPdfInline";

export type ArchivoVista = {
  dataUrl: string;
  nombreArchivo: string;
  tipoMime?: string | null;
};

function CloseIcon() {
  return (
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
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function MiniaturaArchivo({
  dataUrl,
  nombreArchivo,
  tipoMime,
  className = "w-14 h-14",
}: ArchivoVista & { className?: string }) {
  const imagen = esVistaImagen({ tipoMime, nombreArchivo, dataUrl });
  if (imagen) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={dataUrl}
        alt=""
        className={`${className} object-cover rounded-xl bg-slate-100 shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${className} rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 text-[9px] font-black uppercase tracking-widest`}
    >
      PDF
    </div>
  );
}

export function VisorArchivo({
  dataUrl,
  nombreArchivo,
  tipoMime,
  altura = "h-[70vh]",
}: ArchivoVista & { altura?: string }) {
  const imagen = esVistaImagen({ tipoMime, nombreArchivo, dataUrl });
  if (imagen) {
    return (
      <div
        className={`${altura} flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt={nombreArchivo}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }
  return (
    <VisorPdfInline dataUrl={dataUrl} titulo={nombreArchivo} altura={altura} />
  );
}

export default function VisorArchivoModal({
  dataUrl,
  nombreArchivo,
  tipoMime,
  titulo = "Comprobante",
  onClose,
}: ArchivoVista & { titulo?: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end lg:items-center justify-center p-0 lg:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Cerrar visor"
        onClick={onClose}
      />
      <div className="relative w-full lg:max-w-3xl max-h-[94vh] rounded-t-[1.75rem] lg:rounded-[1.75rem] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col">
        <div className="rdc-sheet-handle mt-2.5 mb-0 lg:hidden" aria-hidden />
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/10 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {titulo}
            </p>
            <p className="text-sm font-black text-slate-800 dark:text-white truncate mt-0.5">
              {nombreArchivo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-1 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-white/10 shrink-0"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 min-h-0 p-3 bg-slate-100 dark:bg-slate-950 overflow-hidden">
          <VisorArchivo
            dataUrl={dataUrl}
            nombreArchivo={nombreArchivo}
            tipoMime={tipoMime}
            altura="h-[min(72vh,620px)]"
          />
        </div>
        <div className="px-5 py-3 border-t border-slate-100 dark:border-white/10 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => descargarArchivo(dataUrl, nombreArchivo)}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800"
          >
            Descargar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

"use client";

import { useEffect, useState } from "react";
import { dataUrlABlobUrl, esUrlHttp } from "@/lib/pdf-blob";

type Props = {
  dataUrl: string;
  titulo: string;
  altura?: string;
};

export default function VisorPdfInline({ dataUrl, titulo, altura = "h-72" }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    setBlobUrl(null);
    if (!dataUrl?.trim()) {
      setError(true);
      return;
    }
    if (esUrlHttp(dataUrl) || dataUrl.startsWith("blob:")) {
      setBlobUrl(dataUrl);
      return;
    }
    try {
      const url = dataUrlABlobUrl(dataUrl);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    } catch {
      setError(true);
      setBlobUrl(null);
    }
  }, [dataUrl]);

  if (error) {
    return (
      <p className="text-[11px] font-bold text-red-600 text-center py-6">
        No se pudo cargar la vista previa. Use Descargar.
      </p>
    );
  }

  if (!blobUrl) {
    return (
      <div className={`${altura} flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200`}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cargando PDF…</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-slate-200 bg-white ${altura}`}>
      <iframe title={titulo} src={blobUrl} className="w-full h-full" />
    </div>
  );
}

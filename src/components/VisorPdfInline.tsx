"use client";

import { useEffect, useRef, useState } from "react";
import { dataUrlABlobUrl, esUrlHttp } from "@/lib/pdf-blob";

type Props = {
  dataUrl: string;
  titulo: string;
  altura?: string;
};

function iframePdfNoConfiable(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

let workerListo = false;

export default function VisorPdfInline({ dataUrl, titulo, altura = "h-72" }: Props) {
  const usarCanvas = iframePdfNoConfiable();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    setBlobUrl(null);
    if (!dataUrl?.trim()) {
      setError(true);
      return;
    }
    if (usarCanvas) return;
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
  }, [dataUrl, usarCanvas]);

  if (error) {
    return (
      <p className="text-[11px] font-bold text-red-600 text-center py-6">
        No se pudo cargar la vista previa. Use Descargar.
      </p>
    );
  }

  if (usarCanvas) {
    return <VisorPdfCanvas dataUrl={dataUrl} altura={altura} />;
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

function VisorPdfCanvas({ dataUrl, altura }: { dataUrl: string; altura: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    const host = hostRef.current;

    async function pintar() {
      setError(false);
      setCargando(true);
      if (!dataUrl?.trim()) {
        setError(true);
        setCargando(false);
        return;
      }
      try {
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
        if (!workerListo || !GlobalWorkerOptions.workerSrc) {
          GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/build/pdf.worker.min.mjs",
            import.meta.url
          ).toString();
          workerListo = true;
        }
        const pdf = await getDocument(
          dataUrl.startsWith("data:")
            ? { data: dataUrlABytes(dataUrl) }
            : { url: dataUrl, withCredentials: false }
        ).promise;
        if (cancelado) return;
        const wrap = hostRef.current;
        if (!wrap) return;
        wrap.replaceChildren();
        const maxW = wrap.clientWidth || 320;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          if (cancelado) return;
          const base = page.getViewport({ scale: 1 });
          const scale = Math.min(2, maxW / base.width);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          wrap.appendChild(canvas);
        }
        if (!cancelado) setCargando(false);
      } catch {
        if (!cancelado) {
          setError(true);
          setCargando(false);
        }
      }
    }

    void pintar();
    return () => {
      cancelado = true;
      host?.replaceChildren();
    };
  }, [dataUrl]);

  if (error) {
    return (
      <p className="text-[11px] font-bold text-red-600 text-center py-6">
        No se pudo cargar la vista previa. Use Descargar.
      </p>
    );
  }

  return (
    <div
      className={`rounded-lg overflow-auto border border-slate-200 bg-slate-50 ${altura}`}
      data-rdc-scroll-allow
    >
      {cargando ? (
        <div className="h-full min-h-[12rem] flex items-center justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Cargando PDF…
          </p>
        </div>
      ) : null}
      <div ref={hostRef} className={cargando ? "hidden" : "space-y-2 p-1"} />
    </div>
  );
}

function dataUrlABytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("URL de archivo inválida");
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  const esChunk =
    error.message.includes("ChunkLoadError") ||
    error.message.includes("Loading chunk") ||
    error.name === "ChunkLoadError";

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-600 mb-2">
        CRM RDC
      </p>
      <h1 className="text-xl font-black text-slate-800 mb-2">
        No se pudo cargar esta sección
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {esChunk
          ? "El navegador tiene una versión vieja del CRM en caché. Recarga la página completa."
          : error.message || "Ocurrió un error inesperado."}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold"
        >
          Recargar página
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl ring-1 ring-slate-200 text-sm font-bold text-slate-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

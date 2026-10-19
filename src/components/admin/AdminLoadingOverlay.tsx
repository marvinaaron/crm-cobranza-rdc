"use client";

import { useCallback, useEffect, useState } from "react";
import { useClientes } from "@/context/ClientesContext";

/**
 * Splash de carga del admin. No trata un fetch abortado en segundo plano
 * como fallo: solo ofrece reintento cuando la carga ya terminó sin datos.
 */
export default function AdminLoadingOverlay() {
  const {
    datosListos,
    cargaInicialTerminada,
    nubeCargando,
    cloudSyncError,
    recargarDesdeNube,
  } = useClientes();
  const [oculto, setOculto] = useState(false);
  const [reintentando, setReintentando] = useState(false);

  useEffect(() => {
    if (!datosListos) return;
    sessionStorage.removeItem("rdc-chunk-reload");
    const t = setTimeout(() => setOculto(true), 400);
    return () => clearTimeout(t);
  }, [datosListos]);

  const reintentar = useCallback(async () => {
    setReintentando(true);
    try {
      await recargarDesdeNube();
    } finally {
      setReintentando(false);
    }
  }, [recargarDesdeNube]);

  if (oculto) return null;

  const enCurso = nubeCargando || reintentando;
  const falloCarga =
    cargaInicialTerminada && !datosListos && !enCurso;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 px-8 bg-[#f2f2f7] dark:bg-[#1c1c1e]"
      style={{
        opacity: datosListos ? 0 : 1,
        pointerEvents: datosListos ? "none" : "auto",
        transition: "opacity 400ms ease-out",
      }}
    >
      <img
        src="/apple-touch-icon-admin-v2.png"
        alt=""
        width={64}
        height={64}
        className="h-16 w-16 rounded-[22px] shadow-xl shadow-marca-acento/35"
      />

      {falloCarga ? (
        <>
          <p className="text-center text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs">
            No pudimos conectar con la nube. Reintenta cuando tengas señal
            estable y la app en primer plano.
          </p>
          {cloudSyncError && (
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 line-clamp-3 max-w-xs">
              {cloudSyncError}
            </p>
          )}
          <button
            type="button"
            onClick={() => void reintentar()}
            disabled={reintentando}
            className="mt-1 px-6 py-2.5 rounded-full bg-marca-navy text-white text-[13px] font-semibold shadow-lg shadow-marca-navy/25 active:scale-95 transition disabled:opacity-60"
          >
            {reintentando ? "Conectando…" : "Reintentar"}
          </button>
        </>
      ) : (
        <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-spin"
            aria-hidden
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
            Cargando
          </span>
        </span>
      )}
    </div>
  );
}

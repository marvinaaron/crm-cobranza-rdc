"use client";

import { useCallback, useEffect, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import Logo from "@/components/publico/Logo";

/**
 * Splash de carga del admin. Si la red móvil falla, no deja pasar al dashboard
 * en ceros: muestra un botón de reintento hasta que la nube responda.
 */
export default function AdminLoadingOverlay() {
  const { datosListos, cargaInicialTerminada, cloudSyncError, recargarDesdeNube } =
    useClientes();
  const [oculto, setOculto] = useState(false);
  const [reintentando, setReintentando] = useState(false);
  const [esperaLarga, setEsperaLarga] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEsperaLarga(true), 8_000);
    return () => clearTimeout(t);
  }, []);

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

  const falloCarga = (cargaInicialTerminada || esperaLarga) && !datosListos;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 px-8 bg-slate-50 dark:bg-[#0a0f1e]"
      style={{
        opacity: datosListos ? 0 : 1,
        pointerEvents: datosListos ? "none" : "auto",
        transition: "opacity 400ms ease-out",
      }}
    >
      <span className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] bg-gradient-to-br from-violet-600 to-indigo-700 shadow-xl shadow-violet-500/30 ring-1 ring-violet-500/40">
        <Logo mark="r" variante="white" alto={32} />
      </span>

      {falloCarga ? (
        <>
          <p className="text-center text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs">
            No pudimos conectar con la nube. En móvil suele ser la red o la app
            en segundo plano.
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
            className="mt-1 px-6 py-2.5 rounded-full bg-violet-600 text-white text-[13px] font-semibold shadow-lg shadow-violet-500/25 active:scale-95 transition disabled:opacity-60"
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

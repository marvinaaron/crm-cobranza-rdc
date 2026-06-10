"use client";

import { useEffect, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import Logo from "@/components/publico/Logo";

/**
 * Splash de carga del admin (estilo "launch screen" de iOS).
 *
 * Cubre el primer render mientras la nube responde, para evitar el "flash"
 * de tarjetas en $0 antes de que lleguen los datos reales. `datosListos`
 * solo se vuelve true tras la primera carga desde Supabase, así que este
 * overlay no reaparece en navegaciones posteriores ni al hacer pull-to-refresh.
 */
export default function AdminLoadingOverlay() {
  const { datosListos } = useClientes();
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    if (!datosListos) return;
    const t = setTimeout(() => setOculto(true), 400);
    return () => clearTimeout(t);
  }, [datosListos]);

  if (oculto) return null;

  return (
    <div
      aria-hidden={datosListos}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-slate-50 dark:bg-[#0a0f1e]"
      style={{
        opacity: datosListos ? 0 : 1,
        pointerEvents: datosListos ? "none" : "auto",
        transition: "opacity 400ms ease-out",
      }}
    >
      <span className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] bg-gradient-to-br from-violet-600 to-indigo-700 shadow-xl shadow-violet-500/30 ring-1 ring-violet-500/40">
        <Logo mark="r" variante="white" alto={32} />
      </span>

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
    </div>
  );
}

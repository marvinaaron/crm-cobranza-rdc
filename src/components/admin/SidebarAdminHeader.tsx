"use client";

import Link from "next/link";
import Logo from "@/components/publico/Logo";
import { DRAFTEA_GRADIENTE_CSS } from "@/lib/draftea-colores";
import { useSidebarColapso } from "@/components/admin/SidebarColapsoContext";

const CloseIcon = () => (
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
    aria-hidden
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

/**
 * Encabezado del sidebar admin: isotipo blanco sobre cuadro violeta→índigo
 * (siempre igual en claro y oscuro; el resto del sidebar sí adapta al tema).
 * En móvil incluye la X de cierre a la derecha del logo (misma fila).
 */
export default function SidebarAdminHeader({
  onCerrar,
}: {
  onCerrar?: () => void;
}) {
  const { efectivoExpandido, colapsado, toggleColapsado } = useSidebarColapso();

  return (
    <div className="border-b border-slate-100 dark:border-white/10">
      <div
        className={`px-2 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] flex items-center overflow-hidden ${
          efectivoExpandido ? "gap-2 px-3" : "justify-center"
        }`}
      >
        <Link
          href="/dashboard"
          className={`${
            efectivoExpandido ? "flex-1 min-w-0" : ""
          } flex items-center group overflow-hidden`}
          aria-label="RDC CRM · Ir al dashboard"
        >
          <span className="w-10 h-10 shrink-0 flex items-center justify-center">
            <span
              className="
                inline-flex items-center justify-center w-10 h-10 rounded-xl
                shadow-md ring-1 ring-violet-500/40
                group-hover:brightness-110
                transition-[filter]
              "
              style={{ background: DRAFTEA_GRADIENTE_CSS }}
            >
              <Logo mark="r" variante="white" alto={22} />
            </span>
          </span>
          {efectivoExpandido ? (
            <span className="leading-tight min-w-0 whitespace-nowrap pl-2">
              <span className="block text-[15px] font-black text-slate-900 dark:text-white">
                RDC
              </span>
              <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300 -mt-0.5">
                Consola admin
              </span>
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={toggleColapsado}
          className={`${
            efectivoExpandido ? "hidden lg:inline-flex" : "hidden"
          } shrink-0 w-8 h-8 items-center justify-center rounded-xl text-slate-400 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-white/10 transition-colors`}
          aria-label={colapsado ? "Expandir menú" : "Contraer menú"}
          title={colapsado ? "Expandir menú" : "Contraer menú"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${colapsado ? "rotate-180" : ""}`}
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
            <path d="m16 15-3-3 3-3" />
          </svg>
        </button>
        {onCerrar ? (
          <button
            type="button"
            onClick={onCerrar}
            className="lg:hidden shrink-0 p-2 -mr-1 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Cerrar menú"
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>
      {!efectivoExpandido ? (
        <button
          type="button"
          onClick={toggleColapsado}
          className="hidden lg:flex w-full items-center justify-center pb-2.5 -mt-1 text-slate-400 hover:text-violet-700 transition-colors"
          aria-label="Expandir menú"
          title="Expandir menú"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

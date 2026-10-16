"use client";

import Link from "next/link";
import Logo from "@/components/publico/Logo";
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

/** Chevron mínimo tipo Notas: `<` para contraer, `>` al estar colapsado. */
function ChevronColapsar({ invertido }: { invertido: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${invertido ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

/**
 * Encabezado del sidebar admin, estilo Notas: marca navy, texto quieto
 * y un `<` para contraer.
 */
export default function SidebarAdminHeader({
  onCerrar,
}: {
  onCerrar?: () => void;
}) {
  const { efectivoExpandido, colapsado, toggleColapsado } = useSidebarColapso();

  return (
    <div className="relative">
      <div
        className={`px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] flex items-center overflow-hidden ${
          efectivoExpandido ? "gap-2 px-3 pr-10" : "justify-center"
        }`}
      >
        <Link
          href="/dashboard"
          className={`${
            efectivoExpandido ? "flex-1 min-w-0" : ""
          } flex items-center group overflow-hidden`}
          aria-label="RDC CRM · Ir al dashboard"
        >
          <span className="w-9 h-9 shrink-0 flex items-center justify-center">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#1a164d] group-hover:brightness-110 transition-[filter]">
              <Logo mark="r" variante="white" alto={18} />
            </span>
          </span>
          {efectivoExpandido ? (
            <span className="leading-tight min-w-0 whitespace-nowrap pl-2.5">
              <span className="block text-[15px] font-semibold text-slate-900 dark:text-white">
                RDC
              </span>
              <span className="block text-[12px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                Admin
              </span>
            </span>
          ) : null}
        </Link>
        {onCerrar ? (
          <button
            type="button"
            onClick={onCerrar}
            className="lg:hidden shrink-0 p-2 -mr-1 rounded-lg text-slate-500 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Cerrar menú"
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={toggleColapsado}
        className={`hidden lg:inline-flex z-10 w-7 h-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-black/[0.06] dark:hover:text-white dark:hover:bg-white/10 transition-colors ${
          efectivoExpandido
            ? "absolute top-3 right-1.5"
            : "relative mx-auto mb-1.5"
        }`}
        aria-label={colapsado ? "Expandir menú" : "Contraer menú"}
        title={colapsado ? "Expandir menú" : "Contraer menú"}
      >
        <ChevronColapsar invertido={colapsado} />
      </button>
    </div>
  );
}

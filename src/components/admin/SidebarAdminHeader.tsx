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
 * Encabezado del sidebar: R violeta de marca, texto que se recorta al
 * colapsar sin mover el isotipo.
 */
export default function SidebarAdminHeader({
  onCerrar,
}: {
  onCerrar?: () => void;
}) {
  const { colapsado, toggleColapsado } = useSidebarColapso();

  return (
    <div className="relative">
      <div className="px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] pr-10 flex items-center gap-2.5 overflow-hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0 overflow-hidden group"
          aria-label="RDC CRM · Ir al dashboard"
        >
          <span className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-[#7c3aed] to-[#4338ca] group-hover:brightness-110 transition-[filter] shadow-sm shadow-[#7c3aed]/25">
            <Logo mark="r" variante="white" alto={18} />
          </span>
          <span
            className={`leading-tight min-w-0 whitespace-nowrap transition-opacity duration-200 ${
              colapsado ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="block text-[15px] font-semibold text-slate-900 dark:text-white">
              RDC
            </span>
            <span className="block text-[12px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
              Admin
            </span>
          </span>
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
        className="hidden lg:inline-flex absolute top-3 -right-3 z-20 w-6 h-6 items-center justify-center rounded-full bg-[var(--admin-sidebar)] border border-[var(--admin-sidebar-line)] text-slate-400 hover:text-slate-700 dark:hover:text-white shadow-sm"
        aria-label={colapsado ? "Expandir menú" : "Contraer menú"}
        title={colapsado ? "Expandir menú" : "Contraer menú"}
      >
        <ChevronColapsar invertido={colapsado} />
      </button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sub-navegación de la sección "Mi Cuenta": alterna entre Cumplimiento
 * (estatus mensual) y Situación fiscal (SAT). Se muestra arriba del contenido
 * en ambas páginas para que SAT siga accesible sin un ítem propio en el menú.
 */

const PESTANAS = [
  { href: "/portal/cumplimiento", label: "Declaraciones" },
  { href: "/portal/sat", label: "Situación fiscal" },
] as const;

export default function MiCuentaTabs() {
  const pathname = usePathname();
  return (
    <div className="max-w-7xl mx-auto w-full">
      <div
        role="tablist"
        aria-label="Sección Mi cuenta"
        className="inline-flex w-full sm:w-auto rounded-full bg-slate-100 dark:bg-white/5 p-0.5"
      >
        {PESTANAS.map((p) => {
          const activo = pathname === p.href;
          return (
            <Link
              key={p.href}
              href={p.href}
              role="tab"
              aria-current={activo ? "page" : undefined}
              aria-selected={activo}
              className={`flex-1 sm:flex-none sm:min-w-[8.5rem] text-center px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                activo
                  ? "bg-white dark:bg-slate-800 text-[var(--portal-navy)] shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-300"
              }`}
            >
              {p.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

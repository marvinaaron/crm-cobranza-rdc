"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sub-navegación de la sección "Mi Cuenta": alterna entre Cumplimiento
 * (estatus mensual) y Situación fiscal (SAT). Se muestra arriba del contenido
 * en ambas páginas para que SAT siga accesible sin un ítem propio en el menú.
 */

const PESTANAS = [
  { href: "/portal/cumplimiento", label: "Cumplimiento" },
  { href: "/portal/sat", label: "Situación fiscal" },
] as const;

export default function MiCuentaTabs() {
  const pathname = usePathname();
  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="inline-flex gap-1 rounded-xl bg-slate-100 dark:bg-white/5 p-1">
        {PESTANAS.map((p) => {
          const activo = pathname === p.href;
          return (
            <Link
              key={p.href}
              href={p.href}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activo
                  ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-300"
              }`}
              aria-current={activo ? "page" : undefined}
            >
              {p.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

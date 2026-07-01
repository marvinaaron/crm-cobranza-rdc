"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/portal/hacienda/clientes", label: "Clientes" },
  { href: "/portal/hacienda/proveedores", label: "Proveedores" },
  { href: "/portal/hacienda/visor", label: "Visor fiscal" },
] as const;

/** Navegación Hacienda — sidebar (desktop) y píldoras (móvil). */
export default function HaciendaNav({ variante = "sidebar" }: { variante?: "sidebar" | "pills" }) {
  const pathname = usePathname();
  const esHacienda = pathname.startsWith("/portal/hacienda");

  if (!esHacienda && variante === "sidebar") return null;

  if (variante === "pills") {
    return (
      <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1 pb-0.5">
        {TABS.map((tab) => {
          const activo = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors ${
                activo
                  ? "bg-[var(--portal-navy)] text-white shadow-md"
                  : "bg-slate-100 text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="px-3 pb-4 border-t border-slate-200/60 pt-4">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
        Hacienda · CFDI
      </p>
      <nav className="space-y-0.5" aria-label="Consulta fiscal">
        {TABS.map((tab) => {
          const activo = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`block px-3 py-2.5 rounded-xl text-[12px] font-bold transition-colors ${
                activo
                  ? "bg-[var(--portal-navy-soft)] text-[var(--portal-navy)] ring-1 ring-[var(--portal-navy-border)]"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <p className="text-[9px] font-medium text-slate-400 mt-3 leading-snug">
        Solo consulta. Los comprobantes se sincronizan por periodo; no guardamos historial ilimitado.
      </p>
    </div>
  );
}

export { TABS as HACIENDA_TABS };

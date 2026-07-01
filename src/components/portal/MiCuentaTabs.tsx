"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
        className="flex w-full rounded-xl bg-white border border-slate-200/80 p-1 shadow-sm"
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
              className={`flex-1 text-center px-3 py-2.5 rounded-lg text-xs transition-colors ${
                activo
                  ? "bg-[var(--portal-navy-soft)] text-[var(--portal-navy)] font-bold"
                  : "text-slate-500 hover:text-slate-700 font-medium"
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

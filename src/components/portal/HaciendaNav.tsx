"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconProps = { activo?: boolean; size?: number };

const stroke = (activo?: boolean) => (activo ? 2 : 1.75);

export function HaciendaClientesIcon({ activo, size = 18 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke(activo)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function HaciendaProveedoresIcon({ activo, size = 18 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke(activo)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
      <path d="M3 9l2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>
  );
}

/** Velocímetro estilo Konta — visor fiscal. */
export function HaciendaVisorIcon({ activo, size = 18 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke(activo)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 14l3-5" />
      <circle cx="12" cy="14" r="1.25" fill="currentColor" stroke="none" />
      <path d="M4.5 15.5A8.5 8.5 0 0 1 12 5.5" />
      <path d="M19.5 15.5A8.5 8.5 0 0 0 12 5.5" />
      <path d="M6 19h12" />
    </svg>
  );
}

const TABS = [
  {
    href: "/portal/hacienda/clientes",
    label: "Clientes",
    icon: HaciendaClientesIcon,
  },
  {
    href: "/portal/hacienda/proveedores",
    label: "Proveedores",
    icon: HaciendaProveedoresIcon,
  },
  {
    href: "/portal/hacienda/visor",
    label: "Visor fiscal",
    icon: HaciendaVisorIcon,
  },
] as const;

type Props = {
  variante?: "sidebar" | "pills";
};

/**
 * Sección única HACIENDA CFDI — después de Perfil en el sidebar.
 * En móvil: píldoras con iconos cuando estás en rutas /portal/hacienda.
 */
export default function HaciendaNav({ variante = "sidebar" }: Props) {
  const pathname = usePathname();
  const esHacienda = pathname.startsWith("/portal/hacienda");

  if (variante === "pills") {
    if (!esHacienda) return null;
    return (
      <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1 pb-0.5">
        {TABS.map((tab) => {
          const activo = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activo
                  ? "bg-[var(--portal-navy)] text-white shadow-md"
                  : "bg-slate-100 text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon activo={activo} size={16} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-5 pt-5 border-t border-slate-200/60">
      <p className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
        Hacienda CFDI
      </p>
      <nav className="space-y-0.5" aria-label="Hacienda CFDI">
        {TABS.map((tab) => {
          const activo = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activo
                  ? "text-[var(--portal-purple)] bg-white ring-1 ring-[var(--portal-purple-border)] shadow-sm"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
              }`}
            >
              <span className={activo ? "text-[var(--portal-purple)]" : "text-slate-400"}>
                <Icon activo={activo} />
              </span>
              <span className={`text-sm ${activo ? "font-bold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <p className="px-3 text-[9px] font-medium text-slate-400 mt-3 leading-snug">
        Solo consulta por periodo. Sin descarga de XML.
      </p>
    </div>
  );
}

export { TABS as HACIENDA_TABS };

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

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
      data-stroke-only
    >
      {activo ? (
        <path
          d="M4.5 15.5A8.5 8.5 0 0 1 12 5.5A8.5 8.5 0 0 1 19.5 15.5Z"
          fill="currentColor"
          fillOpacity={0.22}
          stroke="none"
        />
      ) : null}
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
    href: "/portal/hacienda/visor",
    label: "Visor fiscal",
    icon: HaciendaVisorIcon,
  },
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
] as const;

type Props = {
  variante?: "sidebar" | "pills";
};

type Thumb = { left: number; width: number };

/**
 * Sección única HACIENDA CFDI — después de Perfil en el sidebar.
 * En móvil: píldoras con iconos cuando estás en rutas /portal/hacienda.
 */
export default function HaciendaNav({ variante = "sidebar" }: Props) {
  const pathname = usePathname();
  const esHacienda = pathname.startsWith("/portal/hacienda");
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<Thumb>({ left: 0, width: 0 });

  const medir = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const activo = track.querySelector<HTMLElement>('[aria-current="page"]');
    if (!activo) {
      setThumb({ left: 0, width: 0 });
      return;
    }
    setThumb({ left: activo.offsetLeft, width: activo.offsetWidth });
  }, []);

  useLayoutEffect(() => {
    if (variante !== "pills" || !esHacienda) return;
    medir();
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(medir);
    ro.observe(track);
    return () => ro.disconnect();
  }, [variante, esHacienda, pathname, medir]);

  if (variante === "pills") {
    if (!esHacienda) return null;
    return (
      <div className="overflow-x-auto scrollbar-none -mx-1 px-1 pb-0.5">
        <div
          ref={trackRef}
          role="tablist"
          aria-label="CFDI Hacienda"
          className="relative inline-flex min-w-full w-max gap-1 p-1 rounded-full bg-[#e5e5ea] dark:bg-white/10"
        >
          <span
            aria-hidden
            className={`portal-nav-pill-thumb pointer-events-none absolute top-1 bottom-1 left-0 z-0 rounded-full bg-[var(--portal-navy)] shadow-md shadow-[#1a164d]/25 dark:bg-white dark:shadow-none ${
              thumb.width > 0 ? "opacity-100" : "opacity-0"
            }`}
            style={{ left: thumb.left, width: thumb.width }}
          />
          {TABS.map((tab) => {
            const activo = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                role="tab"
                aria-current={activo ? "page" : undefined}
                aria-selected={activo}
                className={`relative z-10 shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full text-xs font-bold transition-colors duration-200 ${
                  activo
                    ? "text-white dark:text-[#1c1c1e]"
                    : "text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white/80"
                }`}
              >
                <Icon activo={activo} size={16} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 pt-5 border-t border-slate-200/60">
      <p className="px-3 text-[13px] font-semibold text-slate-500 mb-2">
        CFDI Hacienda
      </p>
      <nav className="space-y-0.5" aria-label="CFDI Hacienda">
        {TABS.map((tab) => {
          const activo = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={activo ? "page" : undefined}
              data-nav-current={activo ? "true" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activo
                  ? "text-[var(--portal-navy)]"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
              }`}
            >
              <span className={activo ? "text-[var(--portal-navy)]" : "text-slate-400"}>
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

"use client";

import Link from "next/link";
import type { AccionDespacho } from "@/lib/admin/siguiente-paso-despacho";

type Props = {
  acciones: AccionDespacho[];
};

/**
 * Lista compacta de pendientes operativos — solo móvil, bajo el carrusel del dashboard.
 * Reversible: oculta en `lg+` donde el carrusel basta.
 */
export default function AdminInboxPendientes({ acciones }: Props) {
  if (acciones.length === 0) return null;

  return (
    <section
      className="lg:hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/50 overflow-hidden"
      aria-label="Bandeja de pendientes"
    >
      <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Todos los pendientes
        </p>
        <span className="text-[10px] font-bold text-slate-400 tabular-nums">
          {acciones.length}
        </span>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-white/10 max-h-[min(52vh,420px)] overflow-y-auto">
        {acciones.map((accion) => (
          <li key={accion.clave}>
            <Link
              href={accion.href}
              className={`flex items-start gap-3 px-4 py-3 active:bg-slate-50 dark:active:bg-white/5 transition-colors ${
                accion.urgente ? "bg-rose-50/40 dark:bg-rose-500/5" : ""
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  accion.urgente ? "bg-rose-500" : "bg-amber-400"
                }`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {accion.etiqueta}
                </p>
                <p className="text-sm font-black text-slate-800 dark:text-white leading-snug truncate">
                  {accion.titulo}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {accion.detalle}
                </p>
              </div>
              <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 pt-1">
                {accion.cta} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

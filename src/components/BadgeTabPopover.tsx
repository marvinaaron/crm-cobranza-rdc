"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

/**
 * Badge numérico (círculo rojo) que, al tocarlo, abre un popover compacto
 * explicando POR QUÉ hay pendientes en esa sección y un botón para ir
 * directo. Se usa en los menús del portal y del admin.
 *
 * - El badge es un elemento aparte del <Link> de la tab (no anidado), para
 *   no romper HTML válido ni la navegación: tocar el badge abre el popover;
 *   tocar el resto de la tab navega normal.
 * - El popover se renderiza en un portal a <body> con posición fija, así no
 *   lo recorta el overflow del sidebar.
 */

const POPOVER_W = 256; // px (w-64)

type Acento = "blue" | "violet";

const CTA_CLASS: Record<Acento, string> = {
  blue: "bg-blue-900 hover:bg-blue-800",
  violet: "bg-violet-600 hover:bg-violet-700",
};

export default function BadgeTabPopover({
  titulo,
  count,
  motivo,
  cta,
  href,
  acento = "blue",
}: {
  titulo: string;
  count: number;
  motivo: string;
  cta: string;
  href: string;
  acento?: Acento;
}) {
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const recalcular = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const left = Math.min(
      Math.max(12, r.right - POPOVER_W),
      window.innerWidth - POPOVER_W - 12
    );
    setPos({ top: r.bottom + 8, left });
  };

  useLayoutEffect(() => {
    if (abierto) recalcular();
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = () => setAbierto(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("scroll", cerrar, true);
    window.addEventListener("resize", cerrar);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", cerrar, true);
      window.removeEventListener("resize", cerrar);
      document.removeEventListener("keydown", onKey);
    };
  }, [abierto]);

  if (count <= 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setAbierto((v) => !v);
        }}
        aria-label={`${count} pendiente${count > 1 ? "s" : ""} en ${titulo}. Toca para ver el detalle.`}
        aria-expanded={abierto}
        className="min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-black shadow-sm ring-2 ring-white dark:ring-slate-900 cursor-pointer hover:bg-red-600 transition-colors"
      >
        {count > 99 ? "99+" : count}
      </button>

      {abierto &&
        pos &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Cerrar"
              className="fixed inset-0 z-[90] cursor-default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAbierto(false);
              }}
            />
            <div
              role="dialog"
              className="fixed z-[95] w-64 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-white/10 p-4"
              style={{ top: pos.top, left: pos.left }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black">
                  {count > 99 ? "99+" : count}
                </span>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {titulo}
                </p>
              </div>
              <p className="text-[13px] font-bold text-slate-700 dark:text-slate-100 leading-snug">
                {motivo}
              </p>
              <Link
                href={href}
                onClick={() => setAbierto(false)}
                className={`mt-3 inline-flex w-full items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-[11px] font-black uppercase tracking-widest transition-colors ${CTA_CLASS[acento]}`}
              >
                {cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </Link>
            </div>
          </>,
          document.body
        )}
    </>
  );
}

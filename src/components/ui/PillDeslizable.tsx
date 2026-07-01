"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Opcion<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type OpcionEnlace = {
  href: string;
  label: string;
};

type Thumb = { left: number; width: number };

const THUMB_CLASS =
  "absolute top-1 bottom-1 rounded-lg bg-marca-navy shadow-md shadow-marca-navy/30 ring-1 ring-marca-navy/20 transition-all duration-200 ease-out";

const TRACK_CLASS = "relative flex p-1 bg-slate-100 rounded-xl";

function usePillThumb<T extends string>(
  trackRef: React.RefObject<HTMLDivElement | null>,
  opciones: { value: T }[],
  value: T,
  scrollable: boolean
) {
  const [thumb, setThumb] = useState<Thumb>({ left: 0, width: 0 });

  const medir = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const idx = opciones.findIndex((o) => o.value === value);
    const btn = track.querySelectorAll<HTMLElement>("[data-pill-btn]")[idx];
    if (!btn) return;
    setThumb({ left: btn.offsetLeft, width: btn.offsetWidth });
    if (scrollable) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [opciones, value, scrollable]);

  useEffect(() => {
    medir();
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(medir);
    ro.observe(track);
    return () => ro.disconnect();
  }, [medir]);

  return thumb;
}

type PillProps<T extends string> = {
  label?: string;
  hint?: string;
  opciones: Opcion<T>[];
  value: T;
  onChange: (v: T) => void;
  scrollable?: boolean;
  className?: string;
};

/** Píldoras con thumb deslizante (estilo calculadora de facturación). */
export default function PillDeslizable<T extends string>({
  label,
  hint,
  opciones,
  value,
  onChange,
  scrollable = false,
  className = "",
}: PillProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumb = usePillThumb(trackRef, opciones, value, scrollable);

  return (
    <div className={className}>
      {label ? (
        <p className="text-xs font-semibold text-slate-700 mb-1.5">{label}</p>
      ) : null}
      {hint ? (
        <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">{hint}</p>
      ) : null}
      <div
        className={
          scrollable
            ? "overflow-x-auto -mx-1 px-1 pb-0.5 scrollbar-none"
            : "w-full"
        }
      >
        <div
          ref={trackRef}
          role="tablist"
          aria-label={label ?? "Opciones"}
          className={`${TRACK_CLASS} ${
            scrollable ? "inline-flex min-w-full w-max" : "w-full"
          }`}
        >
          <div aria-hidden className={THUMB_CLASS} style={{ left: thumb.left, width: thumb.width }} />
          {opciones.map((op) => {
            const activo = op.value === value;
            return (
              <button
                key={op.value}
                type="button"
                role="tab"
                data-pill-btn
                aria-selected={activo}
                disabled={op.disabled}
                onClick={() => onChange(op.value)}
                className={`relative z-10 shrink-0 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                  scrollable ? "" : "flex-1 text-center"
                } ${activo ? "text-white" : "text-slate-500 hover:text-slate-700"}`}
              >
                {op.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type PillEnlacesProps = {
  label?: string;
  opciones: OpcionEnlace[];
  className?: string;
  scrollable?: boolean;
};

/** Misma píldora deslizante, con navegación por enlace. */
export function PillDeslizableEnlaces({
  label,
  opciones,
  className = "",
  scrollable = false,
}: PillEnlacesProps) {
  const pathname = usePathname();
  const trackRef = useRef<HTMLDivElement>(null);
  const activo =
    opciones.find((o) => pathname === o.href)?.href ?? opciones[0]?.href ?? "";
  const thumb = usePillThumb(
    trackRef,
    opciones.map((o) => ({ value: o.href })),
    activo,
    scrollable
  );

  return (
    <div className={`w-full sm:w-auto ${className}`}>
      {label ? (
        <p className="text-xs font-semibold text-slate-700 mb-1.5">{label}</p>
      ) : null}
      <div
        className={
          scrollable
            ? "overflow-x-auto -mx-1 px-1 pb-0.5 scrollbar-none"
            : "w-full sm:w-auto"
        }
      >
        <div
          ref={trackRef}
          role="tablist"
          aria-label={label ?? "Navegación"}
          className={`${TRACK_CLASS} ${
            scrollable ? "inline-flex min-w-full w-max" : "inline-flex w-full sm:w-auto"
          }`}
        >
          <div aria-hidden className={THUMB_CLASS} style={{ left: thumb.left, width: thumb.width }} />
          {opciones.map((op) => {
            const seleccionado = pathname === op.href;
            return (
              <Link
                key={op.href}
                href={op.href}
                role="tab"
                data-pill-btn
                aria-current={seleccionado ? "page" : undefined}
                aria-selected={seleccionado}
                className={`relative z-10 shrink-0 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200 sm:min-w-[8.5rem] text-center ${
                  seleccionado ? "text-white" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {op.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

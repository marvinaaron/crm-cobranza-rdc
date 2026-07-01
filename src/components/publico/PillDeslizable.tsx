"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Opcion<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type Props<T extends string> = {
  label: string;
  hint?: string;
  opciones: Opcion<T>[];
  value: T;
  onChange: (v: T) => void;
  /** Si true, permite scroll horizontal en móvil (muchas opciones). */
  scrollable?: boolean;
};

type Thumb = { left: number; width: number };

export default function PillDeslizable<T extends string>({
  label,
  hint,
  opciones,
  value,
  onChange,
  scrollable = false,
}: Props<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<Thumb>({ left: 0, width: 0 });

  const medir = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const idx = opciones.findIndex((o) => o.value === value);
    const btn = track.querySelectorAll<HTMLButtonElement>("[data-pill-btn]")[idx];
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

  return (
    <div>
      <p className="text-xs font-semibold text-slate-700 mb-1.5">{label}</p>
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
          aria-label={label}
          className={`relative flex p-1 bg-slate-100 rounded-xl ${
            scrollable ? "inline-flex min-w-full w-max" : "w-full"
          }`}
        >
          <div
            aria-hidden
            className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80 transition-all duration-200 ease-out"
            style={{ left: thumb.left, width: thumb.width }}
          />
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
                className={`relative z-10 shrink-0 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  scrollable ? "" : "flex-1 text-center"
                } ${activo ? "text-marca-navy" : "text-slate-500 hover:text-slate-700"}`}
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

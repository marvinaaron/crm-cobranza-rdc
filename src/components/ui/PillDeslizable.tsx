"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

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

type AcentoPill = "marca" | "portal" | "claro";

const THUMB_EASE = "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";

const THUMB_CLASS: Record<AcentoPill, string> = {
  marca: `pointer-events-none absolute top-1 bottom-1 left-0 z-0 rounded-full bg-marca-navy shadow-md shadow-marca-navy/30 ring-1 ring-marca-navy/20 rdc-ios-pill-thumb transition-[left,width,opacity] ${THUMB_EASE}`,
  portal: `pointer-events-none absolute top-1 bottom-1 left-0 z-0 rounded-full bg-[#1a164d] shadow-md shadow-[#1a164d]/25 rdc-ios-pill-thumb transition-[left,width,opacity] ${THUMB_EASE}`,
  claro: `pointer-events-none absolute top-0.5 bottom-0.5 left-0 z-0 rounded-full bg-white shadow-sm ring-1 ring-black/[0.04] rdc-ios-pill-thumb rdc-ios-pill-thumb-claro transition-[left,width,opacity] ${THUMB_EASE}`,
};

const TRACK_CLASS: Record<AcentoPill, string> = {
  marca: "relative flex p-1 bg-slate-100 rounded-full rdc-ios-pill",
  portal: "relative flex p-1 bg-[#e5e5ea] rounded-full rdc-ios-pill",
  claro: "relative flex p-0.5 bg-slate-100 rounded-full rdc-ios-pill rdc-ios-pill-claro",
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function usePillThumb<T extends string>(
  trackRef: React.RefObject<HTMLDivElement | null>,
  opciones: { value: T }[],
  value: T,
  scrollable: boolean,
  progress?: number
) {
  const [thumb, setThumb] = useState<Thumb>({ left: 0, width: 0 });

  const medir = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const botones = track.querySelectorAll<HTMLElement>("[data-pill-btn]");
    if (botones.length === 0) return;

    if (progress != null && botones.length > 1) {
      const max = botones.length - 1;
      const p = Math.min(max, Math.max(0, progress));
      const i0 = Math.min(Math.floor(p), max);
      const i1 = Math.min(i0 + 1, max);
      const t = p - i0;
      const a = botones[i0];
      const b = botones[i1];
      setThumb({
        left: lerp(a.offsetLeft, b.offsetLeft, t),
        width: lerp(a.offsetWidth, b.offsetWidth, t),
      });
      return;
    }

    const idx = opciones.findIndex((o) => o.value === value);
    const btn = botones[idx] ?? botones[0];
    if (!btn) return;
    setThumb({ left: btn.offsetLeft, width: btn.offsetWidth });
    if (scrollable) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [opciones, value, scrollable, progress]);

  useLayoutEffect(() => {
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
  compact?: boolean;
  className?: string;
  acento?: AcentoPill;
  size?: "md" | "sm";
  /** 0 = primera, 1 = segunda… interpola el óvalo (pager iOS). */
  progress?: number;
  /** Sin transición CSS: el óvalo sigue el scroll/dedo al instante. */
  instantThumb?: boolean;
  /** Arrastre horizontal sobre la píldora (0…n-1). */
  onScrub?: (progress: number) => void;
};

/** Píldoras con thumb deslizante (estilo calculadora de facturación). */
export default function PillDeslizable<T extends string>({
  label,
  hint,
  opciones,
  value,
  onChange,
  scrollable = false,
  compact = false,
  className = "",
  acento = "marca",
  size = "md",
  progress,
  instantThumb = false,
  onScrub,
}: PillProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumb = usePillThumb(trackRef, opciones, value, scrollable, progress);
  const arrastreRef = useRef<{
    pointerId: number;
    startX: number;
    moved: boolean;
  } | null>(null);

  const progressDesdeX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const botones = track.querySelectorAll<HTMLElement>("[data-pill-btn]");
    if (botones.length < 2) return 0;
    const first = botones[0].getBoundingClientRect();
    const last = botones[botones.length - 1].getBoundingClientRect();
    const x0 = first.left + first.width / 2;
    const x1 = last.left + last.width / 2;
    if (x1 === x0) return 0;
    const t = Math.min(1, Math.max(0, (clientX - x0) / (x1 - x0)));
    return t * (botones.length - 1);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onScrub) return;
    arrastreRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onScrub || !arrastreRef.current) return;
    if (e.pointerId !== arrastreRef.current.pointerId) return;
    const dx = Math.abs(e.clientX - arrastreRef.current.startX);
    if (!arrastreRef.current.moved) {
      if (dx < 6) return;
      arrastreRef.current.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    onScrub(progressDesdeX(e.clientX));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrastreRef.current || e.pointerId !== arrastreRef.current.pointerId) {
      return;
    }
    const moved = arrastreRef.current.moved;
    arrastreRef.current = null;
    if (!moved || !onScrub) return;
    const p = progressDesdeX(e.clientX);
    const idx = Math.round(p);
    const op = opciones[idx];
    if (op && !op.disabled) onChange(op.value);
  };

  return (
    <div className={`${compact ? "w-auto" : ""} ${className}`}>
      {label ? (
        <p className="text-[13px] text-slate-500 mb-1.5">{label}</p>
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
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`${TRACK_CLASS[acento]} ${
            compact
              ? "inline-flex w-auto"
              : scrollable
                ? "inline-flex min-w-full w-max"
                : "w-full"
          } ${onScrub ? "[touch-action:pan-y] cursor-grab active:cursor-grabbing" : ""}`}
        >
          <div
            aria-hidden
            className={`${THUMB_CLASS[acento]} ${instantThumb ? "!transition-none" : ""}`}
            style={{
              left: thumb.left,
              width: thumb.width,
              opacity: thumb.width > 0 ? 1 : 0,
            }}
          />
          {opciones.map((op, i) => {
            const activo =
              progress != null ? Math.round(progress) === i : op.value === value;
            return (
              <button
                key={op.value}
                type="button"
                role="tab"
                data-pill-btn
                aria-selected={activo}
                disabled={op.disabled}
                onClick={(ev) => {
                  if (arrastreRef.current?.moved) {
                    ev.preventDefault();
                    return;
                  }
                  onChange(op.value);
                }}
                className={`relative z-10 shrink-0 whitespace-nowrap rounded-full transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                  size === "sm"
                    ? "px-3 py-1.5 text-[12px] font-semibold"
                    : "px-4 py-2.5 text-[15px] font-semibold"
                } ${compact || scrollable ? "" : "flex-1 text-center"} ${
                  activo
                    ? acento === "claro"
                      ? "text-slate-800"
                      : "text-white"
                    : acento === "claro"
                      ? "text-slate-400"
                      : "text-slate-500"
                }`}
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
  acento?: AcentoPill;
};

/** Misma píldora deslizante, con navegación programática (sin Link). */
export function PillDeslizableEnlaces({
  label,
  opciones,
  className = "",
  scrollable = false,
  acento = "marca",
}: PillEnlacesProps) {
  const pathname = usePathname();
  const router = useRouter();
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
          className={`${TRACK_CLASS[acento]} ${
            scrollable ? "inline-flex min-w-full w-max" : "inline-flex w-full sm:w-auto"
          }`}
        >
          <div
            aria-hidden
            className={THUMB_CLASS[acento]}
            style={{
              left: thumb.left,
              width: thumb.width,
              opacity: thumb.width > 0 ? 1 : 0,
            }}
          />
          {opciones.map((op) => {
            const seleccionado = pathname === op.href;
            return (
              <button
                key={op.href}
                type="button"
                data-pill-btn
                onClick={() => router.push(op.href)}
                className={`relative z-10 shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
                  scrollable ? "" : "flex-1 text-center"
                } ${seleccionado ? "text-white" : "text-slate-500 hover:text-slate-700"}`}
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

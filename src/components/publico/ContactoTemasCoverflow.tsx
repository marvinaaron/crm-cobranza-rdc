"use client";

import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  CONTACTO_PUBLICO,
  RAZONES_CONTACTO,
  type IconoRazonContacto,
} from "@/lib/contacto-publico";

const CARD_SPACING = 126;
const MAX_VISIBLE_OFFSET = 2;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function wrappedOffset(cardIndex: number, activeIndex: number, total: number): number {
  let offset = cardIndex - activeIndex;
  const half = total / 2;
  if (offset > half) offset -= total;
  if (offset < -half) offset += total;
  return offset;
}

function coverflowStyle(offset: number, reduced: boolean): CSSProperties {
  const abs = Math.abs(offset);
  const y = offset * CARD_SPACING;
  const visible = abs <= MAX_VISIBLE_OFFSET;
  const ease = reduced
    ? "transform 0.25s ease, opacity 0.25s ease"
    : "transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.4s ease";

  if (offset === 0) {
    return {
      transform: "translate(-50%, -50%)",
      zIndex: 40,
      opacity: 1,
      pointerEvents: "auto",
      transition: ease,
      backfaceVisibility: "hidden",
      transformStyle: "flat",
    };
  }

  const rotateX = reduced ? 0 : offset * -16;
  const scale = abs === 1 ? 0.94 : 0.88;
  const translateZ = reduced ? 0 : -abs * 24;

  return {
    transform: `translate3d(-50%, calc(-50% + ${y}px), ${translateZ}px) scale(${scale}) rotateX(${rotateX}deg)`,
    zIndex: 30 - abs * 8,
    opacity: visible ? (abs === 1 ? 0.7 : 0.36) : 0,
    pointerEvents: visible ? "auto" : "none",
    transition: ease,
    backfaceVisibility: "hidden",
  };
}

const ICONO_SVG = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

const ICONOS: Record<IconoRazonContacto, ReactNode> = {
  spark: (
    <svg {...ICONO_SVG}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  swap: (
    <svg {...ICONO_SVG}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  alert: (
    <svg {...ICONO_SVG}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  chat: (
    <svg {...ICONO_SVG}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  users: (
    <svg {...ICONO_SVG}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  calendar: (
    <svg {...ICONO_SVG}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  key: (
    <svg {...ICONO_SVG}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  id: (
    <svg {...ICONO_SVG}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 10h4M14 14h4" />
    </svg>
  ),
  receipt: (
    <svg {...ICONO_SVG}>
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </svg>
  ),
  shield: (
    <svg {...ICONO_SVG}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  building: (
    <svg {...ICONO_SVG}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  ),
  refund: (
    <svg {...ICONO_SVG}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
};

function TemaCard({
  r,
  activa,
}: {
  r: (typeof RAZONES_CONTACTO)[number];
  activa: boolean;
}) {
  return (
    <div
      className={`flex h-[112px] items-start gap-3.5 rounded-xl bg-white px-4 py-3.5 ring-1 transition-shadow ${
        activa
          ? "shadow-md shadow-violet-100/80 ring-violet-300"
          : "ring-slate-200"
      }`}
    >
      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
        {ICONOS[r.icono]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {r.eyebrow}
        </p>
        <p className="text-[15px] font-bold leading-snug text-slate-900">{r.titulo}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-500">
          {r.descripcion}
        </p>
      </div>
      <span
        className={`self-center text-sm font-bold transition-colors ${
          activa ? "text-violet-600" : "text-slate-300"
        }`}
      >
        →
      </span>
    </div>
  );
}

export default function ContactoTemasCoverflow() {
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  const touchStart = useRef<number | null>(null);
  const total = RAZONES_CONTACTO.length;

  const goPrev = useCallback(() => {
    setActive((i) => mod(i - 1, total));
  }, [total]);

  const goNext = useCallback(() => {
    setActive((i) => mod(i + 1, total));
  }, [total]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStart.current;
    if (Math.abs(delta) > 40) {
      if (delta > 0) goPrev();
      else goNext();
    }
    touchStart.current = null;
  };

  return (
    <div className="mt-4 flex items-stretch gap-2 sm:gap-3">
      <div className="flex shrink-0 flex-col items-center justify-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Tema anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200/80 transition hover:bg-white hover:text-violet-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
        <div className="flex flex-col items-center gap-1 py-1">
          {RAZONES_CONTACTO.map((r, i) => (
            <button
              key={r.id}
              type="button"
              aria-label={`Ver ${r.titulo}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active ? "h-5 w-1.5 bg-violet-600" : "h-1.5 w-1.5 bg-slate-300 hover:bg-violet-300"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          aria-label="Siguiente tema"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200/80 transition hover:bg-white hover:text-violet-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      <div
        className="relative h-[420px] min-w-0 flex-1 overflow-hidden sm:h-[460px]"
        style={{ perspective: reduced ? undefined : "1400px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          {RAZONES_CONTACTO.map((r, i) => {
            const offset = wrappedOffset(i, active, total);
            const isCenter = offset === 0;

            return (
              <article
                key={r.id}
                className={`absolute left-1/2 top-1/2 w-[calc(100%-4px)] ${isCenter ? "" : "will-change-transform"}`}
                style={{
                  ...coverflowStyle(offset, reduced),
                  transformOrigin: "center center",
                }}
                aria-hidden={!isCenter}
              >
                {isCenter ? (
                  <a
                    href={CONTACTO_PUBLICO.whatsapp.buildUrl(r.mensaje)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${r.titulo} — abrir WhatsApp`}
                    className="block"
                  >
                    <TemaCard r={r} activa />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className="w-full text-left"
                    tabIndex={Math.abs(offset) <= MAX_VISIBLE_OFFSET ? 0 : -1}
                    aria-label={`Seleccionar ${r.titulo}`}
                  >
                    <TemaCard r={r} activa={false} />
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

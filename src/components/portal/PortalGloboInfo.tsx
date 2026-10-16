"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  anchor: HTMLElement;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
};

/**
 * Globo blanco tipo iOS, anclado a un elemento (número del calendario o
 * icono i). Sin overlay oscuro; se cierra con la X o al tocar afuera.
 */
export default function PortalGloboInfo({
  anchor,
  title,
  onClose,
  children,
  width = 280,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, caret: width / 2 });

  useLayoutEffect(() => {
    const r = anchor.getBoundingClientRect();
    const margin = 12;
    let left = r.left + r.width / 2 - width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
    const caret = r.left + r.width / 2 - left;
    const top = r.bottom + 10;
    setPos({ top, left, caret });
  }, [anchor, width]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchor.contains(t)) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [anchor, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      className="fixed z-[90] rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.16)] p-3.5"
      style={{ top: pos.top, left: pos.left, width }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2 w-4 h-4 bg-white rotate-45"
        style={{ left: pos.caret - 8 }}
      />
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-[16px] font-semibold text-slate-900 leading-snug pr-2">
          {title}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 w-7 h-7 -mt-0.5 -mr-0.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Cerrar"
        >
          <XIcon />
        </button>
      </div>
      <div className="mt-2 text-[14px] text-slate-600 leading-relaxed">
        {children}
      </div>
    </div>,
    document.body
  );
}

export function IconoInfoOutline({
  className = "",
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

/** i de trazo, sin fondo. Abre el globo al tocarlo. */
export function PortalInfoBoton({
  title,
  children,
  size = 22,
  className = "",
}: {
  title: string;
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={`shrink-0 inline-flex items-center justify-center text-sky-500 hover:text-sky-600 ${className}`}
        aria-label="Más información"
        aria-expanded={abierto}
      >
        <IconoInfoOutline size={size} />
      </button>
      {abierto && btnRef.current ? (
        <PortalGloboInfo
          anchor={btnRef.current}
          title={title}
          onClose={() => setAbierto(false)}
        >
          {children}
        </PortalGloboInfo>
      ) : null}
    </>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

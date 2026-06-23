"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function parseRgb(color: string): { r: number; g: number; b: number; a: number } | null {
  if (!color || color === "transparent") return null;
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] !== undefined ? Number(match[4]) : 1,
  };
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function backgroundLuminance(el: Element): number | null {
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    const { backgroundColor } = getComputedStyle(node);
    const rgb = parseRgb(backgroundColor);
    if (rgb && rgb.a > 0.12) return luminance(rgb.r, rgb.g, rgb.b);
    node = node.parentElement;
  }
  return null;
}

function isDarkSurface(el: Element): boolean | null {
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    if (node instanceof HTMLElement) {
      const cls = node.className;
      if (typeof cls === "string" && /bg-(slate-9|slate-95|marca-navy|\[#0)/.test(cls)) {
        return true;
      }
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * Botón flotante inferior derecho: flecha de contorno, más compacta.
 * En fondos oscuros la flecha pasa a blanco; en claros usa navy corporativo.
 */
export default function VolverArriba() {
  const [visible, setVisible] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();

  const updateState = useCallback(() => {
    setVisible(window.scrollY > 360);

    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const stack = document.elementsFromPoint(x, y);

    for (const el of stack) {
      if (!(el instanceof Element)) continue;
      if (el.closest("[data-volver-arriba]")) continue;

      const darkHint = isDarkSurface(el);
      if (darkHint === true) {
        setOnDark(true);
        return;
      }

      const lum = backgroundLuminance(el);
      if (lum !== null) {
        setOnDark(lum < 130);
        return;
      }
    }

    setOnDark(false);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState, { passive: true });
    updateState();
    return () => {
      window.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, [updateState]);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  return (
    <button
      ref={btnRef}
      type="button"
      data-volver-arriba
      aria-label="Volver al inicio de la página"
      onClick={scrollTop}
      className={`group fixed z-50 flex h-10 w-10 items-center justify-center transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:h-11 sm:w-11 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        right: "max(1rem, env(safe-area-inset-right, 0px))",
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-all duration-300 group-hover:-translate-y-0.5 group-active:scale-95 ${
          onDark ? "text-white" : "text-marca-navy"
        }`}
        aria-hidden
      >
        {!onDark && (
          <>
            <path d="M12 19V5" stroke="white" strokeWidth="4" />
            <path d="m5 12 7-7 7 7" stroke="white" strokeWidth="4" />
          </>
        )}
        <path d="M12 19V5" stroke="currentColor" strokeWidth="2.25" />
        <path d="m5 12 7-7 7 7" stroke="currentColor" strokeWidth="2.25" />
      </svg>
    </button>
  );
}

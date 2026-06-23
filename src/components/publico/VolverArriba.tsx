"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Botón flotante inferior derecho: flecha de contorno con sombra amplia.
 * Sin relleno sólido en la flecha; halo por drop-shadow para verse sobre cualquier fondo.
 */
export default function VolverArriba() {
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  return (
    <button
      type="button"
      aria-label="Volver al inicio de la página"
      onClick={scrollTop}
      className={`group fixed z-50 flex h-14 w-14 items-center justify-center transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:h-16 sm:w-16 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        right: "max(1rem, env(safe-area-inset-right, 0px))",
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-marca-navy transition-transform duration-300 group-hover:-translate-y-1 group-active:scale-95 sm:h-9 sm:w-9"
        style={{
          filter:
            "drop-shadow(0 0 8px rgba(255,255,255,1)) drop-shadow(0 0 16px rgba(255,255,255,0.85)) drop-shadow(0 8px 20px rgba(15,29,46,0.35)) drop-shadow(0 16px 40px rgba(15,29,46,0.25)) drop-shadow(0 24px 56px rgba(99,102,241,0.2))",
        }}
        aria-hidden
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useClientes } from "@/context/ClientesContext";

const UMBRAL_REFRESCO = 80;
const RESISTENCIA = 0.5;
const R = 10;
const C = 2 * Math.PI * R;
const STROKE = 2.2;

function scrollRoot(): HTMLElement | null {
  return document.querySelector("[data-rdc-scroll-root]");
}

function scrollTopActual(): number {
  const root = scrollRoot();
  return root ? root.scrollTop : window.scrollY;
}

/**
 * Pull-to-refresh móvil: círculo fino tipo Mercado Libre, sin fondo.
 * Al terminar, el mismo trazo se cierra y aparece palomita verde.
 */
export default function PullToRefresh() {
  const { recargarDesdeNube } = useClientes();
  const inicioYRef = useRef<number | null>(null);
  const [arrastre, setArrastre] = useState(0);
  const [refrescando, setRefrescando] = useState(false);
  const [listo, setListo] = useState(false);

  const refrescar = useCallback(async () => {
    setRefrescando(true);
    try {
      await recargarDesdeNube();
    } finally {
      setRefrescando(false);
      setArrastre(0);
      setListo(true);
      setTimeout(() => setListo(false), 1400);
    }
  }, [recargarDesdeNube]);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (scrollTopActual() > 4) return;
      if (refrescando || listo) return;
      inicioYRef.current = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (inicioYRef.current == null) return;
      const dy = e.touches[0].clientY - inicioYRef.current;
      if (dy <= 0) {
        setArrastre(0);
        return;
      }
      if (scrollTopActual() > 4) {
        inicioYRef.current = null;
        setArrastre(0);
        return;
      }
      const visual = Math.min(dy * RESISTENCIA, UMBRAL_REFRESCO * 1.8);
      setArrastre(visual);
      if (dy > 20 && e.cancelable) e.preventDefault();
    };
    const onEnd = () => {
      if (inicioYRef.current == null) return;
      const llegoAlUmbral = arrastre >= UMBRAL_REFRESCO;
      inicioYRef.current = null;
      if (llegoAlUmbral) {
        void refrescar();
      } else {
        setArrastre(0);
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [arrastre, refrescando, listo, refrescar]);

  const progreso = Math.min(arrastre / UMBRAL_REFRESCO, 1);
  const visible = arrastre > 4 || refrescando || listo;
  const dashOffset = C * (1 - Math.max(progreso, 0.08));

  return (
    <div
      aria-hidden
      className="lg:hidden fixed top-14 left-0 right-0 z-[60] flex justify-center pointer-events-none"
      style={{
        transform: `translateY(${
          refrescando || listo ? 12 : Math.min(arrastre * 0.55, 52) - 28
        }px)`,
        opacity: visible ? 1 : 0,
        transition: refrescando || listo
          ? "transform 200ms ease-out, opacity 200ms ease-out"
          : inicioYRef.current != null
            ? "opacity 100ms ease"
            : "transform 220ms ease, opacity 220ms ease",
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        className={refrescando ? "animate-spin" : ""}
      >
        <circle
          cx="12"
          cy="12"
          r={R}
          stroke={listo ? "#22c55e" : "#111111"}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={refrescando ? C * 0.72 : listo ? 0 : dashOffset}
          style={{
            transition: listo
              ? "stroke 220ms ease, stroke-dashoffset 280ms ease"
              : "stroke-dashoffset 80ms linear",
            transform: "rotate(-90deg)",
            transformOrigin: "12px 12px",
          }}
        />
        <path
          d="M7.4 12.2l3.1 3.1 6.2-6.4"
          stroke="#22c55e"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 18,
            strokeDashoffset: listo ? 0 : 18,
            opacity: listo ? 1 : 0,
            transition: "stroke-dashoffset 280ms ease 80ms, opacity 160ms ease",
          }}
        />
      </svg>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useClientes } from "@/context/ClientesContext";

const UMBRAL_REFRESCO = 80;
const RESISTENCIA = 0.5;

function scrollRoot(): HTMLElement | null {
  return document.querySelector("[data-rdc-scroll-root]");
}

function scrollTopActual(): number {
  const root = scrollRoot();
  return root ? root.scrollTop : window.scrollY;
}

/**
 * Pull-to-refresh móvil: barra fina bajo el header (estilo Mercado Libre),
 * no el spinner violeta.
 */
export default function PullToRefresh() {
  const { recargarDesdeNube } = useClientes();
  const inicioYRef = useRef<number | null>(null);
  const [arrastre, setArrastre] = useState(0);
  const [refrescando, setRefrescando] = useState(false);
  const [mostrarToastSync, setMostrarToastSync] = useState(false);

  const refrescar = useCallback(async () => {
    setRefrescando(true);
    try {
      await recargarDesdeNube();
    } finally {
      setRefrescando(false);
      setArrastre(0);
      setMostrarToastSync(true);
      setTimeout(() => setMostrarToastSync(false), 1200);
    }
  }, [recargarDesdeNube]);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (scrollTopActual() > 4) return;
      if (refrescando) return;
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
  }, [arrastre, refrescando, refrescar]);

  const progreso = Math.min(arrastre / UMBRAL_REFRESCO, 1);
  const visible = arrastre > 4 || refrescando || mostrarToastSync;

  return (
    <div
      aria-hidden
      className="lg:hidden fixed top-0 left-0 right-0 z-[60] pointer-events-none h-[2px] overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 160ms ease",
      }}
    >
      {refrescando ? (
        <div className="h-full w-[38%] bg-[var(--portal-navy,#1a164d)] rdc-refresh-indeterminate" />
      ) : mostrarToastSync ? (
        <div className="h-full w-full bg-emerald-500" />
      ) : (
        <div
          className="h-full bg-[var(--portal-navy,#1a164d)]"
          style={{ width: `${Math.max(progreso * 100, 8)}%` }}
        />
      )}
    </div>
  );
}

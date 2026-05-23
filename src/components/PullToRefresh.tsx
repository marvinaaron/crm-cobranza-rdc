"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useClientes } from "@/context/ClientesContext";

const UMBRAL_REFRESCO = 80;
const RESISTENCIA = 0.5;

function formatearUltimaSync(timestamp: number | null): string {
  if (timestamp == null) return "Sincronizando…";
  const diff = Date.now() - timestamp;
  if (diff < 5_000) return "Sincronizado ahora";
  if (diff < 60_000) return `Sincronizado hace ${Math.round(diff / 1000)}s`;
  if (diff < 3_600_000) return `Sincronizado hace ${Math.round(diff / 60_000)} min`;
  return `Sincronizado hace ${Math.round(diff / 3_600_000)} h`;
}

/**
 * Componente global que captura "pull to refresh" en móviles cuando la
 * página está en scrollY=0 y, al soltar pasada cierta distancia, recarga
 * datos desde la nube. Muestra un indicador con animación de spinner.
 */
export default function PullToRefresh() {
  const { recargarDesdeNube, ultimaSyncEn } = useClientes();
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
      setTimeout(() => setMostrarToastSync(false), 1600);
    }
  }, [recargarDesdeNube]);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (window.scrollY > 4) return;
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
      if (window.scrollY > 4) {
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
  const visible = arrastre > 4 || refrescando;
  const rotacion = refrescando ? "spin" : `${progreso * 270}deg`;

  return (
    <>
      <div
        aria-hidden
        className="lg:hidden fixed top-14 left-0 right-0 z-[40] flex justify-center pointer-events-none"
        style={{
          transform: `translateY(${refrescando ? 16 : Math.min(arrastre * 0.6, 60) - 30}px)`,
          opacity: visible ? 1 : 0,
          transition: refrescando
            ? "transform 200ms ease-out, opacity 200ms ease-out"
            : inicioYRef.current != null
              ? "opacity 100ms ease"
              : "transform 220ms ease, opacity 220ms ease",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-lg ring-1 ring-slate-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-violet-600 ${
              refrescando ? "animate-spin" : ""
            }`}
            style={
              refrescando
                ? undefined
                : { transform: `rotate(${rotacion})`, transition: "transform 80ms linear" }
            }
          >
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            {refrescando
              ? "Sincronizando…"
              : progreso >= 1
                ? "Suelta para actualizar"
                : "Desliza para actualizar"}
          </span>
        </div>
      </div>

      <div
        aria-live="polite"
        className="lg:hidden fixed top-16 left-1/2 -translate-x-1/2 z-[45] pointer-events-none"
        style={{
          opacity: mostrarToastSync ? 1 : 0,
          transform: mostrarToastSync
            ? "translate(-50%, 0)"
            : "translate(-50%, -8px)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600 text-white shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5 9-11" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {formatearUltimaSync(ultimaSyncEn)}
          </span>
        </div>
      </div>
    </>
  );
}

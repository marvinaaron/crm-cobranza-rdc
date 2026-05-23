"use client";

import { useEffect, useRef } from "react";

type Props = {
  onSwipeDesdeIzquierda?: () => void;
  onSwipeDesdeDerecha?: () => void;
  /** Distancia mínima horizontal (px) para considerar el gesto. */
  umbralPx?: number;
  /** Tolerancia vertical (px) — si Δy supera esto se cancela. */
  toleranciaVerticalPx?: number;
};

/**
 * Zonas invisibles en los bordes izquierdo y derecho de la pantalla
 * que capturan gestos de swipe hacia el centro. Solo se montan en
 * pantallas móviles (debajo de lg).
 *
 * Nota: la zona es estrecha (12px) para no interferir con el contenido,
 * y desactiva el back-swipe nativo del navegador al hacer preventDefault
 * en touchmove cuando el gesto es claramente horizontal.
 */
export default function EdgeSwipeZones({
  onSwipeDesdeIzquierda,
  onSwipeDesdeDerecha,
  umbralPx = 60,
  toleranciaVerticalPx = 60,
}: Props) {
  const izqRef = useRef<HTMLDivElement>(null);
  const derRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conectar = (
      el: HTMLDivElement | null,
      callback?: () => void,
      direccion: "der" | "izq" = "der"
    ) => {
      if (!el || !callback) return () => {};

      let startX: number | null = null;
      let startY: number | null = null;
      let bloqueado = false;

      const onStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        bloqueado = false;
      };
      const onMove = (e: TouchEvent) => {
        if (startX == null || startY == null) return;
        const dx = e.touches[0].clientX - startX;
        const dy = Math.abs(e.touches[0].clientY - startY);
        const movimientoEsperado = direccion === "der" ? dx > 0 : dx < 0;
        if (!movimientoEsperado) return;
        if (Math.abs(dx) > 10 && dy < toleranciaVerticalPx) {
          if (e.cancelable) e.preventDefault();
          if (!bloqueado && Math.abs(dx) > umbralPx) {
            bloqueado = true;
            callback();
          }
        }
      };
      const onEnd = () => {
        startX = null;
        startY = null;
        bloqueado = false;
      };

      el.addEventListener("touchstart", onStart, { passive: true });
      el.addEventListener("touchmove", onMove, { passive: false });
      el.addEventListener("touchend", onEnd, { passive: true });
      el.addEventListener("touchcancel", onEnd, { passive: true });

      return () => {
        el.removeEventListener("touchstart", onStart);
        el.removeEventListener("touchmove", onMove);
        el.removeEventListener("touchend", onEnd);
        el.removeEventListener("touchcancel", onEnd);
      };
    };

    const dispIzq = conectar(izqRef.current, onSwipeDesdeIzquierda, "der");
    const dispDer = conectar(derRef.current, onSwipeDesdeDerecha, "izq");
    return () => {
      dispIzq();
      dispDer();
    };
  }, [
    onSwipeDesdeIzquierda,
    onSwipeDesdeDerecha,
    umbralPx,
    toleranciaVerticalPx,
  ]);

  return (
    <>
      <div
        ref={izqRef}
        aria-hidden
        className="lg:hidden fixed top-14 bottom-0 left-0 w-3 z-[35] pointer-events-auto"
        style={{ touchAction: "pan-y" }}
      />
      <div
        ref={derRef}
        aria-hidden
        className="lg:hidden fixed top-14 bottom-0 right-0 w-3 z-[35] pointer-events-auto"
        style={{ touchAction: "pan-y" }}
      />
    </>
  );
}

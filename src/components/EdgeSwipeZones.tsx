"use client";

import { useEffect, useRef } from "react";

type Props = {
  onSwipeDesdeIzquierda?: () => void;
  onSwipeDesdeDerecha?: () => void;
  /** Progreso en vivo (px) mientras se arrastra desde el borde izquierdo. */
  onArrastreIzquierda?: (dx: number) => void;
  /** Se llama al soltar el dedo, con la distancia final (px). */
  onSoltarIzquierda?: (dx: number) => void;
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
 * El borde izquierdo además expone progreso en vivo para que el
 * consumidor pueda animar un drawer que siga el dedo.
 */
export default function EdgeSwipeZones({
  onSwipeDesdeIzquierda,
  onSwipeDesdeDerecha,
  onArrastreIzquierda,
  onSoltarIzquierda,
  umbralPx = 60,
  toleranciaVerticalPx = 60,
}: Props) {
  const izqRef = useRef<HTMLDivElement>(null);
  const derRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conectarSimple = (
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

    const conectarArrastreIzq = (el: HTMLDivElement | null) => {
      if (!el) return () => {};
      if (!onArrastreIzquierda && !onSoltarIzquierda && !onSwipeDesdeIzquierda) {
        return () => {};
      }

      let startX: number | null = null;
      let startY: number | null = null;
      let activo = false;
      let ultimoDx = 0;
      let umbralDisparado = false;

      const reset = () => {
        if (activo) {
          // SIEMPRE limpiamos al consumidor para que su state vuelva a null.
          onSoltarIzquierda?.(ultimoDx);
        }
        startX = null;
        startY = null;
        activo = false;
        ultimoDx = 0;
        umbralDisparado = false;
      };

      const onStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        activo = false;
        ultimoDx = 0;
        umbralDisparado = false;
      };
      const onMove = (e: TouchEvent) => {
        if (startX == null || startY == null) return;
        const dx = e.touches[0].clientX - startX;
        const dy = Math.abs(e.touches[0].clientY - startY);
        if (dx <= 0) return;

        if (!activo) {
          if (dx > 8 && dy < toleranciaVerticalPx) {
            activo = true;
          } else if (dy > toleranciaVerticalPx) {
            return;
          } else {
            return;
          }
        }

        if (e.cancelable) e.preventDefault();
        ultimoDx = dx;
        onArrastreIzquierda?.(dx);

        if (!umbralDisparado && dx > umbralPx) {
          umbralDisparado = true;
          onSwipeDesdeIzquierda?.();
        }
      };

      el.addEventListener("touchstart", onStart, { passive: true });
      el.addEventListener("touchmove", onMove, { passive: false });
      el.addEventListener("touchend", reset, { passive: true });
      el.addEventListener("touchcancel", reset, { passive: true });
      // Safety nets globales: si iOS se "roba" el gesto y NO dispara
      // touchend en el elemento, también escuchamos a nivel ventana.
      window.addEventListener("touchend", reset, { passive: true });
      window.addEventListener("touchcancel", reset, { passive: true });
      window.addEventListener("blur", reset);
      window.addEventListener("visibilitychange", reset);

      return () => {
        el.removeEventListener("touchstart", onStart);
        el.removeEventListener("touchmove", onMove);
        el.removeEventListener("touchend", reset);
        el.removeEventListener("touchcancel", reset);
        window.removeEventListener("touchend", reset);
        window.removeEventListener("touchcancel", reset);
        window.removeEventListener("blur", reset);
        window.removeEventListener("visibilitychange", reset);
      };
    };

    // Si el consumidor pidió arrastre en vivo, usamos la versión que
    // emite progreso. Si no, mantenemos el comportamiento simple.
    const dispIzq =
      onArrastreIzquierda || onSoltarIzquierda
        ? conectarArrastreIzq(izqRef.current)
        : conectarSimple(izqRef.current, onSwipeDesdeIzquierda, "der");
    const dispDer = conectarSimple(derRef.current, onSwipeDesdeDerecha, "izq");
    return () => {
      dispIzq();
      dispDer();
    };
  }, [
    onSwipeDesdeIzquierda,
    onSwipeDesdeDerecha,
    onArrastreIzquierda,
    onSoltarIzquierda,
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

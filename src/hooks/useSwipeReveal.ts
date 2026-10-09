"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Opciones = {
  /** Ancho (px) del panel de acciones que se revela al deslizar a la izquierda. */
  anchoAcciones: number;
  /** Distancia mínima (px) para considerar el gesto como "abrir/cerrar". */
  umbral?: number;
  /** Si está abierto desde fuera (control externo, ej. cerrar al abrir otra card). */
  abiertoExterno?: boolean;
  /** Callback cuando el usuario abre con swipe. */
  onAbrir?: () => void;
  /** Callback cuando el usuario cierra con swipe o al hacer tap fuera. */
  onCerrar?: () => void;
};

type SwipeBindings = {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
};

/**
 * Hook para implementar swipe-to-reveal estilo iOS Mail.
 *
 * Devuelve:
 *  - estiloFrontal: estilo a aplicar a la capa superior (la que se mueve).
 *  - bindings: handlers táctiles para anclar al wrapper de la card.
 *  - abierto: bool si el panel está revelado.
 *  - cerrar(): cierra programáticamente (ej. tras tocar una acción).
 *  - esArrastreActivo(): true si el dedo está en movimiento (sirve para distinguir tap vs swipe).
 */
export function useSwipeReveal({
  anchoAcciones,
  umbral = 30,
  abiertoExterno,
  onAbrir,
  onCerrar,
}: Opciones): {
  estiloFrontal: React.CSSProperties;
  bindings: SwipeBindings;
  abierto: boolean;
  cerrar: () => void;
  esArrastreActivo: () => boolean;
} {
  const [abierto, setAbierto] = useState(false);
  const [offset, setOffset] = useState(0);
  const inicioXRef = useRef<number | null>(null);
  const inicioYRef = useRef<number | null>(null);
  const arrastrandoRef = useRef(false);
  const bloqueadoEnVerticalRef = useRef(false);

  useEffect(() => {
    if (abiertoExterno === undefined) return;
    setAbierto(abiertoExterno);
    setOffset(abiertoExterno ? -anchoAcciones : 0);
  }, [abiertoExterno, anchoAcciones]);

  const cerrar = useCallback(() => {
    setAbierto(false);
    setOffset(0);
    onCerrar?.();
  }, [onCerrar]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    inicioXRef.current = t.clientX;
    inicioYRef.current = t.clientY;
    arrastrandoRef.current = false;
    bloqueadoEnVerticalRef.current = false;
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const t = e.touches[0];
      if (!t || inicioXRef.current === null || inicioYRef.current === null) return;
      const dx = t.clientX - inicioXRef.current;
      const dy = t.clientY - inicioYRef.current;

      if (!arrastrandoRef.current && !bloqueadoEnVerticalRef.current) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
          bloqueadoEnVerticalRef.current = true;
          return;
        }
        if (Math.abs(dx) > 8) {
          arrastrandoRef.current = true;
        }
      }

      if (bloqueadoEnVerticalRef.current) return;
      if (!arrastrandoRef.current) return;

      const base = abierto ? -anchoAcciones : 0;
      let nuevo = base + dx;
      if (nuevo > 0) nuevo = 0;
      if (nuevo < -anchoAcciones - 20) nuevo = -anchoAcciones - 20;
      setOffset(nuevo);
    },
    [abierto, anchoAcciones]
  );

  const onTouchEnd = useCallback(() => {
    if (bloqueadoEnVerticalRef.current || !arrastrandoRef.current) {
      inicioXRef.current = null;
      inicioYRef.current = null;
      arrastrandoRef.current = false;
      bloqueadoEnVerticalRef.current = false;
      return;
    }

    inicioXRef.current = null;
    inicioYRef.current = null;

    if (abierto) {
      if (offset > -anchoAcciones + umbral) {
        setAbierto(false);
        setOffset(0);
        onCerrar?.();
      } else {
        setOffset(-anchoAcciones);
      }
    } else {
      if (offset < -umbral) {
        setAbierto(true);
        setOffset(-anchoAcciones);
        onAbrir?.();
      } else {
        setOffset(0);
      }
    }

    setTimeout(() => {
      arrastrandoRef.current = false;
    }, 50);
  }, [abierto, offset, anchoAcciones, umbral, onAbrir, onCerrar]);

  const estiloFrontal: React.CSSProperties = {
    transform: `translateX(${offset}px)`,
    transition: arrastrandoRef.current ? "none" : "transform 200ms ease-out",
    willChange: "transform",
  };

  const esArrastreActivo = useCallback(() => arrastrandoRef.current, []);

  return {
    estiloFrontal,
    bindings: { onTouchStart, onTouchMove, onTouchEnd },
    abierto,
    cerrar,
    esArrastreActivo,
  };
}

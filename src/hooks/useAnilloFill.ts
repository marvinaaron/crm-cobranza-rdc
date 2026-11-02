"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Arranca el anillo vacío y, tras el primer pintado, anima hasta `pct`.
 * `delayMs` retrasa el arranque (stagger entre anillos).
 */
export function useAnilloFill(
  circunferencia: number,
  pct: number,
  delayMs = 0
): number {
  const reduce = usePrefersReducedMotion();
  const target =
    circunferencia * (1 - Math.max(0, Math.min(100, pct)) / 100);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (reduce) {
      setListo(true);
      return;
    }
    setListo(false);
    let inner = 0;
    let outer = 0;
    const start = window.setTimeout(() => {
      outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setListo(true));
      });
    }, Math.max(0, delayMs));
    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [reduce, delayMs, circunferencia]);

  return listo ? target : circunferencia;
}

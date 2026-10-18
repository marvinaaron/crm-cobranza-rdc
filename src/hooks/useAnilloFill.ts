"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Arranca el anillo vacío y, tras el primer pintado, anima hasta `pct`.
 * Cambios posteriores de porcentaje interpolan desde el valor actual.
 */
export function useAnilloFill(circunferencia: number, pct: number): number {
  const reduce = usePrefersReducedMotion();
  const target =
    circunferencia * (1 - Math.max(0, Math.min(100, pct)) / 100);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (reduce) {
      setListo(true);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setListo(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [reduce]);

  return listo ? target : circunferencia;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Anima un número de 0 (o del valor actual) hasta `target`.
 * Reduced-motion → valor final al instante.
 */
export function useCountUp(
  target: number,
  opts?: { durationMs?: number }
): number {
  const reduce = usePrefersReducedMotion();
  const durationMs = opts?.durationMs ?? 650;
  const [valor, setValor] = useState(reduce ? target : 0);
  const valorRef = useRef(valor);
  valorRef.current = valor;

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setValor(0);
      return;
    }
    if (reduce || durationMs <= 0) {
      setValor(target);
      return;
    }

    const desde = valorRef.current;
    if (desde === target) return;

    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      /* ease-out cubic — mismo espíritu que --portal-ease-out */
      const eased = 1 - (1 - t) ** 3;
      const next = desde + (target - desde) * eased;
      setValor(t >= 1 ? target : next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduce, durationMs]);

  return valor;
}

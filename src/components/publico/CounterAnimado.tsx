"use client";

/**
 * Contador animado estilo "máquina de casino".
 *
 * Tres fases:
 *  1. Spin rápido — números aleatorios entre 0 y ~1.5× target. El intervalo
 *     entre updates es corto (~55 ms) para sentir el "vértigo".
 *  2. Desaceleración — el valor se acerca al target con ruido decreciente.
 *     El intervalo de update crece para sentir que el rodillo se frena.
 *  3. Settle con overshoot — pasa 1-2 unidades el target, luego se asienta.
 *
 * Se dispara una sola vez al entrar al viewport (IntersectionObserver) y
 * respeta `prefers-reduced-motion`.
 */

import { useEffect, useRef, useState } from "react";

type Props = {
  target: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
  /** Threshold para IntersectionObserver (0..1). 0.4 = 40% visible para empezar. */
  threshold?: number;
};

const PHASE_SPIN_END = 0.5;
const PHASE_APPROACH_END = 0.85;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Calcula el valor que debe mostrar el contador para un progreso t (0..1).
 * Usa `seed` para producir ruido pseudoaleatorio reproducible por tick.
 */
function casinoValue(t: number, target: number, seed: number): number {
  if (t >= 1) return target;

  // Sin(seed) es pseudoaleatorio entre -1 y 1; lo llevamos a 0..1.
  const rand = (Math.sin(seed * 12.9898) * 43758.5453) % 1;
  const noise01 = Math.abs(rand);

  if (t < PHASE_SPIN_END) {
    // Spin rápido: valores entre 0 y ~1.5x target.
    return Math.floor(noise01 * Math.max(target * 1.5, target + 3));
  }

  if (t < PHASE_APPROACH_END) {
    // Aproximación: target * eased ± ruido decreciente.
    const local = (t - PHASE_SPIN_END) / (PHASE_APPROACH_END - PHASE_SPIN_END);
    const eased = easeOutCubic(local);
    const range = Math.max(1, Math.round((1 - eased) * target * 0.4));
    const noise = Math.round((noise01 - 0.5) * 2 * range);
    return Math.max(0, Math.round(target * eased) + noise);
  }

  // Settle con overshoot: pasa 1-2 unidades y regresa.
  const settle = (t - PHASE_APPROACH_END) / (1 - PHASE_APPROACH_END);
  const overshootAmount = Math.max(1, Math.round(target * 0.08));
  const overshoot = Math.sin(settle * Math.PI) * overshootAmount;
  return Math.round(target + overshoot * (1 - settle * 0.6));
}

export default function CounterAnimado({
  target,
  prefix = "",
  suffix = "",
  durationMs = 2500,
  className,
  threshold = 0.4,
}: Props) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(target);
      started.current = true;
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            observer.disconnect();

            const start = performance.now();
            let lastTick = 0;
            let seed = 0;

            const tick = (now: number) => {
              const elapsed = now - start;
              const t = Math.min(1, elapsed / durationMs);

              // Intervalo entre updates: 55 ms al inicio, hasta 130 ms al final.
              // Esto crea la sensación de rodillo que se frena.
              const interval = 55 + Math.pow(t, 2) * 75;

              if (now - lastTick >= interval || t >= 1) {
                lastTick = now;
                seed += 1;
                setValue(casinoValue(t, target, seed));
              }

              if (t < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, durationMs, threshold]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

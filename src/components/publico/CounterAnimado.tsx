"use client";

/**
 * Contador animado que cuenta de 0 al valor target cuando el elemento
 * entra al viewport. Se dispara una sola vez por sesión.
 *
 * Usa easing cubic-out para que termine suave en lugar de cortar de golpe.
 * Respeta `prefers-reduced-motion`: si el usuario tiene la preferencia
 * activada, muestra el valor final sin animar.
 */

import { useEffect, useRef, useState } from "react";

type Props = {
  target: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
  /** Threshold para IntersectionObserver (0..1). 0.4 = se ve 40% para empezar. */
  threshold?: number;
};

export default function CounterAnimado({
  target,
  prefix = "",
  suffix = "",
  durationMs = 1400,
  className,
  threshold = 0.4,
}: Props) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // Respeta prefers-reduced-motion
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
            const start = performance.now();
            const animate = (now: number) => {
              const elapsed = now - start;
              const t = Math.min(1, elapsed / durationMs);
              // ease-out cubic
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(Math.round(target * eased));
              if (t < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
            observer.disconnect();
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

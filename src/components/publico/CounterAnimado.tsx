"use client";

/**
 * Contador animado estilo "rodillo de máquina de casino".
 *
 * Cada dígito del target se renderiza como un rodillo vertical (column de
 * 0..9 stackeada). Al entrar al viewport, los rodillos giran hacia abajo
 * con `cubic-bezier(.16, 1, .3, 1)` (ease-out muy fuerte) hasta detenerse
 * exactamente en el dígito final.
 *
 * Por estética slot machine clásica:
 *  - El dígito de la derecha hace más vueltas y dura más → se detiene al
 *    último, como las reels reales.
 *  - El de la izquierda hace menos vueltas y se detiene primero.
 *
 * Respeta `prefers-reduced-motion`: si está activo, muestra el valor final
 * sin animar.
 */

import { useEffect, useRef, useState } from "react";

type Props = {
  target: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
  /** Threshold del IntersectionObserver (0..1). 0.4 = 40% visible para iniciar. */
  threshold?: number;
};

function Reel({
  targetDigit,
  duration,
  cycles,
}: {
  targetDigit: number;
  duration: number;
  cycles: number;
}) {
  const finalPos = cycles * 10 + targetDigit;
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Empieza desde 0 y en el siguiente frame activa la transición a finalPos.
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setActive(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span
      className="inline-block overflow-hidden"
      style={{
        height: "1em",
        lineHeight: 1,
        verticalAlign: "baseline",
      }}
    >
      <span
        className="inline-block"
        style={{
          transform: `translateY(-${active ? finalPos : 0}em)`,
          transition: active
            ? `transform ${duration}ms cubic-bezier(.16, 1, .3, 1)`
            : "none",
          willChange: "transform",
        }}
      >
        {Array.from({ length: finalPos + 1 }).map((_, i) => (
          <span
            key={i}
            className="block"
            style={{ height: "1em", lineHeight: 1 }}
          >
            {i % 10}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function CounterAnimado({
  target,
  prefix = "",
  suffix = "",
  durationMs = 2400,
  className,
  threshold = 0.4,
}: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const digits = Math.max(0, Math.floor(target)).toString().split("").map(Number);
  const ariaLabel = `${prefix}${target}${suffix}`;

  if (!visible) {
    // Placeholder con 0s — mismo ancho que el target final, evita layout shift.
    return (
      <span ref={ref} className={className} aria-label={ariaLabel}>
        {prefix}
        <span aria-hidden="true">{digits.map(() => "0").join("")}</span>
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={className} aria-label={ariaLabel}>
      {prefix}
      <span aria-hidden="true">
        {digits.map((d, i) => {
          // El dígito más a la derecha (i = last) gira más y se detiene al último.
          const distanceFromRight = digits.length - 1 - i;
          const cycles = 3 + (digits.length - 1 - distanceFromRight);
          const extra = (digits.length - 1 - distanceFromRight) * 350;
          return (
            <Reel
              key={`${digits.length}-${i}`}
              targetDigit={d}
              duration={durationMs + extra}
              cycles={cycles}
            />
          );
        })}
      </span>
      {suffix}
    </span>
  );
}

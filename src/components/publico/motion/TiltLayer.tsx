"use client";

import { useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Grados máximos de inclinación (desktop). */
  maxTilt?: number;
  /** Solo activar en lg+ por defecto. */
  desktopOnly?: boolean;
};

/** Inclinación 3D suave siguiendo el cursor (estilo Apple product shots). */
export default function TiltLayer({
  children,
  className = "",
  maxTilt = 7,
  desktopOnly = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  }

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    if (desktopOnly && window.innerWidth < 1024) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1200px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale3d(1.02,1.02,1.02)`;
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`transition-transform duration-300 ease-out will-change-transform [transform-style:preserve-3d] motion-reduce:transform-none ${className}`}
    >
      {children}
    </div>
  );
}

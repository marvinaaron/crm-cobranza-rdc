"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Factor de desplazamiento vertical con scroll (0.05 = sutil). */
  speed?: number;
  /** Desplazamiento extra con el mouse (solo desktop). */
  mouseFactor?: number;
};

/** Capa con parallax al scroll y micro-movimiento con el cursor. */
export default function ParallaxLayer({
  children,
  className = "",
  speed = 0.06,
  mouseFactor = 12,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const scrollY = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    let raf = 0;

    const apply = () => {
      const el = ref.current;
      if (!el) return;
      const sy = scrollY.current * speed;
      const mx = mouse.current.x * mouseFactor;
      const my = mouse.current.y * mouseFactor;
      el.style.transform = `translate3d(${mx}px, ${sy + my}px, 0)`;
    };

    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const section = el.closest("[data-parallax-root]");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      scrollY.current = -rect.top;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    const onMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      const el = ref.current;
      if (!el) return;
      const section = el.closest("[data-parallax-root]");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      mouse.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      };
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced, speed, mouseFactor]);

  return (
    <div
      ref={ref}
      className={`will-change-transform motion-reduce:transform-none ${className}`}
    >
      {children}
    </div>
  );
}

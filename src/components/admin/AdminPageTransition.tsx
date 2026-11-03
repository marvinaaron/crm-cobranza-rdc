"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
const MS = 220;

/**
 * Entrada suave al montar la página admin (evita el “pop” seco tras el skeleton).
 */
export default function AdminPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const ref = useRef<HTMLDivElement>(null);
  const primero = useRef(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (primero.current) {
      primero.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    el.getAnimations().forEach((a) => a.cancel());
    el.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: MS, easing: EASE, fill: "both" }
    );
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}

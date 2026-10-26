"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
const MS = 280;

/**
 * Crossfade + leve lift al entrar a una ruta pública.
 * Evita el “pop” seco después del menú / links del header.
 */
export default function PublicPageTransition({
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
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: MS, easing: EASE, fill: "both" }
    );
  }, [pathname]);

  return (
    <div ref={ref} className="rdc-page-enter">
      {children}
    </div>
  );
}

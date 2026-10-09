"use client";

import { useEffect, useState } from "react";

/** true cuando el viewport es menor que el breakpoint lg de Tailwind (1024px). */
export function useEsMovil(breakpointPx = 1024) {
  const [esMovil, setEsMovil] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const actualizar = () => setEsMovil(mq.matches);
    actualizar();
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, [breakpointPx]);

  return esMovil;
}

"use client";

import { useEffect, useState } from "react";

/** Viewport menor a lg (1024px), alineado con breakpoints del portal. */
export function usePortalEsMovil() {
  const [movil, setMovil] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setMovil(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return movil;
}

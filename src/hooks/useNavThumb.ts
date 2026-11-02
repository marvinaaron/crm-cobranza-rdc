"use client";

import { useCallback, useLayoutEffect, useState, type RefObject } from "react";

export type NavThumb = { top: number; left: number; width: number; height: number };

/**
 * Pastilla deslizante sobre el ítem `[aria-current="page"]` dentro de `trackRef`.
 * Mide con getBoundingClientRect para tolerar scroll y grupos que se abren.
 */
export function useNavThumb(
  trackRef: RefObject<HTMLElement | null>,
  deps: unknown[] = []
) {
  const [thumb, setThumb] = useState<NavThumb>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [on, setOn] = useState(false);

  const medir = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const activo =
      track.querySelector<HTMLElement>('[data-nav-current="true"]') ??
      track.querySelector<HTMLElement>('[aria-current="page"]');
    if (!activo) {
      setOn(false);
      return;
    }
    const t = track.getBoundingClientRect();
    const a = activo.getBoundingClientRect();
    setThumb({
      top: a.top - t.top + track.scrollTop,
      left: a.left - t.left + track.scrollLeft,
      width: a.width,
      height: a.height,
    });
    setOn(true);
  }, [trackRef]);

  useLayoutEffect(() => {
    medir();
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(medir);
    ro.observe(track);
    track.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      ro.disconnect();
      track.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps del caller (ruta, colapso, grupos)
  }, [medir, trackRef, ...deps]);

  return { thumb, on, medir };
}

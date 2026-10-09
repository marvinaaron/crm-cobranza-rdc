"use client";

import { useEffect } from "react";

/** Bloquea el scroll del documento (incl. iOS) mientras `locked` es true. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const htmlOverflow = document.documentElement.style.overflow;
    const { overflow, position, top, width } = document.body.style;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.width = width;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

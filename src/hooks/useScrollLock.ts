"use client";

import { useEffect } from "react";

/**
 * Bloquea el scroll de fondo mientras hay un overlay abierto.
 *
 * En admin el scroller real es `[data-rdc-scroll-root]` (el <main>), no el
 * body: `overflow: hidden` en body no basta. En portal/iOS el documento sí
 * scrollea, y hace falta `position: fixed` para cortar el rubber-band.
 *
 * Varios overlays pueden apilarse: el lock usa un contador.
 */
let lockCount = 0;
let applied = false;
let startY = 0;

type RootSnap = { el: HTMLElement; overflow: string; overscroll: string };
type Snapshot = {
  htmlOverflow: string;
  htmlOverscroll: string;
  bodyOverflow: string;
  bodyOverscroll: string;
  bodyPosition: string;
  bodyTop: string;
  bodyWidth: string;
  bodyLeft: string;
  bodyRight: string;
  bodyPaddingRight: string;
  scrollY: number;
  usedFixed: boolean;
  gutter: number;
  roots: RootSnap[];
};

let snapshot: Snapshot | null = null;

function esScrollable(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const oy = style.overflowY;
  const ox = style.overflowX;
  const permiteY = oy === "auto" || oy === "scroll" || oy === "overlay";
  const permiteX = ox === "auto" || ox === "scroll" || ox === "overlay";
  return (
    (permiteY && el.scrollHeight > el.clientHeight + 1) ||
    (permiteX && el.scrollWidth > el.clientWidth + 1)
  );
}

function scrollerPermitido(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  let el: HTMLElement | null =
    target instanceof HTMLElement ? target : target.parentElement;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.hasAttribute("data-rdc-scroll-allow") || esScrollable(el)) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

function enBordeVertical(el: HTMLElement, dy: number): boolean {
  const atTop = el.scrollTop <= 0;
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
  return (dy > 0 && atTop) || (dy < 0 && atBottom);
}

function onTouchStart(e: TouchEvent) {
  startY = e.touches[0]?.clientY ?? 0;
}

function onTouchMove(e: TouchEvent) {
  const scroller = scrollerPermitido(e.target);
  if (!scroller) {
    e.preventDefault();
    return;
  }
  if (!esScrollable(scroller)) return;
  const y = e.touches[0]?.clientY ?? startY;
  if (enBordeVertical(scroller, y - startY)) {
    e.preventDefault();
  }
}

function onWheel(e: WheelEvent) {
  const scroller = scrollerPermitido(e.target);
  if (!scroller) {
    e.preventDefault();
    return;
  }
  if (!esScrollable(scroller)) return;
  if (enBordeVertical(scroller, -e.deltaY)) {
    e.preventDefault();
  }
}

function applyLock() {
  if (applied) return;
  const html = document.documentElement;
  const body = document.body;
  const roots = Array.from(
    document.querySelectorAll<HTMLElement>("[data-rdc-scroll-root]")
  );
  const scrollY = window.scrollY;
  const usedFixed = roots.length === 0;
  // Compensa el gutter del scrollbar para que el layout no “salte” al abrir overlays.
  const gutter = Math.max(0, window.innerWidth - html.clientWidth);

  snapshot = {
    htmlOverflow: html.style.overflow,
    htmlOverscroll: html.style.overscrollBehavior,
    bodyOverflow: body.style.overflow,
    bodyOverscroll: body.style.overscrollBehavior,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyWidth: body.style.width,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyPaddingRight: body.style.paddingRight,
    scrollY,
    usedFixed,
    gutter,
    roots: roots.map((el) => ({
      el,
      overflow: el.style.overflow,
      overscroll: el.style.overscrollBehavior,
    })),
  };

  html.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  html.classList.add("rdc-scroll-locked");
  html.style.setProperty("--rdc-lock-gutter", `${gutter}px`);

  // box-sizing + padding: el gutter no ensancha el layout al quitar el scrollbar.
  // Los fixed (header) usan la misma var vía [data-rdc-lock-pad].
  if (gutter > 0) {
    const actual = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.boxSizing = "border-box";
    body.style.paddingRight = `${actual + gutter}px`;
  }

  if (usedFixed) {
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "auto";
    body.style.width = gutter > 0 ? `calc(100% - ${gutter}px)` : "100%";
  }

  for (const r of snapshot.roots) {
    r.el.style.overflow = "hidden";
    r.el.style.overscrollBehavior = "none";
  }

  document.addEventListener("touchstart", onTouchStart, {
    passive: true,
    capture: true,
  });
  document.addEventListener("touchmove", onTouchMove, {
    passive: false,
    capture: true,
  });
  document.addEventListener("wheel", onWheel, { passive: false, capture: true });
  applied = true;
}

function releaseLock() {
  if (!applied || !snapshot) return;
  const html = document.documentElement;
  const body = document.body;
  const snap = snapshot;

  html.style.overflow = snap.htmlOverflow;
  html.style.overscrollBehavior = snap.htmlOverscroll;
  body.style.overflow = snap.bodyOverflow;
  body.style.overscrollBehavior = snap.bodyOverscroll;
  body.style.paddingRight = snap.bodyPaddingRight;
  html.classList.remove("rdc-scroll-locked");
  html.style.removeProperty("--rdc-lock-gutter");

  if (snap.usedFixed) {
    body.style.position = snap.bodyPosition;
    body.style.top = snap.bodyTop;
    body.style.width = snap.bodyWidth;
    body.style.left = snap.bodyLeft;
    body.style.right = snap.bodyRight;
    window.scrollTo(0, snap.scrollY);
  }

  for (const r of snap.roots) {
    r.el.style.overflow = r.overflow;
    r.el.style.overscrollBehavior = r.overscroll;
  }

  document.removeEventListener("touchstart", onTouchStart, true);
  document.removeEventListener("touchmove", onTouchMove, true);
  document.removeEventListener("wheel", onWheel, true);
  snapshot = null;
  applied = false;
}

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount += 1;
    applyLock();
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) releaseLock();
    };
  }, [locked]);
}

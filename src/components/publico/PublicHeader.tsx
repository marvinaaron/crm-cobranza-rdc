"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";
import AccesoMenu from "./AccesoMenu";
import Logo from "./Logo";
import Buscador from "./Buscador";
import PublicMegaMenuPanel from "./PublicMegaMenuPanel";
import {
  NAV_LINKS_SIMPLES,
  NAV_MEGA_MENUS,
  type MegaMenuBlogReciente,
  type MegaMenuConfig,
} from "@/lib/public-nav";
import "./public-header.css";

function IconoCarrito() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconoRayo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export default function PublicHeader({
  blogRecientes = [],
}: {
  blogRecientes?: MegaMenuBlogReciente[];
}) {
  const pathname = usePathname() ?? "/";
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuMontado, setMenuMontado] = useState(false);
  const [megaAbierto, setMegaAbierto] = useState<string | null>(null);
  const [megaMovil, setMegaMovil] = useState<string | null>(null);
  const [montado, setMontado] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuTop, setMenuTop] = useState(
    "calc(4rem + env(safe-area-inset-top, 0px))"
  );
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuSheetRef = useRef<HTMLDivElement>(null);
  const menuVeilRef = useRef<HTMLButtonElement>(null);
  const menuCerrandoRef = useRef(false);
  const MENU_MS = 900;
  const MENU_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
  // Solo el mega a pantalla completa usa lock “fixed”.
  useScrollLock(Boolean(megaMovil));

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!menuMontado) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const blockTouch = (e: TouchEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest("[data-rdc-scroll-allow]")) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", blockTouch, { passive: false });
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      document.removeEventListener("touchmove", blockTouch);
    };
  }, [menuMontado]);

  useEffect(() => {
    const onScroll = () => {
      if (document.documentElement.classList.contains("rdc-scroll-locked")) {
        return;
      }
      setScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    if (!menuMontado) return;
    const medir = () => {
      const bottom = headerRef.current?.getBoundingClientRect().bottom;
      if (bottom != null && bottom > 0) setMenuTop(`${bottom}px`);
    };
    medir();
    const raf = window.requestAnimationFrame(medir);
    window.addEventListener("resize", medir);
    window.visualViewport?.addEventListener("resize", medir);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", medir);
      window.visualViewport?.removeEventListener("resize", medir);
    };
  }, [menuMontado]);

  const preferReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const abrirMenu = () => {
    menuCerrandoRef.current = false;
    setMenuMontado(true);
    setMenuAbierto(true);
  };

  const cerrarMenu = (instante = false) => {
    if (!menuMontado || menuCerrandoRef.current) return;
    setMenuAbierto(false);
    const sheet = menuSheetRef.current;
    const veil = menuVeilRef.current;
    if (instante || preferReducedMotion() || !sheet?.animate) {
      menuCerrandoRef.current = false;
      setMenuMontado(false);
      return;
    }
    menuCerrandoRef.current = true;
    sheet.getAnimations().forEach((a) => a.cancel());
    veil?.getAnimations().forEach((a) => a.cancel());
    veil?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: MENU_MS * 0.55,
      easing: "ease",
      fill: "forwards",
    });
    /* Cortina siempre sólida: solo translateY (sin fade de opacity). */
    const anim = sheet.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }],
      { duration: MENU_MS, easing: MENU_EASE, fill: "forwards" }
    );
    anim.onfinish = () => {
      menuCerrandoRef.current = false;
      setMenuMontado(false);
    };
  };

  /* Cortina al abrir. */
  useLayoutEffect(() => {
    if (!menuAbierto || !menuMontado || menuCerrandoRef.current) return;
    const el = menuSheetRef.current;
    const veil = menuVeilRef.current;
    if (!el || typeof el.animate !== "function") return;
    if (preferReducedMotion()) return;
    el.getAnimations().forEach((a) => a.cancel());
    veil?.getAnimations().forEach((a) => a.cancel());
    veil?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: MENU_MS * 0.45,
      easing: "ease",
      fill: "both",
    });
    el.animate(
      [{ transform: "translateY(-100%)" }, { transform: "translateY(0)" }],
      { duration: MENU_MS, easing: MENU_EASE, fill: "both" }
    );
  }, [menuAbierto, menuMontado]);

  /* Al navegar: cierra mega al instante; la cortina cierra con el mismo ease (no pop). */
  useEffect(() => {
    setMegaAbierto(null);
    setMegaMovil(null);
    if (menuMontado && !menuCerrandoRef.current) {
      cerrarMenu();
      return;
    }
    setMenuAbierto(false);
    setMenuMontado(false);
    menuCerrandoRef.current = false;
    // Solo al cambiar ruta (no re-disparar por menuMontado).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!megaMovil) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaMovil(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [megaMovil]);

  useEffect(() => {
    if (!megaAbierto && !menuMontado) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaAbierto(null);
        cerrarMenu();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [megaAbierto, menuMontado]);

  useEffect(() => {
    if (!megaAbierto) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMegaAbierto(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [megaAbierto]);

  const esActivo = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const esMegaActivo = (config: MegaMenuConfig) => {
    if (esActivo(config.href)) return true;
    return config.sections.some((s) => s.items.some((i) => esActivo(i.href)));
  };

  const cerrarMega = () => {
    setMegaAbierto(null);
    setMegaMovil(null);
  };

  const abrirHover = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaAbierto(id);
  };

  const cancelarCierreHover = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const cerrarHoverEventual = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaAbierto(null), 280);
  };

  const megaConfig =
    NAV_MEGA_MENUS.find((m) => m.id === megaAbierto || m.id === megaMovil) ?? null;

  const megaDesktopConfig =
    NAV_MEGA_MENUS.find((m) => m.id === megaAbierto) ?? null;

  const menuMovilPortal =
    montado && menuMontado
      ? createPortal(
          <div className="lg:hidden" data-rdc-lock-pad="">
            <button
              ref={menuVeilRef}
              type="button"
              className="rdc-menu-veil fixed inset-x-0 bottom-0 z-[330] bg-marca-navy/25"
              style={{ top: menuTop }}
              aria-label="Cerrar menú"
              onClick={() => cerrarMenu()}
            />
            <div
              ref={menuSheetRef}
              className="rdc-menu-sheet fixed inset-x-0 z-[340] max-h-[min(70dvh,calc(100dvh-5.5rem))] overflow-y-auto rounded-b-[1.75rem] bg-white px-6 py-3 pb-5 shadow-[0_18px_36px_-2px_rgba(15,23,42,0.22)] sm:px-8"
              style={{ top: menuTop }}
              data-rdc-scroll-allow=""
              role="navigation"
              aria-label="Menú del sitio"
            >
              <div className="rdc-menu-list space-y-2">
                {NAV_MEGA_MENUS.map((config, i) => (
                  <button
                    key={config.id}
                    type="button"
                    style={{ ["--rdc-menu-i" as string]: i }}
                    onClick={() => {
                      setMenuAbierto(false);
                      setMenuMontado(false);
                      menuCerrandoRef.current = false;
                      setMegaMovil(config.id);
                    }}
                    className="rdc-menu-item flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-slate-800"
                  >
                    {config.label}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="rdc-menu-item-chevron"
                      aria-hidden
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
                {NAV_LINKS_SIMPLES.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      ["--rdc-menu-i" as string]: NAV_MEGA_MENUS.length + i,
                    }}
                    onClick={() => cerrarMenu()}
                    className="rdc-menu-item block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mx-1 mt-2 grid grid-cols-2 gap-2">
                  <Link
                    href="/cotizar"
                    onClick={() => cerrarMenu()}
                    className="rdc-menu-cta inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-800"
                  >
                    <IconoCarrito />
                    Cotizar
                  </Link>
                  <Link
                    href="/empezar"
                    onClick={() => cerrarMenu()}
                    className="rdc-menu-cta inline-flex items-center justify-center gap-1.5 rounded-lg bg-marca-navy px-3 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    <IconoRayo />
                    Empezar
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const megaMovilPortal =
    montado && megaConfig && megaMovil
      ? createPortal(
          <div className="rdc-mega-movil fixed inset-0 z-[350] flex flex-col bg-white lg:hidden">
            <div className="rdc-mega-movil-bar flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
              <p className="text-sm font-bold text-slate-900">{megaConfig.label}</p>
              <button
                type="button"
                onClick={cerrarMega}
                className="rdc-nav-hover rounded-lg p-2 text-slate-600"
                aria-label="Cerrar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="rdc-mega-movil-body flex-1 overflow-y-auto">
              <PublicMegaMenuPanel
                config={megaConfig}
                pathname={pathname}
                blogRecientes={blogRecientes}
                onNavigate={() => {
                  cerrarMega();
                  setMenuAbierto(false);
                  setMenuMontado(false);
                  menuCerrandoRef.current = false;
                }}
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {/*
        Móvil: fixed (como portal/admin). sticky + scroll-lock (body fixed)
        sacaba el header de la pantalla en Cotizar y el menú quedaba flotando.
        Escritorio: sticky; el mega menú absoluto cuelga de este stacking.
      */}
      <header
        ref={headerRef}
        data-rdc-lock-pad=""
        data-menu={menuMontado ? "" : undefined}
        data-scrolled={scrolled ? "" : undefined}
        className={`rdc-ph overflow-visible pt-[env(safe-area-inset-top)] max-lg:fixed max-lg:inset-x-0 max-lg:top-0 lg:sticky lg:top-0 lg:z-[150] lg:border-b lg:border-slate-200 lg:bg-white lg:shadow-sm ${
          menuMontado ? "z-[350]" : "z-[150]"
        }`}
        onMouseLeave={cerrarHoverEventual}
        onMouseEnter={cancelarCierreHover}
      >
        <div className="w-full max-w-[88rem] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="rdc-ph-row flex items-center justify-between gap-6">
            <Link
              href="/"
              className="rdc-ph-brand flex items-center gap-3 group shrink-0 ml-3 sm:ml-5 lg:ml-8"
              aria-label="RDC Contadores · Inicio"
              onClick={cerrarMega}
            >
              <span className="rdc-ph-logo" aria-hidden>
                <Logo
                  mark="rdc"
                  variante="black"
                  alto={28}
                  className="rdc-ph-logo-rdc"
                />
                <Logo
                  mark="r"
                  variante="black"
                  alto={26}
                  className="rdc-ph-logo-r"
                />
              </span>
              <div className="rdc-ph-brand-copy leading-tight hidden sm:block">
                <p className="text-sm font-black text-marca-navy">Contadores</p>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                  Despacho contable y fiscal
                </p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_MEGA_MENUS.map((config) => {
                const abierto = megaAbierto === config.id;
                const activo = esMegaActivo(config);
                return (
                  <div key={config.id} onMouseEnter={() => abrirHover(config.id)}>
                    <button
                      type="button"
                      onClick={() => setMegaAbierto(abierto ? null : config.id)}
                      className={`rdc-nav-hover inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        abierto || activo
                          ? "text-marca-navy bg-marca-navy/5 font-semibold"
                          : "text-slate-600"
                      }`}
                      aria-haspopup="true"
                      aria-expanded={abierto}
                    >
                      {config.label}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`text-slate-400 transition-transform ${abierto ? "rotate-180" : ""}`}
                        aria-hidden
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                );
              })}
              {NAV_LINKS_SIMPLES.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={cerrarMega}
                  className={`rdc-nav-hover px-3 py-2 rounded-lg text-sm font-medium ${
                    esActivo(item.href)
                      ? "text-marca-navy bg-marca-navy/5 font-semibold"
                      : "text-slate-600"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0 pl-2">
              <Buscador />
              <Link
                href="/cotizar"
                className="rdc-nav-hover rdc-nav-hover-cta inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 whitespace-nowrap"
                onClick={cerrarMega}
              >
                <IconoCarrito />
                Cotizar
              </Link>
              <Link
                href="/empezar"
                className="rdc-nav-hover rdc-nav-hover-solid inline-flex items-center justify-center gap-1.5 rounded-lg bg-marca-navy px-4 py-2 text-sm font-semibold text-white whitespace-nowrap"
                onClick={cerrarMega}
              >
                <IconoRayo />
                Empezar
              </Link>
              <AccesoMenu />
            </div>

            <div className="rdc-ph-actions-end lg:hidden" aria-label="Acciones">
              <div className="rdc-ph-tools-grid">
                <div className="rdc-ph-tool">
                  <Buscador />
                </div>
                <div className="rdc-ph-tool">
                  <AccesoMenu
                    variante="icono"
                    onAbrir={() => cerrarMenu(true)}
                  />
                </div>
                <div className="rdc-ph-tool">
                  <button
                    type="button"
                    onClick={() =>
                      menuAbierto || menuMontado ? cerrarMenu() : abrirMenu()
                    }
                    className="rdc-burger-btn"
                    aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={menuAbierto}
                  >
                    <span
                      className="rdc-burger"
                      data-open={menuAbierto ? "" : undefined}
                      aria-hidden
                    >
                      <span className="rdc-burger-line" data-a="" />
                      <span className="rdc-burger-line" data-b="" />
                      <span className="rdc-burger-line" data-c="" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {megaDesktopConfig ? (
          <div className="hidden lg:block absolute left-0 right-0 top-full z-10 overflow-visible">
            <PublicMegaMenuPanel
              config={megaDesktopConfig}
              pathname={pathname}
              blogRecientes={blogRecientes}
              onNavigate={cerrarMega}
            />
          </div>
        ) : null}
      </header>
      {/* Reserva el alto del chrome fijo en móvil para que el contenido no quede debajo. */}
      <div
        className="lg:hidden shrink-0"
        style={{ height: "calc(4rem + env(safe-area-inset-top, 0px))" }}
        aria-hidden
      />

      {menuMovilPortal}
      {megaMovilPortal}
    </>
  );
}

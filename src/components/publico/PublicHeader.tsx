"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

export default function PublicHeader({
  blogRecientes = [],
}: {
  blogRecientes?: MegaMenuBlogReciente[];
}) {
  const pathname = usePathname() ?? "/";
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [megaAbierto, setMegaAbierto] = useState<string | null>(null);
  const [megaMovil, setMegaMovil] = useState<string | null>(null);
  const [montado, setMontado] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    setMegaAbierto(null);
    setMegaMovil(null);
    setMenuAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!megaMovil) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaMovil(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [megaMovil]);

  useEffect(() => {
    if (!megaAbierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaAbierto(null);
    };
    const onPointerDown = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMegaAbierto(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
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

  const megaMovilPortal =
    montado && megaConfig && megaMovil
      ? createPortal(
          <div className="fixed inset-0 z-[200] flex flex-col bg-white lg:hidden">
            <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200 shrink-0">
              <p className="text-sm font-bold text-slate-900">{megaConfig.label}</p>
              <button
                type="button"
                onClick={cerrarMega}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-50"
                aria-label="Cerrar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PublicMegaMenuPanel
                config={megaConfig}
                pathname={pathname}
                blogRecientes={blogRecientes}
                onNavigate={() => {
                  cerrarMega();
                  setMenuAbierto(false);
                }}
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-[150] relative bg-white border-b border-slate-200 shadow-sm overflow-visible"
        onMouseLeave={cerrarHoverEventual}
        onMouseEnter={cancelarCierreHover}
      >
        <div className="w-full max-w-[88rem] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-16 gap-6">
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0 ml-3 sm:ml-5 lg:ml-8"
              aria-label="RDC Contadores · Inicio"
              onClick={cerrarMega}
            >
              <Logo mark="rdc" variante="black" alto={28} />
              <div className="leading-tight hidden sm:block">
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
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        abierto || activo
                          ? "text-marca-navy bg-marca-navy/5 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    esActivo(item.href)
                      ? "text-marca-navy bg-marca-navy/5 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
                className="inline-flex items-center px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm font-semibold hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors whitespace-nowrap"
                onClick={cerrarMega}
              >
                Cotizar
              </Link>
              <Link
                href="/empezar"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-marca-navy text-white text-sm font-semibold hover:bg-marca-navy-soft transition-colors whitespace-nowrap"
                onClick={cerrarMega}
              >
                Empezar
              </Link>
              <AccesoMenu />
            </div>

            <div className="flex items-center gap-1 lg:hidden">
              <Buscador />
              <button
                type="button"
                onClick={() => setMenuAbierto((v) => !v)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-50"
                aria-label="Abrir menú"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {menuAbierto ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {menuAbierto ? (
            <div className="lg:hidden border-t border-slate-200 py-3 space-y-2 max-h-[calc(100dvh-4rem)] overflow-y-auto pb-6">
              {NAV_MEGA_MENUS.map((config) => (
                <button
                  key={config.id}
                  type="button"
                  onClick={() => {
                    setMenuAbierto(false);
                    setMegaMovil(config.id);
                  }}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {config.label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
              {NAV_LINKS_SIMPLES.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAbierto(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mx-1 mt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/cotizar"
                  onClick={() => setMenuAbierto(false)}
                  className="block px-3 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm font-semibold text-center hover:bg-slate-50"
                >
                  Cotizar
                </Link>
                <Link
                  href="/empezar"
                  onClick={() => setMenuAbierto(false)}
                  className="block px-3 py-2.5 rounded-lg bg-marca-navy text-white text-sm font-semibold text-center"
                >
                  Empezar
                </Link>
              </div>
              <AccesoMenu className="mx-1" />
            </div>
          ) : null}
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

      {megaMovilPortal}
    </>
  );
}

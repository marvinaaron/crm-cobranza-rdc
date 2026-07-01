"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Logo from "./Logo";
import Buscador from "./Buscador";
import PublicMegaMenuPanel from "./PublicMegaMenuPanel";
import {
  NAV_LINKS_SIMPLES,
  NAV_MEGA_MENUS,
  type MegaMenuConfig,
} from "@/lib/public-nav";

export default function PublicHeader() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [megaAbierto, setMegaAbierto] = useState<string | null>(null);
  const [megaMovil, setMegaMovil] = useState<string | null>(null);
  const [montado, setMontado] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMegaAbierto(null);
    setMegaMovil(null);
    setMenuAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!megaAbierto && !megaMovil) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaAbierto(null);
        setMegaMovil(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [megaAbierto, megaMovil]);

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

  const cerrarHoverEventual = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaAbierto(null), 200);
  };

  const megaConfig =
    NAV_MEGA_MENUS.find((m) => m.id === megaAbierto || m.id === megaMovil) ?? null;

  const megaPortal =
    montado && megaConfig && megaAbierto
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 top-16 z-[200] bg-slate-900/15"
              aria-label="Cerrar menú"
              onClick={cerrarMega}
            />
            <div
              className="fixed left-0 right-0 top-16 z-[201] max-h-[calc(100dvh-4rem)] overflow-y-auto shadow-xl"
              onMouseEnter={() => {
                if (closeTimer.current) clearTimeout(closeTimer.current);
              }}
              onMouseLeave={cerrarHoverEventual}
            >
              <PublicMegaMenuPanel
                config={megaConfig}
                pathname={pathname}
                onNavigate={cerrarMega}
              />
            </div>
          </>,
          document.body
        )
      : null;

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
        className={`sticky top-0 z-[150] transition-all ${
          megaAbierto || megaMovil
            ? "bg-white border-b border-slate-200 shadow-sm"
            : scrolled
              ? "bg-white/95 backdrop-blur shadow-sm border-b border-slate-200"
              : "bg-white/80 backdrop-blur border-b border-slate-100"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0"
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
                  <div
                    key={config.id}
                    onMouseEnter={() => abrirHover(config.id)}
                    onMouseLeave={cerrarHoverEventual}
                  >
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

            <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 pl-2">
              <Buscador />
              <Link
                href="/empezar"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-marca-navy text-white text-sm font-semibold hover:bg-marca-navy-soft transition-colors whitespace-nowrap"
                onClick={cerrarMega}
              >
                Empezar
              </Link>
              <Link
                href="/portal/login"
                className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap"
                onClick={cerrarMega}
              >
                Acceso clientes
              </Link>
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
              <Link
                href="/empezar"
                onClick={() => setMenuAbierto(false)}
                className="block mx-1 mt-2 px-4 py-2.5 rounded-lg bg-marca-navy text-white text-sm font-semibold text-center"
              >
                Empezar
              </Link>
              <Link
                href="/portal/login"
                onClick={() => setMenuAbierto(false)}
                className="block mx-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold text-center"
              >
                Acceso clientes
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      {megaPortal}
      {megaMovilPortal}
    </>
  );
}

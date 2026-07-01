"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const headerRef = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setMenuAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!megaAbierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaAbierto(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [megaAbierto]);

  const esActivo = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const esMegaActivo = (config: MegaMenuConfig) => {
    if (esActivo(config.href)) return true;
    return config.sections.some((s) => s.items.some((i) => esActivo(i.href)));
  };

  const cerrarMega = () => setMegaAbierto(null);

  const abrirHover = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaAbierto(id);
  };

  const cerrarHoverEventual = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaAbierto(null), 150);
  };

  const megaConfig = NAV_MEGA_MENUS.find((m) => m.id === megaAbierto) ?? null;

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-50 relative transition-all ${
          megaAbierto
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
                          ? "text-violet-700 bg-violet-50"
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
                      ? "text-violet-700 bg-violet-50"
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
            <div className="lg:hidden border-t border-slate-200 py-3 space-y-4 max-h-[calc(100dvh-4rem)] overflow-y-auto pb-6">
              {NAV_MEGA_MENUS.map((config) => (
                <div key={config.id}>
                  <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600 mb-2">
                    {config.label}
                  </p>
                  <div className="space-y-3 px-1">
                    {config.sections.map((section) => (
                      <div key={section.titulo}>
                        <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          {section.titulo}
                        </p>
                        <ul className="space-y-0.5">
                          {section.items.map((item) => (
                            <li key={`${item.href}-${item.label}`}>
                              <Link
                                href={item.href}
                                onClick={() => setMenuAbierto(false)}
                                className={`block px-3 py-2 rounded-lg text-sm ${
                                  pathname === item.href
                                    ? "bg-violet-50 text-violet-700 font-semibold"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
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

        {megaConfig ? (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full"
            onMouseEnter={() => abrirHover(megaConfig.id)}
            onMouseLeave={cerrarHoverEventual}
          >
            <PublicMegaMenuPanel
              config={megaConfig}
              pathname={pathname}
              onNavigate={cerrarMega}
            />
          </div>
        ) : null}
      </header>

      {megaConfig ? (
        <button
          type="button"
          className="hidden lg:block fixed inset-0 top-16 z-40 bg-slate-900/10"
          aria-label="Cerrar menú"
          onClick={cerrarMega}
        />
      ) : null}
    </>
  );
}

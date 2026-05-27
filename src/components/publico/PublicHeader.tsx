"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/proceso", label: "Proceso" },
  { href: "/herramientas", label: "Herramientas" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function PublicHeader() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const esActivo = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? "bg-white/90 backdrop-blur shadow-sm border-b border-slate-200"
          : "bg-white/60 backdrop-blur border-b border-slate-100"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group" aria-label="RDC Contadores · Inicio">
            <Logo mark="rdc" variante="black" alto={28} />
            <div className="leading-tight hidden sm:block">
              <p className="text-sm font-black text-marca-navy">Contadores</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                Despacho contable y fiscal
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {ITEMS.map((item) => {
              const activo = esActivo(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activo
                      ? "text-marca-navy bg-marca-navy/5 ring-1 ring-marca-navy/10"
                      : "text-slate-600 hover:text-marca-navy hover:bg-marca-navy/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/portal/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-marca-navy text-white text-sm font-bold hover:bg-marca-navy-deep transition-colors shadow-sm"
            >
              Acceso clientes
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            className="lg:hidden p-2 rounded-lg text-marca-navy hover:bg-marca-navy/5"
            aria-label="Abrir menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

        {menuAbierto ? (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1">
            {ITEMS.map((item) => {
              const activo = esActivo(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAbierto(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    activo
                      ? "text-marca-navy bg-marca-navy/5 ring-1 ring-marca-navy/10"
                      : "text-slate-700 hover:bg-slate-50 hover:text-marca-navy"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/portal/login"
              onClick={() => setMenuAbierto(false)}
              className="block mt-2 px-4 py-2.5 rounded-xl bg-marca-navy text-white text-sm font-bold text-center"
            >
              Acceso clientes
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}

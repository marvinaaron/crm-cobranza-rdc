"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import Buscador from "./Buscador";
import { HERRAMIENTAS } from "@/lib/seo/herramientas-config";

/**
 * Header público con menú principal.
 *
 * El item "Herramientas" funciona como dropdown: muestra el listado
 * completo de herramientas (RFC, INPC, ISR, UMA, salario, recargos,
 * tipo de cambio) tanto en hover (desktop) como en click/tap.
 *
 * Esto sustituye la antigua barra interna `HerramientasNav` que
 * duplicaba navegación dentro de cada página de herramienta.
 *
 * Beneficios SEO:
 *   - Google ve los 7 enlaces directos en TODA página del sitio.
 *   - Aumenta la probabilidad de sitelinks en resultados de búsqueda.
 *   - Mantiene jerarquía limpia: header global → breadcrumb local.
 */

type ItemMenu = {
  href: string;
  label: string;
  /** Si tiene submenú, se muestra como dropdown. */
  submenu?: Array<{ href: string; label: string; descripcion?: string; nuevo?: boolean }>;
};

const ETIQUETAS_HERRAMIENTAS: Record<string, { label: string; descripcion: string; nuevo?: boolean }> = {
  rfc: {
    label: "Calculadora de RFC",
    descripcion: "Persona física con homoclave",
    nuevo: true,
  },
  resico: {
    label: "Calculadora de ISR RESICO",
    descripcion: "Estima tu ISR del mes",
    nuevo: true,
  },
  inpc: {
    label: "INPC 2026",
    descripcion: "Índice de precios INEGI",
  },
  isr: {
    label: "Tarifas ISR 2026",
    descripcion: "Anual, retenciones, RIF",
  },
  uma: {
    label: "UMA vigente",
    descripcion: "Unidad de medida y actualización",
  },
  salario: {
    label: "Salario mínimo 2026",
    descripcion: "Zona general y frontera norte",
  },
  recargos: {
    label: "Recargos federales",
    descripcion: "Pago extemporáneo SAT",
  },
  divisas: {
    label: "Tipo de cambio",
    descripcion: "USD FIX, UDI, TIIE, divisas",
  },
};

const ITEMS: ItemMenu[] = [
  { href: "/servicios", label: "Servicios" },
  { href: "/proceso", label: "Proceso" },
  {
    href: "/herramientas",
    label: "Herramientas",
    submenu: HERRAMIENTAS.map((h) => {
      const meta = ETIQUETAS_HERRAMIENTAS[h.id] ?? { label: h.id, descripcion: "" };
      return {
        href: h.path,
        label: meta.label,
        descripcion: meta.descripcion,
        nuevo: meta.nuevo,
      };
    }),
  },
  { href: "/blog", label: "Blog" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function PublicHeader() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cierra el dropdown al navegar a otra página.
  useEffect(() => {
    setDropdownAbierto(null);
    setMenuAbierto(false);
  }, [pathname]);

  // Cierra dropdown al hacer click fuera o Escape.
  //
  // Importante: `dropdownRef` solo envuelve la <nav> de DESKTOP. En la
  // versión móvil el submenú vive dentro del drawer (fuera del ref),
  // así que un click ahí dispararía un cierre en falso. Por eso el
  // detector solo corre cuando el menú móvil está cerrado y, además,
  // ignora clicks en cualquier botón con `data-dropdown-toggle` (el
  // propio botón del submenú móvil).
  useEffect(() => {
    if (!dropdownAbierto) return;
    if (menuAbierto) return;
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAbierto(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownAbierto(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [dropdownAbierto, menuAbierto]);

  const esActivo = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  /**
   * Pequeño delay al salir del hover para evitar cierres en falso
   * cuando el mouse cruza el "puente" entre el botón y el panel.
   */
  const abrirHover = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDropdownAbierto(label);
  };
  const cerrarHoverEventual = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setDropdownAbierto(null), 120);
  };

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
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="RDC Contadores · Inicio"
          >
            <Logo mark="rdc" variante="black" alto={28} />
            <div className="leading-tight hidden sm:block">
              <p className="text-sm font-black text-marca-navy">Contadores</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                Despacho contable y fiscal
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            {ITEMS.map((item) => {
              const activo = esActivo(item.href);
              if (item.submenu) {
                const abierto = dropdownAbierto === item.label;
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => abrirHover(item.label)}
                    onMouseLeave={cerrarHoverEventual}
                  >
                    <button
                      type="button"
                      onClick={() => setDropdownAbierto(abierto ? null : item.label)}
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        activo
                          ? "text-marca-navy bg-marca-navy/5 ring-1 ring-marca-navy/10"
                          : "text-slate-600 hover:text-marca-navy hover:bg-marca-navy/5"
                      }`}
                      aria-haspopup="true"
                      aria-expanded={abierto}
                    >
                      {item.label}
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${abierto ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {abierto && (
                      <div
                        className="absolute right-0 mt-1 w-[22rem] rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden z-50"
                        role="menu"
                      >
                        <Link
                          href={item.href}
                          className="group flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-marca-navy via-violet-700 to-marca-navy bg-[length:200%_100%] bg-left hover:bg-right text-white transition-[background-position] duration-700"
                        >
                          <span
                            className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur shrink-0 group-hover:scale-110 transition-transform"
                            aria-hidden="true"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="3" width="7" height="7" rx="1.5" />
                              <rect x="14" y="3" width="7" height="7" rx="1.5" />
                              <rect x="3" y="14" width="7" height="7" rx="1.5" />
                              <rect x="14" y="14" width="7" height="7" rx="1.5" />
                            </svg>
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/80">
                              Hub · Todas
                            </p>
                            <p className="text-sm font-black mt-0.5 leading-tight">
                              Ver todas las herramientas
                            </p>
                          </div>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white/80 shrink-0 transition-transform group-hover:translate-x-0.5"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Link>
                        <ul className="py-1">
                          {item.submenu.map((sub) => {
                            const subActivo = pathname === sub.href;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  role="menuitem"
                                  className={`flex items-start justify-between gap-3 px-4 py-2.5 hover:bg-marca-navy/5 transition-colors ${
                                    subActivo ? "bg-marca-navy/5" : ""
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm font-bold text-slate-900">
                                        {sub.label}
                                      </p>
                                      {sub.nuevo && (
                                        <span className="inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                                          Nuevo
                                        </span>
                                      )}
                                    </div>
                                    {sub.descripcion && (
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {sub.descripcion}
                                      </p>
                                    )}
                                  </div>
                                  {subActivo && (
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="text-marca-navy shrink-0 mt-1"
                                    >
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }

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

          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 pl-2">
            <Buscador />
            <Link
              href="/portal/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-marca-navy text-white text-sm font-bold hover:bg-marca-navy-deep transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              Acceso clientes
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <Buscador />
            <button
              type="button"
              onClick={() => setMenuAbierto((v) => !v)}
              className="p-2 rounded-lg text-marca-navy hover:bg-marca-navy/5"
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
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {ITEMS.map((item) => {
              const activo = esActivo(item.href);
              if (item.submenu) {
                const abierto = dropdownAbierto === item.label;
                return (
                  <div key={item.href}>
                    <button
                      type="button"
                      onClick={() => setDropdownAbierto(abierto ? null : item.label)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold ${
                        activo
                          ? "text-marca-navy bg-marca-navy/5 ring-1 ring-marca-navy/10"
                          : "text-slate-700 hover:bg-slate-50 hover:text-marca-navy"
                      }`}
                      aria-expanded={abierto}
                    >
                      {item.label}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${abierto ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {abierto && (
                      <div className="mt-1 ml-3 pl-3 border-l-2 border-marca-navy/10 space-y-1">
                        <Link
                          href={item.href}
                          onClick={() => {
                            setMenuAbierto(false);
                            setDropdownAbierto(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black text-white uppercase tracking-widest bg-gradient-to-r from-marca-navy via-violet-700 to-marca-navy bg-[length:200%_100%] bg-left hover:bg-right transition-[background-position] duration-700"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                          </svg>
                          Ver todas
                        </Link>
                        {item.submenu.map((sub) => {
                          const subActivo = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => {
                                setMenuAbierto(false);
                                setDropdownAbierto(null);
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                subActivo
                                  ? "bg-marca-navy/5 text-marca-navy font-bold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span>{sub.label}</span>
                              {sub.nuevo && (
                                <span className="inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                                  Nuevo
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
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

"use client";

import Link from "next/link";
import type { MegaMenuConfig, MegaMenuIconKey } from "@/lib/public-nav";
import { iconKeyForHref, iconStyleForHref } from "@/lib/public-nav";

function MegaMenuIcon({ kind, className }: { kind: MegaMenuIconKey; className: string }) {
  const props = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.75,
    className,
    "aria-hidden": true as const,
  };

  switch (kind) {
    case "building":
      return (
        <svg {...props}>
          <rect x="3" y="9" width="18" height="12" rx="1.5" />
          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
          <path d="M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h.01M15 17h.01" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20v-1.5a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5V20" />
        </svg>
      );
    case "smartphone":
      return (
        <svg {...props}>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    case "percent":
      return (
        <svg {...props}>
          <line x1="19" y1="5" x2="5" y2="19" />
          <circle cx="7.5" cy="7.5" r="2" />
          <circle cx="16.5" cy="16.5" r="2" />
        </svg>
      );
    case "help":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 0 1 4.2 1.8c0 1.8-2.7 2.2-2.7 3.7" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "columns":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="7" height="16" rx="1" />
          <rect x="14" y="4" width="7" height="16" rx="1" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...props}>
          <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "table":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="1.5" />
          <path d="M3 10h18M3 15h18M9 4v16M15 4v16" />
        </svg>
      );
    case "trending":
      return (
        <svg {...props}>
          <path d="M3 3v18h18" />
          <path d="m7 15 4-5 3 3 5-7" />
        </svg>
      );
    case "banknote":
      return (
        <svg {...props}>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 10h.01M18 14h.01" />
        </svg>
      );
    case "alert":
      return (
        <svg {...props}>
          <path d="M12 3 2 20h20L12 3z" />
          <path d="M12 10v4M12 17h.01" />
        </svg>
      );
    case "exchange":
      return (
        <svg {...props}>
          <path d="M7 8l-4 4 4 4M17 8l4 4-4 4M3 12h18" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...props}>
          <rect x="3" y="8" width="18" height="12" rx="1.5" />
          <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "file-check":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m9 15 2 2 4-4" />
        </svg>
      );
    case "workflow":
      return (
        <svg {...props}>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="12" cy="18" r="2.5" />
          <path d="M8 7.5l3 8M16 7.5l-3 8" />
        </svg>
      );
    case "idcard":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="12" r="2" />
          <path d="M14 10h5M14 14h5" />
        </svg>
      );
    case "phone":
      return (
        <svg {...props}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.62 2.6a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.6.62A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "login":
      return (
        <svg {...props}>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      );
    case "star":
      return (
        <svg {...props}>
          <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18.5 5.5 22 7 14.5 2 9.5 9 9" />
        </svg>
      );
    case "scale":
      return (
        <svg {...props}>
          <path d="M12 3v18" />
          <path d="M5 7h14" />
          <path d="M5 7 2 13h6L5 7zM19 7l-3 6h6l-3-6z" />
        </svg>
      );
    case "calculator":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h8" />
        </svg>
      );
    case "chart":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
          <path d="M3 3v18h18" />
          <path d="m7 16 4-6 4 3 5-7" />
        </svg>
      );
    case "users":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "book":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "sparkles":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
          <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          <path d="M5 19h0M19 5h0" />
        </svg>
      );
    case "wallet":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
          <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
          <path d="M3 7h18v4H3z" />
          <circle cx="16" cy="11" r="1" />
        </svg>
      );
    case "calendar":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "shield":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "grid":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
  }
}

function FooterIcon({ label }: { label: string }) {
  if (label.toLowerCase().includes("whatsapp") || label.toLowerCase().includes("contactar")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  if (label.toLowerCase().includes("blog") || label.toLowerCase().includes("leer")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

type Props = {
  config: MegaMenuConfig;
  pathname: string;
  onNavigate: () => void;
};

const SECCION_TITULO =
  "text-sm font-bold uppercase tracking-[0.18em] text-marca-navy mb-3.5";

function MenuItemLink({
  item,
  sectionTitulo,
  pathname,
  onNavigate,
  destacado = false,
}: {
  item: MegaMenuConfig["sections"][number]["items"][number];
  sectionTitulo: string;
  pathname: string;
  onNavigate: () => void;
  destacado?: boolean;
}) {
  const activo = pathname === item.href;
  const icon = iconKeyForHref(item.href, sectionTitulo, item.label);
  const colorIcono = iconStyleForHref(item.href, item.label);

  if (destacado) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors ${
          activo ? "bg-marca-navy/5" : "hover:bg-slate-50"
        }`}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className={`inline-flex shrink-0 items-center transition-all duration-200 group-hover:scale-110 ${colorIcono}`}>
            <MegaMenuIcon kind={icon} className={colorIcono} />
          </span>
          <span className="text-[15px] font-medium text-slate-600 leading-none transition-all duration-200 group-hover:font-bold group-hover:text-slate-900">
            {item.label}
          </span>
        </span>
        <span className="shrink-0 text-[11px] font-bold text-marca-navy opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
          →
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 py-2 px-2 -mx-2 rounded-md transition-colors ${
        activo ? "bg-marca-navy/5" : "hover:bg-slate-50"
      }`}
    >
      <span className={`inline-flex shrink-0 items-center transition-all duration-200 group-hover:scale-110 ${colorIcono}`}>
        <MegaMenuIcon kind={icon} className={colorIcono} />
      </span>
      <span className="text-[15px] font-medium text-slate-600 leading-none transition-all duration-200 group-hover:font-bold group-hover:text-slate-900">
        {item.label}
      </span>
      {item.nuevo ? (
        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-700 leading-none">
          Nuevo
        </span>
      ) : null}
    </Link>
  );
}

export default function PublicMegaMenuPanel({ config, pathname, onNavigate }: Props) {
  const esHerramientas = config.id === "herramientas";
  const esServicios = config.id === "servicios";
  const seccionDestacada = esServicios ? config.sections[0] : null;
  const seccionesRestantes = esServicios ? config.sections.slice(1) : config.sections;

  return (
    <div className="border-t border-slate-200 bg-white shadow-[0_18px_36px_-2px_rgba(15,23,42,0.22)] max-h-[calc(100dvh-4rem)] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6 lg:py-8">
        {seccionDestacada ? (
          <div className="mb-6 lg:mb-8">
            <p className={SECCION_TITULO}>
              {seccionDestacada.titulo}
            </p>
            <div
              className={`grid grid-cols-1 gap-0.5 ${
                seccionDestacada.items.length >= 3
                  ? "sm:grid-cols-3"
                  : "sm:grid-cols-2"
              }`}
            >
              {seccionDestacada.items.map((item) => (
                <MenuItemLink
                  key={`destacado-${item.href}-${item.label}`}
                  item={item}
                  sectionTitulo={seccionDestacada.titulo}
                  pathname={pathname}
                  onNavigate={onNavigate}
                  destacado
                />
              ))}
            </div>
          </div>
        ) : null}

        <div
          className={`grid grid-cols-1 gap-8 lg:gap-10 ${
            esServicios
              ? "md:grid-cols-3"
              : esHerramientas
                ? "md:grid-cols-2"
                : config.sections.length <= 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {seccionesRestantes.map((section) => {
            const tablasEnDosColumnas =
              esHerramientas && section.titulo === "Tablas fiscales";

            return (
            <div key={section.titulo} className="min-w-0">
              <p className={SECCION_TITULO}>
                {section.titulo}
              </p>
              <ul
                className={
                  tablasEnDosColumnas
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0"
                    : "space-y-0.5"
                }
              >
                {section.items.map((item) => (
                  <li key={`${section.titulo}-${item.href}-${item.label}`}>
                    <MenuItemLink
                      item={item}
                      sectionTitulo={section.titulo}
                      pathname={pathname}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50/90">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          {config.footer.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              onClick={onNavigate}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="flex items-center justify-center gap-2 px-5 py-4 text-sm font-medium text-slate-600 hover:text-marca-navy hover:bg-white/60 transition-colors"
            >
              <FooterIcon label={link.label} />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

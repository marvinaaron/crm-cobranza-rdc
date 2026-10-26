"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import type {
  MegaMenuBlogReciente,
  MegaMenuConfig,
  MegaMenuIconKey,
  MegaMenuLink,
} from "@/lib/public-nav";
import {
  HERRAMIENTAS_DESTACADAS_NAV,
  iconKeyForHref,
} from "@/lib/public-nav";
import { TONOS_REGIMEN } from "@/lib/regimen-tonos";
import { TONOS_ESPECIALIDAD } from "@/lib/especialidad-tonos";
import type { RegimenSlug } from "@/lib/regimenes-fiscales-types";
import type { EspecialidadSlug } from "@/lib/servicios-especialidades";
import RegimenIcon from "./RegimenIcon";
import EspecialidadIcon from "./EspecialidadIcon";

function hexDeFondo(iconBg: string): string {
  const m = iconBg.match(/\[(#[0-9A-Fa-f]{3,8})\]/);
  return m?.[1] ?? "#E3E8F4";
}

/** Familias de marca: violeta calcula, cyan consulta, navy el despacho. */
function tonoGlifo(href: string, section: string): { trazo: string; wash: string } {
  if (section === "Calculadoras") {
    return href === "/herramientas"
      ? { trazo: "text-marca-navy", wash: "#E3E8F4" }
      : { trazo: "text-[#6d28d9]", wash: "#EDE7FF" };
  }
  if (section === "Tablas fiscales") {
    return { trazo: "text-[#0e7490]", wash: "#DFF7FB" };
  }
  if (href.includes("preguntas-frecuentes") || href.includes("/blog")) {
    return { trazo: "text-[#6d28d9]", wash: "#EDE7FF" };
  }
  if (href.includes("/proceso") || href.includes("/herramientas")) {
    return { trazo: "text-[#0e7490]", wash: "#DFF7FB" };
  }
  if (href.includes("aviso-de-privacidad")) {
    return { trazo: "text-slate-600", wash: "#f1f5f9" };
  }
  return { trazo: "text-marca-navy", wash: "#E3E8F4" };
}

function DestelloSvg({
  wash,
  className,
  size = 20,
  strokeWidth = 1.75,
  children,
}: {
  wash: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
  children: ReactNode;
}) {
  const gid = `ds${useId().replace(/:/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={`url(#${gid})`}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <defs>
        {/* Portal-style inner wash: same hue as the stroke, glowing from the center. */}
        <radialGradient id={gid} cx="50%" cy="38%" r="68%">
          <stop offset="0%" stopColor={wash} stopOpacity="0.95" />
          <stop offset="42%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {children}
    </svg>
  );
}

function MenuGlyph({
  href,
  label,
  sectionTitulo,
}: {
  href: string;
  label?: string;
  sectionTitulo: string;
}) {
  for (const slug of Object.keys(TONOS_REGIMEN) as RegimenSlug[]) {
    if (href.includes(`/servicios/${slug}`)) {
      const t = TONOS_REGIMEN[slug];
      return (
        <span className="inline-flex shrink-0">
          <RegimenIcon
            slug={slug}
            size={18}
            className={t.iconColor}
            wash={hexDeFondo(t.iconBg)}
          />
        </span>
      );
    }
  }
  const esp = (["repse", "icsoe", "sisub"] as EspecialidadSlug[]).find((s) =>
    href.includes(`/servicios/${s}`)
  );
  if (esp) {
    const t = TONOS_ESPECIALIDAD[esp];
    return (
      <span className="inline-flex shrink-0">
        <EspecialidadIcon
          slug={esp}
          size={18}
          className={t.iconColor}
          wash={hexDeFondo(t.iconBg)}
        />
      </span>
    );
  }
  const tono = tonoGlifo(href, sectionTitulo);
  return (
    <span className="inline-flex shrink-0">
      <MegaMenuIcon
        kind={iconKeyForHref(href, sectionTitulo, label)}
        className={tono.trazo}
        wash={tono.wash}
      />
    </span>
  );
}

function MegaMenuIcon({
  kind,
  className,
  wash,
}: {
  kind: MegaMenuIconKey;
  className: string;
  wash: string;
}) {
  const D = ({ children }: { children: ReactNode }) => (
    <DestelloSvg wash={wash} className={className}>
      {children}
    </DestelloSvg>
  );

  switch (kind) {
    case "building":
      return (
        <D>
          <rect x="3" y="9" width="18" height="12" rx="1.5" />
          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
          <path d="M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h.01M15 17h.01" />
        </D>
      );
    case "user":
      return (
        <D>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20v-1.5a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5V20" />
        </D>
      );
    case "smartphone":
      return (
        <D>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M12 18h.01" />
        </D>
      );
    case "percent":
      return (
        <D>
          <line x1="19" y1="5" x2="5" y2="19" />
          <circle cx="7.5" cy="7.5" r="2" />
          <circle cx="16.5" cy="16.5" r="2" />
        </D>
      );
    case "help":
      return (
        <D>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 0 1 4.2 1.8c0 1.8-2.7 2.2-2.7 3.7" />
          <path d="M12 17h.01" />
        </D>
      );
    case "columns":
      return (
        <D>
          <rect x="3" y="4" width="7" height="16" rx="1" />
          <rect x="14" y="4" width="7" height="16" rx="1" />
        </D>
      );
    case "lock":
      return (
        <D>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </D>
      );
    case "receipt":
      return (
        <D>
          <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </D>
      );
    case "table":
      return (
        <D>
          <rect x="3" y="4" width="18" height="16" rx="1.5" />
          <path d="M3 10h18M3 15h18M9 4v16M15 4v16" />
        </D>
      );
    case "trending":
      return (
        <D>
          <path d="M3 3v18h18" />
          <path d="m7 15 4-5 3 3 5-7" />
        </D>
      );
    case "banknote":
      return (
        <D>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 10h.01M18 14h.01" />
        </D>
      );
    case "alert":
      return (
        <D>
          <path d="M12 3 2 20h20L12 3z" />
          <path d="M12 10v4M12 17h.01" />
        </D>
      );
    case "exchange":
      return (
        <D>
          <path d="M7 8l-4 4 4 4M17 8l4 4-4 4M3 12h18" />
        </D>
      );
    case "briefcase":
      return (
        <D>
          <rect x="3" y="8" width="18" height="12" rx="1.5" />
          <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </D>
      );
    case "file-check":
      return (
        <D>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m9 15 2 2 4-4" />
        </D>
      );
    case "workflow":
      return (
        <D>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="12" cy="18" r="2.5" />
          <path d="M8 7.5l3 8M16 7.5l-3 8" />
        </D>
      );
    case "idcard":
      return (
        <D>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="12" r="2" />
          <path d="M14 10h5M14 14h5" />
        </D>
      );
    case "phone":
      return (
        <D>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.62 2.6a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.6.62A2 2 0 0 1 22 16.92z" />
        </D>
      );
    case "login":
      return (
        <D>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </D>
      );
    case "star":
      return (
        <D>
          <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18.5 5.5 22 7 14.5 2 9.5 9 9" />
        </D>
      );
    case "scale":
      return (
        <D>
          <path d="M12 3v18" />
          <path d="M5 7h14" />
          <path d="M5 7 2 13h6L5 7zM19 7l-3 6h6l-3-6z" />
        </D>
      );
    case "calculator":
      return (
        <D>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h8" />
        </D>
      );
    case "chart":
      return (
        <D>
          <path d="M3 3v18h18" />
          <path d="m7 16 4-6 4 3 5-7" />
        </D>
      );
    case "users":
      return (
        <D>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </D>
      );
    case "book":
      return (
        <D>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </D>
      );
    case "sparkles":
      return (
        <D>
          <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          <path d="M5 19h0M19 5h0" />
        </D>
      );
    case "wallet":
      return (
        <D>
          <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
          <path d="M3 7h18v4H3z" />
          <circle cx="16" cy="11" r="1" />
        </D>
      );
    case "calendar":
      return (
        <D>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </D>
      );
    case "shield":
      return (
        <D>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </D>
      );
    case "grid":
      return (
        <D>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </D>
      );
    default:
      return (
        <D>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </D>
      );
  }
}

function FooterIcon({ href, label }: { href: string; label: string }) {
  const l = label.toLowerCase();
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2,
    "aria-hidden": true as const,
  };
  if (href.includes("calendly") || l.includes("agendar")) {
    return (
      <svg {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );
  }
  if (href.includes("isr-resico") || l.includes("calcular")) {
    return (
      <svg {...props}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M8 6h8M8 10h2M12 10h2M8 14h2M12 14h2M8 18h8" />
      </svg>
    );
  }
  if (href.includes("vencimiento") || l.includes("declaro")) {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  if (href.includes("preguntas-frecuentes")) {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 0 1 4.2 1.8c0 1.8-2.7 2.2-2.7 3.7" />
        <path d="M12 17h.01" />
      </svg>
    );
  }
  if (href.includes("/proceso") || l.includes("trabajamos")) {
    return (
      <svg {...props}>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="12" cy="18" r="2.5" />
        <path d="M8 7.5l3 8M16 7.5l-3 8" />
      </svg>
    );
  }
  if (
    href.includes("/contacto") ||
    l.includes("whatsapp") ||
    l.includes("escríbenos") ||
    l.includes("escribenos")
  ) {
    return (
      <svg {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

type Props = {
  config: MegaMenuConfig;
  pathname: string;
  onNavigate: () => void;
  blogRecientes?: MegaMenuBlogReciente[];
};

const SECCION_TITULO =
  "text-sm font-bold uppercase tracking-[0.18em] text-marca-navy mb-3.5";

function BlogFiscalConRecientes({
  item,
  recientes,
  sectionTitulo,
  pathname,
  onNavigate,
}: {
  item: MegaMenuConfig["sections"][number]["items"][number];
  recientes: MegaMenuBlogReciente[];
  sectionTitulo: string;
  pathname: string;
  onNavigate: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const activo = pathname === item.href || pathname.startsWith("/blog/");

  return (
    <div className="rounded-md">
      <div
        className={`group flex items-center gap-1 py-2 px-2 -mx-2 rounded-md transition-colors ${
          activo ? "bg-marca-navy/5" : "hover:bg-slate-50"
        }`}
      >
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <MenuGlyph
            href={item.href}
            label={item.label}
            sectionTitulo={sectionTitulo}
          />
          <span className="text-[15px] font-medium text-slate-600 leading-none transition-colors duration-150 group-hover:text-slate-900">
            {item.label}
          </span>
        </Link>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls="blog-recientes-nav"
          aria-label={
            abierto ? "Ocultar artículos recientes" : "Ver artículos recientes"
          }
          onClick={() => setAbierto((v) => !v)}
          className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-marca-navy hover:bg-slate-100"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${abierto ? "rotate-180" : ""}`}
            aria-hidden
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
      {abierto ? (
        <ul
          id="blog-recientes-nav"
          className="mt-0.5 mb-1 ml-5 border-l border-slate-200 pl-3 space-y-0.5"
        >
          {recientes.map((p) => {
            const href = `/blog/${p.slug}`;
            const postActivo = pathname === href;
            return (
              <li key={p.slug}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  className={`flex items-start gap-2 py-1.5 text-[13px] leading-snug transition-colors ${
                    postActivo
                      ? "font-semibold text-marca-navy"
                      : "font-medium text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="min-w-0 line-clamp-2">{p.titulo}</span>
                  {p.nuevo ? (
                    <span className="mt-0.5 shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-700 leading-none">
                      Nuevo
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function HerramientasDestacadasDropdown({
  item,
  herramientas,
  sectionTitulo,
  pathname,
  onNavigate,
}: {
  item: MegaMenuLink;
  herramientas: MegaMenuLink[];
  sectionTitulo: string;
  pathname: string;
  onNavigate: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const activo =
    pathname === item.href ||
    herramientas.some((h) => pathname === h.href || pathname.startsWith(`${h.href}/`));
  return (
    <div className="rounded-md">
      <div
        className={`group flex items-center gap-1 py-2 px-2 -mx-2 rounded-md transition-colors ${
          activo ? "bg-marca-navy/5" : "hover:bg-slate-50"
        }`}
      >
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <MenuGlyph
            href={item.href}
            label={item.label}
            sectionTitulo={sectionTitulo}
          />
          <span className="text-[15px] font-medium text-slate-600 leading-none transition-colors duration-150 group-hover:text-slate-900">
            {item.label}
          </span>
        </Link>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls="herramientas-destacadas-nav"
          aria-label={
            abierto
              ? "Ocultar herramientas destacadas"
              : "Ver herramientas destacadas"
          }
          onClick={() => setAbierto((v) => !v)}
          className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-marca-navy hover:bg-slate-100"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${abierto ? "rotate-180" : ""}`}
            aria-hidden
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
      {abierto ? (
        <ul
          id="herramientas-destacadas-nav"
          className="mt-0.5 mb-1 ml-5 border-l border-slate-200 pl-3 space-y-0.5"
        >
          {herramientas.map((h) => {
            const hActivo = pathname === h.href;
            return (
              <li key={h.href}>
                <Link
                  href={h.href}
                  onClick={onNavigate}
                  className={`flex items-start gap-2 py-1.5 text-[13px] leading-snug transition-colors ${
                    hActivo
                      ? "font-semibold text-marca-navy"
                      : "font-medium text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="min-w-0 line-clamp-2">{h.label}</span>
                  {h.nuevo ? (
                    <span className="mt-0.5 shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-700 leading-none">
                      Nuevo
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

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
  const glyph = (
    <MenuGlyph
      href={item.href}
      label={item.label}
      sectionTitulo={sectionTitulo}
    />
  );
  const etiqueta = (
    <span className="text-[15px] font-medium text-slate-600 leading-none transition-colors duration-150 group-hover:text-slate-900">
      {item.label}
    </span>
  );

  if (destacado) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`rdc-mega-link group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 ${
          activo ? "bg-marca-navy/5" : ""
        }`}
      >
        <span className="flex items-center gap-3 min-w-0">
          {glyph}
          {etiqueta}
        </span>
        <span className="rdc-mega-link-arrow shrink-0 text-[11px] font-bold text-marca-navy opacity-70">
          →
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`rdc-mega-link group flex items-center gap-3 py-2 px-2 -mx-2 rounded-md ${
        activo ? "bg-marca-navy/5" : ""
      }`}
    >
      {glyph}
      {etiqueta}
      {item.nuevo ? (
        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-700 leading-none">
          Nuevo
        </span>
      ) : null}
    </Link>
  );
}

export default function PublicMegaMenuPanel({
  config,
  pathname,
  onNavigate,
  blogRecientes = [],
}: Props) {
  const esHerramientas = config.id === "herramientas";
  const esServicios = config.id === "servicios";
  const seccionDestacada = esServicios ? config.sections[0] : null;
  const seccionesRestantes = esServicios ? config.sections.slice(1) : config.sections;

  return (
    <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-b-[1.75rem] border-t border-slate-200 bg-white shadow-[0_18px_36px_-2px_rgba(15,23,42,0.22)]">
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
                    {item.href === "/blog" &&
                    item.label === "Blog fiscal" &&
                    blogRecientes.length > 0 ? (
                      <BlogFiscalConRecientes
                        item={item}
                        recientes={blogRecientes}
                        sectionTitulo={section.titulo}
                        pathname={pathname}
                        onNavigate={onNavigate}
                      />
                    ) : item.label === "Herramientas destacadas" &&
                      HERRAMIENTAS_DESTACADAS_NAV.length > 0 ? (
                      <HerramientasDestacadasDropdown
                        item={item}
                        herramientas={HERRAMIENTAS_DESTACADAS_NAV}
                        sectionTitulo={section.titulo}
                        pathname={pathname}
                        onNavigate={onNavigate}
                      />
                    ) : (
                      <MenuItemLink
                        item={item}
                        sectionTitulo={section.titulo}
                        pathname={pathname}
                        onNavigate={onNavigate}
                      />
                    )}
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
              <FooterIcon href={link.href} label={link.label} />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

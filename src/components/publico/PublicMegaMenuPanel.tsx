"use client";

import Link from "next/link";
import type { MegaMenuConfig, MegaMenuIconKey } from "@/lib/public-nav";
import { iconKeyForHref } from "@/lib/public-nav";

function MegaMenuIcon({ kind }: { kind: MegaMenuIconKey }) {
  const className = "text-slate-500";
  switch (kind) {
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

export default function PublicMegaMenuPanel({ config, pathname, onNavigate }: Props) {
  return (
    <div className="border-t border-slate-200 bg-white shadow-xl">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {config.sections.map((section) => (
            <div key={section.titulo}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600 mb-4">
                {section.titulo}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const activo = pathname === item.href;
                  const icon = iconKeyForHref(item.href, section.titulo);
                  return (
                    <li key={`${section.titulo}-${item.href}-${item.label}`}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={`group flex gap-3 rounded-xl p-3 -mx-3 transition-colors ${
                          activo ? "bg-violet-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-white ring-1 ring-slate-200/80">
                          <MegaMenuIcon kind={icon} />
                        </span>
                        <span className="min-w-0 pt-0.5">
                          <span className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-violet-700">
                              {item.label}
                            </span>
                            {item.nuevo ? (
                              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-700">
                                Nuevo
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500 leading-relaxed">
                            {item.descripcion}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
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
              className="flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium text-slate-600 hover:text-violet-700 hover:bg-white/60 transition-colors"
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

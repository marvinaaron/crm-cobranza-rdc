"use client";

import { type ReactNode, useState } from "react";
import { portalCard, portalCardTitle } from "./portal-ui";

type Props = {
  title?: string;
  titleClassName?: string;
  children: ReactNode;
  className?: string;
  /** Permite al usuario contraer/expandir la sección. Requiere `title`. */
  collapsible?: boolean;
  /** Estado inicial cuando es colapsable. Default: true (abierta). */
  defaultOpen?: boolean;
  /** Contenido auxiliar en la cabecera (badge, contador, etc.). */
  headerExtra?: ReactNode;
  /** Síntesis a la derecha del título, solo cuando está contraída. */
  summary?: ReactNode;
};

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    aria-hidden
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function PortalSection({
  title,
  titleClassName,
  children,
  className = "",
  collapsible = false,
  defaultOpen = true,
  headerExtra,
  summary,
}: Props) {
  const [abierto, setAbierto] = useState(defaultOpen);
  const expanded = !collapsible || abierto;

  if (!collapsible || !title) {
    return (
      <section className={`${portalCard} ${className}`}>
        {title && (
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className={`${portalCardTitle} ${titleClassName ?? ""}`}>{title}</p>
            {headerExtra}
          </div>
        )}
        {children}
      </section>
    );
  }

  return (
    <section className={`${portalCard} ${className}`}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={expanded}
        className={`w-full flex items-center justify-between gap-3 text-left ${
          expanded ? "mb-4" : "mb-0"
        }`}
      >
        <span className={`${portalCardTitle} ${titleClassName ?? ""}`}>{title}</span>
        {!expanded && summary ? (
          <span className="min-w-0 flex-1 text-right text-[15px] font-semibold text-slate-900 tabular-nums truncate">
            {summary}
          </span>
        ) : null}
        <span className="flex items-center gap-2 shrink-0 text-slate-400">
          {headerExtra}
          <ChevronIcon open={expanded} />
        </span>
      </button>
      {expanded && children}
    </section>
  );
}

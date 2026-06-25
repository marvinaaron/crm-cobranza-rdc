"use client";

import { type ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
  /** Elemento opcional debajo del subtítulo (badges, chips, etc.). */
  subtitleExtra?: ReactNode;
  actions?: ReactNode;
};

export default function PortalPageHeader({
  eyebrow,
  title,
  subtitle,
  subtitleExtra,
  actions,
}: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 pt-1 sm:pt-2">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-[var(--portal-purple)] uppercase tracking-[0.2em] mb-1">
          {eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--portal-navy)] dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-400 font-bold mt-2 text-sm">{subtitle}</p>
        )}
        {subtitleExtra && <div className="mt-2">{subtitleExtra}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

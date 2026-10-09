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
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">
          {eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {(subtitle || subtitleExtra) && (
          <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
            {subtitle ? (
              <p className="text-slate-400 font-bold text-sm min-w-0">{subtitle}</p>
            ) : (
              <span />
            )}
            {subtitleExtra ? (
              <div className="shrink-0">{subtitleExtra}</div>
            ) : null}
          </div>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

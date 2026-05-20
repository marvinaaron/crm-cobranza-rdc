"use client";

import { type ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function PortalPageHeader({ eyebrow, title, subtitle, actions }: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 pt-1 sm:pt-2">
      <div className="min-w-0">
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">
          {eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-slate-800">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-400 font-bold mt-2 text-sm">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

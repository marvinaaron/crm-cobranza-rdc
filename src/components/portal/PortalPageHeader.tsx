"use client";

import { type ReactNode } from "react";

type Props = {
  /** Etiqueta chica tipo iOS (opcional). */
  eyebrow?: string;
  title: string;
  /** Icono o control a la izquierda del título. */
  titleLeading?: ReactNode;
  /** Control a la derecha del título (p. ej. flecha de mes). */
  titleTrailing?: ReactNode;
  subtitle?: ReactNode;
  subtitleExtra?: ReactNode;
  actions?: ReactNode;
};

export default function PortalPageHeader({
  eyebrow,
  title,
  titleLeading,
  titleTrailing,
  subtitle,
  subtitleExtra,
  actions,
}: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-1">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[13px] font-semibold text-slate-500 mb-1">{eyebrow}</p>
        ) : null}
        <h1 className="flex items-center flex-nowrap gap-0.5 text-[28px] sm:text-[34px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          {titleLeading}
          <span className="min-w-0">{title}</span>
          {titleTrailing}
        </h1>
        {(subtitle || subtitleExtra) && (
          <div className="mt-1.5 flex items-center justify-between gap-3 flex-wrap">
            {subtitle ? (
              <p className="text-[15px] text-slate-500 min-w-0">{subtitle}</p>
            ) : (
              <span />
            )}
            {subtitleExtra ? (
              <div className="shrink-0">{subtitleExtra}</div>
            ) : null}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 ml-auto">
          {actions}
        </div>
      )}
    </header>
  );
}

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
  subtitleClassName?: string;
  subtitleExtra?: ReactNode;
  actions?: ReactNode;
};

export default function PortalPageHeader({
  eyebrow,
  title,
  titleLeading,
  titleTrailing,
  subtitle,
  subtitleClassName,
  subtitleExtra,
  actions,
}: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-2 px-0">
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-[13px] font-semibold text-slate-500 mb-1">{eyebrow}</p>
        ) : null}
        <div>
          <div className="flex items-center flex-nowrap gap-0">
            {titleLeading}
            <h1 className="min-w-0 text-[28px] sm:text-[34px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {title}
            </h1>
            {titleTrailing}
          </div>
          {subtitle ? (
            <p
              className={`mt-0.5 text-slate-500 leading-snug ${
                subtitleClassName ?? "text-[15px]"
              } ${titleLeading ? "pl-5" : ""}`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {subtitleExtra ? (
          <div className="mt-1.5 shrink-0">{subtitleExtra}</div>
        ) : null}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 ml-auto">
          {actions}
        </div>
      )}
    </header>
  );
}

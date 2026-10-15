"use client";

import Link from "next/link";
import { type ReactNode } from "react";

/** Lista agrupada estilo iOS / Savio: bloque blanco sobre fondo gris. */
export function GroupedSection({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <section>
      {label ? (
        <p className="px-4 mb-2 text-[13px] font-semibold text-slate-500">
          {label}
        </p>
      ) : null}
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden divide-y divide-slate-200/70 dark:divide-white/10">
        {children}
      </div>
    </section>
  );
}

function RowInner({
  icon,
  iconClass,
  title,
  subtitle,
  trailing,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <>
      <span
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${iconClass}`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[17px] font-semibold text-slate-900 dark:text-white leading-tight truncate">
          {title}
        </span>
        {subtitle ? (
          <span className="block text-[13px] text-slate-500 mt-0.5 truncate">
            {subtitle}
          </span>
        ) : null}
      </span>
      {trailing ? (
        <span className="shrink-0 text-[15px] text-slate-400 tabular-nums">
          {trailing}
        </span>
      ) : null}
      <Chevron />
    </>
  );
}

const ROW_CLASS =
  "flex w-full items-center gap-3 px-4 min-h-[56px] py-2.5 active:bg-slate-50 dark:active:bg-white/5";

export function GroupedRow({
  href,
  icon,
  iconClass,
  title,
  subtitle,
  trailing,
}: {
  href: string;
  icon: ReactNode;
  iconClass: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <Link href={href} className={ROW_CLASS}>
      <RowInner
        icon={icon}
        iconClass={iconClass}
        title={title}
        subtitle={subtitle}
        trailing={trailing}
      />
    </Link>
  );
}

export function GroupedButton({
  onClick,
  icon,
  iconClass,
  title,
  subtitle,
  trailing,
}: {
  onClick: () => void;
  icon: ReactNode;
  iconClass: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={ROW_CLASS}>
      <RowInner
        icon={icon}
        iconClass={iconClass}
        title={title}
        subtitle={subtitle}
        trailing={trailing}
      />
    </button>
  );
}

const CENTER_ROW =
  "relative flex w-full items-center justify-center min-h-[44px] px-10 text-[15px] font-medium text-slate-900 dark:text-white active:bg-slate-50 dark:active:bg-white/5";

/** Texto centrado con chevron a la derecha (avisos y filas secundarias). */
export function GroupedCenterLink({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const inner = (
    <>
      <span className="text-center leading-tight">{children}</span>
      <span className="absolute right-4 top-1/2 -translate-y-1/2">
        <Chevron />
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={CENTER_ROW}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={CENTER_ROW}>
      {inner}
    </button>
  );
}

function Chevron() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-slate-300"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export const IconDoc = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export const IconPeso = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const IconSat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const IconCal = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconFolder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

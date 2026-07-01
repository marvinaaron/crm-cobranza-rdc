import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

const LABEL = "block text-sm font-medium text-slate-600 mb-1.5";
const INPUT =
  "w-full h-10 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg outline-none transition focus:border-marca-navy focus:ring-1 focus:ring-marca-navy/20 disabled:opacity-50 disabled:bg-slate-50";
const INPUT_ICON = "pl-10";
const ICON =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400";

type CampoProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
};

export function Campo({
  label,
  icon,
  hint,
  error,
  id,
  className = "",
  ...props
}: CampoProps) {
  const inputId = id ?? props.name;
  return (
    <div>
      <label htmlFor={inputId} className={LABEL}>
        {label}
      </label>
      <div className="relative">
        {icon ? <span className={ICON}>{icon}</span> : null}
        <input
          id={inputId}
          className={`${INPUT} ${icon ? INPUT_ICON : "px-3"} ${className}`}
          {...props}
        />
      </div>
      {hint && !error ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

type CampoAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function CampoArea({
  label,
  hint,
  error,
  id,
  className = "",
  rows = 4,
  ...props
}: CampoAreaProps) {
  const inputId = id ?? props.name;
  return (
    <div>
      <label htmlFor={inputId} className={LABEL}>
        {label}
      </label>
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full min-h-[88px] px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg outline-none transition resize-none focus:border-marca-navy focus:ring-1 focus:ring-marca-navy/20 ${className}`}
        {...props}
      />
      {hint && !error ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

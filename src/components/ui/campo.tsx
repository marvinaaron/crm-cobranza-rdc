import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

const LABEL = "block text-sm font-medium text-slate-600 mb-1.5";
const INPUT =
  "w-full h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg outline-none transition focus:border-marca-navy focus:ring-1 focus:ring-marca-navy/20 disabled:opacity-50 disabled:bg-slate-50";
const WRAP =
  "flex overflow-hidden rounded-lg border border-slate-200 bg-white transition focus-within:border-marca-navy focus-within:ring-1 focus-within:ring-marca-navy/20";
const RAIL =
  "flex w-10 shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 text-slate-400";
const INPUT_INNER =
  "flex-1 min-w-0 h-10 border-0 bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-50";

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
    <div className={className}>
      <label htmlFor={inputId} className={LABEL}>
        {label}
      </label>
      {icon ? (
        <div className={WRAP}>
          <span className={RAIL}>{icon}</span>
          <input id={inputId} className={INPUT_INNER} {...props} />
        </div>
      ) : (
        <input id={inputId} className={INPUT} {...props} />
      )}
      {hint && !error ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

type CampoAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
};

export function CampoArea({
  label,
  icon,
  hint,
  error,
  id,
  className = "",
  rows = 4,
  ...props
}: CampoAreaProps) {
  const inputId = id ?? props.name;
  return (
    <div className={className}>
      <label htmlFor={inputId} className={LABEL}>
        {label}
      </label>
      {icon ? (
        <div className={WRAP}>
          <span className={`${RAIL} self-stretch items-start pt-3`}>{icon}</span>
          <textarea
            id={inputId}
            rows={rows}
            className="min-h-[88px] flex-1 min-w-0 resize-none border-0 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            {...props}
          />
        </div>
      ) : (
        <textarea
          id={inputId}
          rows={rows}
          className="w-full min-h-[88px] px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg outline-none transition resize-none focus:border-marca-navy focus:ring-1 focus:ring-marca-navy/20"
          {...props}
        />
      )}
      {hint && !error ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

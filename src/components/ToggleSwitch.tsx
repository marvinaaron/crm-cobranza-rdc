"use client";

import { useId } from "react";

type Tono = "slate" | "sky" | "pink" | "amber" | "indigo" | "emerald";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  tono?: Tono;
  /** Caja ámbar con ícono de advertencia (cumplimiento · sin pago). */
  destacado?: boolean;
};

const TONO_ON: Record<Tono, string> = {
  slate: "bg-slate-700",
  sky: "bg-sky-500",
  pink: "bg-pink-500",
  amber: "bg-amber-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
};

function IconoAdvertencia() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-amber-600"
      aria-hidden
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  tono = "slate",
  destacado = false,
}: Props) {
  const id = useId();
  const tonoActivo = destacado ? "amber" : tono;

  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 transition-colors ${
        destacado
          ? "p-4 rounded-xl border border-amber-200 bg-amber-50"
          : `p-3 rounded-2xl border ${
              checked
                ? "bg-slate-900/95 border-slate-900"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? TONO_ON[tonoActivo] : "bg-slate-200"
        } ${disabled ? "" : "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300"}`}
      >
        <span
          aria-hidden
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={
            destacado
              ? "text-sm font-semibold text-amber-900 flex items-center gap-2"
              : `text-[10px] font-black uppercase tracking-widest ${
                  checked ? "text-white" : "text-slate-700"
                }`
          }
        >
          {destacado && <IconoAdvertencia />}
          {label}
        </p>
        {description && (
          <p
            className={
              destacado
                ? "text-xs text-amber-700 leading-snug mt-1"
                : `text-[9px] font-bold leading-snug mt-0.5 ${
                    checked ? "text-white/70" : "text-slate-400"
                  }`
            }
          >
            {description}
          </p>
        )}
      </div>
    </label>
  );
}

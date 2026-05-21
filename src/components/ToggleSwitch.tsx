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
};

const TONO_ON: Record<Tono, string> = {
  slate: "bg-slate-700",
  sky: "bg-sky-500",
  pink: "bg-pink-500",
  amber: "bg-amber-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
};

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  tono = "slate",
}: Props) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 p-3 rounded-2xl border ${
        checked
          ? "bg-slate-900/95 border-slate-900"
          : "bg-white border-slate-200 hover:border-slate-300"
      } transition-colors ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? TONO_ON[tono] : "bg-slate-200"
        } ${disabled ? "" : "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300"}`}
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
          className={`text-[10px] font-black uppercase tracking-widest ${
            checked ? "text-white" : "text-slate-700"
          }`}
        >
          {label}
        </p>
        {description && (
          <p
            className={`text-[9px] font-bold leading-snug mt-0.5 ${
              checked ? "text-white/70" : "text-slate-400"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </label>
  );
}

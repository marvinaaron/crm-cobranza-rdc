"use client";

import { formatFechaIso } from "@/lib/clientes";

function IconoNota({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

type CampoNotaPagoProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  variante?: "ficha" | "sheet";
};

export function CampoNotaPago({
  value,
  onChange,
  placeholder = "Nota (opcional)",
  variante = "ficha",
}: CampoNotaPagoProps) {
  const caja =
    variante === "sheet"
      ? "min-h-[52px] rounded-2xl bg-white dark:bg-[#333336] px-4"
      : "h-9 rounded-xl bg-slate-50 ring-1 ring-black/[0.04] px-3";
  const texto =
    variante === "sheet"
      ? "text-[16px] text-slate-900 dark:text-white"
      : "text-[13px] text-slate-800";
  return (
    <label className={`flex items-center gap-2.5 min-w-0 ${caja}`}>
      <span className="shrink-0 text-slate-400">
        <IconoNota className={variante === "sheet" ? "h-5 w-5" : "h-4 w-4"} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400 ${texto}`}
      />
    </label>
  );
}

type CampoFechaCajaProps = {
  value: string;
  onChange: (v: string) => void;
  max?: string;
  label?: string;
};

export function CampoFechaCaja({
  value,
  onChange,
  max,
  label = "Fecha caja",
}: CampoFechaCajaProps) {
  return (
    <div className="min-w-0">
      <label className="text-[11px] font-semibold text-slate-400">{label}</label>
      <div className="relative mt-0.5 h-9 min-w-0 overflow-hidden rounded-xl border border-slate-200 focus-within:border-emerald-400">
        <span className="pointer-events-none absolute inset-0 flex items-center px-2.5 text-[13px] font-semibold text-slate-800 tabular-nums truncate">
          {formatFechaIso(value)}
        </span>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          max={max}
          title="En qué mes entra el dinero a caja"
          className="absolute inset-0 z-10 w-full min-w-0 max-w-full h-full cursor-pointer opacity-[0.01]"
        />
      </div>
    </div>
  );
}

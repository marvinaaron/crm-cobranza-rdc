"use client";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  className?: string;
  name?: string;
  id?: string;
  /** Marca el recuadro en rojo (validación en vivo). */
  invalid?: boolean;
};

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-10-7-10-7a18.79 18.79 0 0 1 4.06-5.94" />
    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="m1 1 22 22" />
    <path d="M9.5 9.5a3 3 0 0 0 4.95 3" />
  </svg>
);

/**
 * Input de contraseña con botón "mostrar/ocultar".
 * Permite pegar por default (autoComplete y type="password" no lo bloquean).
 */
export default function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  required,
  minLength,
  autoComplete = "current-password",
  className,
  name = "password",
  id,
  invalid,
}: Props) {
  const [visible, setVisible] = useState(false);
  const baseClass = className
    ? className
    : invalid
      ? "w-full px-4 py-3.5 pr-12 rounded-xl border border-rose-300 bg-rose-50/40 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-200"
      : "w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200";
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={baseClass}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${invalid ? "text-rose-400 hover:text-rose-600" : "text-slate-400 hover:text-slate-700"}`}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

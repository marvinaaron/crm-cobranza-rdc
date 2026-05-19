"use client";

import { useMemo, useRef } from "react";
import {
  parseEmailParts,
  isValidEmail,
  sugerirDominios,
  completarEmail,
  normalizarEmail,
} from "@/lib/email";

type Props = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
};

export default function EmailInput({ value, onChange, id = "cliente-email" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const parts = useMemo(() => parseEmailParts(value), [value]);
  const valido = isValidEmail(value);
  const sugerencias = useMemo(() => {
    if (!parts.hasAt || valido) return [];
    return sugerirDominios(parts.domain);
  }, [parts.hasAt, parts.domain, valido]);

  const aplicarDominio = (dominio: string) => {
    onChange(completarEmail(parts.local, dominio));
    inputRef.current?.focus();
  };

  const onInputChange = (raw: string) => {
    const limpio = raw.replace(/\s/g, "").toLowerCase();
    const primerArroba = limpio.indexOf("@");
    if (primerArroba === -1) {
      onChange(limpio);
      return;
    }
    const local = limpio.slice(0, primerArroba);
    const domain = limpio.slice(primerArroba + 1).replace(/@/g, "");
    onChange(`${local}@${domain}`);
  };

  const onBlur = () => {
    if (value.trim()) onChange(normalizarEmail(value));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2 px-1">
        <label
          htmlFor={id}
          className="text-[10px] font-black text-slate-400 uppercase tracking-widest"
        >
          Correo electrónico <span className="text-red-400">*</span>
        </label>
        {valido && (
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Listo
          </span>
        )}
        {parts.hasAt && !valido && parts.local.length > 0 && (
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">
            Elige dominio
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="email"
        required
        autoComplete="email"
        value={value}
        onChange={(e) => onInputChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full bg-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none transition-all border-2 ${
          valido
            ? "border-emerald-500 bg-emerald-50/30"
            : parts.hasAt && parts.local.length > 0
              ? "border-indigo-200 focus:ring-2 focus:ring-indigo-100"
              : "border-transparent focus:ring-2 focus:ring-indigo-100"
        }`}
        placeholder="contacto@empresa.com"
      />

      {parts.hasAt && !valido && sugerencias.length > 0 && (
        <div className="mt-3 p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100">
          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2">
            Completar después de @
          </p>
          <div className="flex flex-wrap gap-2">
            {sugerencias.map((dom) => (
              <button
                key={dom}
                type="button"
                onClick={() => aplicarDominio(dom)}
                className="px-3 py-1.5 rounded-xl bg-white border border-indigo-100 text-[10px] font-black text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
              >
                @{dom}
              </button>
            ))}
          </div>
        </div>
      )}

      {valido && (
        <p className="text-[10px] font-bold text-emerald-600 mt-2 ml-1">
          Correo válido — listo para automatizar envíos
        </p>
      )}
    </div>
  );
}

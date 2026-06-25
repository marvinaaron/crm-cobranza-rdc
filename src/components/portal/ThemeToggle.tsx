"use client";

import { useEffect, useState } from "react";
import { leerTema, RDC_THEME_KEY, type RdcTheme } from "@/components/ThemeController";

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>
);
const AutoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
);

const OPCIONES: { id: RdcTheme; label: string; icon: () => React.ReactElement }[] = [
  { id: "light", label: "Claro", icon: SunIcon },
  { id: "dark", label: "Oscuro", icon: MoonIcon },
  { id: "auto", label: "Automático", icon: AutoIcon },
];

type Props = {
  /** Clave de localStorage donde se guarda la preferencia. */
  storageKey?: string;
  /** Tema por defecto si no hay nada guardado. */
  defaultTema?: RdcTheme;
};

export default function ThemeToggle({
  storageKey = RDC_THEME_KEY,
  defaultTema = "light",
}: Props) {
  const [tema, setTema] = useState<RdcTheme>(defaultTema);

  useEffect(() => {
    setTema(leerTema(storageKey, defaultTema));
  }, [storageKey, defaultTema]);

  function elegir(t: RdcTheme) {
    setTema(t);
    try {
      window.localStorage.setItem(storageKey, t);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("rdc:theme-change"));
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPCIONES.map((op) => {
        const Icon = op.icon;
        const activo = tema === op.id;
        return (
          <button
            key={op.id}
            type="button"
            onClick={() => elegir(op.id)}
            aria-pressed={activo}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border transition-colors ${
              activo
                ? "border-[var(--portal-navy-border)] bg-[var(--portal-navy-soft)] text-[var(--portal-navy)] dark:border-[var(--portal-navy-border)] dark:bg-[var(--portal-navy-soft)]0/15 dark:text-[var(--portal-purple)]"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            <Icon />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {op.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

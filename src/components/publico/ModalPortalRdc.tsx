"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/publico/Logo";

const STORAGE_KEY = "rdc-modal-portal-cerrado";
const DELAY_MS = 4000;

const BENEFICIOS = [
  {
    titulo: "El paso a paso de tu mes",
    texto: "Del previo a la línea de captura, sin adivinar en qué va tu contador.",
  },
  {
    titulo: "Todo en un solo lugar",
    texto: "Acuses, declaraciones y comprobantes. No se pierden en el chat.",
  },
  {
    titulo: "Te avisamos nosotros",
    texto: "No tienes que preguntar “¿ya se declaró?”. El portal te lo dice.",
  },
] as const;

export default function ModalPortalRdc() {
  const pathname = usePathname() ?? "/";
  const [abierto, setAbierto] = useState(false);

  const cerrar = useCallback(() => {
    setAbierto(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* private mode */
    }
    const t = window.setTimeout(() => setAbierto(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierto, cerrar]);

  if (!abierto) return null;

  return (
    <aside
      role="dialog"
      aria-labelledby="modal-portal-rdc-titulo"
      className="fixed z-[240] bottom-4 right-4 left-4 sm:left-auto sm:w-[22.5rem] overflow-hidden rounded-[1.75rem] bg-white dark:bg-black shadow-[0_18px_50px_-8px_rgba(15,23,42,0.28)] ring-1 ring-violet-200/70 dark:ring-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <button
        type="button"
        onClick={cerrar}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 dark:bg-black/50 dark:text-white/80 dark:hover:bg-black/80 dark:hover:text-white transition"
        aria-label="Cerrar"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="relative flex items-center justify-center px-8 py-10 bg-[radial-gradient(120%_90%_at_50%_-10%,#f5f3ff_0%,#ede9fe_38%,#e9d5ff_68%,#faf5ff_100%)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-8 top-2 h-28 w-28 rounded-full bg-violet-300/50 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 bottom-0 h-24 w-24 rounded-full bg-purple-400/40 blur-2xl"
        />
        <Logo mark="rdc" variante="black" alto={44} className="relative" />
      </div>

      <div className="px-6 pt-6 pb-3 bg-white dark:bg-black">
        <h2
          id="modal-portal-rdc-titulo"
          className="text-[1.25rem] font-black leading-snug tracking-tight text-slate-900 dark:text-white pr-6"
        >
          Tu mes fiscal, sin perseguir al contador
        </h2>

        <ul className="mt-4 space-y-3.5">
          {BENEFICIOS.map((b) => (
            <li key={b.titulo}>
              <p className="text-[13px] font-bold leading-tight text-slate-900 dark:text-white">
                {b.titulo}
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-slate-500 dark:text-white/55">
                {b.texto}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-slate-100 dark:border-white/10 bg-white dark:bg-black px-6 py-4">
        <Link
          href="/empezar"
          onClick={cerrar}
          className="flex h-11 w-full items-center justify-center rounded-full bg-slate-900 text-[13px] font-bold text-white hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-violet-50 transition"
        >
          Quiero mi portal
        </Link>
      </div>
    </aside>
  );
}

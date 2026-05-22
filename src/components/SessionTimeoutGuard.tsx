"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

/** Minutos de inactividad antes de cerrar la sesión. */
const TIEMPO_INACTIVIDAD_MIN = 30;
/** Segundos de aviso ANTES de cerrar (modal "tu sesión está por expirar"). */
const SEGUNDOS_AVISO = 60;

const INACTIVIDAD_MS = TIEMPO_INACTIVIDAD_MIN * 60 * 1000;
const AVISO_MS = SEGUNDOS_AVISO * 1000;

const EVENTOS_ACTIVIDAD = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "visibilitychange",
] as const;

type Props = {
  /** A dónde mandar al cerrar sesión (login del admin o del portal). */
  rutaLogin: string;
  /** Callback opcional cuando se cierra sesión (limpiar estados locales). */
  onCerrarSesion?: () => void;
};

/**
 * Cierra la sesión Supabase automáticamente tras N minutos de inactividad.
 * Muestra un modal de aviso 60 segundos antes de cerrar para que el usuario
 * pueda continuar trabajando sin perder cambios.
 *
 * Eventos que cuentan como "actividad": click, tecla, scroll, touch y volver a
 * la pestaña.
 */
export default function SessionTimeoutGuard({ rutaLogin, onCerrarSesion }: Props) {
  const router = useRouter();
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(SEGUNDOS_AVISO);

  const timerCierre = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerAviso = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const limpiarTimers = useCallback(() => {
    if (timerCierre.current) {
      clearTimeout(timerCierre.current);
      timerCierre.current = null;
    }
    if (timerAviso.current) {
      clearTimeout(timerAviso.current);
      timerAviso.current = null;
    }
    if (tickInterval.current) {
      clearInterval(tickInterval.current);
      tickInterval.current = null;
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    limpiarTimers();
    setMostrarAviso(false);
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
    } catch {
      // ignoramos errores; igual mandamos al login
    }
    onCerrarSesion?.();
    router.replace(rutaLogin);
    router.refresh();
  }, [limpiarTimers, onCerrarSesion, router, rutaLogin]);

  const reiniciarTemporizador = useCallback(() => {
    limpiarTimers();
    setMostrarAviso(false);
    setSegundosRestantes(SEGUNDOS_AVISO);

    timerAviso.current = setTimeout(() => {
      setMostrarAviso(true);
      setSegundosRestantes(SEGUNDOS_AVISO);
      tickInterval.current = setInterval(() => {
        setSegundosRestantes((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }, INACTIVIDAD_MS - AVISO_MS);

    timerCierre.current = setTimeout(() => {
      void cerrarSesion();
    }, INACTIVIDAD_MS);
  }, [cerrarSesion, limpiarTimers]);

  useEffect(() => {
    reiniciarTemporizador();

    const handler = () => reiniciarTemporizador();
    for (const evt of EVENTOS_ACTIVIDAD) {
      window.addEventListener(evt, handler, { passive: true });
    }
    return () => {
      for (const evt of EVENTOS_ACTIVIDAD) {
        window.removeEventListener(evt, handler);
      }
      limpiarTimers();
    };
  }, [reiniciarTemporizador, limpiarTimers]);

  if (!mostrarAviso) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="sesion-titulo"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <div>
              <h2 id="sesion-titulo" className="text-base font-black text-slate-900 leading-tight">
                Tu sesión está por expirar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Por seguridad, cerraremos tu sesión por inactividad.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 text-center">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Cerrará en
          </p>
          <p className="mt-1 text-5xl font-black tabular-nums text-slate-900 leading-none">
            {segundosRestantes}
          </p>
          <p className="mt-2 text-xs text-slate-500">segundos</p>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row gap-2 justify-end">
          <button
            type="button"
            onClick={() => void cerrarSesion()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cerrar sesión ahora
          </button>
          <button
            type="button"
            onClick={reiniciarTemporizador}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Seguir trabajando
          </button>
        </div>
      </div>
    </div>
  );
}

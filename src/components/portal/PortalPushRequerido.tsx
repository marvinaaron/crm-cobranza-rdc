"use client";

import { useCallback, useEffect, useState } from "react";
import {
  activarPushParaCliente,
  pushActivoEnDispositivo,
  pushSoportado,
  estadoPermisoPush,
  PUSH_OPCION_STORAGE,
} from "@/lib/push/client";

type Estado = "cargando" | "activo" | "bloqueado" | "denegado" | "no-soportado" | "omitido";

/**
 * Recordatorio de notificaciones push. No bloquea la navegación del portal:
 * el cliente puede seguir usando el sitio y activar push cuando quiera.
 */
export default function PortalPushRequerido() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verificar = useCallback(async () => {
    if (typeof window !== "undefined") {
      try {
        if (localStorage.getItem(PUSH_OPCION_STORAGE) === "omitir") {
          setEstado("omitido");
          return;
        }
      } catch {
        /* ignore */
      }
    }
    if (!pushSoportado()) {
      setEstado("no-soportado");
      return;
    }
    if (estadoPermisoPush() === "denied") {
      setEstado("denegado");
      return;
    }
    const activo = await pushActivoEnDispositivo();
    setEstado(activo ? "activo" : "bloqueado");
  }, []);

  useEffect(() => {
    void verificar();
    const onVis = () => void verificar();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [verificar]);

  useEffect(() => {
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [estado]);

  const omitirPorAhora = () => {
    try {
      localStorage.setItem(PUSH_OPCION_STORAGE, "omitir");
    } catch {
      /* ignore */
    }
    setEstado("omitido");
  };

  const activar = async () => {
    setTrabajando(true);
    setError(null);
    const r = await activarPushParaCliente();
    setTrabajando(false);
    if (r.ok) {
      setEstado("activo");
      return;
    }
    if (r.razon === "denegado") {
      setEstado("denegado");
      setError(
        "El navegador bloqueó las notificaciones. Actívalas en los permisos del sitio e intenta de nuevo."
      );
      return;
    }
    setError("No se pudieron activar. Intenta de nuevo.");
    void verificar();
  };

  if (estado === "cargando" || estado === "activo" || estado === "omitido") return null;

  return (
    <div
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-[45] sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm"
      role="dialog"
      aria-modal="false"
      aria-labelledby="portal-push-titulo"
    >
      <div className="relative w-full rounded-2xl border-2 border-violet-400/80 bg-white shadow-[0_0_40px_rgba(139,92,246,0.35)] dark:bg-[#0f172a] dark:border-violet-500/50">
        <button
          type="button"
          onClick={omitirPorAhora}
          aria-label="Cerrar aviso de notificaciones"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
        >
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
            aria-hidden
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="px-6 pt-7 pb-6 sm:p-8">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 dark:text-violet-400 text-center mt-4">
            Recomendado
          </p>
          <h2
            id="portal-push-titulo"
            className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center mt-1 leading-tight"
          >
            Activa las notificaciones
          </h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center mt-3 leading-relaxed">
            Este portal te avisa de plazos del SAT, honorarios e impuestos. Actívalas
            para no perder avisos importantes.
          </p>

          {estado === "denegado" && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200 leading-relaxed">
                Las notificaciones están bloqueadas en tu navegador. Ve a{" "}
                <strong>Ajustes del sitio → Notificaciones → Permitir</strong> y vuelve aquí.
              </p>
            </div>
          )}

          {estado === "no-soportado" && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                Tu navegador no admite notificaciones push. Instala el portal como app (Agregar a
                inicio) desde Chrome o Safari en tu teléfono.
              </p>
            </div>
          )}

          {error && (
            <p className="mt-3 text-xs font-bold text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          )}

          {estado !== "no-soportado" && (
            <button
              type="button"
              onClick={() => void activar()}
              disabled={trabajando}
              className="mt-6 w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60 shadow-lg shadow-violet-600/30 transition-colors"
            >
              {trabajando ? "Activando…" : "Activar notificaciones ahora"}
            </button>
          )}

          <button
            type="button"
            onClick={omitirPorAhora}
            className="mt-3 w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Ahora no, entrar al portal
          </button>

          {estado === "no-soportado" && (
            <button
              type="button"
              onClick={() => void verificar()}
              className="mt-6 w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-slate-800 text-white hover:bg-slate-900 dark:bg-white dark:text-slate-900"
            >
              Ya las activé · verificar
            </button>
          )}

          <p className="text-[10px] font-bold text-slate-400 text-center mt-4">
            Puedes seguir navegando; te recomendamos activarlas para no perder avisos.
          </p>
        </div>
      </div>
    </div>
  );
}

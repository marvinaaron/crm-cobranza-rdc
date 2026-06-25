"use client";

import { useCallback, useEffect, useState } from "react";
import {
  activarPushParaCliente,
  pushActivoEnDispositivo,
  pushSoportado,
  estadoPermisoPush,
} from "@/lib/push/client";

type Estado = "cargando" | "activo" | "bloqueado" | "denegado" | "no-soportado";

/**
 * Modal bloqueante hasta que el cliente active notificaciones push.
 * El portal depende de ellas para avisos fiscales, honorarios y cumplimiento.
 */
export default function PortalPushRequerido() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verificar = useCallback(async () => {
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
    if (estado === "activo" || estado === "cargando") {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [estado]);

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

  if (estado === "cargando" || estado === "activo") return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-push-titulo"
    >
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" aria-hidden />

      <div className="relative w-full sm:max-w-md animate-[pulse_2.5s_ease-in-out_infinite] rounded-t-[1.75rem] sm:rounded-[1.75rem] border-2 border-violet-400/80 bg-white shadow-[0_0_40px_rgba(139,92,246,0.35)] dark:bg-[#0f172a] dark:border-violet-500/50">
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
            Requerido para usar el portal
          </p>
          <h2
            id="portal-push-titulo"
            className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center mt-1 leading-tight"
          >
            Activa las notificaciones
          </h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center mt-3 leading-relaxed">
            Este portal te avisa de plazos del SAT, honorarios e impuestos.{" "}
            <strong className="text-slate-800 dark:text-white">
              Sin notificaciones no funciona como debe.
            </strong>{" "}
            Tócalo abajo y elige <strong>Permitir</strong>.
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
            No podrás usar el portal con normalidad hasta activarlas.
          </p>
        </div>
      </div>
    </div>
  );
}

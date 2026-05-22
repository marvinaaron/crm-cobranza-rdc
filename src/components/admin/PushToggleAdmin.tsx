"use client";

import { useEffect, useState } from "react";
import {
  activarPushParaAdmin,
  desactivarPushParaAdmin,
  estadoPermisoPush,
  pushSoportado,
  registrarServiceWorker,
} from "@/lib/push/client";

type Estado = "cargando" | "no-soportado" | "denegado" | "inactivo" | "activo";

/** Toggle de notificaciones push para administradores del despacho. */
export default function PushToggleAdmin() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      if (!pushSoportado()) {
        if (activo) setEstado("no-soportado");
        return;
      }
      const permiso = estadoPermisoPush();
      if (permiso === "denied") {
        if (activo) setEstado("denegado");
        return;
      }
      const reg = await registrarServiceWorker();
      const sub = await reg?.pushManager.getSubscription();
      if (!activo) return;
      setEstado(sub ? "activo" : "inactivo");
    })();
    return () => {
      activo = false;
    };
  }, []);

  const handleActivar = async () => {
    setTrabajando(true);
    setMensaje(null);
    const r = await activarPushParaAdmin();
    setTrabajando(false);
    if (r.ok) {
      setEstado("activo");
      setMensaje(
        r.mensaje === "creada"
          ? "Notificaciones activadas en este dispositivo."
          : "Este dispositivo ya estaba suscrito."
      );
    } else {
      if (r.razon === "denegado") {
        setEstado("denegado");
        setMensaje(
          "El navegador bloqueó las notificaciones. Actívalas manualmente en los permisos del sitio."
        );
      } else if (r.razon === "no-soportado") {
        setEstado("no-soportado");
      } else {
        setMensaje("No fue posible activar las notificaciones. Intenta de nuevo.");
      }
    }
  };

  const handleDesactivar = async () => {
    setTrabajando(true);
    setMensaje(null);
    const ok = await desactivarPushParaAdmin();
    setTrabajando(false);
    if (ok) {
      setEstado("inactivo");
      setMensaje("Notificaciones desactivadas en este dispositivo.");
    } else {
      setMensaje("No se pudo desactivar. Intenta recargar la página.");
    }
  };

  if (estado === "cargando") {
    return (
      <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Cargando preferencias…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900">
            Notificaciones en tiempo real
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Recibe avisos en tu celular o computadora cuando un cliente sube un
            comprobante, paga, o vence un plazo —aunque no tengas el CRM
            abierto.
          </p>
        </div>
        <span
          className={`inline-flex h-2.5 w-2.5 rounded-full mt-1.5 ${
            estado === "activo"
              ? "bg-emerald-500"
              : estado === "denegado" || estado === "no-soportado"
              ? "bg-rose-400"
              : "bg-slate-300"
          }`}
          aria-hidden
        />
      </div>

      {mensaje ? (
        <p
          className={`mt-3 text-xs ${
            estado === "activo" ? "text-emerald-700" : "text-slate-600"
          }`}
        >
          {mensaje}
        </p>
      ) : null}

      <div className="mt-4">
        {estado === "no-soportado" ? (
          <p className="text-xs text-rose-700 leading-relaxed">
            Este navegador no soporta notificaciones push. Te recomendamos usar
            Chrome, Edge, Firefox o Safari recientes. En iPhone, instala el CRM
            en la pantalla de inicio para activarlas.
          </p>
        ) : estado === "denegado" ? (
          <p className="text-xs text-rose-700 leading-relaxed">
            Las notificaciones están bloqueadas para este sitio. Abre los
            permisos del navegador y permite las notificaciones para volver a
            activarlas.
          </p>
        ) : estado === "activo" ? (
          <button
            type="button"
            disabled={trabajando}
            onClick={handleDesactivar}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ring-1 ring-slate-200 bg-white text-slate-700 hover:ring-slate-900 transition-colors disabled:opacity-50"
          >
            {trabajando ? "Desactivando…" : "Desactivar en este dispositivo"}
          </button>
        ) : (
          <button
            type="button"
            disabled={trabajando}
            onClick={handleActivar}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {trabajando ? "Activando…" : "Activar notificaciones"}
          </button>
        )}
      </div>
    </div>
  );
}

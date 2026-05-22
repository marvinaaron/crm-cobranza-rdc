"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_TEMA = "rdc-admin-pwa-icon-theme";

function temaActual(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function esAccesoDirecto(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari iOS legacy
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

/**
 * iOS guarda el ícono del acceso directo al instalarlo y no lo cambia cuando
 * el usuario alterna modo claro/oscuro. Este aviso explica cómo actualizarlo.
 */
export default function AdminPwaIconoAviso() {
  const [visible, setVisible] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [temaNuevo, setTemaNuevo] = useState<"light" | "dark">("light");

  const revisar = useCallback(() => {
    if (!esAccesoDirecto()) return;
    const actual = temaActual();
    const guardado = localStorage.getItem(STORAGE_TEMA) as "light" | "dark" | null;
    if (guardado && guardado !== actual) {
      setTemaNuevo(actual);
      setVisible(true);
      return;
    }
    if (!guardado) {
      localStorage.setItem(STORAGE_TEMA, actual);
    }
  }, []);

  useEffect(() => {
    revisar();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => revisar();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [revisar]);

  const marcarSincronizado = () => {
    localStorage.setItem(STORAGE_TEMA, temaNuevo);
    setVisible(false);
    setExpandido(false);
  };

  if (!visible) return null;

  const esOscuro = temaNuevo === "dark";

  return (
    <div
      role="status"
      className="mb-4 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm shadow-sm"
    >
      <p className="font-black text-violet-900 text-[11px] uppercase tracking-widest">
        Ícono del acceso directo
      </p>
      <p className="mt-1 text-slate-700 leading-snug">
        Cambiaste a modo <span className="font-bold">{esOscuro ? "oscuro" : "claro"}</span>.
        En iPhone el ícono de la pantalla de inicio{" "}
        <span className="font-bold">no se actualiza solo</span> (limitación de iOS).
      </p>

      {expandido ? (
        <ol className="mt-2 ml-4 list-decimal text-slate-600 text-[12px] space-y-1">
          <li>Mantén pulsado el ícono de RDC Admin en inicio → <strong>Eliminar app</strong>.</li>
          <li>
            Abre Safari con modo {esOscuro ? "oscuro" : "claro"} activo y entra al dashboard.
          </li>
          <li>
            Compartir → <strong>Añadir a pantalla de inicio</strong> (se instalará el ícono{" "}
            {esOscuro ? "negro con R violeta" : "violeta con R blanca"}).
          </li>
        </ol>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest"
        >
          {expandido ? "Ocultar pasos" : "Cómo actualizarlo"}
        </button>
        <button
          type="button"
          onClick={marcarSincronizado}
          className="px-3 py-1.5 rounded-lg bg-white text-violet-700 ring-1 ring-violet-200 text-[10px] font-black uppercase tracking-widest"
        >
          Ya lo actualicé
        </button>
      </div>
    </div>
  );
}

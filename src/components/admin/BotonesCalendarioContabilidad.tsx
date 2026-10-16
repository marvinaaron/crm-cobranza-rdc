"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "rdc-contabilidad-cal-suscrito";

type MetaCal = {
  nombreCal: string;
  total: number;
  httpsUrl: string;
  webcalUrl: string;
  google: string;
  outlook: string;
};

function marcarSuscripcion() {
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  } catch {
    /* no-op */
  }
}

type Props = {
  compacto?: boolean;
  /** Si llega, el .ics baja la agenda del mes (no eventos sueltos). */
  onDescargarIcs?: () => void;
};

export default function BotonesCalendarioContabilidad({
  compacto = false,
  onDescargarIcs,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [meta, setMeta] = useState<MetaCal | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const cargarMeta = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/contabilidad/calendario?meta=1", {
        cache: "no-store",
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "No se pudo cargar el calendario.");
      setMeta(data as MetaCal);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!abierto || meta) return;
    void cargarMeta();
  }, [abierto, meta, cargarMeta]);

  useEffect(() => {
    if (!abierto) return;
    function cerrar(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, [abierto]);

  function alSuscribir() {
    marcarSuscripcion();
  }

  const btn =
    "h-10 w-10 inline-flex items-center justify-center rounded-full transition-colors " +
    (compacto
      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
      : "bg-slate-900 text-white hover:bg-slate-800");

  return (
    <div className="relative shrink-0" ref={panelRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={btn}
        aria-label="Agregar agenda al calendario"
        title="Bajar la agenda del mes a Apple, Google, Outlook o .ics"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {abierto ? (
        <div className="absolute right-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 p-2">
          {cargando ? (
            <p className="px-3 py-2 text-[12px] text-slate-400">Cargando…</p>
          ) : null}
          {error ? (
            <p className="px-3 py-2 text-[12px] text-red-600">{error}</p>
          ) : null}
          {meta && !cargando ? (
            <div className="w-[16.5rem]">
              <div className="flex items-center gap-1">
                <a
                  href={meta.webcalUrl}
                  onClick={(e) => {
                    alSuscribir();
                    const enApp = window.matchMedia(
                      "(display-mode: standalone)"
                    ).matches;
                    if (enApp) {
                      e.preventDefault();
                      window.location.href = meta.webcalUrl;
                    }
                  }}
                  title="Apple Calendar"
                  aria-label="Apple Calendar"
                  className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-slate-900 hover:bg-slate-100"
                >
                  <LogoApple />
                </a>
                <a
                  href={meta.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={alSuscribir}
                  title="Google Calendar"
                  aria-label="Google Calendar"
                  className="h-11 w-11 inline-flex items-center justify-center rounded-xl hover:bg-slate-100"
                >
                  <LogoGoogle />
                </a>
                <a
                  href={meta.outlook}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={alSuscribir}
                  title="Outlook"
                  aria-label="Outlook"
                  className="h-11 w-11 inline-flex items-center justify-center rounded-xl hover:bg-slate-100"
                >
                  <LogoOutlook />
                </a>
                {onDescargarIcs ? (
                  <button
                    type="button"
                    onClick={() => {
                      onDescargarIcs();
                      setAbierto(false);
                    }}
                    title="Descargar .ics del mes"
                    aria-label="Descargar .ics del mes"
                    className="h-11 px-2.5 inline-flex items-center justify-center rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-100"
                  >
                    .ics
                  </button>
                ) : (
                  <a
                    href="/api/admin/contabilidad/calendario"
                    download="contabilidades-rdc.ics"
                    title="Descargar .ics"
                    aria-label="Descargar .ics"
                    className="h-11 px-2.5 inline-flex items-center justify-center rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-100"
                  >
                    .ics
                  </a>
                )}
              </div>
              <p className="px-1.5 pt-2 pb-1 text-[11px] leading-snug text-slate-500">
                Apple no muestra una API: abre Calendario y pide
                suscribirte. Si solo abre la app, elige el calendario
                <span className="font-semibold text-slate-700">
                  {" "}
                  Contabilidades · RDC
                </span>{" "}
                abajo en Calendarios.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LogoApple() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.37 12.62c.03-2.25 1.84-3.33 1.92-3.38-1.05-1.53-2.68-1.74-3.26-1.76-1.39-.14-2.71.82-3.41.82-.7 0-1.79-.8-2.94-.78-1.51.02-2.9.88-3.67 2.23-1.57 2.72-.4 6.75 1.12 8.96.75 1.08 1.64 2.29 2.81 2.25 1.13-.05 1.56-.73 2.93-.73 1.36 0 1.75.73 2.94.71 1.22-.02 1.98-1.1 2.72-2.19.86-1.26 1.21-2.48 1.23-2.54-.03-.01-2.36-.9-2.39-3.59zM14.46 5.9c.62-.75 1.04-1.79.93-2.83-.9.04-1.99.6-2.63 1.35-.58.67-1.08 1.74-.95 2.77 1 .08 2.03-.51 2.65-1.29z" />
    </svg>
  );
}

function LogoGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.42z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.35l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.81-1.76-5.6-4.12H3.07v2.58A10 10 0 0 0 12 22z" />
      <path fill="#FBBC05" d="M6.4 13.99A6 6 0 0 1 6.08 12c0-.69.12-1.36.32-1.99V7.43H3.07A10 10 0 0 0 2 12c0 1.62.39 3.14 1.07 4.57l3.33-2.58z" />
      <path fill="#EA4335" d="M12 5.89c1.47 0 2.79.5 3.82 1.5l2.87-2.87C16.95 2.89 14.7 2 12 2 7.94 2 4.43 4.34 3.07 7.43l3.33 2.58C7.19 7.65 9.4 5.89 12 5.89z" />
    </svg>
  );
}

function LogoOutlook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#0078D4" d="M3 5.5A2.5 2.5 0 0 1 5.5 3H13v18H5.5A2.5 2.5 0 0 1 3 18.5v-13z" />
      <path fill="#28A8EA" d="M13 7h5.5A2.5 2.5 0 0 1 21 9.5v5a2.5 2.5 0 0 1-2.5 2.5H13V7z" />
      <circle fill="#fff" cx="8.2" cy="12" r="2.4" />
    </svg>
  );
}

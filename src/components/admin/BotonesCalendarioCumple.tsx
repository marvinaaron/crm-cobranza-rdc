"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "rdc-cumple-cal-suscrito";

type MetaCal = {
  nombreCal: string;
  total: number;
  httpsUrl: string;
  webcalUrl: string;
  google: string;
  outlook: string;
  recomendacion: string;
};

function marcarSuscripcion() {
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  } catch {
    /* no-op */
  }
}

function leerSuscripcion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export default function BotonesCalendarioCumple() {
  const [abierto, setAbierto] = useState(false);
  const [meta, setMeta] = useState<MetaCal | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [suscritoEn, setSuscritoEn] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const cargarMeta = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/cumpleanos/calendario?meta=1", {
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
    setSuscritoEn(leerSuscripcion());
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

  async function copiarUrl() {
    if (!meta?.httpsUrl) return;
    try {
      await navigator.clipboard.writeText(meta.httpsUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* no-op */
    }
  }

  function alSuscribir() {
    marcarSuscripcion();
    setSuscritoEn(leerSuscripcion());
  }

  return (
    <div className="relative shrink-0" ref={panelRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
        title="Suscribir calendario de cumpleaños de clientes activos"
      >
        <svg
          width="14"
          height="14"
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
        <span className="hidden sm:inline">Calendario</span>
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
            Cumple Despacho
          </p>
          <p className="text-sm font-black text-slate-800 mt-0.5 leading-snug">
            Cumpleaños de clientes activos
          </p>

          {cargando && (
            <p className="text-xs text-slate-400 font-bold mt-3">Cargando…</p>
          )}
          {error && (
            <p className="text-xs text-red-600 font-bold mt-3">{error}</p>
          )}

          {meta && !cargando && (
            <>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                {meta.total} fecha{meta.total === 1 ? "" : "s"} en el calendario.
                {" "}
                <span className="text-slate-700 font-semibold">
                  Recomendado: suscripción
                </span>{" "}
                (clientes nuevos entran solos, sin duplicar).
              </p>

              {suscritoEn && (
                <p className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-2 leading-relaxed">
                  Suscripción registrada el{" "}
                  {new Date(suscritoEn).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  . No vuelvas a bajar el .ics si ya te suscribiste.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3">
                <a
                  href={meta.webcalUrl}
                  onClick={alSuscribir}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white py-2.5 text-[10px] font-black uppercase tracking-wider hover:bg-slate-800"
                >
                  Apple
                </a>
                <a
                  href={meta.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={alSuscribir}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 py-2.5 text-[10px] font-black uppercase tracking-wider hover:bg-slate-50"
                >
                  Google
                </a>
                <a
                  href={meta.outlook}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={alSuscribir}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 py-2.5 text-[10px] font-black uppercase tracking-wider hover:bg-slate-50"
                >
                  Outlook
                </a>
                <a
                  href="/api/admin/cumpleanos/calendario"
                  download="cumple-despacho-rdc.ics"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 py-2.5 text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100"
                  title="Descarga única; volver a bajar puede duplicar eventos"
                >
                  .ics
                </a>
              </div>

              <button
                type="button"
                onClick={copiarUrl}
                className="mt-3 w-full text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {copiado ? "¡Liga copiada!" : "Copiar liga de suscripción"}
              </button>

              <p className="mt-2 text-[9px] text-slate-400 leading-relaxed">
                Para dejar de recibir actualizaciones, elimina el calendario
                &quot;Cumple Despacho&quot; en tu app (Desuscribir). No hace falta
                borrar evento por evento.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

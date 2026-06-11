"use client";

import { useMemo, useState } from "react";
import { SITE_URL } from "@/lib/seo/site";
import { SELECCIONES, bandera } from "@/lib/mundial/datos";

/** Construye las ligas de suscripción según la selección elegida. */
function ligas(equipo: string | null) {
  const base = `${SITE_URL}/api/mundial-2026`;
  const qs = equipo ? `?equipo=${encodeURIComponent(equipo)}` : "";
  const httpsUrl = `${base}${qs}`;
  const webcalUrl = httpsUrl.replace(/^https?:\/\//, "webcal://");
  const nombre = equipo
    ? `Mundial 2026 · ${equipo}`
    : "Mundial 2026 · Calendario completo";
  return {
    httpsUrl,
    webcalUrl,
    google: `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(
      webcalUrl
    )}`,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(
      httpsUrl
    )}&name=${encodeURIComponent(nombre)}`,
  };
}

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.365 1.43c0 1.14-.467 2.22-1.22 3.01-.81.86-2.13 1.52-3.23 1.43-.13-1.09.46-2.27 1.2-3.02.82-.86 2.24-1.5 3.25-1.42zM20.5 17.06c-.55 1.27-.82 1.84-1.53 2.97-.99 1.57-2.39 3.52-4.12 3.53-1.54.01-1.94-.99-4.03-.98-2.09.01-2.53.99-4.07.97-1.73-.02-3.05-1.79-4.04-3.36-2.78-4.39-3.07-9.54-1.35-12.28C2.5 5.7 3.95 4.84 5.34 4.84c1.42 0 2.31.99 3.49.99 1.14 0 1.84-.99 3.49-.99 1.25 0 2.57.68 3.51 1.86-3.08 1.69-2.58 6.09.17 7.36z" />
  </svg>
);
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);
const OutlookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden>
    <path d="M13 3h7a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-7v-3h6V6h-6V3z" />
    <path d="M2 5.5 12 4v16L2 18.5v-13zm5 3.2c-1.5 0-2.5 1.3-2.5 3.3s1 3.3 2.5 3.3 2.5-1.3 2.5-3.3-1-3.3-2.5-3.3zm0 1.5c.7 0 1 .8 1 1.8s-.3 1.8-1 1.8-1-.8-1-1.8.3-1.8 1-1.8z" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function BotonesSuscripcionMundial() {
  const [equipo, setEquipo] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const l = useMemo(() => ligas(equipo), [equipo]);

  async function copiarUrl() {
    try {
      await navigator.clipboard.writeText(l.httpsUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-5 sm:p-6 shadow-[0_10px_40px_-20px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-slate-900/60">
      {/* Selector de selección */}
      <div className="mb-5">
        <label
          htmlFor="equipo-mundial"
          className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2"
        >
          ¿Qué partidos quieres agregar?
        </label>
        <div className="relative">
          <select
            id="equipo-mundial"
            value={equipo ?? ""}
            onChange={(e) => setEquipo(e.target.value || null)}
            className="w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/15 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">🏆 Todos los partidos (104)</option>
            {SELECCIONES.map((s) => (
              <option key={s} value={s}>
                {bandera(s)} Solo {s}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        </div>
      </div>

      {/* Botones de suscripción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={l.webcalUrl}
          className="flex items-center justify-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-slate-900/25 transition active:scale-[0.98] hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <AppleIcon />
          Apple / iPhone
        </a>
        <a
          href={l.google}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition active:scale-[0.98] hover:bg-slate-50 dark:border-white/15 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <GoogleIcon />
          Google Calendar
        </a>
        <a
          href={l.outlook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition active:scale-[0.98] hover:bg-slate-50 dark:border-white/15 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <OutlookIcon />
          Outlook
        </a>
        <a
          href={l.httpsUrl}
          download
          className="flex items-center justify-center gap-2.5 rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition active:scale-[0.98] hover:bg-slate-50 dark:border-white/15 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <DownloadIcon />
          Descargar .ics
        </a>
      </div>

      {/* Copiar URL para Android / otros */}
      <button
        type="button"
        onClick={copiarUrl}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
      >
        {copiado ? (
          <>
            <CheckIcon /> ¡Liga copiada!
          </>
        ) : (
          "Copiar liga del calendario (Android / otros)"
        )}
      </button>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
        Al suscribirte, los partidos se actualizan solos en tu calendario.
        Horarios mostrados en tu zona horaria. Cada evento incluye una liga para
        ver el marcador y resumen en Google.
      </p>
    </div>
  );
}

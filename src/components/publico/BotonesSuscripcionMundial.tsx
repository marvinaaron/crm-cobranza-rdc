"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/seo/site";

/** Ligas de suscripción al calendario completo (todo o nada). */
const HTTPS_URL = `${SITE_URL}/api/mundial-2026`;
const WEBCAL_URL = HTTPS_URL.replace(/^https?:\/\//, "webcal://");
const NOMBRE_CAL = "Mundial 2026 · Calendario completo";
const LIGAS = {
  httpsUrl: HTTPS_URL,
  webcalUrl: WEBCAL_URL,
  google: `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(
    WEBCAL_URL
  )}`,
  outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(
    HTTPS_URL
  )}&name=${encodeURIComponent(NOMBRE_CAL)}`,
};

const AppleIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);
const GoogleIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);
const OutlookIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden>
    <path d="M13 3h7a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-7v-3h6V6h-6V3z" />
    <path d="M2 5.5 12 4v16L2 18.5v-13zm5 3.2c-1.5 0-2.5 1.3-2.5 3.3s1 3.3 2.5 3.3 2.5-1.3 2.5-3.3-1-3.3-2.5-3.3zm0 1.5c.7 0 1 .8 1 1.8s-.3 1.8-1 1.8-1-.8-1-1.8.3-1.8 1-1.8z" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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

function CirculoSuscripcion({
  href,
  download,
  externo,
  etiqueta,
  oscuro,
  children,
}: {
  href: string;
  download?: boolean;
  externo?: boolean;
  etiqueta: string;
  oscuro?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      download={download}
      target={externo ? "_blank" : undefined}
      rel={externo ? "noopener noreferrer" : undefined}
      className="group flex flex-col items-center gap-2.5"
    >
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-full shadow-[0_6px_20px_-8px_rgba(15,23,42,0.35)] transition group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_28px_-10px_rgba(15,23,42,0.45)] group-active:scale-95 ${
          oscuro
            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
            : "bg-white text-slate-700 ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-100 dark:ring-white/10"
        }`}
      >
        {children}
      </span>
      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
        {etiqueta}
      </span>
    </a>
  );
}

export default function BotonesSuscripcionMundial() {
  const [copiado, setCopiado] = useState(false);

  async function copiarUrl() {
    try {
      await navigator.clipboard.writeText(LIGAS.httpsUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Botones circulares de suscripción */}
      <div className="flex flex-wrap items-start justify-center gap-7 sm:gap-9">
        <CirculoSuscripcion href={LIGAS.webcalUrl} etiqueta="Apple" oscuro>
          <AppleIcon />
        </CirculoSuscripcion>
        <CirculoSuscripcion href={LIGAS.google} etiqueta="Google" externo>
          <GoogleIcon />
        </CirculoSuscripcion>
        <CirculoSuscripcion href={LIGAS.outlook} etiqueta="Outlook" externo>
          <OutlookIcon />
        </CirculoSuscripcion>
        <CirculoSuscripcion href={LIGAS.httpsUrl} etiqueta=".ics" download>
          <DownloadIcon />
        </CirculoSuscripcion>
      </div>

      {/* Copiar URL para Android / otros */}
      <button
        type="button"
        onClick={copiarUrl}
        className="mt-8 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-indigo-600 dark:hover:text-indigo-300"
      >
        {copiado ? (
          <>
            <CheckIcon /> ¡Liga copiada!
          </>
        ) : (
          "¿Android u otro? Copiar liga del calendario"
        )}
      </button>
    </div>
  );
}

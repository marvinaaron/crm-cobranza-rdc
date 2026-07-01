"use client";

import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

const URL_SUGERENCIAS = CONTACTO_PUBLICO.whatsapp.buildUrl(
  "Hola Aaron, soy cliente de RDC y tengo una sugerencia para mejorar el portal:"
);
const URL_REFERIR = CONTACTO_PUBLICO.whatsapp.buildUrl(
  "Hola Aaron, soy cliente de RDC y quiero referirte a alguien que necesita contador:"
);

function SugerenciasIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ReferirIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

type Props = {
  variante?: "sidebar" | "movil";
};

export default function PortalEnlacesUtilidad({ variante = "sidebar" }: Props) {
  const linkClass =
    variante === "sidebar"
      ? "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-white/80 hover:text-slate-800 transition-colors"
      : "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-slate-500 hover:text-[var(--portal-navy)] transition-colors";

  const iconWrap =
    variante === "sidebar"
      ? "text-slate-400"
      : "text-[var(--portal-navy)]/70";

  return (
    <>
      <a
        href={URL_SUGERENCIAS}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        <span className={iconWrap}>
          <SugerenciasIcon />
        </span>
        Sugerencias
      </a>
      <a
        href={URL_REFERIR}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        <span className={iconWrap}>
          <ReferirIcon />
        </span>
        Refiere amigos
      </a>
    </>
  );
}

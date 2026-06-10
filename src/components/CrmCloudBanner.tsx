"use client";

type Props = {
  error: string | null;
  sincronizando: boolean;
};

const CloudIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/**
 * Indicador discreto de sincronización con Supabase (admin).
 *  - Guardando: chip circular esmerilado con ícono de nube en pulso (sin texto).
 *  - Error: píldora roja con ícono y texto corto (el error sí debe leerse).
 */
export default function CrmCloudBanner({ error, sincronizando }: Props) {
  if (!error && !sincronizando) return null;

  // Por encima de la barra inferior en móvil; esquina en escritorio.
  const pos =
    "fixed right-4 z-40 bottom-[calc(86px+env(safe-area-inset-bottom))] lg:bottom-5";

  if (error) {
    return (
      <div
        role="status"
        className={`${pos} flex items-start gap-2 max-w-[18rem] rounded-2xl px-3.5 py-2.5 bg-rose-600/95 text-white shadow-xl shadow-rose-900/20 backdrop-blur`}
      >
        <span className="mt-0.5 shrink-0">
          <AlertIcon />
        </span>
        <span className="text-[12px] font-semibold leading-snug">
          No se pudo guardar; reintentando…
          <span className="block font-normal text-[11px] text-white/80 line-clamp-2">
            {error}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Guardando en la nube"
      className={`${pos} flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg shadow-slate-900/10 text-violet-600 dark:text-violet-300`}
    >
      <span className="animate-pulse">
        <CloudIcon />
      </span>
    </div>
  );
}

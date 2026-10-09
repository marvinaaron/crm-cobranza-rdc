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

/**
 * Indicador discreto de sincronización con Supabase (admin).
 *  - Error: botón rojo redondo parpadeante (sin texto).
 *  - Guardando: chip esmerilado con ícono de nube en pulso.
 */
export default function CrmCloudBanner({ error, sincronizando }: Props) {
  if (!error && !sincronizando) return null;

  const pos =
    "fixed right-4 z-40 bottom-[calc(86px+env(safe-area-inset-bottom))] lg:bottom-5";

  if (error) {
    return (
      <span
        role="status"
        aria-label="Error al guardar"
        title="No se pudo guardar en la nube"
        className={`${pos} block w-4 h-4 rounded-full bg-rose-500 shadow-lg shadow-rose-500/40 animate-pulse ring-2 ring-white dark:ring-slate-900`}
      />
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

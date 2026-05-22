"use client";

type Props = {
  error: string | null;
  sincronizando: boolean;
};

/** Aviso discreto de sincronización con Supabase (admin). */
export default function CrmCloudBanner({ error, sincronizando }: Props) {
  if (!error && !sincronizando) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-lg px-4 py-2 text-xs font-semibold shadow-lg ${
        error
          ? "bg-red-600 text-white"
          : "bg-slate-800/90 text-white"
      }`}
      role="status"
    >
      {error
        ? `Error al guardar: ${error}`
        : "Guardando en la nube…"}
    </div>
  );
}

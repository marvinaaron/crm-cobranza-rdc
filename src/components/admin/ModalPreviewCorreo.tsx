"use client";

import { useScrollLock } from "@/hooks/useScrollLock";

type Props = {
  abierto: boolean;
  titulo: string;
  subtitulo?: string;
  html: string;
  onCerrar: () => void;
};

/** Vista previa del correo HTML (mismo diseño que recibe el cliente). */
export default function ModalPreviewCorreo({
  abierto,
  titulo,
  subtitulo,
  html,
  onCerrar,
}: Props) {
  useScrollLock(abierto);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Cerrar vista previa"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
        onClick={onCerrar}
      />
      <div className="relative w-full sm:max-w-2xl max-h-[92dvh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
              Vista previa del correo
            </p>
            <h2 className="text-base font-black text-slate-900 truncate">{titulo}</h2>
            {subtitulo ? (
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitulo}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="shrink-0 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto bg-slate-100 p-3 sm:p-4">
          <iframe
            title="Vista previa del correo"
            srcDoc={html}
            className="w-full min-h-[480px] bg-white rounded-xl border border-slate-200 shadow-sm"
            sandbox=""
          />
        </div>
        <div className="px-5 py-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onCerrar}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest"
          >
            Cerrar vista previa
          </button>
        </div>
      </div>
    </div>
  );
}

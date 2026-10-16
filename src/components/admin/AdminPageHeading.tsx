import type { ReactNode } from "react";

type Props = {
  titulo: string;
  subtitulo?: ReactNode;
  acciones?: ReactNode;
};

/**
 * Encabezado de página admin al estilo Inicio:
 * título a la izquierda, herramientas (filtro, calendario, exportar) a la derecha.
 */
export default function AdminPageHeading({ titulo, subtitulo, acciones }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-slate-900 leading-none">
          {titulo}
        </h1>
        {subtitulo ? (
          <p className="mt-2 text-[15px] text-slate-500">{subtitulo}</p>
        ) : null}
      </div>
      {acciones ? (
        <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
          {acciones}
        </div>
      ) : null}
    </header>
  );
}

export const adminBtnPrimario =
  "inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full text-[13px] font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50";

export const adminBtnIcono =
  "relative h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50";

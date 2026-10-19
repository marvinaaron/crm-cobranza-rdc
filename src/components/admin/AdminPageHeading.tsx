import type { ReactNode } from "react";

type Props = {
  titulo: string;
  subtitulo?: ReactNode;
  acciones?: ReactNode;
  /** A la derecha del título en móvil (p. ej. Ingreso extra). En desktop se oculta. */
  accionMovil?: ReactNode;
};

/**
 * Encabezado de página admin al estilo Inicio:
 * título a la izquierda, herramientas (filtro, calendario, exportar) a la derecha.
 */
export default function AdminPageHeading({
  titulo,
  subtitulo,
  acciones,
  accionMovil,
}: Props) {
  return (
    <header className="flex flex-col gap-3 mb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex items-end justify-between gap-3 min-w-0 lg:block">
        <div className="min-w-0">
          <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-slate-900 leading-none">
            {titulo}
          </h1>
          {subtitulo ? (
            <p className="mt-2 text-[15px] text-slate-500">{subtitulo}</p>
          ) : null}
        </div>
        {accionMovil ? (
          <div className="lg:hidden shrink-0">{accionMovil}</div>
        ) : null}
      </div>
      {acciones ? (
        <div className="flex flex-nowrap items-center gap-2 w-full min-w-0 lg:w-auto lg:ml-auto overflow-x-auto">
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

import { bandera } from "@/lib/mundial/datos";
import { calcularGrupos, type GrupoTabla } from "@/lib/mundial/tabla";
import type { PartidoMundial } from "@/lib/mundial/datos";

/**
 * Tablas de la fase de grupos (A–L) en una sola tarjeta con scroll, al estilo
 * sobrio de la página: encabezado oscuro por grupo y filas con bandera, nombre
 * y estadísticas (PJ, G, E, P, DG, PTS). Las dos primeras posiciones llevan una
 * barra de color (clasifican); la tercera, una más tenue (mejores terceros).
 */

function colorPosicion(i: number): string {
  if (i < 2) return "bg-emerald-500";
  if (i === 2) return "bg-amber-400";
  return "bg-transparent";
}

function Grupo({ grupo, filas }: GrupoTabla) {
  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-900 px-4 py-2 dark:border-white/10 dark:bg-white">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-white dark:text-slate-900">
          Grupo {grupo}
        </h3>
      </div>

      {/* Encabezado de columnas */}
      <div className="grid grid-cols-[1.4rem_1fr_repeat(6,1.7rem)] items-center gap-1 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
        <span className="text-center">#</span>
        <span>Equipo</span>
        <span className="text-center">PJ</span>
        <span className="text-center">G</span>
        <span className="text-center">E</span>
        <span className="text-center">P</span>
        <span className="text-center">DG</span>
        <span className="text-center">PTS</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {filas.map((f, i) => (
          <div
            key={f.equipo}
            className="relative grid grid-cols-[1.4rem_1fr_repeat(6,1.7rem)] items-center gap-1 px-3 py-2"
          >
            <span
              className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full ${colorPosicion(i)}`}
              aria-hidden
            />
            <span className="text-center text-xs font-bold text-slate-400 tabular-nums">
              {i + 1}
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-base leading-none">
                {bandera(f.equipo)}
              </span>
              <span className="truncate text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                {f.equipo}
              </span>
            </span>
            <span className="text-center text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {f.pj}
            </span>
            <span className="text-center text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {f.g}
            </span>
            <span className="text-center text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {f.e}
            </span>
            <span className="text-center text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {f.p}
            </span>
            <span className="text-center text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {f.dg > 0 ? `+${f.dg}` : f.dg}
            </span>
            <span className="text-center text-xs font-black text-slate-900 tabular-nums dark:text-white">
              {f.pts}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TablaGruposMundial({
  partidos,
}: {
  partidos: PartidoMundial[];
}) {
  const grupos = calcularGrupos(partidos);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-slate-900">
      <div className="max-h-[30rem] divide-y divide-slate-200 overflow-y-auto dark:divide-white/10">
        {grupos.map((g) => (
          <Grupo key={g.grupo} {...g} />
        ))}
      </div>
    </div>
  );
}

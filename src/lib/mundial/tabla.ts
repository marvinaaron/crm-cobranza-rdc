/**
 * Cálculo de tablas de la fase de grupos del Mundial 2026 a partir de los
 * marcadores ya cargados en los partidos. Las selecciones de cada grupo se
 * derivan del propio fixture, así que no hay que mantener una lista aparte.
 */

import type { PartidoMundial } from "@/lib/mundial/datos";

export type FilaGrupo = {
  equipo: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
};

export type GrupoTabla = {
  grupo: string;
  filas: FilaGrupo[];
};

function filaVacia(equipo: string): FilaGrupo {
  return { equipo, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
}

/** Construye las tablas de cada grupo (A–L) ordenadas por puntos. */
export function calcularGrupos(partidos: PartidoMundial[]): GrupoTabla[] {
  const grupos = new Map<string, Map<string, FilaGrupo>>();

  // 1) Alta de selecciones por grupo según el fixture.
  for (const p of partidos) {
    if (p.fase !== "grupos" || !p.grupo) continue;
    if (!grupos.has(p.grupo)) grupos.set(p.grupo, new Map());
    const g = grupos.get(p.grupo)!;
    for (const eq of [p.local, p.visitante]) {
      if (eq && !g.has(eq)) g.set(eq, filaVacia(eq));
    }
  }

  // 2) Aplicar marcadores disponibles.
  for (const p of partidos) {
    if (p.fase !== "grupos" || !p.grupo || !p.marcador) continue;
    if (!p.local || !p.visitante) continue;
    const m = p.marcador.match(/^(\d+)\s*-\s*(\d+)$/);
    if (!m) continue;
    const gl = Number(m[1]);
    const gv = Number(m[2]);
    const g = grupos.get(p.grupo)!;
    const fl = g.get(p.local);
    const fv = g.get(p.visitante);
    if (!fl || !fv) continue;

    fl.pj++;
    fv.pj++;
    fl.gf += gl;
    fl.gc += gv;
    fv.gf += gv;
    fv.gc += gl;
    if (gl > gv) {
      fl.g++;
      fl.pts += 3;
      fv.p++;
    } else if (gl < gv) {
      fv.g++;
      fv.pts += 3;
      fl.p++;
    } else {
      fl.e++;
      fv.e++;
      fl.pts++;
      fv.pts++;
    }
  }

  // 3) Diferencia de gol + orden.
  const resultado: GrupoTabla[] = [];
  for (const [grupo, mapa] of grupos) {
    const filas = [...mapa.values()];
    for (const f of filas) f.dg = f.gf - f.gc;
    filas.sort(
      (a, b) =>
        b.pts - a.pts ||
        b.dg - a.dg ||
        b.gf - a.gf ||
        a.equipo.localeCompare(b.equipo, "es")
    );
    resultado.push({ grupo, filas });
  }
  resultado.sort((a, b) => a.grupo.localeCompare(b.grupo));
  return resultado;
}

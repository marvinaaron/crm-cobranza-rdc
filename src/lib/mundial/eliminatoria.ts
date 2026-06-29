/**
 * Resuelve cruces de eliminatoria a partir de tablas de grupos (Annex C FIFA)
 * y propaga ganadores/perdedores hacia octavos, cuartos, etc.
 */

import type { PartidoMundial } from "@/lib/mundial/datos";
import { asignacionTercerosAnnexC } from "@/lib/mundial/annex-c";
import { calcularGrupos, type FilaGrupo, type GrupoTabla } from "@/lib/mundial/tabla";

/** Partidos R32 donde el visitante es un 3.º clasificado (Annex C). */
const GANADOR_TERCERO_EN_PARTIDO: Record<number, string> = {
  74: "E",
  77: "I",
  79: "A",
  80: "L",
  81: "D",
  82: "G",
  85: "B",
  87: "K",
};

function clavePar(a: string, b: string): string {
  return [a, b].sort((x, y) => x.localeCompare(y, "es")).join("|");
}

function grupoCerrado(g: GrupoTabla): boolean {
  return g.filas.length === 4 && g.filas.every((f) => f.pj === 3);
}

function todosGruposCerrados(grupos: GrupoTabla[]): boolean {
  return grupos.length === 12 && grupos.every(grupoCerrado);
}

/** Ranking FIFA simplificado para mejores terceros (sin fair play ni ranking FIFA). */
function compararTerceros(a: FilaGrupo, b: FilaGrupo): number {
  return (
    b.pts - a.pts ||
    b.dg - a.dg ||
    b.gf - a.gf ||
    a.equipo.localeCompare(b.equipo, "es")
  );
}

function mejoresTerceros(grupos: GrupoTabla[]): { grupo: string; fila: FilaGrupo }[] {
  const terceros = grupos
    .filter((g) => g.filas.length >= 3)
    .map((g) => ({ grupo: g.grupo, fila: g.filas[2] }));
  return [...terceros].sort((a, b) => compararTerceros(a.fila, b.fila)).slice(0, 8);
}

function parseMarcador(marcador: string): [number, number] | null {
  const m = marcador.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2])];
}

function ganadorPartido(p: PartidoMundial): string | null {
  if (!p.marcador || !p.local || !p.visitante) return null;
  const parsed = parseMarcador(p.marcador);
  if (!parsed) return null;
  const [gl, gv] = parsed;
  if (gl > gv) return p.local;
  if (gv > gl) return p.visitante;
  return null;
}

function perdedorPartido(p: PartidoMundial): string | null {
  if (!p.marcador || !p.local || !p.visitante) return null;
  const parsed = parseMarcador(p.marcador);
  if (!parsed) return null;
  const [gl, gv] = parsed;
  if (gl > gv) return p.visitante;
  if (gv > gl) return p.local;
  return null;
}

function equipoEnPosicion(
  grupos: GrupoTabla[],
  grupo: string,
  posicion: number
): string | null {
  const g = grupos.find((x) => x.grupo === grupo);
  if (!g || !grupoCerrado(g)) return null;
  return g.filas[posicion]?.equipo ?? null;
}

function resolverEtiqueta(
  etiqueta: string | undefined,
  partido: PartidoMundial,
  grupos: GrupoTabla[],
  annexMap: Record<string, string>,
  porN: Map<number, PartidoMundial>
): string | null {
  if (!etiqueta) return null;

  const posGrupo = etiqueta.match(/^([12])\.º Grupo ([A-L])$/);
  if (posGrupo) {
    const pos = Number(posGrupo[1]) - 1;
    return equipoEnPosicion(grupos, posGrupo[2], pos);
  }

  if (etiqueta.startsWith("3.º")) {
    const ganadorGrupo = GANADOR_TERCERO_EN_PARTIDO[partido.n];
    if (!ganadorGrupo) return null;
    const terceroGrupo = annexMap[ganadorGrupo];
    if (!terceroGrupo) return null;
    return equipoEnPosicion(grupos, terceroGrupo, 2);
  }

  const ref = etiqueta.match(/^(Ganador|Perdedor) P(\d+)$/);
  if (ref) {
    const origen = porN.get(Number(ref[2]));
    if (!origen) return null;
    return ref[1] === "Ganador" ? ganadorPartido(origen) : perdedorPartido(origen);
  }

  return null;
}

function aplicarResultadosPorPar(
  partidos: PartidoMundial[],
  porPar: Map<string, string>
): PartidoMundial[] {
  if (porPar.size === 0) return partidos;
  return partidos.map((p) => {
    if (p.marcador || !p.local || !p.visitante) return p;
    const raw = porPar.get(clavePar(p.local, p.visitante));
    if (!raw) return p;
    const [g1, g2] = raw.split("-").map(Number);
    if (!Number.isFinite(g1) || !Number.isFinite(g2)) return p;
    const [primero] = [p.local, p.visitante].sort((x, y) =>
      x.localeCompare(y, "es")
    );
    const marcador = p.local === primero ? `${g1}-${g2}` : `${g2}-${g1}`;
    return { ...p, marcador };
  });
}

function rellenarCruces(
  porN: Map<number, PartidoMundial>,
  grupos: GrupoTabla[],
  annexMap: Record<string, string>,
  desde: number,
  hasta: number
): void {
  for (let n = desde; n <= hasta; n++) {
    const p = porN.get(n);
    if (!p) continue;
    const local =
      resolverEtiqueta(p.etiquetaLocal, p, grupos, annexMap, porN) ?? p.local;
    const visitante =
      resolverEtiqueta(p.etiquetaVisitante, p, grupos, annexMap, porN) ??
      p.visitante;
    porN.set(n, { ...p, local, visitante });
  }
}

/**
 * A partir de marcadores de grupos (y eliminatoria si ya hay equipos + API),
 * rellena selecciones en dieciseisavos→final y propaga ganadores.
 */
export function resolverEliminatoria(
  partidos: PartidoMundial[],
  resultadosPorPar: Map<string, string> = new Map()
): PartidoMundial[] {
  const porN = new Map<number, PartidoMundial>();
  for (const p of partidos) {
    porN.set(p.n, { ...p });
  }

  const grupos = calcularGrupos([...porN.values()]);
  const annexMap = todosGruposCerrados(grupos)
    ? asignacionTercerosAnnexC(mejoresTerceros(grupos).map((t) => t.grupo))
    : {};

  rellenarCruces(porN, grupos, annexMap, 73, 88);

  let lista = [...porN.values()].sort((a, b) => a.n - b.n);
  lista = aplicarResultadosPorPar(lista, resultadosPorPar);
  for (const p of lista) porN.set(p.n, p);

  for (let paso = 0; paso < 3; paso++) {
    rellenarCruces(porN, grupos, annexMap, 89, 104);
    lista = [...porN.values()].sort((a, b) => a.n - b.n);
    lista = aplicarResultadosPorPar(lista, resultadosPorPar);
    for (const p of lista) porN.set(p.n, p);
  }

  return lista;
}

export function prepararPartidosMundial(
  partidosBase: PartidoMundial[],
  resultados: {
    porNumero: Record<number, string>;
    porPar: Map<string, string>;
  }
): PartidoMundial[] {
  const conMarcadores = partidosBase.map((p) =>
    resultados.porNumero[p.n] ? { ...p, marcador: resultados.porNumero[p.n] } : p
  );
  return resolverEliminatoria(conMarcadores, resultados.porPar);
}

/**
 * Resultados automáticos del Mundial 2026.
 *
 * Obtiene los marcadores finales desde una API pública y los empata con
 * nuestro fixture por par de selecciones (en fase de grupos cada par juega
 * una sola vez, así que el emparejamiento es único y no depende de horarios
 * ni husos). El resultado es un mapa { númeroDePartido: "local-visitante" }
 * que el .ics y la página usan para actualizar el título del evento.
 *
 * Diseño a prueba de fallos: si la API no responde o cambia, esta función
 * regresa {} y el calendario sigue mostrando horarios y banderas sin marcador.
 *
 * Proveedores (en orden):
 *   1. football-data.org  → si existe FOOTBALL_DATA_API_TOKEN (gratis, 1 min
 *      de registro). Datos muy confiables.
 *   2. TheSportsDB (gratis, sin llave) → respaldo automático. Usa
 *      eventsround.php (eventsseason.php solo devuelve ~15 partidos).
 */

import { EQUIPOS, PARTIDOS } from "@/lib/mundial/datos";

/** Revalidación de marcadores en página y .ics (segundos). */
const REVALIDAR_RESULTADOS = 300;

/** Marcadores reales ya jugados que sembramos a mano (respaldo siempre vivo). */
const MARCADORES_SEMILLA: Record<number, string> = {
  1: "2-0", // México 2-0 Sudáfrica (partido inaugural)
};

/** Alias de nombres en inglés / variantes → nombre canónico (clave de EQUIPOS). */
const ALIAS: Record<string, string> = {
  mexico: "México",
  "south africa": "Sudáfrica",
  "south korea": "Corea del Sur",
  "korea republic": "Corea del Sur",
  czechia: "República Checa",
  "czech republic": "República Checa",
  canada: "Canadá",
  "bosnia and herzegovina": "Bosnia y Herzegovina",
  "bosnia & herzegovina": "Bosnia y Herzegovina",
  "bosnia-herzegovina": "Bosnia y Herzegovina",
  qatar: "Catar",
  switzerland: "Suiza",
  brazil: "Brasil",
  morocco: "Marruecos",
  haiti: "Haití",
  scotland: "Escocia",
  "united states": "Estados Unidos",
  usa: "Estados Unidos",
  "united states of america": "Estados Unidos",
  paraguay: "Paraguay",
  australia: "Australia",
  turkey: "Turquía",
  turkiye: "Turquía",
  germany: "Alemania",
  curacao: "Curazao",
  "ivory coast": "Costa de Marfil",
  "cote d'ivoire": "Costa de Marfil",
  ecuador: "Ecuador",
  netherlands: "Países Bajos",
  japan: "Japón",
  sweden: "Suecia",
  tunisia: "Túnez",
  belgium: "Bélgica",
  egypt: "Egipto",
  iran: "Irán",
  "ir iran": "Irán",
  "new zealand": "Nueva Zelanda",
  spain: "España",
  "cape verde": "Cabo Verde",
  "saudi arabia": "Arabia Saudita",
  uruguay: "Uruguay",
  france: "Francia",
  senegal: "Senegal",
  iraq: "Irak",
  norway: "Noruega",
  argentina: "Argentina",
  algeria: "Argelia",
  austria: "Austria",
  jordan: "Jordania",
  portugal: "Portugal",
  "dr congo": "RD del Congo",
  "congo dr": "RD del Congo",
  "democratic republic of congo": "RD del Congo",
  "dr congo (kinshasa)": "RD del Congo",
  uzbekistan: "Uzbekistán",
  colombia: "Colombia",
  england: "Inglaterra",
  croatia: "Croacia",
  ghana: "Ghana",
  panama: "Panamá",
};

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// nombre (en cualquier idioma) → nombre canónico en español.
const CANONICO: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const nombre of Object.keys(EQUIPOS)) m[norm(nombre)] = nombre;
  for (const [alias, canon] of Object.entries(ALIAS)) m[norm(alias)] = canon;
  return m;
})();

function resolver(nombre: string | undefined | null): string | null {
  if (!nombre) return null;
  return CANONICO[norm(nombre)] ?? null;
}

function clavePar(a: string, b: string): string {
  return [a, b].sort((x, y) => x.localeCompare(y)).join("|");
}

// par de selecciones (orden indistinto) → { n, local } de fase de grupos.
const LOOKUP_GRUPOS: Map<string, { n: number; local: string }> = (() => {
  const m = new Map<string, { n: number; local: string }>();
  for (const p of PARTIDOS) {
    if (p.fase === "grupos" && p.local && p.visitante) {
      m.set(clavePar(p.local, p.visitante), { n: p.n, local: p.local });
    }
  }
  return m;
})();

export type ResultadosMundial = {
  porNumero: Record<number, string>;
  porPar: Map<string, string>;
};

function registrarMarcador(
  destino: ResultadosMundial,
  n: number,
  local: string,
  visitante: string,
  marcador: string
): void {
  destino.porNumero[n] = marcador;
  destino.porPar.set(clavePar(local, visitante), marcador);
}

type PartidoApi = {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
};

/** Empata un partido de la API con nuestro fixture y registra el marcador. */
function asignar(destino: ResultadosMundial, partido: PartidoApi): void {
  const home = resolver(partido.home);
  const away = resolver(partido.away);
  if (!home || !away) return;

  const [eqA, eqB] = [home, away].sort((x, y) => x.localeCompare(y, "es"));
  const golesA = eqA === home ? partido.homeScore : partido.awayScore;
  const golesB = eqB === home ? partido.homeScore : partido.awayScore;
  const marcadorPar = `${golesA}-${golesB}`;
  destino.porPar.set(clavePar(home, away), marcadorPar);

  const ref = LOOKUP_GRUPOS.get(clavePar(home, away));
  if (!ref) return;

  const marcador =
    home === ref.local
      ? `${partido.homeScore}-${partido.awayScore}`
      : `${partido.awayScore}-${partido.homeScore}`;
  const visitante = home === ref.local ? away : home;
  registrarMarcador(destino, ref.n, ref.local, visitante, marcador);
}

async function desdeFootballData(token: string): Promise<ResultadosMundial> {
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED",
    {
      headers: { "X-Auth-Token": token },
      next: { revalidate: REVALIDAR_RESULTADOS },
    }
  );
  if (!res.ok) throw new Error(`football-data ${res.status}`);
  const data = (await res.json()) as {
    matches?: Array<{
      status?: string;
      homeTeam?: { name?: string; shortName?: string };
      awayTeam?: { name?: string; shortName?: string };
      score?: { fullTime?: { home?: number | null; away?: number | null } };
    }>;
  };
  const out: ResultadosMundial = { porNumero: {}, porPar: new Map() };
  for (const m of data.matches ?? []) {
    const h = m.score?.fullTime?.home;
    const a = m.score?.fullTime?.away;
    if (m.status !== "FINISHED" || h == null || a == null) continue;
    asignar(out, {
      home: m.homeTeam?.shortName || m.homeTeam?.name || "",
      away: m.awayTeam?.shortName || m.awayTeam?.name || "",
      homeScore: h,
      awayScore: a,
    });
  }
  return out;
}

type EventoTheSportsDb = {
  strHomeTeam?: string;
  strAwayTeam?: string;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
};

function procesarEventosTheSportsDb(
  eventos: EventoTheSportsDb[],
  destino: ResultadosMundial
): void {
  for (const e of eventos) {
    if (e.intHomeScore == null || e.intAwayScore == null) continue;
    const hs = Number(e.intHomeScore);
    const as = Number(e.intAwayScore);
    if (Number.isNaN(hs) || Number.isNaN(as)) continue;
    asignar(destino, {
      home: e.strHomeTeam ?? "",
      away: e.strAwayTeam ?? "",
      homeScore: hs,
      awayScore: as,
    });
  }
}

/** TheSportsDB por jornada: eventsseason.php queda incompleto tras la 1ª semana. */
async function desdeTheSportsDb(): Promise<ResultadosMundial> {
  const key = process.env.THESPORTSDB_KEY || "123";
  const liga = process.env.THESPORTSDB_WORLDCUP_ID || "4429";
  const fetchOpts = { next: { revalidate: REVALIDAR_RESULTADOS } };
  const maxJornadas = Number(process.env.THESPORTSDB_MAX_ROUNDS || "25");

  const respuestas = await Promise.all(
    Array.from({ length: maxJornadas }, (_, i) =>
      fetch(
        `https://www.thesportsdb.com/api/v1/json/${key}/eventsround.php?id=${liga}&r=${i + 1}`,
        fetchOpts
      ).then(async (res) => {
        if (!res.ok) return [] as EventoTheSportsDb[];
        const data = (await res.json()) as { events?: EventoTheSportsDb[] | null };
        return data.events ?? [];
      })
    )
  );

  const out: ResultadosMundial = { porNumero: {}, porPar: new Map() };
  for (const eventos of respuestas) {
    procesarEventosTheSportsDb(eventos, out);
  }
  if (Object.keys(out.porNumero).length === 0 && out.porPar.size === 0) {
    throw new Error("thesportsdb sin marcadores");
  }
  return out;
}

function fusionarResultados(
  base: ResultadosMundial,
  extra: ResultadosMundial
): ResultadosMundial {
  return {
    porNumero: { ...base.porNumero, ...extra.porNumero },
    porPar: new Map([...base.porPar, ...extra.porPar]),
  };
}

/**
 * Marcadores disponibles (por número de partido y por par de equipos).
 * Combina semilla manual con APIs. Nunca lanza.
 */
export async function obtenerResultados(): Promise<ResultadosMundial> {
  let resultados: ResultadosMundial = {
    porNumero: { ...MARCADORES_SEMILLA },
    porPar: new Map(),
  };

  const token = process.env.FOOTBALL_DATA_API_TOKEN;
  if (token) {
    try {
      resultados = fusionarResultados(resultados, await desdeFootballData(token));
    } catch {
      /* football-data opcional */
    }
  }

  try {
    resultados = fusionarResultados(resultados, await desdeTheSportsDb());
  } catch {
    // Silencioso: el calendario funciona igual sin marcadores en vivo.
  }

  return resultados;
}

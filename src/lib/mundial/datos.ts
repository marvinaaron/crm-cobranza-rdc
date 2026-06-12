/**
 * Datos del Mundial 2026 (Canadá · México · EE. UU.) para el calendario
 * suscribible que publica RDC Contadores.
 *
 * Fuente del fixture: calendario oficial FIFA (vía ESPN / Wikipedia),
 * con horarios en hora de Ciudad de México (UTC-6, sin horario de verano).
 *
 * La fase de grupos lleva selecciones reales con su bandera (emoji); la
 * fase final se publica con etiquetas de posición ("2.º Grupo A") porque
 * los rivales se definen al cerrar cada ronda.
 */

export type FaseMundial =
  | "grupos"
  | "dieciseisavos"
  | "octavos"
  | "cuartos"
  | "semifinal"
  | "tercer_puesto"
  | "final";

export type PartidoMundial = {
  /** Número de partido oficial (1–104). */
  n: number;
  /** Fecha local en México, formato ISO "YYYY-MM-DD". */
  fecha: string;
  /** Hora local de Ciudad de México "HH:MM" (24h). */
  horaMex: string;
  /** Selección local (nombre exacto en EQUIPOS) o null si aún no se define. */
  local: string | null;
  /** Selección visitante o null si aún no se define. */
  visitante: string | null;
  /** Etiqueta del local cuando es fase final ("2.º Grupo A", "Ganador P73"). */
  etiquetaLocal?: string;
  /** Etiqueta del visitante cuando es fase final. */
  etiquetaVisitante?: string;
  /** Grupo (A–L) en fase de grupos. */
  grupo?: string;
  fase: FaseMundial;
  /** Ciudad sede. */
  sede: string;
  /**
   * Marcador final "local-visitante" (ej. "2-0"). Cuando se llena, el título
   * del evento se actualiza solo en los calendarios suscritos (mismo UID).
   * Déjalo vacío hasta que el partido termine.
   */
  marcador?: string;
};

/** Selección → bandera (emoji). Solo las 48 participantes. */
export const EQUIPOS: Record<string, string> = {
  México: "🇲🇽",
  Sudáfrica: "🇿🇦",
  "Corea del Sur": "🇰🇷",
  "República Checa": "🇨🇿",
  Canadá: "🇨🇦",
  "Bosnia y Herzegovina": "🇧🇦",
  Catar: "🇶🇦",
  Suiza: "🇨🇭",
  Brasil: "🇧🇷",
  Marruecos: "🇲🇦",
  Haití: "🇭🇹",
  Escocia: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos": "🇺🇸",
  Paraguay: "🇵🇾",
  Australia: "🇦🇺",
  Turquía: "🇹🇷",
  Alemania: "🇩🇪",
  Curazao: "🇨🇼",
  "Costa de Marfil": "🇨🇮",
  Ecuador: "🇪🇨",
  "Países Bajos": "🇳🇱",
  Japón: "🇯🇵",
  Suecia: "🇸🇪",
  Túnez: "🇹🇳",
  Bélgica: "🇧🇪",
  Egipto: "🇪🇬",
  Irán: "🇮🇷",
  "Nueva Zelanda": "🇳🇿",
  España: "🇪🇸",
  "Cabo Verde": "🇨🇻",
  "Arabia Saudita": "🇸🇦",
  Uruguay: "🇺🇾",
  Francia: "🇫🇷",
  Senegal: "🇸🇳",
  Irak: "🇮🇶",
  Noruega: "🇳🇴",
  Argentina: "🇦🇷",
  Argelia: "🇩🇿",
  Austria: "🇦🇹",
  Jordania: "🇯🇴",
  Portugal: "🇵🇹",
  "RD del Congo": "🇨🇩",
  Uzbekistán: "🇺🇿",
  Colombia: "🇨🇴",
  Inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Croacia: "🇭🇷",
  Ghana: "🇬🇭",
  Panamá: "🇵🇦",
};

export const FASE_LABEL: Record<FaseMundial, string> = {
  grupos: "Fase de grupos",
  dieciseisavos: "Dieciseisavos",
  octavos: "Octavos de final",
  cuartos: "Cuartos de final",
  semifinal: "Semifinal",
  tercer_puesto: "Tercer puesto",
  final: "Final",
};

/** Bandera de una selección (vacío si no se encuentra). */
export function bandera(nombre: string | null | undefined): string {
  if (!nombre) return "";
  return EQUIPOS[nombre] ?? "";
}

/** Nombre mostrable de un lado del partido (selección o etiqueta de posición). */
export function ladoTexto(
  nombre: string | null,
  etiqueta: string | undefined
): string {
  return nombre ?? etiqueta ?? "Por definir";
}

/** "🇲🇽 México" o solo la etiqueta si es fase final. */
export function ladoConBandera(
  nombre: string | null,
  etiqueta: string | undefined
): string {
  if (nombre) {
    const f = bandera(nombre);
    return f ? `${f} ${nombre}` : nombre;
  }
  return etiqueta ?? "Por definir";
}

/**
 * Título corto del partido para el evento del calendario: solo bandera, país
 * y guion (o el marcador si ya se jugó). Ej. "🇲🇽 México - 🇿🇦 Sudáfrica" o
 * "🇲🇽 México 2-0 🇿🇦 Sudáfrica". En fase final, donde aún no hay selección,
 * se usa la etiqueta de posición precedida por la fase para dar contexto.
 */
export function tituloPartido(p: PartidoMundial): string {
  const sep = p.marcador ? p.marcador : "-";
  if (p.local && p.visitante) {
    return `${ladoConBandera(p.local, undefined)} ${sep} ${ladoConBandera(p.visitante, undefined)}`;
  }
  const l = ladoTexto(p.local, p.etiquetaLocal);
  const v = ladoTexto(p.visitante, p.etiquetaVisitante);
  return `${FASE_LABEL[p.fase]}: ${l} ${sep} ${v}`;
}

/** Liga de búsqueda en Google para ver marcador/resumen sin republicar datos. */
export function ligaGoogle(p: PartidoMundial): string {
  let consulta: string;
  if (p.local && p.visitante) {
    consulta = `${p.local} vs ${p.visitante} mundial 2026`;
  } else {
    consulta = `Mundial 2026 ${FASE_LABEL[p.fase]} partido ${p.n}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(consulta)}`;
}

/**
 * Calendario completo: 104 partidos. Horarios en hora de Ciudad de México.
 * Los nombres coinciden con las claves de EQUIPOS para resolver la bandera.
 */
export const PARTIDOS: PartidoMundial[] = [
  // ── Fase de grupos ──────────────────────────────────────────────
  { n: 1, fecha: "2026-06-11", horaMex: "13:00", local: "México", visitante: "Sudáfrica", grupo: "A", fase: "grupos", sede: "Ciudad de México", marcador: "2-0" },
  { n: 2, fecha: "2026-06-11", horaMex: "20:00", local: "Corea del Sur", visitante: "República Checa", grupo: "A", fase: "grupos", sede: "Guadalajara" },
  { n: 3, fecha: "2026-06-12", horaMex: "13:00", local: "Canadá", visitante: "Bosnia y Herzegovina", grupo: "B", fase: "grupos", sede: "Toronto" },
  { n: 4, fecha: "2026-06-12", horaMex: "19:00", local: "Estados Unidos", visitante: "Paraguay", grupo: "D", fase: "grupos", sede: "Los Ángeles" },
  { n: 5, fecha: "2026-06-13", horaMex: "13:00", local: "Catar", visitante: "Suiza", grupo: "B", fase: "grupos", sede: "San Francisco" },
  { n: 6, fecha: "2026-06-13", horaMex: "16:00", local: "Brasil", visitante: "Marruecos", grupo: "C", fase: "grupos", sede: "Nueva Jersey" },
  { n: 7, fecha: "2026-06-13", horaMex: "19:00", local: "Haití", visitante: "Escocia", grupo: "C", fase: "grupos", sede: "Boston" },
  { n: 8, fecha: "2026-06-13", horaMex: "22:00", local: "Australia", visitante: "Turquía", grupo: "D", fase: "grupos", sede: "Vancouver" },
  { n: 9, fecha: "2026-06-14", horaMex: "11:00", local: "Alemania", visitante: "Curazao", grupo: "E", fase: "grupos", sede: "Houston" },
  { n: 10, fecha: "2026-06-14", horaMex: "14:00", local: "Países Bajos", visitante: "Japón", grupo: "F", fase: "grupos", sede: "Dallas" },
  { n: 11, fecha: "2026-06-14", horaMex: "17:00", local: "Costa de Marfil", visitante: "Ecuador", grupo: "E", fase: "grupos", sede: "Philadelphia" },
  { n: 12, fecha: "2026-06-14", horaMex: "20:00", local: "Suecia", visitante: "Túnez", grupo: "F", fase: "grupos", sede: "Monterrey" },
  { n: 13, fecha: "2026-06-15", horaMex: "10:00", local: "España", visitante: "Cabo Verde", grupo: "H", fase: "grupos", sede: "Atlanta" },
  { n: 14, fecha: "2026-06-15", horaMex: "13:00", local: "Bélgica", visitante: "Egipto", grupo: "G", fase: "grupos", sede: "Seattle" },
  { n: 15, fecha: "2026-06-15", horaMex: "16:00", local: "Arabia Saudita", visitante: "Uruguay", grupo: "H", fase: "grupos", sede: "Miami" },
  { n: 16, fecha: "2026-06-15", horaMex: "19:00", local: "Irán", visitante: "Nueva Zelanda", grupo: "G", fase: "grupos", sede: "Los Ángeles" },
  { n: 17, fecha: "2026-06-16", horaMex: "13:00", local: "Francia", visitante: "Senegal", grupo: "I", fase: "grupos", sede: "Nueva Jersey" },
  { n: 18, fecha: "2026-06-16", horaMex: "16:00", local: "Irak", visitante: "Noruega", grupo: "I", fase: "grupos", sede: "Boston" },
  { n: 19, fecha: "2026-06-16", horaMex: "19:00", local: "Argentina", visitante: "Argelia", grupo: "J", fase: "grupos", sede: "Kansas City" },
  { n: 20, fecha: "2026-06-16", horaMex: "22:00", local: "Austria", visitante: "Jordania", grupo: "J", fase: "grupos", sede: "San Francisco" },
  { n: 21, fecha: "2026-06-17", horaMex: "11:00", local: "Portugal", visitante: "RD del Congo", grupo: "K", fase: "grupos", sede: "Houston" },
  { n: 22, fecha: "2026-06-17", horaMex: "14:00", local: "Inglaterra", visitante: "Croacia", grupo: "L", fase: "grupos", sede: "Dallas" },
  { n: 23, fecha: "2026-06-17", horaMex: "17:00", local: "Ghana", visitante: "Panamá", grupo: "L", fase: "grupos", sede: "Toronto" },
  { n: 24, fecha: "2026-06-17", horaMex: "20:00", local: "Uzbekistán", visitante: "Colombia", grupo: "K", fase: "grupos", sede: "Ciudad de México" },
  { n: 25, fecha: "2026-06-18", horaMex: "10:00", local: "República Checa", visitante: "Sudáfrica", grupo: "A", fase: "grupos", sede: "Atlanta" },
  { n: 26, fecha: "2026-06-18", horaMex: "13:00", local: "Suiza", visitante: "Bosnia y Herzegovina", grupo: "B", fase: "grupos", sede: "Los Ángeles" },
  { n: 27, fecha: "2026-06-18", horaMex: "16:00", local: "Canadá", visitante: "Catar", grupo: "B", fase: "grupos", sede: "Vancouver" },
  { n: 28, fecha: "2026-06-18", horaMex: "19:00", local: "México", visitante: "Corea del Sur", grupo: "A", fase: "grupos", sede: "Guadalajara" },
  { n: 29, fecha: "2026-06-19", horaMex: "13:00", local: "Estados Unidos", visitante: "Australia", grupo: "D", fase: "grupos", sede: "Seattle" },
  { n: 30, fecha: "2026-06-19", horaMex: "16:00", local: "Escocia", visitante: "Marruecos", grupo: "C", fase: "grupos", sede: "Boston" },
  { n: 31, fecha: "2026-06-19", horaMex: "18:30", local: "Brasil", visitante: "Haití", grupo: "C", fase: "grupos", sede: "Philadelphia" },
  { n: 32, fecha: "2026-06-19", horaMex: "21:00", local: "Turquía", visitante: "Paraguay", grupo: "D", fase: "grupos", sede: "San Francisco" },
  { n: 33, fecha: "2026-06-20", horaMex: "11:00", local: "Países Bajos", visitante: "Suecia", grupo: "F", fase: "grupos", sede: "Houston" },
  { n: 34, fecha: "2026-06-20", horaMex: "14:00", local: "Alemania", visitante: "Costa de Marfil", grupo: "E", fase: "grupos", sede: "Toronto" },
  { n: 35, fecha: "2026-06-20", horaMex: "18:00", local: "Ecuador", visitante: "Curazao", grupo: "E", fase: "grupos", sede: "Kansas City" },
  { n: 36, fecha: "2026-06-20", horaMex: "22:00", local: "Túnez", visitante: "Japón", grupo: "F", fase: "grupos", sede: "Monterrey" },
  { n: 37, fecha: "2026-06-21", horaMex: "10:00", local: "España", visitante: "Arabia Saudita", grupo: "H", fase: "grupos", sede: "Atlanta" },
  { n: 38, fecha: "2026-06-21", horaMex: "13:00", local: "Bélgica", visitante: "Irán", grupo: "G", fase: "grupos", sede: "Los Ángeles" },
  { n: 39, fecha: "2026-06-21", horaMex: "16:00", local: "Uruguay", visitante: "Cabo Verde", grupo: "H", fase: "grupos", sede: "Miami" },
  { n: 40, fecha: "2026-06-21", horaMex: "19:00", local: "Nueva Zelanda", visitante: "Egipto", grupo: "G", fase: "grupos", sede: "Vancouver" },
  { n: 41, fecha: "2026-06-22", horaMex: "11:00", local: "Argentina", visitante: "Austria", grupo: "J", fase: "grupos", sede: "Dallas" },
  { n: 42, fecha: "2026-06-22", horaMex: "15:00", local: "Francia", visitante: "Irak", grupo: "I", fase: "grupos", sede: "Philadelphia" },
  { n: 43, fecha: "2026-06-22", horaMex: "18:00", local: "Noruega", visitante: "Senegal", grupo: "I", fase: "grupos", sede: "Nueva Jersey" },
  { n: 44, fecha: "2026-06-22", horaMex: "21:00", local: "Jordania", visitante: "Argelia", grupo: "J", fase: "grupos", sede: "San Francisco" },
  { n: 45, fecha: "2026-06-23", horaMex: "11:00", local: "Portugal", visitante: "Uzbekistán", grupo: "K", fase: "grupos", sede: "Houston" },
  { n: 46, fecha: "2026-06-23", horaMex: "14:00", local: "Inglaterra", visitante: "Ghana", grupo: "L", fase: "grupos", sede: "Boston" },
  { n: 47, fecha: "2026-06-23", horaMex: "17:00", local: "Panamá", visitante: "Croacia", grupo: "L", fase: "grupos", sede: "Toronto" },
  { n: 48, fecha: "2026-06-23", horaMex: "20:00", local: "Colombia", visitante: "RD del Congo", grupo: "K", fase: "grupos", sede: "Guadalajara" },
  { n: 49, fecha: "2026-06-24", horaMex: "13:00", local: "Suiza", visitante: "Canadá", grupo: "B", fase: "grupos", sede: "Vancouver" },
  { n: 50, fecha: "2026-06-24", horaMex: "13:00", local: "Bosnia y Herzegovina", visitante: "Catar", grupo: "B", fase: "grupos", sede: "Seattle" },
  { n: 51, fecha: "2026-06-24", horaMex: "16:00", local: "Marruecos", visitante: "Haití", grupo: "C", fase: "grupos", sede: "Atlanta" },
  { n: 52, fecha: "2026-06-24", horaMex: "16:00", local: "Brasil", visitante: "Escocia", grupo: "C", fase: "grupos", sede: "Miami" },
  { n: 53, fecha: "2026-06-24", horaMex: "19:00", local: "Sudáfrica", visitante: "Corea del Sur", grupo: "A", fase: "grupos", sede: "Monterrey" },
  { n: 54, fecha: "2026-06-24", horaMex: "19:00", local: "República Checa", visitante: "México", grupo: "A", fase: "grupos", sede: "Ciudad de México" },
  { n: 55, fecha: "2026-06-25", horaMex: "14:00", local: "Curazao", visitante: "Costa de Marfil", grupo: "E", fase: "grupos", sede: "Philadelphia" },
  { n: 56, fecha: "2026-06-25", horaMex: "14:00", local: "Ecuador", visitante: "Alemania", grupo: "E", fase: "grupos", sede: "Nueva Jersey" },
  { n: 57, fecha: "2026-06-25", horaMex: "17:00", local: "Japón", visitante: "Suecia", grupo: "F", fase: "grupos", sede: "Dallas" },
  { n: 58, fecha: "2026-06-25", horaMex: "17:00", local: "Túnez", visitante: "Países Bajos", grupo: "F", fase: "grupos", sede: "Kansas City" },
  { n: 59, fecha: "2026-06-25", horaMex: "20:00", local: "Paraguay", visitante: "Australia", grupo: "D", fase: "grupos", sede: "San Francisco" },
  { n: 60, fecha: "2026-06-25", horaMex: "20:00", local: "Turquía", visitante: "Estados Unidos", grupo: "D", fase: "grupos", sede: "Los Ángeles" },
  { n: 61, fecha: "2026-06-26", horaMex: "13:00", local: "Noruega", visitante: "Francia", grupo: "I", fase: "grupos", sede: "Boston" },
  { n: 62, fecha: "2026-06-26", horaMex: "13:00", local: "Senegal", visitante: "Irak", grupo: "I", fase: "grupos", sede: "Toronto" },
  { n: 63, fecha: "2026-06-26", horaMex: "18:00", local: "Cabo Verde", visitante: "Arabia Saudita", grupo: "H", fase: "grupos", sede: "Houston" },
  { n: 64, fecha: "2026-06-26", horaMex: "18:00", local: "Uruguay", visitante: "España", grupo: "H", fase: "grupos", sede: "Guadalajara" },
  { n: 65, fecha: "2026-06-26", horaMex: "21:00", local: "Egipto", visitante: "Irán", grupo: "G", fase: "grupos", sede: "Seattle" },
  { n: 66, fecha: "2026-06-26", horaMex: "21:00", local: "Nueva Zelanda", visitante: "Bélgica", grupo: "G", fase: "grupos", sede: "Vancouver" },
  { n: 67, fecha: "2026-06-27", horaMex: "15:00", local: "Croacia", visitante: "Ghana", grupo: "L", fase: "grupos", sede: "Philadelphia" },
  { n: 68, fecha: "2026-06-27", horaMex: "15:00", local: "Panamá", visitante: "Inglaterra", grupo: "L", fase: "grupos", sede: "Nueva Jersey" },
  { n: 69, fecha: "2026-06-27", horaMex: "17:30", local: "Colombia", visitante: "Portugal", grupo: "K", fase: "grupos", sede: "Miami" },
  { n: 70, fecha: "2026-06-27", horaMex: "17:30", local: "RD del Congo", visitante: "Uzbekistán", grupo: "K", fase: "grupos", sede: "Atlanta" },
  { n: 71, fecha: "2026-06-27", horaMex: "20:00", local: "Argelia", visitante: "Austria", grupo: "J", fase: "grupos", sede: "Kansas City" },
  { n: 72, fecha: "2026-06-27", horaMex: "20:00", local: "Jordania", visitante: "Argentina", grupo: "J", fase: "grupos", sede: "Dallas" },

  // ── Dieciseisavos de final (Ronda de 32) ───────────────────────
  { n: 73, fecha: "2026-06-28", horaMex: "13:00", local: null, visitante: null, etiquetaLocal: "2.º Grupo A", etiquetaVisitante: "2.º Grupo B", fase: "dieciseisavos", sede: "Los Ángeles" },
  { n: 74, fecha: "2026-06-29", horaMex: "14:30", local: null, visitante: null, etiquetaLocal: "1.º Grupo E", etiquetaVisitante: "3.º Grupo A/B/C/D/F", fase: "dieciseisavos", sede: "Boston" },
  { n: 75, fecha: "2026-06-29", horaMex: "19:00", local: null, visitante: null, etiquetaLocal: "1.º Grupo F", etiquetaVisitante: "2.º Grupo C", fase: "dieciseisavos", sede: "Monterrey" },
  { n: 76, fecha: "2026-06-29", horaMex: "11:00", local: null, visitante: null, etiquetaLocal: "1.º Grupo E", etiquetaVisitante: "2.º Grupo F", fase: "dieciseisavos", sede: "Houston" },
  { n: 77, fecha: "2026-06-30", horaMex: "15:00", local: null, visitante: null, etiquetaLocal: "1.º Grupo I", etiquetaVisitante: "3.º Grupo C/D/F/G/H", fase: "dieciseisavos", sede: "Nueva Jersey" },
  { n: 78, fecha: "2026-06-30", horaMex: "11:00", local: null, visitante: null, etiquetaLocal: "2.º Grupo E", etiquetaVisitante: "2.º Grupo I", fase: "dieciseisavos", sede: "Dallas" },
  { n: 79, fecha: "2026-06-30", horaMex: "19:00", local: null, visitante: null, etiquetaLocal: "1.º Grupo A", etiquetaVisitante: "3.º Grupo C/E/F/H/I", fase: "dieciseisavos", sede: "Ciudad de México" },
  { n: 80, fecha: "2026-07-01", horaMex: "10:00", local: null, visitante: null, etiquetaLocal: "1.º Grupo L", etiquetaVisitante: "3.º Grupo E/H/I/J/K", fase: "dieciseisavos", sede: "Atlanta" },
  { n: 81, fecha: "2026-07-01", horaMex: "18:00", local: null, visitante: null, etiquetaLocal: "1.º Grupo D", etiquetaVisitante: "3.º Grupo B/E/F/I/J", fase: "dieciseisavos", sede: "San Francisco" },
  { n: 82, fecha: "2026-07-01", horaMex: "14:00", local: null, visitante: null, etiquetaLocal: "1.º Grupo G", etiquetaVisitante: "3.º Grupo A/E/H/I/J", fase: "dieciseisavos", sede: "Seattle" },
  { n: 83, fecha: "2026-07-02", horaMex: "17:00", local: null, visitante: null, etiquetaLocal: "2.º Grupo K", etiquetaVisitante: "2.º Grupo L", fase: "dieciseisavos", sede: "Toronto" },
  { n: 84, fecha: "2026-07-02", horaMex: "13:00", local: null, visitante: null, etiquetaLocal: "1.º Grupo H", etiquetaVisitante: "2.º Grupo J", fase: "dieciseisavos", sede: "Los Ángeles" },
  { n: 85, fecha: "2026-07-02", horaMex: "21:00", local: null, visitante: null, etiquetaLocal: "1.º Grupo B", etiquetaVisitante: "3.º Grupo E/F/G/I/J", fase: "dieciseisavos", sede: "Vancouver" },
  { n: 86, fecha: "2026-07-03", horaMex: "16:00", local: null, visitante: null, etiquetaLocal: "1.º Grupo J", etiquetaVisitante: "2.º Grupo H", fase: "dieciseisavos", sede: "Miami" },
  { n: 87, fecha: "2026-07-03", horaMex: "19:30", local: null, visitante: null, etiquetaLocal: "1.º Grupo K", etiquetaVisitante: "3.º Grupo D/E/I/J/L", fase: "dieciseisavos", sede: "Kansas City" },
  { n: 88, fecha: "2026-07-03", horaMex: "12:00", local: null, visitante: null, etiquetaLocal: "2.º Grupo D", etiquetaVisitante: "2.º Grupo G", fase: "dieciseisavos", sede: "Dallas" },

  // ── Octavos de final (Ronda de 16) ─────────────────────────────
  { n: 89, fecha: "2026-07-04", horaMex: "15:00", local: null, visitante: null, etiquetaLocal: "Ganador P74", etiquetaVisitante: "Ganador P77", fase: "octavos", sede: "Philadelphia" },
  { n: 90, fecha: "2026-07-04", horaMex: "11:00", local: null, visitante: null, etiquetaLocal: "Ganador P73", etiquetaVisitante: "Ganador P75", fase: "octavos", sede: "Houston" },
  { n: 91, fecha: "2026-07-05", horaMex: "14:00", local: null, visitante: null, etiquetaLocal: "Ganador P76", etiquetaVisitante: "Ganador P78", fase: "octavos", sede: "Nueva Jersey" },
  { n: 92, fecha: "2026-07-05", horaMex: "18:00", local: null, visitante: null, etiquetaLocal: "Ganador P79", etiquetaVisitante: "Ganador P80", fase: "octavos", sede: "Ciudad de México" },
  { n: 93, fecha: "2026-07-06", horaMex: "13:00", local: null, visitante: null, etiquetaLocal: "Ganador P83", etiquetaVisitante: "Ganador P84", fase: "octavos", sede: "Dallas" },
  { n: 94, fecha: "2026-07-06", horaMex: "18:00", local: null, visitante: null, etiquetaLocal: "Ganador P81", etiquetaVisitante: "Ganador P82", fase: "octavos", sede: "Seattle" },
  { n: 95, fecha: "2026-07-07", horaMex: "10:00", local: null, visitante: null, etiquetaLocal: "Ganador P86", etiquetaVisitante: "Ganador P88", fase: "octavos", sede: "Atlanta" },
  { n: 96, fecha: "2026-07-07", horaMex: "14:00", local: null, visitante: null, etiquetaLocal: "Ganador P85", etiquetaVisitante: "Ganador P87", fase: "octavos", sede: "Vancouver" },

  // ── Cuartos de final ────────────────────────────────────────────
  { n: 97, fecha: "2026-07-09", horaMex: "14:00", local: null, visitante: null, etiquetaLocal: "Ganador P89", etiquetaVisitante: "Ganador P90", fase: "cuartos", sede: "Boston" },
  { n: 98, fecha: "2026-07-10", horaMex: "13:00", local: null, visitante: null, etiquetaLocal: "Ganador P93", etiquetaVisitante: "Ganador P94", fase: "cuartos", sede: "Los Ángeles" },
  { n: 99, fecha: "2026-07-11", horaMex: "15:00", local: null, visitante: null, etiquetaLocal: "Ganador P91", etiquetaVisitante: "Ganador P92", fase: "cuartos", sede: "Miami" },
  { n: 100, fecha: "2026-07-11", horaMex: "19:00", local: null, visitante: null, etiquetaLocal: "Ganador P95", etiquetaVisitante: "Ganador P96", fase: "cuartos", sede: "Kansas City" },

  // ── Semifinales ─────────────────────────────────────────────────
  { n: 101, fecha: "2026-07-14", horaMex: "13:00", local: null, visitante: null, etiquetaLocal: "Ganador P97", etiquetaVisitante: "Ganador P98", fase: "semifinal", sede: "Dallas" },
  { n: 102, fecha: "2026-07-15", horaMex: "14:00", local: null, visitante: null, etiquetaLocal: "Ganador P99", etiquetaVisitante: "Ganador P100", fase: "semifinal", sede: "Atlanta" },

  // ── Tercer puesto ───────────────────────────────────────────────
  { n: 103, fecha: "2026-07-18", horaMex: "15:00", local: null, visitante: null, etiquetaLocal: "Perdedor P101", etiquetaVisitante: "Perdedor P102", fase: "tercer_puesto", sede: "Miami" },

  // ── Final ───────────────────────────────────────────────────────
  { n: 104, fecha: "2026-07-19", horaMex: "13:00", local: null, visitante: null, etiquetaLocal: "Ganador P101", etiquetaVisitante: "Ganador P102", fase: "final", sede: "Nueva Jersey" },
];

/** Lista ordenada de selecciones (para el selector "solo mi país"). */
export const SELECCIONES: string[] = Object.keys(EQUIPOS).sort((a, b) =>
  a.localeCompare(b, "es")
);

/** Devuelve los partidos de una selección (fase de grupos). */
export function partidosDeEquipo(nombre: string): PartidoMundial[] {
  return PARTIDOS.filter((p) => p.local === nombre || p.visitante === nombre);
}

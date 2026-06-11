/**
 * Generador del calendario iCalendar (.ics) del Mundial 2026.
 *
 * A diferencia del .ics de obligaciones fiscales (eventos de día completo),
 * aquí cada partido es un evento con hora de inicio y fin (~2 h). El título
 * lleva la bandera de cada selección (emoji) y la descripción incluye una
 * liga de búsqueda en Google para ver marcador/resumen, sin republicar
 * datos de terceros (evita problemas de marca).
 *
 * Horarios: el fixture está en hora de Ciudad de México (UTC-6, sin horario
 * de verano desde 2022). Convertimos a UTC sumando 6 horas y publicamos en
 * formato Z; cada calendario lo mostrará en la zona horaria del usuario.
 */

import {
  FASE_LABEL,
  PARTIDOS,
  ladoConBandera,
  ladoTexto,
  ligaGoogle,
  tituloPartido,
  type PartidoMundial,
} from "@/lib/mundial/datos";

const OFFSET_MEX_HORAS = 6; // UTC-6

/** Convierte fecha "YYYY-MM-DD" + hora "HH:MM" (MEX) a Date en UTC. */
function fechaUtc(fechaIso: string, horaMex: string): Date {
  const [y, m, d] = fechaIso.split("-").map(Number);
  const [hh, mm] = horaMex.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh + OFFSET_MEX_HORAS, mm, 0));
}

/** Formatea una Date a "YYYYMMDDTHHmmssZ" (UTC) para iCalendar. */
function tsUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${mo}${dia}T${h}${mi}${s}Z`;
}

/** Escapa texto plano para iCalendar (RFC 5545). */
function escapar(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

/**
 * Plega líneas largas a 75 octetos como exige iCalendar. Es importante para
 * que los emojis de bandera (varios bytes) no rompan la línea a la mitad de
 * un carácter, así que cortamos por longitud de bytes en UTF-8.
 */
function plegar(linea: string): string {
  const bytes = Buffer.from(linea, "utf8");
  if (bytes.length <= 75) return linea;
  const partes: string[] = [];
  let inicio = 0;
  let primera = true;
  while (inicio < bytes.length) {
    const limite = primera ? 75 : 74; // las continuaciones llevan 1 espacio
    let fin = Math.min(inicio + limite, bytes.length);
    // No cortar a mitad de un carácter UTF-8 (bytes de continuación 10xxxxxx).
    while (fin < bytes.length && (bytes[fin] & 0xc0) === 0x80) fin -= 1;
    const trozo = bytes.subarray(inicio, fin).toString("utf8");
    partes.push(primera ? trozo : ` ${trozo}`);
    inicio = fin;
    primera = false;
  }
  return partes.join("\r\n");
}

function resumenPartido(p: PartidoMundial): string {
  const titulo = tituloPartido(p);
  if (p.fase === "grupos" && p.grupo) return `${titulo} · Grupo ${p.grupo}`;
  return titulo;
}

function descripcionPartido(p: PartidoMundial): string {
  const l = ladoConBandera(p.local, p.etiquetaLocal);
  const v = ladoConBandera(p.visitante, p.etiquetaVisitante);
  const lineas = [
    `${FASE_LABEL[p.fase]} · Partido ${p.n}`,
    `${l} vs ${v}`,
    `Sede: ${p.sede}`,
    "",
    `Marcador y resumen en Google: ${ligaGoogle(p)}`,
    "",
    "Calendario cortesía de RDC Contadores · rdcontadores.com",
  ];
  return lineas.join("\n");
}

/**
 * Construye el .ics con los partidos dados (o todos). Si se pasa una
 * selección, filtra solo sus partidos y personaliza el nombre del calendario.
 */
export function construirIcsMundial(opciones?: {
  equipo?: string | null;
  /** Marcadores en vivo: { númeroDePartido: "local-visitante" }. */
  resultados?: Record<number, string>;
}): string {
  const equipo = opciones?.equipo?.trim() || null;
  const resultados = opciones?.resultados ?? {};
  const partidos = equipo
    ? PARTIDOS.filter((p) => p.local === equipo || p.visitante === equipo)
    : PARTIDOS;

  const nombreCal = equipo
    ? `Mundial 2026 · ${equipo}`
    : "Mundial 2026 · Calendario completo";

  const ahora = tsUtc(new Date());
  const lineas: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RDC Contadores//Calendario Mundial 2026//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapar(nombreCal)}`,
    "X-WR-CALDESC:Calendario del Mundial 2026 (horarios México) por RDC Contadores.",
    "X-WR-TIMEZONE:America/Mexico_City",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
  ];

  partidos.forEach((base) => {
    const p = resultados[base.n] ? { ...base, marcador: resultados[base.n] } : base;
    const inicio = fechaUtc(p.fecha, p.horaMex);
    const fin = new Date(inicio.getTime() + 2 * 60 * 60 * 1000);
    const uid = `mundial2026-p${p.n}@rdcontadores.com`;

    lineas.push(
      "BEGIN:VEVENT",
      plegar(`UID:${uid}`),
      `DTSTAMP:${ahora}`,
      `DTSTART:${tsUtc(inicio)}`,
      `DTEND:${tsUtc(fin)}`,
      plegar(`SUMMARY:${escapar(resumenPartido(p))}`),
      plegar(`DESCRIPTION:${escapar(descripcionPartido(p))}`),
      plegar(`LOCATION:${escapar(`${p.sede} · Mundial 2026`)}`),
      plegar(`URL:${ligaGoogle(p)}`),
      "CATEGORIES:Mundial 2026,Fútbol",
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "TRIGGER:-PT1H",
      "ACTION:DISPLAY",
      plegar(
        `DESCRIPTION:${escapar(`En 1 hora: ${ladoTexto(p.local, p.etiquetaLocal)} vs ${ladoTexto(p.visitante, p.etiquetaVisitante)}`)}`
      ),
      "END:VALARM",
      "END:VEVENT"
    );
  });

  lineas.push("END:VCALENDAR");
  return lineas.join("\r\n");
}

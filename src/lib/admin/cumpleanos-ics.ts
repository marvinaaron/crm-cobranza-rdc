/**
 * Calendario iCalendar de cumpleaños / aniversarios de clientes activos.
 * Cada evento usa UID estable por cliente → suscripción webcal sin duplicar
 * al entrar clientes nuevos (el calendario actualiza el mismo evento).
 */

import {
  type Cliente,
  esIngresoGeneralCliente,
  fechaNacimientoDeRFC,
  formatearFechaNacimientoCorta,
} from "@/lib/clientes";
import { SITE_URL } from "@/lib/seo/site";

export type ClienteCumpleCalendario = {
  cliente: Cliente;
  fecha: { mes: number; dia: number; anio: number };
};

export function listarClientesCumpleCalendario(
  clientes: Cliente[]
): ClienteCumpleCalendario[] {
  const items: ClienteCumpleCalendario[] = [];
  for (const cliente of clientes) {
    if (!cliente.activo || esIngresoGeneralCliente(cliente)) continue;
    const fecha = fechaNacimientoDeRFC(cliente.rfc, cliente.esPersonaMoral);
    if (!fecha) continue;
    items.push({ cliente, fecha });
  }
  items.sort(
    (a, b) =>
      a.fecha.mes - b.fecha.mes ||
      a.fecha.dia - b.fecha.dia ||
      a.cliente.razonSocial.localeCompare(b.cliente.razonSocial, "es")
  );
  return items;
}

function formatoFechaIcs(y: number, mes: number, dia: number): string {
  return `${y}${String(mes + 1).padStart(2, "0")}${String(dia).padStart(2, "0")}`;
}

function formatoTimestampIcs(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${mo}${dia}T${h}${mi}${s}Z`;
}

function escapar(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

function plegar(linea: string, max = 75): string {
  if (linea.length <= max) return linea;
  const partes: string[] = [];
  let resto = linea;
  partes.push(resto.slice(0, max));
  resto = resto.slice(max);
  while (resto.length > 0) {
    partes.push(` ${resto.slice(0, max - 1)}`);
    resto = resto.slice(max - 1);
  }
  return partes.join("\r\n");
}

export function construirIcsCumpleDespacho(
  clientes: Cliente[],
  opciones?: { actualizadoEn?: Date }
): string {
  const items = listarClientesCumpleCalendario(clientes);
  const ahora = opciones?.actualizadoEn ?? new Date();
  const anioRef = ahora.getFullYear();
  const stamp = formatoTimestampIcs(ahora);

  const lineas: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RDC Contadores//Cumple Despacho//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Cumple Despacho · RDC",
    "X-WR-CALDESC:Cumpleaños y aniversarios de clientes activos del despacho.",
    "X-WR-TIMEZONE:America/Mexico_City",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
  ];

  for (const { cliente, fecha } of items) {
    const inicio = formatoFechaIcs(anioRef, fecha.mes, fecha.dia);
    const finDate = new Date(anioRef, fecha.mes, fecha.dia + 1);
    const fin = formatoFechaIcs(
      finDate.getFullYear(),
      finDate.getMonth(),
      finDate.getDate()
    );
    const uid = `rdc-cumple-cliente-${cliente.id}@rdcontadores.com`;
    const esMoral = cliente.esPersonaMoral === true;
    const tipo = esMoral ? "Aniversario" : "Cumpleaños";
    const resumen = `🎂 ${tipo} · ${cliente.razonSocial}`;
    const descLineas = [
      `${tipo} de ${cliente.razonSocial}.`,
      `RFC: ${cliente.rfc}`,
      `Fecha: ${formatearFechaNacimientoCorta(fecha)}`,
      `Ver cliente: ${SITE_URL}/clientes#cliente=${cliente.id}`,
      "Calendario suscrito desde RDC Contadores (Cumple Despacho).",
    ];
    const desc = escapar(descLineas.join("\n"));

    lineas.push(
      "BEGIN:VEVENT",
      plegar(`UID:${uid}`),
      `DTSTAMP:${stamp}`,
      `LAST-MODIFIED:${stamp}`,
      `SEQUENCE:${Math.floor(ahora.getTime() / 1000)}`,
      `DTSTART;VALUE=DATE:${inicio}`,
      `DTEND;VALUE=DATE:${fin}`,
      "RRULE:FREQ=YEARLY",
      plegar(`SUMMARY:${escapar(resumen)}`),
      plegar(`DESCRIPTION:${desc}`),
      "CATEGORIES:Cumple Despacho,RDC Contadores",
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      plegar(
        `DESCRIPTION:${escapar(`Mañana: ${tipo.toLowerCase()} de ${cliente.razonSocial}`)}`
      ),
      "END:VALARM",
      "END:VEVENT"
    );
  }

  lineas.push("END:VCALENDAR");
  return lineas.join("\r\n");
}

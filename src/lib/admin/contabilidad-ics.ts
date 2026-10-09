/**
 * Calendario iCalendar de días de trabajo de contabilidad por cliente.
 * UID estable por cliente → al mover el día (8 → 12) la suscripción
 * actualiza el mismo evento en iPhone/Google, sin duplicar.
 */

import type { Cliente } from "@/lib/clientes";
import { SITE_URL } from "@/lib/seo/site";
import {
  clientesConDiaContabilidad,
  fechaContabilidadEnMes,
  iconoCarpetaCliente,
  nombreCortoCliente,
  normalizarDiaContabilidad,
} from "@/lib/admin/dia-contabilidad";

function formatoFechaIcs(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${dia}`;
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

export function uidContabilidadCliente(clienteId: number): string {
  return `rdc-contabilidad-cliente-${clienteId}@rdcontadores.com`;
}

export function resumenEventoContabilidad(cliente: Cliente): string {
  const icono = iconoCarpetaCliente(cliente);
  const nombre = nombreCortoCliente(cliente.razonSocial);
  return `${icono} Contabilidad · ${nombre}`;
}

function sequenceDeCliente(cliente: Cliente, fallback: Date): number {
  if (cliente.diaContabilidadEn) {
    const t = Date.parse(cliente.diaContabilidadEn);
    if (Number.isFinite(t)) return Math.floor(t / 1000);
  }
  return Math.floor(fallback.getTime() / 1000);
}

export function construirIcsContabilidadDespacho(
  clientes: Cliente[],
  opciones?: { actualizadoEn?: Date }
): string {
  const items = clientesConDiaContabilidad(clientes).sort(
    (a, b) =>
      (a.diaContabilidad ?? 0) - (b.diaContabilidad ?? 0) ||
      a.razonSocial.localeCompare(b.razonSocial, "es")
  );
  const ahora = opciones?.actualizadoEn ?? new Date();
  const stamp = formatoTimestampIcs(ahora);

  const lineas: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RDC Contadores//Contabilidades Despacho//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Contabilidades · RDC",
    "X-WR-CALDESC:Día del mes en que el despacho trabaja la contabilidad de cada cliente.",
    "X-WR-TIMEZONE:America/Mexico_City",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const cliente of items) {
    const dia = normalizarDiaContabilidad(cliente.diaContabilidad);
    if (dia == null) continue;

    const inicioDate = fechaContabilidadEnMes(
      dia,
      ahora.getFullYear(),
      ahora.getMonth()
    );
    const finDate = new Date(
      inicioDate.getFullYear(),
      inicioDate.getMonth(),
      inicioDate.getDate() + 1
    );
    const stampCliente = cliente.diaContabilidadEn
      ? formatoTimestampIcs(new Date(cliente.diaContabilidadEn))
      : stamp;
    const uid = uidContabilidadCliente(cliente.id);
    const resumen = resumenEventoContabilidad(cliente);
    const icono = iconoCarpetaCliente(cliente);
    const desc = escapar(
      [
        `Trabajar contabilidad de ${cliente.razonSocial}.`,
        `RFC: ${cliente.rfc}`,
        `Día del mes: ${dia}`,
        `Ver cumplimiento: ${SITE_URL}/cumplimiento`,
        "Calendario suscrito desde RDC Contadores. Si mueves el día en cumplimiento, este evento se actualiza (mismo UID).",
      ].join("\n")
    );

    lineas.push(
      "BEGIN:VEVENT",
      plegar(`UID:${uid}`),
      `DTSTAMP:${stamp}`,
      `LAST-MODIFIED:${stampCliente}`,
      `SEQUENCE:${sequenceDeCliente(cliente, ahora)}`,
      `DTSTART;VALUE=DATE:${formatoFechaIcs(inicioDate)}`,
      `DTEND;VALUE=DATE:${formatoFechaIcs(finDate)}`,
      `RRULE:FREQ=MONTHLY;BYMONTHDAY=${dia}`,
      plegar(`SUMMARY:${escapar(resumen)}`),
      plegar(`DESCRIPTION:${desc}`),
      "CATEGORIES:Contabilidad,RDC Contadores",
      "TRANSP:OPAQUE",
      "BEGIN:VALARM",
      "TRIGGER:-PT9H",
      "ACTION:DISPLAY",
      plegar(
        `DESCRIPTION:${escapar(`${icono} Hoy: contabilidad de ${nombreCortoCliente(cliente.razonSocial)}`)}`
      ),
      "END:VALARM",
      "END:VEVENT"
    );
  }

  lineas.push("END:VCALENDAR");
  return lineas.join("\r\n");
}

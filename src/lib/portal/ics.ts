/**
 * Generador de archivos iCalendar (.ics) para que el cliente exporte sus
 * obligaciones fiscales a la app Calendario de su teléfono.
 *
 * El estándar iCalendar (RFC 5545) es compatible con:
 *   - iOS Calendar (al abrir el .ics ofrece añadir los eventos).
 *   - Google Calendar (importar archivo).
 *   - Outlook, Apple Mail y la mayoría de apps de calendario.
 *
 * Cada evento se genera como "día completo" (DTSTART;VALUE=DATE) y lleva
 * una alarma de 1 día antes para que el cliente reciba notificación previa.
 */

import type { EventoFiscal, TipoEventoFiscal } from "@/lib/portal/fechas-fiscales";

const DESC_TIPO: Record<TipoEventoFiscal, string> = {
  sat: "Fecha límite para presentar la declaración mensual SAT (ISR/IVA).",
  imss: "Fecha límite para pago de cuotas IMSS (SIPARE).",
  estatal: "Fecha límite del impuesto estatal (ISN / nómina).",
  repse: "Fecha límite REPSE (ICSOE / SISUB).",
  honorarios: "Fecha límite de pago de honorarios al despacho RDC Contadores.",
};

/** Convierte una Date a "YYYYMMDD" (fecha local, día completo). */
function formatoFechaIcs(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${dia}`;
}

/** Convierte una Date a "YYYYMMDDTHHmmssZ" en UTC, para DTSTAMP. */
function formatoTimestampIcs(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${mo}${dia}T${h}${mi}${s}Z`;
}

/** Escapa caracteres especiales en texto plano para iCalendar. */
function escapar(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

/**
 * Construye el contenido completo de un archivo .ics con los eventos dados.
 * @param eventos eventos fiscales del cliente (SAT, IMSS, etc.).
 * @param nombreCliente nombre del cliente, para personalizar la descripción.
 */
export function construirIcs(
  eventos: EventoFiscal[],
  nombreCliente?: string
): string {
  const ahora = formatoTimestampIcs(new Date());
  const lineas: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RDC Contadores//Portal Cliente//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Calendario fiscal RDC",
    "X-WR-CALDESC:Fechas límite fiscales calculadas por RDC Contadores.",
    "X-WR-TIMEZONE:America/Mexico_City",
  ];

  eventos.forEach((e, i) => {
    const inicio = formatoFechaIcs(e.fecha);
    const fin = new Date(
      e.fecha.getFullYear(),
      e.fecha.getMonth(),
      e.fecha.getDate() + 1
    );
    const finStr = formatoFechaIcs(fin);
    const uid = `rdc-${e.tipo}-${inicio}-${i}@rdcontadores.com`;
    // Si el evento trae `descripcion` propia, la respetamos (caso típico:
    // tareas internas de la agenda de cierre del despacho).
    const descBase = e.descripcion ?? DESC_TIPO[e.tipo];
    const desc = nombreCliente
      ? `${descBase} Calculada por RDC Contadores para ${nombreCliente}.`
      : descBase;

    lineas.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${ahora}`,
      `DTSTART;VALUE=DATE:${inicio}`,
      `DTEND;VALUE=DATE:${finStr}`,
      `SUMMARY:${escapar(e.etiqueta)}`,
      `DESCRIPTION:${escapar(desc)}`,
      "CATEGORIES:Fiscal,RDC Contadores",
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapar(`Recordatorio: ${e.etiqueta} mañana`)}`,
      "END:VALARM",
      "END:VEVENT"
    );
  });

  lineas.push("END:VCALENDAR");

  // Las líneas iCalendar deben usar CRLF.
  return lineas.join("\r\n");
}

/**
 * Dispara la descarga de un archivo .ics en el navegador del cliente.
 * Funciona en escritorio (descarga el archivo) y en móviles iOS/Android
 * (al abrirlo, el sistema ofrece añadir los eventos al calendario).
 */
export function descargarIcs(
  eventos: EventoFiscal[],
  nombreArchivo = "calendario-fiscal-rdc.ics",
  nombreCliente?: string
): void {
  const contenido = construirIcs(eventos, nombreCliente);
  const blob = new Blob([contenido], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Liberamos la URL en el siguiente tick.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

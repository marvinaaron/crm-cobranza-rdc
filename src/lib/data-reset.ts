/**
 * Utilidades para exportar, importar y reiniciar datos del CRM.
 * En producción el estado vive en Supabase; localStorage solo se usa como
 * compatibilidad al importar respaldos antiguos.
 */

import { asegurarClienteIngresosDiversos } from "@/lib/clientes";
import type { CrmCloudPayload } from "@/lib/crm-cloud-sync";

export const RDC_STORAGE_KEYS = [
  // Catálogos y operación principal
  "rdc-clientes-v1",
  "rdc-cumplimiento-v2",
  "rdc-cumplimiento-v1", // versión legacy, por compatibilidad
  "rdc-comprobantes-v1",
  "rdc-facturas-v1",
  "rdc-historial-impuestos-v1",
  "rdc-notificaciones-v1",
  "rdc-repse-v1",
  "rdc-encargos-v1",
  "rdc-recordatorio-log-v1",
  "rdc-scripts-correo-v1",
  "rdc-presupuestos-v1",
  "rdc-catalogo-servicios-v1",
  // Credenciales del portal del cliente
  "rdc-portal-credenciales-v2",
  "rdc-portal-credenciales-v1",
  // Sesiones de Stripe ya aplicadas (evita doble cobro)
  "rdc-stripe-sesiones-procesadas-v1",
] as const;

export type RdcStorageKey = (typeof RDC_STORAGE_KEYS)[number];

export type RespaldoRdc = {
  /** Marca de la versión del esquema del respaldo. */
  formato: "rdc-respaldo-v1";
  /** ISO timestamp en que se generó. */
  generadoEn: string;
  /** Llaves -> contenido JSON crudo. */
  datos: Partial<Record<RdcStorageKey, unknown>>;
};

function esWindowDisponible(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Recolecta el snapshot actual de todas las llaves RDC. */
export function generarRespaldo(): RespaldoRdc {
  const datos: Partial<Record<RdcStorageKey, unknown>> = {};
  if (esWindowDisponible()) {
    RDC_STORAGE_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw === null) return;
      try {
        datos[key] = JSON.parse(raw);
      } catch {
        // Si por alguna razón no es JSON válido, lo guardamos como string.
        datos[key] = raw;
      }
    });
  }
  return {
    formato: "rdc-respaldo-v1",
    generadoEn: new Date().toISOString(),
    datos,
  };
}

/** Construye respaldo .json a partir del estado actual del CRM en memoria. */
export function respaldoDesdeEstado(estado: CrmCloudPayload): RespaldoRdc {
  return {
    formato: "rdc-respaldo-v1",
    generadoEn: new Date().toISOString(),
    datos: {
      "rdc-clientes-v1": estado.clientes,
      "rdc-comprobantes-v1": estado.comprobantes,
      "rdc-facturas-v1": estado.facturas,
      "rdc-cumplimiento-v2": estado.cumplimiento,
      "rdc-historial-impuestos-v1": estado.historialImpuestos,
      "rdc-notificaciones-v1": estado.notificaciones,
      "rdc-repse-v1": estado.repse,
      "rdc-encargos-v1": estado.encargos,
      "rdc-recordatorio-log-v1": estado.recordatorioLog,
      "rdc-scripts-correo-v1": estado.scriptsCorreo,
      "rdc-presupuestos-v1": estado.presupuestos,
      "rdc-catalogo-servicios-v1": estado.catalogoServicios,
    },
  };
}

/** Extrae el estado del CRM desde un archivo de respaldo. */
export function estadoDesdeRespaldo(json: unknown): CrmCloudPayload {
  if (
    !json ||
    typeof json !== "object" ||
    (json as RespaldoRdc).formato !== "rdc-respaldo-v1"
  ) {
    throw new Error(
      "Archivo no reconocido. Use un respaldo generado por este CRM."
    );
  }
  const datos = (json as RespaldoRdc).datos ?? {};
  const cumplimiento =
    datos["rdc-cumplimiento-v2"] ?? datos["rdc-cumplimiento-v1"] ?? [];
  return {
    clientes: asegurarClienteIngresosDiversos(
      (datos["rdc-clientes-v1"] as CrmCloudPayload["clientes"]) ?? []
    ),
    comprobantes: (datos["rdc-comprobantes-v1"] as CrmCloudPayload["comprobantes"]) ?? [],
    facturas: (datos["rdc-facturas-v1"] as CrmCloudPayload["facturas"]) ?? [],
    cumplimiento: cumplimiento as CrmCloudPayload["cumplimiento"],
    historialImpuestos:
      (datos["rdc-historial-impuestos-v1"] as CrmCloudPayload["historialImpuestos"]) ??
      [],
    notificaciones:
      (datos["rdc-notificaciones-v1"] as CrmCloudPayload["notificaciones"]) ?? [],
    repse: (datos["rdc-repse-v1"] as CrmCloudPayload["repse"]) ?? [],
    encargos: (datos["rdc-encargos-v1"] as CrmCloudPayload["encargos"]) ?? [],
    recordatorioLog:
      (datos["rdc-recordatorio-log-v1"] as CrmCloudPayload["recordatorioLog"]) ?? [],
    scriptsCorreo:
      (datos["rdc-scripts-correo-v1"] as CrmCloudPayload["scriptsCorreo"]) ?? [],
    presupuestos:
      (datos["rdc-presupuestos-v1"] as CrmCloudPayload["presupuestos"]) ?? [],
    catalogoServicios:
      (datos["rdc-catalogo-servicios-v1"] as CrmCloudPayload["catalogoServicios"]) ?? [],
  };
}

export function descargarRespaldoJson(
  respaldo: RespaldoRdc,
  nombreArchivo?: string
): void {
  if (!esWindowDisponible()) return;
  const blob = new Blob([JSON.stringify(respaldo, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const fechaCorta = respaldo.generadoEn.slice(0, 19).replace(/[:T]/g, "-");
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo ?? `rdc-respaldo-${fechaCorta}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Descarga respaldo leyendo localStorage (legacy). */
export function descargarRespaldo(nombreArchivo?: string): void {
  descargarRespaldoJson(generarRespaldo(), nombreArchivo);
}

/** Resumen de tamaño a partir del estado en memoria (producción). */
export function resumenDesdeEstado(estado: CrmCloudPayload): Array<{
  key: RdcStorageKey;
  registros: number;
  bytes: number;
}> {
  const pares: Array<[RdcStorageKey, unknown]> = [
    ["rdc-clientes-v1", estado.clientes],
    ["rdc-cumplimiento-v2", estado.cumplimiento],
    ["rdc-comprobantes-v1", estado.comprobantes],
    ["rdc-facturas-v1", estado.facturas],
    ["rdc-historial-impuestos-v1", estado.historialImpuestos],
    ["rdc-notificaciones-v1", estado.notificaciones],
    ["rdc-repse-v1", estado.repse],
    ["rdc-encargos-v1", estado.encargos],
    ["rdc-recordatorio-log-v1", estado.recordatorioLog],
    ["rdc-scripts-correo-v1", estado.scriptsCorreo],
  ];
  return pares.map(([key, valor]) => {
    const raw = JSON.stringify(valor ?? []);
    const registros = Array.isArray(valor) ? valor.length : 0;
    return { key, registros, bytes: new Blob([raw]).size };
  });
}

/**
 * Carga un respaldo en localStorage (legacy). Preferir estadoDesdeRespaldo + API.
 */
export function restaurarRespaldo(json: unknown): void {
  if (!esWindowDisponible()) return;
  const respaldo = respaldoDesdeEstado(estadoDesdeRespaldo(json));
  RDC_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  Object.entries(respaldo.datos ?? {}).forEach(([key, valor]) => {
    if (!RDC_STORAGE_KEYS.includes(key as RdcStorageKey)) return;
    localStorage.setItem(
      key,
      typeof valor === "string" ? valor : JSON.stringify(valor)
    );
  });
}

export function estadoVacio(): CrmCloudPayload {
  return {
    clientes: asegurarClienteIngresosDiversos([]),
    comprobantes: [],
    facturas: [],
    cumplimiento: [],
    historialImpuestos: [],
    notificaciones: [],
    repse: [],
    encargos: [],
    recordatorioLog: [],
    scriptsCorreo: [],
    presupuestos: [],
    catalogoServicios: [],
  };
}

/** Borra todas las llaves del CRM en este navegador. No es reversible. */
export function reiniciarTodo(): void {
  if (!esWindowDisponible()) return;
  RDC_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

/** Cuenta cuántos registros tiene cada llave (para mostrar al usuario). */
export function resumenAlmacenamiento(): Array<{
  key: RdcStorageKey;
  registros: number;
  bytes: number;
}> {
  if (!esWindowDisponible()) return [];
  return RDC_STORAGE_KEYS.map((key) => {
    const raw = localStorage.getItem(key) ?? "";
    let registros = 0;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) registros = parsed.length;
      else if (parsed && typeof parsed === "object")
        registros = Object.keys(parsed).length;
    } catch {
      registros = 0;
    }
    return { key, registros, bytes: new Blob([raw]).size };
  });
}

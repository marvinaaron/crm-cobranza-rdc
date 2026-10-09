/**
 * Parámetros de la sincronización CFDI.
 * Descarga automática SAT DESACTIVADA: el cupo de solicitudes de por vida
 * del SAT se agota con uso masivo. La carga es manual (carpetas / XML + metadata).
 */

/** @deprecated La sync automática está cancelada. */
export const CFDI_SYNC_INICIO = { mes: 6, anio: 2026 } as const;

export const CFDI_SYNC_MESES_ROLLING = 12;

/** Cron desactivado (no registrado en vercel.json). */
export const CFDI_SYNC_CRON_SEMANAL = "0 10 * * 1";

export const CFDI_SYNC_LOTE_CLIENTES = 5;
export const CFDI_SYNC_REINTENTOS = 2;

export type ModoSyncCfdi = "semanal" | "manual";

export type ResumenSyncProgramada = {
  modo: ModoSyncCfdi;
  descripcion: string;
  frecuenciaHumana: string;
};

export const CFDI_SYNC_RESUMEN: ResumenSyncProgramada[] = [
  {
    modo: "manual",
    descripcion:
      "Sube carpetas o XML del SAT. Si incluyes el archivo de metadata, se marcan los cancelados automáticamente.",
    frecuenciaHumana: "Carga manual en admin → CFDI → Carga",
  },
];

/** Sync automática desactivada de forma permanente (cupo SAT). */
export function cfdiSyncAutomaticaActiva(_referencia = new Date()): boolean {
  return false;
}

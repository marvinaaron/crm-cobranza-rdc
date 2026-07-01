/**
 * Parámetros de la sincronización automática SAT (Oleada 4).
 * Inicio operativo acordado: julio 2026.
 */

/** Mes/año en que arranca la descarga automática (inclusive). */
export const CFDI_SYNC_INICIO = { mes: 6, anio: 2026 } as const; // julio = índice 6

/** Ventana rolling: solo se mantienen CFDI de los últimos N meses. */
export const CFDI_SYNC_MESES_ROLLING = 12;

/** Cron diario: descarga CFDI nuevos del día anterior + revisión de cancelados. */
export const CFDI_SYNC_CRON_DIARIO = "0 3 * * *"; // 03:00 America/Mexico_City

/** Cron semanal: re-sincroniza el mes en curso (el SAT publica con retraso). */
export const CFDI_SYNC_CRON_SEMANAL = "0 4 * * 0"; // domingo 04:00

/** Máximo de clientes por corrida del job (evita timeouts en Vercel). */
export const CFDI_SYNC_LOTE_CLIENTES = 5;

/** Reintentos por cliente si el SAT responde lento o error transitorio. */
export const CFDI_SYNC_REINTENTOS = 2;

export type ModoSyncCfdi = "inicial" | "diario" | "semanal";

export type ResumenSyncProgramada = {
  modo: ModoSyncCfdi;
  descripcion: string;
  frecuenciaHumana: string;
};

/** Texto para UI admin / logs — refleja el comportamiento planeado del job. */
export const CFDI_SYNC_RESUMEN: ResumenSyncProgramada[] = [
  {
    modo: "inicial",
    descripcion:
      "Al registrar e.firma vigente: descarga masiva de los últimos 12 meses (rolling).",
    frecuenciaHumana: "Una vez por cliente al activar la sincronización",
  },
  {
    modo: "diario",
    descripcion:
      "Descarga CFDI emitidos/recibidos del día anterior y actualiza estatus cancelado.",
    frecuenciaHumana: "Todos los días a las 3:00 AM (hora Ciudad de México)",
  },
  {
    modo: "semanal",
    descripcion: "Re-sincroniza el mes fiscal en curso por si el SAT publicó con retraso.",
    frecuenciaHumana: "Domingos a las 4:00 AM (hora Ciudad de México)",
  },
];

/** ¿Ya está activa la sincronización automática según la fecha de referencia? */
export function cfdiSyncAutomaticaActiva(referencia = new Date()): boolean {
  const mes = referencia.getMonth();
  const anio = referencia.getFullYear();
  if (anio > CFDI_SYNC_INICIO.anio) return true;
  if (anio === CFDI_SYNC_INICIO.anio && mes >= CFDI_SYNC_INICIO.mes) return true;
  return false;
}

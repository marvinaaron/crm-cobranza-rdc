/**
 * Parámetros de la sincronización automática SAT (Oleada 4).
 * Inicio operativo acordado: julio 2026.
 * Cadencia acordada: solo los lunes (semana anterior). Urgencias → carga manual.
 */

/** Mes/año en que arranca la descarga automática (inclusive). */
export const CFDI_SYNC_INICIO = { mes: 6, anio: 2026 } as const; // julio = índice 6

/** Ventana rolling: solo se mantienen CFDI de los últimos N meses. */
export const CFDI_SYNC_MESES_ROLLING = 12;

/** Cron semanal: lunes 04:00 CDMX ≈ 10:00 UTC. */
export const CFDI_SYNC_CRON_SEMANAL = "0 10 * * 1";

/** Máximo de clientes por corrida del job (evita timeouts en Vercel). */
export const CFDI_SYNC_LOTE_CLIENTES = 5;

/** Reintentos por cliente si el SAT responde lento o error transitorio. */
export const CFDI_SYNC_REINTENTOS = 2;

export type ModoSyncCfdi = "semanal" | "manual";

export type ResumenSyncProgramada = {
  modo: ModoSyncCfdi;
  descripcion: string;
  frecuenciaHumana: string;
};

/** Texto para UI admin / logs. */
export const CFDI_SYNC_RESUMEN: ResumenSyncProgramada[] = [
  {
    modo: "semanal",
    descripcion:
      "Descarga CFDI emitidos y recibidos de la semana anterior para todos los clientes con e.firma y contraseña FIEL.",
    frecuenciaHumana: "Todos los lunes a las 4:00 AM (hora Ciudad de México)",
  },
  {
    modo: "manual",
    descripcion:
      "Si un cliente necesita CFDI antes del lunes, súbelos en la pestaña Carga XML.",
    frecuenciaHumana: "Bajo demanda (admin)",
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

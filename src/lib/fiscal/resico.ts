/**
 * RESICO (Régimen Simplificado de Confianza) para personas físicas.
 *
 * Tarifa de ISR sobre pagos provisionales mensuales conforme al artículo
 * 113-E de la Ley del ISR: la tasa se aplica DIRECTAMENTE sobre el total de
 * ingresos del mes (amparados por CFDI), sin deducciones ni cuota fija.
 *
 * Fuente: LISR Art. 113-E · RMF 2026. Las cinco tasas (1.00 %, 1.10 %,
 * 1.50 %, 2.00 % y 2.50 %) se mantienen idénticas desde 2022.
 *
 * El cálculo es de referencia informativa. El impuesto definitivo depende
 * del cumplimiento de requisitos del régimen y del acumulado anual.
 */

export type TramoResico = {
  /** Límite inferior del rango (inclusive). */
  limiteInferior: number;
  /**
   * Límite superior del rango (inclusive). `null` = sin tope (último tramo
   * a efectos de cálculo; en la práctica aplica hasta el límite anual).
   */
  limiteSuperior: number | null;
  /** Tasa aplicable como fracción (0.01 = 1 %). */
  tasa: number;
};

/** Tarifa mensual RESICO PF (Art. 113-E LISR). */
export const TARIFA_RESICO: TramoResico[] = [
  { limiteInferior: 0.01, limiteSuperior: 25_000, tasa: 0.01 },
  { limiteInferior: 25_000.01, limiteSuperior: 50_000, tasa: 0.011 },
  { limiteInferior: 50_000.01, limiteSuperior: 83_333.33, tasa: 0.015 },
  { limiteInferior: 83_333.34, limiteSuperior: 208_333.33, tasa: 0.02 },
  { limiteInferior: 208_333.34, limiteSuperior: null, tasa: 0.025 },
];

/** Límite de ingresos anuales para permanecer en RESICO PF. */
export const LIMITE_ANUAL_RESICO = 3_500_000;

/** Equivalente mensual del límite anual ($3.5 M / 12). */
export const LIMITE_MENSUAL_RESICO = Math.round((LIMITE_ANUAL_RESICO / 12) * 100) / 100; // 291,666.67

export type ResultadoResico =
  | {
      ok: true;
      /** Ingreso mensual capturado. */
      ingreso: number;
      /** Tasa aplicada (fracción). */
      tasa: number;
      /** ISR mensual estimado. */
      isr: number;
      /** Tramo de la tarifa que aplicó. */
      tramo: TramoResico;
      /** Índice del tramo (0-based) para resaltar la tabla. */
      indiceTramo: number;
      /**
       * true si el ingreso mensual supera el equivalente del límite anual.
       * No expulsa automáticamente del régimen (importa el acumulado anual),
       * pero conviene avisarlo.
       */
      excedeLimiteMensual: boolean;
    }
  | { ok: false; error: string };

/** Encuentra el tramo correspondiente a un ingreso mensual. */
export function tramoResico(ingreso: number): { tramo: TramoResico; indice: number } {
  for (let i = 0; i < TARIFA_RESICO.length; i++) {
    const t = TARIFA_RESICO[i];
    if (t.limiteSuperior === null || ingreso <= t.limiteSuperior) {
      return { tramo: t, indice: i };
    }
  }
  const ultimo = TARIFA_RESICO.length - 1;
  return { tramo: TARIFA_RESICO[ultimo], indice: ultimo };
}

/**
 * Calcula el ISR mensual de RESICO a partir del ingreso del mes.
 * ISR = ingreso × tasa del tramo. Sin deducciones ni cuota fija.
 */
export function calcularIsrResico(ingresoMensual: number): ResultadoResico {
  if (!Number.isFinite(ingresoMensual)) {
    return { ok: false, error: "Captura un ingreso válido." };
  }
  if (ingresoMensual <= 0) {
    return { ok: false, error: "El ingreso debe ser mayor a cero." };
  }

  const { tramo, indice } = tramoResico(ingresoMensual);
  const isr = Math.round(ingresoMensual * tramo.tasa * 100) / 100;

  return {
    ok: true,
    ingreso: ingresoMensual,
    tasa: tramo.tasa,
    isr,
    tramo,
    indiceTramo: indice,
    excedeLimiteMensual: ingresoMensual > LIMITE_MENSUAL_RESICO,
  };
}

/** Formatea un número como moneda MXN. */
export function fmtMxn(n: number): string {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Formatea una tasa (fracción) como porcentaje legible (1.00 %). */
export function fmtTasa(fraccion: number): string {
  return `${(fraccion * 100).toFixed(2)}%`;
}

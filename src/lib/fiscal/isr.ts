/**
 * Tarifas ISR vigentes para 2026.
 *
 * Fuente oficial: SAT — Anexo 8 de la Resolución Miscelánea Fiscal para
 * 2026, publicado en el DOF el 28 de diciembre de 2025.
 *
 * Las tarifas mensual y anual fueron actualizadas para 2026 (subieron los
 * límites por efecto de inflación). Si el SAT publica nuevas tarifas,
 * actualizar este archivo.
 */

export type RenglonTarifa = {
  /** Límite inferior del rango de ingresos. */
  limiteInferior: number;
  /** Límite superior del rango (Infinity para el último renglón). */
  limiteSuperior: number;
  /** Cuota fija del renglón. */
  cuotaFija: number;
  /** Porcentaje sobre el excedente del límite inferior. */
  porcentajeExcedente: number;
};

export type TarifaIsr = {
  titulo: string;
  vigenciaDesde: string;
  renglones: RenglonTarifa[];
};

// Fuente: Anexo 8 RMF 2026, Sección B.V — Tarifa mensual del art. 96 LISR.
export const TARIFA_ISR_MENSUAL_2026: TarifaIsr = {
  titulo: "Tarifa ISR mensual · Personas físicas",
  vigenciaDesde: "Vigente en 2026 (DOF 28/dic/2025)",
  renglones: [
    { limiteInferior: 0.01, limiteSuperior: 844.59, cuotaFija: 0, porcentajeExcedente: 1.92 },
    { limiteInferior: 844.6, limiteSuperior: 7168.51, cuotaFija: 16.22, porcentajeExcedente: 6.4 },
    { limiteInferior: 7168.52, limiteSuperior: 12598.02, cuotaFija: 420.95, porcentajeExcedente: 10.88 },
    { limiteInferior: 12598.03, limiteSuperior: 14644.64, cuotaFija: 1011.68, porcentajeExcedente: 16 },
    { limiteInferior: 14644.65, limiteSuperior: 17533.64, cuotaFija: 1339.14, porcentajeExcedente: 17.92 },
    { limiteInferior: 17533.65, limiteSuperior: 35362.83, cuotaFija: 1856.84, porcentajeExcedente: 21.36 },
    { limiteInferior: 35362.84, limiteSuperior: 55736.68, cuotaFija: 5665.16, porcentajeExcedente: 23.52 },
    { limiteInferior: 55736.69, limiteSuperior: 106410.5, cuotaFija: 10457.09, porcentajeExcedente: 30 },
    { limiteInferior: 106410.51, limiteSuperior: 141880.66, cuotaFija: 25659.23, porcentajeExcedente: 32 },
    { limiteInferior: 141880.67, limiteSuperior: 425641.99, cuotaFija: 37009.69, porcentajeExcedente: 34 },
    { limiteInferior: 425642.0, limiteSuperior: Infinity, cuotaFija: 133488.54, porcentajeExcedente: 35 },
  ],
};

// Fuente: Anexo 8 RMF 2026, Sección C.II — Tarifa anual del ejercicio 2026.
export const TARIFA_ISR_ANUAL_2026: TarifaIsr = {
  titulo: "Tarifa ISR anual · Personas físicas",
  vigenciaDesde: "Vigente en 2026 (DOF 28/dic/2025)",
  renglones: [
    { limiteInferior: 0.01, limiteSuperior: 10135.11, cuotaFija: 0, porcentajeExcedente: 1.92 },
    { limiteInferior: 10135.12, limiteSuperior: 86022.11, cuotaFija: 194.59, porcentajeExcedente: 6.4 },
    { limiteInferior: 86022.12, limiteSuperior: 151176.19, cuotaFija: 5051.37, porcentajeExcedente: 10.88 },
    { limiteInferior: 151176.2, limiteSuperior: 175735.66, cuotaFija: 12140.13, porcentajeExcedente: 16 },
    { limiteInferior: 175735.67, limiteSuperior: 210403.69, cuotaFija: 16069.64, porcentajeExcedente: 17.92 },
    { limiteInferior: 210403.7, limiteSuperior: 424353.97, cuotaFija: 22282.14, porcentajeExcedente: 21.36 },
    { limiteInferior: 424353.98, limiteSuperior: 668840.14, cuotaFija: 67981.92, porcentajeExcedente: 23.52 },
    { limiteInferior: 668840.15, limiteSuperior: 1276925.98, cuotaFija: 125485.07, porcentajeExcedente: 30 },
    { limiteInferior: 1276925.99, limiteSuperior: 1702567.97, cuotaFija: 307910.81, porcentajeExcedente: 32 },
    { limiteInferior: 1702567.98, limiteSuperior: 5107703.92, cuotaFija: 444116.23, porcentajeExcedente: 34 },
    { limiteInferior: 5107703.93, limiteSuperior: Infinity, cuotaFija: 1601862.46, porcentajeExcedente: 35 },
  ],
};

/**
 * Subsidio al empleo. Desde mayo 2024 dejó de ser una tabla por rangos y se
 * convirtió en un monto fijo mensual para trabajadores que perciban hasta
 * 1 SMG mensual. Decreto DOF 01/05/2024 — sigue vigente para 2026.
 *
 * El límite de ingreso se calcula con el SMG vigente ($315.04 × 30.4).
 */
export const SUBSIDIO_EMPLEO_2026 = {
  titulo: "Subsidio para el empleo",
  vigenciaDesde: "Vigente desde mayo 2024",
  montoFijoMensual: 475,
  limiteIngresoMensual: 9577.22,
  nota:
    "Se otorga al trabajador cuyo ingreso mensual no exceda el equivalente a un Salario Mínimo General (1 SMG mensual). Importe fijo: $475.00 mensuales.",
};

/**
 * Tasas de recargos por mora establecidas en la Ley de Ingresos de la
 * Federación (LIF). Las tasas se mantienen para 2026.
 */
export const RECARGOS_2026 = {
  titulo: "Tasas de recargos federales",
  vigenciaDesde: "Vigentes en 2025-2026 (LIF)",
  filas: [
    { concepto: "Mora (sin convenio)", tasaMensual: 1.47 },
    { concepto: "Pago en parcialidades hasta 12 meses", tasaMensual: 1.26 },
    { concepto: "Pago en parcialidades de 13 a 24 meses", tasaMensual: 1.53 },
    { concepto: "Pago en parcialidades a más de 24 meses y diferidos", tasaMensual: 1.82 },
  ],
};

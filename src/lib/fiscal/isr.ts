/**
 * Tarifas ISR vigentes para 2026.
 *
 * Fuente oficial: SAT — Anexos 8 de la Resolución Miscelánea Fiscal.
 * Las tarifas mensual y anual de personas físicas se actualizan cuando el
 * INPC acumulado supera el 10%; las vigentes desde 2024 siguen aplicando.
 *
 * Si en algún momento el SAT publica nuevas tarifas, actualizar este archivo
 * o, mejor, exponer un panel de edición desde el CRM.
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

export const TARIFA_ISR_MENSUAL_2026: TarifaIsr = {
  titulo: "Tarifa ISR mensual · Personas físicas",
  vigenciaDesde: "Vigente desde 2024 (sin cambios para 2026)",
  renglones: [
    { limiteInferior: 0.01, limiteSuperior: 746.04, cuotaFija: 0, porcentajeExcedente: 1.92 },
    { limiteInferior: 746.05, limiteSuperior: 6332.05, cuotaFija: 14.32, porcentajeExcedente: 6.4 },
    { limiteInferior: 6332.06, limiteSuperior: 11128.01, cuotaFija: 371.83, porcentajeExcedente: 10.88 },
    { limiteInferior: 11128.02, limiteSuperior: 12935.82, cuotaFija: 893.63, porcentajeExcedente: 16 },
    { limiteInferior: 12935.83, limiteSuperior: 15487.71, cuotaFija: 1182.88, porcentajeExcedente: 17.92 },
    { limiteInferior: 15487.72, limiteSuperior: 31236.49, cuotaFija: 1640.18, porcentajeExcedente: 21.36 },
    { limiteInferior: 31236.5, limiteSuperior: 49233.0, cuotaFija: 5004.12, porcentajeExcedente: 23.52 },
    { limiteInferior: 49233.01, limiteSuperior: 93993.9, cuotaFija: 9236.89, porcentajeExcedente: 30 },
    { limiteInferior: 93993.91, limiteSuperior: 125325.2, cuotaFija: 22665.17, porcentajeExcedente: 32 },
    { limiteInferior: 125325.21, limiteSuperior: 375975.61, cuotaFija: 32691.18, porcentajeExcedente: 34 },
    { limiteInferior: 375975.62, limiteSuperior: Infinity, cuotaFija: 117912.32, porcentajeExcedente: 35 },
  ],
};

export const TARIFA_ISR_ANUAL_2026: TarifaIsr = {
  titulo: "Tarifa ISR anual · Personas físicas",
  vigenciaDesde: "Vigente desde 2024 (sin cambios para 2026)",
  renglones: [
    { limiteInferior: 0.01, limiteSuperior: 8952.49, cuotaFija: 0, porcentajeExcedente: 1.92 },
    { limiteInferior: 8952.5, limiteSuperior: 75984.55, cuotaFija: 171.88, porcentajeExcedente: 6.4 },
    { limiteInferior: 75984.56, limiteSuperior: 133536.07, cuotaFija: 4461.94, porcentajeExcedente: 10.88 },
    { limiteInferior: 133536.08, limiteSuperior: 155229.8, cuotaFija: 10723.55, porcentajeExcedente: 16 },
    { limiteInferior: 155229.81, limiteSuperior: 185852.57, cuotaFija: 14194.54, porcentajeExcedente: 17.92 },
    { limiteInferior: 185852.58, limiteSuperior: 374837.88, cuotaFija: 19682.13, porcentajeExcedente: 21.36 },
    { limiteInferior: 374837.89, limiteSuperior: 590795.99, cuotaFija: 60049.4, porcentajeExcedente: 23.52 },
    { limiteInferior: 590796.0, limiteSuperior: 1127926.84, cuotaFija: 110842.74, porcentajeExcedente: 30 },
    { limiteInferior: 1127926.85, limiteSuperior: 1503902.46, cuotaFija: 271981.99, porcentajeExcedente: 32 },
    { limiteInferior: 1503902.47, limiteSuperior: 4511707.37, cuotaFija: 392294.17, porcentajeExcedente: 34 },
    { limiteInferior: 4511707.38, limiteSuperior: Infinity, cuotaFija: 1414947.85, porcentajeExcedente: 35 },
  ],
};

/**
 * Subsidio al empleo. Desde mayo 2024 dejó de ser una tabla por rangos y se
 * convirtió en un monto fijo mensual para trabajadores que perciban hasta
 * 1 SMG ($475.00). Decreto DOF 01/05/2024 — sigue vigente para 2026.
 */
export const SUBSIDIO_EMPLEO_2026 = {
  titulo: "Subsidio para el empleo",
  vigenciaDesde: "Vigente desde mayo 2024",
  montoFijoMensual: 475,
  limiteIngresoMensual: 8364.0,
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

/**
 * Tarifas ISR vigentes para 2026.
 *
 * Fuente oficial: SAT — Anexo 8 de la Resolución Miscelánea Fiscal para
 * 2026, publicado en el DOF el 28 de diciembre de 2025.
 *
 * Si el SAT publica nuevas tarifas (por inflación >10% INPC), actualizar
 * este archivo.
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

// ─────────────────────────────────────────────────────────────────────────────
// A. Tarifa anual (ejercicio 2026) — Sección C.II del Anexo 8 RMF 2026.
// ─────────────────────────────────────────────────────────────────────────────

const RENGLONES_ANUAL_2026: RenglonTarifa[] = [
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
];

export const TARIFA_ISR_ANUAL_2026: TarifaIsr = {
  titulo: "Tarifa ISR anual · Ejercicio 2026",
  vigenciaDesde: "Vigente en 2026 (DOF 28/dic/2025)",
  renglones: RENGLONES_ANUAL_2026,
};

// ─────────────────────────────────────────────────────────────────────────────
// B. Retenciones periódicas (Sección B.I a B.V del Anexo 8 RMF 2026).
// ─────────────────────────────────────────────────────────────────────────────

const RENGLONES_DIARIA_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 27.78, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 27.79, limiteSuperior: 235.81, cuotaFija: 0.53, porcentajeExcedente: 6.4 },
  { limiteInferior: 235.82, limiteSuperior: 414.41, cuotaFija: 13.85, porcentajeExcedente: 10.88 },
  { limiteInferior: 414.42, limiteSuperior: 481.73, cuotaFija: 33.28, porcentajeExcedente: 16 },
  { limiteInferior: 481.74, limiteSuperior: 576.76, cuotaFija: 44.05, porcentajeExcedente: 17.92 },
  { limiteInferior: 576.77, limiteSuperior: 1163.25, cuotaFija: 61.08, porcentajeExcedente: 21.36 },
  { limiteInferior: 1163.26, limiteSuperior: 1833.44, cuotaFija: 186.35, porcentajeExcedente: 23.52 },
  { limiteInferior: 1833.45, limiteSuperior: 3500.35, cuotaFija: 343.98, porcentajeExcedente: 30 },
  { limiteInferior: 3500.36, limiteSuperior: 4667.13, cuotaFija: 844.05, porcentajeExcedente: 32 },
  { limiteInferior: 4667.14, limiteSuperior: 14001.38, cuotaFija: 1217.42, porcentajeExcedente: 34 },
  { limiteInferior: 14001.39, limiteSuperior: Infinity, cuotaFija: 4391.07, porcentajeExcedente: 35 },
];

const RENGLONES_SEMANAL_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 194.46, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 194.47, limiteSuperior: 1650.67, cuotaFija: 3.71, porcentajeExcedente: 6.4 },
  { limiteInferior: 1650.68, limiteSuperior: 2900.87, cuotaFija: 96.95, porcentajeExcedente: 10.88 },
  { limiteInferior: 2900.88, limiteSuperior: 3372.11, cuotaFija: 232.96, porcentajeExcedente: 16 },
  { limiteInferior: 3372.12, limiteSuperior: 4037.32, cuotaFija: 308.35, porcentajeExcedente: 17.92 },
  { limiteInferior: 4037.33, limiteSuperior: 8142.75, cuotaFija: 427.56, porcentajeExcedente: 21.36 },
  { limiteInferior: 8142.76, limiteSuperior: 12834.08, cuotaFija: 1304.45, porcentajeExcedente: 23.52 },
  { limiteInferior: 12834.09, limiteSuperior: 24502.45, cuotaFija: 2407.86, porcentajeExcedente: 30 },
  { limiteInferior: 24502.46, limiteSuperior: 32669.91, cuotaFija: 5908.35, porcentajeExcedente: 32 },
  { limiteInferior: 32669.92, limiteSuperior: 98009.66, cuotaFija: 8521.94, porcentajeExcedente: 34 },
  { limiteInferior: 98009.67, limiteSuperior: Infinity, cuotaFija: 30737.49, porcentajeExcedente: 35 },
];

const RENGLONES_DECENAL_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 277.8, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 277.81, limiteSuperior: 2358.1, cuotaFija: 5.3, porcentajeExcedente: 6.4 },
  { limiteInferior: 2358.11, limiteSuperior: 4144.1, cuotaFija: 138.5, porcentajeExcedente: 10.88 },
  { limiteInferior: 4144.11, limiteSuperior: 4817.3, cuotaFija: 332.8, porcentajeExcedente: 16 },
  { limiteInferior: 4817.31, limiteSuperior: 5767.6, cuotaFija: 440.5, porcentajeExcedente: 17.92 },
  { limiteInferior: 5767.61, limiteSuperior: 11632.5, cuotaFija: 610.8, porcentajeExcedente: 21.36 },
  { limiteInferior: 11632.51, limiteSuperior: 18334.4, cuotaFija: 1863.5, porcentajeExcedente: 23.52 },
  { limiteInferior: 18334.41, limiteSuperior: 35003.5, cuotaFija: 3439.8, porcentajeExcedente: 30 },
  { limiteInferior: 35003.51, limiteSuperior: 46671.3, cuotaFija: 8440.5, porcentajeExcedente: 32 },
  { limiteInferior: 46671.31, limiteSuperior: 140013.8, cuotaFija: 12174.2, porcentajeExcedente: 34 },
  { limiteInferior: 140013.81, limiteSuperior: Infinity, cuotaFija: 43910.7, porcentajeExcedente: 35 },
];

const RENGLONES_QUINCENAL_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 416.7, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 416.71, limiteSuperior: 3537.15, cuotaFija: 7.95, porcentajeExcedente: 6.4 },
  { limiteInferior: 3537.16, limiteSuperior: 6216.15, cuotaFija: 207.75, porcentajeExcedente: 10.88 },
  { limiteInferior: 6216.16, limiteSuperior: 7225.95, cuotaFija: 499.2, porcentajeExcedente: 16 },
  { limiteInferior: 7225.96, limiteSuperior: 8651.4, cuotaFija: 660.75, porcentajeExcedente: 17.92 },
  { limiteInferior: 8651.41, limiteSuperior: 17448.75, cuotaFija: 916.2, porcentajeExcedente: 21.36 },
  { limiteInferior: 17448.76, limiteSuperior: 27501.6, cuotaFija: 2795.25, porcentajeExcedente: 23.52 },
  { limiteInferior: 27501.61, limiteSuperior: 52505.25, cuotaFija: 5159.7, porcentajeExcedente: 30 },
  { limiteInferior: 52505.26, limiteSuperior: 70006.95, cuotaFija: 12660.75, porcentajeExcedente: 32 },
  { limiteInferior: 70006.96, limiteSuperior: 210020.7, cuotaFija: 18261.3, porcentajeExcedente: 34 },
  { limiteInferior: 210020.71, limiteSuperior: Infinity, cuotaFija: 65866.05, porcentajeExcedente: 35 },
];

// Mensual (B.V) = misma estructura que la tarifa de enero de los pagos
// provisionales de personas físicas con actividad empresarial.
const RENGLONES_MENSUAL_2026: RenglonTarifa[] = [
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
  { limiteInferior: 425642, limiteSuperior: Infinity, cuotaFija: 133488.54, porcentajeExcedente: 35 },
];

// Alias retrocompatible.
export const TARIFA_ISR_MENSUAL_2026: TarifaIsr = {
  titulo: "Tarifa ISR mensual · Personas físicas",
  vigenciaDesde: "Vigente en 2026 (DOF 28/dic/2025)",
  renglones: RENGLONES_MENSUAL_2026,
};

export type PeriodicidadRetencion = "diaria" | "semanal" | "decenal" | "quincenal" | "mensual";

export const ISR_RETENCIONES_2026: Record<
  PeriodicidadRetencion,
  TarifaIsr & { id: PeriodicidadRetencion; etiquetaCorta: string }
> = {
  diaria: {
    id: "diaria",
    etiquetaCorta: "Diaria",
    titulo: "Tarifa ISR diaria · Retenciones",
    vigenciaDesde: "Vigente en 2026 (DOF 28/dic/2025)",
    renglones: RENGLONES_DIARIA_2026,
  },
  semanal: {
    id: "semanal",
    etiquetaCorta: "Semanal",
    titulo: "Tarifa ISR semanal (7 días) · Retenciones",
    vigenciaDesde: "Vigente en 2026 (DOF 28/dic/2025)",
    renglones: RENGLONES_SEMANAL_2026,
  },
  decenal: {
    id: "decenal",
    etiquetaCorta: "Decenal",
    titulo: "Tarifa ISR decenal (10 días) · Retenciones",
    vigenciaDesde: "Vigente en 2026 (DOF 28/dic/2025)",
    renglones: RENGLONES_DECENAL_2026,
  },
  quincenal: {
    id: "quincenal",
    etiquetaCorta: "Quincenal",
    titulo: "Tarifa ISR quincenal (15 días) · Retenciones",
    vigenciaDesde: "Vigente en 2026 (DOF 28/dic/2025)",
    renglones: RENGLONES_QUINCENAL_2026,
  },
  mensual: {
    id: "mensual",
    etiquetaCorta: "Mensual",
    titulo: "Tarifa ISR mensual · Retenciones",
    vigenciaDesde: "Vigente en 2026 (DOF 28/dic/2025)",
    renglones: RENGLONES_MENSUAL_2026,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// C. Pagos provisionales mensuales acumulativos · Personas físicas con
//    actividad empresarial (Sección B.VI del Anexo 8 RMF 2026).
//    Enero = misma tarifa mensual; el resto se acumula.
// ─────────────────────────────────────────────────────────────────────────────

export type MesProvisional =
  | "enero"
  | "febrero"
  | "marzo"
  | "abril"
  | "mayo"
  | "junio"
  | "julio"
  | "agosto"
  | "septiembre"
  | "octubre"
  | "noviembre"
  | "diciembre";

const ISR_PROVISIONAL_ENERO_2026 = RENGLONES_MENSUAL_2026;

const ISR_PROVISIONAL_FEBRERO_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 1689.18, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 1689.19, limiteSuperior: 14337.02, cuotaFija: 32.44, porcentajeExcedente: 6.4 },
  { limiteInferior: 14337.03, limiteSuperior: 25196.04, cuotaFija: 841.9, porcentajeExcedente: 10.88 },
  { limiteInferior: 25196.05, limiteSuperior: 29289.28, cuotaFija: 2023.36, porcentajeExcedente: 16 },
  { limiteInferior: 29289.29, limiteSuperior: 35067.28, cuotaFija: 2678.28, porcentajeExcedente: 17.92 },
  { limiteInferior: 35067.29, limiteSuperior: 70725.66, cuotaFija: 3713.68, porcentajeExcedente: 21.36 },
  { limiteInferior: 70725.67, limiteSuperior: 111473.36, cuotaFija: 11330.32, porcentajeExcedente: 23.52 },
  { limiteInferior: 111473.37, limiteSuperior: 212821.0, cuotaFija: 20914.18, porcentajeExcedente: 30 },
  { limiteInferior: 212821.01, limiteSuperior: 283761.32, cuotaFija: 51318.46, porcentajeExcedente: 32 },
  { limiteInferior: 283761.33, limiteSuperior: 851283.98, cuotaFija: 74019.38, porcentajeExcedente: 34 },
  { limiteInferior: 851283.99, limiteSuperior: Infinity, cuotaFija: 266977.08, porcentajeExcedente: 35 },
];

const ISR_PROVISIONAL_MARZO_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 2533.77, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 2533.78, limiteSuperior: 21505.53, cuotaFija: 48.66, porcentajeExcedente: 6.4 },
  { limiteInferior: 21505.54, limiteSuperior: 37794.06, cuotaFija: 1262.85, porcentajeExcedente: 10.88 },
  { limiteInferior: 37794.07, limiteSuperior: 43933.92, cuotaFija: 3035.04, porcentajeExcedente: 16 },
  { limiteInferior: 43933.93, limiteSuperior: 52600.92, cuotaFija: 4017.42, porcentajeExcedente: 17.92 },
  { limiteInferior: 52600.93, limiteSuperior: 106088.49, cuotaFija: 5570.52, porcentajeExcedente: 21.36 },
  { limiteInferior: 106088.5, limiteSuperior: 167210.04, cuotaFija: 16995.48, porcentajeExcedente: 23.52 },
  { limiteInferior: 167210.05, limiteSuperior: 319231.5, cuotaFija: 31371.27, porcentajeExcedente: 30 },
  { limiteInferior: 319231.51, limiteSuperior: 425641.98, cuotaFija: 76977.69, porcentajeExcedente: 32 },
  { limiteInferior: 425641.99, limiteSuperior: 1276925.97, cuotaFija: 111029.07, porcentajeExcedente: 34 },
  { limiteInferior: 1276925.98, limiteSuperior: Infinity, cuotaFija: 400465.62, porcentajeExcedente: 35 },
];

const ISR_PROVISIONAL_ABRIL_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 3378.36, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 3378.37, limiteSuperior: 28674.04, cuotaFija: 64.88, porcentajeExcedente: 6.4 },
  { limiteInferior: 28674.05, limiteSuperior: 50392.08, cuotaFija: 1683.8, porcentajeExcedente: 10.88 },
  { limiteInferior: 50392.09, limiteSuperior: 58578.56, cuotaFija: 4046.72, porcentajeExcedente: 16 },
  { limiteInferior: 58578.57, limiteSuperior: 70134.56, cuotaFija: 5356.56, porcentajeExcedente: 17.92 },
  { limiteInferior: 70134.57, limiteSuperior: 141451.32, cuotaFija: 7427.36, porcentajeExcedente: 21.36 },
  { limiteInferior: 141451.33, limiteSuperior: 222946.72, cuotaFija: 22660.64, porcentajeExcedente: 23.52 },
  { limiteInferior: 222946.73, limiteSuperior: 425642.0, cuotaFija: 41828.36, porcentajeExcedente: 30 },
  { limiteInferior: 425642.01, limiteSuperior: 567522.64, cuotaFija: 102636.92, porcentajeExcedente: 32 },
  { limiteInferior: 567522.65, limiteSuperior: 1702567.96, cuotaFija: 148038.76, porcentajeExcedente: 34 },
  { limiteInferior: 1702567.97, limiteSuperior: Infinity, cuotaFija: 533954.16, porcentajeExcedente: 35 },
];

const ISR_PROVISIONAL_MAYO_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 4222.95, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 4222.96, limiteSuperior: 35842.55, cuotaFija: 81.1, porcentajeExcedente: 6.4 },
  { limiteInferior: 35842.56, limiteSuperior: 62990.1, cuotaFija: 2104.75, porcentajeExcedente: 10.88 },
  { limiteInferior: 62990.11, limiteSuperior: 73223.2, cuotaFija: 5058.4, porcentajeExcedente: 16 },
  { limiteInferior: 73223.21, limiteSuperior: 87668.2, cuotaFija: 6695.7, porcentajeExcedente: 17.92 },
  { limiteInferior: 87668.21, limiteSuperior: 176814.15, cuotaFija: 9284.2, porcentajeExcedente: 21.36 },
  { limiteInferior: 176814.16, limiteSuperior: 278683.4, cuotaFija: 28325.8, porcentajeExcedente: 23.52 },
  { limiteInferior: 278683.41, limiteSuperior: 532052.5, cuotaFija: 52285.45, porcentajeExcedente: 30 },
  { limiteInferior: 532052.51, limiteSuperior: 709403.3, cuotaFija: 128296.15, porcentajeExcedente: 32 },
  { limiteInferior: 709403.31, limiteSuperior: 2128209.95, cuotaFija: 185048.45, porcentajeExcedente: 34 },
  { limiteInferior: 2128209.96, limiteSuperior: Infinity, cuotaFija: 667442.7, porcentajeExcedente: 35 },
];

const ISR_PROVISIONAL_JUNIO_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 5067.54, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 5067.55, limiteSuperior: 43011.06, cuotaFija: 97.32, porcentajeExcedente: 6.4 },
  { limiteInferior: 43011.07, limiteSuperior: 75588.12, cuotaFija: 2525.7, porcentajeExcedente: 10.88 },
  { limiteInferior: 75588.13, limiteSuperior: 87867.84, cuotaFija: 6070.08, porcentajeExcedente: 16 },
  { limiteInferior: 87867.85, limiteSuperior: 105201.84, cuotaFija: 8034.84, porcentajeExcedente: 17.92 },
  { limiteInferior: 105201.85, limiteSuperior: 212176.98, cuotaFija: 11141.04, porcentajeExcedente: 21.36 },
  { limiteInferior: 212176.99, limiteSuperior: 334420.08, cuotaFija: 33990.96, porcentajeExcedente: 23.52 },
  { limiteInferior: 334420.09, limiteSuperior: 638463.0, cuotaFija: 62742.54, porcentajeExcedente: 30 },
  { limiteInferior: 638463.01, limiteSuperior: 851283.96, cuotaFija: 153955.38, porcentajeExcedente: 32 },
  { limiteInferior: 851283.97, limiteSuperior: 2553851.94, cuotaFija: 222058.14, porcentajeExcedente: 34 },
  { limiteInferior: 2553851.95, limiteSuperior: Infinity, cuotaFija: 800931.24, porcentajeExcedente: 35 },
];

const ISR_PROVISIONAL_JULIO_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 5912.13, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 5912.14, limiteSuperior: 50179.57, cuotaFija: 113.54, porcentajeExcedente: 6.4 },
  { limiteInferior: 50179.58, limiteSuperior: 88186.14, cuotaFija: 2946.65, porcentajeExcedente: 10.88 },
  { limiteInferior: 88186.15, limiteSuperior: 102512.48, cuotaFija: 7081.76, porcentajeExcedente: 16 },
  { limiteInferior: 102512.49, limiteSuperior: 122735.48, cuotaFija: 9373.98, porcentajeExcedente: 17.92 },
  { limiteInferior: 122735.49, limiteSuperior: 247539.81, cuotaFija: 12997.88, porcentajeExcedente: 21.36 },
  { limiteInferior: 247539.82, limiteSuperior: 390156.76, cuotaFija: 39656.12, porcentajeExcedente: 23.52 },
  { limiteInferior: 390156.77, limiteSuperior: 744873.5, cuotaFija: 73199.63, porcentajeExcedente: 30 },
  { limiteInferior: 744873.51, limiteSuperior: 993164.62, cuotaFija: 179614.61, porcentajeExcedente: 32 },
  { limiteInferior: 993164.63, limiteSuperior: 2979493.93, cuotaFija: 259067.83, porcentajeExcedente: 34 },
  { limiteInferior: 2979493.94, limiteSuperior: Infinity, cuotaFija: 934419.78, porcentajeExcedente: 35 },
];

const ISR_PROVISIONAL_AGOSTO_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 6756.72, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 6756.73, limiteSuperior: 57348.08, cuotaFija: 129.76, porcentajeExcedente: 6.4 },
  { limiteInferior: 57348.09, limiteSuperior: 100784.16, cuotaFija: 3367.6, porcentajeExcedente: 10.88 },
  { limiteInferior: 100784.17, limiteSuperior: 117157.12, cuotaFija: 8093.44, porcentajeExcedente: 16 },
  { limiteInferior: 117157.13, limiteSuperior: 140269.12, cuotaFija: 10713.12, porcentajeExcedente: 17.92 },
  { limiteInferior: 140269.13, limiteSuperior: 282902.64, cuotaFija: 14854.72, porcentajeExcedente: 21.36 },
  { limiteInferior: 282902.65, limiteSuperior: 445893.44, cuotaFija: 45321.28, porcentajeExcedente: 23.52 },
  { limiteInferior: 445893.45, limiteSuperior: 851284.0, cuotaFija: 83656.72, porcentajeExcedente: 30 },
  { limiteInferior: 851284.01, limiteSuperior: 1135045.28, cuotaFija: 205273.84, porcentajeExcedente: 32 },
  { limiteInferior: 1135045.29, limiteSuperior: 3405135.92, cuotaFija: 296077.52, porcentajeExcedente: 34 },
  { limiteInferior: 3405135.93, limiteSuperior: Infinity, cuotaFija: 1067908.32, porcentajeExcedente: 35 },
];

const ISR_PROVISIONAL_SEPTIEMBRE_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 7601.31, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 7601.32, limiteSuperior: 64516.59, cuotaFija: 145.98, porcentajeExcedente: 6.4 },
  { limiteInferior: 64516.6, limiteSuperior: 113382.18, cuotaFija: 3788.55, porcentajeExcedente: 10.88 },
  { limiteInferior: 113382.19, limiteSuperior: 131801.76, cuotaFija: 9105.12, porcentajeExcedente: 16 },
  { limiteInferior: 131801.77, limiteSuperior: 157802.76, cuotaFija: 12052.26, porcentajeExcedente: 17.92 },
  { limiteInferior: 157802.77, limiteSuperior: 318265.47, cuotaFija: 16711.56, porcentajeExcedente: 21.36 },
  { limiteInferior: 318265.48, limiteSuperior: 501630.12, cuotaFija: 50986.44, porcentajeExcedente: 23.52 },
  { limiteInferior: 501630.13, limiteSuperior: 957694.5, cuotaFija: 94113.81, porcentajeExcedente: 30 },
  { limiteInferior: 957694.51, limiteSuperior: 1276925.94, cuotaFija: 230933.07, porcentajeExcedente: 32 },
  { limiteInferior: 1276925.95, limiteSuperior: 3830777.91, cuotaFija: 333087.21, porcentajeExcedente: 34 },
  { limiteInferior: 3830777.92, limiteSuperior: Infinity, cuotaFija: 1201396.86, porcentajeExcedente: 35 },
];

const ISR_PROVISIONAL_OCTUBRE_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 8445.9, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 8445.91, limiteSuperior: 71685.1, cuotaFija: 162.2, porcentajeExcedente: 6.4 },
  { limiteInferior: 71685.11, limiteSuperior: 125980.2, cuotaFija: 4209.5, porcentajeExcedente: 10.88 },
  { limiteInferior: 125980.21, limiteSuperior: 146446.4, cuotaFija: 10116.8, porcentajeExcedente: 16 },
  { limiteInferior: 146446.41, limiteSuperior: 175336.4, cuotaFija: 13391.4, porcentajeExcedente: 17.92 },
  { limiteInferior: 175336.41, limiteSuperior: 353628.3, cuotaFija: 18568.4, porcentajeExcedente: 21.36 },
  { limiteInferior: 353628.31, limiteSuperior: 557366.8, cuotaFija: 56651.6, porcentajeExcedente: 23.52 },
  { limiteInferior: 557366.81, limiteSuperior: 1064105.0, cuotaFija: 104570.9, porcentajeExcedente: 30 },
  { limiteInferior: 1064105.01, limiteSuperior: 1418806.6, cuotaFija: 256592.3, porcentajeExcedente: 32 },
  { limiteInferior: 1418806.61, limiteSuperior: 4256419.9, cuotaFija: 370096.9, porcentajeExcedente: 34 },
  { limiteInferior: 4256419.91, limiteSuperior: Infinity, cuotaFija: 1334885.4, porcentajeExcedente: 35 },
];

const ISR_PROVISIONAL_NOVIEMBRE_2026: RenglonTarifa[] = [
  { limiteInferior: 0.01, limiteSuperior: 9290.49, cuotaFija: 0, porcentajeExcedente: 1.92 },
  { limiteInferior: 9290.5, limiteSuperior: 78853.61, cuotaFija: 178.42, porcentajeExcedente: 6.4 },
  { limiteInferior: 78853.62, limiteSuperior: 138578.22, cuotaFija: 4630.45, porcentajeExcedente: 10.88 },
  { limiteInferior: 138578.23, limiteSuperior: 161091.04, cuotaFija: 11128.48, porcentajeExcedente: 16 },
  { limiteInferior: 161091.05, limiteSuperior: 192870.04, cuotaFija: 14730.54, porcentajeExcedente: 17.92 },
  { limiteInferior: 192870.05, limiteSuperior: 388991.13, cuotaFija: 20425.24, porcentajeExcedente: 21.36 },
  { limiteInferior: 388991.14, limiteSuperior: 613103.48, cuotaFija: 62316.76, porcentajeExcedente: 23.52 },
  { limiteInferior: 613103.49, limiteSuperior: 1170515.5, cuotaFija: 115027.99, porcentajeExcedente: 30 },
  { limiteInferior: 1170515.51, limiteSuperior: 1560687.26, cuotaFija: 282251.53, porcentajeExcedente: 32 },
  { limiteInferior: 1560687.27, limiteSuperior: 4682061.89, cuotaFija: 407106.59, porcentajeExcedente: 34 },
  { limiteInferior: 4682061.9, limiteSuperior: Infinity, cuotaFija: 1468373.94, porcentajeExcedente: 35 },
];

// Diciembre = misma tarifa que el ejercicio anual.
const ISR_PROVISIONAL_DICIEMBRE_2026 = RENGLONES_ANUAL_2026;

const MES_NOMBRE_CORTO: Record<MesProvisional, string> = {
  enero: "Ene",
  febrero: "Feb",
  marzo: "Mar",
  abril: "Abr",
  mayo: "May",
  junio: "Jun",
  julio: "Jul",
  agosto: "Ago",
  septiembre: "Sep",
  octubre: "Oct",
  noviembre: "Nov",
  diciembre: "Dic",
};

const MES_NOMBRE_LARGO: Record<MesProvisional, string> = {
  enero: "Enero",
  febrero: "Febrero",
  marzo: "Marzo",
  abril: "Abril",
  mayo: "Mayo",
  junio: "Junio",
  julio: "Julio",
  agosto: "Agosto",
  septiembre: "Septiembre",
  octubre: "Octubre",
  noviembre: "Noviembre",
  diciembre: "Diciembre",
};

function provisionalDe(mes: MesProvisional, renglones: RenglonTarifa[]): TarifaIsr & {
  id: MesProvisional;
  etiquetaCorta: string;
} {
  return {
    id: mes,
    etiquetaCorta: MES_NOMBRE_CORTO[mes],
    titulo: `Pagos provisionales · ${MES_NOMBRE_LARGO[mes]} 2026`,
    vigenciaDesde: "Acumulada al cierre del mes · DOF 28/dic/2025",
    renglones,
  };
}

export const ISR_PROVISIONALES_PF_2026: Record<
  MesProvisional,
  TarifaIsr & { id: MesProvisional; etiquetaCorta: string }
> = {
  enero: provisionalDe("enero", ISR_PROVISIONAL_ENERO_2026),
  febrero: provisionalDe("febrero", ISR_PROVISIONAL_FEBRERO_2026),
  marzo: provisionalDe("marzo", ISR_PROVISIONAL_MARZO_2026),
  abril: provisionalDe("abril", ISR_PROVISIONAL_ABRIL_2026),
  mayo: provisionalDe("mayo", ISR_PROVISIONAL_MAYO_2026),
  junio: provisionalDe("junio", ISR_PROVISIONAL_JUNIO_2026),
  julio: provisionalDe("julio", ISR_PROVISIONAL_JULIO_2026),
  agosto: provisionalDe("agosto", ISR_PROVISIONAL_AGOSTO_2026),
  septiembre: provisionalDe("septiembre", ISR_PROVISIONAL_SEPTIEMBRE_2026),
  octubre: provisionalDe("octubre", ISR_PROVISIONAL_OCTUBRE_2026),
  noviembre: provisionalDe("noviembre", ISR_PROVISIONAL_NOVIEMBRE_2026),
  diciembre: provisionalDe("diciembre", ISR_PROVISIONAL_DICIEMBRE_2026),
};

// ─────────────────────────────────────────────────────────────────────────────
// D. RIF bimestral (coeficiente de utilidad) — Sección B.VIII del Anexo 8.
//    Cada bimestre es la tarifa acumulada que coincide con el mes par del
//    bimestre en los provisionales mensuales.
// ─────────────────────────────────────────────────────────────────────────────

export type BimestreRif =
  | "ene-feb"
  | "mar-abr"
  | "may-jun"
  | "jul-ago"
  | "sep-oct"
  | "nov-dic";

const BIMESTRE_ETIQUETA: Record<BimestreRif, string> = {
  "ene-feb": "Ene-Feb",
  "mar-abr": "Mar-Abr",
  "may-jun": "May-Jun",
  "jul-ago": "Jul-Ago",
  "sep-oct": "Sep-Oct",
  "nov-dic": "Nov-Dic",
};

const BIMESTRE_NOMBRE: Record<BimestreRif, string> = {
  "ene-feb": "Enero-Febrero",
  "mar-abr": "Marzo-Abril",
  "may-jun": "Mayo-Junio",
  "jul-ago": "Julio-Agosto",
  "sep-oct": "Septiembre-Octubre",
  "nov-dic": "Noviembre-Diciembre",
};

function rifDe(bim: BimestreRif, renglones: RenglonTarifa[]): TarifaIsr & {
  id: BimestreRif;
  etiquetaCorta: string;
} {
  return {
    id: bim,
    etiquetaCorta: BIMESTRE_ETIQUETA[bim],
    titulo: `RIF · ${BIMESTRE_NOMBRE[bim]} 2026`,
    vigenciaDesde: "Coeficiente de utilidad · DOF 28/dic/2025",
    renglones,
  };
}

export const ISR_RIF_BIMESTRAL_2026: Record<
  BimestreRif,
  TarifaIsr & { id: BimestreRif; etiquetaCorta: string }
> = {
  "ene-feb": rifDe("ene-feb", ISR_PROVISIONAL_FEBRERO_2026),
  "mar-abr": rifDe("mar-abr", ISR_PROVISIONAL_ABRIL_2026),
  "may-jun": rifDe("may-jun", ISR_PROVISIONAL_JUNIO_2026),
  "jul-ago": rifDe("jul-ago", ISR_PROVISIONAL_AGOSTO_2026),
  "sep-oct": rifDe("sep-oct", ISR_PROVISIONAL_OCTUBRE_2026),
  "nov-dic": rifDe("nov-dic", ISR_PROVISIONAL_DICIEMBRE_2026),
};

// ─────────────────────────────────────────────────────────────────────────────
// E. Subsidio para el empleo y recargos.
// ─────────────────────────────────────────────────────────────────────────────

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

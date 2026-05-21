/**
 * Tipos de cambio referenciales contra el peso mexicano (MXN).
 *
 * Fuente: Frankfurter.app — proxy gratuito (sin API key) de los datos
 * publicados por el Banco Central Europeo (BCE) en horario hábil.
 *
 * Notas:
 *   - El BCE publica una sola vez al día (≈ 16:00 CET), no en tiempo real.
 *   - Para usos contables/oficiales en México se debería complementar con
 *     el tipo de cambio FIX de Banxico (otra integración).
 *   - El fallback se usa cuando la API falla o no hay red.
 */

export type CodigoMoneda =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CAD"
  | "CHF"
  | "CNY"
  | "AUD";

export type MonedaInfo = {
  codigo: CodigoMoneda;
  nombre: string;
  pais: string;
  simbolo: string;
  bandera: string;
};

export const MONEDAS: Record<CodigoMoneda, MonedaInfo> = {
  USD: { codigo: "USD", nombre: "Dólar estadounidense", pais: "Estados Unidos", simbolo: "$", bandera: "🇺🇸" },
  EUR: { codigo: "EUR", nombre: "Euro", pais: "Unión Europea", simbolo: "€", bandera: "🇪🇺" },
  GBP: { codigo: "GBP", nombre: "Libra esterlina", pais: "Reino Unido", simbolo: "£", bandera: "🇬🇧" },
  JPY: { codigo: "JPY", nombre: "Yen japonés", pais: "Japón", simbolo: "¥", bandera: "🇯🇵" },
  CAD: { codigo: "CAD", nombre: "Dólar canadiense", pais: "Canadá", simbolo: "C$", bandera: "🇨🇦" },
  CHF: { codigo: "CHF", nombre: "Franco suizo", pais: "Suiza", simbolo: "₣", bandera: "🇨🇭" },
  CNY: { codigo: "CNY", nombre: "Yuan chino", pais: "China", simbolo: "¥", bandera: "🇨🇳" },
  AUD: { codigo: "AUD", nombre: "Dólar australiano", pais: "Australia", simbolo: "A$", bandera: "🇦🇺" },
};

/** Orden en que se muestran en la UI. */
export const MONEDAS_ORDEN: CodigoMoneda[] = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "CHF",
  "CNY",
  "AUD",
];

export type TasaDivisa = {
  codigo: CodigoMoneda;
  /** Cuántos pesos vale 1 unidad de la moneda extranjera (X/MXN). */
  valorMxn: number;
  /** Variación absoluta vs día previo (en MXN). */
  variacion: number | null;
  /** Variación porcentual vs día previo. */
  variacionPct: number | null;
};

export type RespuestaDivisas = {
  base: "MXN";
  tasas: TasaDivisa[];
  /** Fecha de la cotización del BCE (YYYY-MM-DD). */
  fecha: string;
  fuente: "BCE" | "fallback";
  actualizadoEn: string;
};

/**
 * Fallback con valores referenciales recientes (aprox. mayo 2026).
 * Solo se usa si la API falla por completo.
 */
export const DIVISAS_FALLBACK: RespuestaDivisas = {
  base: "MXN",
  fecha: "2026-05-15",
  fuente: "fallback",
  actualizadoEn: "Datos referenciales",
  tasas: [
    { codigo: "USD", valorMxn: 17.23, variacion: null, variacionPct: null },
    { codigo: "EUR", valorMxn: 18.91, variacion: null, variacionPct: null },
    { codigo: "GBP", valorMxn: 22.45, variacion: null, variacionPct: null },
    { codigo: "JPY", valorMxn: 0.111, variacion: null, variacionPct: null },
    { codigo: "CAD", valorMxn: 12.64, variacion: null, variacionPct: null },
    { codigo: "CHF", valorMxn: 19.83, variacion: null, variacionPct: null },
    { codigo: "CNY", valorMxn: 2.39, variacion: null, variacionPct: null },
    { codigo: "AUD", valorMxn: 11.42, variacion: null, variacionPct: null },
  ],
};

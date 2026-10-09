/**
 * Mercados y tipos de cambio referenciales.
 *
 * Fuentes:
 *   - Divisas: Frankfurter.app (BCE) + Banxico FIX cuando hay token
 *   - Cripto / oro: CoinGecko (gratis, sin key para uso moderado)
 *   - UDI, TIIE: Banxico SIE-API
 *   - WTI: referencia diaria (fallback; commodity sin API key estable)
 */

import type { IndicadorBanxico } from "./banxico";

export type IdIndicador = "USD_FIX" | "UDI" | "TIIE_28" | "WTI";

export type IndicadorMercado = {
  id: IdIndicador;
  etiqueta: string;
  valor: number;
  unidad: string;
  variacionPct: number | null;
};

export type CodigoMoneda =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CAD"
  | "CHF"
  | "CNY"
  | "AUD";

export type CodigoAlternativo = "BTC" | "XAU" | "WTI";

export type IdActivo = CodigoMoneda | CodigoAlternativo;

export type MonedaInfo = {
  id: IdActivo;
  nombre: string;
  pais?: string;
  simbolo: string;
  bandera: string;
  categoria: "forex" | "crypto" | "commodity";
};

export const ACTIVOS: Record<IdActivo, MonedaInfo> = {
  USD: {
    id: "USD",
    nombre: "Dólar estadounidense",
    pais: "Estados Unidos",
    simbolo: "$",
    bandera: "🇺🇸",
    categoria: "forex",
  },
  EUR: {
    id: "EUR",
    nombre: "Euro",
    pais: "Unión Europea",
    simbolo: "€",
    bandera: "🇪🇺",
    categoria: "forex",
  },
  GBP: {
    id: "GBP",
    nombre: "Libra esterlina",
    pais: "Reino Unido",
    simbolo: "£",
    bandera: "🇬🇧",
    categoria: "forex",
  },
  JPY: {
    id: "JPY",
    nombre: "Yen japonés",
    pais: "Japón",
    simbolo: "¥",
    bandera: "🇯🇵",
    categoria: "forex",
  },
  CAD: {
    id: "CAD",
    nombre: "Dólar canadiense",
    pais: "Canadá",
    simbolo: "C$",
    bandera: "🇨🇦",
    categoria: "forex",
  },
  CHF: {
    id: "CHF",
    nombre: "Franco suizo",
    pais: "Suiza",
    simbolo: "₣",
    bandera: "🇨🇭",
    categoria: "forex",
  },
  CNY: {
    id: "CNY",
    nombre: "Yuan chino",
    pais: "China",
    simbolo: "¥",
    bandera: "🇨🇳",
    categoria: "forex",
  },
  AUD: {
    id: "AUD",
    nombre: "Dólar australiano",
    pais: "Australia",
    simbolo: "A$",
    bandera: "🇦🇺",
    categoria: "forex",
  },
  BTC: {
    id: "BTC",
    nombre: "Bitcoin",
    simbolo: "₿",
    bandera: "🪙",
    categoria: "crypto",
  },
  XAU: {
    id: "XAU",
    nombre: "Oro (onza troy)",
    simbolo: "Au",
    bandera: "🥇",
    categoria: "commodity",
  },
  WTI: {
    id: "WTI",
    nombre: "Petróleo WTI",
    simbolo: "🛢",
    bandera: "🛢",
    categoria: "commodity",
  },
};

/** Orden por defecto en ticker y panel. */
export const ACTIVOS_ORDEN_DEFECTO: IdActivo[] = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "CHF",
  "CNY",
  "AUD",
  "BTC",
  "XAU",
  "WTI",
];

/** Solo divisas (Frankfurter). */
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

/** Alias retrocompatible. */
export const MONEDAS = ACTIVOS;

export type TasaActivo = {
  id: IdActivo;
  /** Valor principal: MXN por unidad (forex/crypto/gold) o USD/bbl (WTI). */
  valor: number;
  unidad: string;
  variacion: number | null;
  variacionPct: number | null;
  /** Últimos ~30 puntos normalizados 0–100 para sparkline. */
  sparkline: number[];
};

export type PuntoHistorial = {
  fecha: string;
  valor: number;
};

export type RespuestaMercados = {
  fecha: string;
  actualizadoEn: string;
  activos: TasaActivo[];
  indicadores: IndicadorMercado[];
  /** Serie USD/MXN últimos 30 días (para hero). */
  historialUsd: PuntoHistorial[];
  usdFix: number | null;
  fuentes: {
    divisas: "BCE" | "Banxico" | "fallback";
    banxico: "Banxico" | "fallback";
    crypto: "CoinGecko" | "fallback";
  };
};

export const MERCADOS_FALLBACK: RespuestaMercados = {
  fecha: "2026-05-15",
  actualizadoEn: "Datos referenciales",
  usdFix: 17.23,
  fuentes: { divisas: "fallback", banxico: "fallback", crypto: "fallback" },
  historialUsd: [],
  indicadores: [
    { id: "USD_FIX", etiqueta: "USD FIX", valor: 17.23, unidad: "MXN", variacionPct: null },
    { id: "UDI", etiqueta: "UDI", valor: 8.1234, unidad: "UDI", variacionPct: null },
    { id: "TIIE_28", etiqueta: "TIIE 28D", valor: 10.5, unidad: "%", variacionPct: null },
    { id: "WTI", etiqueta: "WTI", valor: 82.14, unidad: "USD/bbl", variacionPct: null },
  ],
  activos: [
    { id: "USD", valor: 17.23, unidad: "MXN", variacion: null, variacionPct: null, sparkline: [] },
    { id: "EUR", valor: 18.91, unidad: "MXN", variacion: null, variacionPct: null, sparkline: [] },
    { id: "GBP", valor: 22.45, unidad: "MXN", variacion: null, variacionPct: null, sparkline: [] },
    { id: "JPY", valor: 0.111, unidad: "MXN", variacion: null, variacionPct: null, sparkline: [] },
    { id: "CAD", valor: 12.64, unidad: "MXN", variacion: null, variacionPct: null, sparkline: [] },
    { id: "CHF", valor: 19.83, unidad: "MXN", variacion: null, variacionPct: null, sparkline: [] },
    { id: "CNY", valor: 2.39, unidad: "MXN", variacion: null, variacionPct: null, sparkline: [] },
    { id: "AUD", valor: 11.42, unidad: "MXN", variacion: null, variacionPct: null, sparkline: [] },
    { id: "BTC", valor: 1850000, unidad: "MXN", variacion: null, variacionPct: null, sparkline: [] },
    { id: "XAU", valor: 52000, unidad: "MXN", variacion: null, variacionPct: null, sparkline: [] },
    { id: "WTI", valor: 82.14, unidad: "USD/bbl", variacion: null, variacionPct: null, sparkline: [] },
  ],
};

/** @deprecated Usar RespuestaMercados */
export type TasaDivisa = TasaActivo & { codigo: CodigoMoneda };
export type RespuestaDivisas = {
  base: "MXN";
  tasas: Array<{
    codigo: CodigoMoneda;
    valorMxn: number;
    variacion: number | null;
    variacionPct: number | null;
  }>;
  fecha: string;
  fuente: "BCE" | "fallback";
  actualizadoEn: string;
};

export const DIVISAS_FALLBACK: RespuestaDivisas = {
  base: "MXN",
  fecha: MERCADOS_FALLBACK.fecha,
  fuente: "fallback",
  actualizadoEn: MERCADOS_FALLBACK.actualizadoEn,
  tasas: MONEDAS_ORDEN.map((c) => {
    const a = MERCADOS_FALLBACK.activos.find((x) => x.id === c)!;
    return {
      codigo: c,
      valorMxn: a.valor,
      variacion: a.variacion,
      variacionPct: a.variacionPct,
    };
  }),
};

export const PREFERENCIAS_DIVISAS_KEY = "rdc-divisas-preferidas";

export function leerPreferenciasActivos(): IdActivo[] {
  if (typeof window === "undefined") return [...ACTIVOS_ORDEN_DEFECTO];
  try {
    const raw = localStorage.getItem(PREFERENCIAS_DIVISAS_KEY);
    if (!raw) return [...ACTIVOS_ORDEN_DEFECTO];
    const parsed = JSON.parse(raw) as IdActivo[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [...ACTIVOS_ORDEN_DEFECTO];
    return parsed.filter((id) => id in ACTIVOS);
  } catch {
    return [...ACTIVOS_ORDEN_DEFECTO];
  }
}

export function guardarPreferenciasActivos(ids: IdActivo[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFERENCIAS_DIVISAS_KEY, JSON.stringify(ids));
}

export function etiquetaPar(id: IdActivo): string {
  if (id === "WTI") return "WTI";
  if (id === "BTC") return "BTC/MXN";
  if (id === "XAU") return "XAU/MXN";
  return `${id}/MXN`;
}

export function decimalesActivo(id: IdActivo): number {
  if (id === "JPY" || id === "CNY") return 4;
  if (id === "BTC") return 0;
  if (id === "WTI") return 2;
  return 2;
}

export function formatearValorActivo(id: IdActivo, valor: number): string {
  if (id === "WTI") return `$${valor.toFixed(2)} USD/bbl`;
  if (id === "BTC") return `$${valor.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`;
  return `$${valor.toFixed(decimalesActivo(id))}`;
}

/** Normaliza valores a 0–100 para mini gráficas. */
export function normalizarSparkline(valores: number[]): number[] {
  if (valores.length < 2) return valores.length ? [50] : [];
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  return valores.map((v) => ((v - min) / rango) * 100);
}

/**
 * INPC — Índice Nacional de Precios al Consumidor.
 *
 * Base 100 = segunda quincena de julio 2018. Publicado por INEGI los días
 * 10 y 25 de cada mes (variación quincenal y mensual respectivamente).
 *
 * Esta lista funciona como FALLBACK si la API de INEGI no está configurada
 * o falla. Para datos siempre frescos, configurar la variable de entorno
 * `INEGI_TOKEN` (ver `src/lib/fiscal/inegi.ts`).
 *
 * Orden: del mes más viejo al más reciente.
 */

export type RegistroInpc = {
  /** Año (e.g. 2025) */
  anio: number;
  /** Mes 1-12 */
  mes: number;
  /** INPC mensual (cierre del mes) */
  valor: number;
};

export const INPC_FALLBACK: RegistroInpc[] = [
  { anio: 2024, mes: 1, valor: 131.61 },
  { anio: 2024, mes: 2, valor: 131.773 },
  { anio: 2024, mes: 3, valor: 132.142 },
  { anio: 2024, mes: 4, valor: 132.373 },
  { anio: 2024, mes: 5, valor: 132.282 },
  { anio: 2024, mes: 6, valor: 132.823 },
  { anio: 2024, mes: 7, valor: 133.305 },
  { anio: 2024, mes: 8, valor: 133.354 },
  { anio: 2024, mes: 9, valor: 133.526 },
  { anio: 2024, mes: 10, valor: 133.913 },
  { anio: 2024, mes: 11, valor: 134.451 },
  { anio: 2024, mes: 12, valor: 135.282 },
  { anio: 2025, mes: 1, valor: 136.003 },
  { anio: 2025, mes: 2, valor: 136.292 },
  { anio: 2025, mes: 3, valor: 136.557 },
  { anio: 2025, mes: 4, valor: 136.852 },
  { anio: 2025, mes: 5, valor: 136.875 },
  { anio: 2025, mes: 6, valor: 137.020 },
  { anio: 2025, mes: 7, valor: 137.301 },
  { anio: 2025, mes: 8, valor: 137.625 },
  { anio: 2025, mes: 9, valor: 137.911 },
  { anio: 2025, mes: 10, valor: 138.402 },
  { anio: 2025, mes: 11, valor: 138.985 },
  { anio: 2025, mes: 12, valor: 139.621 },
  { anio: 2026, mes: 1, valor: 140.244 },
  { anio: 2026, mes: 2, valor: 140.611 },
  { anio: 2026, mes: 3, valor: 140.962 },
  { anio: 2026, mes: 4, valor: 141.318 },
];

const NOMBRES_MES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export function formatearPeriodoInpc(r: RegistroInpc): string {
  return `${NOMBRES_MES[r.mes - 1]} ${r.anio}`;
}

export function calcularVariacionAnual(serie: RegistroInpc[]): Array<RegistroInpc & { variacion: number | null }> {
  return serie.map((r, idx) => {
    const previo = serie.find((x) => x.anio === r.anio - 1 && x.mes === r.mes);
    if (!previo) return { ...r, variacion: null };
    return { ...r, variacion: ((r.valor - previo.valor) / previo.valor) * 100 };
  });
}

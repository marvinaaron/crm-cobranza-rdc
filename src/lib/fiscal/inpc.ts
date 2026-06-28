/**
 * INPC — Índice Nacional de Precios al Consumidor.
 *
 * Base 100 = segunda quincena de julio 2018. Publicado por INEGI los días
 * 10 y 25 de cada mes (variación quincenal y mensual respectivamente).
 *
 * Esta lista funciona como FALLBACK si las APIs de INEGI/Banxico no están
 * configuradas o fallan. Para datos siempre frescos, configurar
 * `INEGI_TOKEN` o `BANXICO_TOKEN` (ver `src/lib/fiscal/inegi.ts`).
 *
 * Orden: del mes más viejo al más reciente.
 */

export type InpcFuente = "INEGI" | "Banxico" | "fallback";

export type RegistroInpc = {
  /** Año (e.g. 2025) */
  anio: number;
  /** Mes 1-12 */
  mes: number;
  /** INPC mensual (cierre del mes) */
  valor: number;
};

export const INPC_FALLBACK: RegistroInpc[] = [
  { anio: 2016, mes: 1, valor: 89.3866 },
  { anio: 2016, mes: 2, valor: 89.7779 },
  { anio: 2016, mes: 3, valor: 89.9100 },
  { anio: 2016, mes: 4, valor: 89.6253 },
  { anio: 2016, mes: 5, valor: 89.2256 },
  { anio: 2016, mes: 6, valor: 89.3247 },
  { anio: 2016, mes: 7, valor: 89.5567 },
  { anio: 2016, mes: 8, valor: 89.8093 },
  { anio: 2016, mes: 9, valor: 90.3576 },
  { anio: 2016, mes: 10, valor: 90.9063 },
  { anio: 2016, mes: 11, valor: 91.6168 },
  { anio: 2016, mes: 12, valor: 92.0390 },
  { anio: 2017, mes: 1, valor: 93.6038 },
  { anio: 2017, mes: 2, valor: 94.1448 },
  { anio: 2017, mes: 3, valor: 94.7223 },
  { anio: 2017, mes: 4, valor: 94.8389 },
  { anio: 2017, mes: 5, valor: 94.7258 },
  { anio: 2017, mes: 6, valor: 94.9636 },
  { anio: 2017, mes: 7, valor: 95.3228 },
  { anio: 2017, mes: 8, valor: 95.7943 },
  { anio: 2017, mes: 9, valor: 96.0938 },
  { anio: 2017, mes: 10, valor: 96.6979 },
  { anio: 2017, mes: 11, valor: 97.6952 },
  { anio: 2017, mes: 12, valor: 98.2729 },
  { anio: 2018, mes: 1, valor: 98.7950 },
  { anio: 2018, mes: 2, valor: 99.1714 },
  { anio: 2018, mes: 3, valor: 99.4922 },
  { anio: 2018, mes: 4, valor: 99.1547 },
  { anio: 2018, mes: 5, valor: 98.9942 },
  { anio: 2018, mes: 6, valor: 99.3760 },
  { anio: 2018, mes: 7, valor: 99.9090 },
  { anio: 2018, mes: 8, valor: 100.4920 },
  { anio: 2018, mes: 9, valor: 100.9170 },
  { anio: 2018, mes: 10, valor: 101.4400 },
  { anio: 2018, mes: 11, valor: 102.3030 },
  { anio: 2018, mes: 12, valor: 103.0200 },
  { anio: 2019, mes: 1, valor: 103.1080 },
  { anio: 2019, mes: 2, valor: 103.0790 },
  { anio: 2019, mes: 3, valor: 103.4760 },
  { anio: 2019, mes: 4, valor: 103.5310 },
  { anio: 2019, mes: 5, valor: 103.2330 },
  { anio: 2019, mes: 6, valor: 103.2990 },
  { anio: 2019, mes: 7, valor: 103.6870 },
  { anio: 2019, mes: 8, valor: 103.6700 },
  { anio: 2019, mes: 9, valor: 103.9420 },
  { anio: 2019, mes: 10, valor: 104.5030 },
  { anio: 2019, mes: 11, valor: 105.3460 },
  { anio: 2019, mes: 12, valor: 105.9340 },
  { anio: 2020, mes: 1, valor: 106.4470 },
  { anio: 2020, mes: 2, valor: 106.8890 },
  { anio: 2020, mes: 3, valor: 106.8380 },
  { anio: 2020, mes: 4, valor: 105.7550 },
  { anio: 2020, mes: 5, valor: 106.1620 },
  { anio: 2020, mes: 6, valor: 106.7430 },
  { anio: 2020, mes: 7, valor: 107.4440 },
  { anio: 2020, mes: 8, valor: 107.8670 },
  { anio: 2020, mes: 9, valor: 108.1140 },
  { anio: 2020, mes: 10, valor: 108.7740 },
  { anio: 2020, mes: 11, valor: 108.8560 },
  { anio: 2020, mes: 12, valor: 109.2710 },
  { anio: 2021, mes: 1, valor: 110.2100 },
  { anio: 2021, mes: 2, valor: 110.9070 },
  { anio: 2021, mes: 3, valor: 111.8240 },
  { anio: 2021, mes: 4, valor: 112.1900 },
  { anio: 2021, mes: 5, valor: 112.4190 },
  { anio: 2021, mes: 6, valor: 113.0180 },
  { anio: 2021, mes: 7, valor: 113.6820 },
  { anio: 2021, mes: 8, valor: 113.8990 },
  { anio: 2021, mes: 9, valor: 114.6010 },
  { anio: 2021, mes: 10, valor: 115.5610 },
  { anio: 2021, mes: 11, valor: 116.8840 },
  { anio: 2021, mes: 12, valor: 117.3080 },
  { anio: 2022, mes: 1, valor: 118.002 },
  { anio: 2022, mes: 2, valor: 118.981 },
  { anio: 2022, mes: 3, valor: 120.159 },
  { anio: 2022, mes: 4, valor: 120.809 },
  { anio: 2022, mes: 5, valor: 121.022 },
  { anio: 2022, mes: 6, valor: 122.044 },
  { anio: 2022, mes: 7, valor: 122.948 },
  { anio: 2022, mes: 8, valor: 123.803 },
  { anio: 2022, mes: 9, valor: 124.571 },
  { anio: 2022, mes: 10, valor: 125.276 },
  { anio: 2022, mes: 11, valor: 125.997 },
  { anio: 2022, mes: 12, valor: 126.478 },
  { anio: 2023, mes: 1, valor: 127.336 },
  { anio: 2023, mes: 2, valor: 128.046 },
  { anio: 2023, mes: 3, valor: 128.389 },
  { anio: 2023, mes: 4, valor: 128.363 },
  { anio: 2023, mes: 5, valor: 128.084 },
  { anio: 2023, mes: 6, valor: 128.214 },
  { anio: 2023, mes: 7, valor: 128.832 },
  { anio: 2023, mes: 8, valor: 129.545 },
  { anio: 2023, mes: 9, valor: 130.119 },
  { anio: 2023, mes: 10, valor: 130.609 },
  { anio: 2023, mes: 11, valor: 131.445 },
  { anio: 2023, mes: 12, valor: 132.373 },
  { anio: 2024, mes: 1, valor: 133.555 },
  { anio: 2024, mes: 2, valor: 133.681 },
  { anio: 2024, mes: 3, valor: 134.069 },
  { anio: 2024, mes: 4, valor: 134.336 },
  { anio: 2024, mes: 5, valor: 134.087 },
  { anio: 2024, mes: 6, valor: 134.595 },
  { anio: 2024, mes: 7, valor: 136.003 },
  { anio: 2024, mes: 8, valor: 136.013 },
  { anio: 2024, mes: 9, valor: 136.08 },
  { anio: 2024, mes: 10, valor: 136.828 },
  { anio: 2024, mes: 11, valor: 137.424 },
  { anio: 2024, mes: 12, valor: 137.949 },
  { anio: 2025, mes: 1, valor: 138.343 },
  { anio: 2025, mes: 2, valor: 138.726 },
  { anio: 2025, mes: 3, valor: 139.161 },
  { anio: 2025, mes: 4, valor: 139.62 },
  { anio: 2025, mes: 5, valor: 140.012 },
  { anio: 2025, mes: 6, valor: 140.405 },
  { anio: 2025, mes: 7, valor: 140.78 },
  { anio: 2025, mes: 8, valor: 140.867 },
  { anio: 2025, mes: 9, valor: 141.197 },
  { anio: 2025, mes: 10, valor: 141.708 },
  { anio: 2025, mes: 11, valor: 142.645 },
  { anio: 2025, mes: 12, valor: 143.042 },
  { anio: 2026, mes: 1, valor: 143.588 },
  { anio: 2026, mes: 2, valor: 144.307 },
  { anio: 2026, mes: 3, valor: 145.544 },
  { anio: 2026, mes: 4, valor: 145.831 },
  { anio: 2026, mes: 5, valor: 145.527 },
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

/**
 * Tasas de recargos federales (LIF + art. 21 CFF).
 *
 * Se publican una vez al año en la Ley de Ingresos. Hasta que salga una
 * nueva LIF, todos los meses del año llevan la misma tasa: eso es lo que
 * se captura en el SUA (Utilerías → Actualizar INPC y Recargos).
 */

export const RECARGOS_ANIO_VIGENTE = 2026;

/** Mora sin convenio: 1.38% LIF × 1.50 (art. 21 CFF) = 2.07%. */
export const TASA_MORA_PCT_2026 = 2.07;
/** Prórroga / tasa base LIF 2026 art. 11. */
export const TASA_PRORROGA_PCT_2026 = 1.38;

export const RECARGOS_PLAZOS_2026 = [
  { plazo: "Hasta 12 meses", tasa: 1.42 },
  { plazo: "De 13 a 24 meses", tasa: 1.63 },
  { plazo: "Más de 24 meses y pagos a plazo diferido", tasa: 1.97 },
] as const;

export type RecargosAnio = {
  anio: number;
  mora: number;
  prorroga: number;
};

/** Cierres anuales desde que la LIF dejó de variar mes a mes. */
export const RECARGOS_HISTORICO_ANUAL: RecargosAnio[] = [
  { anio: 2026, mora: 2.07, prorroga: 1.38 },
  { anio: 2025, mora: 1.47, prorroga: 0.98 },
  { anio: 2024, mora: 1.47, prorroga: 0.98 },
  { anio: 2023, mora: 1.47, prorroga: 0.98 },
  { anio: 2022, mora: 1.47, prorroga: 0.98 },
  { anio: 2021, mora: 1.47, prorroga: 0.98 },
  { anio: 2020, mora: 1.47, prorroga: 0.98 },
  { anio: 2019, mora: 1.47, prorroga: 0.98 },
  { anio: 2018, mora: 1.47, prorroga: 0.98 },
  { anio: 2017, mora: 1.13, prorroga: 0.75 },
  { anio: 2016, mora: 1.13, prorroga: 0.75 },
  { anio: 2015, mora: 1.13, prorroga: 0.75 },
  { anio: 2014, mora: 1.13, prorroga: 0.75 },
  { anio: 2013, mora: 1.13, prorroga: 0.75 },
  { anio: 2012, mora: 1.13, prorroga: 0.75 },
  { anio: 2011, mora: 1.13, prorroga: 0.75 },
  { anio: 2010, mora: 1.13, prorroga: 0.75 },
];

export function recargosDelAnio(anio: number): RecargosAnio {
  const exacto = RECARGOS_HISTORICO_ANUAL.find((r) => r.anio === anio);
  if (exacto) return exacto;
  if (anio >= 2026) return { anio, mora: 2.07, prorroga: 1.38 };
  if (anio >= 2018) return { anio, mora: 1.47, prorroga: 0.98 };
  return { anio, mora: 1.13, prorroga: 0.75 };
}

export function tsvRecargosMeses(anio: number): string {
  const r = recargosDelAnio(anio);
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const lineas = ["Mes\tMora %\tPrórroga %"];
  for (const mes of meses) {
    lineas.push(`${mes}\t${r.mora.toFixed(2)}\t${r.prorroga.toFixed(2)}`);
  }
  return lineas.join("\n");
}

export function tsvRecargosHistorico(): string {
  const lineas = ["Año\tMora %\tPrórroga %"];
  for (const r of RECARGOS_HISTORICO_ANUAL) {
    lineas.push(`${r.anio}\t${r.mora.toFixed(2)}\t${r.prorroga.toFixed(2)}`);
  }
  return lineas.join("\n");
}

export function tsvRecargosPlazos(): string {
  const lineas = ["Plazo\tTasa mensual %"];
  for (const p of RECARGOS_PLAZOS_2026) {
    lineas.push(`${p.plazo}\t${p.tasa.toFixed(2)}`);
  }
  return lineas.join("\n");
}

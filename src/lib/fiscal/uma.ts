/**
 * UMA (Unidad de Medida y Actualización).
 * INEGI la publica cada año en enero y entra en vigor el 1° de febrero.
 *
 * Si en febrero se conoce el dato de 2026, actualizar `UMA_VIGENTE`.
 */

export type ValorUma = {
  anio: number;
  diaria: number;
  mensual: number;
  anual: number;
  vigenciaDesde: string;
  vigenciaHasta: string;
};

export const UMA_VIGENTE: ValorUma = {
  anio: 2025,
  diaria: 113.14,
  mensual: 3439.46,
  anual: 41273.52,
  vigenciaDesde: "01/feb/2025",
  vigenciaHasta: "31/ene/2026",
};

export const UMA_HISTORICO: ValorUma[] = [
  {
    anio: 2025,
    diaria: 113.14,
    mensual: 3439.46,
    anual: 41273.52,
    vigenciaDesde: "01/feb/2025",
    vigenciaHasta: "31/ene/2026",
  },
  {
    anio: 2024,
    diaria: 108.57,
    mensual: 3300.53,
    anual: 39606.36,
    vigenciaDesde: "01/feb/2024",
    vigenciaHasta: "31/ene/2025",
  },
  {
    anio: 2023,
    diaria: 103.74,
    mensual: 3153.7,
    anual: 37844.4,
    vigenciaDesde: "01/feb/2023",
    vigenciaHasta: "31/ene/2024",
  },
  {
    anio: 2022,
    diaria: 96.22,
    mensual: 2925.09,
    anual: 35101.08,
    vigenciaDesde: "01/feb/2022",
    vigenciaHasta: "31/ene/2023",
  },
  {
    anio: 2021,
    diaria: 89.62,
    mensual: 2724.45,
    anual: 32693.4,
    vigenciaDesde: "01/feb/2021",
    vigenciaHasta: "31/ene/2022",
  },
];

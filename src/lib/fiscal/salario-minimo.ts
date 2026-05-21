/**
 * Salarios mínimos vigentes en México publicados por la CONASAMI.
 * Se actualizan cada año a partir del 1° de enero.
 */

export type ValorSalarioMinimo = {
  anio: number;
  general: number;
  fronteraNorte: number;
  vigenciaDesde: string;
};

export const SALARIO_MINIMO_VIGENTE: ValorSalarioMinimo = {
  anio: 2026,
  general: 278.8,
  fronteraNorte: 419.88,
  vigenciaDesde: "01/ene/2026",
};

export const SALARIO_MINIMO_HISTORICO: ValorSalarioMinimo[] = [
  { anio: 2026, general: 278.8, fronteraNorte: 419.88, vigenciaDesde: "01/ene/2026" },
  { anio: 2025, general: 248.93, fronteraNorte: 374.89, vigenciaDesde: "01/ene/2025" },
  { anio: 2024, general: 248.93, fronteraNorte: 374.89, vigenciaDesde: "01/ene/2024" },
  { anio: 2023, general: 207.44, fronteraNorte: 312.41, vigenciaDesde: "01/ene/2023" },
  { anio: 2022, general: 172.87, fronteraNorte: 260.34, vigenciaDesde: "01/ene/2022" },
  { anio: 2021, general: 141.7, fronteraNorte: 213.39, vigenciaDesde: "01/ene/2021" },
];

/**
 * Profesiones con salario mínimo profesional vigentes en 2026 (extracto de
 * la tabla CONASAMI). Lista representativa para consulta rápida.
 */
export const SALARIOS_MINIMOS_PROFESIONALES: Array<{
  oficio: string;
  diario: number;
}> = [
  { oficio: "Albañil (oficial)", diario: 309.06 },
  { oficio: "Boticario en farmacias", diario: 287.47 },
  { oficio: "Cajero(a) de máquina registradora", diario: 290.42 },
  { oficio: "Carpintero(a) en fabricación y reparación de muebles", diario: 302.61 },
  { oficio: "Chofer de camión de carga", diario: 320.36 },
  { oficio: "Chofer de camioneta", diario: 309.06 },
  { oficio: "Contador(a) en taller mecánico", diario: 297.18 },
  { oficio: "Electricista instalador y reparador", diario: 305.6 },
  { oficio: "Niñera(o)", diario: 281.61 },
  { oficio: "Oficial peluquero(a) y cultor(a) de belleza", diario: 297.18 },
  { oficio: "Plomero(a) en instalaciones sanitarias", diario: 308.04 },
  { oficio: "Recamarera(o) en hoteles, moteles y otros", diario: 281.61 },
  { oficio: "Secretaria(o) auxiliar", diario: 320.36 },
  { oficio: "Soldador(a)", diario: 308.04 },
  { oficio: "Vigilante (velador)", diario: 285.22 },
];

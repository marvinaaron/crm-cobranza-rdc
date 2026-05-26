/**
 * Catálogo simplificado de regímenes fiscales SAT vigentes (2026).
 *
 * Lo usa el portal del cliente para mostrar de forma humana bajo qué
 * régimen tributa el cliente, y el formulario admin de cliente para
 * capturarlo con un selector consistente.
 */

export type RegimenFiscalSAT = {
  /** Clave SAT (no obligatoria, solo informativa para el despacho). */
  clave: string;
  /** Nombre corto para mostrar. */
  label: string;
  /** Descripción breve para el portal del cliente. */
  descripcion: string;
  /** Personas físicas / morales / ambas. */
  aplica: "PF" | "PM" | "ambas";
};

export const REGIMENES_SAT: RegimenFiscalSAT[] = [
  // Personas Físicas
  {
    clave: "626",
    label: "RESICO PF",
    descripcion: "Régimen Simplificado de Confianza para personas físicas.",
    aplica: "PF",
  },
  {
    clave: "612",
    label: "Actividad empresarial y profesional",
    descripcion: "Honorarios y actividades empresariales (PF).",
    aplica: "PF",
  },
  {
    clave: "625",
    label: "Plataformas tecnológicas",
    descripcion: "Ingresos por servicios o ventas en apps y plataformas.",
    aplica: "PF",
  },
  {
    clave: "606",
    label: "Arrendamiento",
    descripcion: "Ingresos por renta de inmuebles.",
    aplica: "PF",
  },
  {
    clave: "605",
    label: "Sueldos y salarios",
    descripcion: "Sueldos, salarios y asimilados.",
    aplica: "PF",
  },
  {
    clave: "608",
    label: "Demás ingresos",
    descripcion: "Otros ingresos no clasificados (PF).",
    aplica: "PF",
  },
  // Personas Morales
  {
    clave: "601",
    label: "General de ley (Título II)",
    descripcion: "Régimen general de las personas morales.",
    aplica: "PM",
  },
  {
    clave: "620",
    label: "RESICO PM",
    descripcion: "Régimen Simplificado de Confianza para personas morales.",
    aplica: "PM",
  },
  {
    clave: "603",
    label: "Personas morales sin fines de lucro",
    descripcion: "Asociaciones y sociedades del Título III.",
    aplica: "PM",
  },
  {
    clave: "624",
    label: "Coordinados",
    descripcion: "Personas morales coordinadas (autotransporte).",
    aplica: "PM",
  },
];

export function regimenesParaPersona(esPersonaMoral: boolean): RegimenFiscalSAT[] {
  return REGIMENES_SAT.filter(
    (r) => r.aplica === "ambas" || r.aplica === (esPersonaMoral ? "PM" : "PF")
  );
}

export function regimenPorClave(
  clave: string | undefined | null
): RegimenFiscalSAT | undefined {
  if (!clave) return undefined;
  return REGIMENES_SAT.find((r) => r.clave === clave);
}

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
  /** Etiqueta compacta para listas. */
  labelCorto: string;
  /** Descripción breve para el portal del cliente. */
  descripcion: string;
  /** Personas físicas / morales / ambas. */
  aplica: "PF" | "PM" | "ambas";
};

export const REGIMENES_SAT: RegimenFiscalSAT[] = [
  // Personas Físicas
  {
    clave: "626",
    label: "RESICO",
    labelCorto: "RESICO",
    descripcion: "Régimen Simplificado de Confianza para personas físicas.",
    aplica: "PF",
  },
  {
    clave: "612",
    label: "PF Act Emp y Prof",
    labelCorto: "PF Act Emp y Prof",
    descripcion: "Honorarios y actividades empresariales (PF).",
    aplica: "PF",
  },
  {
    clave: "625",
    label: "Plataformas tecnológicas",
    labelCorto: "Plataformas",
    descripcion: "Ingresos por servicios o ventas en apps y plataformas.",
    aplica: "PF",
  },
  {
    clave: "606",
    label: "Arrendamiento",
    labelCorto: "Arrendamiento",
    descripcion: "Ingresos por renta de inmuebles.",
    aplica: "PF",
  },
  {
    clave: "605",
    label: "Sueldos y salarios",
    labelCorto: "Sueldos",
    descripcion: "Sueldos, salarios y asimilados.",
    aplica: "PF",
  },
  {
    clave: "608",
    label: "Demás ingresos",
    labelCorto: "Demás ingresos",
    descripcion: "Otros ingresos no clasificados (PF).",
    aplica: "PF",
  },
  // Personas Morales
  {
    clave: "601",
    label: "General de ley (Título II)",
    labelCorto: "General de ley",
    descripcion: "Régimen general de las personas morales.",
    aplica: "PM",
  },
  {
    clave: "620",
    label: "RESICO PM",
    labelCorto: "RESICO PM",
    descripcion: "Régimen Simplificado de Confianza para personas morales.",
    aplica: "PM",
  },
  {
    clave: "603",
    label: "Personas morales sin fines de lucro",
    labelCorto: "Sin fines de lucro",
    descripcion: "Asociaciones y sociedades del Título III.",
    aplica: "PM",
  },
  {
    clave: "624",
    label: "Coordinados",
    labelCorto: "Coordinados",
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

/**
 * Unifica alias de Excel/CRM para la tabla de Accesos:
 * P.F. ACT E&P = Actividad empresarial y profesional → PF Act Emp y Prof.
 * RESICO PF = RESICO. RESICO PM se queda aparte.
 */
export function unificarEtiquetaRegimen(raw: string): string {
  const original = raw.trim();
  if (!original) return original;
  const compact = original
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "e")
    .replace(/[^a-z0-9]+/g, "");

  if (compact.includes("resicopm") || compact === "620") return "RESICO PM";
  if (compact.includes("resico") || compact === "626") return "RESICO";
  if (
    compact.includes("actividadempresarial") ||
    compact.includes("actempresarial") ||
    /pfact/.test(compact) ||
    compact === "pfae" ||
    compact === "612"
  ) {
    return "PF Act Emp y Prof";
  }
  return original;
}

export function etiquetaRegimenCliente(
  clave: string | undefined | null
): string {
  if (!clave) return "Sin régimen";
  const label = regimenPorClave(clave)?.label ?? clave;
  return unificarEtiquetaRegimen(label);
}

export function etiquetaRegimenCorto(
  clave: string | undefined | null
): string {
  if (!clave) return "Sin régimen";
  const r = regimenPorClave(clave);
  return unificarEtiquetaRegimen(r?.labelCorto ?? r?.label ?? clave);
}

export function claseChipRegimen(clave: string | undefined | null): string {
  if (!clave) return "text-orange-600";
  if (clave === "626" || clave === "620") return "text-violet-700";
  if (clave === "605") return "text-slate-500";
  if (clave === "612" || clave === "601") return "text-sky-700";
  if (clave === "606") return "text-amber-700";
  return "text-indigo-700";
}

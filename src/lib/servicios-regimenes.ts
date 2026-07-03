import { REGIMENES_PF } from "./regimenes-fiscales-pf";
import { REGIMENES_PM } from "./regimenes-fiscales-pm";
import { GUIA_ENRIQUECIDA } from "./regimenes-guia-enriquecida";
import type { RegimenServicio, RegimenSlug } from "./regimenes-fiscales-types";

export type {
  RegimenServicio,
  RegimenSlug,
  TipoPersonaRegimen,
  MarcoLegalRef,
} from "./regimenes-fiscales-types";

export const SLUGS_REGIMEN_PF = [
  "sueldos-salarios",
  "resico",
  "actividades-empresariales",
  "arrendamiento",
  "plataformas-tecnologicas",
  "rif",
] as const satisfies readonly RegimenSlug[];

export const SLUGS_REGIMEN_PM = [
  "regimen-general",
  "fines-no-lucrativos",
] as const satisfies readonly RegimenSlug[];

export const SLUGS_REGIMEN = [
  ...SLUGS_REGIMEN_PF,
  ...SLUGS_REGIMEN_PM,
] as const satisfies readonly RegimenSlug[];

const BASE_REGIMENES = {
  ...REGIMENES_PF,
  ...REGIMENES_PM,
};

function buildRegimenesServicio(): Record<RegimenSlug, RegimenServicio> {
  const out = {} as Record<RegimenSlug, RegimenServicio>;
  for (const slug of SLUGS_REGIMEN) {
    out[slug] = {
      ...BASE_REGIMENES[slug],
      guia: GUIA_ENRIQUECIDA[slug],
    };
  }
  return out;
}

export const REGIMENES_SERVICIO = buildRegimenesServicio();

/** Redirecciones de slugs legados a los regímenes vigentes. */
export const REGIMEN_REDIRECTS: Record<string, RegimenSlug> = {
  "personas-fisicas": "actividades-empresariales",
  "personas-morales": "regimen-general",
  "plataformas-digitales": "plataformas-tecnologicas",
};

export function esSlugRegimenValido(slug: string): slug is RegimenSlug {
  return slug in REGIMENES_SERVICIO;
}

export function regimenPorSlug(slug: string): RegimenServicio | undefined {
  if (!esSlugRegimenValido(slug)) return undefined;
  return REGIMENES_SERVICIO[slug];
}

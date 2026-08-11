import { FLUJO_CUMPLIMIENTO_LABELS } from "@/lib/cumplimiento";

export type PasoBucket =
  | "paso1"
  | "paso2"
  | "paso3"
  | "paso4"
  | "paso5"
  | "paso6"
  | "paso7";

const LABELS: Record<PasoBucket, string> = {
  paso1: FLUJO_CUMPLIMIENTO_LABELS.por_trabajar,
  paso2: FLUJO_CUMPLIMIENTO_LABELS.iniciando_contabilidad,
  paso3: FLUJO_CUMPLIMIENTO_LABELS.preliminar,
  paso4: FLUJO_CUMPLIMIENTO_LABELS.aceptacion,
  paso5: FLUJO_CUMPLIMIENTO_LABELS.declaraciones,
  paso6: FLUJO_CUMPLIMIENTO_LABELS.pago,
  paso7: FLUJO_CUMPLIMIENTO_LABELS.completado,
};

const ORDEN: PasoBucket[] = [
  "paso1",
  "paso2",
  "paso3",
  "paso4",
  "paso5",
  "paso6",
  "paso7",
];

export function numDePaso(paso: PasoBucket): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  return (ORDEN.indexOf(paso) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function pasoDeNum(n: 1 | 2 | 3 | 4 | 5 | 6 | 7): PasoBucket {
  return ORDEN[n - 1];
}

export function tituloPaso(paso: PasoBucket): string {
  return `Paso ${numDePaso(paso)} · ${LABELS[paso]}`;
}

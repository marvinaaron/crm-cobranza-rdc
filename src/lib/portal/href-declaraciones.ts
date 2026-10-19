import { type Periodo } from "@/lib/clientes";

export type AnclaDeclaraciones =
  | "documentos-periodo"
  | "comprobante"
  | "previo-validacion"
  | "pago-extemporaneo";

/** Lleva al mes declarado. `mes` en la URL es 1–12. */
export function hrefDeclaraciones(
  periodo: Periodo,
  ancla: AnclaDeclaraciones = "documentos-periodo"
): string {
  return `/portal/cumplimiento?mes=${periodo.mes + 1}&anio=${periodo.anio}#${ancla}`;
}

export function periodoDesdeSearchParams(sp: {
  get: (name: string) => string | null;
}): Periodo | null {
  const mesCal = Number(sp.get("mes"));
  const anio = Number(sp.get("anio"));
  if (!Number.isInteger(mesCal) || mesCal < 1 || mesCal > 12) return null;
  if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) return null;
  return { mes: mesCal - 1, anio };
}

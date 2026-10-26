import type { HerramientaId } from "./seo/herramientas-config";
import { TONOS_REGIMEN } from "./regimen-tonos";

/**
 * Dueto visual de cada herramienta: campo sólido + chispa.
 * El icono de marca usa la receta del app icon (diagonal 135° + brillo):
 * chispaClara (arriba-izq) → chispa (abajo-der). Así cada producto se
 * distingue por color, como CONTPAQi Vende / Contabilidad / Nómina.
 */
export type TonoHerramienta = {
  campo: string;
  campoDeep: string;
  chispa: string;
  chispaClara: string;
};

/** Aclara la chispa hacia blanco para el stop claro del degradado. */
function chispaClaraDe(hex: string, haciaBlanco = 0.42): string {
  const n = hex.replace("#", "");
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * haciaBlanco);
  return `#${[mix(r), mix(g), mix(b)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}`;
}

const r = TONOS_REGIMEN;

const DUETO = {
  resico: r.resico,
  rfc: r["sueldos-salarios"],
  facturacion: r["regimen-general"],
  vencimiento: r["plataformas-tecnologicas"],
  inpc: r["plataformas-tecnologicas"],
  isr: r["actividades-empresariales"],
  uma: r["fines-no-lucrativos"],
  salario: r["sueldos-salarios"],
  "recargos-sat": r.arrendamiento,
  recargos: r.arrendamiento,
  "inpc-sua": r["plataformas-tecnologicas"],
  divisas: r["regimen-general"],
  sdi: r["sueldos-salarios"],
  "prima-vacacional": r.rif,
} as const satisfies Record<
  HerramientaId,
  { campo: string; campoDeep: string; chispa: string }
>;

export const TONOS_HERRAMIENTA: Record<HerramientaId, TonoHerramienta> =
  Object.fromEntries(
    (Object.keys(DUETO) as HerramientaId[]).map((id) => {
      const d = DUETO[id];
      return [
        id,
        {
          campo: d.campo,
          campoDeep: d.campoDeep,
          chispa: d.chispa,
          chispaClara: chispaClaraDe(d.chispa),
        },
      ];
    }),
  ) as Record<HerramientaId, TonoHerramienta>;

export function tonoHerramienta(id: HerramientaId): TonoHerramienta {
  if (id === "rfc") {
    return {
      campo: "#0f1d2e",
      campoDeep: "#0a1424",
      chispa: "#0e8fa8",
      chispaClara: "#5eeaf2",
    };
  }
  if (id === "vencimiento") {
    return {
      campo: "#0f1d2e",
      campoDeep: "#0a1424",
      chispa: "#30D158",
      chispaClara: "#92FF00",
    };
  }
  if (id === "facturacion") {
    return {
      campo: "#0f1d2e",
      campoDeep: "#0a1424",
      chispa: "#FA114F",
      chispaClara: "#FF6B8A",
    };
  }
  if (id === "recargos-sat") {
    return {
      campo: "#0f1d2e",
      campoDeep: "#0a1424",
      chispa: "#FF6B00",
      chispaClara: "#FFA366",
    };
  }
  if (id === "isr") {
    return {
      campo: "#0f1d2e",
      campoDeep: "#0a1424",
      chispa: "#a92dff",
      chispaClara: "#c85fff",
    };
  }
  if (id === "inpc") {
    return {
      campo: "#0f1d2e",
      campoDeep: "#0a1424",
      chispa: "#a92dff",
      chispaClara: "#c85fff",
    };
  }
  return TONOS_HERRAMIENTA[id];
}

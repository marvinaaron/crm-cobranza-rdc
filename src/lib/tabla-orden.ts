export type OrdenTablaDir = "asc" | "desc";

export function compararCeldasTabla(
  a: string | number | boolean,
  b: string | number | boolean,
  dir: OrdenTablaDir
): number {
  const va = typeof a === "boolean" ? (a ? 1 : 0) : a;
  const vb = typeof b === "boolean" ? (b ? 1 : 0) : b;
  let cmp = 0;
  if (typeof va === "number" && typeof vb === "number") {
    cmp = va - vb;
  } else {
    cmp = String(va).localeCompare(String(vb), "es", {
      sensitivity: "base",
      numeric: true,
    });
  }
  return dir === "asc" ? cmp : -cmp;
}

export function alternarOrdenTabla<K extends string>(
  keyActual: K,
  keyNueva: K,
  dirActual: OrdenTablaDir,
  dirDefectoNueva: OrdenTablaDir = "asc"
): OrdenTablaDir {
  if (keyActual === keyNueva) {
    return dirActual === "asc" ? "desc" : "asc";
  }
  return dirDefectoNueva;
}

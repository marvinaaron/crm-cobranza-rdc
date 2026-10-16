/** Paleta estable por id (no cambia al recargar). */
export const AVATAR_TONO = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-800",
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-800",
  "bg-rose-100 text-rose-800",
  "bg-indigo-100 text-indigo-800",
] as const;

export function tonoAvatarCliente(id: number): string {
  return AVATAR_TONO[Math.abs(id) % AVATAR_TONO.length];
}

export function inicialesNombre(nombre: string): string {
  const partes = nombre
    .replace(/[.,]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);
  const utiles = partes.filter(
    (p) => !/^(de|del|la|las|los|y|sa|cv|s\.?a\.?)$/i.test(p)
  );
  const src = utiles.length ? utiles : partes;
  if (src.length === 0) return "·";
  if (src.length === 1) return src[0].slice(0, 2).toUpperCase();
  return `${src[0][0] ?? ""}${src[1][0] ?? ""}`.toUpperCase();
}

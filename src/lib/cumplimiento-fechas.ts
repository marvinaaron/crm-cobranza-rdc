export function parseFechaLimite(fecha: string): Date | null {
  const [y, m, d] = fecha.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 23, 59, 59);
}

export function diasHastaLimite(fechaLimite: string, hoy = new Date()): number | null {
  const limite = parseFechaLimite(fechaLimite);
  if (!limite) return null;
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const fin = new Date(limite.getFullYear(), limite.getMonth(), limite.getDate());
  return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
}

export function progresoPlazoImpuestos(
  fechaLimite: string,
  desdeIso?: string,
  hoy = new Date()
): number {
  const limite = parseFechaLimite(fechaLimite);
  if (!limite) return 0;
  const desde = desdeIso
    ? new Date(desdeIso)
    : new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const fin = new Date(limite.getFullYear(), limite.getMonth(), limite.getDate());
  const total = fin.getTime() - inicio.getTime();
  if (total <= 0) return 100;
  const transcurrido = hoy.getTime() - inicio.getTime();
  return Math.min(100, Math.max(0, Math.round((transcurrido / total) * 100)));
}

export function limiteVencido(fechaLimite: string, hoy = new Date()): boolean {
  const dias = diasHastaLimite(fechaLimite, hoy);
  return dias !== null && dias < 0;
}

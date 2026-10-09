/** Solo dígitos, máximo 10 (teléfono México sin LADA internacional). */
export function soloDigitosTelefono(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

/** Formato visual: 33 1234 5678 */
export function formatearTelefonoMx(value: string): string {
  const d = soloDigitosTelefono(value);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `${d.slice(0, 2)} ${d.slice(2)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`;
}

export function telefonoMxValido(value: string): boolean {
  const d = soloDigitosTelefono(value);
  return d.length === 0 || d.length === 10;
}

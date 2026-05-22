import type { EstadoVigenciaEfirma, UmbralRecordatorio } from "./types";

const VENTANA_ALERTA_DIAS = 30;

export function diasHastaVencimiento(vigenciaFin: string | Date, hoy = new Date()): number {
  const fin = typeof vigenciaFin === "string" ? new Date(vigenciaFin) : vigenciaFin;
  const ms = fin.getTime() - hoy.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function estadoVigenciaEfirma(
  vigenciaFin: string | Date,
  hoy = new Date()
): EstadoVigenciaEfirma {
  const dias = diasHastaVencimiento(vigenciaFin, hoy);
  if (dias < 0) return "vencida";
  if (dias <= 7) return "urgente";
  if (dias <= VENTANA_ALERTA_DIAS) return "alerta";
  return "vigente";
}

/** Porcentaje consumido de la ventana de 30 días (0 = recién entra, 100 = vence hoy). */
export function porcentajeVentana30(diasRestantes: number): number {
  if (diasRestantes > VENTANA_ALERTA_DIAS) return 0;
  if (diasRestantes <= 0) return 100;
  return Math.round(((VENTANA_ALERTA_DIAS - diasRestantes) / VENTANA_ALERTA_DIAS) * 100);
}

export function colorBarraVigencia(diasRestantes: number): string {
  if (diasRestantes <= 0) return "bg-red-600";
  if (diasRestantes <= 3) return "bg-red-500";
  if (diasRestantes <= 7) return "bg-orange-500";
  if (diasRestantes <= 15) return "bg-amber-500";
  return "bg-yellow-400";
}

export function etiquetaDiasRestantes(dias: number): string {
  if (dias < 0) return `Vencida hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? "" : "s"}`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `${dias} días restantes`;
}

/** Umbral de recordatorio que aplica según días restantes (el más urgente pendiente). */
export function umbralRecordatorioAplicable(
  diasRestantes: number
): UmbralRecordatorio | null {
  if (diasRestantes > 30) return null;
  if (diasRestantes <= 3) return 3;
  if (diasRestantes <= 7) return 7;
  if (diasRestantes <= 15) return 15;
  return 30;
}

export function formatFechaCertificado(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

import { ahoraEnCdmx } from "@/lib/agenda-cierre-notificaciones";

export type PeriodoSyncCfdi = {
  inicio: string;
  fin: string;
  inicioIso: string;
  finIso: string;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatearSat(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function formatearIso(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Semana anterior calendario (lun–dom) respecto al lunes en que corre el cron.
 * Ej.: si hoy es lunes 7 jul, devuelve lun 30 jun 00:00 → dom 6 jul 23:59.
 */
export function periodoSemanaAnteriorCdmx(referencia = ahoraEnCdmx()): PeriodoSyncCfdi {
  const fin = new Date(referencia);
  fin.setDate(fin.getDate() - 1);
  fin.setHours(23, 59, 59, 0);

  const inicio = new Date(referencia);
  inicio.setDate(inicio.getDate() - 7);
  inicio.setHours(0, 0, 0, 0);

  return {
    inicio: formatearSat(inicio),
    fin: formatearSat(fin),
    inicioIso: formatearIso(inicio),
    finIso: formatearIso(fin),
  };
}

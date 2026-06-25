import { MESES_NOM } from "@/lib/clientes";
import {
  COLORES_EVENTO,
  type EventoFiscal,
  type TipoEventoFiscal,
} from "@/lib/portal/fechas-fiscales";

export type VencimientoResumen = {
  tipo: TipoEventoFiscal;
  titulo: string;
  fechaLabel: string;
  tono: "ok" | "warn" | "bad";
  fecha: Date;
  accion: string;
  href: string;
};

const ACCION_POR_TIPO: Record<TipoEventoFiscal, string> = {
  honorarios: "Pagar antes de la fecha límite",
  sat: "Declaración y obligaciones SAT",
  imss: "Pago de cuotas IMSS",
  estatal: "Impuesto estatal del periodo",
  repse: "Obligación REPSE",
};

export function hrefPorTipoEvento(tipo: TipoEventoFiscal): string {
  switch (tipo) {
    case "honorarios":
      return "/portal/honorarios#pago";
    case "sat":
      return "/portal/sat";
    default:
      return "/portal/cumplimiento";
  }
}

function diasEntre(de: Date, hasta: Date): number {
  const a = new Date(de.getFullYear(), de.getMonth(), de.getDate());
  const b = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtDiaMes(d: Date): string {
  return `${d.getDate()} de ${MESES_NOM[d.getMonth()].toLowerCase()}`;
}

/** Próximos vencimientos accionables (máx. 5) a partir de eventos del calendario. */
export function proximosVencimientosDesde(
  eventos: EventoFiscal[],
  hoy: Date
): VencimientoResumen[] {
  const tonoPorDias = (d: number): "ok" | "warn" | "bad" =>
    d < 0 ? "bad" : d <= 5 ? "warn" : "ok";

  const detallePorDias = (d: number, fecha: Date): string => {
    if (d < 0) return `Vencido · ${fmtDiaMes(fecha)}`;
    if (d === 0) return `Hoy · ${fmtDiaMes(fecha)}`;
    return `${fmtDiaMes(fecha)} · en ${d} día${d === 1 ? "" : "s"}`;
  };

  return eventos
    .map((e) => {
      const d = diasEntre(hoy, e.fecha);
      return {
        tipo: e.tipo,
        titulo: e.etiqueta,
        fechaLabel: detallePorDias(d, e.fecha),
        tono: tonoPorDias(d),
        fecha: e.fecha,
        accion: ACCION_POR_TIPO[e.tipo],
        href: hrefPorTipoEvento(e.tipo),
        orden: e.fecha.getTime(),
      };
    })
    .filter((e) =>
      e.tono === "bad" ? hoy.getTime() - e.orden < 30 * 86_400_000 : true
    )
    .sort((a, b) => a.orden - b.orden)
    .slice(0, 5)
    .map(({ tipo, titulo, fechaLabel, tono, fecha, accion, href }) => ({
      tipo,
      titulo,
      fechaLabel,
      tono,
      fecha,
      accion,
      href,
    }));
}

export { COLORES_EVENTO };

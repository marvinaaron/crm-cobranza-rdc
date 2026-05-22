/**
 * REPSE — Registro de Prestadoras de Servicios Especializados u Obras
 * Especializadas (STPS).
 *
 * Para cada cuatrimestre el despacho sube DOS declaraciones informativas:
 *   - ICSOE → IMSS
 *   - SISUB → INFONAVIT
 *
 * No hay pagos: solo subir, validar y notificar al cliente.
 */

export type Cuatrimestre = 1 | 2 | 3;

export type PeriodoRepse = { cuatrimestre: Cuatrimestre; anio: number };

export type TipoDocumentoRepse = "icsoe" | "sisub";

export type DocumentoRepse = {
  id: string;
  nombreArchivo: string;
  tipoMime: string;
  dataUrl: string;
  subidoEn: string;
};

export type RegistroRepse = {
  id: string;
  clienteId: number;
  cuatrimestre: Cuatrimestre;
  anio: number;
  icsoe?: DocumentoRepse;
  sisub?: DocumentoRepse;
  notificadoIcsoeEn?: string;
  notificadoSisubEn?: string;
  actualizadoEn: string;
};

export const TIPOS_REPSE: TipoDocumentoRepse[] = ["icsoe", "sisub"];

export const REPSE_META: Record<
  TipoDocumentoRepse,
  { label: string; descripcion: string; autoridad: string; color: string }
> = {
  icsoe: {
    label: "ICSOE",
    descripcion: "Informativa de Contratos de Servicios u Obras Especializadas",
    autoridad: "IMSS",
    color: "emerald",
  },
  sisub: {
    label: "SISUB",
    descripcion: "Sistema de Información de Subcontratación",
    autoridad: "INFONAVIT",
    color: "indigo",
  },
};

export const CUATRIMESTRE_META: Record<
  Cuatrimestre,
  {
    label: string;
    rango: string;
    rangoCorto: string;
    /** Mes calendario (0-11) en que vence la presentación. */
    mesVencimiento: number;
    diaVencimiento: number;
  }
> = {
  1: {
    label: "Primer cuatrimestre",
    rango: "Enero – Abril",
    rangoCorto: "Ene–Abr",
    mesVencimiento: 4,
    diaVencimiento: 17,
  },
  2: {
    label: "Segundo cuatrimestre",
    rango: "Mayo – Agosto",
    rangoCorto: "May–Ago",
    mesVencimiento: 8,
    diaVencimiento: 17,
  },
  3: {
    label: "Tercer cuatrimestre",
    rango: "Septiembre – Diciembre",
    rangoCorto: "Sep–Dic",
    mesVencimiento: 0,
    diaVencimiento: 17,
  },
};

export function nuevoIdRegistroRepse(): string {
  return `repse-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function nuevoIdDocRepse(): string {
  return `repse-doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function cuatrimestreDeMes(mes: number): Cuatrimestre {
  if (mes <= 3) return 1;
  if (mes <= 7) return 2;
  return 3;
}

/** Cuatrimestre en curso de presentación (el que se está trabajando hoy). */
export function getCuatrimestreActual(fecha = new Date()): PeriodoRepse {
  const mes = fecha.getMonth();
  // En enero todavía se trabaja el último cuatrimestre del año anterior.
  if (mes === 0) {
    return { cuatrimestre: 3, anio: fecha.getFullYear() - 1 };
  }
  // El cuatrimestre se presenta el mes siguiente a su cierre.
  if (mes >= 1 && mes <= 4) return { cuatrimestre: 1, anio: fecha.getFullYear() };
  if (mes >= 5 && mes <= 8) return { cuatrimestre: 2, anio: fecha.getFullYear() };
  return { cuatrimestre: 3, anio: fecha.getFullYear() };
}

export function periodoRepseKey(p: PeriodoRepse): string {
  return `${p.anio}-${p.cuatrimestre}`;
}

export function periodoRepseLabel(p: PeriodoRepse): string {
  return `${CUATRIMESTRE_META[p.cuatrimestre].rangoCorto} ${p.anio}`;
}

export function periodoRepseLabelLargo(p: PeriodoRepse): string {
  return `${CUATRIMESTRE_META[p.cuatrimestre].label} ${p.anio}`;
}

export function listarCuatrimestresDisponibles(anioRef = new Date().getFullYear()):
  PeriodoRepse[] {
  const out: PeriodoRepse[] = [];
  for (let anio = anioRef - 1; anio <= anioRef + 1; anio += 1) {
    out.push({ cuatrimestre: 1, anio });
    out.push({ cuatrimestre: 2, anio });
    out.push({ cuatrimestre: 3, anio });
  }
  return out;
}

export function getRegistroRepse(
  registros: RegistroRepse[],
  clienteId: number,
  periodo: PeriodoRepse
): RegistroRepse | undefined {
  return registros.find(
    (r) =>
      r.clienteId === clienteId &&
      r.cuatrimestre === periodo.cuatrimestre &&
      r.anio === periodo.anio
  );
}

export function progresoRepse(reg: RegistroRepse | undefined): {
  icsoe: boolean;
  sisub: boolean;
  completo: boolean;
} {
  const icsoe = !!reg?.icsoe;
  const sisub = !!reg?.sisub;
  return { icsoe, sisub, completo: icsoe && sisub };
}

export type ConfigRepseCliente = {
  habilitado: boolean;
};

export const CONFIG_REPSE_DEFAULT: ConfigRepseCliente = {
  habilitado: false,
};

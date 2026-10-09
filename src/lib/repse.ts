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

/** A qué cuatrimestre pertenece un mes del periodo mensual de cumplimiento. */
export function cuatrimestreDeMes(mes: number): Cuatrimestre {
  if (mes <= 3) return 1;
  if (mes <= 7) return 2;
  return 3;
}

/** Cuatrimestre + año del registro REPSE asociado a un periodo mensual. */
export function periodoRepseDesdePeriodoMensual(periodo: {
  mes: number;
  anio: number;
}): PeriodoRepse {
  return {
    cuatrimestre: cuatrimestreDeMes(periodo.mes),
    anio: periodo.anio,
  };
}

/**
 * Cuatrimestre en ventana de presentación según calendario REPSE:
 * - 1er cuatri (ene–abr) → se presenta en **mayo**
 * - 2do cuatri (may–ago) → se presenta en **septiembre**
 * - 3er cuatri (sep–dic) → se presenta en **enero** (año siguiente al cierre)
 */
export function getCuatrimestrePresentacionVigente(
  fecha = new Date()
): PeriodoRepse {
  const mes = fecha.getMonth();
  const anio = fecha.getFullYear();
  if (mes >= 4 && mes <= 7) return { cuatrimestre: 1, anio };
  if (mes >= 8 && mes <= 11) return { cuatrimestre: 2, anio };
  if (mes === 0) return { cuatrimestre: 3, anio: anio - 1 };
  return { cuatrimestre: 1, anio };
}

/** @deprecated Usar getCuatrimestrePresentacionVigente */
export function getCuatrimestreActual(fecha = new Date()): PeriodoRepse {
  return getCuatrimestrePresentacionVigente(fecha);
}

/** Etiqueta del mes en que vence la presentación del cuatrimestre. */
export function etiquetaMesPresentacion(cuatrimestre: Cuatrimestre): string {
  const m = CUATRIMESTRE_META[cuatrimestre].mesVencimiento;
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return meses[m] ?? "";
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

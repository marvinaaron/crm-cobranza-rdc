export type TipoCfdi = "emitido" | "recibido";

export type TipoComprobanteCfdi = "I" | "E" | "T" | "N" | "P";

export type EstatusCfdi = "vigente" | "cancelado";

export type CfdiMetadataExtra = {
  serie?: string;
  folio?: string;
  formaPago?: string;
  metodoPago?: string;
  ivaTrasladado?: number;
  ivaRetenido?: number;
  isrRetenido?: number;
};

export type CfdiParseado = {
  uuid: string;
  tipoComprobante: TipoComprobanteCfdi;
  rfcEmisor: string;
  nombreEmisor: string | null;
  rfcReceptor: string;
  nombreReceptor: string | null;
  fecha: string;
  mes: number;
  anio: number;
  subtotal: number;
  total: number;
  moneda: string;
  conceptoResumen: string | null;
  estatus: EstatusCfdi;
  metadata: CfdiMetadataExtra;
};

export type CfdiRegistro = {
  id: string;
  clienteId: number;
  uuidSat: string;
  tipo: TipoCfdi;
  tipoComprobante: TipoComprobanteCfdi;
  rfcEmisor: string;
  nombreEmisor: string | null;
  rfcReceptor: string;
  nombreReceptor: string | null;
  fecha: string;
  mes: number;
  anio: number;
  subtotal: number;
  total: number;
  moneda: string;
  conceptoResumen: string | null;
  estatus: EstatusCfdi;
  categoriaVisor: string | null;
  xmlPath: string;
  nombreArchivo: string | null;
  tamanoBytes: number | null;
  metadata: CfdiMetadataExtra;
  createdAt: string;
};

export type CfdiResumenPeriodo = {
  cantidadEmitidos: number;
  cantidadRecibidos: number;
  totalEmitidos: number;
  totalRecibidos: number;
};

export type FiltroCfdiListado = {
  clienteId: number;
  mes: number;
  anio: number;
  /** Si se omiten, el listado es un solo mes (`mes`/`anio`). */
  mesHasta?: number;
  anioHasta?: number;
  tipo?: TipoCfdi | "todos";
  busqueda?: string;
};

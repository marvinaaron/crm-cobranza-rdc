"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  Cliente,
  Periodo,
  getPeriodoHoy,
  getPeriodoFiscalVigente,
  generarAniosDisponibles,
  calcularEstado,
  periodoAnioStr,
  periodoLabel,
  asegurarClienteIngresosDiversos,
  ID_INGRESOS_DIVERSOS,
  nuevoIdDescuento,
  nuevoIdPagoAdicional,
  nuevoIdExtraEsperado,
  esIngresoGeneralCliente,
  fechaNacimientoDeRFC,
  formatearFechaNacimientoCorta,
  type Descuento,
  type ExtraEsperado,
  type MetodoPago,
  type PagoRealizado,
} from "@/lib/clientes";
import {
  type ComprobantePago,
  contarComprobantesNuevos,
  getComprobantePeriodo as findComprobante,
  getComprobantesCliente as listarComprobantesCliente,
  getComprobantesExtra as listarComprobantesExtra,
  nuevoIdComprobante,
} from "@/lib/comprobantes";
import {
  type MarcaRecordatorio,
  type ScriptCorreo,
  type ViaContacto,
  nuevoIdMarca,
  nuevoIdScript,
  periodoKeyStr,
} from "@/lib/recordatorios";
import {
  type Presupuesto,
  type ServicioCatalogo,
  type EstadoPresupuesto,
  type PrecioRegimen,
  type RegimenClave,
  nuevoIdPresupuesto,
  nuevoIdServicio,
  nuevoTokenPublico,
  siguienteFolio,
  CATALOGO_DEFAULT,
} from "@/lib/presupuestos";
import type { TipoCorreoCobranza } from "@/lib/correo";
import { buildAdminPushExtras, buildClientePushExtras } from "@/lib/push/payload";
import {
  type FacturaPago,
  getFacturaPeriodo as findFactura,
  nuevoIdFactura,
} from "@/lib/facturas";
import {
  type RegistroCumplimiento,
  type TipoDocumentoSingular,
  getCumplimientoPeriodo as findCumplimiento,
  nuevoIdCumplimiento,
  nuevoIdDocumento,
  registroPersistible,
  bloquesVacios,
  asegurarBloques,
  MAX_PDF_EMA_EBA,
  nuevoIdLinea,
  consolidarFederalesLineasCaptura,
  getTotalImpuestos,
  getFechaLimitePrincipal,
  getSubtotalCategoria,
  type CategoriaId,
  periodoVencidoSinPago,
} from "@/lib/cumplimiento";
import {
  aplicarMarcasEscalamiento,
  planificarRecordatoriosFiscales,
} from "@/lib/portal/recordatorios-fiscales";
import {
  categoriasHabilitadasCliente,
  categoriaAplicaCliente,
  categoriasConPagoEnPreview,
} from "@/lib/config-cumplimiento-cliente";
import {
  type PagoImpuestoHistorial,
  crearEntradaHistorial,
  upsertHistorialEntry,
} from "@/lib/historial-impuestos";
import {
  notificarClientePagoValidado,
  type OpcionesCorreoEvento,
  type ResultadoEnvioCorreoEvento,
} from "@/lib/correo-eventos";
import {
  type Notificacion,
  type DestinatarioNotificacion,
  type TipoNotificacion,
  nuevoIdNotificacion,
  normalizarNotificaciones,
} from "@/lib/notificaciones";
import {
  cargarCrmDesdeNube,
  esRutaPortal,
  guardarCrmEnNube,
} from "@/lib/crm-cloud-sync";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import CrmCloudBanner from "@/components/CrmCloudBanner";
import {
  CATEGORIA_META,
  categoriaTieneAlgunDocumento,
} from "@/lib/cumplimiento-categorias";
import { getWorkflowMesCliente } from "@/lib/cobranza-workflow";
import {
  type RegistroRepse,
  type PeriodoRepse,
  type TipoDocumentoRepse,
  REPSE_META,
  nuevoIdRegistroRepse,
  nuevoIdDocRepse,
  periodoRepseLabel,
} from "@/lib/repse";
import {
  type Encargo,
  type TipoEncargo,
  type EstadoEncargo,
  type ArchivoEncargo,
  type EntregaEncargo,
  nuevoIdEncargo,
  normalizarEncargo,
  claveMesEncargo,
  ESTADO_ENCARGO_META,
  datosFacturaUnicaEncargo,
  esFacturaUnica,
  formatImporteFacturaEncargo,
} from "@/lib/encargos";

type ArchivoAdjunto = {
  nombreArchivo: string;
  tipoMime: string;
  dataUrl: string;
};

type MetadataCumplimiento = {
  montoImpuesto: number;
  fechaLimite: string;
};

export type LineaPreviewInput = {
  etiqueta: string;
  monto: number;
  fechaLimite: string;
};

export type PreviewImpuestosInput = {
  federales: LineaPreviewInput[];
  imss: { activo: boolean; monto: number; fechaLimite: string };
  estatales: { activo: boolean; monto: number; fechaLimite: string };
};

type ClientesContextValue = {
  listaClientes: Cliente[];
  comprobantes: ComprobantePago[];
  facturas: FacturaPago[];
  cumplimiento: RegistroCumplimiento[];
  historialImpuestos: PagoImpuestoHistorial[];
  /** true cuando ya se cargó el estado desde Supabase (evita “sin documentos” antes de cargar). */
  datosListos: boolean;
  /** true cuando terminó el intento inicial de carga (éxito o agotar reintentos). */
  cargaInicialTerminada: boolean;
  cloudSyncError: string | null;
  cloudSincronizando: boolean;
  recargarDesdeNube: () => Promise<void>;
  /** Fuerza guardado inmediato en la nube (sin esperar el debounce). */
  guardarEnNubeAhora: () => Promise<void>;
  ultimaSyncEn: number | null;
  periodo: Periodo;
  periodoHoy: Periodo;
  /** Mes vencido respecto al calendario (periodo fiscal vigente). */
  periodoFiscalVigente: Periodo;
  aniosDisponibles: number[];
  comprobantesNuevos: number;
  setListaClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  setPeriodoMes: (mes: number) => void;
  setPeriodoAnio: (anio: number) => void;
  irAPeriodoActual: () => void;
  irAPeriodoFiscalVigente: () => void;
  actualizarCliente: (cliente: Cliente) => void;
  eliminarCliente: (clienteId: number) => Promise<void>;
  registrarPago: (
    clienteId: number,
    periodoPago: Periodo,
    monto: number,
    nota?: string,
    opciones?: {
      enviarCorreo?: boolean;
      comprobanteId?: string;
      /**
       * Fecha real del depósito/transferencia (ISO `YYYY-MM-DD`).
       * Si no se provee, se asume `new Date().toISOString().slice(0,10)`
       * (hoy).
       */
      fechaPago?: string;
      /** Método por el que se liquidó (transferencia, efectivo, etc.). */
      metodoPago?: MetodoPago;
    }
  ) => Cliente | null;
  quitarPago: (clienteId: number, periodoPago: Periodo) => Cliente | null;
  /** Registra un servicio adicional (extra a honorarios). Permite múltiples por mes. */
  registrarServicioAdicional: (
    clienteId: number,
    periodoPago: Periodo,
    monto: number,
    concepto: string,
    nota?: string
  ) => Cliente | null;
  eliminarServicioAdicional: (
    clienteId: number,
    pagoId: string
  ) => Cliente | null;
  /**
   * Registra un movimiento en la bolsa "Ingresos diversos" (sin cliente fijo).
   * A diferencia de un pago de honorarios, permite VARIOS movimientos en el
   * mismo mes (cada uno con su id), para llevar un libro de ingresos sueltos.
   */
  registrarIngresoDiverso: (
    periodoPago: Periodo,
    monto: number,
    concepto?: string,
    nota?: string
  ) => Cliente | null;
  /** Elimina un movimiento puntual de la bolsa "Ingresos diversos" por id. */
  eliminarIngresoDiverso: (pagoId: string) => Cliente | null;
  /** Agrega un cargo extra por cobrar con periodo contable asignado. */
  agregarExtraEsperado: (
    clienteId: number,
    concepto: string,
    montoTotal: number,
    periodo: Periodo,
    nota?: string
  ) => Cliente | null;
  /** Edita los datos de un extra esperado (concepto, monto, periodo, nota). */
  editarExtraEsperado: (
    clienteId: number,
    extraId: string,
    datos: {
      concepto: string;
      montoTotal: number;
      periodo: Periodo;
      nota?: string;
    }
  ) => Cliente | null;
  /** Elimina un extra esperado y sus abonos vinculados. */
  eliminarExtraEsperado: (clienteId: number, extraId: string) => Cliente | null;
  /** Registra un abono parcial contra un extra esperado (cuenta como cobrado del mes). */
  registrarAbonoExtraEsperado: (
    clienteId: number,
    extraId: string,
    periodoPago: Periodo,
    monto: number,
    nota?: string
  ) => Cliente | null;
  // ---- Centro de Recordatorios ----
  /** Bitácora de "ya contacté a este cliente este mes". */
  recordatorioLog: MarcaRecordatorio[];
  /** Biblioteca de plantillas/scripts reutilizables para correos. */
  scriptsCorreo: ScriptCorreo[];
  /** Registra que se contactó al cliente (automático al enviar o manual). */
  marcarRecordatorio: (
    clienteId: number,
    periodoPago: Periodo,
    tipo: TipoCorreoCobranza,
    via: ViaContacto
  ) => void;
  /** Quita todas las marcas de contacto de un cliente para un periodo. */
  quitarMarcaRecordatorioMes: (clienteId: number, periodoKey: string) => void;
  agregarScriptCorreo: (titulo: string, cuerpo: string) => ScriptCorreo | null;
  editarScriptCorreo: (id: string, titulo: string, cuerpo: string) => void;
  eliminarScriptCorreo: (id: string) => void;
  // ---- Presupuestos ----
  presupuestos: Presupuesto[];
  catalogoServicios: ServicioCatalogo[];
  /** Crea un presupuesto (con folio automático). Devuelve el creado. */
  agregarPresupuesto: (
    data: Omit<Presupuesto, "id" | "folio" | "creadoEn" | "estado"> &
      Partial<Pick<Presupuesto, "estado" | "folio">>
  ) => Presupuesto;
  actualizarPresupuesto: (
    id: string,
    cambios: Partial<Presupuesto>
  ) => Presupuesto | null;
  eliminarPresupuesto: (id: string) => void;
  /**
   * Devuelve el token público del presupuesto, generándolo y guardándolo si
   * aún no tiene. Sirve para construir el link de aceptación `/p/[token]`.
   */
  asegurarTokenPresupuesto: (id: string) => string;
  /**
   * Asigna token + marca enviado y guarda en la nube de inmediato. Úsalo al
   * compartir la liga pública para evitar el "No encontramos esta propuesta".
   */
  prepararLigaPublica: (id: string) => Promise<string>;
  /** Cambia el estado de un presupuesto y registra la fecha del cambio. */
  cambiarEstadoPresupuesto: (
    id: string,
    estado: EstadoPresupuesto
  ) => Presupuesto | null;
  /** Catálogo editable de servicios reutilizables. */
  agregarServicioCatalogo: (
    s: Omit<ServicioCatalogo, "id">
  ) => ServicioCatalogo;
  editarServicioCatalogo: (
    id: string,
    cambios: Partial<Omit<ServicioCatalogo, "id">>
  ) => void;
  eliminarServicioCatalogo: (id: string) => void;
  /** Honorarios base por régimen (para autollenar presupuestos). */
  preciosRegimen: PrecioRegimen[];
  setPrecioRegimen: (clave: RegimenClave, precio: number) => void;
  /** Aplica (o reemplaza) un descuento puntual al mes/año indicado. */
  aplicarDescuento: (
    clienteId: number,
    periodoPago: Periodo,
    datos: { tipo: "monto" | "porcentaje"; valor: number; motivo: string }
  ) => Cliente | null;
  eliminarDescuento: (
    clienteId: number,
    descuentoId: string
  ) => Cliente | null;
  subirComprobante: (
    clienteId: number,
    periodos: Periodo[],
    archivo: ArchivoAdjunto
  ) => ComprobantePago;
  /** Sube un comprobante para un cargo "Extra por cobrar" (queda en validación). */
  subirComprobanteExtra: (
    clienteId: number,
    extraEsperadoId: string,
    periodoPago: Periodo,
    monto: number,
    archivo: ArchivoAdjunto
  ) => ComprobantePago;
  /** Valida un comprobante de extra y registra el abono correspondiente. */
  validarComprobanteExtra: (comprobanteId: string) => ComprobantePago | null;
  getComprobantePeriodo: (clienteId: number, periodo: Periodo) => ComprobantePago | undefined;
  getComprobantesCliente: (clienteId: number) => ComprobantePago[];
  getComprobantesExtra: (
    clienteId: number,
    extraEsperadoId: string
  ) => ComprobantePago[];
  marcarComprobanteVisto: (id: string) => void;
  validarComprobantePago: (
    comprobanteId: string,
    opciones?: {
      enviarCorreo?: boolean;
      clienteActualizado?: Cliente;
      correoOpciones?: OpcionesCorreoEvento;
    }
  ) => Promise<{
    comprobante: ComprobantePago | null;
    correo?: ResultadoEnvioCorreoEvento;
  }>;
  revertirValidacionComprobante: (
    comprobanteId: string,
    opciones?: { revertirPagosVinculados?: boolean }
  ) => ComprobantePago | null;
  eliminarComprobantePagoHonorarios: (
    comprobanteId: string,
    opciones?: { notificarCliente?: boolean; revertirPagosVinculados?: boolean }
  ) => void;
  subirFactura: (
    clienteId: number,
    periodo: Periodo,
    archivo: ArchivoAdjunto,
    monto?: number
  ) => FacturaPago;
  getFacturaPeriodo: (clienteId: number, periodo: Periodo) => FacturaPago | undefined;
  eliminarFactura: (id: string) => void;
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined;
  subirDocumentoCumplimiento: (
    clienteId: number,
    periodo: Periodo,
    tipo: TipoDocumentoSingular,
    archivo: ArchivoAdjunto,
    metadata?: MetadataCumplimiento,
    lineaId?: string,
    slotIndex?: number
  ) => RegistroCumplimiento;
  actualizarMetadataCumplimiento: (
    clienteId: number,
    periodo: Periodo,
    metadata: MetadataCumplimiento
  ) => RegistroCumplimiento | null;
  eliminarDocumentoCumplimiento: (
    clienteId: number,
    periodo: Periodo,
    tipo: TipoDocumentoSingular,
    lineaId?: string,
    slotIndex?: number
  ) => void;
  agregarDocumentoOtros: (
    clienteId: number,
    periodo: Periodo,
    archivo: ArchivoAdjunto
  ) => RegistroCumplimiento;
  eliminarDocumentoOtros: (
    clienteId: number,
    periodo: Periodo,
    archivoId: string
  ) => void;
  agregarArchivoNomina: (
    clienteId: number,
    periodo: Periodo,
    archivo: ArchivoAdjunto
  ) => RegistroCumplimiento;
  eliminarArchivoNomina: (
    clienteId: number,
    periodo: Periodo,
    archivoId: string
  ) => void;
  marcarCumplimientoNotificado: (clienteId: number, periodo: Periodo) => void;
  marcarContabilidadIniciada: (clienteId: number, periodo: Periodo) => void;
  revertirContabilidadIniciada: (clienteId: number, periodo: Periodo) => void;
  marcarSinPagoImpuestos: (
    clienteId: number,
    periodo: Periodo,
    motivo?: "sin_operaciones" | "saldo_favor" | "otro"
  ) => void;
  revertirSinPagoImpuestos: (clienteId: number, periodo: Periodo) => void;
  /**
   * Captura/actualiza el saldo a favor (ISR / IVA) del periodo. Aplica con
   * o sin modo "sin pago". Pasar { activo: false } limpia el bloque.
   */
  actualizarSaldoFavor: (
    clienteId: number,
    periodo: Periodo,
    saldo: {
      activo: boolean;
      lineas?: { etiqueta: string; monto: number }[];
    }
  ) => void;
  marcarVencimientoNotificado: (
    clienteId: number,
    periodo: Periodo,
    categoria: CategoriaId
  ) => void;
  publicarPreviewImpuestos: (
    clienteId: number,
    periodo: Periodo,
    datos: PreviewImpuestosInput
  ) => RegistroCumplimiento;
  marcarPreviewNotificado: (clienteId: number, periodo: Periodo) => void;
  confirmarPreviewCliente: (clienteId: number, periodo: Periodo) => RegistroCumplimiento | null;
  confirmarPreviewCategoria: (
    clienteId: number,
    periodo: Periodo,
    categoria: CategoriaId
  ) => RegistroCumplimiento | null;
  subirComprobantePagoImpuestos: (
    clienteId: number,
    periodo: Periodo,
    archivo: ArchivoAdjunto
  ) => RegistroCumplimiento | null;
  subirComprobantePagoCategoria: (
    clienteId: number,
    periodo: Periodo,
    categoria: CategoriaId,
    archivo: ArchivoAdjunto
  ) => RegistroCumplimiento | null;
  eliminarComprobantePagoCategoria: (
    clienteId: number,
    periodo: Periodo,
    categoria: CategoriaId
  ) => void;
  validarPagoCategoria: (
    clienteId: number,
    periodo: Periodo,
    categoria: CategoriaId
  ) => RegistroCumplimiento | null;
  revertirValidacionPagoCategoria: (
    clienteId: number,
    periodo: Periodo,
    categoria: CategoriaId
  ) => void;
  notificaciones: Notificacion[];
  notificacionesAdmin: Notificacion[];
  notificacionesAdminNoLeidas: number;
  notificacionesCliente: (clienteId: number) => Notificacion[];
  notificacionesClienteNoLeidas: (clienteId: number) => number;
  marcarNotificacionLeida: (id: string) => void;
  marcarNotificacionesLeidas: (
    destinatario: DestinatarioNotificacion,
    clienteId?: number
  ) => void;
  borrarNotificaciones: (
    destinatario: DestinatarioNotificacion,
    clienteId?: number
  ) => void;
  agregarNotificacion: (n: {
    tipo: TipoNotificacion;
    destinatario: DestinatarioNotificacion;
    clienteId: number;
    periodo: Periodo;
    categoria?: CategoriaId;
    escalamientoClave?: string;
    titulo: string;
    detalle?: string;
    href?: string;
  }) => void;
  marcarRecordatorioLimiteEnviado: (clienteId: number, periodo: Periodo) => void;
  eliminarPreviewImpuestos: (clienteId: number, periodo: Periodo) => void;
  publicarExtemporaneo: (
    clienteId: number,
    periodo: Periodo,
    categoria: CategoriaId,
    linea: { monto: number; fechaLimite: string; etiqueta?: string },
    archivo?: ArchivoAdjunto
  ) => RegistroCumplimiento;
  getHistorialImpuestosCliente: (
    clienteId: number,
    categoria?: CategoriaId
  ) => PagoImpuestoHistorial[];
  registrosRepse: RegistroRepse[];
  getRegistroRepseCliente: (
    clienteId: number,
    periodo: PeriodoRepse
  ) => RegistroRepse | undefined;
  subirDocumentoRepse: (
    clienteId: number,
    periodo: PeriodoRepse,
    tipo: TipoDocumentoRepse,
    archivo: ArchivoAdjunto
  ) => RegistroRepse;
  eliminarDocumentoRepse: (
    clienteId: number,
    periodo: PeriodoRepse,
    tipo: TipoDocumentoRepse
  ) => void;
  encargos: Encargo[];
  getEncargosCliente: (clienteId: number) => Encargo[];
  crearEncargo: (params: {
    clienteId: number;
    titulo: string;
    tipo: TipoEncargo;
    nota?: string;
    fechaCompromiso?: string;
    cantidadFacturas?: number;
    facturaImporteDepositado?: number;
    facturaReceptor?: string;
    adjuntosCliente?: ArchivoEncargo[];
    notasCliente?: { grupo?: number; texto: string }[];
    creadoPor: "admin" | "cliente";
  }) => Encargo;
  actualizarEstadoEncargo: (
    encargoId: string,
    estado: EstadoEncargo
  ) => Encargo | null;
  /** Edita una solicitud (cliente o admin). Notifica al admin si la edita el cliente. */
  editarEncargo: (
    encargoId: string,
    params: {
      titulo: string;
      tipo: TipoEncargo;
      nota?: string;
      cantidadFacturas?: number;
      facturaImporteDepositado?: number;
      facturaReceptor?: string;
      adjuntosCliente?: ArchivoEncargo[];
      notasCliente?: { grupo?: number; texto: string }[];
      editadoPor: "admin" | "cliente";
    }
  ) => Encargo | null;
  guardarEntregasEncargo: (
    encargoId: string,
    entregas: EntregaEncargo[],
    opts?: { marcarListo?: boolean }
  ) => Encargo | null;
  /** Borra los archivos cargados de un mes (deja solo el texto/folios). */
  liberarArchivosMes: (claveMes: string) => number;
  eliminarEncargo: (encargoId: string) => void;
};

const ClientesContext = createContext<ClientesContextValue | null>(null);

function actualizarPagosCliente(
  cliente: Cliente,
  periodoPago: Periodo,
  monto: number | null,
  nota?: string,
  comprobanteId?: string,
  fechaPago?: string,
  metodoPago?: MetodoPago
): Cliente {
  const anioStr = periodoAnioStr(periodoPago);
  const esHonorariosMes = (p: (typeof cliente.pagosRealizados)[number]) =>
    p.mes === periodoPago.mes &&
    p.anio === anioStr &&
    (p.tipo === "honorarios" || !p.tipo);

  // Quitar pago del mes: elimina todos los abonos de honorarios de ese periodo.
  if (monto === null || monto <= 0) {
    const pagosRealizados = cliente.pagosRealizados.filter((p) => !esHonorariosMes(p));
    return {
      ...cliente,
      pagosRealizados,
      estado: calcularEstado({ ...cliente, pagosRealizados }, getPeriodoHoy()),
    };
  }

  // Abono nuevo: se suma al mes (varios depósitos parciales). Antes se
  // reemplazaba el monto y un segundo abono borraba el primero.
  const pagosRealizados = [
    ...cliente.pagosRealizados,
    {
      mes: periodoPago.mes,
      anio: anioStr,
      monto,
      tipo: "honorarios" as const,
      ...(nota?.trim() ? { nota: nota.trim() } : {}),
      ...(comprobanteId ? { comprobanteId } : {}),
      fechaPago: fechaPago ?? new Date().toISOString().slice(0, 10),
      metodoPago: metodoPago ?? "transferencia",
    },
  ];

  return {
    ...cliente,
    pagosRealizados,
    estado: calcularEstado({ ...cliente, pagosRealizados }, getPeriodoHoy()),
  };
}

export function ClientesProvider({ children }: { children: ReactNode }) {
  const periodoHoy = useMemo(() => getPeriodoHoy(), []);
  const periodoFiscalVigente = useMemo(() => getPeriodoFiscalVigente(), []);
  const [periodo, setPeriodo] = useState<Periodo>(periodoHoy);
  const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
  const [comprobantes, setComprobantes] = useState<ComprobantePago[]>([]);
  const [facturas, setFacturas] = useState<FacturaPago[]>([]);
  const [cumplimiento, setCumplimiento] = useState<RegistroCumplimiento[]>([]);
  const [historialImpuestos, setHistorialImpuestos] = useState<PagoImpuestoHistorial[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  // Espejo de `notificaciones` para calcular el conteo exacto (badge del
  // ícono de la app) al momento de mandar la push, sin esperar al render.
  const notificacionesRef = useRef<Notificacion[]>([]);
  const [registrosRepse, setRegistrosRepse] = useState<RegistroRepse[]>([]);
  const [encargos, setEncargos] = useState<Encargo[]>([]);
  const [recordatorioLog, setRecordatorioLog] = useState<MarcaRecordatorio[]>([]);
  const [scriptsCorreo, setScriptsCorreo] = useState<ScriptCorreo[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [catalogoServicios, setCatalogoServicios] = useState<ServicioCatalogo[]>([]);
  const [preciosRegimen, setPreciosRegimen] = useState<PrecioRegimen[]>([]);
  const [hydrated, setHydrated] = useState(false);
  /** true solo tras una carga exitosa desde la nube (no basta con "intentamos cargar"). */
  const [cargaInicialOk, setCargaInicialOk] = useState(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [ultimaSyncEn, setUltimaSyncEn] = useState<number | null>(null);
  const [cloudSincronizando, setCloudSincronizando] = useState(false);
  const omitirGuardadoRef = useRef(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Reintentos automáticos del guardado en la nube (errores transitorios).
  const reintentoGuardadoRef = useRef(0);
  const reintentoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Solo permitimos GUARDAR si ya cargamos bien desde la nube al menos una vez.
  // Evita que un estado vacío (carga inicial fallida) sobreescriba datos reales.
  const cargaOkRef = useRef(false);
  // Snapshot vivo del estado para poder hacer flush a la nube en cualquier
  // momento (antes de recargar) sin depender de closures viejos.
  const estadoNubeRef = useRef<Parameters<typeof guardarCrmEnNube>[0] | null>(
    null
  );
  // Línea base de lo último guardado/cargado (JSON por sección) para detectar
  // qué secciones cambiaron y subir solo esas (guardado incremental).
  type ClaveNube = keyof NonNullable<typeof estadoNubeRef.current>;
  const baselineRef = useRef<Record<string, string> | null>(null);
  // Caché de serialización por sección: guardamos la referencia del objeto y su
  // JSON. Como el estado es inmutable (cada cambio crea una referencia nueva),
  // si la referencia no cambió el JSON tampoco, y evitamos volver a serializar
  // secciones pesadas (comprobantes/facturas con base64) en cada guardado.
  const serializadoRef = useRef<Record<string, { ref: unknown; json: string }>>(
    {}
  );
  const serializarSeccion = useCallback((k: string, valor: unknown): string => {
    const cache = serializadoRef.current[k];
    if (cache && cache.ref === valor) return cache.json;
    const json = JSON.stringify(valor);
    serializadoRef.current[k] = { ref: valor, json };
    return json;
  }, []);
  const aniosDisponibles = useMemo(() => generarAniosDisponibles(), []);

  const calcularBaseline = useCallback(
    (estado: NonNullable<typeof estadoNubeRef.current>): Record<string, string> => {
      const out: Record<string, string> = {};
      for (const k of Object.keys(estado) as ClaveNube[]) {
        out[k] = JSON.stringify(estado[k]);
      }
      return out;
    },
    []
  );

  // Caché local del último estado cargado: permite "entrar al instante" con los
  // datos previos mientras la nube responde (stale-while-revalidate). Solo
  // acelera la VISTA; el guardado real sigue gobernado por la carga de nube.
  const CACHE_KEY = "rdc-crm-cache-admin-v1";
  const leerCache = useCallback(():
    | Awaited<ReturnType<typeof cargarCrmDesdeNube>>
    | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);
  const escribirCache = useCallback(
    (estado: NonNullable<typeof estadoNubeRef.current>) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(estado));
      } catch {
        // Cuota llena u otro fallo: el caché es opcional, lo ignoramos.
      }
    },
    []
  );

  useEffect(() => {
    notificacionesRef.current = notificaciones;
  }, [notificaciones]);

  const aplicarPayloadNube = useCallback(
    (data: Awaited<ReturnType<typeof cargarCrmDesdeNube>>) => {
      const normalizado = {
        clientes: data.clientes,
        comprobantes: data.comprobantes,
        facturas: data.facturas,
        cumplimiento: data.cumplimiento,
        historialImpuestos: data.historialImpuestos,
        notificaciones: normalizarNotificaciones(data.notificaciones ?? []),
        repse: data.repse ?? [],
        encargos: (data.encargos ?? []).map(normalizarEncargo),
        recordatorioLog: data.recordatorioLog ?? [],
        scriptsCorreo: data.scriptsCorreo ?? [],
        presupuestos: data.presupuestos ?? [],
        catalogoServicios: data.catalogoServicios ?? [],
        preciosRegimen: data.preciosRegimen ?? [],
      };
      setListaClientes(normalizado.clientes);
      setComprobantes(normalizado.comprobantes);
      setFacturas(normalizado.facturas);
      setCumplimiento(normalizado.cumplimiento);
      setHistorialImpuestos(normalizado.historialImpuestos);
      setNotificaciones(normalizado.notificaciones);
      setRegistrosRepse(normalizado.repse);
      setEncargos(normalizado.encargos);
      setRecordatorioLog(normalizado.recordatorioLog);
      setScriptsCorreo(normalizado.scriptsCorreo);
      setPresupuestos(normalizado.presupuestos);
      setCatalogoServicios(normalizado.catalogoServicios);
      setPreciosRegimen(normalizado.preciosRegimen);
      return normalizado;
    },
    []
  );

  const cargarDesdeNube = useCallback(async (): Promise<boolean> => {
    try {
      const data = await cargarCrmDesdeNube({ timeoutMs: 25_000 });
      const normalizado = aplicarPayloadNube(data);
      // Línea base = lo que acabamos de cargar. A partir de aquí solo se suben
      // las secciones que el usuario modifique (guardado incremental).
      baselineRef.current = calcularBaseline(normalizado);
      escribirCache(normalizado);
      setCloudSyncError(null);
      setUltimaSyncEn(Date.now());
      cargaOkRef.current = true;
      setCargaInicialOk(true);
      return true;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "No se pudieron cargar los datos.";
      setCloudSyncError(msg);
      return false;
    }
  }, [aplicarPayloadNube]);

  // Guarda inmediatamente lo que haya pendiente en la nube. Se usa antes de
  // recargar para no pisar cambios locales recientes (ej. un script recién
  // creado) que aún no han pasado por el debounce de 800ms.
  const flushGuardado = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const payload = estadoNubeRef.current;
    if (!payload) return;
    // Salvaguarda anti-borrado: no subir si todavía no hubo una carga exitosa,
    // ni si el estado viene sin clientes (payload vacío/corrupto).
    if (!cargaOkRef.current) return;
    if (!payload.clientes || payload.clientes.length === 0) return;
    if (reintentoTimerRef.current) {
      clearTimeout(reintentoTimerRef.current);
      reintentoTimerRef.current = null;
    }

    // Detecta qué secciones cambiaron respecto a la última versión guardada
    // para subir SOLO esas (evita re-subir imágenes de comprobantes intactas).
    const baseline = baselineRef.current;
    const snapshot: Record<string, string> = {};
    let clavesCambiadas: ClaveNube[] | undefined;
    if (baseline) {
      const cambiadas: ClaveNube[] = [];
      for (const k of Object.keys(payload) as ClaveNube[]) {
        const s = serializarSeccion(k, payload[k]);
        snapshot[k] = s;
        if (s !== baseline[k]) cambiadas.push(k);
      }
      if (cambiadas.length === 0) return; // nada que subir
      clavesCambiadas = cambiadas;
    }

    setCloudSincronizando(true);
    try {
      await guardarCrmEnNube(payload, clavesCambiadas);
      setCloudSyncError(null);
      reintentoGuardadoRef.current = 0;
      // Actualiza la línea base con lo recién confirmado.
      if (baseline && clavesCambiadas) {
        for (const k of clavesCambiadas) baseline[k] = snapshot[k];
      } else {
        baselineRef.current = calcularBaseline(payload);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar en la nube.";
      const MAX_REINTENTOS = 6;
      // Mientras queden reintentos NO mostramos el banner rojo: dejamos el
      // indicador de "guardando" para no alarmar por fallos transitorios de
      // red móvil ("Load failed"). El rojo solo aparece si todo falla.
      if (reintentoGuardadoRef.current < MAX_REINTENTOS) {
        const intento = reintentoGuardadoRef.current;
        reintentoGuardadoRef.current = intento + 1;
        const espera = Math.min(1500 * 2 ** intento, 30000);
        reintentoTimerRef.current = setTimeout(() => {
          void flushGuardado();
        }, espera);
      } else {
        setCloudSyncError(msg);
      }
    } finally {
      setCloudSincronizando(false);
    }
    // flushGuardado se referencia a sí misma para el reintento; es estable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recargarDesdeNube = useCallback(async () => {
    if (saveTimerRef.current) await flushGuardado();
    omitirGuardadoRef.current = true;
    await cargarDesdeNube();
  }, [cargarDesdeNube, flushGuardado]);

  useEffect(() => {
    let cancelado = false;
    omitirGuardadoRef.current = true;

    // Entrada instantánea: si hay caché local de una sesión previa (solo admin),
    // pintamos esos datos de inmediato para no quedarnos en el splash mientras
    // la nube responde. NO marca `cargaOkRef` (eso exige una carga real), así
    // que el guardado sigue bloqueado hasta confirmar con la nube.
    if (!esRutaPortal()) {
      const cache = leerCache();
      if (cache && Array.isArray(cache.clientes) && cache.clientes.length > 0) {
        aplicarPayloadNube(cache);
        setCargaInicialOk(true);
      }
    }

    // Nunca dejar el splash colgado: tras 12s mostramos reintento aunque la nube no responda.
    const maxEspera = setTimeout(() => {
      if (!cancelado) setHydrated(true);
    }, 12_000);

    void (async () => {
      // Tras login completo, la sesión en cookies puede tardar un instante.
      if (!esRutaPortal()) {
        try {
          const supabase = getSupabaseBrowser();
          for (let i = 0; i < 15 && !cancelado; i++) {
            const { data } = await supabase.auth.getSession();
            if (data.session) break;
            await new Promise((r) => setTimeout(r, 200));
          }
        } catch {
          /* ignorar */
        }
      }

      for (let intento = 0; intento < 4 && !cancelado; intento++) {
        const ok = await cargarDesdeNube();
        if (ok || cancelado) break;
        await new Promise((r) => setTimeout(r, 600 * (intento + 1)));
      }
      if (!cancelado) setHydrated(true);
    })();

    return () => {
      cancelado = true;
      clearTimeout(maxEspera);
    };
  }, [cargarDesdeNube, leerCache, aplicarPayloadNube]);

  useEffect(() => {
    if (!hydrated || !esRutaPortal()) return;
    const supabase = getSupabaseBrowser();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (sess?.user) {
        void (async () => {
          if (saveTimerRef.current) await flushGuardado();
          omitirGuardadoRef.current = true;
          await cargarDesdeNube();
        })();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [hydrated, cargarDesdeNube, flushGuardado]);

  useEffect(() => {
    if (!hydrated || esRutaPortal()) return;
    const alVisible = () => {
      if (document.visibilityState !== "visible") return;
      void (async () => {
        // Si hay cambios locales sin guardar, súbelos antes de recargar para
        // no perderlos al sobrescribir con el snapshot de la nube.
        if (saveTimerRef.current) await flushGuardado();
        omitirGuardadoRef.current = true;
        await cargarDesdeNube();
      })();
    };
    document.addEventListener("visibilitychange", alVisible);
    // En móvil el intervalo cada 45s compite con la red y hace sentir la app
    // "trabada". Solo recarga al volver a la pestaña; en escritorio sí hay poll.
    const esEscritorio =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches;
    const id = esEscritorio ? window.setInterval(alVisible, 45_000) : undefined;
    return () => {
      document.removeEventListener("visibilitychange", alVisible);
      if (id != null) window.clearInterval(id);
    };
  }, [hydrated, cargarDesdeNube, flushGuardado]);

  useEffect(() => {
    estadoNubeRef.current = {
      clientes: listaClientes,
      comprobantes,
      facturas,
      cumplimiento,
      historialImpuestos,
      notificaciones,
      repse: registrosRepse,
      encargos,
      recordatorioLog,
      scriptsCorreo,
      presupuestos,
      catalogoServicios,
      preciosRegimen,
    };
    if (!hydrated) return;
    if (omitirGuardadoRef.current) {
      omitirGuardadoRef.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void flushGuardado();
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    listaClientes,
    comprobantes,
    facturas,
    cumplimiento,
    historialImpuestos,
    notificaciones,
    registrosRepse,
    encargos,
    recordatorioLog,
    scriptsCorreo,
    presupuestos,
    catalogoServicios,
    preciosRegimen,
    hydrated,
    flushGuardado,
  ]);

  // Recordatorios fiscales escalonados (cron diario + fallback al abrir CRM).
  useEffect(() => {
    if (!hydrated) return;
    const hoy = new Date();
    const planes = planificarRecordatoriosFiscales({
      clientes: listaClientes,
      cumplimiento,
      hoy,
    });
    if (!planes.length) return;

    for (const p of planes) {
      agregarNotificacion({
        tipo: p.tipo,
        destinatario: p.destinatario,
        clienteId: p.clienteId,
        periodo: p.periodo,
        categoria: p.categoria,
        escalamientoClave: p.escalamientoClave,
        titulo: p.titulo,
        detalle: p.detalle,
        href: p.href,
      });
    }

    const marcas = aplicarMarcasEscalamiento(
      { cumplimiento, clientes: listaClientes },
      planes,
      hoy.toISOString()
    );
    setCumplimiento(marcas.cumplimiento);
    setListaClientes(marcas.clientes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cumplimiento, hydrated, listaClientes]);

  const comprobantesNuevos = useMemo(
    () => contarComprobantesNuevos(comprobantes, periodo),
    [comprobantes, periodo]
  );

  const setPeriodoMes = useCallback((mes: number) => {
    setPeriodo((prev) => ({ ...prev, mes }));
  }, []);

  const setPeriodoAnio = useCallback((anio: number) => {
    setPeriodo((prev) => ({ ...prev, anio }));
  }, []);

  const irAPeriodoActual = useCallback(() => {
    setPeriodo(getPeriodoHoy());
  }, []);

  const irAPeriodoFiscalVigente = useCallback(() => {
    setPeriodo(getPeriodoFiscalVigente());
  }, []);

  const agregarNotificacion = useCallback(
    (n: {
      tipo: TipoNotificacion;
      destinatario: DestinatarioNotificacion;
      clienteId: number;
      periodo: Periodo;
      categoria?: CategoriaId;
      escalamientoClave?: string;
      titulo: string;
      detalle?: string;
      href?: string;
      encargoId?: string;
    }) => {
      const nueva: Notificacion = {
        id: nuevoIdNotificacion(),
        createdAt: new Date().toISOString(),
        ...n,
      };
      const esDuplicada = (p: Notificacion) =>
        !(
          !p.leidaEn &&
          p.tipo === nueva.tipo &&
          p.destinatario === nueva.destinatario &&
          p.clienteId === nueva.clienteId &&
          p.periodo.mes === nueva.periodo.mes &&
          p.periodo.anio === nueva.periodo.anio &&
          (p.categoria ?? null) === (nueva.categoria ?? null) &&
          (p.escalamientoClave ?? null) === (nueva.escalamientoClave ?? null) &&
          (p.encargoId ?? null) === (nueva.encargoId ?? null)
        );

      setNotificaciones((prev) =>
        normalizarNotificaciones([nueva, ...prev.filter(esDuplicada)])
      );

      // Conteo exacto de no leídas tras agregar esta — para el badge rojo del
      // ícono de la app (PWA instalada). Se calcula sobre el espejo en ref,
      // que mantenemos al día aquí mismo para soportar varias notificaciones
      // en el mismo tick (p. ej. al crear un encargo: admin + cliente).
      const listaActualizada = normalizarNotificaciones([
        nueva,
        ...notificacionesRef.current.filter(esDuplicada),
      ]);
      notificacionesRef.current = listaActualizada;
      const badgeCount =
        nueva.destinatario === "admin"
          ? listaActualizada.filter(
              (n) => n.destinatario === "admin" && !n.leidaEn
            ).length
          : listaActualizada.filter(
              (n) =>
                n.destinatario === "cliente" &&
                n.clienteId === nueva.clienteId &&
                !n.leidaEn
            ).length;

      // Push al admin (otros dispositivos) o al cliente — best-effort.
      if (nueva.destinatario === "admin" && typeof window !== "undefined") {
        const extrasAdmin = buildAdminPushExtras({
          tipo: nueva.tipo,
          clienteId: nueva.clienteId,
          href: nueva.href,
        });
        fetch("/api/admin/push/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: {
              title: nueva.titulo,
              body: nueva.detalle ?? "Hay actividad nueva del cliente.",
              url: extrasAdmin.url,
              tag: `admin-${nueva.tipo}-${nueva.clienteId}`,
              renotify: true,
              requireInteraction: extrasAdmin.requireInteraction,
              actions: extrasAdmin.actions,
              data: {
                tipo: nueva.tipo,
                clienteId: nueva.clienteId,
                notificacionId: nueva.id,
                actionUrls: extrasAdmin.actionUrls,
                badgeCount,
              },
            },
          }),
        }).catch(() => {});
      }

      if (nueva.destinatario === "cliente" && typeof window !== "undefined") {
        const extras = buildClientePushExtras({
          tipo: nueva.tipo,
          href: nueva.href,
        });
        fetch("/api/admin/push/notificar-cliente", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clienteId: nueva.clienteId,
            payload: {
              title: nueva.titulo,
              body:
                nueva.detalle ??
                "Tienes una nueva actualización en tu portal.",
              url: extras.url,
              tag: `cli-${nueva.clienteId}-${nueva.escalamientoClave ?? nueva.tipo}-${nueva.periodo.anio}-${nueva.periodo.mes}-${nueva.categoria ?? "x"}`,
              renotify: true,
              requireInteraction: extras.requireInteraction,
              actions: extras.actions,
              data: {
                tipo: nueva.tipo,
                actionUrls: extras.actionUrls,
                badgeCount,
              },
            },
          }),
        }).catch(() => {});
      }
    },
    []
  );

  /**
   * Si el cliente alcanzó el paso 7 (workflow "completado") en este
   * periodo, dispara una push celebratoria UNA sola vez. Se llama
   * después de cada acción del CRM que pueda completar el flujo:
   * validar pago de honorarios, subir factura, validar pago de
   * categoría o subir declaración en ceros. La dedupe se persiste en
   * `cierreMesNotificadoEn` del registro de cumplimiento, así no se
   * vuelve a mandar aunque el cliente lea o borre la notificación.
   *
   * Definido aquí (antes del primer useCallback que lo consume) para
   * evitar temporal-dead-zone en las dependencias.
   */
  const notificarCierreSiCorresponde = useCallback(
    (clienteId: number, p: Periodo) => {
      const cli = listaClientes.find((c) => c.id === clienteId);
      if (!cli) return;
      const registro = findCumplimiento(cumplimiento, clienteId, p);
      if (registro?.cierreMesNotificadoEn) return;
      const workflow = getWorkflowMesCliente(cli, p, registro);
      if (!workflow.esCompleto) return;
      const ahora = new Date().toISOString();
      // Si existe registro, marcamos para que la dedupe sea persistente
      // aún si el cliente lee/borra la push. Si no existe (caso edge:
      // cliente sin nada en cumplimiento), confiamos en la dedupe
      // nativa de `agregarNotificacion` por (tipo + clienteId + periodo).
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente) return prev;
        if (existente.cierreMesNotificadoEn) return prev;
        return prev.map((r) =>
          r.id === existente.id
            ? { ...r, cierreMesNotificadoEn: ahora, actualizadoEn: ahora }
            : r
        );
      });
      agregarNotificacion({
        tipo: "cierre_mes_completado",
        destinatario: "cliente",
        clienteId,
        periodo: p,
        titulo: `🎉 ¡Mes de ${periodoLabel(p)} cerrado con éxito!`,
        detalle:
          "Cumplimiento al 100%. Gracias por tu confianza. Nos vemos el próximo mes con todo listo de nuevo.",
        href: "/portal/cumplimiento",
      });
    },
    [listaClientes, cumplimiento, agregarNotificacion]
  );

  const marcarNotificacionLeida = useCallback((id: string) => {
    setNotificaciones((prev) =>
      normalizarNotificaciones(
        prev.map((n) =>
          n.id === id && !n.leidaEn ? { ...n, leidaEn: new Date().toISOString() } : n
        )
      )
    );
  }, []);

  const marcarNotificacionesLeidas = useCallback(
    (destinatario: DestinatarioNotificacion, clienteId?: number) => {
      const ahora = new Date().toISOString();
      setNotificaciones((prev) =>
        normalizarNotificaciones(
          prev.map((n) => {
            if (n.leidaEn) return n;
            if (n.destinatario !== destinatario) return n;
            if (clienteId != null && n.clienteId !== clienteId) return n;
            return { ...n, leidaEn: ahora };
          })
        )
      );
    },
    []
  );

  const borrarNotificaciones = useCallback(
    (destinatario: DestinatarioNotificacion, clienteId?: number) => {
      setNotificaciones((prev) =>
        normalizarNotificaciones(
          prev.filter((n) => {
            if (n.destinatario !== destinatario) return true;
            if (clienteId != null && n.clienteId !== clienteId) return true;
            return false;
          })
        )
      );
    },
    []
  );

  // Detecta cumpleaños del día y emite una notificación al admin (una por
  // cliente y por año). Sólo aplica del lado admin (no en el portal del
  // cliente, donde la lista está limitada al propio cliente).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (esRutaPortal()) return;
    if (!listaClientes.length) return;
    const hoy = new Date();
    const anioHoy = hoy.getFullYear();
    const mesHoy = hoy.getMonth();
    const diaHoy = hoy.getDate();
    for (const c of listaClientes) {
      if (esIngresoGeneralCliente(c)) continue;
      if (!c.activo) continue;
      const fecha = fechaNacimientoDeRFC(c.rfc, c.esPersonaMoral);
      if (!fecha) continue;
      if (fecha.mes !== mesHoy || fecha.dia !== diaHoy) continue;
      const yaNotificadoAdmin = notificaciones.some(
        (n) =>
          n.tipo === "admin_cumpleanos_cliente" &&
          n.destinatario === "admin" &&
          n.clienteId === c.id &&
          new Date(n.createdAt).getFullYear() === anioHoy
      );
      if (yaNotificadoAdmin) continue;
      agregarNotificacion({
        tipo: "admin_cumpleanos_cliente",
        destinatario: "admin",
        clienteId: c.id,
        periodo: { mes: mesHoy, anio: anioHoy },
        titulo: `🎂 Hoy cumple ${c.razonSocial}`,
        detalle: "Toca para felicitarlo con el correo de la casa. ¡No lo dejes pasar!",
        href: `/clientes#cliente=${c.id}`,
      });
    }
  }, [listaClientes, notificaciones, agregarNotificacion]);

  const notificacionesAdmin = useMemo(
    () =>
      [...notificaciones]
        .filter((n) => n.destinatario === "admin")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notificaciones]
  );

  const notificacionesAdminNoLeidas = useMemo(
    () => notificacionesAdmin.filter((n) => !n.leidaEn).length,
    [notificacionesAdmin]
  );

  const notificacionesCliente = useCallback(
    (clienteId: number) =>
      [...notificaciones]
        .filter((n) => n.destinatario === "cliente" && n.clienteId === clienteId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notificaciones]
  );

  const notificacionesClienteNoLeidas = useCallback(
    (clienteId: number) =>
      notificaciones.filter(
        (n) => n.destinatario === "cliente" && n.clienteId === clienteId && !n.leidaEn
      ).length,
    [notificaciones]
  );

  const nombreCliente = useCallback(
    (clienteId: number): string => {
      const c = listaClientes.find((x) => x.id === clienteId);
      return c?.razonSocial ?? `Cliente #${clienteId}`;
    },
    [listaClientes]
  );

  const actualizarCliente = useCallback(
    (cliente: Cliente) => {
      const conEstado = { ...cliente, estado: calcularEstado(cliente, periodoHoy) };
      setListaClientes((prev) =>
        prev.map((c) => (c.id === conEstado.id ? conEstado : c))
      );
      // Mantén sincronizado el snapshot del portal del cliente (si tiene
      // acceso). Esto NO bloquea el guardado local: si falla lo ignoramos.
      void (async () => {
        try {
          const { snapshotDeCliente } = await import("@/lib/portal/snapshot");
          await fetch("/api/portal/sincronizar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clienteId: conEstado.id,
              snapshot: snapshotDeCliente(conEstado),
            }),
          });
        } catch {
          // sin red / sin acceso al portal: el guardado local ya pasó
        }
      })();
    },
    [periodoHoy]
  );

  /**
   * Borra al cliente completamente: del CRM, de Supabase Auth (si tenía
   * acceso al portal) y de todos los módulos relacionados (comprobantes,
   * facturas, pagos, cumplimiento, historial, notificaciones).
   */
  const eliminarCliente = useCallback(
    async (clienteId: number) => {
      // 1. Quitar el acceso de Supabase Auth (si existe). Si falla no
      //    bloqueamos la limpieza local.
      try {
        await fetch("/api/portal/acceso", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clienteId }),
        });
      } catch {
        // ignorar: limpiamos local de todos modos
      }

      // 2. Limpieza local de todas las colecciones relacionadas.
      setListaClientes((prev) => prev.filter((c) => c.id !== clienteId));
      setComprobantes((prev) => prev.filter((c) => c.clienteId !== clienteId));
      setFacturas((prev) => prev.filter((f) => f.clienteId !== clienteId));
      setCumplimiento((prev) => prev.filter((r) => r.clienteId !== clienteId));
      setHistorialImpuestos((prev) =>
        prev.filter((h) => h.clienteId !== clienteId)
      );
      setNotificaciones((prev) =>
        prev.filter((n) => n.clienteId !== clienteId)
      );
      setRegistrosRepse((prev) => prev.filter((r) => r.clienteId !== clienteId));
      setEncargos((prev) => prev.filter((e) => e.clienteId !== clienteId));
    },
    []
  );

  const registrarPago = useCallback(
    (
      clienteId: number,
      periodoPago: Periodo,
      monto: number,
      nota?: string,
      opciones?: {
        enviarCorreo?: boolean;
        comprobanteId?: string;
        fechaPago?: string;
        metodoPago?: MetodoPago;
      }
    ): Cliente | null => {
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          actualizado = actualizarPagosCliente(
            c,
            periodoPago,
            monto,
            nota,
            opciones?.comprobanteId,
            opciones?.fechaPago,
            opciones?.metodoPago
          );
          return actualizado;
        })
      );
      setComprobantes((prev) =>
        prev.map((c) =>
          c.clienteId === clienteId &&
          c.mes === periodoPago.mes &&
          c.anio === periodoPago.anio
            ? { ...c, estado: "aceptado" as const, visto: true }
            : c
        )
      );
      if (actualizado && opciones?.enviarCorreo) {
        setTimeout(
          () =>
            void notificarClientePagoValidado(actualizado!, periodoPago, {
              montoPagado: monto,
            }),
          300
        );
      }
      return actualizado;
    },
    []
  );

  const quitarPago = useCallback(
    (clienteId: number, periodoPago: Periodo): Cliente | null => {
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          actualizado = actualizarPagosCliente(c, periodoPago, null);
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const registrarServicioAdicional = useCallback(
    (
      clienteId: number,
      periodoPago: Periodo,
      monto: number,
      concepto: string,
      nota?: string
    ): Cliente | null => {
      if (monto <= 0 || !concepto.trim()) return null;
      const anioStr = periodoAnioStr(periodoPago);
      const nuevoPago: PagoRealizado = {
        id: nuevoIdPagoAdicional(),
        mes: periodoPago.mes,
        anio: anioStr,
        monto,
        tipo: "adicional",
        concepto: concepto.trim(),
        ...(nota?.trim() ? { nota: nota.trim() } : {}),
      };
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          const pagosRealizados = [...c.pagosRealizados, nuevoPago];
          actualizado = {
            ...c,
            pagosRealizados,
            estado: calcularEstado({ ...c, pagosRealizados }, getPeriodoHoy()),
          };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const eliminarServicioAdicional = useCallback(
    (clienteId: number, pagoId: string): Cliente | null => {
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          const pagosRealizados = c.pagosRealizados.filter(
            (p) => !(p.tipo === "adicional" && p.id === pagoId)
          );
          if (pagosRealizados.length === c.pagosRealizados.length) return c;
          actualizado = {
            ...c,
            pagosRealizados,
            estado: calcularEstado({ ...c, pagosRealizados }, getPeriodoHoy()),
          };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const registrarIngresoDiverso = useCallback(
    (
      periodoPago: Periodo,
      monto: number,
      concepto?: string,
      nota?: string
    ): Cliente | null => {
      if (monto <= 0) return null;
      const anioStr = periodoAnioStr(periodoPago);
      // Se guarda como honorarios (es el ingreso propio de la bolsa) pero con
      // id, para poder tener varios movimientos por mes y borrarlos uno a uno.
      const nuevoPago: PagoRealizado = {
        id: nuevoIdPagoAdicional(),
        mes: periodoPago.mes,
        anio: anioStr,
        monto,
        tipo: "honorarios",
        ...(concepto?.trim() ? { concepto: concepto.trim() } : {}),
        ...(nota?.trim() ? { nota: nota.trim() } : {}),
        fechaPago: new Date().toISOString().slice(0, 10),
        metodoPago: "transferencia",
      };
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== ID_INGRESOS_DIVERSOS) return c;
          const pagosRealizados = [...c.pagosRealizados, nuevoPago];
          actualizado = {
            ...c,
            pagosRealizados,
            estado: calcularEstado({ ...c, pagosRealizados }, getPeriodoHoy()),
          };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const eliminarIngresoDiverso = useCallback(
    (pagoId: string): Cliente | null => {
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== ID_INGRESOS_DIVERSOS) return c;
          const pagosRealizados = c.pagosRealizados.filter(
            (p) => p.id !== pagoId
          );
          if (pagosRealizados.length === c.pagosRealizados.length) return c;
          actualizado = {
            ...c,
            pagosRealizados,
            estado: calcularEstado({ ...c, pagosRealizados }, getPeriodoHoy()),
          };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const agregarExtraEsperado = useCallback(
    (
      clienteId: number,
      concepto: string,
      montoTotal: number,
      periodo: Periodo,
      nota?: string
    ): Cliente | null => {
      if (montoTotal <= 0 || !concepto.trim()) return null;
      const nuevo: ExtraEsperado = {
        id: nuevoIdExtraEsperado(),
        concepto: concepto.trim(),
        montoTotal,
        periodoMes: periodo.mes,
        periodoAnio: periodoAnioStr(periodo),
        ...(nota?.trim() ? { nota: nota.trim() } : {}),
        creadoEn: new Date().toISOString(),
      };
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          const extrasEsperados = [...(c.extrasEsperados ?? []), nuevo];
          actualizado = { ...c, extrasEsperados };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const editarExtraEsperado = useCallback(
    (
      clienteId: number,
      extraId: string,
      datos: {
        concepto: string;
        montoTotal: number;
        periodo: Periodo;
        nota?: string;
      }
    ): Cliente | null => {
      if (datos.montoTotal <= 0 || !datos.concepto.trim()) return null;
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          const extrasEsperados = (c.extrasEsperados ?? []).map((e) => {
            if (e.id !== extraId) return e;
            const editado: ExtraEsperado = {
              ...e,
              concepto: datos.concepto.trim(),
              montoTotal: datos.montoTotal,
              periodoMes: datos.periodo.mes,
              periodoAnio: periodoAnioStr(datos.periodo),
            };
            const notaLimpia = datos.nota?.trim();
            if (notaLimpia) editado.nota = notaLimpia;
            else delete editado.nota;
            return editado;
          });
          actualizado = { ...c, extrasEsperados };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const eliminarExtraEsperado = useCallback(
    (clienteId: number, extraId: string): Cliente | null => {
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          const extrasEsperados = (c.extrasEsperados ?? []).filter(
            (e) => e.id !== extraId
          );
          if (extrasEsperados.length === (c.extrasEsperados ?? []).length)
            return c;
          const pagosRealizados = c.pagosRealizados.filter(
            (p) => p.extraEsperadoId !== extraId
          );
          actualizado = {
            ...c,
            extrasEsperados,
            pagosRealizados,
            estado: calcularEstado(
              { ...c, extrasEsperados, pagosRealizados },
              getPeriodoHoy()
            ),
          };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const registrarAbonoExtraEsperado = useCallback(
    (
      clienteId: number,
      extraId: string,
      periodoPago: Periodo,
      monto: number,
      nota?: string
    ): Cliente | null => {
      if (monto <= 0) return null;
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          const extra = (c.extrasEsperados ?? []).find((e) => e.id === extraId);
          if (!extra) return c;
          const abonado = c.pagosRealizados
            .filter(
              (p) => p.tipo === "adicional" && p.extraEsperadoId === extraId
            )
            .reduce((a, p) => a + p.monto, 0);
          const saldo = Math.max(0, extra.montoTotal - abonado);
          if (monto > saldo) return c;
          const anioStr = periodoAnioStr(periodoPago);
          const nuevoPago: PagoRealizado = {
            id: nuevoIdPagoAdicional(),
            mes: periodoPago.mes,
            anio: anioStr,
            monto,
            tipo: "adicional",
            concepto: extra.concepto,
            extraEsperadoId: extraId,
            ...(nota?.trim() ? { nota: nota.trim() } : {}),
            fechaPago: new Date().toISOString().slice(0, 10),
            metodoPago: "transferencia",
          };
          const pagosRealizados = [...c.pagosRealizados, nuevoPago];
          actualizado = {
            ...c,
            pagosRealizados,
            estado: calcularEstado({ ...c, pagosRealizados }, getPeriodoHoy()),
          };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  // ---- Centro de Recordatorios ----

  const marcarRecordatorio = useCallback(
    (
      clienteId: number,
      periodoPago: Periodo,
      tipo: TipoCorreoCobranza,
      via: ViaContacto
    ) => {
      const nueva: MarcaRecordatorio = {
        id: nuevoIdMarca(),
        clienteId,
        periodoKey: periodoKeyStr(periodoPago),
        tipo,
        via,
        contactadoEn: new Date().toISOString(),
      };
      setRecordatorioLog((prev) => [...prev, nueva]);
    },
    []
  );

  const quitarMarcaRecordatorioMes = useCallback(
    (clienteId: number, periodoKey: string) => {
      setRecordatorioLog((prev) =>
        prev.filter(
          (m) => !(m.clienteId === clienteId && m.periodoKey === periodoKey)
        )
      );
    },
    []
  );

  const agregarScriptCorreo = useCallback(
    (titulo: string, cuerpo: string): ScriptCorreo | null => {
      const t = titulo.trim();
      const c = cuerpo.trim();
      if (!t || !c) return null;
      const nuevo: ScriptCorreo = {
        id: nuevoIdScript(),
        titulo: t,
        cuerpo: c,
        creadoEn: new Date().toISOString(),
      };
      setScriptsCorreo((prev) => [nuevo, ...prev]);
      return nuevo;
    },
    []
  );

  const editarScriptCorreo = useCallback(
    (id: string, titulo: string, cuerpo: string) => {
      const t = titulo.trim();
      const c = cuerpo.trim();
      if (!t || !c) return;
      setScriptsCorreo((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, titulo: t, cuerpo: c, actualizadoEn: new Date().toISOString() }
            : s
        )
      );
    },
    []
  );

  const eliminarScriptCorreo = useCallback((id: string) => {
    setScriptsCorreo((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ---- Presupuestos ----
  const agregarPresupuesto = useCallback(
    (
      data: Omit<Presupuesto, "id" | "folio" | "creadoEn" | "estado"> &
        Partial<Pick<Presupuesto, "estado" | "folio">>
    ): Presupuesto => {
      const ahora = new Date().toISOString();
      let creado!: Presupuesto;
      setPresupuestos((prev) => {
        const folio = data.folio ?? siguienteFolio(prev);
        creado = {
          ...data,
          id: nuevoIdPresupuesto(),
          folio,
          estado: data.estado ?? "borrador",
          creadoEn: ahora,
          actualizadoEn: ahora,
        };
        return [creado, ...prev];
      });
      return creado;
    },
    []
  );

  const actualizarPresupuesto = useCallback(
    (id: string, cambios: Partial<Presupuesto>): Presupuesto | null => {
      let actualizado: Presupuesto | null = null;
      setPresupuestos((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          actualizado = {
            ...p,
            ...cambios,
            id: p.id,
            folio: cambios.folio ?? p.folio,
            actualizadoEn: new Date().toISOString(),
          };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const eliminarPresupuesto = useCallback((id: string) => {
    setPresupuestos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const asegurarTokenPresupuesto = useCallback((id: string): string => {
    let token = "";
    setPresupuestos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        token = p.token || nuevoTokenPublico();
        if (p.token) return p;
        return { ...p, token, actualizadoEn: new Date().toISOString() };
      })
    );
    return token;
  }, []);

  /**
   * Prepara un presupuesto para compartir por liga pública: le asigna token si
   * no tiene, lo marca como "enviado" si estaba en borrador y **persiste de
   * inmediato en la nube** (sin esperar el debounce) para que el link
   * `/p/[token]` lo encuentre al abrirse. Devuelve el token.
   */
  const prepararLigaPublica = useCallback(
    async (id: string): Promise<string> => {
      let token = "";
      let nuevos: Presupuesto[] = [];
      const ahora = new Date().toISOString();
      setPresupuestos((prev) => {
        nuevos = prev.map((p) => {
          if (p.id !== id) return p;
          token = p.token || nuevoTokenPublico();
          const estado = p.estado === "borrador" ? "enviado" : p.estado;
          return {
            ...p,
            token,
            estado,
            enviadoEn:
              p.enviadoEn ?? (estado === "enviado" ? ahora : p.enviadoEn),
            actualizadoEn: ahora,
          };
        });
        return nuevos;
      });

      // Guardado inmediato a la nube con el array recién calculado (evita el
      // ref desactualizado y el retraso del debounce de 800ms).
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      const base = estadoNubeRef.current;
      if (base) {
        setCloudSincronizando(true);
        try {
          // Solo sube la sección de presupuestos (no todo el estado).
          await guardarCrmEnNube({ ...base, presupuestos: nuevos }, ["presupuestos"]);
          setCloudSyncError(null);
          if (baselineRef.current) {
            baselineRef.current.presupuestos = JSON.stringify(nuevos);
          }
        } catch (e) {
          setCloudSyncError(
            e instanceof Error ? e.message : "Error al guardar en la nube."
          );
        } finally {
          setCloudSincronizando(false);
        }
      }
      return token;
    },
    []
  );

  const cambiarEstadoPresupuesto = useCallback(
    (id: string, estado: EstadoPresupuesto): Presupuesto | null => {
      let actualizado: Presupuesto | null = null;
      const ahora = new Date().toISOString();
      setPresupuestos((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const extra: Partial<Presupuesto> = {};
          if (estado === "enviado") extra.enviadoEn = ahora;
          if (estado === "aceptado") extra.aceptadoEn = ahora;
          if (estado === "rechazado") extra.rechazadoEn = ahora;
          actualizado = {
            ...p,
            ...extra,
            estado,
            actualizadoEn: ahora,
          };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const agregarServicioCatalogo = useCallback(
    (s: Omit<ServicioCatalogo, "id">): ServicioCatalogo => {
      const nuevo: ServicioCatalogo = { ...s, id: nuevoIdServicio() };
      setCatalogoServicios((prev) => {
        // Si todavía no se ha personalizado, partimos del catálogo default
        // para no perder los servicios base al agregar el primero.
        const base = prev.length ? prev : [...CATALOGO_DEFAULT];
        return [...base, nuevo];
      });
      return nuevo;
    },
    []
  );

  const editarServicioCatalogo = useCallback(
    (id: string, cambios: Partial<Omit<ServicioCatalogo, "id">>) => {
      setCatalogoServicios((prev) => {
        const base = prev.length ? prev : [...CATALOGO_DEFAULT];
        return base.map((s) => (s.id === id ? { ...s, ...cambios } : s));
      });
    },
    []
  );

  const eliminarServicioCatalogo = useCallback((id: string) => {
    setCatalogoServicios((prev) => {
      const base = prev.length ? prev : [...CATALOGO_DEFAULT];
      return base.filter((s) => s.id !== id);
    });
  }, []);

  const setPrecioRegimen = useCallback(
    (clave: RegimenClave, precio: number) => {
      const limpio = Math.max(0, Math.round(Number(precio) || 0));
      setPreciosRegimen((prev) => {
        const sin = prev.filter((p) => p.clave !== clave);
        return [...sin, { clave, precio: limpio }];
      });
    },
    []
  );

  const aplicarDescuento = useCallback(
    (
      clienteId: number,
      periodoPago: Periodo,
      datos: { tipo: "monto" | "porcentaje"; valor: number; motivo: string }
    ): Cliente | null => {
      if (datos.valor <= 0 || !datos.motivo.trim()) return null;
      const anioStr = periodoAnioStr(periodoPago);
      const ahora = new Date().toISOString();
      const nuevo: Descuento = {
        id: nuevoIdDescuento(),
        mes: periodoPago.mes,
        anio: anioStr,
        tipo: datos.tipo,
        valor: datos.valor,
        motivo: datos.motivo.trim(),
        aplicadoEn: ahora,
      };
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          // Reemplaza si ya hay descuento ese mes (un descuento activo por mes).
          const restantes = (c.descuentos ?? []).filter(
            (d) => !(d.mes === periodoPago.mes && d.anio === anioStr)
          );
          const descuentos = [...restantes, nuevo];
          actualizado = {
            ...c,
            descuentos,
            estado: calcularEstado({ ...c, descuentos }, getPeriodoHoy()),
          };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const eliminarDescuento = useCallback(
    (clienteId: number, descuentoId: string): Cliente | null => {
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          const descuentos = (c.descuentos ?? []).filter(
            (d) => d.id !== descuentoId
          );
          if (descuentos.length === (c.descuentos?.length ?? 0)) return c;
          actualizado = {
            ...c,
            descuentos,
            estado: calcularEstado({ ...c, descuentos }, getPeriodoHoy()),
          };
          return actualizado;
        })
      );
      return actualizado;
    },
    []
  );

  const getComprobantePeriodo = useCallback(
    (clienteId: number, p: Periodo) => findComprobante(comprobantes, clienteId, p),
    [comprobantes]
  );

  const getComprobantesCliente = useCallback(
    (clienteId: number) => listarComprobantesCliente(comprobantes, clienteId),
    [comprobantes]
  );

  const getComprobantesExtra = useCallback(
    (clienteId: number, extraEsperadoId: string) =>
      listarComprobantesExtra(comprobantes, clienteId, extraEsperadoId),
    [comprobantes]
  );

  const subirComprobante = useCallback(
    (
      clienteId: number,
      periodos: Periodo[],
      archivo: ArchivoAdjunto
    ): ComprobantePago => {
      if (periodos.length === 0) {
        throw new Error("Debe declarar al menos un periodo para el comprobante.");
      }
      const primero = periodos[0];
      const nuevo: ComprobantePago = {
        id: nuevoIdComprobante(),
        clienteId,
        mes: primero.mes,
        anio: primero.anio,
        periodos,
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        dataUrl: archivo.dataUrl,
        subidoEn: new Date().toISOString(),
        visto: false,
        estado: "pendiente",
      };
      // Multi-comprobante: NO borramos los anteriores. El cliente puede subir varios.
      setComprobantes((prev) => [...prev, nuevo]);
      const labels = periodos
        .map((p) => periodoLabel(p))
        .join(", ");
      agregarNotificacion({
        tipo: "cobranza_cliente_subio_comprobante",
        destinatario: "admin",
        clienteId,
        periodo: primero,
        titulo: `💸 ${nombreCliente(clienteId)} subió comprobante · ${labels}`,
        detalle: "Ábrelo, revísalo y valida el pago para cerrar el ciclo.",
        href: `/cobranza?cliente=${clienteId}&filtro=comprobantes&revisar=1`,
      });
      return nuevo;
    },
    [agregarNotificacion, nombreCliente]
  );

  const subirComprobanteExtra = useCallback(
    (
      clienteId: number,
      extraEsperadoId: string,
      periodoPago: Periodo,
      monto: number,
      archivo: ArchivoAdjunto
    ): ComprobantePago => {
      if (monto <= 0) {
        throw new Error("El monto del comprobante debe ser mayor a cero.");
      }
      const cli = listaClientes.find((c) => c.id === clienteId);
      const extra = (cli?.extrasEsperados ?? []).find(
        (e) => e.id === extraEsperadoId
      );
      const nuevo: ComprobantePago = {
        id: nuevoIdComprobante(),
        clienteId,
        mes: periodoPago.mes,
        anio: periodoPago.anio,
        periodos: [periodoPago],
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        dataUrl: archivo.dataUrl,
        subidoEn: new Date().toISOString(),
        visto: false,
        estado: "pendiente",
        extraEsperadoId,
        montoDeclarado: monto,
        conceptoExtra: extra?.concepto,
      };
      setComprobantes((prev) => [...prev, nuevo]);
      agregarNotificacion({
        tipo: "cobranza_cliente_subio_comprobante",
        destinatario: "admin",
        clienteId,
        periodo: periodoPago,
        titulo: `💸 ${nombreCliente(clienteId)} subió comprobante · ${
          extra?.concepto ?? "Trabajo adicional"
        }`,
        detalle:
          "Es un abono a trabajo adicional. Revísalo y valídalo para aplicar el pago.",
        href: `/cobranza?cliente=${clienteId}&filtro=comprobantes&revisar=1`,
      });
      return nuevo;
    },
    [agregarNotificacion, nombreCliente, listaClientes]
  );

  const marcarComprobanteVisto = useCallback((id: string) => {
    setComprobantes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visto: true } : c))
    );
  }, []);

  const validarComprobanteExtra = useCallback(
    (comprobanteId: string): ComprobantePago | null => {
      const comp = comprobantes.find((c) => c.id === comprobanteId);
      if (!comp || !comp.extraEsperadoId || comp.estado === "aceptado") {
        return null;
      }
      const monto = comp.montoDeclarado ?? 0;
      const abono = registrarAbonoExtraEsperado(
        comp.clienteId,
        comp.extraEsperadoId,
        { mes: comp.mes, anio: Number(comp.anio) },
        monto,
        "Abono validado desde comprobante del cliente."
      );
      if (!abono) return null;
      let actualizado: ComprobantePago | null = null;
      setComprobantes((prev) => {
        const next = prev.map((c) =>
          c.id === comprobanteId
            ? { ...c, estado: "aceptado" as const, visto: true }
            : c
        );
        actualizado = next.find((c) => c.id === comprobanteId) ?? null;
        return next;
      });
      agregarNotificacion({
        tipo: "cobranza_pago_validado",
        destinatario: "cliente",
        clienteId: comp.clienteId,
        periodo: { mes: comp.mes, anio: Number(comp.anio) },
        titulo: `🎉 ¡Tu pago de ${
          comp.conceptoExtra ?? "trabajo adicional"
        } fue validado!`,
        detalle: "Aplicamos tu abono. ¡Gracias por tu confianza!",
        href: "/portal/honorarios",
      });
      return actualizado;
    },
    [comprobantes, registrarAbonoExtraEsperado, agregarNotificacion]
  );

  const validarComprobantePago = useCallback(
    async (
      comprobanteId: string,
      opciones?: {
        enviarCorreo?: boolean;
        clienteActualizado?: Cliente;
        correoOpciones?: OpcionesCorreoEvento;
      }
    ): Promise<{
      comprobante: ComprobantePago | null;
      correo?: ResultadoEnvioCorreoEvento;
    }> => {
      let actualizado: ComprobantePago | null = null;
      let yaEstabaValidado = false;
      let snapshot: ComprobantePago | undefined;
      setComprobantes((prev) => {
        const existente = prev.find((c) => c.id === comprobanteId);
        if (!existente) return prev;
        snapshot = existente;
        yaEstabaValidado = existente.estado === "aceptado";
        const next = prev.map((c) =>
          c.id === existente.id
            ? { ...c, estado: "aceptado" as const, visto: true }
            : c
        );
        actualizado = next.find((c) => c.id === existente.id) ?? null;
        return next;
      });
      if (actualizado && !yaEstabaValidado && snapshot) {
        const periodoNotif = snapshot.periodos[0] ?? {
          mes: snapshot.mes,
          anio: Number(snapshot.anio),
        };
        agregarNotificacion({
          tipo: "cobranza_pago_validado",
          destinatario: "cliente",
          clienteId: snapshot.clienteId,
          periodo: periodoNotif,
          titulo: `🎉 ¡Tu pago de ${periodoLabel(periodoNotif)} fue validado!`,
          detalle:
            "Gracias por tu confianza. En un momento tu factura estará lista en tu portal.",
          href: "/portal/honorarios",
        });
        notificarCierreSiCorresponde(snapshot.clienteId, periodoNotif);

        const debeEnviarCorreo = opciones?.enviarCorreo !== false;
        let correo: ResultadoEnvioCorreoEvento | undefined;
        if (debeEnviarCorreo) {
          const client =
            opciones?.clienteActualizado ??
            listaClientes.find((c) => c.id === snapshot!.clienteId);
          if (client?.email?.trim()) {
            const ligados = client.pagosRealizados.filter(
              (p) => p.comprobanteId === comprobanteId
            );
            const distribucionDesdePagos = ligados.map((p) => ({
              periodo: { mes: p.mes, anio: Number(p.anio) },
              monto: p.monto,
            }));
            const totalDesdePagos = distribucionDesdePagos.reduce(
              (s, d) => s + d.monto,
              0
            );
            const correoOpciones: OpcionesCorreoEvento =
              opciones?.correoOpciones ??
              (distribucionDesdePagos.length > 0
                ? {
                    montoPagado: totalDesdePagos,
                    distribucion: distribucionDesdePagos,
                  }
                : {});
            const periodoCorreo =
              opciones?.correoOpciones?.distribucion?.[0]?.periodo ??
              periodoNotif;
            correo = await notificarClientePagoValidado(
              client,
              periodoCorreo,
              correoOpciones
            );
          }
        }
        return { comprobante: actualizado, correo };
      }
      return { comprobante: actualizado };
    },
    [agregarNotificacion, notificarCierreSiCorresponde, listaClientes]
  );

  /** Quita todos los pagos del cliente que fueron registrados desde el comprobante indicado. */
  const removerPagosDelComprobante = useCallback(
    (clienteId: number, comprobanteId: string) => {
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          const restantes = c.pagosRealizados.filter(
            (p) => p.comprobanteId !== comprobanteId
          );
          if (restantes.length === c.pagosRealizados.length) return c;
          return {
            ...c,
            pagosRealizados: restantes,
            estado: calcularEstado(
              { ...c, pagosRealizados: restantes },
              periodoHoy
            ),
          };
        })
      );
    },
    [periodoHoy]
  );

  const revertirValidacionComprobante = useCallback(
    (
      comprobanteId: string,
      opciones?: { revertirPagosVinculados?: boolean }
    ): ComprobantePago | null => {
      let actualizado: ComprobantePago | null = null;
      let snapshot: ComprobantePago | null = null;
      setComprobantes((prev) => {
        const existente = prev.find((c) => c.id === comprobanteId);
        if (!existente || existente.estado !== "aceptado") return prev;
        snapshot = existente;
        const next = prev.map((c) =>
          c.id === existente.id ? { ...c, estado: "pendiente" as const } : c
        );
        actualizado = next.find((c) => c.id === existente.id) ?? null;
        return next;
      });
      if (snapshot && opciones?.revertirPagosVinculados !== false) {
        removerPagosDelComprobante(
          (snapshot as ComprobantePago).clienteId,
          (snapshot as ComprobantePago).id
        );
      }
      return actualizado;
    },
    [removerPagosDelComprobante]
  );

  const eliminarComprobantePagoHonorarios = useCallback(
    (
      comprobanteId: string,
      opciones?: { notificarCliente?: boolean; revertirPagosVinculados?: boolean }
    ) => {
      let snapshot: ComprobantePago | null = null;
      setComprobantes((prev) => {
        const existente = prev.find((c) => c.id === comprobanteId);
        if (!existente) return prev;
        snapshot = existente;
        return prev.filter((c) => c.id !== comprobanteId);
      });
      if (snapshot && opciones?.revertirPagosVinculados !== false) {
        removerPagosDelComprobante(
          (snapshot as ComprobantePago).clienteId,
          (snapshot as ComprobantePago).id
        );
      }
      if (snapshot && opciones?.notificarCliente !== false) {
        const periodoNotif = (snapshot as ComprobantePago).periodos[0];
        agregarNotificacion({
          tipo: "cobranza_comprobante_rechazado",
          destinatario: "cliente",
          clienteId: (snapshot as ComprobantePago).clienteId,
          periodo: periodoNotif,
          titulo: `📎 Ups, necesitamos otro comprobante de ${periodoLabel(periodoNotif)}`,
          detalle:
            "El archivo anterior no nos abrió bien. Súbenos uno actualizado y lo aplicamos enseguida.",
          href: "/portal/honorarios",
        });
      }
    },
    [agregarNotificacion, removerPagosDelComprobante]
  );

  const getFacturaPeriodo = useCallback(
    (clienteId: number, p: Periodo) => findFactura(facturas, clienteId, p),
    [facturas]
  );

  const subirFactura = useCallback(
    (
      clienteId: number,
      p: Periodo,
      archivo: ArchivoAdjunto,
      monto?: number
    ): FacturaPago => {
      const nuevo: FacturaPago = {
        id: nuevoIdFactura(),
        clienteId,
        mes: p.mes,
        anio: p.anio,
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        dataUrl: archivo.dataUrl,
        subidoEn: new Date().toISOString(),
        ...(typeof monto === "number" && monto > 0 ? { monto } : {}),
      };
      setFacturas((prev) => [
        ...prev.filter(
          (f) =>
            !(
              f.clienteId === clienteId &&
              f.mes === p.mes &&
              f.anio === p.anio
            )
        ),
        nuevo,
      ]);
      agregarNotificacion({
        tipo: "cobranza_factura_disponible",
        destinatario: "cliente",
        clienteId,
        periodo: p,
        titulo: `🧾 ¡Tu factura de ${periodoLabel(p)} ya está lista!`,
        detalle: "Pasa a tu portal cuando gustes a descargarla. Gracias por tu confianza.",
        href: "/portal/honorarios",
      });
      notificarCierreSiCorresponde(clienteId, p);
      return nuevo;
    },
    [agregarNotificacion, notificarCierreSiCorresponde]
  );

  const eliminarFactura = useCallback((id: string) => {
    setFacturas((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const getCumplimientoPeriodo = useCallback(
    (clienteId: number, p: Periodo) =>
      findCumplimiento(cumplimiento, clienteId, p),
    [cumplimiento]
  );

  const upsertCumplimiento = useCallback(
    (
      prev: RegistroCumplimiento[],
      clienteId: number,
      p: Periodo,
      patch: Partial<RegistroCumplimiento>
    ): RegistroCumplimiento[] => {
      const existente = findCumplimiento(prev, clienteId, p);
      const ahora = new Date().toISOString();
      if (existente) {
        return prev.map((r) =>
          r.id === existente.id
            ? { ...r, ...patch, actualizadoEn: ahora }
            : r
        );
      }
      const vacio = bloquesVacios();
      const nuevo: RegistroCumplimiento = {
        id: nuevoIdCumplimiento(),
        clienteId,
        mes: p.mes,
        anio: p.anio,
        montoImpuesto: patch.montoImpuesto ?? 0,
        fechaLimite: patch.fechaLimite ?? "",
        aplicaImss: patch.aplicaImss ?? false,
        federales: patch.federales ?? vacio.federales,
        imss: patch.imss ?? vacio.imss,
        estatales: patch.estatales ?? vacio.estatales,
        otros: patch.otros ?? [],
        actualizadoEn: ahora,
        ...patch,
      };
      return [...prev, nuevo];
    },
    []
  );

  const aplicarDocumentoEnRegistro = (
    base: RegistroCumplimiento,
    tipo: TipoDocumentoSingular,
    doc: RegistroCumplimiento["federales"]["declaracion"],
    lineaId?: string,
    slotIndex?: number
  ): RegistroCumplimiento => {
    const r = asegurarBloques({ ...base });

    const ponerEnSlot = (
      arr: NonNullable<RegistroCumplimiento["federales"]["declaracion"]>[],
      archivo: NonNullable<typeof doc>
    ) => {
      const next = [...arr];
      const slot =
        slotIndex !== undefined
          ? slotIndex
          : next.length < MAX_PDF_EMA_EBA
            ? next.length
            : MAX_PDF_EMA_EBA - 1;
      if (slot >= 0 && slot < MAX_PDF_EMA_EBA) {
        if (slot < next.length) next[slot] = archivo;
        else next.push(archivo);
      }
      return next.slice(0, MAX_PDF_EMA_EBA);
    };

    if (tipo === "declaracion") {
      r.federales = { ...r.federales, declaracion: doc };
    } else if (tipo === "ema" && doc) {
      r.imss = { ...r.imss, ema: ponerEnSlot(r.imss.ema, doc) };
    } else if (tipo === "eba" && doc) {
      r.imss = { ...r.imss, eba: ponerEnSlot(r.imss.eba, doc) };
    } else if (tipo === "sipare" || tipo === "imss") {
      r.imss = { ...r.imss, sipare: doc };
    } else if (tipo === "impuestos") {
      // Siempre una sola línea de captura SAT (desglose en conceptos).
      const consolidadas = consolidarFederalesLineasCaptura(r.federales.lineasCaptura);
      const baseLinea = consolidadas[0] ?? {
        id: nuevoIdLinea(),
        etiqueta: "Línea de captura",
        monto: 0,
        fechaLimite: r.fechaLimite,
      };
      r.federales = {
        ...r.federales,
        lineasCaptura: [{ ...baseLinea, documento: doc }],
      };
    } else if (tipo === "estatales") {
      const lineas = [...r.estatales.lineasCaptura];
      const idx = lineaId
        ? lineas.findIndex((l) => l.id === lineaId)
        : lineas.findIndex((l) => !l.documento);
      if (idx >= 0) {
        lineas[idx] = { ...lineas[idx], documento: doc };
      } else {
        lineas.push({
          id: nuevoIdLinea(),
          etiqueta: "Impuesto 3% nómina",
          monto: r.estatales.monto,
          fechaLimite: r.estatales.fechaLimite,
          documento: doc,
        });
      }
      r.estatales = { ...r.estatales, lineasCaptura: lineas };
    } else if (tipo === "otros" && doc) {
      r.otros = [...r.otros, doc];
    }
    r.montoImpuesto = getTotalImpuestos(r);
    r.fechaLimite = getFechaLimitePrincipal(r);
    r.aplicaImss = r.imss.activo;
    return r;
  };

  const subirDocumentoCumplimiento = useCallback(
    (
      clienteId: number,
      p: Periodo,
      tipo: TipoDocumentoSingular,
      archivo: ArchivoAdjunto,
      _metadata?: MetadataCumplimiento,
      lineaId?: string,
      slotIndex?: number
    ): RegistroCumplimiento => {
      const doc = {
        id: nuevoIdDocumento(),
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        dataUrl: archivo.dataUrl,
        subidoEn: new Date().toISOString(),
      };
      let resultado: RegistroCumplimiento | undefined;
      let categoriasReciensCompletadas: CategoriaId[] = [];
      let cierreSinPago = false;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        const ahora = new Date().toISOString();
        if (!existente) {
          const vacio = bloquesVacios();
          const nuevo = aplicarDocumentoEnRegistro(
            {
              id: nuevoIdCumplimiento(),
              clienteId,
              mes: p.mes,
              anio: p.anio,
              montoImpuesto: 0,
              fechaLimite: "",
              aplicaImss: false,
              federales: vacio.federales,
              imss: vacio.imss,
              estatales: vacio.estatales,
              otros: [],
              actualizadoEn: ahora,
            },
            tipo,
            doc,
            lineaId,
            slotIndex
          );
          nuevo.actualizadoEn = ahora;
          resultado = nuevo;
          categoriasReciensCompletadas = (
            ["federales", "imss", "estatales"] as CategoriaId[]
          ).filter((cat) => categoriaTieneAlgunDocumento(nuevo, cat));
          return [...prev, nuevo];
        }
        const actualizado = aplicarDocumentoEnRegistro(
          existente,
          tipo,
          doc,
          lineaId,
          slotIndex
        );
        actualizado.actualizadoEn = ahora;
        const next = prev.map((r) => (r.id === existente.id ? actualizado : r));
        resultado = actualizado;
        const yaCerradoSinPagoAntes =
          !!existente.sinPagoImpuestos &&
          categoriaTieneAlgunDocumento(existente, "federales");
        cierreSinPago =
          !!actualizado.sinPagoImpuestos &&
          tipo === "declaracion" &&
          categoriaTieneAlgunDocumento(actualizado, "federales") &&
          !yaCerradoSinPagoAntes;
        categoriasReciensCompletadas = (
          ["federales", "imss", "estatales"] as CategoriaId[]
        ).filter(
          (cat) =>
            categoriaTieneAlgunDocumento(actualizado, cat) &&
            !categoriaTieneAlgunDocumento(existente, cat)
        );
        return next;
      });
      const nombre = nombreCliente(clienteId);
      if (cierreSinPago) {
        agregarNotificacion({
          tipo: "admin_sin_pago",
          destinatario: "cliente",
          clienteId,
          periodo: p,
        titulo: `🎯 ¡${periodoLabel(p)} cerrado al corriente!`,
        detalle:
          "No hubo impuestos a cargo. Ya subimos tu declaración a tu portal. Tranquilidad total.",
          href: "/portal/cumplimiento",
        });
        agregarNotificacion({
          tipo: "admin_sin_pago",
          destinatario: "admin",
          clienteId,
          periodo: p,
        titulo: `🎯 Cerrado en ceros · ${nombre} · ${periodoLabel(p)}`,
        detalle: "Declaración subida. Flujo marcado como completado.",
          href: "/cumplimiento",
        });
        notificarCierreSiCorresponde(clienteId, p);
      } else {
        for (const cat of categoriasReciensCompletadas) {
          agregarNotificacion({
            tipo: "admin_documentos_listos",
            destinatario: "cliente",
            clienteId,
            periodo: p,
            categoria: cat,
            titulo: `📑 Listos los documentos de ${CATEGORIA_META[cat].label} · ${periodoLabel(p)}`,
            detalle: "Ya puedes pagar y subirnos el comprobante por tu portal. Cualquier duda, aquí estamos.",
            href: "/portal/cumplimiento",
          });
          agregarNotificacion({
            tipo: "admin_documentos_listos",
            destinatario: "admin",
            clienteId,
            periodo: p,
            categoria: cat,
            titulo: `📑 Docs publicados · ${nombre} · ${CATEGORIA_META[cat].label} ${periodoLabel(p)}`,
            detalle: "El cliente ya puede verlos y subir su comprobante.",
            href: "/cumplimiento",
          });
        }
      }
      return resultado!;
    },
    [agregarNotificacion, nombreCliente, notificarCierreSiCorresponde]
  );

  const actualizarMetadataCumplimiento = useCallback(
    (
      clienteId: number,
      p: Periodo,
      metadata: MetadataCumplimiento
    ): RegistroCumplimiento | null => {
      let resultado: RegistroCumplimiento | null = null;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente) return prev;
        const next = upsertCumplimiento(prev, clienteId, p, {
          montoImpuesto: metadata.montoImpuesto,
          fechaLimite: metadata.fechaLimite,
        });
        resultado = findCumplimiento(next, clienteId, p) ?? null;
        return next;
      });
      return resultado;
    },
    [upsertCumplimiento]
  );

  const eliminarDocumentoCumplimiento = useCallback(
    (
      clienteId: number,
      p: Periodo,
      tipo: TipoDocumentoSingular,
      lineaId?: string,
      slotIndex?: number
    ) => {
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente) return prev;
        let actualizado = asegurarBloques({ ...existente });
        if (tipo === "declaracion") {
          actualizado.federales = { ...actualizado.federales, declaracion: undefined };
        } else if (tipo === "ema") {
          actualizado.imss = {
            ...actualizado.imss,
            ema:
              slotIndex !== undefined
                ? actualizado.imss.ema.filter((_, i) => i !== slotIndex)
                : [],
          };
        } else if (tipo === "eba") {
          actualizado.imss = {
            ...actualizado.imss,
            eba:
              slotIndex !== undefined
                ? actualizado.imss.eba.filter((_, i) => i !== slotIndex)
                : [],
          };
        } else if (tipo === "sipare" || tipo === "imss") {
          actualizado.imss = { ...actualizado.imss, sipare: undefined };
        } else if (tipo === "impuestos") {
          const consolidadas = consolidarFederalesLineasCaptura(
            actualizado.federales.lineasCaptura
          );
          actualizado.federales = {
            ...actualizado.federales,
            lineasCaptura: consolidadas.map((l) => ({
              ...l,
              documento: undefined,
            })),
          };
        } else if (tipo === "estatales") {
          actualizado.estatales = {
            ...actualizado.estatales,
            lineasCaptura: actualizado.estatales.lineasCaptura.map((l) =>
              !lineaId || l.id === lineaId ? { ...l, documento: undefined } : l
            ),
          };
        }
        actualizado.actualizadoEn = new Date().toISOString();
        if (!registroPersistible(actualizado)) {
          return prev.filter((r) => r.id !== existente.id);
        }
        return prev.map((r) => (r.id === existente.id ? actualizado : r));
      });
    },
    []
  );

  const eliminarPreviewImpuestos = useCallback((clienteId: number, p: Periodo) => {
    setCumplimiento((prev) => {
      const next = prev.filter(
        (r) =>
          !(
            r.clienteId === clienteId &&
            r.mes === p.mes &&
            r.anio === p.anio
          )
      );
      return next;
    });
  }, []);

  const agregarArchivoNomina = useCallback(
    (clienteId: number, p: Periodo, archivo: ArchivoAdjunto): RegistroCumplimiento => {
      const doc = {
        id: nuevoIdDocumento(),
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        dataUrl: archivo.dataUrl,
        subidoEn: new Date().toISOString(),
      };
      let resultado: RegistroCumplimiento | undefined;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        const vacio = bloquesVacios();
        const base = existente
          ? asegurarBloques(existente)
          : ({
              id: nuevoIdCumplimiento(),
              clienteId,
              mes: p.mes,
              anio: p.anio,
              montoImpuesto: 0,
              fechaLimite: "",
              aplicaImss: false,
              federales: vacio.federales,
              imss: vacio.imss,
              estatales: vacio.estatales,
              otros: [],
              actualizadoEn: new Date().toISOString(),
            } satisfies RegistroCumplimiento);
        const actualizado: RegistroCumplimiento = {
          ...base,
          estatales: {
            ...base.estatales,
            nominas: [...base.estatales.nominas, doc],
          },
          actualizadoEn: new Date().toISOString(),
        };
        const next = existente
          ? prev.map((r) => (r.id === existente.id ? actualizado : r))
          : [...prev, actualizado];
        resultado = actualizado;
        return next;
      });
      return resultado!;
    },
    []
  );

  const eliminarArchivoNomina = useCallback(
    (clienteId: number, p: Periodo, archivoId: string) => {
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente) return prev;
        const base = asegurarBloques(existente);
        const actualizado: RegistroCumplimiento = {
          ...base,
          estatales: {
            ...base.estatales,
            nominas: base.estatales.nominas.filter((d) => d.id !== archivoId),
          },
          actualizadoEn: new Date().toISOString(),
        };
        if (!registroPersistible(actualizado)) {
          return prev.filter((r) => r.id !== existente.id);
        }
        return prev.map((r) => (r.id === existente.id ? actualizado : r));
      });
    },
    []
  );

  const agregarDocumentoOtros = useCallback(
    (clienteId: number, p: Periodo, archivo: ArchivoAdjunto): RegistroCumplimiento => {
      return subirDocumentoCumplimiento(clienteId, p, "otros", archivo);
    },
    [subirDocumentoCumplimiento]
  );

  const eliminarDocumentoOtros = useCallback(
    (clienteId: number, p: Periodo, archivoId: string) => {
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente) return prev;
        const base = asegurarBloques(existente);
        const actualizado: RegistroCumplimiento = {
          ...base,
          otros: base.otros.filter((d) => d.id !== archivoId),
          actualizadoEn: new Date().toISOString(),
        };
        if (!registroPersistible(actualizado)) {
          return prev.filter((r) => r.id !== existente.id);
        }
        return prev.map((r) => (r.id === existente.id ? actualizado : r));
      });
    },
    []
  );

  const publicarPreviewImpuestos = useCallback(
    (clienteId: number, p: Periodo, datos: PreviewImpuestosInput): RegistroCumplimiento => {
      const ahora = new Date().toISOString();
      const cliente = listaClientes.find((c) => c.id === clienteId);
      const cats = cliente ? categoriasHabilitadasCliente(cliente) : (["federales", "imss", "estatales"] as CategoriaId[]);
      let resultado: RegistroCumplimiento | undefined;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        const republicar = !!existente?.clienteConfirmoPreviewEn;
        const base = existente ? asegurarBloques(existente) : null;
        const vacio = bloquesVacios();

        const federales = {
          declaracion: republicar ? undefined : base?.federales.declaracion,
          lineasCaptura: cats.includes("federales") && datos.federales.length > 0
            ? (() => {
                const conceptos = datos.federales.map((l) => ({
                  etiqueta: l.etiqueta.trim() || "Impuestos federales",
                  monto: l.monto,
                }));
                const total = conceptos.reduce((s, c) => s + c.monto, 0);
                const fechaLimite =
                  datos.federales.find((l) => l.fechaLimite.trim())?.fechaLimite.trim() ??
                  "";
                // Una sola línea de captura SAT: se preserva el PDF si ya existía.
                const docPrevio =
                  !republicar
                    ? base?.federales.lineasCaptura.find((x) => !!x.documento)?.documento
                    : undefined;
                const idPrevio = base?.federales.lineasCaptura[0]?.id;
                return [
                  {
                    id: idPrevio && !republicar ? idPrevio : nuevoIdLinea(),
                    etiqueta: "Línea de captura",
                    monto: total,
                    fechaLimite,
                    conceptos,
                    documento: docPrevio,
                  },
                ];
              })()
            : [],
        };

        const imssActivo = cats.includes("imss") && datos.imss.activo;
        const imss = {
          activo: imssActivo,
          monto: imssActivo ? datos.imss.monto : 0,
          fechaLimite: imssActivo ? datos.imss.fechaLimite : "",
          ema: republicar ? [] : base?.imss.ema ?? [],
          eba: republicar ? [] : base?.imss.eba ?? [],
          sipare: republicar ? undefined : base?.imss.sipare,
        };

        const estatalesActivo = cats.includes("estatales") && datos.estatales.activo;
        let estatalesLineas = republicar ? [] : base?.estatales.lineasCaptura ?? [];
        if (
          estatalesActivo &&
          datos.estatales.monto > 0 &&
          datos.estatales.fechaLimite &&
          estatalesLineas.length === 0
        ) {
          estatalesLineas = [
            {
              id: nuevoIdLinea(),
              etiqueta: "Impuestos estatales",
              monto: datos.estatales.monto,
              fechaLimite: datos.estatales.fechaLimite,
            },
          ];
        }
        const estatales = {
          activo: estatalesActivo,
          monto: estatalesActivo ? datos.estatales.monto : 0,
          fechaLimite: estatalesActivo ? datos.estatales.fechaLimite : "",
          nominas: republicar ? [] : base?.estatales.nominas ?? [],
          lineasCaptura: estatalesLineas,
        };

        const actualizado: RegistroCumplimiento = {
          ...(base ?? {}),
          id: existente?.id ?? nuevoIdCumplimiento(),
          clienteId,
          mes: p.mes,
          anio: p.anio,
          federales,
          imss,
          estatales,
          otros: republicar ? [] : base?.otros ?? [],
          montoImpuesto: 0,
          fechaLimite: "",
          aplicaImss: imssActivo,
          extemporaneo: republicar ? {} : base?.extemporaneo ?? {},
          previewPublicadoEn: ahora,
          previewNotificadoEn: existente?.previewNotificadoEn,
          clienteConfirmoPreviewEn: republicar
            ? undefined
            : existente?.clienteConfirmoPreviewEn,
          previewValidacionCategorias: republicar
            ? undefined
            : existente?.previewValidacionCategorias,
          comprobantePago: republicar ? undefined : existente?.comprobantePago,
          comprobantePagoSubidoEn: republicar
            ? undefined
            : existente?.comprobantePagoSubidoEn,
          comprobantePagoCategorias: republicar
            ? {}
            : existente?.comprobantePagoCategorias,
          comprobantePagoCategoriasSubidoEn: republicar
            ? {}
            : existente?.comprobantePagoCategoriasSubidoEn,
          pagoValidadoCategorias: republicar
            ? {}
            : existente?.pagoValidadoCategorias,
          notificadoEn: republicar ? undefined : existente?.notificadoEn,
          actualizadoEn: ahora,
        };

        const conTotales = asegurarBloques(actualizado);
        conTotales.montoImpuesto = getTotalImpuestos(conTotales);
        conTotales.fechaLimite = getFechaLimitePrincipal(conTotales);

        const next = existente
          ? prev.map((r) => (r.id === existente.id ? conTotales : r))
          : [...prev, conTotales];
        resultado = conTotales;
        return next;
      });
      const nombre = nombreCliente(clienteId);
      agregarNotificacion({
        tipo: "admin_previo_publicado",
        destinatario: "cliente",
        clienteId,
        periodo: p,
        titulo: `📊 Tu preliminar de ${periodoLabel(p)} ya está listo`,
        detalle: "Pásate a revisarlo y confírmanos cada categoría. En cuanto valides seguimos con los pagos.",
        href: "/portal/cumplimiento",
      });
      agregarNotificacion({
        tipo: "admin_previo_publicado",
        destinatario: "admin",
        clienteId,
        periodo: p,
      titulo: `📊 Preliminar publicado · ${nombre} · ${periodoLabel(p)}`,
      detalle: "Esperando que el cliente lo valide.",
        href: "/cumplimiento",
      });
      return resultado!;
    },
    [listaClientes, agregarNotificacion, nombreCliente]
  );

  const marcarPreviewNotificado = useCallback((clienteId: number, p: Periodo) => {
    setCumplimiento((prev) => {
      const existente = findCumplimiento(prev, clienteId, p);
      if (!existente) return prev;
      return prev.map((r) =>
        r.id === existente.id
          ? { ...r, previewNotificadoEn: new Date().toISOString() }
          : r
      );
    });
  }, []);

  const marcarContabilidadIniciada = useCallback(
    (clienteId: number, p: Periodo) => {
      const ahora = new Date().toISOString();
      let yaEstaba = false;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (existente) {
          yaEstaba = !!existente.contabilidadIniciadaEn;
          if (yaEstaba) return prev;
          return prev.map((r) =>
            r.id === existente.id
              ? {
                  ...r,
                  contabilidadIniciadaEn: ahora,
                  actualizadoEn: ahora,
                }
              : r
          );
        }
        const vacio = bloquesVacios();
        const nuevo: RegistroCumplimiento = {
          id: nuevoIdCumplimiento(),
          clienteId,
          mes: p.mes,
          anio: p.anio,
          montoImpuesto: 0,
          fechaLimite: "",
          aplicaImss: false,
          federales: vacio.federales,
          imss: vacio.imss,
          estatales: vacio.estatales,
          otros: [],
          contabilidadIniciadaEn: ahora,
          actualizadoEn: ahora,
        };
        return [...prev, nuevo];
      });
      if (yaEstaba) return;
      const nombre = nombreCliente(clienteId);
      agregarNotificacion({
        tipo: "admin_contabilidad_iniciada",
        destinatario: "cliente",
        clienteId,
        periodo: p,
        titulo: `⚙️ Ya estamos trabajando en tu contabilidad de ${periodoLabel(p)}`,
        detalle:
          "Pronto tendrás listo el preliminar para que revisemos juntos cuánto pagas este mes.",
        href: "/portal/cumplimiento",
      });
      agregarNotificacion({
        tipo: "admin_contabilidad_iniciada",
        destinatario: "admin",
        clienteId,
        periodo: p,
        titulo: `⚙️ Contabilidad iniciada · ${nombre} · ${periodoLabel(p)}`,
        detalle: "Pendiente publicar el preliminar.",
        href: "/cumplimiento",
      });
    },
    [agregarNotificacion, nombreCliente]
  );

  const revertirContabilidadIniciada = useCallback(
    (clienteId: number, p: Periodo) => {
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente?.contabilidadIniciadaEn) return prev;
        return prev.map((r) =>
          r.id === existente.id
            ? {
                ...r,
                contabilidadIniciadaEn: undefined,
                actualizadoEn: new Date().toISOString(),
              }
            : r
        );
      });
    },
    []
  );

  const marcarSinPagoImpuestos = useCallback(
    (
      clienteId: number,
      p: Periodo,
      motivo?: "sin_operaciones" | "saldo_favor" | "otro"
    ) => {
      const ahora = new Date().toISOString();
      let yaEstaba = false;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (existente) {
          yaEstaba = !!existente.sinPagoImpuestos;
          if (yaEstaba) return prev;
          return prev.map((r) =>
            r.id === existente.id
              ? {
                  ...r,
                  sinPagoImpuestos: true,
                  sinPagoMarcadoEn: ahora,
                  sinPagoMotivo: motivo,
                  // Si había un previo publicado se invalida porque ahora es en ceros
                  previewPublicadoEn: undefined,
                  clienteConfirmoPreviewEn: undefined,
                  previewValidacionCategorias: undefined,
                  montoImpuesto: 0,
                  fechaLimite: "",
                  actualizadoEn: ahora,
                }
              : r
          );
        }
        const vacio = bloquesVacios();
        const nuevo: RegistroCumplimiento = {
          id: nuevoIdCumplimiento(),
          clienteId,
          mes: p.mes,
          anio: p.anio,
          montoImpuesto: 0,
          fechaLimite: "",
          aplicaImss: false,
          federales: vacio.federales,
          imss: vacio.imss,
          estatales: vacio.estatales,
          otros: [],
          sinPagoImpuestos: true,
          sinPagoMarcadoEn: ahora,
          sinPagoMotivo: motivo,
          actualizadoEn: ahora,
        };
        return [...prev, nuevo];
      });
      if (yaEstaba) return;
      const nombre = nombreCliente(clienteId);
      agregarNotificacion({
        tipo: "admin_sin_pago",
        destinatario: "cliente",
        clienteId,
        periodo: p,
        titulo: `🙌 ¡${periodoLabel(p)} cierra sin pagos!`,
        detalle:
          "No hay impuestos a cargo. Estamos preparando tu declaración para subirla a tu portal.",
        href: "/portal/cumplimiento",
      });
      agregarNotificacion({
        tipo: "admin_sin_pago",
        destinatario: "admin",
        clienteId,
        periodo: p,
        titulo: `🙌 Sin pago · ${nombre} · ${periodoLabel(p)}`,
        detalle: "Pendiente subir la declaración al SAT.",
        href: "/cumplimiento",
      });
    },
    [agregarNotificacion, nombreCliente]
  );

  const revertirSinPagoImpuestos = useCallback(
    (clienteId: number, p: Periodo) => {
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente?.sinPagoImpuestos) return prev;
        return prev.map((r) =>
          r.id === existente.id
            ? {
                ...r,
                sinPagoImpuestos: false,
                sinPagoMarcadoEn: undefined,
                sinPagoMotivo: undefined,
                actualizadoEn: new Date().toISOString(),
              }
            : r
        );
      });
    },
    []
  );

  const actualizarSaldoFavor = useCallback(
    (
      clienteId: number,
      p: Periodo,
      saldo: {
        activo: boolean;
        lineas?: { etiqueta: string; monto: number }[];
      }
    ) => {
      const ahora = new Date().toISOString();
      const limpiar = (n?: number): number => {
        const v = Number(n);
        if (!Number.isFinite(v) || v < 0) return 0;
        return Math.round(v * 100) / 100;
      };
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        const lineas = (saldo.lineas ?? []).map((l) => ({
          etiqueta: l.etiqueta.trim() || "ISR",
          monto: limpiar(l.monto),
        }));
        const patch: Partial<RegistroCumplimiento> = {
          saldoFavor: saldo.activo
            ? {
                activo: true,
                lineas,
                capturadoEn: ahora,
              }
            : undefined,
        };
        if (existente?.sinPagoImpuestos) {
          patch.sinPagoMotivo = saldo.activo
            ? "saldo_favor"
            : existente.sinPagoMotivo === "saldo_favor"
              ? undefined
              : existente.sinPagoMotivo;
        }
        return upsertCumplimiento(prev, clienteId, p, patch);
      });
    },
    [upsertCumplimiento]
  );

  const marcarVencimientoNotificado = useCallback(
    (clienteId: number, p: Periodo, categoria: CategoriaId) => {
      const ahora = new Date().toISOString();
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente) return prev;
        if (existente.vencimientoNotificadoEn?.[categoria]) return prev;
        return prev.map((r) =>
          r.id === existente.id
            ? {
                ...r,
                vencimientoNotificadoEn: {
                  ...(r.vencimientoNotificadoEn ?? {}),
                  [categoria]: ahora,
                },
                actualizadoEn: ahora,
              }
            : r
        );
      });
    },
    []
  );


  const aplicarValidacionPreview = useCallback(
    (
      reg: RegistroCumplimiento,
      clienteId: number,
      categorias: CategoriaId[]
    ): RegistroCumplimiento => {
      const ahora = new Date().toISOString();
      const cliente = listaClientes.find((c) => c.id === clienteId);
      const bloques = asegurarBloques(reg);
      const pendientes = cliente
        ? categoriasConPagoEnPreview(cliente, bloques)
        : categorias;
      const validacion: Partial<Record<CategoriaId, string>> = {
        ...reg.previewValidacionCategorias,
      };
      for (const cat of categorias) {
        validacion[cat] = ahora;
      }
      const todasValidadas = pendientes.every((cat) => !!validacion[cat]);
      return {
        ...reg,
        previewValidacionCategorias: validacion,
        clienteConfirmoPreviewEn: todasValidadas
          ? ahora
          : reg.clienteConfirmoPreviewEn,
        actualizadoEn: ahora,
      };
    },
    [listaClientes]
  );

  const confirmarPreviewCliente = useCallback(
    (clienteId: number, p: Periodo): RegistroCumplimiento | null => {
      let resultado: RegistroCumplimiento | null = null;
      let yaCompletoAntes = false;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente?.previewPublicadoEn) return prev;
        yaCompletoAntes = !!existente.clienteConfirmoPreviewEn;
        const cliente = listaClientes.find((c) => c.id === clienteId);
        const cats = cliente
          ? categoriasConPagoEnPreview(cliente, asegurarBloques(existente))
          : (["federales", "imss", "estatales"] as CategoriaId[]);
        const next = prev.map((r) =>
          r.id === existente.id
            ? aplicarValidacionPreview(r, clienteId, cats)
            : r
        );
        resultado = findCumplimiento(next, clienteId, p) ?? null;
        return next;
      });
      const r1 = resultado as RegistroCumplimiento | null;
      if (r1?.clienteConfirmoPreviewEn && !yaCompletoAntes) {
        agregarNotificacion({
          tipo: "cliente_previo_validado",
          destinatario: "admin",
          clienteId,
          periodo: p,
          titulo: `✔️ ${nombreCliente(clienteId)} validó el previo · ${periodoLabel(p)}`,
          detalle: "Ya puedes subirle sus documentos fiscales del periodo.",
          href: "/cumplimiento",
        });
      }
      return resultado;
    },
    [aplicarValidacionPreview, listaClientes, agregarNotificacion, nombreCliente]
  );

  const confirmarPreviewCategoria = useCallback(
    (
      clienteId: number,
      p: Periodo,
      categoria: CategoriaId
    ): RegistroCumplimiento | null => {
      let resultado: RegistroCumplimiento | null = null;
      let yaCompletoAntes = false;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente?.previewPublicadoEn) return prev;
        yaCompletoAntes = !!existente.clienteConfirmoPreviewEn;
        const next = prev.map((r) =>
          r.id === existente.id
            ? aplicarValidacionPreview(r, clienteId, [categoria])
            : r
        );
        resultado = findCumplimiento(next, clienteId, p) ?? null;
        return next;
      });
      const r2 = resultado as RegistroCumplimiento | null;
      if (r2?.clienteConfirmoPreviewEn && !yaCompletoAntes) {
        agregarNotificacion({
          tipo: "cliente_previo_validado",
          destinatario: "admin",
          clienteId,
          periodo: p,
          titulo: `✔️ ${nombreCliente(clienteId)} validó el previo · ${periodoLabel(p)}`,
          detalle: "Ya puedes subirle sus documentos fiscales del periodo.",
          href: "/cumplimiento",
        });
      }
      return resultado;
    },
    [aplicarValidacionPreview, agregarNotificacion, nombreCliente]
  );

  const subirComprobantePagoImpuestos = useCallback(
    (
      clienteId: number,
      p: Periodo,
      archivo: ArchivoAdjunto
    ): RegistroCumplimiento | null => {
      const doc = {
        id: nuevoIdDocumento(),
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        dataUrl: archivo.dataUrl,
        subidoEn: new Date().toISOString(),
      };
      let resultado: RegistroCumplimiento | null = null;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente) return prev;
        const ahora = new Date().toISOString();
        const reg = asegurarBloques(existente);
        const cliente = listaClientes.find((c) => c.id === clienteId);
        const cats = cliente
          ? categoriasHabilitadasCliente(cliente)
          : (["federales", "imss", "estatales"] as CategoriaId[]);

        const next = prev.map((r) =>
          r.id === existente.id
            ? {
                ...r,
                comprobantePago: doc,
                comprobantePagoSubidoEn: ahora,
                actualizadoEn: ahora,
              }
            : r
        );
        resultado = findCumplimiento(next, clienteId, p) ?? null;

        if (cliente && resultado) {
          const nuevas: PagoImpuestoHistorial[] = [];
          for (const cat of cats) {
            const montoExt = resultado.extemporaneo?.[cat]?.lineas[0]?.monto;
            const monto =
              montoExt ??
              getSubtotalCategoria(reg, cat);
            if (monto <= 0) continue;
            const fecha =
              resultado.extemporaneo?.[cat]?.lineas[0]?.fechaLimite ??
              reg.fechaLimite;
            nuevas.push(
              crearEntradaHistorial(clienteId, cat, p, monto, fecha, ahora)
            );
          }
          if (nuevas.length) {
            setHistorialImpuestos((h) =>
              nuevas.reduce((acc, e) => upsertHistorialEntry(acc, e), h)
            );
          }
        }

        return next;
      });
      return resultado;
    },
    [listaClientes]
  );

  const subirComprobantePagoCategoria = useCallback(
    (
      clienteId: number,
      p: Periodo,
      categoria: CategoriaId,
      archivo: ArchivoAdjunto
    ): RegistroCumplimiento | null => {
      const doc = {
        id: nuevoIdDocumento(),
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        dataUrl: archivo.dataUrl,
        subidoEn: new Date().toISOString(),
      };
      let resultado: RegistroCumplimiento | null = null;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente) return prev;
        const ahora = new Date().toISOString();
        const reg = asegurarBloques(existente);
        const next = prev.map((r) =>
          r.id === existente.id
            ? {
                ...r,
                comprobantePagoCategorias: {
                  ...(r.comprobantePagoCategorias ?? {}),
                  [categoria]: doc,
                },
                comprobantePagoCategoriasSubidoEn: {
                  ...(r.comprobantePagoCategoriasSubidoEn ?? {}),
                  [categoria]: ahora,
                },
                actualizadoEn: ahora,
              }
            : r
        );
        resultado = findCumplimiento(next, clienteId, p) ?? null;

        const montoExt = resultado?.extemporaneo?.[categoria]?.lineas[0]?.monto;
        const monto = montoExt ?? getSubtotalCategoria(reg, categoria);
        if (resultado && monto > 0) {
          const fecha =
            resultado.extemporaneo?.[categoria]?.lineas[0]?.fechaLimite ??
            reg.fechaLimite;
          setHistorialImpuestos((h) =>
            upsertHistorialEntry(
              h,
              crearEntradaHistorial(clienteId, categoria, p, monto, fecha, ahora)
            )
          );
        }

        return next;
      });
      if (resultado) {
        agregarNotificacion({
          tipo: "cliente_subio_comprobante",
          destinatario: "admin",
          clienteId,
          periodo: p,
          categoria,
          titulo: `📥 Comprobante de ${CATEGORIA_META[categoria].label} · ${nombreCliente(clienteId)} · ${periodoLabel(p)}`,
          detalle: "Revísalo y márcalo como validado para cerrar el ciclo.",
          href: "/cumplimiento",
        });
      }
      return resultado;
    },
    [agregarNotificacion, nombreCliente]
  );

  const eliminarComprobantePagoCategoria = useCallback(
    (clienteId: number, p: Periodo, categoria: CategoriaId) => {
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente?.comprobantePagoCategorias?.[categoria]) return prev;
        return prev.map((r) => {
          if (r.id !== existente.id) return r;
          const mapaDocs = { ...(r.comprobantePagoCategorias ?? {}) };
          const mapaFechas = { ...(r.comprobantePagoCategoriasSubidoEn ?? {}) };
          const mapaValid = { ...(r.pagoValidadoCategorias ?? {}) };
          delete mapaDocs[categoria];
          delete mapaFechas[categoria];
          delete mapaValid[categoria];
          return {
            ...r,
            comprobantePagoCategorias: mapaDocs,
            comprobantePagoCategoriasSubidoEn: mapaFechas,
            pagoValidadoCategorias: mapaValid,
            actualizadoEn: new Date().toISOString(),
          };
        });
      });
    },
    []
  );

  const validarPagoCategoria = useCallback(
    (
      clienteId: number,
      p: Periodo,
      categoria: CategoriaId
    ): RegistroCumplimiento | null => {
      let resultado: RegistroCumplimiento | null = null;
      let yaValidadoAntes = false;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente) return prev;
        yaValidadoAntes = !!existente.pagoValidadoCategorias?.[categoria];
        const ahora = new Date().toISOString();
        const next = prev.map((r) => {
          if (r.id !== existente.id) return r;
          return {
            ...r,
            pagoValidadoCategorias: {
              ...(r.pagoValidadoCategorias ?? {}),
              [categoria]: ahora,
            },
            actualizadoEn: ahora,
          };
        });
        resultado = findCumplimiento(next, clienteId, p) ?? null;
        return next;
      });
      if (resultado && !yaValidadoAntes) {
        agregarNotificacion({
          tipo: "admin_pago_validado",
          destinatario: "cliente",
          clienteId,
          periodo: p,
          categoria,
          titulo: `✅ ¡Pago de ${CATEGORIA_META[categoria].label} confirmado · ${periodoLabel(p)}!`,
          detalle: "Gracias, quedas al corriente. Vamos por la siguiente.",
          href: "/portal/cumplimiento",
        });
        notificarCierreSiCorresponde(clienteId, p);
      }
      return resultado;
    },
    [agregarNotificacion, notificarCierreSiCorresponde]
  );

  const revertirValidacionPagoCategoria = useCallback(
    (clienteId: number, p: Periodo, categoria: CategoriaId) => {
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente?.pagoValidadoCategorias?.[categoria]) return prev;
        return prev.map((r) => {
          if (r.id !== existente.id) return r;
          const mapa = { ...(r.pagoValidadoCategorias ?? {}) };
          delete mapa[categoria];
          return {
            ...r,
            pagoValidadoCategorias: mapa,
            actualizadoEn: new Date().toISOString(),
          };
        });
      });
    },
    []
  );

  const publicarExtemporaneo = useCallback(
    (
      clienteId: number,
      p: Periodo,
      categoria: CategoriaId,
      linea: { monto: number; fechaLimite: string; etiqueta?: string },
      archivo?: ArchivoAdjunto
    ): RegistroCumplimiento => {
      const ahora = new Date().toISOString();
      const doc = archivo
        ? {
            id: nuevoIdDocumento(),
            nombreArchivo: archivo.nombreArchivo,
            tipoMime: archivo.tipoMime,
            dataUrl: archivo.dataUrl,
            subidoEn: ahora,
          }
        : undefined;
      let resultado: RegistroCumplimiento | undefined;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        const vacio = bloquesVacios();
        const base = existente
          ? asegurarBloques(existente)
          : ({
              id: nuevoIdCumplimiento(),
              clienteId,
              mes: p.mes,
              anio: p.anio,
              montoImpuesto: 0,
              fechaLimite: "",
              aplicaImss: false,
              federales: vacio.federales,
              imss: vacio.imss,
              estatales: vacio.estatales,
              otros: [],
              extemporaneo: {},
              actualizadoEn: ahora,
            } satisfies RegistroCumplimiento);

        const nuevaLinea = {
          id: nuevoIdLinea(),
          etiqueta: linea.etiqueta?.trim() || "Pago extemporáneo",
          monto: linea.monto,
          fechaLimite: linea.fechaLimite,
          documento: doc,
        };

        const actualizado: RegistroCumplimiento = {
          ...base,
          extemporaneo: {
            ...base.extemporaneo,
            [categoria]: { lineas: [nuevaLinea], publicadoEn: ahora },
          },
          actualizadoEn: ahora,
        };

        const next = existente
          ? prev.map((r) => (r.id === existente.id ? actualizado : r))
          : [...prev, actualizado];
        resultado = actualizado;
        return next;
      });
      return resultado!;
    },
    []
  );

  const getHistorialImpuestosCliente = useCallback(
    (clienteId: number, categoria?: CategoriaId) => {
      return historialImpuestos.filter(
        (h) => h.clienteId === clienteId && (!categoria || h.categoria === categoria)
      );
    },
    [historialImpuestos]
  );

  const getRegistroRepseCliente = useCallback(
    (clienteId: number, p: PeriodoRepse) =>
      registrosRepse.find(
        (r) =>
          r.clienteId === clienteId &&
          r.cuatrimestre === p.cuatrimestre &&
          r.anio === p.anio
      ),
    [registrosRepse]
  );

  const subirDocumentoRepse = useCallback(
    (
      clienteId: number,
      p: PeriodoRepse,
      tipo: TipoDocumentoRepse,
      archivo: ArchivoAdjunto
    ): RegistroRepse => {
      const ahora = new Date().toISOString();
      const doc = {
        id: nuevoIdDocRepse(),
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        dataUrl: archivo.dataUrl,
        subidoEn: ahora,
      };
      let actualizado: RegistroRepse | null = null;
      setRegistrosRepse((prev) => {
        const existente = prev.find(
          (r) =>
            r.clienteId === clienteId &&
            r.cuatrimestre === p.cuatrimestre &&
            r.anio === p.anio
        );
        const base: RegistroRepse =
          existente ?? {
            id: nuevoIdRegistroRepse(),
            clienteId,
            cuatrimestre: p.cuatrimestre,
            anio: p.anio,
            actualizadoEn: ahora,
          };
        actualizado = {
          ...base,
          [tipo]: doc,
          actualizadoEn: ahora,
        };
        return existente
          ? prev.map((r) => (r.id === existente.id ? actualizado! : r))
          : [...prev, actualizado!];
      });

      const nombre = nombreCliente(clienteId);
      const meta = REPSE_META[tipo];
      const etiquetaPeriodo = periodoRepseLabel(p);
      agregarNotificacion({
        tipo: "admin_sin_pago",
        destinatario: "cliente",
        clienteId,
        periodo: { mes: 0, anio: p.anio },
        titulo: `📄 ¡Lista tu Declaración ${meta.label} ${etiquetaPeriodo}!`,
        detalle: `Ya quedó cargada en tu portal (${meta.autoridad}). Pásate a descargarla cuando gustes.`,
        href: "/portal/cumplimiento",
      });
      agregarNotificacion({
        tipo: "admin_sin_pago",
        destinatario: "admin",
        clienteId,
        periodo: { mes: 0, anio: p.anio },
      titulo: `📄 ${meta.label} ${etiquetaPeriodo} subida · ${nombre}`,
      detalle: "Ya está en su portal. Verifica que el complementario quede completo.",
        href: "/cumplimiento",
      });
      return actualizado!;
    },
    [agregarNotificacion, nombreCliente]
  );

  const eliminarDocumentoRepse = useCallback(
    (clienteId: number, p: PeriodoRepse, tipo: TipoDocumentoRepse) => {
      setRegistrosRepse((prev) =>
        prev
          .map((r) => {
            if (
              r.clienteId !== clienteId ||
              r.cuatrimestre !== p.cuatrimestre ||
              r.anio !== p.anio
            )
              return r;
            const next: RegistroRepse = {
              ...r,
              actualizadoEn: new Date().toISOString(),
            };
            delete (next as Partial<RegistroRepse>)[tipo];
            return next;
          })
          .filter((r) => r.icsoe || r.sisub)
      );
    },
    []
  );

  const getEncargosCliente = useCallback(
    (clienteId: number) =>
      encargos
        .filter((e) => e.clienteId === clienteId)
        .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)),
    [encargos]
  );

  const crearEncargo = useCallback(
    (params: {
      clienteId: number;
      titulo: string;
      tipo: TipoEncargo;
      nota?: string;
      fechaCompromiso?: string;
      cantidadFacturas?: number;
      facturaImporteDepositado?: number;
      facturaReceptor?: string;
      adjuntosCliente?: ArchivoEncargo[];
      notasCliente?: { grupo?: number; texto: string }[];
      creadoPor: "admin" | "cliente";
    }): Encargo => {
      const ahora = new Date().toISOString();
      const datosFactura = datosFacturaUnicaEncargo(params);
      const encargo: Encargo = {
        id: nuevoIdEncargo(),
        clienteId: params.clienteId,
        titulo: params.titulo.trim(),
        tipo: params.tipo,
        nota: params.nota?.trim() || undefined,
        estado: "recibido",
        fechaCompromiso: params.fechaCompromiso || undefined,
        cantidadFacturas:
          params.tipo === "factura" ? params.cantidadFacturas : undefined,
        ...datosFactura,
        adjuntosCliente:
          params.adjuntosCliente && params.adjuntosCliente.length
            ? params.adjuntosCliente
            : undefined,
        notasCliente:
          params.notasCliente && params.notasCliente.length
            ? params.notasCliente
            : undefined,
        creadoPor: params.creadoPor,
        creadoEn: ahora,
        actualizadoEn: ahora,
      };
      setEncargos((prev) => [encargo, ...prev]);

      const nombre =
        listaClientes.find((c) => c.id === params.clienteId)?.razonSocial ??
        "Cliente";
      const periodo = getPeriodoHoy();

      if (params.creadoPor === "cliente") {
        const partes: string[] = [];
        if (encargo.tipo === "factura" && encargo.cantidadFacturas) {
          partes.push(
            `${encargo.cantidadFacturas} factura${encargo.cantidadFacturas === 1 ? "" : "s"}`
          );
        }
        if (
          esFacturaUnica(encargo) &&
          encargo.facturaImporteDepositado != null
        ) {
          partes.push(
            formatImporteFacturaEncargo(encargo.facturaImporteDepositado)
          );
        }
        if (esFacturaUnica(encargo) && encargo.facturaReceptor) {
          partes.push(`a ${encargo.facturaReceptor}`);
        }
        if (encargo.adjuntosCliente?.length) {
          partes.push(
            `${encargo.adjuntosCliente.length} archivo${encargo.adjuntosCliente.length === 1 ? "" : "s"} adjunto${encargo.adjuntosCliente.length === 1 ? "" : "s"}`
          );
        }
        if (encargo.notasCliente?.length) {
          partes.push(
            `${encargo.notasCliente.length} indicación${encargo.notasCliente.length === 1 ? "" : "es"}`
          );
        }
        const resumen = partes.length ? ` (${partes.join(" · ")})` : "";
        agregarNotificacion({
          tipo: "encargo_solicitud_cliente",
          destinatario: "admin",
          clienteId: params.clienteId,
          periodo,
          encargoId: encargo.id,
          titulo: `📋 ${nombre} pidió: ${encargo.titulo}`,
          detalle: (encargo.nota ?? "Revisa el encargo en la consola.") + resumen,
          href: "/encargos",
        });
        agregarNotificacion({
          tipo: "encargo_estado_cliente",
          destinatario: "cliente",
          clienteId: params.clienteId,
          periodo,
          encargoId: encargo.id,
          titulo: `Recibimos tu solicitud: ${encargo.titulo}`,
          detalle: "Tu contador ya lo tiene en su lista. Te avisamos cuando avance.",
          href: "/portal/encargos",
        });
      } else {
        agregarNotificacion({
          tipo: "encargo_estado_cliente",
          destinatario: "cliente",
          clienteId: params.clienteId,
          periodo,
          encargoId: encargo.id,
          titulo: `Registramos tu solicitud: ${encargo.titulo}`,
          detalle: "Puedes ver el avance en Solicitudes del portal.",
          href: "/portal/encargos",
        });
      }

      return encargo;
    },
    [agregarNotificacion, listaClientes]
  );

  const actualizarEstadoEncargo = useCallback(
    (encargoId: string, estado: EstadoEncargo): Encargo | null => {
      const prev = encargos.find((e) => e.id === encargoId);
      if (!prev) return null;
      const ahora = new Date().toISOString();
      const actualizado: Encargo = {
        ...prev,
        estado,
        actualizadoEn: ahora,
        listoEn: estado === "listo" ? ahora : prev.listoEn,
      };
      setEncargos((lista) =>
        lista.map((e) => (e.id === encargoId ? actualizado : e))
      );

      const meta = ESTADO_ENCARGO_META[estado];
      const periodo = getPeriodoHoy();
      const tituloBase = actualizado.titulo;

      if (estado === "listo") {
        agregarNotificacion({
          tipo: "encargo_listo_cliente",
          destinatario: "cliente",
          clienteId: actualizado.clienteId,
          periodo,
          encargoId: actualizado.id,
          titulo: `🎉 ¡Listo! ${tituloBase}`,
          detalle: "Te lo enviamos por correo. Revisa tu bandeja de entrada.",
          href: "/portal/encargos",
        });
      } else if (prev.estado !== estado) {
        agregarNotificacion({
          tipo: "encargo_estado_cliente",
          destinatario: "cliente",
          clienteId: actualizado.clienteId,
          periodo,
          encargoId: actualizado.id,
          titulo: `${meta.label}: ${tituloBase}`,
          detalle: meta.detalleCliente,
          href: "/portal/encargos",
        });
      }

      return actualizado;
    },
    [agregarNotificacion, encargos]
  );

  const editarEncargo = useCallback(
    (
      encargoId: string,
      params: {
        titulo: string;
        tipo: TipoEncargo;
        nota?: string;
        cantidadFacturas?: number;
        facturaImporteDepositado?: number;
        facturaReceptor?: string;
        adjuntosCliente?: ArchivoEncargo[];
        notasCliente?: { grupo?: number; texto: string }[];
        editadoPor: "admin" | "cliente";
      }
    ): Encargo | null => {
      const prev = encargos.find((e) => e.id === encargoId);
      if (!prev) return null;
      const ahora = new Date().toISOString();
      const datosFactura = datosFacturaUnicaEncargo(params);
      const actualizado: Encargo = {
        ...prev,
        titulo: params.titulo.trim(),
        tipo: params.tipo,
        nota: params.nota?.trim() || undefined,
        cantidadFacturas:
          params.tipo === "factura" ? params.cantidadFacturas : undefined,
        ...datosFactura,
        adjuntosCliente:
          params.adjuntosCliente && params.adjuntosCliente.length
            ? params.adjuntosCliente
            : undefined,
        notasCliente:
          params.notasCliente && params.notasCliente.length
            ? params.notasCliente
            : undefined,
        actualizadoEn: ahora,
        editadoEn: ahora,
      };
      setEncargos((lista) =>
        lista.map((e) => (e.id === encargoId ? actualizado : e))
      );

      if (params.editadoPor === "cliente") {
        const nombre =
          listaClientes.find((c) => c.id === actualizado.clienteId)
            ?.razonSocial ?? "Cliente";
        agregarNotificacion({
          tipo: "encargo_editado_cliente",
          destinatario: "admin",
          clienteId: actualizado.clienteId,
          periodo: getPeriodoHoy(),
          encargoId: actualizado.id,
          titulo: `✏️ ${nombre} editó su solicitud: ${actualizado.titulo}`,
          detalle:
            actualizado.nota ??
            "Revisa los cambios de la solicitud en la consola.",
          href: "/encargos",
        });
      }

      return actualizado;
    },
    [agregarNotificacion, encargos, listaClientes]
  );

  const guardarEntregasEncargo = useCallback(
    (
      encargoId: string,
      entregas: EntregaEncargo[],
      opts?: { marcarListo?: boolean }
    ): Encargo | null => {
      const prev = encargos.find((e) => e.id === encargoId);
      if (!prev) return null;
      const ahora = new Date().toISOString();
      const limpias = entregas.filter((e) => e.folio.trim().length > 0);
      const marcarListo = opts?.marcarListo ?? false;
      const actualizado: Encargo = {
        ...prev,
        entregas: limpias.length ? limpias : undefined,
        estado: marcarListo ? "listo" : prev.estado,
        actualizadoEn: ahora,
        listoEn: marcarListo ? ahora : prev.listoEn,
      };
      setEncargos((lista) =>
        lista.map((e) => (e.id === encargoId ? actualizado : e))
      );

      if (marcarListo && prev.estado !== "listo") {
        const folios = limpias.map((e) => e.folio.trim());
        const resumen =
          folios.length > 0
            ? `Facturas: ${folios.join(", ")}. Te las enviamos por correo.`
            : "Te lo enviamos por correo. Revisa tu bandeja de entrada.";
        agregarNotificacion({
          tipo: "encargo_listo_cliente",
          destinatario: "cliente",
          clienteId: actualizado.clienteId,
          periodo: getPeriodoHoy(),
          encargoId: actualizado.id,
          titulo: `🎉 ¡Listo! ${actualizado.titulo}`,
          detalle: resumen,
          href: "/portal/encargos",
        });
      }

      return actualizado;
    },
    [agregarNotificacion, encargos]
  );

  const liberarArchivosMes = useCallback((claveMes: string): number => {
    let afectados = 0;
    setEncargos((prev) =>
      prev.map((e) => {
        if (claveMesEncargo(e) !== claveMes) return e;
        const teniaArchivos =
          (e.adjuntosCliente?.length ?? 0) > 0 ||
          (e.entregas?.some((ent) => (ent.archivos?.length ?? 0) > 0) ?? false);
        if (!teniaArchivos) return e;
        afectados += 1;
        return {
          ...e,
          adjuntosCliente: undefined,
          entregas: e.entregas?.map((ent) => ({
            id: ent.id,
            folio: ent.folio,
          })),
          archivosLiberados: true,
        };
      })
    );
    return afectados;
  }, []);

  const eliminarEncargo = useCallback((encargoId: string) => {
    setEncargos((prev) => prev.filter((e) => e.id !== encargoId));
  }, []);

  const marcarRecordatorioLimiteEnviado = useCallback((clienteId: number, p: Periodo) => {
    setCumplimiento((prev) => {
      const existente = findCumplimiento(prev, clienteId, p);
      if (!existente) return prev;
      return prev.map((r) =>
        r.id === existente.id
          ? { ...r, recordatorioLimiteEnviadoEn: new Date().toISOString() }
          : r
      );
    });
  }, []);

  const marcarCumplimientoNotificado = useCallback(
    (clienteId: number, p: Periodo) => {
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente) return prev;
        return prev.map((r) =>
          r.id === existente.id
            ? { ...r, notificadoEn: new Date().toISOString() }
            : r
        );
      });
    },
    []
  );

  return (
    <ClientesContext.Provider
      value={{
        listaClientes,
        comprobantes,
        facturas,
        cumplimiento,
        historialImpuestos,
        datosListos: cargaInicialOk,
        cargaInicialTerminada: hydrated,
        cloudSyncError,
        cloudSincronizando,
        recargarDesdeNube,
        guardarEnNubeAhora: flushGuardado,
        ultimaSyncEn,
        periodo,
        periodoHoy,
        periodoFiscalVigente,
        aniosDisponibles,
        comprobantesNuevos,
        setListaClientes,
        setPeriodoMes,
        setPeriodoAnio,
        irAPeriodoActual,
        irAPeriodoFiscalVigente,
        actualizarCliente,
        eliminarCliente,
        registrarPago,
        quitarPago,
        registrarServicioAdicional,
        eliminarServicioAdicional,
        registrarIngresoDiverso,
        eliminarIngresoDiverso,
        agregarExtraEsperado,
        editarExtraEsperado,
        eliminarExtraEsperado,
        registrarAbonoExtraEsperado,
        recordatorioLog,
        scriptsCorreo,
        marcarRecordatorio,
        quitarMarcaRecordatorioMes,
        agregarScriptCorreo,
        editarScriptCorreo,
        eliminarScriptCorreo,
        presupuestos,
        catalogoServicios,
        agregarPresupuesto,
        actualizarPresupuesto,
        eliminarPresupuesto,
        asegurarTokenPresupuesto,
        prepararLigaPublica,
        cambiarEstadoPresupuesto,
        agregarServicioCatalogo,
        editarServicioCatalogo,
        eliminarServicioCatalogo,
        preciosRegimen,
        setPrecioRegimen,
        aplicarDescuento,
        eliminarDescuento,
        subirComprobante,
        subirComprobanteExtra,
        validarComprobanteExtra,
        getComprobantePeriodo,
        getComprobantesCliente,
        getComprobantesExtra,
        marcarComprobanteVisto,
        validarComprobantePago,
        revertirValidacionComprobante,
        eliminarComprobantePagoHonorarios,
        subirFactura,
        getFacturaPeriodo,
        eliminarFactura,
        getCumplimientoPeriodo,
        subirDocumentoCumplimiento,
        actualizarMetadataCumplimiento,
        eliminarDocumentoCumplimiento,
        agregarDocumentoOtros,
        eliminarDocumentoOtros,
        agregarArchivoNomina,
        eliminarArchivoNomina,
        marcarCumplimientoNotificado,
        marcarContabilidadIniciada,
        revertirContabilidadIniciada,
        marcarSinPagoImpuestos,
        revertirSinPagoImpuestos,
        actualizarSaldoFavor,
        marcarVencimientoNotificado,
        publicarPreviewImpuestos,
        marcarPreviewNotificado,
        confirmarPreviewCliente,
        confirmarPreviewCategoria,
        subirComprobantePagoImpuestos,
        subirComprobantePagoCategoria,
        eliminarComprobantePagoCategoria,
        validarPagoCategoria,
        revertirValidacionPagoCategoria,
        notificaciones,
        notificacionesAdmin,
        notificacionesAdminNoLeidas,
        notificacionesCliente,
        notificacionesClienteNoLeidas,
        marcarNotificacionLeida,
        marcarNotificacionesLeidas,
        borrarNotificaciones,
        agregarNotificacion,
        marcarRecordatorioLimiteEnviado,
        eliminarPreviewImpuestos,
        publicarExtemporaneo,
        getHistorialImpuestosCliente,
        registrosRepse,
        getRegistroRepseCliente,
        subirDocumentoRepse,
        eliminarDocumentoRepse,
        encargos,
        getEncargosCliente,
        crearEncargo,
        actualizarEstadoEncargo,
        editarEncargo,
        guardarEntregasEncargo,
        liberarArchivosMes,
        eliminarEncargo,
      }}
    >
      {!esRutaPortal() && (
        <CrmCloudBanner
          error={cloudSyncError}
          sincronizando={cloudSincronizando}
        />
      )}
      {children}
    </ClientesContext.Provider>
  );
}

export function useClientes() {
  const ctx = useContext(ClientesContext);
  if (!ctx) throw new Error("useClientes debe usarse dentro de ClientesProvider");
  return ctx;
}

export { aplicarCambioHonorarios } from "@/lib/clientes";
export { calcularEstado } from "@/lib/clientes";

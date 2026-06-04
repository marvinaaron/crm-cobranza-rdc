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
  nuevoIdDescuento,
  nuevoIdPagoAdicional,
  esIngresoGeneralCliente,
  fechaNacimientoDeRFC,
  formatearFechaNacimientoCorta,
  type Descuento,
  type MetodoPago,
  type PagoRealizado,
} from "@/lib/clientes";
import {
  type ComprobantePago,
  getComprobantePeriodo as findComprobante,
  getComprobantesCliente as listarComprobantesCliente,
  nuevoIdComprobante,
} from "@/lib/comprobantes";
import { buildAdminPushExtras, buildClientePushExtras } from "@/lib/push/payload";
import {
  type FacturaPago,
  filtrarFacturasAnioActual,
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
  getTotalImpuestos,
  getFechaLimitePrincipal,
  getSubtotalCategoria,
  type CategoriaId,
  periodoVencidoSinPago,
  categoriasVencidasSinPago,
} from "@/lib/cumplimiento";
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
import { abrirCorreoEvento } from "@/lib/correo-eventos";
import {
  type Notificacion,
  type DestinatarioNotificacion,
  type TipoNotificacion,
  nuevoIdNotificacion,
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
  claveMesEncargo,
  ESTADO_ENCARGO_META,
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
  cloudSyncError: string | null;
  cloudSincronizando: boolean;
  recargarDesdeNube: () => Promise<void>;
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
  getComprobantePeriodo: (clienteId: number, periodo: Periodo) => ComprobantePago | undefined;
  getComprobantesCliente: (clienteId: number) => ComprobantePago[];
  marcarComprobanteVisto: (id: string) => void;
  validarComprobantePago: (comprobanteId: string) => ComprobantePago | null;
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
   * Captura/actualiza el saldo a favor (ISR / IVA) para un periodo que esté
   * marcado como "sin pago". Pasar { activo: false } limpia el bloque.
   */
  actualizarSaldoFavor: (
    clienteId: number,
    periodo: Periodo,
    saldo: { activo: boolean; isr?: number; iva?: number }
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
  agregarNotificacion: (n: {
    tipo: TipoNotificacion;
    destinatario: DestinatarioNotificacion;
    clienteId: number;
    periodo: Periodo;
    categoria?: CategoriaId;
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
    adjuntosCliente?: ArchivoEncargo[];
    creadoPor: "admin" | "cliente";
  }) => Encargo;
  actualizarEstadoEncargo: (
    encargoId: string,
    estado: EstadoEncargo
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
  // Solo afectamos los pagos de honorarios del mes. Los "adicionales" del
  // mismo mes (servicios extras) viven aparte y no se borran al re-registrar.
  const sinEsteMes = cliente.pagosRealizados.filter(
    (p) =>
      !(
        p.mes === periodoPago.mes &&
        p.anio === anioStr &&
        (p.tipo === "honorarios" || !p.tipo)
      )
  );

  const pagosRealizados =
    monto === null || monto <= 0
      ? sinEsteMes
      : [
          ...sinEsteMes,
          {
            mes: periodoPago.mes,
            anio: anioStr,
            monto,
            tipo: "honorarios" as const,
            ...(nota?.trim() ? { nota: nota.trim() } : {}),
            ...(comprobanteId ? { comprobanteId } : {}),
            // Si no se provee fecha de pago explícita, asumimos hoy.
            // Conserva el comportamiento previo donde no había campo
            // pero ahora deja rastro auditable en cada nuevo pago.
            fechaPago: fechaPago ?? new Date().toISOString().slice(0, 10),
            // Método por el que se liquidó la cuota. Default a
            // "transferencia" para alinearse con el caso histórico más
            // común del despacho.
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
  const [registrosRepse, setRegistrosRepse] = useState<RegistroRepse[]>([]);
  const [encargos, setEncargos] = useState<Encargo[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [ultimaSyncEn, setUltimaSyncEn] = useState<number | null>(null);
  const [cloudSincronizando, setCloudSincronizando] = useState(false);
  const omitirGuardadoRef = useRef(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aniosDisponibles = useMemo(() => generarAniosDisponibles(), []);

  const aplicarPayloadNube = useCallback(
    (data: Awaited<ReturnType<typeof cargarCrmDesdeNube>>) => {
      setListaClientes(data.clientes);
      setComprobantes(data.comprobantes);
      setFacturas(filtrarFacturasAnioActual(data.facturas));
      setCumplimiento(data.cumplimiento);
      setHistorialImpuestos(data.historialImpuestos);
      setNotificaciones(data.notificaciones);
      setRegistrosRepse(data.repse ?? []);
      setEncargos(data.encargos ?? []);
    },
    []
  );

  const cargarDesdeNube = useCallback(async () => {
    try {
      const data = await cargarCrmDesdeNube();
      aplicarPayloadNube(data);
      setCloudSyncError(null);
      setUltimaSyncEn(Date.now());
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "No se pudieron cargar los datos.";
      setCloudSyncError(msg);
    }
  }, [aplicarPayloadNube]);

  const recargarDesdeNube = useCallback(async () => {
    omitirGuardadoRef.current = true;
    await cargarDesdeNube();
  }, [cargarDesdeNube]);

  useEffect(() => {
    let cancelado = false;
    omitirGuardadoRef.current = true;
    void (async () => {
      await cargarDesdeNube();
      if (!cancelado) setHydrated(true);
    })();
    return () => {
      cancelado = true;
    };
  }, [cargarDesdeNube]);

  useEffect(() => {
    if (!hydrated || !esRutaPortal()) return;
    const supabase = getSupabaseBrowser();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (sess?.user) {
        omitirGuardadoRef.current = true;
        void cargarDesdeNube();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [hydrated, cargarDesdeNube]);

  useEffect(() => {
    if (!hydrated || esRutaPortal()) return;
    const alVisible = () => {
      if (document.visibilityState !== "visible") return;
      omitirGuardadoRef.current = true;
      void cargarDesdeNube();
    };
    document.addEventListener("visibilitychange", alVisible);
    const id = window.setInterval(alVisible, 45_000);
    return () => {
      document.removeEventListener("visibilitychange", alVisible);
      window.clearInterval(id);
    };
  }, [hydrated, cargarDesdeNube]);

  useEffect(() => {
    if (!hydrated) return;
    if (omitirGuardadoRef.current) {
      omitirGuardadoRef.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void (async () => {
        setCloudSincronizando(true);
        try {
          await guardarCrmEnNube({
            clientes: listaClientes,
            comprobantes,
            facturas,
            cumplimiento,
            historialImpuestos,
            notificaciones,
            repse: registrosRepse,
            encargos,
          });
          setCloudSyncError(null);
        } catch (e) {
          setCloudSyncError(
            e instanceof Error ? e.message : "Error al guardar en la nube."
          );
        } finally {
          setCloudSincronizando(false);
        }
      })();
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
    hydrated,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    const limpias = filtrarFacturasAnioActual(facturas);
    if (limpias.length !== facturas.length) {
      setFacturas(limpias);
    }
  }, [facturas, hydrated]);

  // Detección automática de plazos vencidos sin comprobante de pago.
  // Dispara notificaciones (una sola vez por categoría/periodo) y marca
  // vencimientoNotificadoEn para evitar repeticiones.
  useEffect(() => {
    if (!hydrated) return;
    for (const reg of cumplimiento) {
      const cats = categoriasVencidasSinPago(reg);
      if (!cats.length) continue;
      const ya = reg.vencimientoNotificadoEn ?? {};
      const pendientes = cats.filter((cat) => !ya[cat]);
      if (!pendientes.length) continue;
      const periodo: Periodo = { mes: reg.mes, anio: reg.anio };
      const nombre = listaClientes.find((c) => c.id === reg.clienteId)?.razonSocial ?? "Cliente";
      for (const cat of pendientes) {
        agregarNotificacion({
          tipo: "vencimiento_sin_pago",
          destinatario: "cliente",
          clienteId: reg.clienteId,
          periodo,
          categoria: cat,
          titulo: `⚠️ Se pasó el plazo de ${CATEGORIA_META[cat].label} · ${periodoLabel(periodo)}`,
          detalle:
            "Si ya pagaste, sube tu comprobante. Si aún no, escríbenos y te generamos una línea extemporánea sin bronca.",
          href: "/portal/cumplimiento",
        });
        agregarNotificacion({
          tipo: "vencimiento_sin_pago",
          destinatario: "admin",
          clienteId: reg.clienteId,
          periodo,
          categoria: cat,
          titulo: `🚨 Vencido sin pago · ${nombre} · ${CATEGORIA_META[cat].label} ${periodoLabel(periodo)}`,
          detalle: "Genera línea extemporánea o escríbele para destrabar.",
          href: "/cumplimiento",
        });
        marcarVencimientoNotificado(reg.clienteId, periodo, cat);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cumplimiento, hydrated]);

  const comprobantesNuevos = useMemo(
    () =>
      comprobantes.filter(
        (c) =>
          c.mes === periodo.mes &&
          c.anio === periodo.anio &&
          c.estado === "pendiente" &&
          !c.visto
      ).length,
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
      setNotificaciones((prev) => {
        const filtradas = prev.filter(
          (p) =>
            !(
              !p.leidaEn &&
              p.tipo === nueva.tipo &&
              p.destinatario === nueva.destinatario &&
              p.clienteId === nueva.clienteId &&
              p.periodo.mes === nueva.periodo.mes &&
              p.periodo.anio === nueva.periodo.anio &&
              (p.categoria ?? null) === (nueva.categoria ?? null) &&
              (p.encargoId ?? null) === (nueva.encargoId ?? null)
            )
        );
        return [nueva, ...filtradas];
      });

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
              tag: `cli-${nueva.clienteId}-${nueva.tipo}-${nueva.periodo.anio}-${nueva.periodo.mes}-${nueva.categoria ?? "x"}`,
              renotify: true,
              requireInteraction: extras.requireInteraction,
              actions: extras.actions,
              data: {
                tipo: nueva.tipo,
                actionUrls: extras.actionUrls,
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
      prev.map((n) =>
        n.id === id && !n.leidaEn ? { ...n, leidaEn: new Date().toISOString() } : n
      )
    );
  }, []);

  const marcarNotificacionesLeidas = useCallback(
    (destinatario: DestinatarioNotificacion, clienteId?: number) => {
      const ahora = new Date().toISOString();
      setNotificaciones((prev) =>
        prev.map((n) => {
          if (n.leidaEn) return n;
          if (n.destinatario !== destinatario) return n;
          if (clienteId != null && n.clienteId !== clienteId) return n;
          return { ...n, leidaEn: ahora };
        })
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
            abrirCorreoEvento(actualizado!, periodoPago, "pago_confirmado", {
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
        href: "/cobranza",
      });
      return nuevo;
    },
    [agregarNotificacion, nombreCliente]
  );

  const marcarComprobanteVisto = useCallback((id: string) => {
    setComprobantes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visto: true } : c))
    );
  }, []);

  const validarComprobantePago = useCallback(
    (comprobanteId: string): ComprobantePago | null => {
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
        const periodoNotif = snapshot.periodos[0];
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
      }
      return actualizado;
    },
    [agregarNotificacion, notificarCierreSiCorresponde]
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
      const lineas = [...r.federales.lineasCaptura];
      const idx = lineaId
        ? lineas.findIndex((l) => l.id === lineaId)
        : lineas.findIndex((l) => !l.documento);
      if (idx >= 0) {
        lineas[idx] = { ...lineas[idx], documento: doc };
      } else {
        lineas.push({
          id: nuevoIdLinea(),
          etiqueta: "Línea de captura",
          monto: 0,
          fechaLimite: r.fechaLimite,
          documento: doc,
        });
      }
      r.federales = { ...r.federales, lineasCaptura: lineas };
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
          actualizado.federales = {
            ...actualizado.federales,
            lineasCaptura: actualizado.federales.lineasCaptura.map((l) =>
              !lineaId || l.id === lineaId ? { ...l, documento: undefined } : l
            ),
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
          lineasCaptura: cats.includes("federales")
            ? datos.federales.map((l) => ({
            id: nuevoIdLinea(),
            etiqueta: l.etiqueta.trim() || "Impuestos federales",
            monto: l.monto,
            fechaLimite: l.fechaLimite,
            documento: republicar
              ? undefined
              : base?.federales.lineasCaptura.find(
                  (x) => x.etiqueta === l.etiqueta && x.monto === l.monto
                )?.documento,
              }))
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
                saldoFavor: undefined,
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
      saldo: { activo: boolean; isr?: number; iva?: number }
    ) => {
      const ahora = new Date().toISOString();
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente?.sinPagoImpuestos) return prev;
        const limpiar = (n?: number): number => {
          const v = Number(n);
          if (!Number.isFinite(v) || v < 0) return 0;
          return Math.round(v * 100) / 100;
        };
        return prev.map((r) =>
          r.id === existente.id
            ? {
                ...r,
                saldoFavor: saldo.activo
                  ? {
                      activo: true,
                      isr: limpiar(saldo.isr),
                      iva: limpiar(saldo.iva),
                      capturadoEn: ahora,
                    }
                  : undefined,
                sinPagoMotivo: saldo.activo
                  ? "saldo_favor"
                  : r.sinPagoMotivo === "saldo_favor"
                    ? undefined
                    : r.sinPagoMotivo,
                actualizadoEn: ahora,
              }
            : r
        );
      });
    },
    []
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
      adjuntosCliente?: ArchivoEncargo[];
      creadoPor: "admin" | "cliente";
    }): Encargo => {
      const ahora = new Date().toISOString();
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
        adjuntosCliente:
          params.adjuntosCliente && params.adjuntosCliente.length
            ? params.adjuntosCliente
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
        if (encargo.adjuntosCliente?.length) {
          partes.push(
            `${encargo.adjuntosCliente.length} archivo${encargo.adjuntosCliente.length === 1 ? "" : "s"} adjunto${encargo.adjuntosCliente.length === 1 ? "" : "s"}`
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
          titulo: `Registramos tu encargo: ${encargo.titulo}`,
          detalle: "Puedes ver el avance en Mis encargos del portal.",
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
        datosListos: hydrated,
        cloudSyncError,
        cloudSincronizando,
        recargarDesdeNube,
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
        aplicarDescuento,
        eliminarDescuento,
        subirComprobante,
        getComprobantePeriodo,
        getComprobantesCliente,
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

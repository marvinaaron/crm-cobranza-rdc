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
import {
  type RegistroRepse,
  type PeriodoRepse,
  type TipoDocumentoRepse,
  REPSE_META,
  nuevoIdRegistroRepse,
  nuevoIdDocRepse,
  periodoRepseLabel,
} from "@/lib/repse";

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
    opciones?: { omitirCorreo?: boolean; comprobanteId?: string }
  ) => Cliente | null;
  quitarPago: (clienteId: number, periodoPago: Periodo) => Cliente | null;
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
};

const ClientesContext = createContext<ClientesContextValue | null>(null);

function actualizarPagosCliente(
  cliente: Cliente,
  periodoPago: Periodo,
  monto: number | null,
  nota?: string,
  comprobanteId?: string
): Cliente {
  const anioStr = periodoAnioStr(periodoPago);
  const sinEsteMes = cliente.pagosRealizados.filter(
    (p) => !(p.mes === periodoPago.mes && p.anio === anioStr)
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
            ...(nota?.trim() ? { nota: nota.trim() } : {}),
            ...(comprobanteId ? { comprobanteId } : {}),
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
  const [hydrated, setHydrated] = useState(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
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
      setRegistrosRepse(data.repse);
    },
    []
  );

  const cargarDesdeNube = useCallback(async () => {
    try {
      const data = await cargarCrmDesdeNube();
      aplicarPayloadNube(data);
      setCloudSyncError(null);
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
          titulo: `Plazo vencido · ${CATEGORIA_META[cat].label}`,
          detalle:
            "Si ya pagaste, sube tu comprobante. Si aún no, escríbenos para generar una línea de captura extemporánea.",
          href: "/portal/cumplimiento",
        });
        agregarNotificacion({
          tipo: "vencimiento_sin_pago",
          destinatario: "admin",
          clienteId: reg.clienteId,
          periodo,
          categoria: cat,
          titulo: `${nombre} · ${CATEGORIA_META[cat].label}: plazo vencido sin pago`,
          detalle: "Genera línea de captura extemporánea o gestiónalo con el cliente.",
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
              (p.categoria ?? null) === (nueva.categoria ?? null)
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
    },
    []
  );

  const registrarPago = useCallback(
    (
      clienteId: number,
      periodoPago: Periodo,
      monto: number,
      nota?: string,
      opciones?: { omitirCorreo?: boolean; comprobanteId?: string }
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
            opciones?.comprobanteId
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
      if (actualizado && !opciones?.omitirCorreo) {
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
        titulo: `${nombreCliente(clienteId)} subió un comprobante`,
        detalle: `Aplica a: ${labels}. Ábrelo para revisarlo y validar el pago.`,
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
          titulo: `¡Recibimos tu pago de ${periodoLabel(periodoNotif)}!`,
          detalle:
            "Ya quedó aplicado. Te mandamos la factura en cuanto esté lista.",
          href: "/portal/honorarios",
        });
      }
      return actualizado;
    },
    [agregarNotificacion]
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
          titulo: `Necesitamos un nuevo comprobante de ${periodoLabel(periodoNotif)}`,
          detalle:
            "El archivo anterior no nos sirvió. Sube uno actualizado y nosotros lo aplicamos.",
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
        titulo: `Tu factura de ${periodoLabel(p)} ya está lista`,
        detalle: "Descárgala desde tu portal cuando gustes.",
        href: "/portal/honorarios",
      });
      return nuevo;
    },
    [agregarNotificacion]
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
          titulo: "Declaración del periodo lista (sin pago)",
          detalle:
            "No hubo impuestos a cargo. Ya subimos tu declaración a tu portal: estás al corriente.",
          href: "/portal/cumplimiento",
        });
        agregarNotificacion({
          tipo: "admin_sin_pago",
          destinatario: "admin",
          clienteId,
          periodo: p,
          titulo: `${nombre}: periodo cerrado en ceros`,
          detalle: "Declaración subida. Flujo marcado como completado.",
          href: "/cumplimiento",
        });
      } else {
        for (const cat of categoriasReciensCompletadas) {
          agregarNotificacion({
            tipo: "admin_documentos_listos",
            destinatario: "cliente",
            clienteId,
            periodo: p,
            categoria: cat,
            titulo: `${CATEGORIA_META[cat].label}: documentos listos`,
            detalle: "Ya tienes tus documentos. Realiza el pago y súbenos el comprobante.",
            href: "/portal/cumplimiento",
          });
          agregarNotificacion({
            tipo: "admin_documentos_listos",
            destinatario: "admin",
            clienteId,
            periodo: p,
            categoria: cat,
            titulo: `${nombre} · ${CATEGORIA_META[cat].label}: documentos publicados`,
            detalle: "El cliente ya puede verlos y subir su comprobante.",
            href: "/cumplimiento",
          });
        }
      }
      return resultado!;
    },
    [agregarNotificacion, nombreCliente]
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
        titulo: "Tu preliminar de impuestos está listo",
        detalle: "Revisa los importes y confírmanos cada categoría para continuar.",
        href: "/portal/cumplimiento",
      });
      agregarNotificacion({
        tipo: "admin_previo_publicado",
        destinatario: "admin",
        clienteId,
        periodo: p,
        titulo: `${nombre}: previo publicado`,
        detalle: "Esperando validación del cliente.",
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
        titulo: "Empezamos con tu contabilidad",
        detalle:
          "Ya estamos trabajando en tu información del periodo. Pronto tendrás tu preliminar de impuestos.",
        href: "/portal/cumplimiento",
      });
      agregarNotificacion({
        tipo: "admin_contabilidad_iniciada",
        destinatario: "admin",
        clienteId,
        periodo: p,
        titulo: `${nombre}: contabilidad iniciada`,
        detalle: "Pendiente publicar el preliminar de impuestos.",
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
        titulo: "Este periodo cierra en ceros",
        detalle:
          "No hay impuestos a pagar. Estamos preparando tu declaración para subirla a tu portal.",
        href: "/portal/cumplimiento",
      });
      agregarNotificacion({
        tipo: "admin_sin_pago",
        destinatario: "admin",
        clienteId,
        periodo: p,
        titulo: `${nombre}: declaración en ceros`,
        detalle: "Pendiente subir la declaración del SAT.",
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
          titulo: `${nombreCliente(clienteId)}: validó el previo`,
          detalle: "Ya puedes subir sus documentos fiscales del periodo.",
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
          titulo: `${nombreCliente(clienteId)}: validó el previo`,
          detalle: "Ya puedes subir sus documentos fiscales del periodo.",
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
          titulo: `${nombreCliente(clienteId)} · ${CATEGORIA_META[categoria].label}: comprobante recibido`,
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
          titulo: `${CATEGORIA_META[categoria].label}: pago confirmado`,
          detalle: "Validamos tu pago. ¡Quedas al corriente en esta categoría!",
          href: "/portal/cumplimiento",
        });
      }
      return resultado;
    },
    [agregarNotificacion]
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
        titulo: `Tu declaración ${meta.label} ya está cargada`,
        detalle: `Subimos tu ${meta.label} (${meta.autoridad}) del ${etiquetaPeriodo}. Descárgala desde tu portal cuando gustes.`,
        href: "/portal/cumplimiento",
      });
      agregarNotificacion({
        tipo: "admin_sin_pago",
        destinatario: "admin",
        clienteId,
        periodo: { mes: 0, anio: p.anio },
        titulo: `${nombre}: ${meta.label} subido (${etiquetaPeriodo})`,
        detalle: `Quedó disponible en su portal. Verifica que el otro documento esté completo.`,
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

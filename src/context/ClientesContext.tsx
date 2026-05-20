"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import {
  Cliente,
  CLIENTES_INICIALES,
  Periodo,
  getPeriodoHoy,
  getPeriodoFiscalVigente,
  generarAniosDisponibles,
  calcularEstado,
  periodoAnioStr,
  asegurarClienteIngresosDiversos,
} from "@/lib/clientes";
import {
  type ComprobantePago,
  loadComprobantes,
  saveComprobantes,
  getComprobantePeriodo as findComprobante,
  nuevoIdComprobante,
} from "@/lib/comprobantes";
import {
  type FacturaPago,
  loadFacturas,
  saveFacturas,
  filtrarFacturasAnioActual,
  getFacturaPeriodo as findFactura,
  nuevoIdFactura,
} from "@/lib/facturas";
import {
  type RegistroCumplimiento,
  type TipoDocumentoSingular,
  loadCumplimiento,
  saveCumplimiento,
  CUMPLIMIENTO_STORAGE_KEY,
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
} from "@/lib/cumplimiento";
import {
  categoriasHabilitadasCliente,
  categoriaAplicaCliente,
  categoriasConPagoEnPreview,
} from "@/lib/config-cumplimiento-cliente";
import {
  loadClientes,
  saveClientes,
  CLIENTES_STORAGE_KEY,
} from "@/lib/clientes-storage";
import {
  type PagoImpuestoHistorial,
  loadHistorialImpuestos,
  saveHistorialImpuestos,
  crearEntradaHistorial,
} from "@/lib/historial-impuestos";
import { abrirCorreoEvento } from "@/lib/correo-eventos";

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
  /** true cuando ya se leyó localStorage (evita “sin documentos” antes de cargar). */
  datosListos: boolean;
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
  registrarPago: (
    clienteId: number,
    periodoPago: Periodo,
    monto: number,
    nota?: string
  ) => Cliente | null;
  quitarPago: (clienteId: number, periodoPago: Periodo) => Cliente | null;
  subirComprobante: (
    clienteId: number,
    periodo: Periodo,
    archivo: ArchivoAdjunto
  ) => ComprobantePago;
  getComprobantePeriodo: (clienteId: number, periodo: Periodo) => ComprobantePago | undefined;
  marcarComprobanteVisto: (id: string) => void;
  subirFactura: (
    clienteId: number,
    periodo: Periodo,
    archivo: ArchivoAdjunto
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
};

const ClientesContext = createContext<ClientesContextValue | null>(null);

function actualizarPagosCliente(
  cliente: Cliente,
  periodoPago: Periodo,
  monto: number | null,
  nota?: string
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
  const [listaClientes, setListaClientes] = useState<Cliente[]>(() => loadClientes());
  const [comprobantes, setComprobantes] = useState<ComprobantePago[]>([]);
  const [facturas, setFacturas] = useState<FacturaPago[]>([]);
  const [cumplimiento, setCumplimiento] = useState<RegistroCumplimiento[]>([]);
  const [historialImpuestos, setHistorialImpuestos] = useState<PagoImpuestoHistorial[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const aniosDisponibles = useMemo(() => generarAniosDisponibles(), []);

  useEffect(() => {
    setComprobantes(loadComprobantes());
    setFacturas(loadFacturas());
    setCumplimiento(loadCumplimiento());
    setHistorialImpuestos(loadHistorialImpuestos());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveClientes(listaClientes);
  }, [listaClientes, hydrated]);

  useEffect(() => {
    if (hydrated) saveHistorialImpuestos(historialImpuestos);
  }, [historialImpuestos, hydrated]);

  /** Solo otras pestañas (portal vs admin); evita recargar datos viejos al cerrar un confirm(). */
  useEffect(() => {
    if (!hydrated) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === CUMPLIMIENTO_STORAGE_KEY) {
        setCumplimiento(loadCumplimiento());
      }
      if (e.key === CLIENTES_STORAGE_KEY) {
        setListaClientes(loadClientes());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrated]);

  useEffect(() => {
    if (hydrated) saveComprobantes(comprobantes);
  }, [comprobantes, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const limpias = filtrarFacturasAnioActual(facturas);
    if (limpias.length !== facturas.length) {
      setFacturas(limpias);
      return;
    }
    saveFacturas(facturas);
  }, [facturas, hydrated]);

  useEffect(() => {
    if (hydrated) saveCumplimiento(cumplimiento);
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

  const actualizarCliente = useCallback(
    (cliente: Cliente) => {
      const conEstado = { ...cliente, estado: calcularEstado(cliente, periodoHoy) };
      setListaClientes((prev) =>
        prev.map((c) => (c.id === conEstado.id ? conEstado : c))
      );
    },
    [periodoHoy]
  );

  const registrarPago = useCallback(
    (
      clienteId: number,
      periodoPago: Periodo,
      monto: number,
      nota?: string
    ): Cliente | null => {
      let actualizado: Cliente | null = null;
      setListaClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c;
          actualizado = actualizarPagosCliente(c, periodoPago, monto, nota);
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
      if (actualizado) {
        setTimeout(
          () => abrirCorreoEvento(actualizado!, periodoPago, "pago_confirmado"),
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

  const subirComprobante = useCallback(
    (clienteId: number, p: Periodo, archivo: ArchivoAdjunto): ComprobantePago => {
      const nuevo: ComprobantePago = {
        id: nuevoIdComprobante(),
        clienteId,
        mes: p.mes,
        anio: p.anio,
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        dataUrl: archivo.dataUrl,
        subidoEn: new Date().toISOString(),
        visto: false,
        estado: "pendiente",
      };
      setComprobantes((prev) => [
        ...prev.filter(
          (c) =>
            !(
              c.clienteId === clienteId &&
              c.mes === p.mes &&
              c.anio === p.anio
            )
        ),
        nuevo,
      ]);
      return nuevo;
    },
    []
  );

  const marcarComprobanteVisto = useCallback((id: string) => {
    setComprobantes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visto: true } : c))
    );
  }, []);

  const getFacturaPeriodo = useCallback(
    (clienteId: number, p: Periodo) => findFactura(facturas, clienteId, p),
    [facturas]
  );

  const subirFactura = useCallback(
    (clienteId: number, p: Periodo, archivo: ArchivoAdjunto): FacturaPago => {
      const nuevo: FacturaPago = {
        id: nuevoIdFactura(),
        clienteId,
        mes: p.mes,
        anio: p.anio,
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        dataUrl: archivo.dataUrl,
        subidoEn: new Date().toISOString(),
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
      return nuevo;
    },
    []
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
        return next;
      });
      return resultado!;
    },
    []
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
      return resultado!;
    },
    [listaClientes]
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
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente?.previewPublicadoEn) return prev;
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
      return resultado;
    },
    [aplicarValidacionPreview, listaClientes]
  );

  const confirmarPreviewCategoria = useCallback(
    (
      clienteId: number,
      p: Periodo,
      categoria: CategoriaId
    ): RegistroCumplimiento | null => {
      let resultado: RegistroCumplimiento | null = null;
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente?.previewPublicadoEn) return prev;
        const next = prev.map((r) =>
          r.id === existente.id
            ? aplicarValidacionPreview(r, clienteId, [categoria])
            : r
        );
        resultado = findCumplimiento(next, clienteId, p) ?? null;
        return next;
      });
      return resultado;
    },
    [aplicarValidacionPreview]
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
            setHistorialImpuestos((h) => [...nuevas, ...h]);
          }
        }

        return next;
      });
      return resultado;
    },
    [listaClientes]
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
        registrarPago,
        quitarPago,
        subirComprobante,
        getComprobantePeriodo,
        marcarComprobanteVisto,
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
        publicarPreviewImpuestos,
        marcarPreviewNotificado,
        confirmarPreviewCliente,
        confirmarPreviewCategoria,
        subirComprobantePagoImpuestos,
        marcarRecordatorioLimiteEnviado,
        eliminarPreviewImpuestos,
        publicarExtemporaneo,
        getHistorialImpuestosCliente,
      }}
    >
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

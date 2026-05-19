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
  getCumplimientoPeriodo as findCumplimiento,
  nuevoIdCumplimiento,
  nuevoIdDocumento,
  registroTieneContenido,
} from "@/lib/cumplimiento";
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

type ClientesContextValue = {
  listaClientes: Cliente[];
  comprobantes: ComprobantePago[];
  facturas: FacturaPago[];
  cumplimiento: RegistroCumplimiento[];
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
    metadata?: MetadataCumplimiento
  ) => RegistroCumplimiento;
  actualizarMetadataCumplimiento: (
    clienteId: number,
    periodo: Periodo,
    metadata: MetadataCumplimiento
  ) => RegistroCumplimiento | null;
  eliminarDocumentoCumplimiento: (
    clienteId: number,
    periodo: Periodo,
    tipo: TipoDocumentoSingular
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
  const [listaClientes, setListaClientes] = useState<Cliente[]>(() =>
    asegurarClienteIngresosDiversos(CLIENTES_INICIALES)
  );
  const [comprobantes, setComprobantes] = useState<ComprobantePago[]>([]);
  const [facturas, setFacturas] = useState<FacturaPago[]>([]);
  const [cumplimiento, setCumplimiento] = useState<RegistroCumplimiento[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const aniosDisponibles = useMemo(() => generarAniosDisponibles(), []);

  useEffect(() => {
    setComprobantes(loadComprobantes());
    setFacturas(loadFacturas());
    setCumplimiento(loadCumplimiento());
    setHydrated(true);
  }, []);

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
      const nuevo: RegistroCumplimiento = {
        id: nuevoIdCumplimiento(),
        clienteId,
        mes: p.mes,
        anio: p.anio,
        montoImpuesto: patch.montoImpuesto ?? 0,
        fechaLimite: patch.fechaLimite ?? "",
        actualizadoEn: ahora,
        ...patch,
      };
      return [...prev, nuevo];
    },
    []
  );

  const subirDocumentoCumplimiento = useCallback(
    (
      clienteId: number,
      p: Periodo,
      tipo: TipoDocumentoSingular,
      archivo: ArchivoAdjunto,
      metadata?: MetadataCumplimiento
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
        const patch: Partial<RegistroCumplimiento> = { [tipo]: doc };
        if (tipo === "impuestos" && metadata) {
          patch.montoImpuesto = metadata.montoImpuesto;
          patch.fechaLimite = metadata.fechaLimite;
        } else if (existente) {
          patch.montoImpuesto = existente.montoImpuesto;
          patch.fechaLimite = existente.fechaLimite;
        }
        const next = upsertCumplimiento(prev, clienteId, p, patch);
        resultado = findCumplimiento(next, clienteId, p);
        return next;
      });
      return resultado!;
    },
    [upsertCumplimiento]
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
    (clienteId: number, p: Periodo, tipo: TipoDocumentoSingular) => {
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente) return prev;
        const actualizado: RegistroCumplimiento = {
          ...existente,
          actualizadoEn: new Date().toISOString(),
        };
        delete actualizado[tipo];
        if (!registroTieneContenido(actualizado)) {
          return prev.filter((r) => r.id !== existente.id);
        }
        return prev.map((r) => (r.id === existente.id ? actualizado : r));
      });
    },
    []
  );

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
        const nomina = [...(existente?.nomina ?? []), doc];
        const next = upsertCumplimiento(prev, clienteId, p, {
          nomina,
          montoImpuesto: existente?.montoImpuesto ?? 0,
          fechaLimite: existente?.fechaLimite ?? "",
        });
        resultado = findCumplimiento(next, clienteId, p);
        return next;
      });
      return resultado!;
    },
    [upsertCumplimiento]
  );

  const eliminarArchivoNomina = useCallback(
    (clienteId: number, p: Periodo, archivoId: string) => {
      setCumplimiento((prev) => {
        const existente = findCumplimiento(prev, clienteId, p);
        if (!existente?.nomina?.length) return prev;
        const actualizado: RegistroCumplimiento = {
          ...existente,
          nomina: existente.nomina.filter((d) => d.id !== archivoId),
          actualizadoEn: new Date().toISOString(),
        };
        if (!actualizado.nomina?.length) delete actualizado.nomina;
        if (!registroTieneContenido(actualizado)) {
          return prev.filter((r) => r.id !== existente.id);
        }
        return prev.map((r) => (r.id === existente.id ? actualizado : r));
      });
    },
    []
  );

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
        agregarArchivoNomina,
        eliminarArchivoNomina,
        marcarCumplimientoNotificado,
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

"use client";

import { useState, useMemo, useCallback } from "react";
import { useAdminDeepLink } from "@/hooks/useAdminDeepLink";
import { useClientes } from "@/context/ClientesContext";
import {
  MESES_NOM,
  type Cliente,
  type Periodo,
  getTotalDeudaPendiente,
  getTotalExtraPorCobrar,
  getMontoMes,
  estaPagado,
  tienePagoParcial,
  getCompromisoMes,
  getSaldoMes,
  calcularEstado,
  type EstadoCliente,
  periodoLabel,
  periodoKey,
  clienteActivoEnPeriodo,
  esIngresoGeneralCliente,
  getNotaPago,
  getMontoPagado,
  getDescuentoMes,
  getMontoDescuento,
  getMontoAdicionalMes,
  getServiciosAdicionalesAnio,
  getTotalAdicionalesAnio,
  getTotalHonorariosCliente,
} from "@/lib/clientes";
import ModalIngresoExtra from "@/components/ModalIngresoExtra";
import EstadoBadge from "@/components/EstadoBadge";
import {
  abrirCorreoCobranza,
  copiarCorreoHtml,
  getPortalClienteUrl,
  filtrarClientesParaCorreo,
  filtrarClientesElegiblesCorreo,
  getCorreoIndividualCliente,
  enviarCorreosMasivo,
  CORREO_TIPOS,
  type TipoCorreoCobranza,
} from "@/lib/correo";
import BotonCorreoCliente from "@/components/admin/BotonCorreoCliente";
import { useConfirm, useNotify } from "@/components/ConfirmProvider";
import ToastExito from "@/components/ToastExito";
import MesPagoFila from "@/components/admin/MesPagoFila";
import { formatFechaComprobante } from "@/lib/comprobantes";
import ModalCampanaCorreo from "@/components/ModalCampanaCorreo";
import ModalSubirFactura from "@/components/ModalSubirFactura";
import BotonFacturaCobranza from "@/components/BotonFacturaCobranza";
import ModalRevisarComprobante from "@/components/ModalRevisarComprobante";
import CobranzaCardMovil from "@/components/admin/CobranzaCardMovil";
import PanelDetalleCliente from "@/components/admin/PanelDetalleCliente";
import { getWorkflowMesCliente } from "@/lib/cobranza-workflow";
import WorkflowCircleMini from "@/components/admin/WorkflowCircleMini";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

type FiltroCobranza =
  | "todos"
  | "pendientes"
  | "atrasados"
  | "corrientes"
  | "comprobantes"
  | "por_cobrar_mes"
  | "cobrado_mes"
  | "pendiente_acumulado"
  | "clientes_atrasados"
  | "facturacion_pendiente"
  | "comprobantes_revisar";

function etiquetaCompromisoMes(
  pagadoMes: boolean,
  parcialMes: boolean,
  estado: EstadoCliente
): { texto: string; clase: string } {
  if (pagadoMes) return { texto: "Pagado", clase: "text-green-500" };
  if (parcialMes)
    return { texto: "Pagado parcialmente", clase: "text-amber-600" };
  if (estado === "ATRASADO")
    return { texto: "Pendiente de pago", clase: "text-red-500" };
  return { texto: "Pendiente de pago", clase: "text-amber-500" };
}

function clasePendienteTotal(estado: EstadoCliente, monto: number): string {
  if (monto <= 0) return "text-slate-300";
  if (estado === "ATRASADO") return "text-red-600";
  if (estado === "PENDIENTE") return "text-amber-600";
  return "text-indigo-600";
}

function coincideFiltroKpi(
  filtro: FiltroCobranza,
  cliente: Cliente,
  periodo: Periodo
): boolean {
  if (!clienteActivoEnPeriodo(cliente, periodo)) return false;
  switch (filtro) {
    case "por_cobrar_mes":
      return !estaPagado(cliente, periodo);
    case "cobrado_mes":
      return estaPagado(cliente, periodo);
    case "pendiente_acumulado":
      return getTotalDeudaPendiente(cliente, periodo) > 0;
    case "clientes_atrasados":
      return calcularEstado(cliente, periodo) === "ATRASADO";
    default:
      return true;
  }
}

export default function CobranzaPage() {
  const {
    listaClientes,
    periodo,
    comprobantesNuevos,
    getComprobantePeriodo,
    getFacturaPeriodo,
    getCumplimientoPeriodo,
    marcarComprobanteVisto,
    quitarPago,
    marcarRecordatorio,
  } = useClientes();
  const mesesNom = MESES_NOM;
  const mesLabel = periodoLabel(periodo);

  const [filtro, setFiltro] = useState<FiltroCobranza>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  // Mes con el que arranca el panel cuando el usuario abre directo
  // desde un botón "Registrar pago" / pill de mes. Si es null, el
  // panel usa el periodo global del CRM.
  const [periodoPanelInicial, setPeriodoPanelInicial] = useState<Periodo | null>(null);
  const [htmlCopiado, setHtmlCopiado] = useState<TipoCorreoCobranza | null>(null);
  const [campanaRevision, setCampanaRevision] = useState<TipoCorreoCobranza | null>(null);
  const [facturaModal, setFacturaModal] = useState<{ cliente: Cliente; periodo: Periodo } | null>(null);
  const [revisarComprobante, setRevisarComprobante] = useState<{
    cliente: Cliente;
    periodo: Periodo;
  } | null>(null);
  const [ingresoExtraAbierto, setIngresoExtraAbierto] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [toastBatch, setToastBatch] = useState<string | null>(null);
  const [toastDetalle, setToastDetalle] = useState<string | null>(null);
  const [mesSwipeAbierto, setMesSwipeAbierto] = useState<string | null>(null);
  const notify = useNotify();
  const confirm = useConfirm();

  const abrirRevisarComprobante = useCallback(
    (cliente: Cliente) => {
      const cmp = getComprobantePeriodo(cliente.id, periodo);
      if (cmp && !cmp.visto) marcarComprobanteVisto(cmp.id);
      setRevisarComprobante({ cliente, periodo });
    },
    [periodo, getComprobantePeriodo, marcarComprobanteVisto]
  );

  useAdminDeepLink({
    listaClientes,
    onCliente: setSelectedClient,
    onFiltro: (f) => setFiltro(f as FiltroCobranza),
    onRevisarCliente: abrirRevisarComprobante,
    filtrosValidos: [
      "todos",
      "pendientes",
      "atrasados",
      "corrientes",
      "comprobantes",
      "por_cobrar_mes",
      "cobrado_mes",
      "pendiente_acumulado",
      "clientes_atrasados",
      "facturacion_pendiente",
      "comprobantes_revisar",
    ],
  });

  const clientesActivos = useMemo(
    () => listaClientes.filter((c) => c.activo),
    [listaClientes]
  );

  const resumen = useMemo(() => {
    let porCobrarMes = 0;
    let cobradoMes = 0;
    let pendienteAcumulado = 0;
    let clientesAtrasados = 0;
    let facturacionPendiente = 0;
    let comprobantesRevisar = 0;

    clientesActivos.forEach((c) => {
      if (!clienteActivoEnPeriodo(c, periodo)) return;
      const cmp = getComprobantePeriodo(c.id, periodo);
      if (cmp && cmp.estado === "pendiente" && !cmp.visto) comprobantesRevisar += 1;
      const montoMes = getMontoMes(c, periodo);
      const pagado = getMontoPagado(c, periodo);
      if (esIngresoGeneralCliente(c)) {
        cobradoMes += pagado;
        return;
      }
      if (estaPagado(c, periodo)) {
        cobradoMes += montoMes;
        if (!getFacturaPeriodo(c.id, periodo)) facturacionPendiente += 1;
      } else porCobrarMes += getCompromisoMes(c, periodo);
      pendienteAcumulado += getTotalDeudaPendiente(c, periodo);
      if (calcularEstado(c, periodo) === "ATRASADO") clientesAtrasados += 1;
    });

    // Los ingresos adicionales (servicios extra y meses atrasados a tarifa
    // distinta) son dinero efectivamente cobrado: suman al cobrado del mes
    // aunque el cliente no esté "activo" ese mes, sin tocar lo esperado.
    clientesActivos.forEach((c) => {
      cobradoMes += getMontoAdicionalMes(c, periodo);
    });

    return {
      porCobrarMes,
      cobradoMes,
      pendienteAcumulado,
      clientesAtrasados,
      facturacionPendiente,
      comprobantesRevisar,
    };
  }, [clientesActivos, periodo, getComprobantePeriodo, getFacturaPeriodo]);

  const clientesFiltrados = useMemo(() => {
    const filtrados = clientesActivos.filter((c) => {
      const matchesSearch =
        c.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.rfc.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      const estado = calcularEstado(c, periodo);
      if (filtro === "por_cobrar_mes" || filtro === "cobrado_mes" || filtro === "pendiente_acumulado" || filtro === "clientes_atrasados") {
        return coincideFiltroKpi(filtro, c, periodo);
      }
      if (filtro === "facturacion_pendiente") {
        if (esIngresoGeneralCliente(c) || !clienteActivoEnPeriodo(c, periodo))
          return false;
        return estaPagado(c, periodo) && !getFacturaPeriodo(c.id, periodo);
      }
      if (filtro === "comprobantes_revisar") {
        if (!clienteActivoEnPeriodo(c, periodo)) return false;
        const cmp = getComprobantePeriodo(c.id, periodo);
        return !!cmp && cmp.estado === "pendiente" && !cmp.visto;
      }
      if (filtro === "todos") return true;
      if (filtro === "pendientes") return estado === "PENDIENTE";
      if (filtro === "atrasados") return estado === "ATRASADO";
      if (filtro === "corrientes") return estado === "AL CORRIENTE";
      if (filtro === "comprobantes") {
        const cmp = getComprobantePeriodo(c.id, periodo);
        return !!cmp && cmp.estado === "pendiente" && !cmp.visto;
      }
      return true;
    });
    // Ingresos Diversos / generales SIEMPRE al final, sin importar ordenamiento previo.
    return [...filtrados].sort((a, b) => {
      const aGen = esIngresoGeneralCliente(a) ? 1 : 0;
      const bGen = esIngresoGeneralCliente(b) ? 1 : 0;
      return aGen - bGen;
    });
  }, [clientesActivos, searchTerm, filtro, periodo, getComprobantePeriodo, getFacturaPeriodo]);

  const abrirDetalleCliente = (cli: Cliente) => {
    const cmp = getComprobantePeriodo(cli.id, periodo);
    if (cmp && !cmp.visto) marcarComprobanteVisto(cmp.id);
    setSelectedClient(listaClientes.find((c) => c.id === cli.id) ?? cli);
  };

  // Antes esto abría un modal pequeño aparte (`ModalRegistrarPago`).
  // Ahora abre el panel grande (split 50/50) posicionado en el mes
  // que el usuario eligió. Si no llega `periodoMes`, usa el periodo
  // global del CRM como ya hacía `abrirDetalleCliente`.
  const abrirModalPago = (e: React.MouseEvent, cliente: Cliente, periodoMes?: Periodo) => {
    e.stopPropagation();
    const cmp = getComprobantePeriodo(cliente.id, periodo);
    if (cmp && !cmp.visto) marcarComprobanteVisto(cmp.id);
    setPeriodoPanelInicial(periodoMes ?? null);
    setSelectedClient(listaClientes.find((c) => c.id === cliente.id) ?? cliente);
  };

  const cerrarPanelCliente = () => {
    setSelectedClient(null);
    setPeriodoPanelInicial(null);
  };

  const onPagoAplicado = (cliente: Cliente) => {
    if (selectedClient?.id === cliente.id) setSelectedClient(cliente);
  };

  const hoy = useMemo(() => new Date(), []);

  const campanasCorreo = useMemo(() => {
    const tipos: TipoCorreoCobranza[] = ["recordatorio", "vencido", "cierre_mes"];
    return tipos.map((tipo) => {
      const elegibles = filtrarClientesElegiblesCorreo(tipo, clientesActivos, periodo, hoy);
      const programadosHoy = filtrarClientesParaCorreo(tipo, clientesActivos, periodo, hoy);
      return {
        tipo,
        ...CORREO_TIPOS[tipo],
        clientes: elegibles,
        programadosHoy: programadosHoy.length,
      };
    });
  }, [clientesActivos, periodo, hoy]);

  const enviarCorreo = (cliente: Cliente, tipo: TipoCorreoCobranza) => {
    abrirCorreoCobranza(cliente, periodo, tipo);
  };

  const clientesSeleccionados = useMemo(
    () => listaClientes.filter((c) => seleccionados.has(c.id)),
    [listaClientes, seleccionados]
  );

  const enviarCorreoEnLote = async (tipo: TipoCorreoCobranza) => {
    const elegibles = filtrarClientesElegiblesCorreo(
      tipo,
      clientesSeleccionados,
      periodo,
      hoy
    );
    if (elegibles.length === 0) {
      notify({
        titulo: "Sin destinatarios elegibles",
        mensaje:
          "Los clientes seleccionados no califican para este tipo de correo en este periodo.",
      });
      return;
    }
    enviarCorreosMasivo(elegibles, periodo, tipo);
    setToastBatch(`${elegibles.length} correos abiertos`);
    setTimeout(() => setToastBatch(null), 1600);
  };

  const copiarEmailsEnLote = async () => {
    const emails = clientesSeleccionados
      .map((c) => c.email?.trim())
      .filter((e): e is string => !!e);
    if (emails.length === 0) {
      notify({
        titulo: "Sin correos",
        mensaje: "Ninguno de los clientes seleccionados tiene correo registrado.",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setToastBatch(`${emails.length} correos copiados`);
      setTimeout(() => setToastBatch(null), 1600);
    } catch {
      notify({
        titulo: "No se pudo copiar",
        mensaje: "Tu navegador bloqueó el portapapeles. Inténtalo de nuevo.",
      });
    }
  };

  const handleEliminarPagoMes = async (cliente: Cliente, p: Periodo) => {
    const ok = await confirm({
      titulo: `Eliminar pago de ${periodoLabel(p)}`,
      mensaje: `¿Seguro que quieres quitar el pago aplicado de ${cliente.razonSocial}? El mes regresará a pendiente y podrás registrarlo de nuevo después.`,
      textoConfirmar: "Sí, eliminar",
      textoCancelar: "Cancelar",
      tono: "danger",
    });
    if (!ok) {
      setMesSwipeAbierto(null);
      return;
    }
    const actualizado = quitarPago(cliente.id, p);
    if (actualizado) {
      onPagoAplicado(actualizado);
      setToastDetalle(`Pago de ${periodoLabel(p)} eliminado`);
      setTimeout(() => setToastDetalle(null), 1600);
    }
    setMesSwipeAbierto(null);
  };

  const exportarSeleccionadosCSV = () => {
    if (clientesSeleccionados.length === 0) return;
    const enc = ["Razón social", "RFC", "Correo", "Día pago", "Pendiente"]
      .map((h) => `"${h}"`)
      .join(",");
    const filas = clientesSeleccionados.map((c) => {
      const pend = getTotalDeudaPendiente(c, periodo);
      return [c.razonSocial, c.rfc, c.email ?? "", String(c.fechaPago), String(pend)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [enc, ...filas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cobranza-${periodo.anio}-${String(periodo.mes + 1).padStart(2, "0")}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToastBatch(`${clientesSeleccionados.length} clientes exportados`);
    setTimeout(() => setToastBatch(null), 1600);
  };

  const copiarCorreoConFormato = async (cliente: Cliente, tipo: TipoCorreoCobranza) => {
    await copiarCorreoHtml(cliente, periodo, tipo);
    setHtmlCopiado(tipo);
    setTimeout(() => setHtmlCopiado(null), 2000);
  };

  const clientesCampanaActiva = useMemo(() => {
    if (!campanaRevision) return [];
    return filtrarClientesElegiblesCorreo(campanaRevision, clientesActivos, periodo, hoy);
  }, [campanaRevision, clientesActivos, periodo, hoy]);

  const hayModal =
    selectedClient ||
    campanaRevision ||
    facturaModal ||
    revisarComprobante ||
    ingresoExtraAbierto;

  const abrirModalFactura = (e: React.MouseEvent, cliente: Cliente, p: Periodo) => {
    e.stopPropagation();
    setFacturaModal({ cliente, periodo: p });
  };

  const abrirRevisionComprobante = (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation();
    const cmp = getComprobantePeriodo(cliente.id, periodo);
    if (cmp && !cmp.visto) marcarComprobanteVisto(cmp.id);
    setRevisarComprobante({ cliente, periodo });
  };

  const tarjetasKpi = [
    {
      filtro: "cobrado_mes" as const,
      label: `Cobrado (${mesesNom[periodo.mes]})`,
      value: resumen.cobradoMes,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
      ring: "ring-emerald-400",
    },
    {
      filtro: "por_cobrar_mes" as const,
      label: `Por cobrar (${mesesNom[periodo.mes]})`,
      value: resumen.porCobrarMes,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
      ring: "ring-amber-400",
    },
    {
      filtro: "pendiente_acumulado" as const,
      label: "Pendiente acumulado",
      value: resumen.pendienteAcumulado,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-100",
      ring: "ring-indigo-400",
    },
    {
      filtro: "clientes_atrasados" as const,
      label: "Clientes atrasados",
      value: resumen.clientesAtrasados,
      color: "text-red-600",
      bg: "bg-red-50 border-red-100",
      ring: "ring-red-400",
      esCantidad: true,
    },
    {
      filtro: "facturacion_pendiente" as const,
      label: "Facturación pendiente",
      value: resumen.facturacionPendiente,
      color: "text-violet-600",
      bg: "bg-violet-50 border-violet-100",
      ring: "ring-violet-400",
      esCantidad: true,
    },
    {
      filtro: "comprobantes_revisar" as const,
      label: "Comprobantes por revisar",
      value: resumen.comprobantesRevisar,
      color: "text-sky-600",
      bg: "bg-sky-50 border-sky-100",
      ring: "ring-sky-400",
      esCantidad: true,
    },
  ];

  const alternarFiltroKpi = (clave: FiltroCobranza) => {
    setFiltro((actual) => (actual === clave ? "todos" : clave));
  };

  const filtrosTab: FiltroCobranza[] = [
    "todos",
    "pendientes",
    "atrasados",
    "corrientes",
    "comprobantes",
  ];

  return (
    <div className="relative font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      {hayModal && (
        <div
          className="fixed inset-0 z-[45] bg-slate-900/10 backdrop-blur-sm transition-all"
          onClick={() => {
            cerrarPanelCliente();
            setCampanaRevision(null);
            setFacturaModal(null);
            setRevisarComprobante(null);
            setIngresoExtraAbierto(false);
          }}
        />
      )}

      <main
        className={`w-full transition-all duration-500 ${hayModal ? "blur-md scale-[0.98]" : ""}`}
      >
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">
                Operación mensual
              </p>
              <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter leading-none text-slate-800">
                Centro de Cobranza
              </h1>
              <p className="font-black mt-2 text-sm text-blue-600">{mesLabel}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIngresoExtraAbierto(true)}
                title="Registrar ingreso extra o diverso"
                className="flex items-center justify-center gap-2 h-11 lg:h-12 px-5 rounded-full bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-violet-700 shadow-md shadow-violet-600/25 transition-all"
              >
                <PlusIcon />
                Ingreso extra
              </button>
              <div className="relative flex items-center bg-white border border-slate-100 rounded-full h-11 lg:h-12 shadow-sm overflow-hidden lg:group lg:w-12 lg:hover:w-72 transition-all duration-500">
                <div className="absolute left-0 w-11 lg:w-12 h-11 lg:h-12 flex items-center justify-center text-slate-400 lg:group-hover:text-emerald-600 pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Buscar cliente o RFC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 lg:h-12 pl-11 lg:pl-12 pr-4 font-bold text-slate-600 outline-none text-sm bg-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-8 px-1 lg:px-0">
            {tarjetasKpi.map((card) => {
              const activa = filtro === card.filtro;
              return (
                <button
                  key={card.filtro}
                  type="button"
                  onClick={() => alternarFiltroKpi(card.filtro)}
                  title={activa ? "Clic para quitar filtro" : "Clic para ver clientes de esta categoría"}
                  className={`p-4 lg:p-5 rounded-2xl lg:rounded-3xl border shadow-sm text-left transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${card.bg} ${
                    activa ? `ring-2 ring-offset-1 ${card.ring} shadow-md` : ""
                  }`}
                >
                  <p className="text-[8px] lg:text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 lg:mb-2 leading-tight">
                    {card.label}
                    {activa && <span className="ml-1.5 text-emerald-600">· filtrando</span>}
                  </p>
                  <p className={`text-xl lg:text-2xl font-black tabular-nums ${card.color}`}>
                    {card.esCantidad ? card.value : `$${card.value.toLocaleString()}`}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {(
                [
                  ["todos", "Todos"],
                  ["pendientes", "Pendientes"],
                  ["atrasados", "Atrasados"],
                  ["corrientes", "Al corriente"],
                  ["comprobantes", "Comprobantes"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFiltro(key)}
                  className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                    filtrosTab.includes(filtro) && filtro === key
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-slate-300 hover:text-slate-500"
                  }`}
                >
                  {label}
                  {key === "comprobantes" && comprobantesNuevos > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[8px] flex items-center justify-center">
                      {comprobantesNuevos}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mr-1 shrink-0">Correos</span>
              {campanasCorreo.map(({ tipo, labelCorto, clientes, programadosHoy }) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setCampanaRevision(tipo)}
                  title={`${CORREO_TIPOS[tipo].descripcion} · Clic para revisar lista`}
                  className={`inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all ${
                    clientes.length > 0
                      ? "border-slate-300 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-sm"
                      : "border-slate-100 text-slate-300 cursor-default"
                  }`}
                >
                  <MailIcon />
                  {labelCorto}
                  <span
                    className={`min-w-[20px] h-5 px-1.5 rounded-md text-[9px] font-black flex items-center justify-center ${
                      clientes.length > 0
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {clientes.length}
                  </span>
                  {programadosHoy > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Hay envíos programados para hoy" />
                  )}
                </button>
              ))}
            </div>
          </div>


          {/* Vista móvil: tarjetas */}
          <div className="lg:hidden space-y-3 pb-4 px-1">
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cli) => {
                const esGeneral = esIngresoGeneralCliente(cli);
                const pagadoMes = estaPagado(cli, periodo);
                const comprobante = getComprobantePeriodo(cli.id, periodo);
                const factura = getFacturaPeriodo(cli.id, periodo);
                return (
                  <CobranzaCardMovil
                    key={cli.id}
                    cliente={cli}
                    periodo={periodo}
                    mesLabel={mesesNom[periodo.mes]}
                    hoy={hoy}
                    comprobanteNuevo={!!comprobante && !comprobante.visto}
                    comprobanteEstado={comprobante?.estado}
                    factura={factura}
                    pagadoMes={pagadoMes}
                    onSelect={abrirDetalleCliente}
                    onRegistrarPago={(e, c) => {
                      if (esGeneral) setIngresoExtraAbierto(true);
                      else abrirModalPago(e, c);
                    }}
                    onRevisarComprobante={abrirRevisionComprobante}
                    onFactura={(e, c) => abrirModalFactura(e, c, periodo)}
                    notify={notify}
                  />
                );
              })
            ) : (
              <p className="text-center py-12 text-slate-300 font-bold uppercase tracking-widest text-[11px]">
                No hay clientes en este filtro
              </p>
            )}
          </div>

          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#FBFBFF] text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-50">
                <tr>
                  <th className="pl-6 pr-2 py-5 w-10">
                    <input
                      type="checkbox"
                      aria-label="Seleccionar todos"
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600"
                      checked={
                        clientesFiltrados.length > 0 &&
                        clientesFiltrados.every((c) => seleccionados.has(c.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeleccionados(
                            new Set(clientesFiltrados.map((c) => c.id))
                          );
                        } else {
                          setSeleccionados(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5 text-center">Día pago</th>
                  <th className="px-6 py-5 text-center">Compromiso {mesLabel}</th>
                  <th className="px-6 py-5 text-center">Pendiente total</th>
                  <th className="px-6 py-5 text-center">Estatus</th>
                  <th className="px-6 py-5 text-center">Comprobante</th>
                  <th className="px-6 py-5 text-center">Factura</th>
                  <th
                    className="px-4 py-5 text-center"
                    title="Avance operativo del cliente este mes: contabilidad, línea de captura, pago de honorarios y factura."
                  >
                    Workflow
                  </th>
                  <th className="px-6 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((cli) => {
                    const esGeneral = esIngresoGeneralCliente(cli);
                    const pagadoMes = estaPagado(cli, periodo);
                    const parcialMes = tienePagoParcial(cli, periodo);
                    const pagadoPeriodo = getMontoPagado(cli, periodo);
                    const montoMes = esGeneral
                      ? pagadoPeriodo
                      : pagadoMes || parcialMes
                        ? getMontoMes(cli, periodo)
                        : getCompromisoMes(cli, periodo);
                    const comprobante = getComprobantePeriodo(cli.id, periodo);
                    const factura = getFacturaPeriodo(cli.id, periodo);
                    const registroCump = getCumplimientoPeriodo(cli.id, periodo);
                    const workflow = getWorkflowMesCliente(
                      cli,
                      periodo,
                      registroCump
                    );
                    const correoInd = getCorreoIndividualCliente(cli, periodo, hoy);
                    const estado = calcularEstado(cli, periodo);
                    const etiquetaMes = etiquetaCompromisoMes(pagadoMes, parcialMes, estado);
                    const pendienteTotal = getTotalDeudaPendiente(cli, periodo);
                    const extraPorCobrar = getTotalExtraPorCobrar(cli);

                    return (
                      <tr
                        key={cli.id}
                        onClick={() => abrirDetalleCliente(cli)}
                        className={`hover:bg-slate-50/50 cursor-pointer group transition-all ${comprobante && !comprobante.visto ? "bg-indigo-50/40" : ""} ${esGeneral ? "bg-violet-50/20" : ""} ${seleccionados.has(cli.id) ? "bg-violet-50/60" : ""}`}
                      >
                        <td
                          className="pl-6 pr-2 py-4 w-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            aria-label={`Seleccionar ${cli.razonSocial}`}
                            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600"
                            checked={seleccionados.has(cli.id)}
                            onChange={() => {
                              setSeleccionados((prev) => {
                                const next = new Set(prev);
                                if (next.has(cli.id)) next.delete(cli.id);
                                else next.add(cli.id);
                                return next;
                              });
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-lg text-slate-700 group-hover:text-emerald-600 transition-colors flex items-center gap-2 flex-wrap">
                            {cli.razonSocial}
                            {esGeneral && (
                              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                                General
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-300 uppercase mt-0.5 tracking-widest">{cli.rfc}</p>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-slate-700 text-base">
                          {esGeneral ? "—" : `Día ${cli.fechaPago}`}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="font-black text-slate-700 text-lg">
                            {esGeneral && pagadoPeriodo === 0
                              ? "—"
                              : `$${montoMes.toLocaleString()}`}
                          </p>
                          <p
                            className={`text-[9px] font-black uppercase mt-0.5 tracking-widest ${
                              esGeneral ? "text-violet-600" : etiquetaMes.clase
                            }`}
                          >
                            {esGeneral
                              ? pagadoPeriodo > 0
                                ? "Ingreso registrado"
                                : "Sin ingreso en el mes"
                              : etiquetaMes.texto}
                          </p>
                        </td>
                        <td className={`px-6 py-4 text-center font-black ${clasePendienteTotal(estado, pendienteTotal)}`}>
                          ${pendienteTotal.toLocaleString()}
                          {!esGeneral && extraPorCobrar > 0 && (
                            <p className="text-[8px] font-bold uppercase tracking-widest text-amber-600/90 mt-0.5">
                              incl. {extraPorCobrar.toLocaleString()} extra
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <EstadoBadge cliente={cli} periodo={periodo} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          {comprobante ? (
                            <button
                              type="button"
                              onClick={(e) => abrirRevisionComprobante(e, cli)}
                              title="Revisar comprobante enviado por el cliente"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                comprobante.estado === "aceptado"
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  : !comprobante.visto
                                    ? "bg-indigo-600 text-white animate-pulse hover:bg-indigo-700"
                                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                              }`}
                            >
                              <TicketIcon />
                              {comprobante.estado === "aceptado"
                                ? "Validado"
                                : !comprobante.visto
                                  ? "Nuevo"
                                  : "Validar"}
                            </button>
                          ) : (
                            <span className="text-slate-200 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <BotonFacturaCobranza
                            factura={factura}
                            pagadoMes={pagadoMes}
                            onClick={(e) => abrirModalFactura(e, cli, periodo)}
                          />
                        </td>
                        <td
                          className="px-4 py-4"
                          onClick={(e) => e.stopPropagation()}
                          title="Avance del cliente en el mes seleccionado"
                        >
                          <WorkflowCircleMini resumen={workflow} />
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          {/* Correo inteligente con menú híbrido:
                              "Enviar ahora" (Resend con plantilla HTML)
                              o "Abrir en Gmail" (mailto: texto plano).
                              El tipo de correo (recordatorio / vencido /
                              cierre con historial) lo decide
                              `getCorreoIndividualCliente` según el
                              estatus del cliente este mes. */}
                          <div className="flex items-center justify-end">
                            <BotonCorreoCliente
                              cliente={cli}
                              periodo={periodo}
                              tipo={correoInd.habilitado ? correoInd.tipo : "recordatorio"}
                              habilitado={correoInd.habilitado}
                              motivo={correoInd.habilitado ? undefined : correoInd.motivo}
                              titulo={correoInd.habilitado ? correoInd.titulo : undefined}
                              descripcion={correoInd.habilitado ? correoInd.descripcion : undefined}
                              notify={notify}
                              onContactado={(via) =>
                                marcarRecordatorio(
                                  cli.id,
                                  periodo,
                                  correoInd.habilitado ? correoInd.tipo : "recordatorio",
                                  via
                                )
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-10 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px]">
                      No hay clientes en este filtro
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedClient && (
        <PanelDetalleCliente
          cliente={selectedClient}
          periodoVisible={periodoPanelInicial ?? periodo}
          onClose={cerrarPanelCliente}
          onAbrirFactura={(p) =>
            setFacturaModal({ cliente: selectedClient, periodo: p })
          }
          onAbrirIngresoExtra={() => setIngresoExtraAbierto(true)}
        />
      )}

      {facturaModal && (
        <ModalSubirFactura
          cliente={facturaModal.cliente}
          periodo={facturaModal.periodo}
          onClose={() => setFacturaModal(null)}
        />
      )}

      {revisarComprobante && (
        <ModalRevisarComprobante
          cliente={revisarComprobante.cliente}
          periodo={revisarComprobante.periodo}
          onClose={() => setRevisarComprobante(null)}
          onAplicado={onPagoAplicado}
          onAbrirSubirFactura={() => {
            setFacturaModal({
              cliente: revisarComprobante.cliente,
              periodo: revisarComprobante.periodo,
            });
            setRevisarComprobante(null);
          }}
        />
      )}

      {campanaRevision && (
        <ModalCampanaCorreo
          tipo={campanaRevision}
          clientes={clientesCampanaActiva}
          periodo={periodo}
          programadosHoy={
            campanasCorreo.find((c) => c.tipo === campanaRevision)?.programadosHoy ?? 0
          }
          onClose={() => setCampanaRevision(null)}
        />
      )}

      {ingresoExtraAbierto && (
        <ModalIngresoExtra onClose={() => setIngresoExtraAbierto(false)} />
      )}

      <ToastExito visible={!!toastBatch} mensaje={toastBatch ?? ""} />
      <ToastExito visible={!!toastDetalle} mensaje={toastDetalle ?? ""} />

      {seleccionados.size > 0 && (
        <div
          className="hidden lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-[55] items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center gap-2 pl-3 pr-2">
            <span className="flex items-center justify-center h-7 w-7 rounded-full bg-violet-500 text-white text-[11px] font-black">
              {seleccionados.size}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              seleccionados
            </span>
          </div>
          <span className="h-6 w-px bg-slate-700" />
          <button
            type="button"
            onClick={() => enviarCorreoEnLote("recordatorio")}
            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition-colors"
          >
            Recordatorio
          </button>
          <button
            type="button"
            onClick={() => enviarCorreoEnLote("vencido")}
            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition-colors"
          >
            Vencido
          </button>
          <button
            type="button"
            onClick={() => enviarCorreoEnLote("cierre_mes")}
            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 transition-colors"
          >
            Cierre de mes
          </button>
          <span className="h-6 w-px bg-slate-700" />
          <button
            type="button"
            onClick={copiarEmailsEnLote}
            title="Copiar correos al portapapeles"
            className="p-2 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
            aria-label="Copiar correos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </button>
          <button
            type="button"
            onClick={exportarSeleccionadosCSV}
            title="Exportar a CSV"
            className="p-2 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
            aria-label="Exportar a CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
          </button>
          <span className="h-6 w-px bg-slate-700" />
          <button
            type="button"
            onClick={() => setSeleccionados(new Set())}
            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Limpiar
          </button>
        </div>
      )}

      <style jsx global>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

"use client";

import { useState, useMemo, useCallback } from "react";
import { useAdminDeepLink } from "@/hooks/useAdminDeepLink";
import { useClientes } from "@/context/ClientesContext";
import {
  MESES_NOM,
  type Cliente,
  type Periodo,
  getTotalPendiente,
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
  getServiciosAdicionalesAnio,
  getTotalAdicionalesAnio,
  getTotalHonorariosCliente,
} from "@/lib/clientes";
import ModalRegistrarPago from "@/components/ModalRegistrarPago";
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
import { useConfirm, useNotify } from "@/components/ConfirmProvider";
import ToastExito from "@/components/ToastExito";
import MesPagoFila from "@/components/admin/MesPagoFila";
import { formatFechaComprobante } from "@/lib/comprobantes";
import ModalCampanaCorreo from "@/components/ModalCampanaCorreo";
import ModalSubirFactura from "@/components/ModalSubirFactura";
import ModalRevisarComprobante from "@/components/ModalRevisarComprobante";
import CobranzaCardMovil from "@/components/admin/CobranzaCardMovil";

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

const FacturaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h4"/></svg>
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

const estilosBotonCorreo = (tipo: TipoCorreoCobranza, habilitado: boolean) => {
  if (!habilitado) {
    return "bg-slate-50 text-slate-300 cursor-not-allowed";
  }
  switch (tipo) {
    case "recordatorio":
      return "bg-blue-50 text-blue-600 hover:bg-blue-100";
    case "vencido":
      return "bg-amber-50 text-amber-700 hover:bg-amber-100";
    case "cierre_mes":
      return "bg-indigo-50 text-indigo-600 hover:bg-indigo-100";
  }
};

type FiltroCobranza =
  | "todos"
  | "pendientes"
  | "atrasados"
  | "corrientes"
  | "comprobantes"
  | "por_cobrar_mes"
  | "cobrado_mes"
  | "pendiente_acumulado"
  | "clientes_atrasados";

function etiquetaCompromisoMes(
  pagadoMes: boolean,
  parcialMes: boolean,
  estado: EstadoCliente
): { texto: string; clase: string } {
  if (pagadoMes) return { texto: "Pagado", clase: "text-green-500" };
  if (parcialMes) return { texto: "Parcial", clase: "text-amber-600" };
  if (estado === "ATRASADO") return { texto: "Por cobrar", clase: "text-red-500" };
  if (estado === "PENDIENTE") return { texto: "Por cobrar", clase: "text-amber-500" };
  return { texto: "Por cobrar", clase: "text-amber-500" };
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
      return getTotalPendiente(cliente, periodo) > 0;
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
    marcarComprobanteVisto,
    quitarPago,
  } = useClientes();
  const mesesNom = MESES_NOM;
  const mesLabel = periodoLabel(periodo);

  const [filtro, setFiltro] = useState<FiltroCobranza>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [clientePagoModal, setClientePagoModal] = useState<Cliente | null>(null);
  const [periodoPagoInicial, setPeriodoPagoInicial] = useState<Periodo | undefined>();
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

    clientesActivos.forEach((c) => {
      if (!clienteActivoEnPeriodo(c, periodo)) return;
      const montoMes = getMontoMes(c, periodo);
      const pagado = getMontoPagado(c, periodo);
      if (esIngresoGeneralCliente(c)) {
        cobradoMes += pagado;
        return;
      }
      if (estaPagado(c, periodo)) cobradoMes += montoMes;
      else porCobrarMes += getCompromisoMes(c, periodo);
      pendienteAcumulado += getTotalPendiente(c, periodo);
      if (calcularEstado(c, periodo) === "ATRASADO") clientesAtrasados += 1;
    });

    return { porCobrarMes, cobradoMes, pendienteAcumulado, clientesAtrasados };
  }, [clientesActivos, periodo]);

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
  }, [clientesActivos, searchTerm, filtro, periodo, getComprobantePeriodo]);

  const abrirDetalleCliente = (cli: Cliente) => {
    const cmp = getComprobantePeriodo(cli.id, periodo);
    if (cmp && !cmp.visto) marcarComprobanteVisto(cmp.id);
    setSelectedClient(listaClientes.find((c) => c.id === cli.id) ?? cli);
  };

  const abrirModalPago = (e: React.MouseEvent, cliente: Cliente, periodoMes?: Periodo) => {
    e.stopPropagation();
    setPeriodoPagoInicial(periodoMes);
    setClientePagoModal(cliente);
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
      const pend = getTotalPendiente(c, periodo);
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
    clientePagoModal ||
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
      filtro: "por_cobrar_mes" as const,
      label: `Por cobrar (${mesesNom[periodo.mes]})`,
      value: resumen.porCobrarMes,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
      ring: "ring-amber-400",
    },
    {
      filtro: "cobrado_mes" as const,
      label: `Cobrado (${mesesNom[periodo.mes]})`,
      value: resumen.cobradoMes,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
      ring: "ring-emerald-400",
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
            setSelectedClient(null);
            setClientePagoModal(null);
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
                className="flex items-center justify-center gap-2 h-11 lg:h-12 px-5 rounded-full bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-violet-700 shadow-lg shadow-violet-100 transition-all"
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
                  className="w-full h-11 lg:h-12 pl-11 lg:pl-12 pr-4 font-bold text-slate-600 outline-none text-base lg:text-sm bg-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            {tarjetasKpi.map((card) => {
              const activa = filtro === card.filtro;
              return (
                <button
                  key={card.filtro}
                  type="button"
                  onClick={() => alternarFiltroKpi(card.filtro)}
                  title={activa ? "Clic para quitar filtro" : "Clic para ver clientes de esta categoría"}
                  className={`p-4 lg:p-7 rounded-2xl lg:rounded-[2rem] border shadow-sm text-left transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${card.bg} ${
                    activa ? `ring-2 ring-offset-2 ${card.ring} scale-[1.02] shadow-md` : ""
                  }`}
                >
                  <p className="text-[8px] lg:text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 lg:mb-2 leading-tight">
                    {card.label}
                    {activa && <span className="ml-1.5 text-emerald-600">· filtrando</span>}
                  </p>
                  <p className={`text-xl lg:text-4xl font-black tabular-nums ${card.color}`}>
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
          <div className="lg:hidden space-y-3 pb-4">
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
                    tieneFactura={!!factura}
                    pagadoMes={pagadoMes}
                    onSelect={abrirDetalleCliente}
                    onRegistrarPago={(e, c) => {
                      if (esGeneral) setIngresoExtraAbierto(true);
                      else abrirModalPago(e, c);
                    }}
                    onRevisarComprobante={abrirRevisionComprobante}
                    onFactura={(e, c) => abrirModalFactura(e, c, periodo)}
                    onCorreo={(e, c, tipo) => {
                      e.stopPropagation();
                      enviarCorreo(c, tipo);
                    }}
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
                  <th className="px-10 py-5 text-right">Acciones</th>
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
                    const puedeCobrar = clienteActivoEnPeriodo(cli, periodo);
                    const comprobante = getComprobantePeriodo(cli.id, periodo);
                    const factura = getFacturaPeriodo(cli.id, periodo);
                    const correoInd = getCorreoIndividualCliente(cli, periodo, hoy);
                    const estado = calcularEstado(cli, periodo);
                    const etiquetaMes = etiquetaCompromisoMes(pagadoMes, parcialMes, estado);
                    const pendienteTotal = getTotalPendiente(cli, periodo);

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
                          {pagadoMes ? (
                            <button
                              type="button"
                              onClick={(e) => abrirModalFactura(e, cli, periodo)}
                              title={
                                factura
                                  ? "Factura PDF cargada · clic para ver o reemplazar"
                                  : "Subir factura PDF del pago"
                              }
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                factura
                                  ? "bg-slate-800 text-white hover:bg-slate-700"
                                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                              }`}
                            >
                              <FacturaIcon />
                              {factura ? "PDF" : "Subir"}
                            </button>
                          ) : (
                            <span
                              className="text-slate-200 text-[10px]"
                              title="Registre el pago para subir la factura"
                            >
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-10 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            {puedeCobrar && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (esGeneral) setIngresoExtraAbierto(true);
                                  else abrirModalPago(e, cli);
                                }}
                                className={`px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all ${
                                  esGeneral
                                    ? "bg-violet-600 hover:bg-violet-700 shadow-violet-100"
                                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                                }`}
                              >
                                {esGeneral ? "Agregar ingreso" : "Registrar pago"}
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={!correoInd.habilitado}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (correoInd.habilitado) enviarCorreo(cli, correoInd.tipo);
                              }}
                              className={`p-3 rounded-full transition-all ${
                                correoInd.habilitado
                                  ? estilosBotonCorreo(correoInd.tipo, true)
                                  : estilosBotonCorreo("recordatorio", false)
                              }`}
                              title={
                                correoInd.habilitado
                                  ? `${correoInd.titulo} · ${correoInd.descripcion}`
                                  : correoInd.motivo
                              }
                            >
                              <MailIcon />
                            </button>
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
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-2 sm:p-3 lg:p-4 pointer-events-none">
          <div className="bg-white w-full max-w-[480px] max-h-[min(96dvh,96vh)] lg:max-h-[88vh] shadow-[0_30px_100px_rgba(0,0,0,0.15)] rounded-[2rem] lg:rounded-[2.5rem] flex flex-col pointer-events-auto border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8 pb-3 flex-none border-b border-slate-50/50 shrink-0 overflow-y-auto max-h-[42vh] lg:max-h-none lg:overflow-visible">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => setSelectedClient(null)} className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-emerald-600">← Regresar</button>
                <button onClick={() => setSelectedClient(null)} className="p-2 text-slate-300 hover:text-red-500"><CloseIcon /></button>
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-snug mb-0.5">{selectedClient.razonSocial}</h2>
              <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest mb-4">{selectedClient.rfc} · Día {selectedClient.fechaPago}</p>
              {(() => {
                const cmp = getComprobantePeriodo(selectedClient.id, periodo);
                if (!cmp) return null;
                return (
                  <div className="mb-3 rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TicketIcon />
                      <p className="text-[9px] font-black uppercase tracking-widest text-indigo-700">
                        Comprobante desde el portal
                      </p>
                    </div>
                    <p className="text-xs font-bold text-slate-700 truncate">{cmp.nombreArchivo}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatFechaComprobante(cmp.subidoEn)}</p>
                    <a
                      href={cmp.dataUrl}
                      download={cmp.nombreArchivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-[9px] font-black uppercase tracking-widest text-indigo-700 hover:text-indigo-900"
                    >
                      Ver / descargar →
                    </a>
                  </div>
                );
              })()}
              <button
                type="button"
                onClick={(e) => abrirModalPago(e, selectedClient)}
                className="w-full py-3.5 mb-2 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all"
              >
                + Registrar pago
              </button>
              {estaPagado(selectedClient, periodo) && (
                <button
                  type="button"
                  onClick={(e) => abrirModalFactura(e, selectedClient, periodo)}
                  className="w-full py-3 mb-2 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <FacturaIcon />
                  {getFacturaPeriodo(selectedClient.id, periodo) ? "Ver / actualizar factura PDF" : "Subir factura PDF"}
                </button>
              )}
              {(() => {
                const correoInd = getCorreoIndividualCliente(selectedClient, periodo, hoy);
                if (!correoInd.habilitado) {
                  return (
                    <p className="text-[9px] font-bold text-slate-400 bg-slate-50 rounded-lg px-2.5 py-1.5 mb-2 truncate">
                      {correoInd.motivo}
                    </p>
                  );
                }
                return (
                  <div
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-2 ${
                      correoInd.tipo === "vencido"
                        ? "bg-amber-50"
                        : correoInd.tipo === "cierre_mes"
                          ? "bg-indigo-50"
                          : "bg-blue-50"
                    }`}
                    title={correoInd.descripcion}
                  >
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest shrink-0 ${
                        correoInd.tipo === "vencido"
                          ? "text-amber-700"
                          : correoInd.tipo === "cierre_mes"
                            ? "text-indigo-700"
                            : "text-blue-700"
                      }`}
                    >
                      {correoInd.labelCorto}
                    </span>
                    <p className="text-[9px] text-slate-400 font-medium leading-snug flex-1 truncate">
                      {correoInd.descripcion}
                    </p>
                    <button
                      type="button"
                      onClick={() => enviarCorreo(selectedClient, correoInd.tipo)}
                      title="Enviar correo"
                      className={`p-1.5 rounded-md transition-all shrink-0 ${estilosBotonCorreo(correoInd.tipo, true)}`}
                    >
                      <MailIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => copiarCorreoConFormato(selectedClient, correoInd.tipo)}
                      title="Copiar HTML"
                      className="p-1.5 rounded-md bg-white/60 text-slate-500 hover:bg-white shrink-0 transition-all"
                    >
                      {htmlCopiado === correoInd.tipo ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      )}
                    </button>
                  </div>
                );
              })()}
              <a
                href={getPortalClienteUrl(selectedClient.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-center text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800"
              >
                Ver portal del cliente →
              </a>
            </div>
            <p className="px-8 pt-3 pb-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              Toca un mes · desliza ← en móvil para eliminar · {periodo.anio}
            </p>
            <div className="flex-1 overflow-y-auto px-8 py-3 space-y-2 scrollbar-hide min-h-0">
              {mesesNom.map((m, i) => {
                const p: Periodo = { mes: i, anio: periodo.anio };
                const previoInicio = !clienteActivoEnPeriodo(selectedClient, p);
                const esFuturo = periodoKey(p) > periodoKey(periodo);
                const activo = !previoInicio && !esFuturo;
                const pagado = estaPagado(selectedClient, p);
                const parcial = tienePagoParcial(selectedClient, p);
                const atrasado = activo && !pagado && !parcial;
                const compromiso = getCompromisoMes(selectedClient, p);
                const montoDeEsteMes = pagado || parcial ? getMontoMes(selectedClient, p) : compromiso;
                const notaMes = getNotaPago(selectedClient, p);
                const esGeneral = esIngresoGeneralCliente(selectedClient);
                const facturaDelMes = getFacturaPeriodo(selectedClient.id, p);
                const hayPagoEnMes = pagado || parcial;
                const descuentoMes = getDescuentoMes(selectedClient, p);
                const montoDescMes = descuentoMes ? getMontoDescuento(selectedClient, p) : 0;
                const swipeKey = `${selectedClient.id}-${p.anio}-${p.mes}`;

                return (
                  <MesPagoFila
                    key={m}
                    labelMes={m}
                    activo={activo}
                    esPeriodoActual={i === periodo.mes}
                    esGeneral={esGeneral}
                    previoInicio={previoInicio}
                    pagado={pagado}
                    parcial={parcial}
                    atrasado={atrasado}
                    montoDeEsteMes={montoDeEsteMes}
                    notaMes={notaMes}
                    descuentoLabel={
                      descuentoMes
                        ? descuentoMes.tipo === "porcentaje"
                          ? `-${descuentoMes.valor}% (${descuentoMes.motivo})`
                          : `-$${montoDescMes.toLocaleString()} (${descuentoMes.motivo})`
                        : null
                    }
                    hayPagoEnMes={hayPagoEnMes}
                    facturaCargada={!!facturaDelMes}
                    facturaMonto={facturaDelMes?.monto ?? null}
                    onTap={() => {
                      if (esGeneral) setIngresoExtraAbierto(true);
                      else
                        abrirModalPago(
                          { stopPropagation: () => {} } as React.MouseEvent,
                          selectedClient,
                          p
                        );
                    }}
                    onAbrirFactura={() =>
                      abrirModalFactura(
                        { stopPropagation: () => {} } as React.MouseEvent,
                        selectedClient,
                        p
                      )
                    }
                    onEliminarPago={() => handleEliminarPagoMes(selectedClient, p)}
                    swipeAbierto={mesSwipeAbierto === swipeKey}
                    onSwipeAbrir={() => setMesSwipeAbierto(swipeKey)}
                    onSwipeCerrar={() => setMesSwipeAbierto(null)}
                  />
                );
              })}

              {!esIngresoGeneralCliente(selectedClient) && (() => {
                const adicionales = getServiciosAdicionalesAnio(
                  selectedClient,
                  periodo.anio
                );
                if (adicionales.length === 0) return null;
                const totalAdic = getTotalAdicionalesAnio(
                  selectedClient,
                  periodo.anio
                );
                return (
                  <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-violet-700">
                        Servicios adicionales {periodo.anio}
                      </p>
                      <p className="text-[10px] font-black text-violet-700">
                        ${totalAdic.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {adicionales.map((p) => (
                        <div
                          key={p.id ?? `${p.mes}-${p.monto}-${p.concepto}`}
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-violet-50/60 border border-violet-100"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-black text-violet-800 truncate">
                              {p.concepto ?? "Servicio adicional"}
                            </p>
                            <p className="text-[10px] font-bold text-violet-500 mt-0.5">
                              {MESES_NOM[p.mes]}
                              {p.nota ? ` · ${p.nota}` : ""}
                            </p>
                          </div>
                          <p className="text-sm font-black text-violet-700 shrink-0">
                            ${p.monto.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#0F172A] text-white rounded-t-[2rem] flex-none shrink-0 border-t border-slate-800/50 shadow-[0_-8px_24px_rgba(15,23,42,0.25)]">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Honorarios</p>
                  <p className="text-base font-black text-green-400">
                    ${getTotalHonorariosCliente(selectedClient).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Adicionales {periodo.anio}</p>
                  <p className="text-base font-black text-violet-400">
                    ${getTotalAdicionalesAnio(selectedClient, periodo.anio).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Pendiente</p>
                  <p className="text-base font-black text-indigo-400">
                    ${getTotalPendiente(selectedClient, periodo).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {clientePagoModal && (
        <ModalRegistrarPago
          cliente={clientePagoModal}
          periodoInicial={periodoPagoInicial}
          onClose={() => { setClientePagoModal(null); setPeriodoPagoInicial(undefined); }}
          onAplicado={onPagoAplicado}
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

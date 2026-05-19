"use client";

import { useState, useMemo } from "react";
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
  CORREO_TIPOS,
  type TipoCorreoCobranza,
} from "@/lib/correo";
import { formatFechaComprobante } from "@/lib/comprobantes";
import ModalCampanaCorreo from "@/components/ModalCampanaCorreo";
import ModalSubirFactura from "@/components/ModalSubirFactura";

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
  const [ingresoExtraAbierto, setIngresoExtraAbierto] = useState(false);

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
    return clientesActivos.filter((c) => {
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
    selectedClient || clientePagoModal || campanaRevision || facturaModal || ingresoExtraAbierto;

  const abrirModalFactura = (e: React.MouseEvent, cliente: Cliente, p: Periodo) => {
    e.stopPropagation();
    setFacturaModal({ cliente, periodo: p });
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
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans relative overflow-hidden text-slate-800 -m-8">
      {hayModal && (
        <div
          className="fixed inset-0 z-[45] bg-slate-900/10 backdrop-blur-sm transition-all"
          onClick={() => {
            setSelectedClient(null);
            setClientePagoModal(null);
            setCampanaRevision(null);
            setFacturaModal(null);
            setIngresoExtraAbierto(false);
          }}
        />
      )}

      <main
        className={`flex-1 p-12 transition-all duration-500 w-full ${hayModal ? "blur-md scale-[0.98]" : ""}`}
      >
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">
                Operación mensual
              </p>
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-slate-800">
                Centro de Cobranza
              </h1>
              <p className="text-slate-400 font-bold mt-2 text-sm">{mesLabel}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIngresoExtraAbierto(true)}
                title="Registrar ingreso extra o diverso"
                className="flex items-center gap-2 h-12 px-5 rounded-full bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-violet-700 shadow-lg shadow-violet-100 transition-all"
              >
                <PlusIcon />
                Ingreso extra
              </button>
              <div className="group relative flex items-center">
                <div className="flex items-center bg-white border border-slate-100 rounded-full h-12 w-12 group-hover:w-72 shadow-sm overflow-hidden transition-all duration-500 relative">
                  <div className="absolute left-0 w-12 h-12 flex items-center justify-center text-slate-400 group-hover:text-emerald-600">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 opacity-0 group-hover:opacity-100 transition-all pl-12 pr-4 font-bold text-slate-600 outline-none text-sm bg-transparent"
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {tarjetasKpi.map((card) => {
              const activa = filtro === card.filtro;
              return (
                <button
                  key={card.filtro}
                  type="button"
                  onClick={() => alternarFiltroKpi(card.filtro)}
                  title={activa ? "Clic para quitar filtro" : "Clic para ver clientes de esta categoría"}
                  className={`p-7 rounded-[2rem] border shadow-sm text-left transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${card.bg} ${
                    activa ? `ring-2 ring-offset-2 ${card.ring} scale-[1.02] shadow-md` : ""
                  }`}
                >
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">
                    {card.label}
                    {activa && <span className="ml-1.5 text-emerald-600">· filtrando</span>}
                  </p>
                  <p className={`text-4xl font-black tabular-nums ${card.color}`}>
                    {card.esCantidad ? card.value : `$${card.value.toLocaleString()}`}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex gap-5 flex-wrap">
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
                  className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                    filtrosTab.includes(filtro) && filtro === key
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-slate-300 hover:text-slate-500"
                  }`}
                >
                  {label}
                  {key === "comprobantes" && comprobantesNuevos > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-white text-[8px] flex items-center justify-center">
                      {comprobantesNuevos}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mr-1">Correos</span>
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


          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#FBFBFF] text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-50">
                <tr>
                  <th className="px-10 py-8">Cliente</th>
                  <th className="px-6 py-8 text-center">Día pago</th>
                  <th className="px-6 py-8 text-center">Compromiso {mesLabel}</th>
                  <th className="px-6 py-8 text-center">Pendiente total</th>
                  <th className="px-6 py-8 text-center">Estatus</th>
                  <th className="px-6 py-8 text-center">Comprobante</th>
                  <th className="px-6 py-8 text-center">Factura</th>
                  <th className="px-10 py-8 text-right">Acciones</th>
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
                        className={`hover:bg-slate-50/50 cursor-pointer group transition-all ${comprobante && !comprobante.visto ? "bg-violet-50/40" : ""} ${esGeneral ? "bg-violet-50/20" : ""}`}
                      >
                        <td className="px-10 py-8">
                          <div className="font-bold text-xl text-slate-700 group-hover:text-emerald-600 transition-colors flex items-center gap-2 flex-wrap">
                            {cli.razonSocial}
                            {esGeneral && (
                              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                                General
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-slate-300 uppercase mt-1 tracking-widest">{cli.rfc}</p>
                        </td>
                        <td className="px-6 py-8 text-center font-black text-emerald-500/70 text-lg">
                          {esGeneral ? "—" : `Día ${cli.fechaPago}`}
                        </td>
                        <td className="px-6 py-8 text-center">
                          <p className="font-black text-slate-700 text-xl">
                            {esGeneral && pagadoPeriodo === 0
                              ? "—"
                              : `$${montoMes.toLocaleString()}`}
                          </p>
                          <p
                            className={`text-[9px] font-black uppercase mt-1 tracking-widest ${
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
                        <td className={`px-6 py-8 text-center font-black ${clasePendienteTotal(estado, pendienteTotal)}`}>
                          ${pendienteTotal.toLocaleString()}
                        </td>
                        <td className="px-6 py-8 text-center">
                          <EstadoBadge cliente={cli} periodo={periodo} />
                        </td>
                        <td className="px-6 py-8 text-center">
                          {comprobante ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                comprobante.estado === "aceptado"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : !comprobante.visto
                                    ? "bg-violet-600 text-white animate-pulse"
                                    : "bg-violet-100 text-violet-700"
                              }`}
                            >
                              <TicketIcon />
                              {comprobante.estado === "aceptado"
                                ? "Confirmado"
                                : comprobante.visto
                                  ? "En revisión"
                                  : "Nuevo"}
                            </span>
                          ) : (
                            <span className="text-slate-200 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-8 text-center">
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
                        <td className="px-10 py-8">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            {puedeCobrar && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (esGeneral) setIngresoExtraAbierto(true);
                                  else abrirModalPago(e, cli, periodo);
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
                    <td colSpan={8} className="px-10 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px]">
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
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white w-full max-w-[480px] max-h-[88vh] shadow-[0_30px_100px_rgba(0,0,0,0.15)] rounded-[2.5rem] flex flex-col pointer-events-auto border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-3 flex-none border-b border-slate-50/50">
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
                  <div className="mb-3 rounded-2xl bg-violet-50 border border-violet-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TicketIcon />
                      <p className="text-[9px] font-black uppercase tracking-widest text-violet-700">
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
                      className="mt-3 inline-block text-[9px] font-black uppercase tracking-widest text-violet-700 hover:text-violet-900"
                    >
                      Ver / descargar →
                    </a>
                  </div>
                );
              })()}
              <button
                type="button"
                onClick={(e) => abrirModalPago(e, selectedClient, periodo)}
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
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Correo según estatus
              </p>
              {(() => {
                const correoInd = getCorreoIndividualCliente(selectedClient, periodo, hoy);
                if (!correoInd.habilitado) {
                  return (
                    <p className="text-[10px] font-bold text-slate-400 bg-slate-50 rounded-xl px-3 py-2.5 mb-2">
                      {correoInd.motivo}
                    </p>
                  );
                }
                return (
                  <div className="space-y-1.5 mb-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => enviarCorreo(selectedClient, correoInd.tipo)}
                        className={`flex items-center justify-center gap-1 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${estilosBotonCorreo(correoInd.tipo, true)}`}
                      >
                        <MailIcon />
                        {correoInd.labelCorto}
                      </button>
                      <button
                        type="button"
                        onClick={() => copiarCorreoConFormato(selectedClient, correoInd.tipo)}
                        className="py-2.5 rounded-xl bg-slate-50 text-slate-500 text-[8px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                      >
                        {htmlCopiado === correoInd.tipo ? "¡Copiado!" : "HTML"}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium leading-snug px-1">
                      {correoInd.descripcion}
                    </p>
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
              Toca un mes · {periodo.anio}
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
                const saldo = getSaldoMes(selectedClient, p);
                const notaMes = getNotaPago(selectedClient, p);
                const esGeneral = esIngresoGeneralCliente(selectedClient);

                return (
                  <div
                    key={m}
                    onClick={(e) => {
                      if (!activo) return;
                      if (esGeneral) setIngresoExtraAbierto(true);
                      else abrirModalPago(e, selectedClient, p);
                    }}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
                      activo ? "bg-white border-slate-100 shadow-sm hover:border-emerald-200 cursor-pointer" : "bg-slate-50/50 opacity-30 pointer-events-none border-transparent"
                    } ${i === periodo.mes ? "ring-2 ring-emerald-200" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 shrink-0 rounded-full ${pagado ? "bg-green-500" : atrasado ? "bg-red-500 animate-pulse" : parcial ? "bg-amber-500" : "bg-slate-200"}`} />
                      <p className="text-sm font-black text-slate-700 uppercase tracking-tight truncate">{m}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-base font-black text-slate-600">
                        {previoInicio ? "-" : esGeneral && montoDeEsteMes === 0 ? "—" : `$${montoDeEsteMes.toLocaleString()}`}
                      </p>
                      {notaMes && (
                        <p className="text-[8px] font-bold text-violet-600 mt-0.5 max-w-[140px] truncate" title={notaMes}>
                          {notaMes}
                        </p>
                      )}
                      {pagado && !esGeneral && <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">Pagado</p>}
                      {esGeneral && montoDeEsteMes > 0 && (
                        <p className="text-[8px] font-black text-violet-600 uppercase tracking-widest">Ingreso</p>
                      )}
                      {parcial && <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Parcial</p>}
                      {atrasado && <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">Pendiente</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-[#0F172A] text-white rounded-t-[2rem] flex-none">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Total pagado</p>
                  <p className="text-xl font-black text-green-400">
                    ${selectedClient.pagosRealizados.reduce((acc, p) => acc + p.monto, 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Pendiente</p>
                  <p className="text-xl font-black text-indigo-400">
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

      <style jsx global>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

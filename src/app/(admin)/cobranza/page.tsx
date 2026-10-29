"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
  sumarIngresoBancarioPeriodo,
} from "@/lib/clientes";
import ModalIngresoExtra from "@/components/ModalIngresoExtra";
import { abrirSheetRegistrarPago } from "@/components/admin/SheetRegistrarPago";
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
import BotonPedirCapturaCobranza from "@/components/admin/BotonPedirCapturaCobranza";
import { useConfirm, useNotify } from "@/components/ConfirmProvider";
import ToastExito from "@/components/ToastExito";
import ModalCampanaCorreo from "@/components/ModalCampanaCorreo";
import ModalSubirFactura from "@/components/ModalSubirFactura";
import BotonFacturaCobranza from "@/components/BotonFacturaCobranza";
import BotonCorreoFactura from "@/components/admin/BotonCorreoFactura";
import ModalRevisarComprobante from "@/components/ModalRevisarComprobante";
import CobranzaCardMovil from "@/components/admin/CobranzaCardMovil";
import EstadoCuentaCajaCobranza from "@/components/admin/EstadoCuentaCajaCobranza";
import PanelDetalleCliente from "@/components/admin/PanelDetalleCliente";
import { getWorkflowMesCliente } from "@/lib/cobranza-workflow";
import {
  exportarCobranzaExcel,
  exportarCobranzaPdf,
} from "@/lib/cobranza-export";
import AdminPageHeading, { adminBtnPrimario } from "@/components/admin/AdminPageHeading";
import AvatarCliente from "@/components/admin/AvatarCliente";
import BotonExportarMenu from "@/components/admin/BotonExportarMenu";
import MenuFiltroIcono from "@/components/admin/MenuFiltroIcono";
import WorkflowCircleMini from "@/components/admin/WorkflowCircleMini";
import AnilloHerradura, { type AnilloVista } from "@/components/admin/AnilloHerradura";
import { pctSafe, tonoAvance } from "@/lib/dashboard-anillos";
import {
  getUltimoEnvioResend,
  periodoKeyStr,
} from "@/lib/recordatorios";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
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
  if (pagadoMes) return { texto: "Pagado", clase: "text-emerald-600" };
  if (parcialMes)
    return { texto: "Pagado parcialmente", clase: "text-amber-600" };
  if (estado === "ATRASADO")
    return { texto: "Pendiente de pago", clase: "text-rose-600" };
  return { texto: "Pendiente de pago", clase: "text-amber-600" };
}

function clasePendienteTotal(estado: EstadoCliente, monto: number): string {
  if (monto <= 0) return "text-slate-300";
  if (estado === "ATRASADO") return "text-rose-600";
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
    recordatorioLog,
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
  const [tabPanelInicial, setTabPanelInicial] = useState<"meses" | "acciones">("meses");
  const [htmlCopiado, setHtmlCopiado] = useState<TipoCorreoCobranza | null>(null);
  const [campanaRevision, setCampanaRevision] = useState<TipoCorreoCobranza | null>(null);
  const [facturaModal, setFacturaModal] = useState<{ cliente: Cliente; periodo: Periodo } | null>(null);
  const [revisarComprobante, setRevisarComprobante] = useState<{
    cliente: Cliente;
    periodo: Periodo;
  } | null>(null);
  const [ingresoExtraAbierto, setIngresoExtraAbierto] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [resaltadoId, setResaltadoId] = useState<number | null>(null);
  const [toastBatch, setToastBatch] = useState<string | null>(null);
  const [toastDetalle, setToastDetalle] = useState<string | null>(null);
  const [mesSwipeAbierto, setMesSwipeAbierto] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
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
    onCliente: (c) => {
      setResaltadoId(c.id);
      setSelectedClient(c);
    },
    onFiltro: (f) => setFiltro(f as FiltroCobranza),
    onRevisarCliente: abrirRevisarComprobante,
    onAccion: (accion, cliente) => {
      if (accion === "pago") {
        setTabPanelInicial("acciones");
        setSelectedClient(cliente);
      }
    },
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

  useEffect(() => {
    if (!resaltadoId) return;
    const t = window.setTimeout(() => {
      const nodos = document.querySelectorAll(
        `[data-cobranza-cli="${resaltadoId}"]`
      );
      for (const el of nodos) {
        if (el.getBoundingClientRect().height > 0) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
      }
    }, 280);
    return () => window.clearTimeout(t);
  }, [resaltadoId, periodo.mes, periodo.anio]);

  const clientesActivos = useMemo(
    () => listaClientes.filter((c) => c.activo),
    [listaClientes]
  );

  const resumen = useMemo(() => {
    let porCobrarMes = 0;
    let cobradoHonorariosMes = 0;
    let pendienteAcumulado = 0;
    let clientesAtrasados = 0;
    let facturacionPendiente = 0;
    let comprobantesRevisar = 0;
    let cartera = 0;
    let pagaron = 0;
    let facturados = 0;
    let cobradoCartera = 0;
    let compromisoCartera = 0;

    clientesActivos.forEach((c) => {
      if (!clienteActivoEnPeriodo(c, periodo)) return;
      const cmp = getComprobantePeriodo(c.id, periodo);
      if (cmp && cmp.estado === "pendiente" && !cmp.visto) comprobantesRevisar += 1;
      const pagado = getMontoPagado(c, periodo);
      if (esIngresoGeneralCliente(c)) {
        cobradoHonorariosMes += pagado;
        return;
      }
      cartera += 1;
      const compromiso = getCompromisoMes(c, periodo);
      compromisoCartera += compromiso;
      cobradoCartera += pagado;
      cobradoHonorariosMes += pagado;
      if (estaPagado(c, periodo)) pagaron += 1;
      if (getFacturaPeriodo(c.id, periodo)) facturados += 1;
      if (!estaPagado(c, periodo)) {
        porCobrarMes += getSaldoMes(c, periodo) || compromiso;
      } else if (!getFacturaPeriodo(c.id, periodo)) {
        facturacionPendiente += 1;
      }
      pendienteAcumulado += getTotalDeudaPendiente(c, periodo);
      if (calcularEstado(c, periodo) === "ATRASADO") clientesAtrasados += 1;
    });

    clientesActivos.forEach((c) => {
      cobradoHonorariosMes += getMontoAdicionalMes(c, periodo);
    });

    const ingresoBancarioMes = sumarIngresoBancarioPeriodo(clientesActivos, periodo);
    const tasaCobranza = pctSafe(cobradoCartera, compromisoCartera);
    const alDia = Math.max(0, cartera - clientesAtrasados);

    return {
      porCobrarMes,
      cobradoHonorariosMes,
      ingresoBancarioMes,
      pendienteAcumulado,
      clientesAtrasados,
      facturacionPendiente,
      comprobantesRevisar,
      cartera,
      pagaron,
      facturados,
      cobradoCartera,
      compromisoCartera,
      tasaCobranza,
      alDia,
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

  const totalesVista = useMemo(() => {
    let deuda = 0;
    let extras = 0;
    for (const c of clientesFiltrados) {
      if (esIngresoGeneralCliente(c)) continue;
      extras += getTotalExtraPorCobrar(c);
      deuda += getTotalDeudaPendiente(c, periodo);
    }
    return {
      cantidad: clientesFiltrados.length,
      deuda,
      extras,
    };
  }, [clientesFiltrados, periodo]);

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
    setTabPanelInicial("meses");
  };

  const onPagoAplicado = (cliente: Cliente) => {
    if (selectedClient?.id === cliente.id) setSelectedClient(cliente);
  };

  const hoy = useMemo(() => new Date(), []);

  const campanasCorreo = useMemo(() => {
    const tipos: TipoCorreoCobranza[] = [
      "preaviso",
      "vencido",
      "cierre_mes",
    ];
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

  const exportarExcelCartera = async () => {
    setExportando(true);
    try {
      await exportarCobranzaExcel(clientesActivos, periodo);
      setToastBatch("Cartera exportada a Excel");
      setTimeout(() => setToastBatch(null), 1600);
    } catch {
      notify({
        titulo: "No se pudo exportar",
        mensaje: "Intenta de nuevo en unos segundos.",
        tono: "danger",
      });
    } finally {
      setExportando(false);
    }
  };

  const exportarPdfCartera = async () => {
    setExportando(true);
    try {
      await exportarCobranzaPdf(clientesActivos, periodo);
      setToastBatch("Cartera exportada a PDF");
      setTimeout(() => setToastBatch(null), 1600);
    } catch {
      notify({
        titulo: "No se pudo exportar",
        mensaje: "Intenta de nuevo en unos segundos.",
        tono: "danger",
      });
    } finally {
      setExportando(false);
    }
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
      id: "ingreso-bancario",
      filtro: "cobrado_mes" as const,
      label: "Ingreso bancario",
      value: resumen.ingresoBancarioMes,
      detalle: `Honorarios del mes: $${resumen.cobradoHonorariosMes.toLocaleString()}`,
      title:
        "Dinero que entró este mes (fecha de pago), aunque se aplique a meses anteriores. Clic filtra clientes con honorarios del mes cubiertos.",
      color: "text-emerald-600",
    },
    {
      id: "por-cobrar",
      filtro: "por_cobrar_mes" as const,
      label: "Por cobrar",
      value: resumen.porCobrarMes,
      color: "text-amber-600",
    },
    {
      id: "pendiente-acumulado",
      filtro: "pendiente_acumulado" as const,
      label: "Pendiente acumulado",
      value: resumen.pendienteAcumulado,
      color: "text-slate-900",
    },
    {
      id: "clientes-atrasados",
      filtro: "clientes_atrasados" as const,
      label: "Clientes atrasados",
      value: resumen.clientesAtrasados,
      color: "text-rose-600",
      esCantidad: true,
    },
    {
      id: "facturacion-pendiente",
      filtro: "facturacion_pendiente" as const,
      label: "Facturación pendiente",
      value: resumen.facturacionPendiente,
      color: "text-violet-700",
      esCantidad: true,
    },
    {
      id: "comprobantes-revisar",
      filtro: "comprobantes_revisar" as const,
      label: "Comprobantes",
      value: resumen.comprobantesRevisar,
      color: "text-slate-900",
      esCantidad: true,
    },
  ];

  const alternarFiltroKpi = (clave: FiltroCobranza) => {
    setFiltro((actual) => (actual === clave ? "todos" : clave));
  };

  const fmtKpi = (n: number) => `$${n.toLocaleString("es-MX")}`;
  const anillosCobranza: AnilloVista[] = [
    {
      id: "cobrado",
      label: "Cobrado",
      centro: `${resumen.tasaCobranza}%`,
      pie:
        resumen.compromisoCartera > 0
          ? `${fmtKpi(resumen.cobradoCartera)} de ${fmtKpi(resumen.compromisoCartera)}`
          : "Sin compromiso",
      pct: resumen.tasaCobranza,
      tono: tonoAvance(resumen.tasaCobranza),
      onClick: () => alternarFiltroKpi("cobrado_mes"),
    },
    {
      id: "pagaron",
      label: "Pagaron",
      centro: String(resumen.pagaron),
      pie:
        resumen.cartera > 0
          ? `${resumen.pagaron} de ${resumen.cartera}`
          : "Sin clientes",
      pct: pctSafe(resumen.pagaron, resumen.cartera),
      tono: tonoAvance(pctSafe(resumen.pagaron, resumen.cartera)),
      onClick: () => alternarFiltroKpi("cobrado_mes"),
    },
    {
      id: "factura",
      label: "Factura",
      centro: String(resumen.facturados),
      pie:
        resumen.cartera > 0
          ? `${resumen.facturados} de ${resumen.cartera}`
          : "Sin clientes",
      pct: pctSafe(resumen.facturados, resumen.cartera),
      tono: tonoAvance(pctSafe(resumen.facturados, resumen.cartera)),
      onClick: () => alternarFiltroKpi("facturacion_pendiente"),
    },
    {
      id: "al-dia",
      label: "Al día",
      centro: String(resumen.alDia),
      pie:
        resumen.cartera > 0
          ? `${resumen.alDia} de ${resumen.cartera}`
          : "Sin clientes",
      pct: pctSafe(resumen.alDia, resumen.cartera),
      tono: tonoAvance(pctSafe(resumen.alDia, resumen.cartera)),
      onClick: () => alternarFiltroKpi("clientes_atrasados"),
    },
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
          <AdminPageHeading
            titulo="Cobranza"
            subtitulo={mesLabel}
            accionMovil={
              <button
                type="button"
                onClick={() => setIngresoExtraAbierto(true)}
                title="Registrar ingreso extra o diverso"
                className={adminBtnPrimario}
              >
                <PlusIcon />
                Ingreso extra
              </button>
            }
            acciones={
              <>
                <div className="relative flex-1 min-w-0 lg:flex-none flex items-center bg-white ring-1 ring-black/[0.06] rounded-full h-10 overflow-hidden lg:group lg:w-10 lg:hover:w-64 lg:focus-within:w-64 transition-all duration-500">
                  <div className="absolute left-0 w-10 h-10 flex items-center justify-center text-slate-400 pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar cliente o RFC…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 font-medium text-slate-900 outline-none text-[13px] bg-transparent placeholder:text-slate-400 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 lg:focus:opacity-100"
                  />
                </div>
                <MenuFiltroIcono
                  grupos={[
                    {
                      modo: "single",
                      valorPorDefecto: "todos",
                      opciones: [
                        { id: "todos", label: "Todos" },
                        { id: "pendientes", label: "Pendientes" },
                        { id: "atrasados", label: "Atrasados" },
                        { id: "corrientes", label: "Al corriente" },
                        {
                          id: "comprobantes",
                          label: "Comprobantes",
                          count: comprobantesNuevos || undefined,
                        },
                      ],
                      seleccion: [filtro],
                      onChange: (ids) =>
                        setFiltro((ids[0] as FiltroCobranza) || "todos"),
                    },
                  ]}
                />
                <BotonExportarMenu
                  variante="icono"
                  exportando={exportando}
                  opciones={[
                    {
                      id: "excel",
                      label: "Excel",
                      onClick: () => void exportarExcelCartera(),
                    },
                    {
                      id: "pdf",
                      label: "PDF",
                      onClick: () => void exportarPdfCartera(),
                    },
                  ]}
                />
                <button
                  type="button"
                  onClick={abrirSheetRegistrarPago}
                  title="Registrar un pago fácil y rápido"
                  className="hidden lg:inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Registrar pago
                </button>
                <span className="hidden lg:inline-flex">
                  <button
                    type="button"
                    onClick={() => setIngresoExtraAbierto(true)}
                    title="Registrar ingreso extra o diverso"
                    className={adminBtnPrimario}
                  >
                    <PlusIcon />
                    Ingreso extra
                  </button>
                </span>
              </>
            }
          />

          <section className="mb-6 lg:mb-8 px-1 lg:px-0">
            <div className="grid gap-3 lg:gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-stretch">
              <div className="rounded-[1.25rem] bg-white overflow-hidden flex flex-col">
                <div className="grid grid-cols-3 grid-rows-[auto_auto_auto] flex-1">
                  {tarjetasKpi.slice(0, 3).map((card) => {
                    const activa = filtro === card.filtro;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => alternarFiltroKpi(card.filtro)}
                        title={
                          card.title ??
                          (activa
                            ? "Clic para quitar filtro"
                            : "Clic para ver clientes de esta categoría")
                        }
                        className={`min-w-0 grid grid-rows-subgrid row-span-3 px-3 py-4 sm:px-5 text-left transition-colors focus:outline-none focus-visible:bg-slate-50 ${
                          activa
                            ? "bg-slate-50 dark:bg-[#3c3c3e]"
                            : "active:bg-slate-50/80 dark:active:bg-[#3c3c3e]"
                        }`}
                      >
                        <p className="text-[11px] font-semibold text-slate-500 truncate">
                          {card.label}
                          {activa ? (
                            <span className="ml-1 text-slate-400">· filtro</span>
                          ) : null}
                        </p>
                        <p
                          className={`mt-1.5 text-[22px] sm:text-[26px] font-bold tabular-nums leading-none tracking-tight whitespace-nowrap ${card.color}`}
                        >
                          {card.esCantidad
                            ? card.value
                            : `$${card.value.toLocaleString()}`}
                        </p>
                        <p className="mt-1.5 text-[11px] text-slate-400 leading-snug truncate min-h-[1.25rem]">
                          {"detalle" in card && card.detalle ? card.detalle : "\u00a0"}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="mx-4 border-t border-slate-100" />
                <div className="grid grid-cols-3 flex-1">
                  {tarjetasKpi.slice(3).map((card) => {
                    const activa = filtro === card.filtro;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => alternarFiltroKpi(card.filtro)}
                        title={
                          activa
                            ? "Clic para quitar filtro"
                            : "Clic para ver clientes de esta categoría"
                        }
                        className={`min-w-0 px-3 py-4 sm:px-5 text-left transition-colors focus:outline-none focus-visible:bg-slate-50 ${
                          activa
                            ? "bg-slate-50 dark:bg-[#3c3c3e]"
                            : "active:bg-slate-50/80 dark:active:bg-[#3c3c3e]"
                        }`}
                      >
                        <p className="text-[11px] font-semibold text-slate-500 truncate">
                          {card.label}
                          {activa ? (
                            <span className="ml-1 text-slate-400">· filtro</span>
                          ) : null}
                        </p>
                        <p
                          className={`mt-1.5 text-[22px] sm:text-[26px] font-bold tabular-nums leading-none tracking-tight whitespace-nowrap ${card.color}`}
                        >
                          {card.esCantidad
                            ? card.value
                            : `$${card.value.toLocaleString()}`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[1.25rem] bg-white overflow-hidden flex items-center px-1.5 py-3 sm:px-2 sm:py-4">
                <div className="grid grid-cols-4 lg:grid-cols-2 gap-y-2 w-full">
                  {anillosCobranza.map((a, i) => (
                    <AnilloHerradura key={a.id} anillo={a} delayMs={i * 70} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <EstadoCuentaCajaCobranza
            clientes={clientesActivos}
            periodo={periodo}
            onSelectCliente={abrirDetalleCliente}
          />

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">
                  Correos
                </span>
                {campanasCorreo.map(({ tipo, labelCorto, clientes, programadosHoy }) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setCampanaRevision(tipo)}
                    title={`${CORREO_TIPOS[tipo].descripcion} · Clic para revisar lista`}
                    className={`inline-flex items-center gap-1.5 h-8 pl-3 pr-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                      clientes.length > 0
                        ? "bg-slate-100 text-slate-800 rdc-ios-pill-thumb-claro hover:bg-slate-200"
                        : "bg-slate-50 text-slate-300 cursor-default"
                    }`}
                  >
                    {labelCorto}
                    <span
                      className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold flex items-center justify-center ${
                        clientes.length > 0
                          ? "bg-slate-800 text-white"
                          : "bg-white text-slate-300"
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
          </div>


          {/* Vista móvil: tarjetas */}
          <div className="lg:hidden space-y-2 pb-4 px-1">
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
                    enviadoEn={
                      getUltimoEnvioResend(
                        recordatorioLog,
                        cli.id,
                        periodoKeyStr(periodo)
                      )?.contactadoEn
                    }
                    onContactado={(via, tipo) =>
                      marcarRecordatorio(cli.id, periodo, tipo, via)
                    }
                  />
                );
              })
            ) : (
              <p className="text-center py-12 text-slate-400 text-[13px] font-medium">
                No hay clientes en este filtro
              </p>
            )}
            {clientesFiltrados.length > 0 && (
              <div className="sticky bottom-3 z-10 rounded-[1.25rem] bg-white px-4 py-3 flex items-center justify-between gap-3 ring-1 ring-black/[0.04]">
                <p className="text-[11px] font-semibold text-slate-400">
                  Visible
                  <span className="block text-slate-900 text-[15px] font-bold mt-0.5 tabular-nums">
                    {totalesVista.cantidad} cliente{totalesVista.cantidad === 1 ? "" : "s"}
                  </span>
                </p>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-slate-400">
                    Deuda total
                  </p>
                  <p className="text-[22px] font-bold tabular-nums leading-none tracking-tight text-rose-600">
                    ${totalesVista.deuda.toLocaleString()}
                  </p>
                  {totalesVista.extras > 0 && (
                    <p className="text-[11px] font-medium text-amber-600 tabular-nums mt-1">
                      incl. {totalesVista.extras.toLocaleString()} extra
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-white rounded-[1.25rem] overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pl-6 pr-2 py-2 w-10">
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
                  <th className="px-6 py-2">Cliente</th>
                  <th className="px-6 py-2 text-center">Día de pago</th>
                  <th className="px-6 py-2 text-center">Compromiso {mesLabel}</th>
                  <th className="px-6 py-2 text-center">Pendiente total</th>
                  <th className="px-6 py-2 text-center">Estatus</th>
                  <th className="px-6 py-2 text-center">Comprobante</th>
                  <th className="px-6 py-2 text-center">Factura</th>
                  <th
                    className="px-4 py-2 text-center"
                    title="Avance operativo del cliente este mes: contabilidad, línea de captura, pago de honorarios y factura."
                  >
                    Workflow
                  </th>
                  <th className="px-6 py-2 text-right">Acciones</th>
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
                        data-cobranza-cli={cli.id}
                        onClick={() => abrirDetalleCliente(cli)}
                        className={`hover:bg-slate-50/80 cursor-pointer group transition-colors ${comprobante && !comprobante.visto ? "bg-indigo-50/40" : ""} ${esGeneral ? "bg-violet-50/20" : ""} ${seleccionados.has(cli.id) ? "bg-slate-50" : ""}`}
                      >
                        <td
                          className="pl-6 pr-2 py-2 w-10"
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
                        <td className="px-6 py-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <AvatarCliente cliente={cli} size="sm" />
                            <div className="min-w-0">
                              <div className="font-semibold text-[15px] text-slate-900 flex items-center gap-2 flex-wrap">
                                {cli.razonSocial}
                                {esGeneral && (
                                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                                    General
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{cli.rfc}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-2 text-center">
                          {esGeneral ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            <>
                              <p className="text-[11px] font-semibold text-slate-400">Día</p>
                              <p className="text-[17px] font-bold tabular-nums text-slate-900 leading-none mt-0.5">
                                {cli.fechaPago}
                              </p>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-2 text-center">
                          <p className="font-bold text-[17px] tabular-nums text-slate-900 leading-none">
                            {esGeneral && pagadoPeriodo === 0
                              ? "—"
                              : `$${montoMes.toLocaleString()}`}
                          </p>
                          <p
                            className={`text-[11px] font-semibold mt-1 ${
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
                        <td className={`px-6 py-2 text-center font-bold text-[17px] tabular-nums ${clasePendienteTotal(estado, pendienteTotal)}`}>
                          ${pendienteTotal.toLocaleString()}
                          {!esGeneral && extraPorCobrar > 0 && (
                            <p className="text-[11px] font-medium text-amber-600 mt-1">
                              incl. {extraPorCobrar.toLocaleString()} extra
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-2 text-center">
                          <EstadoBadge cliente={cli} periodo={periodo} />
                        </td>
                        <td className="px-6 py-2 text-center">
                          {comprobante ? (
                            <button
                              type="button"
                              onClick={(e) => abrirRevisionComprobante(e, cli)}
                              title="Revisar comprobante enviado por el cliente"
                              className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold transition-colors ${
                                comprobante.estado === "aceptado"
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : !comprobante.visto
                                    ? "bg-indigo-600 text-white animate-pulse hover:bg-indigo-700"
                                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
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
                        <td
                          className="px-6 py-2 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center justify-center gap-1">
                            <BotonFacturaCobranza
                              factura={factura}
                              pagadoMes={pagadoMes}
                              onClick={(e) => abrirModalFactura(e, cli, periodo)}
                            />
                            <BotonCorreoFactura
                              cliente={cli}
                              periodo={periodo}
                              factura={factura}
                            />
                          </div>
                        </td>
                        <td
                          className="px-4 py-2"
                          onClick={(e) => e.stopPropagation()}
                          title="Avance del cliente en el mes seleccionado"
                        >
                          <WorkflowCircleMini resumen={workflow} size="xs" />
                        </td>
                        <td className="px-6 py-2" onClick={(e) => e.stopPropagation()}>
                          {/* Correo inteligente con menú híbrido:
                              "Enviar ahora" (Resend con plantilla HTML)
                              o "Abrir en Gmail" (mailto: texto plano).
                              El tipo de correo (recordatorio / vencido /
                              cierre con historial) lo decide
                              `getCorreoIndividualCliente` según el
                              estatus del cliente este mes. */}
                          <div className="flex items-center justify-end gap-1">
                            {!esGeneral && (
                              <BotonPedirCapturaCobranza
                                cliente={cli}
                                tipo="honorarios"
                              />
                            )}
                            <BotonCorreoCliente
                              cliente={cli}
                              periodo={periodo}
                              tipo={correoInd.habilitado ? correoInd.tipo : "recordatorio"}
                              habilitado={correoInd.habilitado}
                              motivo={correoInd.habilitado ? undefined : correoInd.motivo}
                              titulo={correoInd.habilitado ? correoInd.titulo : undefined}
                              descripcion={correoInd.habilitado ? correoInd.descripcion : undefined}
                              notify={notify}
                              enviadoEn={
                                getUltimoEnvioResend(
                                  recordatorioLog,
                                  cli.id,
                                  periodoKeyStr(periodo)
                                )?.contactadoEn
                              }
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
                    <td colSpan={9} className="px-10 py-20 text-center text-slate-400 font-medium text-[13px]">
                      No hay clientes en este filtro
                    </td>
                  </tr>
                )}
              </tbody>
              {clientesFiltrados.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-100">
                    <td colSpan={4} className="px-6 py-2">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Visible
                      </p>
                      <p className="text-[15px] font-bold tabular-nums text-slate-900 mt-0.5">
                        {totalesVista.cantidad} cliente{totalesVista.cantidad === 1 ? "" : "s"}
                      </p>
                    </td>
                    <td className="px-6 py-2 text-center">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Deuda total
                      </p>
                      <p className="text-[22px] font-bold tabular-nums leading-none tracking-tight text-rose-600 mt-0.5">
                        ${totalesVista.deuda.toLocaleString()}
                      </p>
                      {totalesVista.extras > 0 && (
                        <p className="text-[11px] font-medium text-amber-600 mt-1 tabular-nums">
                          incl. {totalesVista.extras.toLocaleString()} extra
                        </p>
                      )}
                    </td>
                    <td colSpan={5} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>

      {selectedClient && (
        <PanelDetalleCliente
          cliente={selectedClient}
          periodoVisible={periodoPanelInicial ?? periodo}
          tabInicial={tabPanelInicial}
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
          className="hidden lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-[55] items-center gap-2 px-3 py-2 bg-[#1c1c1e] text-white rounded-full shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center gap-2 pl-3 pr-2">
            <span className="flex items-center justify-center h-7 w-7 rounded-full bg-violet-500 text-white text-[11px] font-black">
              {seleccionados.size}
            </span>
            <span className="text-[12px] font-semibold text-slate-300">
              seleccionados
            </span>
          </div>
          <span className="h-6 w-px bg-slate-700" />
          <button
            type="button"
            onClick={() => enviarCorreoEnLote("recordatorio")}
            className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors"
          >
            Recordatorio
          </button>
          <button
            type="button"
            onClick={() => enviarCorreoEnLote("vencido")}
            className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-amber-500/15 text-amber-200 hover:bg-amber-500/25 transition-colors"
          >
            Vencido
          </button>
          <button
            type="button"
            onClick={() => enviarCorreoEnLote("cierre_mes")}
            className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors"
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
            className="px-3 py-1.5 rounded-full text-[12px] font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Limpiar
          </button>
        </div>
      )}

      <style jsx global>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

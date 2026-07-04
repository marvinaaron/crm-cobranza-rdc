"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ChangeEvent,
} from "react";
import { useClientes } from "@/context/ClientesContext";
import {
  MESES_NOM,
  type Cliente,
  type Periodo,
  estaPagado,
  tienePagoParcial,
  getCompromisoMes,
  getCompromisoBrutoMes,
  getSaldoMes,
  getMontoMes,
  getMontoPagado,
  getMontoDescuento,
  getDescuentoMes,
  getNotaPago,
  getServiciosAdicionalesAnio,
  getTotalAdicionalesAnio,
  getMontoAdicionalMes,
  getTotalCobradoMes,
  getTotalDeudaPendiente,
  getTotalPendiente,
  getExtrasEsperados,
  getAbonosExtraEsperado,
  getAbonadoExtraEsperado,
  getSaldoExtraEsperado,
  getTotalExtraPorCobrar,
  getPeriodoExtraEsperado,
  labelPeriodoExtra,
  type ExtraEsperado,
  esIngresoGeneralCliente,
  clienteActivoEnPeriodo,
  periodoKey,
  periodoLabel,
  METODOS_PAGO,
  type MetodoPago,
  CONCEPTOS_SERVICIO_ADICIONAL,
} from "@/lib/clientes";
import {
  formatFechaComprobante,
  MAX_COMPROBANTE_BYTES,
} from "@/lib/comprobantes";
import { readFileAsDataUrl } from "@/lib/archivos";
import MesPagoFila from "@/components/admin/MesPagoFila";
import CentroIngresosDiversos from "@/components/admin/CentroIngresosDiversos";
import BotonCorreoEvento from "@/components/admin/BotonCorreoEvento";
import { useNotify, useConfirm } from "@/components/ConfirmProvider";

type Props = {
  cliente: Cliente;
  periodoVisible: Periodo;
  onClose: () => void;
  onAbrirFactura: (periodo: Periodo) => void;
  onAbrirIngresoExtra: () => void;
  /** En móvil, abre directo en «Aplicar pago». */
  tabInicial?: "meses" | "acciones";
};

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
}

function fechaHoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Panel de detalle de cliente para el módulo de cobranza.
 *
 * Diseñado como overlay casi pantalla completa (desktop-first):
 *  - Backdrop blur fuerte + bloqueo de scroll del body.
 *  - Layout split-view: izquierda lista de 12 meses; derecha panel
 *    inline de "Aplicar pago" y comprobante.
 *  - Captura de fecha de pago efectivo (para analítica de "qué días
 *    cobran mejor mis clientes").
 *  - Admin puede SUBIR comprobante si el cliente no lo hizo desde su
 *    portal.
 *  - Totales del cliente incluyen adicionales sumados al esperado.
 *
 * Móvil: colapsa a una sola columna con tabs "Meses" ↔ "Acciones".
 */
export default function PanelDetalleCliente({
  cliente: clienteProp,
  periodoVisible,
  onClose,
  onAbrirFactura,
  onAbrirIngresoExtra,
  tabInicial = "meses",
}: Props) {
  const {
    listaClientes,
    aniosDisponibles,
    registrarPago,
    quitarPago,
    registrarServicioAdicional,
    eliminarServicioAdicional,
    agregarExtraEsperado,
    editarExtraEsperado,
    eliminarExtraEsperado,
    registrarAbonoExtraEsperado,
    aplicarDescuento,
    eliminarDescuento,
    getComprobantePeriodo,
    subirComprobante,
    validarComprobantePago,
    getComprobantesExtra,
    validarComprobanteExtra,
    eliminarComprobantePagoHonorarios,
  } = useClientes();

  // Tomamos siempre la versión más reciente del cliente desde el
  // contexto. Esto hace que al registrar/quitar pago o aplicar/quitar
  // descuento el panel refleje los nuevos saldos en tiempo real, sin
  // necesidad de cerrar y reabrir.
  const cliente = useMemo(
    () => listaClientes.find((c) => c.id === clienteProp.id) ?? clienteProp,
    [listaClientes, clienteProp]
  );

  const notify = useNotify();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const esGeneral = esIngresoGeneralCliente(cliente);

  // Mes activo del panel derecho. Por defecto, el periodo visible.
  const [mesActivo, setMesActivo] = useState<Periodo>(periodoVisible);

  // Tab para móvil.
  const [tabMovil, setTabMovil] = useState<"meses" | "acciones">(tabInicial);

  // Form de pago.
  const [montoInput, setMontoInput] = useState<string>("");
  const [fechaPagoInput, setFechaPagoInput] = useState<string>(fechaHoyIso());
  const [notaInput, setNotaInput] = useState<string>("");
  const [metodoPagoInput, setMetodoPagoInput] =
    useState<MetodoPago>("transferencia");
  const [aplicando, setAplicando] = useState(false);

  // Form de descuento.
  const [descAbierto, setDescAbierto] = useState(false);
  const [descTipo, setDescTipo] = useState<"porcentaje" | "monto">("porcentaje");
  const [descValor, setDescValor] = useState<string>("");
  const [descMotivo, setDescMotivo] = useState<string>("");

  // Form de servicio adicional (cargo extra, independiente de honorarios).
  // Pensado para cobros puntuales y meses atrasados que se trabajan a tarifa
  // distinta (ej. $290/mes de contabilidad anterior). NO toca los honorarios
  // ni la relación de meses.
  const [adicAbierto, setAdicAbierto] = useState(false);
  const [adicConcepto, setAdicConcepto] = useState<string>(
    CONCEPTOS_SERVICIO_ADICIONAL[0]
  );
  const [adicConceptoLibre, setAdicConceptoLibre] = useState("");
  const [adicMonto, setAdicMonto] = useState("");
  const [adicMes, setAdicMes] = useState(periodoVisible.mes);
  const [adicAnio, setAdicAnio] = useState(periodoVisible.anio);
  const [adicNota, setAdicNota] = useState("");
  const [adicConfirm, setAdicConfirm] = useState<string | null>(null);

  // Extra esperado (deuda por cobrar, una línea sin mes).
  const [xeAbierto, setXeAbierto] = useState(false);
  const [xeConcepto, setXeConcepto] = useState<string>(
    CONCEPTOS_SERVICIO_ADICIONAL[0]
  );
  const [xeConceptoLibre, setXeConceptoLibre] = useState("");
  const [xeMonto, setXeMonto] = useState("");
  const [xeNota, setXeNota] = useState("");
  const [xeMes, setXeMes] = useState(periodoVisible.mes);
  const [xeAnio, setXeAnio] = useState(periodoVisible.anio);
  const [xeEditId, setXeEditId] = useState<string | null>(null);
  const [abonoExtraId, setAbonoExtraId] = useState<string | null>(null);
  const [abonoMonto, setAbonoMonto] = useState("");
  const [mostrarCorreoPago, setMostrarCorreoPago] = useState(false);

  // Bloqueo de scroll del body mientras el panel está abierto.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Cerrar con Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Cuando cambia el mes activo, reseteamos el form a su saldo.
  useEffect(() => {
    const saldo = getSaldoMes(cliente, mesActivo);
    setMontoInput(saldo > 0 ? String(saldo) : "");
    setNotaInput("");
    setFechaPagoInput(fechaHoyIso());
    setDescAbierto(false);
    setDescTipo("porcentaje");
    setDescValor("");
    setDescMotivo("");
    setMostrarCorreoPago(false);
  }, [mesActivo, cliente]);

  // El form de servicio adicional se sincroniza SOLO con el mes activo (no con
  // `cliente`), para que registrar un cargo —que actualiza el cliente— no cierre
  // el formulario y se puedan capturar varios meses atrasados seguidos.
  useEffect(() => {
    setAdicAbierto(false);
    setAdicConcepto(CONCEPTOS_SERVICIO_ADICIONAL[0]);
    setAdicConceptoLibre("");
    setAdicMonto("");
    setAdicMes(mesActivo.mes);
    setAdicAnio(mesActivo.anio);
    setAdicNota("");
    setAdicConfirm(null);
  }, [mesActivo]);

  const comprobanteActivo = useMemo(
    () => getComprobantePeriodo(cliente.id, mesActivo),
    [getComprobantePeriodo, cliente.id, mesActivo]
  );

  const compromisoBruto = getCompromisoBrutoMes(cliente, mesActivo);
  const descuentoExistente = getDescuentoMes(cliente, mesActivo);
  const montoDescuento = descuentoExistente
    ? getMontoDescuento(cliente, mesActivo)
    : 0;
  const compromisoNeto = getCompromisoMes(cliente, mesActivo);
  const pagado = getMontoPagado(cliente, mesActivo);
  const saldoMes = getSaldoMes(cliente, mesActivo);
  const yaPagado = estaPagado(cliente, mesActivo);

  const handleAplicarPago = useCallback(async () => {
    const monto = Number(montoInput);
    if (!monto || monto <= 0) {
      await notify({
        titulo: "Monto inválido",
        mensaje: "Captura un monto válido para registrar el pago.",
        tono: "warning",
      });
      return;
    }
    setAplicando(true);
    try {
      registrarPago(cliente.id, mesActivo, monto, notaInput, {
        fechaPago: fechaPagoInput || fechaHoyIso(),
        metodoPago: metodoPagoInput,
      });
      // Feedback explícito tras el cambio de badge del mes en la
      // lista izquierda. Resume el resultado real del pago:
      //   · saldo = 0 → "Pago completo aplicado"
      //   · saldo > 0 → "Pago parcial aplicado · queda $X"
      //   · saldo < 0 → "Sobrepago $X (anticipo)"
      const nuevoPagado = pagado + monto;
      const restante = compromisoNeto - nuevoPagado;
      const mesLabel = periodoLabel(mesActivo);
      let titulo = "Pago aplicado";
      let mensaje = `Se aplicaron ${fmt(monto)} a ${mesLabel}.`;
      let tono: "info" | "warning" = "info";
      if (restante > 0) {
        titulo = "Pago parcial aplicado";
        mensaje = `${fmt(monto)} a ${mesLabel}. Queda saldo de ${fmt(restante)}.`;
      } else if (restante < 0) {
        titulo = "Sobrepago registrado";
        mensaje = `${fmt(monto)} a ${mesLabel}. Sobran ${fmt(-restante)} (anticipo).`;
        tono = "warning";
      }
      setNotaInput("");
      setMontoInput("");
      const quiereEnviar = await confirm({
        titulo,
        mensaje: `${mensaje}\n\n¿Deseas enviar correo de confirmación al cliente?`,
        textoConfirmar: "Enviar correo",
        textoCancelar: "Solo cerrar",
        tono: tono === "warning" ? "warning" : "info",
      });
      if (quiereEnviar) {
        setMostrarCorreoPago(true);
      }
    } finally {
      setAplicando(false);
    }
  }, [
    montoInput,
    notaInput,
    fechaPagoInput,
    metodoPagoInput,
    registrarPago,
    cliente.id,
    pagado,
    compromisoNeto,
    mesActivo,
    confirm,
  ]);

  const handleEliminarPagoMes = useCallback(async () => {
    const ok = await confirm({
      titulo: "Eliminar pago del mes",
      mensaje: `¿Eliminar el pago aplicado a ${periodoLabel(mesActivo)}? Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    quitarPago(cliente.id, mesActivo);
  }, [confirm, quitarPago, cliente.id, mesActivo]);

  const handleAplicarDescuento = useCallback(async () => {
    const valor = Number(descValor);
    if (!valor || valor <= 0) {
      await notify({
        titulo: "Valor inválido",
        mensaje: "Captura un valor numérico válido para el descuento.",
        tono: "warning",
      });
      return;
    }
    if (!descMotivo.trim()) {
      await notify({
        titulo: "Falta el motivo",
        mensaje: "Captura el motivo del descuento.",
        tono: "warning",
      });
      return;
    }
    aplicarDescuento(cliente.id, mesActivo, {
      tipo: descTipo,
      valor,
      motivo: descMotivo.trim(),
    });
    setDescAbierto(false);
    setDescValor("");
    setDescMotivo("");
  }, [descValor, descMotivo, descTipo, aplicarDescuento, cliente.id, mesActivo, notify]);

  const handleEliminarDescuento = useCallback(async () => {
    if (!descuentoExistente) return;
    const ok = await confirm({
      titulo: "Eliminar descuento",
      mensaje: `¿Eliminar el descuento de ${periodoLabel(mesActivo)}?`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    eliminarDescuento(cliente.id, descuentoExistente.id);
  }, [confirm, descuentoExistente, eliminarDescuento, cliente.id, mesActivo]);

  const handleAgregarAdicional = useCallback(async () => {
    const monto = Number(adicMonto);
    const concepto =
      adicConcepto === "Otro" ? adicConceptoLibre.trim() : adicConcepto;
    if (!monto || monto <= 0) {
      await notify({
        titulo: "Monto inválido",
        mensaje: "Captura un monto válido para el cargo adicional.",
        tono: "warning",
      });
      return;
    }
    if (!concepto) {
      await notify({
        titulo: "Falta el concepto",
        mensaje: "Describe el servicio adicional que vas a cobrar.",
        tono: "warning",
      });
      return;
    }
    registrarServicioAdicional(
      cliente.id,
      { mes: adicMes, anio: adicAnio },
      monto,
      concepto,
      adicNota.trim() || undefined
    );
    // Dejamos el formulario abierto y conservamos concepto/monto/año para
    // capturar varios meses atrasados de corrido. Solo limpiamos la nota y
    // mostramos confirmación inline.
    setAdicConfirm(
      `✓ ${fmt(monto)} · ${concepto} · ${MESES_NOM[adicMes]} ${adicAnio}`
    );
    setAdicNota("");
  }, [
    adicMonto,
    adicConcepto,
    adicConceptoLibre,
    adicMes,
    adicAnio,
    adicNota,
    registrarServicioAdicional,
    cliente.id,
    notify,
  ]);

  const handleEliminarAdicional = useCallback(
    async (pagoId: string, label: string) => {
      const ok = await confirm({
        titulo: "Eliminar servicio adicional",
        mensaje: `¿Eliminar el cargo "${label}"? Esta acción no se puede deshacer.`,
        textoConfirmar: "Eliminar",
        tono: "danger",
      });
      if (!ok) return;
      eliminarServicioAdicional(cliente.id, pagoId);
    },
    [confirm, eliminarServicioAdicional, cliente.id]
  );

  const handleAgregarExtraEsperado = useCallback(async () => {
    const monto = Number(xeMonto);
    const concepto =
      xeConcepto === "Otro" ? xeConceptoLibre.trim() : xeConcepto;
    if (!monto || monto <= 0) {
      await notify({
        titulo: "Monto inválido",
        mensaje: "Captura el total del extra por cobrar.",
        tono: "warning",
      });
      return;
    }
    if (!concepto) {
      await notify({
        titulo: "Falta el concepto",
        mensaje: "Describe el cargo extra que le vas a cobrar.",
        tono: "warning",
      });
      return;
    }
    if (xeEditId) {
      editarExtraEsperado(cliente.id, xeEditId, {
        concepto,
        montoTotal: monto,
        periodo: { mes: xeMes, anio: xeAnio },
        nota: xeNota.trim() || undefined,
      });
    } else {
      agregarExtraEsperado(
        cliente.id,
        concepto,
        monto,
        { mes: xeMes, anio: xeAnio },
        xeNota.trim() || undefined
      );
    }
    setXeAbierto(false);
    setXeEditId(null);
    setXeMonto("");
    setXeNota("");
    setXeConceptoLibre("");
    setXeConcepto(CONCEPTOS_SERVICIO_ADICIONAL[0]);
    setXeMes(periodoVisible.mes);
    setXeAnio(periodoVisible.anio);
  }, [
    xeEditId,
    xeMonto,
    xeConcepto,
    xeConceptoLibre,
    xeNota,
    xeMes,
    xeAnio,
    periodoVisible.mes,
    periodoVisible.anio,
    agregarExtraEsperado,
    editarExtraEsperado,
    cliente.id,
    notify,
  ]);

  const abrirEdicionExtra = useCallback(
    (extra: ExtraEsperado) => {
      const conceptoConocido = CONCEPTOS_SERVICIO_ADICIONAL.includes(
        extra.concepto as (typeof CONCEPTOS_SERVICIO_ADICIONAL)[number]
      );
      const periodo = getPeriodoExtraEsperado(extra);
      setXeEditId(extra.id);
      setXeConcepto(conceptoConocido ? extra.concepto : "Otro");
      setXeConceptoLibre(conceptoConocido ? "" : extra.concepto);
      setXeMonto(String(extra.montoTotal));
      setXeNota(extra.nota ?? "");
      setXeMes(periodo.mes);
      setXeAnio(periodo.anio);
      setXeAbierto(true);
    },
    []
  );

  const handleEliminarExtraEsperado = useCallback(
    async (extraId: string, label: string) => {
      const ok = await confirm({
        titulo: "Eliminar extra por cobrar",
        mensaje: `¿Eliminar "${label}" y todos sus abonos registrados? Esta acción no se puede deshacer.`,
        textoConfirmar: "Eliminar",
        tono: "danger",
      });
      if (!ok) return;
      eliminarExtraEsperado(cliente.id, extraId);
      if (abonoExtraId === extraId) {
        setAbonoExtraId(null);
        setAbonoMonto("");
      }
    },
    [confirm, eliminarExtraEsperado, cliente.id, abonoExtraId]
  );

  const handleRegistrarAbonoExtra = useCallback(async () => {
    if (!abonoExtraId) return;
    const monto = Number(abonoMonto);
    if (!monto || monto <= 0) {
      await notify({
        titulo: "Monto inválido",
        mensaje: "Captura un abono válido.",
        tono: "warning",
      });
      return;
    }
    const extra = getExtrasEsperados(cliente).find((e) => e.id === abonoExtraId);
    if (!extra) return;
    const saldo = getSaldoExtraEsperado(cliente, extra);
    if (monto > saldo) {
      await notify({
        titulo: "Abono mayor al saldo",
        mensaje: `El saldo pendiente es ${fmt(saldo)}.`,
        tono: "warning",
      });
      return;
    }
    registrarAbonoExtraEsperado(
      cliente.id,
      abonoExtraId,
      mesActivo,
      monto
    );
    setAbonoExtraId(null);
    setAbonoMonto("");
    await notify({
      titulo: "Abono registrado",
      mensaje: `${fmt(monto)} aplicado a "${extra.concepto}". Cuenta como cobrado de ${periodoLabel(mesActivo)}.`,
      tono: "info",
    });
  }, [
    abonoExtraId,
    abonoMonto,
    cliente,
    mesActivo,
    registrarAbonoExtraEsperado,
    notify,
  ]);

  const handleValidarComprobanteExtra = useCallback(
    async (comprobanteId: string) => {
      const validado = validarComprobanteExtra(comprobanteId);
      if (!validado) {
        await notify({
          titulo: "No se pudo validar",
          mensaje:
            "Revisa que el monto del comprobante no exceda el saldo del extra.",
          tono: "warning",
        });
        return;
      }
      await notify({
        titulo: "Pago validado",
        mensaje: `Aplicamos ${fmt(
          validado.montoDeclarado ?? 0
        )} al extra. Se notificó al cliente.`,
        tono: "info",
      });
    },
    [validarComprobanteExtra, notify]
  );

  const handleRechazarComprobanteExtra = useCallback(
    async (comprobanteId: string, nombre: string) => {
      const ok = await confirm({
        titulo: "Rechazar comprobante",
        mensaje: `Vas a eliminar "${nombre}". El cliente podrá subir otro. Esta acción no se puede deshacer.`,
        textoConfirmar: "Rechazar",
        tono: "danger",
      });
      if (!ok) return;
      eliminarComprobantePagoHonorarios(comprobanteId, {
        notificarCliente: false,
        revertirPagosVinculados: false,
      });
    },
    [confirm, eliminarComprobantePagoHonorarios]
  );

  const handleSubirComprobanteAdmin = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const archivo = e.target.files?.[0];
      e.target.value = "";
      if (!archivo) return;
      if (archivo.size > MAX_COMPROBANTE_BYTES) {
        await notify({
          titulo: "Archivo muy grande",
          mensaje: `El archivo supera el tamaño máximo (${(MAX_COMPROBANTE_BYTES / (1024 * 1024)).toFixed(0)} MB).`,
          tono: "warning",
        });
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(archivo);
        const nuevo = subirComprobante(cliente.id, [mesActivo], {
          nombreArchivo: archivo.name,
          tipoMime: archivo.type || "application/octet-stream",
          dataUrl,
        });
        // Como lo subió el admin, lo validamos automáticamente.
        const { correo } = await validarComprobantePago(nuevo.id);
        if (correo?.ok) {
          await notify({
            titulo: "Correo enviado",
            mensaje: "Confirmación de pago enviada al cliente.",
            tono: "info",
          });
        } else if (correo && !correo.ok) {
          await notify({
            titulo: "Correo no enviado",
            mensaje: correo.error,
            tono: "warning",
          });
        }
      } catch (err) {
        await notify({
          titulo: "No se pudo subir",
          mensaje:
            err instanceof Error
              ? err.message
              : "Ocurrió un error al subir el comprobante.",
          tono: "danger",
        });
      }
    },
    [subirComprobante, validarComprobantePago, cliente.id, mesActivo, notify]
  );

  // Totales del año (incluye adicionales en el esperado).
  const totalCobradoMesActual = getTotalCobradoMes(cliente, mesActivo);
  const totalAdicMes = getMontoAdicionalMes(cliente, mesActivo);
  const totalAdicAnio = getTotalAdicionalesAnio(cliente, periodoVisible.anio);
  const totalPendienteCli = getTotalDeudaPendiente(cliente, periodoVisible);
  const totalPendienteHonorarios = getTotalPendiente(cliente, periodoVisible);
  const extrasEsperados = getExtrasEsperados(cliente);
  const totalExtraPorCobrar = getTotalExtraPorCobrar(cliente);

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar panel de cobranza"
        className="fixed inset-x-0 top-14 bottom-[104px] lg:inset-0 z-[60] bg-slate-900/50 cursor-default"
        onClick={onClose}
      />
      <div
        className="fixed inset-x-0 top-14 bottom-[104px] lg:inset-0 z-[60] flex items-center justify-center p-2 sm:p-3 lg:p-6 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de cobranza · ${cliente.razonSocial}`}
      >
      <div
        className="relative z-[61] bg-white rounded-2xl lg:rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.35)] border border-slate-100 w-full max-w-[1400px] h-full max-h-full lg:h-[calc(100vh-3rem)] flex flex-col overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-white to-slate-50">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tighter truncate">
                {cliente.razonSocial}
              </h2>
              {!esGeneral && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest">
                  Día de pago: {cliente.fechaPago}
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mt-1">
              {cliente.rfc}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs móvil */}
        {!esGeneral && (
        <div className="lg:hidden flex border-b border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={() => setTabMovil("meses")}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${
              tabMovil === "meses"
                ? "text-emerald-600 border-emerald-500"
                : "text-slate-400 border-transparent"
            }`}
          >
            Meses del año
          </button>
          <button
            type="button"
            onClick={() => setTabMovil("acciones")}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${
              tabMovil === "acciones"
                ? "text-emerald-600 border-emerald-500"
                : "text-slate-400 border-transparent"
            }`}
          >
            Aplicar pago
          </button>
        </div>
        )}

        {/* SPLIT VIEW — para la bolsa de Ingresos Diversos mostramos el
            Centro de Ingresos Diversos en lugar del flujo de honorarios. */}
        {esGeneral ? (
          <CentroIngresosDiversos
            cliente={cliente}
            periodoVisible={periodoVisible}
          />
        ) : (
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          {/* COLUMNA IZQUIERDA — Lista de meses (50% en desktop) */}
          <section
            className={`flex-1 lg:flex-1 lg:basis-1/2 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-slate-50/40 ${
              tabMovil === "meses" ? "block" : "hidden lg:block"
            }`}
          >
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">
              Mes al que se descuenta la deuda · {periodoVisible.anio}
            </p>
            <p className="text-[10px] font-bold text-slate-500 mb-3 pl-1 leading-relaxed">
              Elige el mes de honorarios (ej. febrero). La{" "}
              <span className="text-slate-700">fecha de pago</span> en el formulario define en qué
              mes aparece en caja (estado de cuenta bancario).
            </p>
            <div className="space-y-2">
              {MESES_NOM.map((m, i) => {
                const p: Periodo = { mes: i, anio: periodoVisible.anio };
                const previoInicio = !clienteActivoEnPeriodo(cliente, p);
                const esFuturo = periodoKey(p) > periodoKey(periodoVisible);
                const activo = !previoInicio && !esFuturo;
                const pgd = estaPagado(cliente, p);
                const parcial = tienePagoParcial(cliente, p);
                const atrasado = activo && !pgd && !parcial;
                const compromiso = getCompromisoMes(cliente, p);
                const montoDeEsteMes =
                  pgd || parcial ? getMontoMes(cliente, p) : compromiso;
                const notaMes = getNotaPago(cliente, p);
                const descMes = getDescuentoMes(cliente, p);
                const montoDescMes = descMes ? getMontoDescuento(cliente, p) : 0;
                const esMesActivo =
                  p.mes === mesActivo.mes && p.anio === mesActivo.anio;

                return (
                  <div
                    key={m}
                    className={`rounded-2xl transition-all ${
                      esMesActivo
                        ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-50 shadow-md"
                        : ""
                    }`}
                  >
                    <MesPagoFila
                      labelMes={m}
                      activo={activo}
                      esPeriodoActual={i === periodoVisible.mes}
                      esGeneral={esGeneral}
                      previoInicio={previoInicio}
                      pagado={pgd}
                      parcial={parcial}
                      atrasado={atrasado}
                      montoDeEsteMes={montoDeEsteMes}
                      notaMes={notaMes}
                      descuentoLabel={
                        descMes
                          ? descMes.tipo === "porcentaje"
                            ? `-${descMes.valor}% (${descMes.motivo})`
                            : `-$${montoDescMes.toLocaleString()} (${descMes.motivo})`
                          : null
                      }
                      hayPagoEnMes={pgd || parcial}
                      facturaCargada={false}
                      facturaMonto={null}
                      onTap={() => {
                        if (esGeneral) {
                          onAbrirIngresoExtra();
                          return;
                        }
                        setMesActivo(p);
                        setTabMovil("acciones");
                      }}
                      onAbrirFactura={() => onAbrirFactura(p)}
                      onEliminarPago={() => {
                        setMesActivo(p);
                        // El usuario disparará el botón "Eliminar pago"
                        // en el panel derecho.
                      }}
                      swipeAbierto={false}
                      onSwipeAbrir={() => {}}
                      onSwipeCerrar={() => {}}
                    />
                  </div>
                );
              })}
            </div>

            {/* Extras por cobrar (deuda acordada, sin mes) */}
            {!esGeneral && extrasEsperados.length > 0 && (
              <div className="mt-6 pt-4 border-t border-dashed border-amber-200">
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                    Extras por cobrar
                  </p>
                  <p className="text-sm font-black text-amber-700 tabular-nums">
                    {fmt(totalExtraPorCobrar)}
                  </p>
                </div>
                <div className="space-y-2">
                  {extrasEsperados.map((extra) => {
                    const abonado = getAbonadoExtraEsperado(cliente, extra.id);
                    const saldo = getSaldoExtraEsperado(cliente, extra);
                    const liquidado = saldo <= 0;
                    const abriendoAbono = abonoExtraId === extra.id;
                    return (
                      <div
                        key={extra.id}
                        className={`rounded-2xl border px-4 py-3 ${
                          liquidado
                            ? "bg-emerald-50/60 border-emerald-100"
                            : "bg-amber-50/60 border-amber-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 pr-1">
                            <p className="text-sm font-black text-slate-800">
                              {extra.concepto}
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700 mt-0.5">
                              Mes: {labelPeriodoExtra(extra)}
                            </p>
                            {extra.nota && (
                              <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                                {extra.nota}
                              </p>
                            )}
                            <p className="text-[10px] font-bold text-amber-700 mt-1 tabular-nums">
                              Total {fmt(extra.montoTotal)} · Abonado{" "}
                              {fmt(abonado)} · Saldo {fmt(saldo)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!liquidado && !abriendoAbono && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAbonoExtraId(extra.id);
                                  setAbonoMonto(
                                    saldo > 0 ? String(saldo) : ""
                                  );
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-amber-700"
                              >
                                Abono
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleEliminarExtraEsperado(
                                  extra.id,
                                  extra.concepto
                                )
                              }
                              aria-label="Eliminar extra por cobrar"
                              title="Eliminar"
                              className="grid place-items-center h-8 w-8 rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-100"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                <path d="M10 11v6M14 11v6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {abriendoAbono && (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="number"
                              inputMode="decimal"
                              value={abonoMonto}
                              onChange={(e) => setAbonoMonto(e.target.value)}
                              placeholder="Monto del abono"
                              className="flex-1 px-3 py-2 rounded-xl border border-amber-200 outline-none text-sm font-bold tabular-nums focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setAbonoExtraId(null);
                                setAbonoMonto("");
                              }}
                              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-widest"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleRegistrarAbonoExtra}
                              className="px-3 py-2 rounded-xl bg-amber-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-amber-700"
                            >
                              Registrar
                            </button>
                          </div>
                        )}
                        {(() => {
                          const abonos = getAbonosExtraEsperado(cliente, extra.id);
                          if (abonos.length === 0) return null;
                          return (
                            <div className="mt-2.5 pt-2 border-t border-amber-100 space-y-1">
                              <p className="text-[8px] font-black uppercase tracking-widest text-amber-800/70">
                                Historial de abonos
                              </p>
                              {abonos.map((a) => (
                                <div
                                  key={a.id ?? `${a.mes}-${a.monto}`}
                                  className="flex items-start justify-between gap-2 text-[10px] font-bold text-slate-600"
                                >
                                  <span className="min-w-0">
                                    {MESES_NOM[a.mes]} {a.anio}
                                    {a.fechaPago ? ` · ${a.fechaPago}` : ""}
                                    {a.nota ? ` · ${a.nota}` : ""}
                                  </span>
                                  <span className="shrink-0 tabular-nums text-emerald-700">
                                    {fmt(a.monto)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        {(() => {
                          const comps = getComprobantesExtra(
                            cliente.id,
                            extra.id
                          ).filter((c) => c.estado === "pendiente");
                          if (comps.length === 0) return null;
                          return (
                            <div className="mt-3 space-y-2">
                              {comps.map((cmp) => (
                                <div
                                  key={cmp.id}
                                  className="rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-2"
                                >
                                  <p className="text-[8px] font-black uppercase tracking-widest text-indigo-700">
                                    Comprobante en validación
                                    {cmp.montoDeclarado
                                      ? ` · ${fmt(cmp.montoDeclarado)}`
                                      : ""}
                                  </p>
                                  <p className="text-[11px] font-bold text-slate-600 truncate">
                                    {cmp.nombreArchivo}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    <a
                                      href={cmp.dataUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={cmp.nombreArchivo}
                                      className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase tracking-widest hover:bg-indigo-50"
                                    >
                                      Ver
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleValidarComprobanteExtra(cmp.id)
                                      }
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700"
                                    >
                                      Validar y abonar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRechazarComprobanteExtra(
                                          cmp.id,
                                          cmp.nombreArchivo
                                        )
                                      }
                                      className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100 text-[8px] font-black uppercase tracking-widest hover:bg-red-100"
                                    >
                                      Rechazar
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Servicios adicionales del año */}
            {!esGeneral &&
              (() => {
                const adicionales = getServiciosAdicionalesAnio(
                  cliente,
                  periodoVisible.anio
                );
                if (adicionales.length === 0) return null;
                return (
                  <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-violet-700">
                        Servicios adicionales {periodoVisible.anio}
                      </p>
                      <p className="text-sm font-black text-violet-700 tabular-nums">
                        {fmt(totalAdicAnio)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {adicionales.map((p) => (
                        <div
                          key={p.id ?? `${p.mes}-${p.monto}-${p.concepto}`}
                          className="flex items-center justify-between px-4 py-3 rounded-2xl bg-violet-50/60 border border-violet-100"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-sm font-black text-violet-800 truncate">
                              {p.concepto ?? "Servicio adicional"}
                            </p>
                            <p className="text-[10px] font-bold text-violet-500 mt-0.5">
                              {MESES_NOM[p.mes]}
                              {p.nota ? ` · ${p.nota}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <p className="text-base font-black text-violet-700 tabular-nums">
                              {fmt(p.monto)}
                            </p>
                            {p.id && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleEliminarAdicional(
                                    p.id as string,
                                    `${p.concepto ?? "Servicio adicional"} · ${MESES_NOM[p.mes]} ${p.anio}`
                                  )
                                }
                                aria-label="Eliminar servicio adicional"
                                title="Eliminar"
                                className="grid place-items-center h-8 w-8 rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-100"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                  <path d="M10 11v6M14 11v6" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
          </section>

          {/* COLUMNA DERECHA — Aplicar pago + Comprobante (50%) */}
          <aside
            className={`flex-1 lg:flex-1 lg:basis-1/2 lg:border-l border-slate-100 min-h-0 overflow-y-auto bg-white ${
              tabMovil === "acciones" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="p-5 sm:p-6 space-y-5">
              {/* Mes seleccionado */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4">
                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">
                  Mes seleccionado
                </p>
                <p className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                  {periodoLabel(mesActivo)}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Compromiso
                    </p>
                    <p className="font-black text-slate-700 tabular-nums">
                      {fmt(compromisoNeto)}
                      {montoDescuento > 0 && (
                        <span className="ml-1 text-[9px] font-bold text-rose-600">
                          (-{fmt(montoDescuento)})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Pagado
                    </p>
                    <p className="font-black text-emerald-600 tabular-nums">
                      {fmt(pagado)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Saldo
                    </p>
                    <p
                      className={`font-black tabular-nums ${
                        saldoMes > 0 ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {fmt(saldoMes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Adicionales mes
                    </p>
                    <p className="font-black text-violet-600 tabular-nums">
                      {fmt(totalAdicMes)}
                    </p>
                  </div>
                </div>
              </div>

              {/* FORMULARIO APLICAR PAGO INLINE */}
              {!esGeneral && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                    {yaPagado ? "Pago aplicado" : "Aplicar pago"}
                  </p>
                  {pagado > 0 && saldoMes > 0 && (
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                      Ya hay {fmt(pagado)} registrados. Cada abono se suma al mes; captura solo
                      lo que acaba de recibir.
                    </p>
                  )}

                  {/* Monto + botón de auto-llenar con el saldo del mes
                       (un click ahorra una multiplicación mental). */}
                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Monto recibido
                      </label>
                      {saldoMes > 0 && (
                        <button
                          type="button"
                          onClick={() => setMontoInput(String(saldoMes))}
                          className="text-[9px] font-black text-emerald-700 uppercase tracking-widest hover:text-emerald-900"
                          title={`Auto-llenar con el saldo pendiente del mes (${fmt(saldoMes)})`}
                        >
                          = saldo · {fmt(saldoMes)}
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={montoInput}
                      onChange={(e) => setMontoInput(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm font-bold tabular-nums"
                    />
                  </div>

                  {/* Método de pago — chips compactos solo con emoji
                       que se expanden al hacer hover (o al estar
                       seleccionados) para mostrar la etiqueta. Usado
                       para conciliación bancaria y para analítica
                       (Stripe vs transferencia, etc.). */}
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Método de pago
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {METODOS_PAGO.map((m) => {
                        const activo = metodoPagoInput === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMetodoPagoInput(m.id)}
                            className={`group inline-flex items-center gap-1.5 h-10 px-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-200 ease-out ${
                              activo
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm"
                                : "bg-white border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/40"
                            }`}
                            title={m.label}
                            aria-pressed={activo}
                            aria-label={m.label}
                          >
                            <span className="text-base leading-none" aria-hidden="true">
                              {m.icono}
                            </span>
                            <span
                              className={`overflow-hidden whitespace-nowrap leading-none transition-all duration-200 ease-out ${
                                activo
                                  ? "max-w-[120px] opacity-100"
                                  : "max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100"
                              }`}
                            >
                              {m.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Fecha de pago · caja del mes
                    </label>
                    <input
                      type="date"
                      value={fechaPagoInput}
                      onChange={(e) => setFechaPagoInput(e.target.value)}
                      max={fechaHoyIso()}
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm font-bold"
                    />
                    <p className="text-[9px] text-slate-500 mt-1 font-medium leading-relaxed">
                      Si pones junio, el ingreso aparece en el estado de cuenta de junio. El mes
                      seleccionado a la izquierda es a qué honorarios se abona (puede ser febrero,
                      marzo, etc.).
                    </p>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Nota (opcional)
                    </label>
                    <input
                      type="text"
                      value={notaInput}
                      onChange={(e) => setNotaInput(e.target.value)}
                      placeholder="Ej. Ref 0123 · cuenta destino"
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                    />
                  </div>

                  {/* Resumen del IMPACTO del pago: avisa al usuario qué
                       pasará realmente cuando le dé al botón, evitando
                       errores típicos (aplicar $3,000 a un mes de $3,500
                       sin notar el saldo residual). Solo se muestra
                       cuando hay un monto válido capturado. */}
                  {(() => {
                    const m = Number(montoInput);
                    if (!m || m <= 0) return null;
                    const restante = saldoMes - m;
                    if (Math.abs(restante) < 0.005) {
                      return (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                            ✓ Queda pagado completo
                          </p>
                          <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                            Saldo final: $0
                          </p>
                        </div>
                      );
                    }
                    if (restante > 0) {
                      return (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                          <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                            ⏸ Quedará parcial
                          </p>
                          <p className="text-[10px] text-amber-700 font-bold mt-0.5">
                            Saldo restante: {fmt(restante)}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2">
                        <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">
                          ⚠ Sobrepago · {fmt(-restante)}
                        </p>
                        <p className="text-[10px] text-indigo-700 font-medium mt-0.5">
                          El mes se marca como pagado. Sobran {fmt(-restante)};
                          aplícalos manualmente al siguiente mes si así fue.
                        </p>
                      </div>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={handleAplicarPago}
                    disabled={aplicando}
                    className="w-full py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/25"
                  >
                    {aplicando ? "Aplicando…" : "Registrar pago"}
                  </button>

                  {(pagado > 0 || tienePagoParcial(cliente, mesActivo)) && (
                    <button
                      type="button"
                      onClick={handleEliminarPagoMes}
                      className="w-full py-2 rounded-xl bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-widest hover:bg-rose-100"
                    >
                      Eliminar pago del mes
                    </button>
                  )}

                  {(yaPagado || mostrarCorreoPago) && (
                    <BotonCorreoEvento
                      cliente={cliente}
                      periodo={mesActivo}
                      tipo="pago_confirmado"
                      variante="barra"
                      titulo="Correo de pago confirmado"
                      notify={notify}
                      onEnviado={() => setMostrarCorreoPago(false)}
                    />
                  )}
                </div>
              )}

              {/* EXTRA ESPERADO — deuda acordada en una línea (sin mes). */}
              {!esGeneral && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                      Extra por cobrar
                    </p>
                    <p className="text-[10px] font-bold text-amber-700/80 mt-0.5">
                      Una línea de deuda acordada (ej. Contabilidad 2024).
                      No afecta honorarios ni el esperado mensual.
                    </p>
                    {totalExtraPorCobrar > 0 && (
                      <p className="text-xs font-black text-amber-800 mt-2 tabular-nums">
                        Saldo total extras: {fmt(totalExtraPorCobrar)}
                      </p>
                    )}
                    {extrasEsperados.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {extrasEsperados.map((extra) => {
                          const saldoX = getSaldoExtraEsperado(cliente, extra);
                          const liquidadoX = saldoX <= 0;
                          return (
                            <div
                              key={extra.id}
                              className="flex items-start justify-between gap-2 rounded-xl bg-white/70 border border-amber-100 px-2.5 py-1.5"
                            >
                              <div className="min-w-0">
                                <p className="text-[11px] font-black text-slate-700 truncate">
                                  {extra.concepto}
                                </p>
                                <p className="text-[8px] font-bold uppercase tracking-wider text-amber-700">
                                  {labelPeriodoExtra(extra)}
                                </p>
                                {extra.nota && (
                                  <p className="text-[10px] font-bold text-slate-500 mt-0.5 break-words">
                                    {extra.nota}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`text-[10px] font-black tabular-nums ${
                                    liquidadoX
                                      ? "text-emerald-700"
                                      : "text-amber-800"
                                  }`}
                                >
                                  {liquidadoX ? "Liquidado" : fmt(saldoX)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => abrirEdicionExtra(extra)}
                                  aria-label="Editar extra por cobrar"
                                  title="Editar"
                                  className="grid place-items-center h-6 w-6 rounded-lg bg-amber-100 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-200"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEliminarExtraEsperado(
                                      extra.id,
                                      extra.concepto
                                    )
                                  }
                                  aria-label="Eliminar extra por cobrar"
                                  title="Eliminar"
                                  className="grid place-items-center h-6 w-6 rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-100"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                    <path d="M10 11v6M14 11v6" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {!xeAbierto ? (
                    <button
                      type="button"
                      onClick={() => setXeAbierto(true)}
                      className="w-full py-2.5 rounded-xl bg-white border border-dashed border-amber-300 text-amber-800 text-[9px] font-black uppercase tracking-widest hover:bg-amber-50"
                    >
                      + Agregar extra por cobrar
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {xeEditId && (
                        <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
                          Editando extra
                        </p>
                      )}
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Concepto
                        </label>
                        <select
                          value={xeConcepto}
                          onChange={(e) => setXeConcepto(e.target.value)}
                          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-bold text-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        >
                          {CONCEPTOS_SERVICIO_ADICIONAL.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {xeConcepto === "Otro" && (
                        <input
                          type="text"
                          value={xeConceptoLibre}
                          onChange={(e) => setXeConceptoLibre(e.target.value)}
                          placeholder="Ej. Contabilidad 2024"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold text-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        />
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Mes del cargo
                          </label>
                          <select
                            value={xeMes}
                            onChange={(e) => setXeMes(Number(e.target.value))}
                            className="mt-1 w-full px-2 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-bold text-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                          >
                            {MESES_NOM.map((m, i) => (
                              <option key={m} value={i}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Año
                          </label>
                          <select
                            value={xeAnio}
                            onChange={(e) => setXeAnio(Number(e.target.value))}
                            className="mt-1 w-full px-2 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-bold text-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                          >
                            {aniosDisponibles.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Total a cobrar
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={xeMonto}
                          onChange={(e) => setXeMonto(e.target.value)}
                          placeholder="3480"
                          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-black tabular-nums text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Notas / descripción
                        </label>
                        <input
                          type="text"
                          value={xeNota}
                          onChange={(e) => setXeNota(e.target.value)}
                          placeholder="Ej. 290 × 12 meses de 2024"
                          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setXeAbierto(false);
                            setXeEditId(null);
                            setXeMonto("");
                            setXeNota("");
                            setXeConceptoLibre("");
                            setXeConcepto(CONCEPTOS_SERVICIO_ADICIONAL[0]);
                            setXeMes(periodoVisible.mes);
                            setXeAnio(periodoVisible.anio);
                          }}
                          className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-200"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleAgregarExtraEsperado}
                          className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-amber-700"
                        >
                          {xeEditId ? "Guardar cambios" : "Guardar extra"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SERVICIO ADICIONAL INLINE — ingreso ya cobrado (sin deuda previa). */}
              {!esGeneral && (
                <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-violet-700 uppercase tracking-widest">
                        Servicio adicional
                      </p>
                      <p className="text-[10px] font-bold text-violet-500/80 mt-0.5">
                        Ingreso extra ya cobrado (no deja saldo pendiente).
                      </p>
                    </div>
                  </div>

                  {!adicAbierto ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAdicAbierto(true);
                        setAdicConfirm(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-white border border-dashed border-violet-300 text-violet-700 text-[9px] font-black uppercase tracking-widest hover:bg-violet-50"
                    >
                      + Agregar cargo adicional
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Concepto
                        </label>
                        <select
                          value={adicConcepto}
                          onChange={(e) => setAdicConcepto(e.target.value)}
                          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-bold text-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        >
                          {CONCEPTOS_SERVICIO_ADICIONAL.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {adicConcepto === "Otro" && (
                        <input
                          type="text"
                          value={adicConceptoLibre}
                          onChange={(e) => setAdicConceptoLibre(e.target.value)}
                          placeholder="Describe el servicio…"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold text-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Mes
                          </label>
                          <select
                            value={adicMes}
                            onChange={(e) => setAdicMes(Number(e.target.value))}
                            className="mt-1 w-full px-2 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-bold text-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                          >
                            {MESES_NOM.map((m, i) => (
                              <option key={m} value={i}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Año
                          </label>
                          <select
                            value={adicAnio}
                            onChange={(e) => setAdicAnio(Number(e.target.value))}
                            className="mt-1 w-full px-2 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-bold text-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                          >
                            {aniosDisponibles.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Monto recibido / a cobrar
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={adicMonto}
                          onChange={(e) => setAdicMonto(e.target.value)}
                          placeholder="290"
                          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-black tabular-nums text-slate-800 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Nota (opcional)
                        </label>
                        <input
                          type="text"
                          value={adicNota}
                          onChange={(e) => setAdicNota(e.target.value)}
                          placeholder="Ej. Contabilidad ejercicio 2025"
                          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                      </div>

                      {adicConfirm && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                          <p className="text-[10px] font-black text-emerald-800">
                            {adicConfirm}
                          </p>
                          <p className="text-[9px] text-emerald-700 font-medium mt-0.5">
                            Cambia el mes y agrega el siguiente, o cierra al terminar.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAdicAbierto(false);
                            setAdicConfirm(null);
                            setAdicMonto("");
                            setAdicNota("");
                          }}
                          className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-200"
                        >
                          {adicConfirm ? "Listo" : "Cancelar"}
                        </button>
                        <button
                          type="button"
                          onClick={handleAgregarAdicional}
                          className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-violet-700"
                        >
                          Agregar cargo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DESCUENTO INLINE */}
              {!esGeneral && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest">
                      Descuento del mes
                    </p>
                    {descuentoExistente && (
                      <button
                        type="button"
                        onClick={handleEliminarDescuento}
                        className="text-[9px] font-black text-rose-600 hover:text-rose-800 uppercase tracking-widest"
                      >
                        Quitar
                      </button>
                    )}
                  </div>

                  {descuentoExistente && !descAbierto ? (
                    <div className="bg-white rounded-xl px-3 py-2 border border-rose-100">
                      <p className="text-sm font-black text-rose-700">
                        {descuentoExistente.tipo === "porcentaje"
                          ? `-${descuentoExistente.valor}% sobre ${fmt(compromisoBruto)}`
                          : `-${fmt(descuentoExistente.valor)}`}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {descuentoExistente.motivo}
                      </p>
                    </div>
                  ) : descAbierto ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDescTipo("porcentaje")}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            descTipo === "porcentaje"
                              ? "border-rose-400 bg-rose-100 text-rose-800"
                              : "border-slate-200 bg-white text-slate-500"
                          }`}
                        >
                          Porcentaje
                        </button>
                        <button
                          type="button"
                          onClick={() => setDescTipo("monto")}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            descTipo === "monto"
                              ? "border-rose-400 bg-rose-100 text-rose-800"
                              : "border-slate-200 bg-white text-slate-500"
                          }`}
                        >
                          Monto fijo
                        </button>
                      </div>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={descValor}
                        onChange={(e) => setDescValor(e.target.value)}
                        placeholder={descTipo === "porcentaje" ? "% (1-100)" : "Monto"}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm font-bold"
                      />
                      <input
                        type="text"
                        value={descMotivo}
                        onChange={(e) => setDescMotivo(e.target.value)}
                        placeholder="Motivo del descuento"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDescAbierto(false)}
                          className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleAplicarDescuento}
                          className="flex-1 py-2 rounded-lg bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-rose-700"
                        >
                          Aplicar descuento
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDescAbierto(true)}
                      className="w-full py-2 rounded-xl bg-white border border-dashed border-rose-300 text-rose-700 text-[9px] font-black uppercase tracking-widest hover:bg-rose-50"
                    >
                      + Aplicar descuento
                    </button>
                  )}
                </div>
              )}

              {/* COMPROBANTE */}
              <div
                className={`rounded-2xl border p-4 transition-colors ${
                  comprobanteActivo
                    ? "border-indigo-200 bg-indigo-50/50"
                    : "border-dashed border-slate-200 bg-slate-50/60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      comprobanteActivo ? "text-indigo-700" : "text-slate-400"
                    }`}
                  >
                    Comprobante de pago
                  </p>
                  {comprobanteActivo && (
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        comprobanteActivo.estado === "aceptado"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {comprobanteActivo.estado === "aceptado"
                        ? "Validado"
                        : "Pendiente"}
                    </span>
                  )}
                </div>

                {comprobanteActivo ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-indigo-100">
                      <div className="shrink-0 p-2 rounded-lg bg-indigo-100 text-indigo-700">
                        <FileIcon />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-800 truncate">
                          {comprobanteActivo.nombreArchivo}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Subido {formatFechaComprobante(comprobanteActivo.subidoEn)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={comprobanteActivo.dataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest text-center hover:bg-indigo-700"
                      >
                        Ver / descargar
                      </a>
                      {comprobanteActivo.estado === "pendiente" && (
                        <button
                          type="button"
                          onClick={async () => {
                            const { correo } = await validarComprobantePago(
                              comprobanteActivo.id
                            );
                            if (correo?.ok) {
                              await notify({
                                titulo: "Correo enviado",
                                mensaje: "Confirmación de pago enviada al cliente.",
                                tono: "info",
                              });
                            } else if (correo && !correo.ok) {
                              await notify({
                                titulo: "Correo no enviado",
                                mensaje: correo.error,
                                tono: "warning",
                              });
                            }
                          }}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700"
                        >
                          Validar
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-[10px] font-bold text-slate-400 mb-3 leading-relaxed">
                      El cliente aún no ha subido comprobante para este mes.
                      Puedes subirlo tú si ya lo tienes a la mano.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-400"
                    >
                      <UploadIcon />
                      Subir comprobante manualmente
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleSubirComprobanteAdmin}
                    />
                  </div>
                )}
              </div>

              {yaPagado && (
                <button
                  type="button"
                  onClick={() => onAbrirFactura(mesActivo)}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <FileIcon />
                  Subir factura PDF
                </button>
              )}
            </div>
          </aside>
        </div>
        )}

        {/* FOOTER totales */}
        <div className="px-3 sm:px-8 py-2.5 sm:py-4 bg-[#0F172A] text-white shrink-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3 text-center items-center">
            <div>
              <p className="text-[7px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest">
                Cobrado mes
              </p>
              <p className="text-[13px] sm:text-base font-black text-emerald-400 tabular-nums">
                {fmt(totalCobradoMesActual)}
              </p>
            </div>
            <div>
              <p className="text-[7px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest">
                Esperado mes
              </p>
              <p className="text-[13px] sm:text-base font-black text-sky-300 tabular-nums">
                {fmt(compromisoNeto)}
              </p>
            </div>
            <div>
              <p className="text-[7px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest">
                Extra por cobrar
              </p>
              <p className="text-[13px] sm:text-base font-black text-amber-400 tabular-nums">
                {fmt(totalExtraPorCobrar)}
              </p>
            </div>
            <div className="rounded-lg sm:rounded-xl bg-rose-500/15 ring-1 ring-rose-400/30 py-1 px-1">
              <p className="text-[7px] sm:text-[8px] font-black text-rose-300 uppercase tracking-wider sm:tracking-widest">
                Deuda total
              </p>
              <p className="text-[13px] sm:text-lg font-black text-rose-300 tabular-nums leading-tight">
                {fmt(totalPendienteCli)}
              </p>
              {totalExtraPorCobrar > 0 && (
                <p className="hidden sm:block text-[8px] font-bold text-rose-200/70 tabular-nums">
                  {fmt(totalPendienteHonorarios)} hon. + {fmt(totalExtraPorCobrar)} extra
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

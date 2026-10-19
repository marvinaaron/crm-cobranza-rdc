"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import { useClientes } from "@/context/ClientesContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import MontoInput from "@/components/MontoInput";
import { parseMontoInput, formatMontoDesdeNumero } from "@/lib/monto-input";
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
  getFechaPagoHonorarios,
  getServiciosAdicionalesAnio,
  getTotalAdicionalesAnio,
  getMontoAdicionalMes,
  getTotalCobradoMes,
  getTotalDeudaPendiente,
  getTotalPendiente,
  getExtrasEsperados,
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
import { facturaPdfDisponible } from "@/lib/facturas";
import MesPagoFila from "@/components/admin/MesPagoFila";
import CentroIngresosDiversos from "@/components/admin/CentroIngresosDiversos";
import BotonCorreoFactura from "@/components/admin/BotonCorreoFactura";
import { useNotify, useConfirm } from "@/components/ConfirmProvider";
import VisorArchivoModal from "@/components/VisorArchivo";
import PedirCapturaPortal from "@/components/admin/PedirCapturaPortal";
import AvatarCliente from "@/components/admin/AvatarCliente";
import PillDeslizable from "@/components/ui/PillDeslizable";
import Link from "next/link";

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
    getFacturaPeriodo,
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
  const [visor, setVisor] = useState<{
    dataUrl: string;
    nombreArchivo: string;
    tipoMime?: string;
  } | null>(null);

  // Extra / adicional / descuento: una sola píldora, el cuerpo no cambia de alto.
  const [ajusteTab, setAjusteTab] = useState<
    "extra" | "adicional" | "descuento"
  >("extra");

  // Form de descuento.
  const [descTipo, setDescTipo] = useState<"porcentaje" | "monto">("porcentaje");
  const [descValor, setDescValor] = useState<string>("");
  const [descMotivo, setDescMotivo] = useState<string>("");

  // Form de servicio adicional (cargo extra, independiente de honorarios).
  // Pensado para cobros puntuales y meses atrasados que se trabajan a tarifa
  // distinta (ej. $290/mes de contabilidad anterior). NO toca los honorarios
  // ni la relación de meses.
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
  const [notaExtra, setNotaExtra] = useState<{
    id: string;
    concepto: string;
    nota: string;
    top: number;
    left: number;
  } | null>(null);

  useScrollLock(true);

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
    setDescTipo("porcentaje");
    setDescValor("");
    setDescMotivo("");
  }, [mesActivo, cliente]);

  // El form de servicio adicional se sincroniza SOLO con el mes activo (no con
  // `cliente`), para que registrar un cargo —que actualiza el cliente— no cierre
  // el formulario y se puedan capturar varios meses atrasados seguidos.
  useEffect(() => {
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
  const facturaMesActivo = getFacturaPeriodo(cliente.id, mesActivo);
  const pdfFacturaMesActivo = facturaPdfDisponible(facturaMesActivo);

  const handleAplicarPago = useCallback(async () => {
    const monto = parseMontoInput(montoInput);
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
      await notify({
        titulo,
        mensaje: `${mensaje} El correo sale cuando subas la factura PDF.`,
        tono,
      });
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
    notify,
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
    const valor =
      descTipo === "monto"
        ? parseMontoInput(descValor)
        : Number(descValor.replace(/[^\d.]/g, ""));
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
    const monto = parseMontoInput(adicMonto);
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
    const monto = parseMontoInput(xeMonto);
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
      setAjusteTab("extra");
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
    const monto = parseMontoInput(abonoMonto);
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

  const handleRechazarComprobanteHonorarios = useCallback(
    async (comprobanteId: string, nombre: string) => {
      const ok = await confirm({
        titulo: "Rechazar comprobante",
        mensaje: `Vas a rechazar "${nombre}". El cliente recibirá un aviso para subir otro: el pago no aparece en la cuenta o el archivo no es válido.`,
        textoConfirmar: "Rechazar",
        tono: "danger",
      });
      if (!ok) return;
      eliminarComprobantePagoHonorarios(comprobanteId, {
        notificarCliente: true,
        revertirPagosVinculados: true,
      });
      await notify({
        titulo: "Comprobante rechazado",
        mensaje: "Avisamos al cliente para que suba uno válido.",
        tono: "info",
      });
    },
    [confirm, eliminarComprobantePagoHonorarios, notify]
  );

  const handleRechazarComprobanteExtra = useCallback(
    async (comprobanteId: string, nombre: string) => {
      const ok = await confirm({
        titulo: "Rechazar comprobante",
        mensaje: `Vas a rechazar "${nombre}". El cliente recibirá un aviso para subir otro: el pago no aparece en la cuenta o el archivo no es válido.`,
        textoConfirmar: "Rechazar",
        tono: "danger",
      });
      if (!ok) return;
      eliminarComprobantePagoHonorarios(comprobanteId, {
        notificarCliente: true,
        revertirPagosVinculados: false,
      });
      await notify({
        titulo: "Comprobante rechazado",
        mensaje: "Avisamos al cliente para que suba uno válido.",
        tono: "info",
      });
    },
    [confirm, eliminarComprobantePagoHonorarios, notify]
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
        await validarComprobantePago(nuevo.id);
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
      <div
        className="fixed inset-0 z-[60] flex justify-center items-stretch lg:items-center bg-slate-900/40 backdrop-blur-sm pt-[calc(env(safe-area-inset-top)+4.25rem)] pb-[calc(env(safe-area-inset-bottom)+5.25rem)] px-2 lg:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de cobranza · ${cliente.razonSocial}`}
        onClick={onClose}
      >
      <div
        className="relative z-[61] bg-white rounded-[1.75rem] shadow-2xl w-full max-w-[58rem] h-full lg:h-auto lg:max-h-[min(90vh,840px)] flex flex-col overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <AvatarCliente cliente={cliente} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/clientes#cliente=${cliente.id}`}
                  onClick={onClose}
                  className="min-w-0 max-w-full text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate hover:text-slate-600"
                  title="Ver ficha de contacto"
                >
                  {cliente.razonSocial}
                </Link>
                {!esGeneral && (
                  <span className="inline-flex items-center px-2.5 h-6 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold">
                    Día de pago: {cliente.fechaPago}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {cliente.rfc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs móvil */}
        {!esGeneral && (
        <div className="lg:hidden shrink-0 bg-white px-4 py-2">
          <div className="rdc-ios-pill rdc-ios-pill-claro relative flex h-10 rounded-full bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setTabMovil("meses")}
              className={`relative z-10 flex-1 rounded-full text-[13px] font-semibold transition-colors ${
                tabMovil === "meses"
                  ? "bg-white text-slate-900 shadow-sm rdc-ios-pill-thumb-claro"
                  : "text-slate-500"
              }`}
            >
              Meses
            </button>
            <button
              type="button"
              onClick={() => setTabMovil("acciones")}
              className={`relative z-10 flex-1 rounded-full text-[13px] font-semibold transition-colors ${
                tabMovil === "acciones"
                  ? "bg-white text-slate-900 shadow-sm rdc-ios-pill-thumb-claro"
                  : "text-slate-500"
              }`}
            >
              Aplicar pago
            </button>
          </div>
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
          {/* COLUMNA IZQUIERDA — historial un poco más ancho; el pago se estrecha. */}
          <section
            className={`flex-1 lg:flex-none lg:w-[25rem] lg:shrink-0 min-h-0 overflow-y-auto p-3 sm:p-4 ${
              tabMovil === "meses" ? "block" : "hidden lg:block"
            }`}
          >
            <p className="text-[11px] font-semibold text-slate-400 mb-2 pl-0.5">
              Honorarios · {periodoVisible.anio}
            </p>
            <div className="rounded-[1.25rem] bg-white overflow-hidden divide-y divide-slate-100 ring-1 ring-black/[0.04]">
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
                const fechaPagoMes = getFechaPagoHonorarios(cliente, p);
                const descMes = getDescuentoMes(cliente, p);
                const montoDescMes = descMes ? getMontoDescuento(cliente, p) : 0;
                const facturaMes = getFacturaPeriodo(cliente.id, p);
                const pdfFacturaOk = facturaPdfDisponible(facturaMes);
                const esMesActivo =
                  p.mes === mesActivo.mes && p.anio === mesActivo.anio;

                return (
                  <MesPagoFila
                    key={m}
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
                    fechaPago={fechaPagoMes}
                    descuentoLabel={
                      descMes
                        ? descMes.tipo === "porcentaje"
                          ? `-${descMes.valor}% (${descMes.motivo})`
                          : `-$${montoDescMes.toLocaleString()} (${descMes.motivo})`
                        : null
                    }
                    hayPagoEnMes={pgd || parcial}
                    facturaCargada={pdfFacturaOk}
                    facturaMonto={facturaMes?.monto ?? null}
                    seleccionado={esMesActivo}
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
                );
              })}
            </div>

            {/* Extras por cobrar: misma fila que el historial. */}
              {!esGeneral && extrasEsperados.length > 0 && (
              <div className="border-t border-slate-100">
                {extrasEsperados.map((extra) => {
                    const saldo = getSaldoExtraEsperado(cliente, extra);
                    const liquidado = saldo <= 0;
                    const abriendoAbono = abonoExtraId === extra.id;
                    const compsPend = getComprobantesExtra(
                      cliente.id,
                      extra.id
                    ).filter((c) => c.estado === "pendiente");
                    return (
                      <div key={extra.id} className="border-b border-slate-100 last:border-b-0">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            abrirEdicionExtra(extra);
                            setTabMovil("acciones");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              abrirEdicionExtra(extra);
                              setTabMovil("acciones");
                            }
                          }}
                          className="flex items-center justify-between px-3.5 py-2 cursor-pointer hover:bg-slate-50/80"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-1.5 h-1.5 shrink-0 rounded-full ${
                                liquidado ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            <p className="text-[13px] font-semibold text-slate-900 truncate">
                              Extra: {labelPeriodoExtra(extra)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {extra.nota ? (
                              <button
                                type="button"
                                title="Ver nota"
                                aria-label="Ver nota del extra"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (notaExtra?.id === extra.id) {
                                    setNotaExtra(null);
                                    return;
                                  }
                                  const r = e.currentTarget.getBoundingClientRect();
                                  const w = 260;
                                  setNotaExtra({
                                    id: extra.id,
                                    concepto: extra.concepto,
                                    nota: extra.nota ?? "",
                                    top: r.bottom + 8,
                                    left: Math.min(
                                      Math.max(8, r.right - w),
                                      window.innerWidth - w - 8
                                    ),
                                  });
                                }}
                                className={`h-7 w-7 rounded-full grid place-items-center ${
                                  notaExtra?.id === extra.id
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="16" y1="13" x2="8" y2="13" />
                                  <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                              </button>
                            ) : null}
                            {!liquidado && (
                              <button
                                type="button"
                                title="Registrar abono"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAbonoExtraId(
                                    abriendoAbono ? null : extra.id
                                  );
                                  setAbonoMonto(saldo > 0 ? String(saldo) : "");
                                }}
                                className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 px-1.5 h-7"
                              >
                                Abono
                              </button>
                            )}
                            <p
                              className={`text-[13px] font-bold tabular-nums ${
                                liquidado ? "text-emerald-600" : "text-amber-600"
                              }`}
                            >
                              {liquidado ? "Liquidado" : fmt(saldo)}
                            </p>
                          </div>
                        </div>
                        {abriendoAbono && (
                          <div className="flex items-center gap-1.5 px-3.5 pb-2 pl-8">
                            <MontoInput
                              value={abonoMonto}
                              onChange={setAbonoMonto}
                              placeholder="Abono"
                              className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 outline-none text-[13px] font-bold tabular-nums"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setAbonoExtraId(null);
                                setAbonoMonto("");
                              }}
                              className="h-8 px-3 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleRegistrarAbonoExtra}
                              className="h-8 px-3 rounded-full bg-slate-900 text-white text-[12px] font-semibold"
                            >
                              Registrar
                            </button>
                          </div>
                        )}
                        {compsPend.map((cmp) => (
                          <div
                            key={cmp.id}
                            className="flex items-center gap-1.5 px-3.5 pb-2 pl-8"
                          >
                            <p className="min-w-0 flex-1 truncate text-[12px] text-indigo-700">
                              {cmp.nombreArchivo}
                              {cmp.montoDeclarado
                                ? ` · ${fmt(cmp.montoDeclarado)}`
                                : ""}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setVisor({
                                  dataUrl: cmp.dataUrl,
                                  nombreArchivo: cmp.nombreArchivo,
                                  tipoMime: cmp.tipoMime,
                                })
                              }
                              className="h-7 px-2.5 rounded-full text-[11px] font-semibold bg-white text-indigo-700 ring-1 ring-indigo-200"
                            >
                              Ver
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleValidarComprobanteExtra(cmp.id)
                              }
                              className="h-7 px-2.5 rounded-full text-[11px] font-semibold bg-emerald-600 text-white"
                            >
                              Validar
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleRechazarComprobanteExtra(
                                  cmp.id,
                                  cmp.nombreArchivo
                                )
                              }
                              className="h-7 px-2.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700"
                            >
                              Rechazar
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
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
            className={`flex-1 min-w-0 lg:border-l border-slate-100 min-h-0 overflow-y-auto bg-white ${
              tabMovil === "acciones" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="p-3 sm:p-4 space-y-2.5">
              {/* FORMULARIO APLICAR PAGO — una ficha, sin card de mes aparte. */}
              {!esGeneral && (
                <div className="rounded-[1.25rem] bg-white ring-1 ring-black/[0.04] p-3 space-y-2">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-400">
                        {yaPagado ? "Pago aplicado" : "Aplicar pago"}
                      </p>
                      <p className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">
                        {periodoLabel(mesActivo)}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-3 shrink-0 text-right">
                      <p className="text-[11px] text-slate-400">
                        Compromiso{" "}
                        <span className="font-semibold tabular-nums text-slate-900">
                          {fmt(compromisoNeto)}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Pagado{" "}
                        <span className="font-semibold tabular-nums text-emerald-600">
                          {fmt(pagado)}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Saldo{" "}
                        <span
                          className={`font-semibold tabular-nums ${
                            saldoMes > 0 ? "text-amber-600" : "text-emerald-600"
                          }`}
                        >
                          {fmt(saldoMes)}
                        </span>
                      </p>
                    </div>
                  </div>
                  {pagado > 0 && saldoMes > 0 && (
                    <p className="text-[11px] text-amber-700">
                      Ya hay {fmt(pagado)}. Captura solo lo que acaba de entrar.
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-baseline justify-between mb-0.5">
                        <label className="text-[11px] font-semibold text-slate-400">
                          Monto
                        </label>
                        {saldoMes > 0 && (
                          <button
                            type="button"
                            onClick={() => setMontoInput(formatMontoDesdeNumero(saldoMes))}
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
                            title={`Auto-llenar con el saldo (${fmt(saldoMes)})`}
                          >
                            = {fmt(saldoMes)}
                          </button>
                        )}
                      </div>
                      <MontoInput
                        value={montoInput}
                        onChange={setMontoInput}
                        placeholder="0"
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm font-bold tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">
                        Fecha caja
                      </label>
                      <input
                        type="date"
                        value={fechaPagoInput}
                        onChange={(e) => setFechaPagoInput(e.target.value)}
                        max={fechaHoyIso()}
                        title="En qué mes entra el dinero a caja"
                        className="mt-0.5 w-full h-9 px-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {METODOS_PAGO.map((m) => {
                      const activo = metodoPagoInput === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMetodoPagoInput(m.id)}
                          className={`h-8 w-8 rounded-full text-[15px] leading-none grid place-items-center transition-colors ${
                            activo
                              ? "bg-emerald-50 ring-1 ring-emerald-300"
                              : "bg-slate-50 hover:bg-slate-100"
                          }`}
                          title={m.label}
                          aria-pressed={activo}
                          aria-label={m.label}
                        >
                          <span aria-hidden="true">{m.icono}</span>
                        </button>
                      );
                    })}
                    <input
                      type="text"
                      value={notaInput}
                      onChange={(e) => setNotaInput(e.target.value)}
                      placeholder="Nota (opcional)"
                      className="ml-1 flex-1 min-w-0 h-8 px-3 rounded-full bg-slate-50 outline-none text-[12px] placeholder:text-slate-400"
                    />
                  </div>

                  {(() => {
                    const m = parseMontoInput(montoInput);
                    if (!m || m <= 0) return null;
                    const restante = saldoMes - m;
                    if (Math.abs(restante) < 0.005) {
                      return (
                        <p className="text-[12px] font-semibold text-emerald-700">
                          Queda pagado completo
                        </p>
                      );
                    }
                    if (restante > 0) {
                      return (
                        <p className="text-[12px] font-semibold text-amber-700">
                          Quedará parcial · resto {fmt(restante)}
                        </p>
                      );
                    }
                    return (
                      <p className="text-[12px] font-semibold text-indigo-700">
                        Sobrepago · {fmt(-restante)}
                      </p>
                    );
                  })()}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAplicarPago}
                      disabled={aplicando}
                      className="flex-1 h-9 rounded-full bg-emerald-600 text-white text-[13px] font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aplicando ? "Aplicando…" : "Registrar pago"}
                    </button>
                    {(pagado > 0 || tienePagoParcial(cliente, mesActivo)) && (
                      <button
                        type="button"
                        onClick={handleEliminarPagoMes}
                        className="h-9 px-3 rounded-full bg-rose-50 text-rose-700 text-[12px] font-semibold hover:bg-rose-100"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!esGeneral && (
                <div className="rounded-[1.25rem] bg-white ring-1 ring-black/[0.04] p-2.5 space-y-2">
                  <PillDeslizable
                    acento="claro"
                    size="sm"
                    value={ajusteTab}
                    onChange={(v) => {
                      setAjusteTab(v);
                      setAdicConfirm(null);
                    }}
                    opciones={[
                      { value: "extra", label: "Extra" },
                      { value: "adicional", label: "Adicional" },
                      { value: "descuento", label: "Descuento" },
                    ]}
                    className="w-full"
                  />

                  <div className="grid">
                    <div
                      className={`col-start-1 row-start-1 space-y-1.5 ${
                        ajusteTab === "extra"
                          ? ""
                          : "invisible pointer-events-none"
                      }`}
                      aria-hidden={ajusteTab !== "extra"}
                      inert={ajusteTab !== "extra" ? true : undefined}
                    >
                      {xeEditId ? (
                        <p className="text-[11px] font-semibold text-amber-700">
                          Editando extra
                        </p>
                      ) : null}
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400">
                          Concepto
                        </label>
                        <select
                          value={xeConcepto}
                          onChange={(e) => setXeConcepto(e.target.value)}
                          tabIndex={ajusteTab === "extra" ? 0 : -1}
                          className="mt-0.5 w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white outline-none text-[13px] font-semibold text-slate-800"
                        >
                          {CONCEPTOS_SERVICIO_ADICIONAL.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      {xeConcepto === "Otro" ? (
                        <input
                          type="text"
                          value={xeConceptoLibre}
                          onChange={(e) => setXeConceptoLibre(e.target.value)}
                          placeholder="Descríbelo"
                          tabIndex={ajusteTab === "extra" ? 0 : -1}
                          className="w-full h-8 px-2.5 rounded-lg border border-slate-200 outline-none text-[13px] font-semibold text-slate-800"
                        />
                      ) : null}
                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400">
                            Importe
                          </label>
                          <MontoInput
                            value={xeMonto}
                            onChange={setXeMonto}
                            placeholder="3,480"
                            className="mt-0.5 w-full h-8 px-2 rounded-lg border border-slate-200 outline-none text-[13px] font-bold tabular-nums text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400">
                            Mes
                          </label>
                          <select
                            value={xeMes}
                            onChange={(e) => setXeMes(Number(e.target.value))}
                            tabIndex={ajusteTab === "extra" ? 0 : -1}
                            className="mt-0.5 w-full h-8 px-1.5 rounded-lg border border-slate-200 bg-white outline-none text-[13px] font-semibold text-slate-800"
                          >
                            {MESES_NOM.map((m, i) => (
                              <option key={m} value={i}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400">
                            Año
                          </label>
                          <select
                            value={xeAnio}
                            onChange={(e) => setXeAnio(Number(e.target.value))}
                            tabIndex={ajusteTab === "extra" ? 0 : -1}
                            className="mt-0.5 w-full h-8 px-1.5 rounded-lg border border-slate-200 bg-white outline-none text-[13px] font-semibold text-slate-800"
                          >
                            {aniosDisponibles.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={xeNota}
                        onChange={(e) => setXeNota(e.target.value)}
                        placeholder="Nota (opcional)"
                        tabIndex={ajusteTab === "extra" ? 0 : -1}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 outline-none text-[13px]"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          tabIndex={ajusteTab === "extra" ? 0 : -1}
                          onClick={() => {
                            setXeEditId(null);
                            setXeMonto("");
                            setXeNota("");
                            setXeConceptoLibre("");
                            setXeConcepto(CONCEPTOS_SERVICIO_ADICIONAL[0]);
                            setXeMes(periodoVisible.mes);
                            setXeAnio(periodoVisible.anio);
                          }}
                          className="flex-1 h-8 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold hover:bg-slate-200"
                        >
                          Limpiar
                        </button>
                        <button
                          type="button"
                          tabIndex={ajusteTab === "extra" ? 0 : -1}
                          onClick={handleAgregarExtraEsperado}
                          className="flex-1 h-8 rounded-full bg-slate-900 text-white text-[12px] font-semibold hover:bg-slate-800"
                        >
                          {xeEditId ? "Guardar" : "Guardar extra"}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`col-start-1 row-start-1 space-y-1.5 ${
                        ajusteTab === "adicional"
                          ? ""
                          : "invisible pointer-events-none"
                      }`}
                      aria-hidden={ajusteTab !== "adicional"}
                      inert={ajusteTab !== "adicional" ? true : undefined}
                    >
                      {adicConfirm ? (
                        <p className="text-[11px] font-semibold text-emerald-700 truncate">
                          {adicConfirm}
                        </p>
                      ) : null}
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400">
                          Concepto
                        </label>
                        <select
                          value={adicConcepto}
                          onChange={(e) => setAdicConcepto(e.target.value)}
                          tabIndex={ajusteTab === "adicional" ? 0 : -1}
                          className="mt-0.5 w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white outline-none text-[13px] font-semibold text-slate-800"
                        >
                          {CONCEPTOS_SERVICIO_ADICIONAL.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      {adicConcepto === "Otro" ? (
                        <input
                          type="text"
                          value={adicConceptoLibre}
                          onChange={(e) => setAdicConceptoLibre(e.target.value)}
                          placeholder="Descríbelo"
                          tabIndex={ajusteTab === "adicional" ? 0 : -1}
                          className="w-full h-8 px-2.5 rounded-lg border border-slate-200 outline-none text-[13px] font-semibold text-slate-800"
                        />
                      ) : null}
                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400">
                            Importe
                          </label>
                          <MontoInput
                            value={adicMonto}
                            onChange={setAdicMonto}
                            placeholder="290"
                            className="mt-0.5 w-full h-8 px-2 rounded-lg border border-slate-200 outline-none text-[13px] font-bold tabular-nums text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400">
                            Mes
                          </label>
                          <select
                            value={adicMes}
                            onChange={(e) => setAdicMes(Number(e.target.value))}
                            tabIndex={ajusteTab === "adicional" ? 0 : -1}
                            className="mt-0.5 w-full h-8 px-1.5 rounded-lg border border-slate-200 bg-white outline-none text-[13px] font-semibold text-slate-800"
                          >
                            {MESES_NOM.map((m, i) => (
                              <option key={m} value={i}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400">
                            Año
                          </label>
                          <select
                            value={adicAnio}
                            onChange={(e) => setAdicAnio(Number(e.target.value))}
                            tabIndex={ajusteTab === "adicional" ? 0 : -1}
                            className="mt-0.5 w-full h-8 px-1.5 rounded-lg border border-slate-200 bg-white outline-none text-[13px] font-semibold text-slate-800"
                          >
                            {aniosDisponibles.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={adicNota}
                        onChange={(e) => setAdicNota(e.target.value)}
                        placeholder="Nota (opcional)"
                        tabIndex={ajusteTab === "adicional" ? 0 : -1}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 outline-none text-[13px]"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          tabIndex={ajusteTab === "adicional" ? 0 : -1}
                          onClick={() => {
                            setAdicConfirm(null);
                            setAdicMonto("");
                            setAdicNota("");
                            setAdicConceptoLibre("");
                            setAdicConcepto(CONCEPTOS_SERVICIO_ADICIONAL[0]);
                            setAdicMes(mesActivo.mes);
                            setAdicAnio(mesActivo.anio);
                          }}
                          className="flex-1 h-8 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold hover:bg-slate-200"
                        >
                          Limpiar
                        </button>
                        <button
                          type="button"
                          tabIndex={ajusteTab === "adicional" ? 0 : -1}
                          onClick={handleAgregarAdicional}
                          className="flex-1 h-8 rounded-full bg-slate-900 text-white text-[12px] font-semibold hover:bg-slate-800"
                        >
                          Agregar cargo
                        </button>
                      </div>
                    </div>

                    <div
                      className={`col-start-1 row-start-1 space-y-1.5 ${
                        ajusteTab === "descuento"
                          ? ""
                          : "invisible pointer-events-none"
                      }`}
                      aria-hidden={ajusteTab !== "descuento"}
                      inert={ajusteTab !== "descuento" ? true : undefined}
                    >
                      {descuentoExistente ? (
                        <p className="text-[11px] font-semibold text-rose-600 truncate">
                          {descuentoExistente.tipo === "porcentaje"
                            ? `Activo: −${descuentoExistente.valor}% · ${descuentoExistente.motivo}`
                            : `Activo: −${fmt(descuentoExistente.valor)} · ${descuentoExistente.motivo}`}
                        </p>
                      ) : (
                        <p className="text-[11px] font-medium text-slate-400">
                          Aplica a {periodoLabel(mesActivo)}
                        </p>
                      )}
                      <PillDeslizable
                        acento="claro"
                        size="sm"
                        value={descTipo}
                        onChange={setDescTipo}
                        opciones={[
                          { value: "porcentaje", label: "Porcentaje" },
                          { value: "monto", label: "Monto fijo" },
                        ]}
                        className="w-full"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400">
                            {descTipo === "monto" ? "Monto" : "%"}
                          </label>
                          {descTipo === "monto" ? (
                            <MontoInput
                              value={descValor}
                              onChange={setDescValor}
                              placeholder="Monto"
                              className="mt-0.5 w-full h-8 px-2.5 rounded-lg border border-slate-200 outline-none text-[13px] font-bold tabular-nums text-slate-800"
                            />
                          ) : (
                            <input
                              type="text"
                              inputMode="decimal"
                              value={descValor}
                              onChange={(e) =>
                                setDescValor(
                                  e.target.value.replace(/[^\d.]/g, "")
                                )
                              }
                              placeholder="1–100"
                              tabIndex={ajusteTab === "descuento" ? 0 : -1}
                              className="mt-0.5 w-full h-8 px-2.5 rounded-lg border border-slate-200 outline-none text-[13px] font-bold tabular-nums text-slate-800"
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400">
                            Motivo
                          </label>
                          <input
                            type="text"
                            value={descMotivo}
                            onChange={(e) => setDescMotivo(e.target.value)}
                            placeholder="Motivo"
                            tabIndex={ajusteTab === "descuento" ? 0 : -1}
                            className="mt-0.5 w-full h-8 px-2.5 rounded-lg border border-slate-200 outline-none text-[13px]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {descuentoExistente ? (
                          <button
                            type="button"
                            tabIndex={ajusteTab === "descuento" ? 0 : -1}
                            onClick={handleEliminarDescuento}
                            className="flex-1 h-8 rounded-full bg-rose-50 text-rose-700 text-[12px] font-semibold hover:bg-rose-100"
                          >
                            Quitar
                          </button>
                        ) : (
                          <button
                            type="button"
                            tabIndex={ajusteTab === "descuento" ? 0 : -1}
                            onClick={() => {
                              setDescValor("");
                              setDescMotivo("");
                              setDescTipo("porcentaje");
                            }}
                            className="flex-1 h-8 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold hover:bg-slate-200"
                          >
                            Limpiar
                          </button>
                        )}
                        <button
                          type="button"
                          tabIndex={ajusteTab === "descuento" ? 0 : -1}
                          onClick={handleAplicarDescuento}
                          className="flex-1 h-8 rounded-full bg-slate-900 text-white text-[12px] font-semibold hover:bg-slate-800"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`rounded-[1.15rem] px-3 py-2 ${
                  comprobanteActivo ? "bg-indigo-50/60" : "bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-800 shrink-0">
                    Comprobante
                  </p>
                  {comprobanteActivo ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setVisor({
                            dataUrl: comprobanteActivo.dataUrl,
                            nombreArchivo: comprobanteActivo.nombreArchivo,
                            tipoMime: comprobanteActivo.tipoMime,
                          })
                        }
                        className="min-w-0 flex-1 text-left text-[12px] font-medium text-indigo-700 truncate"
                        title={comprobanteActivo.nombreArchivo}
                      >
                        {comprobanteActivo.nombreArchivo}
                      </button>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          comprobanteActivo.estado === "aceptado"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {comprobanteActivo.estado === "aceptado"
                          ? "Validado"
                          : "Pendiente"}
                      </span>
                      {comprobanteActivo.estado === "pendiente" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              void handleRechazarComprobanteHonorarios(
                                comprobanteActivo.id,
                                comprobanteActivo.nombreArchivo
                              )
                            }
                            className="h-7 px-2.5 rounded-full text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            Rechazar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void validarComprobantePago(comprobanteActivo.id);
                            }}
                            className="h-7 px-2.5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700"
                          >
                            Validar
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                    <PedirCapturaPortal cliente={cliente} tipo="honorarios" variante="compacto" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white text-[12px] font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <UploadIcon />
                      Subir
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
              </div>

              {yaPagado && (
                <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onAbrirFactura(mesActivo)}
                  className={`w-full h-9 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 ${
                    pdfFacturaMesActivo
                      ? "bg-violet-600 text-white hover:bg-violet-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <FileIcon />
                  {pdfFacturaMesActivo
                    ? "Ver / reemplazar factura PDF"
                    : "Subir factura PDF"}
                </button>
                <BotonCorreoFactura
                  cliente={cliente}
                  periodo={mesActivo}
                  factura={facturaMesActivo}
                  variante="ancho"
                />
                </div>
              )}
            </div>
          </aside>
        </div>
        )}

        {/* FOOTER totales */}
        <div className="px-3 sm:px-5 py-2.5 bg-[#1c1c1e] text-white shrink-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3 text-center items-center">
            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Cobrado mes
              </p>
              <p className="mt-1 text-[15px] sm:text-[17px] font-bold text-emerald-400 tabular-nums leading-none tracking-tight">
                {fmt(totalCobradoMesActual)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Esperado mes
              </p>
              <p className="mt-1 text-[15px] sm:text-[17px] font-bold text-white tabular-nums leading-none tracking-tight">
                {fmt(compromisoNeto)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Extra por cobrar
              </p>
              <p className="mt-1 text-[15px] sm:text-[17px] font-bold text-amber-400 tabular-nums leading-none tracking-tight">
                {fmt(totalExtraPorCobrar)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-rose-300">
                Deuda total
              </p>
              <p className="mt-1 text-[15px] sm:text-[17px] font-bold text-rose-300 tabular-nums leading-none tracking-tight">
                {fmt(totalPendienteCli)}
              </p>
              {totalExtraPorCobrar > 0 && (
                <p className="hidden sm:block text-[11px] font-medium text-rose-200/70 tabular-nums mt-1">
                  {fmt(totalPendienteHonorarios)} hon. + {fmt(totalExtraPorCobrar)} extra
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
      {notaExtra &&
        createPortal(
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-[120] cursor-default"
              onClick={() => setNotaExtra(null)}
            />
            <div
              role="dialog"
              aria-label={notaExtra.concepto}
              className="fixed z-[125] w-[260px] rounded-2xl bg-white shadow-xl ring-1 ring-black/[0.06] p-3"
              style={{ top: notaExtra.top, left: notaExtra.left }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 text-[13px] font-semibold text-slate-900 leading-snug">
                  {notaExtra.concepto}
                </p>
                <button
                  type="button"
                  onClick={() => setNotaExtra(null)}
                  aria-label="Cerrar nota"
                  className="shrink-0 h-7 w-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 grid place-items-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <p className="mt-1.5 text-[12px] text-slate-600 leading-snug">
                {notaExtra.nota}
              </p>
            </div>
          </>,
          document.body
        )}
      {visor && (
        <VisorArchivoModal
          dataUrl={visor.dataUrl}
          nombreArchivo={visor.nombreArchivo}
          tipoMime={visor.tipoMime}
          titulo="Comprobante de pago"
          onClose={() => setVisor(null)}
        />
      )}
    </>
  );
}

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
  getTotalEsperadoMes,
  getTotalCobradoMes,
  getTotalPendiente,
  esIngresoGeneralCliente,
  clienteActivoEnPeriodo,
  periodoKey,
  periodoLabel,
  METODOS_PAGO,
  type MetodoPago,
} from "@/lib/clientes";
import {
  formatFechaComprobante,
  MAX_COMPROBANTE_BYTES,
} from "@/lib/comprobantes";
import { readFileAsDataUrl } from "@/lib/archivos";
import MesPagoFila from "@/components/admin/MesPagoFila";
import { useNotify, useConfirm } from "@/components/ConfirmProvider";

type Props = {
  cliente: Cliente;
  periodoVisible: Periodo;
  onClose: () => void;
  onAbrirFactura: (periodo: Periodo) => void;
  onAbrirIngresoExtra: () => void;
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
}: Props) {
  const {
    listaClientes,
    registrarPago,
    quitarPago,
    aplicarDescuento,
    eliminarDescuento,
    getComprobantePeriodo,
    subirComprobante,
    validarComprobantePago,
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
  const [tabMovil, setTabMovil] = useState<"meses" | "acciones">("meses");

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
  }, [mesActivo, cliente]);

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
      const restante = saldoMes - monto;
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
      await notify({ titulo, mensaje, tono });
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
    mesActivo,
    notify,
    saldoMes,
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
        validarComprobantePago(nuevo.id);
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
  const totalEsperadoMesActual = getTotalEsperadoMes(cliente, mesActivo);
  const totalCobradoMesActual = getTotalCobradoMes(cliente, mesActivo);
  const totalAdicMes = getMontoAdicionalMes(cliente, mesActivo);
  const totalAdicAnio = getTotalAdicionalesAnio(cliente, periodoVisible.anio);
  const totalPendienteCli = getTotalPendiente(cliente, periodoVisible);

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-900/55 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de cobranza · ${cliente.razonSocial}`}
    >
      <div
        className="bg-white rounded-2xl lg:rounded-3xl shadow-[0_30px_100px_rgba(15,23,42,0.45)] border border-white/40 w-full max-w-[1400px] h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2rem)] lg:h-[calc(100vh-3rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
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

        {/* SPLIT VIEW */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          {/* COLUMNA IZQUIERDA — Lista de meses (50% en desktop) */}
          <section
            className={`flex-1 lg:flex-1 lg:basis-1/2 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-slate-50/40 ${
              tabMovil === "meses" ? "block" : "hidden lg:block"
            }`}
          >
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">
              Toca un mes para aplicar pago · {periodoVisible.anio}
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
                          <p className="text-base font-black text-violet-700 shrink-0 tabular-nums">
                            {fmt(p.monto)}
                          </p>
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
                {totalAdicMes > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-100 flex justify-between items-baseline">
                    <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">
                      Total esperado del mes
                    </p>
                    <p className="text-base font-black text-emerald-700 tabular-nums">
                      {fmt(totalEsperadoMesActual)}
                    </p>
                  </div>
                )}
              </div>

              {/* FORMULARIO APLICAR PAGO INLINE */}
              {!esGeneral && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                    {yaPagado ? "Pago aplicado" : "Aplicar pago"}
                  </p>

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
                      Fecha real del pago
                    </label>
                    <input
                      type="date"
                      value={fechaPagoInput}
                      onChange={(e) => setFechaPagoInput(e.target.value)}
                      max={fechaHoyIso()}
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm font-bold"
                    />
                    <p className="text-[9px] text-slate-400 mt-1 font-medium">
                      Fecha en que se recibió el dinero (no la del mes
                      facturado). Útil para analítica.
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
                    className="w-full py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-100"
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
                          onClick={() =>
                            validarComprobantePago(comprobanteActivo.id)
                          }
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

        {/* FOOTER totales */}
        <div className="px-5 sm:px-8 py-3 sm:py-4 bg-[#0F172A] text-white shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                Cobrado mes
              </p>
              <p className="text-base font-black text-emerald-400 tabular-nums">
                {fmt(totalCobradoMesActual)}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                Esperado mes
              </p>
              <p className="text-base font-black text-sky-300 tabular-nums">
                {fmt(totalEsperadoMesActual)}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                Adicionales {periodoVisible.anio}
              </p>
              <p className="text-base font-black text-violet-400 tabular-nums">
                {fmt(totalAdicAnio)}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                Pendiente total
              </p>
              <p className="text-base font-black text-amber-400 tabular-nums">
                {fmt(totalPendienteCli)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

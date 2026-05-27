"use client";

import { useState, useEffect, useMemo } from "react";
import {
  type Cliente,
  type Periodo,
  listarMesesCobrables,
  periodoLabel,
  esMismoPeriodo,
  getMontoPagado,
  periodoKey,
  CONCEPTOS_SERVICIO_ADICIONAL,
  MESES_NOM,
  getCompromisoBrutoMes,
  getDescuentoMes,
  getMontoDescuento,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import ToastExito from "@/components/ToastExito";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
);
const TrashSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

function formatCurrencyInput(value: string) {
  const numericValue = value.toString().replace(/\D/g, "");
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

type Modo = "honorarios" | "adicional";

type Props = {
  cliente: Cliente;
  periodoInicial?: Periodo;
  onClose: () => void;
  onAplicado: (cliente: Cliente) => void;
};

export default function ModalRegistrarPago({
  cliente,
  periodoInicial,
  onClose,
  onAplicado,
}: Props) {
  const {
    periodo,
    periodoHoy,
    aniosDisponibles,
    registrarPago,
    quitarPago,
    registrarServicioAdicional,
    aplicarDescuento,
    eliminarDescuento,
    listaClientes,
  } = useClientes();

  const clienteActual = listaClientes.find((c) => c.id === cliente.id) ?? cliente;
  const limite = periodoKey(periodo) > periodoKey(periodoHoy) ? periodoHoy : periodo;
  const mesesCobrables = useMemo(
    () => listarMesesCobrables(clienteActual, limite),
    [clienteActual, limite]
  );

  const [modo, setModo] = useState<Modo>("honorarios");

  // Estado modo "honorarios"
  const [mesSeleccionado, setMesSeleccionado] = useState<Periodo | null>(null);
  const [montoInput, setMontoInput] = useState("");

  // Estado modo "adicional"
  const [mesAdic, setMesAdic] = useState<number>(periodoInicial?.mes ?? periodo.mes);
  const [anioAdic, setAnioAdic] = useState<number>(periodoInicial?.anio ?? periodo.anio);
  const [conceptoAdic, setConceptoAdic] = useState<string>("Declaración anual");
  const [conceptoLibre, setConceptoLibre] = useState("");
  const [montoAdicInput, setMontoAdicInput] = useState("");
  const [notaAdic, setNotaAdic] = useState("");

  // Estado descuento (mini-form embebido en modo "honorarios")
  const [mostrarDescuento, setMostrarDescuento] = useState(false);
  const [tipoDescuento, setTipoDescuento] = useState<"monto" | "porcentaje">("monto");
  const [valorDescuentoInput, setValorDescuentoInput] = useState("");
  const [motivoDescuento, setMotivoDescuento] = useState("");

  const [exito, setExito] = useState(false);
  const [exitoMensaje, setExitoMensaje] = useState("Pago aplicado");

  const periodoInicialKey = periodoInicial
    ? `${periodoInicial.anio}-${periodoInicial.mes}`
    : "";

  useEffect(() => {
    if (mesesCobrables.length === 0) return;

    const elegirInicial = (): Periodo | null => {
      if (periodoInicial) return periodoInicial;
      const primerPendiente = mesesCobrables.find((m) => !m.pagadoCompleto);
      return (
        primerPendiente?.periodo ??
        mesesCobrables[mesesCobrables.length - 1]?.periodo ??
        null
      );
    };

    setMesSeleccionado((prev) => {
      if (
        prev &&
        mesesCobrables.some((m) => esMismoPeriodo(m.periodo, prev))
      ) {
        return prev;
      }
      return elegirInicial();
    });
  }, [cliente.id, periodoInicialKey, mesesCobrables]);

  useEffect(() => {
    if (!mesSeleccionado) return;
    const info = mesesCobrables.find((m) => esMismoPeriodo(m.periodo, mesSeleccionado));
    if (!info) return;
    const sugerido = info.saldo > 0 ? info.saldo : info.compromiso;
    setMontoInput(sugerido.toLocaleString());
  }, [mesSeleccionado, mesesCobrables]);

  const infoMes = mesSeleccionado
    ? mesesCobrables.find((m) => esMismoPeriodo(m.periodo, mesSeleccionado))
    : null;

  const montoNumerico = Number(montoInput.replace(/,/g, "")) || 0;
  const yaTienePago =
    mesSeleccionado !== null && getMontoPagado(clienteActual, mesSeleccionado) > 0;

  // Descuento existente del mes seleccionado
  const descuentoActual = mesSeleccionado
    ? getDescuentoMes(clienteActual, mesSeleccionado)
    : undefined;
  const brutoMes = mesSeleccionado
    ? getCompromisoBrutoMes(clienteActual, mesSeleccionado)
    : 0;
  const descontadoEnMes = mesSeleccionado
    ? getMontoDescuento(clienteActual, mesSeleccionado)
    : 0;

  const conceptoFinal =
    conceptoAdic === "Otro" ? conceptoLibre.trim() : conceptoAdic;
  const montoAdicNumerico = Number(montoAdicInput.replace(/,/g, "")) || 0;
  const valorDescuento = Number(valorDescuentoInput.replace(/,/g, "")) || 0;

  const cerrarConExito = (mensaje: string) => {
    setExitoMensaje(mensaje);
    setExito(true);
    setTimeout(() => {
      setExito(false);
      onClose();
    }, 1600);
  };

  const handleAplicar = (e: React.FormEvent) => {
    e.preventDefault();
    if (modo === "honorarios") {
      if (!mesSeleccionado || montoNumerico <= 0) return;
      const actualizado = registrarPago(clienteActual.id, mesSeleccionado, montoNumerico);
      if (actualizado) {
        onAplicado(actualizado);
        cerrarConExito("Pago aplicado");
      }
    } else {
      if (montoAdicNumerico <= 0 || !conceptoFinal) return;
      const actualizado = registrarServicioAdicional(
        clienteActual.id,
        { mes: mesAdic, anio: anioAdic },
        montoAdicNumerico,
        conceptoFinal,
        notaAdic.trim() || undefined
      );
      if (actualizado) {
        onAplicado(actualizado);
        cerrarConExito("Servicio adicional registrado");
      }
    }
  };

  const handleQuitar = () => {
    if (!mesSeleccionado) return;
    const actualizado = quitarPago(clienteActual.id, mesSeleccionado);
    if (actualizado) {
      onAplicado(actualizado);
      cerrarConExito("Pago quitado");
    }
  };

  const handleAplicarDescuento = () => {
    if (!mesSeleccionado || valorDescuento <= 0 || !motivoDescuento.trim()) return;
    const actualizado = aplicarDescuento(clienteActual.id, mesSeleccionado, {
      tipo: tipoDescuento,
      valor: valorDescuento,
      motivo: motivoDescuento.trim(),
    });
    if (actualizado) {
      onAplicado(actualizado);
      setMostrarDescuento(false);
      setValorDescuentoInput("");
      setMotivoDescuento("");
      cerrarConExito("Descuento aplicado");
    }
  };

  const handleQuitarDescuento = () => {
    if (!descuentoActual) return;
    const actualizado = eliminarDescuento(clienteActual.id, descuentoActual.id);
    if (actualizado) {
      onAplicado(actualizado);
      cerrarConExito("Descuento eliminado");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <ToastExito visible={exito} mensaje={exitoMensaje} />
      <form
        onSubmit={handleAplicar}
        className="relative bg-white w-full max-w-[440px] max-h-[92vh] flex flex-col rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.18)] border border-slate-100 overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto p-8 pb-4 scrollbar-hide min-h-0">
        <div className="flex justify-between items-start mb-5">
          <div className="min-w-0 pr-2">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.25em] mb-1">
              {modo === "honorarios" ? "Aplicar pago" : "Servicio adicional"}
            </p>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-tight truncate">
              {clienteActual.razonSocial}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-300 hover:text-red-500">
            <CloseIcon />
          </button>
        </div>

        {/* Toggle de modo */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setModo("honorarios")}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              modo === "honorarios"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-400"
            }`}
          >
            Honorarios
          </button>
          <button
            type="button"
            onClick={() => setModo("adicional")}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              modo === "adicional"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-400"
            }`}
          >
            Servicio adicional
          </button>
        </div>

        {modo === "honorarios" && (
          <>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              1. Elige el mes al que corresponde este pago
            </p>

            <div className="space-y-2 max-h-[200px] overflow-y-auto mb-5 pr-1 scrollbar-hide">
              {mesesCobrables.length === 0 ? (
                <p className="text-sm text-slate-400 font-bold text-center py-6">
                  No hay meses cobrables en este periodo
                </p>
              ) : (
                mesesCobrables.map((m) => {
                  const seleccionado = mesSeleccionado && esMismoPeriodo(m.periodo, mesSeleccionado);
                  const tieneDesc = !!getDescuentoMes(clienteActual, m.periodo);
                  return (
                    <button
                      key={periodoLabel(m.periodo)}
                      type="button"
                      onClick={() => setMesSeleccionado(m.periodo)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        seleccionado
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
                          : "border-slate-100 bg-slate-50/50 hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black text-slate-700 uppercase text-sm tracking-tight">
                          {m.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {tieneDesc && (
                            <span className="text-[8px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full uppercase">
                              Desc.
                            </span>
                          )}
                          {m.pagadoCompleto ? (
                            <span className="text-[8px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">
                              Pagado
                            </span>
                          ) : m.parcial ? (
                            <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">
                              Pagado parcialmente
                            </span>
                          ) : (
                            <span className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase">
                              Pendiente de pago
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] font-bold text-slate-400">
                        <span>Compromiso: ${m.compromiso.toLocaleString()}</span>
                        {m.pagado > 0 && (
                          <span className="text-emerald-600">Pagado: ${m.pagado.toLocaleString()}</span>
                        )}
                        {m.saldo > 0 && (
                          <span className="text-red-500">Saldo: ${m.saldo.toLocaleString()}</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Descuento aplicado al mes */}
            {infoMes && (descuentoActual || mostrarDescuento) && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3">
                {descuentoActual ? (
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-widest text-rose-700">
                        Descuento aplicado a {infoMes.label}
                      </p>
                      <p className="text-sm font-black text-rose-800 mt-0.5">
                        {descuentoActual.tipo === "porcentaje"
                          ? `-${descuentoActual.valor}%`
                          : `-$${descuentoActual.valor.toLocaleString()}`}{" "}
                        <span className="text-[10px] font-bold text-rose-500">
                          (-${descontadoEnMes.toLocaleString()})
                        </span>
                      </p>
                      <p className="text-[10px] font-bold text-rose-700/80 mt-1 truncate">
                        {descuentoActual.motivo}
                      </p>
                      <p className="text-[9px] font-bold text-rose-500 mt-1">
                        ${brutoMes.toLocaleString()} → ${infoMes.compromiso.toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuitarDescuento}
                      className="shrink-0 h-7 w-7 rounded-full bg-white text-rose-500 hover:bg-rose-100 hover:text-rose-700 flex items-center justify-center transition-all"
                      title="Quitar descuento"
                    >
                      <TrashSmall />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-700">
                      Nuevo descuento · {infoMes.label}
                    </p>
                    <div className="flex gap-1 p-1 bg-white rounded-xl">
                      <button
                        type="button"
                        onClick={() => setTipoDescuento("monto")}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                          tipoDescuento === "monto"
                            ? "bg-rose-600 text-white"
                            : "text-slate-400"
                        }`}
                      >
                        Monto $
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipoDescuento("porcentaje")}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                          tipoDescuento === "porcentaje"
                            ? "bg-rose-600 text-white"
                            : "text-slate-400"
                        }`}
                      >
                        Porcentaje %
                      </button>
                    </div>
                    <input
                      type="text"
                      value={valorDescuentoInput}
                      onChange={(e) =>
                        setValorDescuentoInput(
                          tipoDescuento === "monto"
                            ? formatCurrencyInput(e.target.value)
                            : e.target.value.replace(/[^\d.]/g, "")
                        )
                      }
                      placeholder={tipoDescuento === "monto" ? "500" : "10"}
                      className="w-full bg-white rounded-xl px-3 py-2 font-black text-slate-700 outline-none focus:ring-2 focus:ring-rose-200"
                    />
                    <input
                      type="text"
                      value={motivoDescuento}
                      onChange={(e) => setMotivoDescuento(e.target.value)}
                      placeholder="Motivo (ej. Promo referido, cortesía...)"
                      className="w-full bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-200"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAplicarDescuento}
                        disabled={valorDescuento <= 0 || !motivoDescuento.trim()}
                        className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all"
                      >
                        Aplicar descuento
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarDescuento(false);
                          setValorDescuentoInput("");
                          setMotivoDescuento("");
                        }}
                        className="px-3 py-2 rounded-xl bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {infoMes && (
              <>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  2. Monto que estás aplicando a {infoMes.label}
                </p>
                <input
                  type="text"
                  required
                  value={montoInput}
                  onChange={(e) => setMontoInput(formatCurrencyInput(e.target.value))}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-slate-700 text-xl outline-none focus:ring-2 focus:ring-emerald-100 mb-2"
                  placeholder="0"
                />
                <p className="text-[9px] font-bold text-slate-400 mb-3 -mt-1 leading-relaxed">
                  Compromiso del mes: ${infoMes.compromiso.toLocaleString()}
                  {descuentoActual
                    ? ` (antes $${brutoMes.toLocaleString()})`
                    : "."}
                </p>

                {!descuentoActual && !mostrarDescuento && (
                  <button
                    type="button"
                    onClick={() => setMostrarDescuento(true)}
                    className="w-full mb-4 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <TagIcon />
                    Aplicar descuento a {infoMes.label}
                  </button>
                )}
              </>
            )}
          </>
        )}

        {modo === "adicional" && (
          <>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Cobro extra a este cliente, fuera de los honorarios mensuales
            </p>

            <div className="mb-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Concepto
              </label>
              <select
                value={conceptoAdic}
                onChange={(e) => setConceptoAdic(e.target.value)}
                className="w-full bg-slate-50 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-100"
              >
                {CONCEPTOS_SERVICIO_ADICIONAL.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {conceptoAdic === "Otro" && (
              <div className="mb-4">
                <input
                  type="text"
                  value={conceptoLibre}
                  onChange={(e) => setConceptoLibre(e.target.value)}
                  placeholder="Describe el servicio..."
                  required
                  className="w-full bg-slate-50 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Mes
                </label>
                <select
                  value={mesAdic}
                  onChange={(e) => setMesAdic(Number(e.target.value))}
                  className="w-full bg-slate-50 rounded-2xl px-3 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-100"
                >
                  {MESES_NOM.map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Año
                </label>
                <select
                  value={anioAdic}
                  onChange={(e) => setAnioAdic(Number(e.target.value))}
                  className="w-full bg-slate-50 rounded-2xl px-3 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-100"
                >
                  {aniosDisponibles.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Monto ($)
              </label>
              <input
                type="text"
                required
                value={montoAdicInput}
                onChange={(e) => setMontoAdicInput(formatCurrencyInput(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-black text-slate-700 text-xl outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="mb-5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Notas (opcional)
              </label>
              <textarea
                value={notaAdic}
                onChange={(e) => setNotaAdic(e.target.value)}
                rows={2}
                placeholder="Ej. Periodo declarado, observaciones..."
                className="w-full bg-slate-50 rounded-2xl px-4 py-2 text-xs font-bold text-slate-700 outline-none resize-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <p className="text-[9px] font-bold text-slate-400 mb-2 leading-relaxed">
              Esto NO afecta tus métricas de honorarios mensuales. Aparece como
              servicio adicional en el perfil del cliente.
            </p>
          </>
        )}
        </div>

        {/* Pie fijo: siempre visible sin hacer scroll */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2">
          {modo === "honorarios" ? (
            <>
              <button
                type="submit"
                disabled={!mesSeleccionado || montoNumerico <= 0}
                className="w-full py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
              >
                Aplicar pago · {mesSeleccionado ? periodoLabel(mesSeleccionado) : "mes"}
              </button>
              {yaTienePago && (
                <button
                  type="button"
                  onClick={handleQuitar}
                  className="w-full py-3 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                >
                  Quitar pago de este mes
                </button>
              )}
            </>
          ) : (
            <button
              type="submit"
              disabled={montoAdicNumerico <= 0 || !conceptoFinal}
              className="w-full py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] bg-violet-600 text-white shadow-lg shadow-violet-100 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
            >
              Registrar servicio adicional
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full text-slate-300 hover:text-slate-500 py-2 font-bold text-[10px] uppercase tracking-widest"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

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
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

function formatCurrencyInput(value: string) {
  const numericValue = value.toString().replace(/\D/g, "");
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
  const { periodo, periodoHoy, registrarPago, quitarPago, listaClientes } = useClientes();

  const clienteActual = listaClientes.find((c) => c.id === cliente.id) ?? cliente;
  const limite = periodoKey(periodo) > periodoKey(periodoHoy) ? periodoHoy : periodo;
  const mesesCobrables = useMemo(
    () => listarMesesCobrables(clienteActual, limite),
    [clienteActual, limite]
  );

  const [mesSeleccionado, setMesSeleccionado] = useState<Periodo | null>(null);
  const [montoInput, setMontoInput] = useState("");

  const periodoInicialKey = periodoInicial
    ? `${periodoInicial.anio}-${periodoInicial.mes}`
    : "";

  /** Solo al abrir el modal o cambiar de cliente — no al elegir otro mes (evita volver a mayo). */
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

  const handleAplicar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesSeleccionado || montoNumerico <= 0) return;
    const actualizado = registrarPago(clienteActual.id, mesSeleccionado, montoNumerico);
    if (actualizado) {
      onAplicado(actualizado);
      onClose();
    }
  };

  const handleQuitar = () => {
    if (!mesSeleccionado) return;
    const actualizado = quitarPago(clienteActual.id, mesSeleccionado);
    if (actualizado) {
      onAplicado(actualizado);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleAplicar}
        className="relative bg-white w-full max-w-[440px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.18)] border border-slate-100 p-8 scrollbar-hide"
      >
        <div className="flex justify-between items-start mb-5">
          <div className="min-w-0 pr-2">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.25em] mb-1">
              Aplicar pago
            </p>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-tight truncate">
              {clienteActual.razonSocial}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-300 hover:text-red-500">
            <CloseIcon />
          </button>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          1. Elige el mes al que corresponde este pago
        </p>

        <div className="space-y-2 max-h-[220px] overflow-y-auto mb-6 pr-1 scrollbar-hide">
          {mesesCobrables.length === 0 ? (
            <p className="text-sm text-slate-400 font-bold text-center py-6">
              No hay meses cobrables en este periodo
            </p>
          ) : (
            mesesCobrables.map((m) => {
              const seleccionado = mesSeleccionado && esMismoPeriodo(m.periodo, mesSeleccionado);
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
                    {m.pagadoCompleto ? (
                      <span className="text-[8px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">
                        Pagado
                      </span>
                    ) : m.parcial ? (
                      <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">
                        Parcial
                      </span>
                    ) : (
                      <span className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase">
                        Pendiente
                      </span>
                    )}
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
            <p className="text-[9px] font-bold text-slate-400 mb-6 leading-relaxed">
              Puedes registrar el total del mes o un abono parcial. El saldo restante seguirá pendiente hasta cubrir los $
              {infoMes.compromiso.toLocaleString()}.
            </p>
          </>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={!mesSeleccionado || montoNumerico <= 0}
            className="w-full py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
          >
            Aplicar a {mesSeleccionado ? periodoLabel(mesSeleccionado) : "mes"}
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

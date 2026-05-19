"use client";

import { useState, useMemo } from "react";
import {
  MESES_NOM,
  type Cliente,
  type Periodo,
  ID_INGRESOS_DIVERSOS,
  esIngresoGeneralCliente,
  periodoLabel,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function formatCurrencyInput(value: string) {
  const numericValue = value.toString().replace(/\D/g, "");
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

type ModoIngreso = "cliente" | "diverso";

type Props = {
  onClose: () => void;
  onAplicado?: () => void;
};

export default function ModalIngresoExtra({ onClose, onAplicado }: Props) {
  const { listaClientes, periodo, periodoHoy, aniosDisponibles, registrarPago } =
    useClientes();

  const [modo, setModo] = useState<ModoIngreso>("diverso");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [mes, setMes] = useState(periodo.mes);
  const [anio, setAnio] = useState(periodo.anio);
  const [montoInput, setMontoInput] = useState("");
  const [notas, setNotas] = useState("");

  const clientesOpciones = useMemo(
    () =>
      listaClientes.filter((c) => c.activo && !esIngresoGeneralCliente(c)),
    [listaClientes]
  );

  const clienteDiverso = useMemo(
    () => listaClientes.find((c) => c.id === ID_INGRESOS_DIVERSOS),
    [listaClientes]
  );

  const periodoPago: Periodo = { mes, anio };
  const montoNumerico = Number(montoInput.replace(/,/g, "")) || 0;
  const requiereNota = modo === "diverso";
  const puedeGuardar =
    montoNumerico > 0 &&
    (!requiereNota || notas.trim().length >= 3) &&
    (modo === "diverso" || clienteId !== "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeGuardar) return;

    const id =
      modo === "diverso" ? ID_INGRESOS_DIVERSOS : Number(clienteId);
    const nota = notas.trim() || undefined;
    const actualizado = registrarPago(id, periodoPago, montoNumerico, nota);
    if (actualizado) {
      onAplicado?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-6 pointer-events-none">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-[480px] shadow-[0_30px_100px_rgba(0,0,0,0.18)] rounded-[2.5rem] flex flex-col pointer-events-auto border border-slate-100 p-8"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">
              Cobranza
            </p>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
              Ingreso extra
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-red-500"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setModo("diverso")}
            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              modo === "diverso"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-400"
            }`}
          >
            Ingreso diverso
          </button>
          <button
            type="button"
            onClick={() => setModo("cliente")}
            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              modo === "cliente"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-400"
            }`}
          >
            Cliente existente
          </button>
        </div>

        {modo === "cliente" ? (
          <div className="mb-4">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
              Cliente
            </label>
            <select
              value={clienteId}
              onChange={(e) =>
                setClienteId(e.target.value ? Number(e.target.value) : "")
              }
              required
              className="w-full bg-slate-50 rounded-2xl px-4 py-3.5 font-bold text-slate-700 outline-none"
            >
              <option value="">Seleccionar...</option>
              {clientesOpciones.map((c: Cliente) => (
                <option key={c.id} value={c.id}>
                  {c.razonSocial}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-4 rounded-2xl bg-violet-50 border border-violet-100 px-4 py-3">
            <p className="text-[10px] font-black text-violet-700 uppercase tracking-widest">
              {clienteDiverso?.razonSocial ?? "Ingresos diversos"}
            </p>
            <p className="text-[10px] font-bold text-violet-600/80 mt-1">
              Pagos únicos, servicios puntuales o ingresos sin cliente fijo.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
              Mes
            </label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="w-full bg-slate-50 rounded-2xl px-4 py-3.5 font-bold text-slate-700 outline-none"
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
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="w-full bg-slate-50 rounded-2xl px-4 py-3.5 font-bold text-slate-700 outline-none"
            >
              {aniosDisponibles.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[9px] font-bold text-slate-400 mb-4 -mt-1">
          Periodo: {periodoLabel(periodoPago)}
        </p>

        <div className="mb-4">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
            Monto ($)
          </label>
          <input
            type="text"
            required
            value={montoInput}
            onChange={(e) => setMontoInput(formatCurrencyInput(e.target.value))}
            className="w-full bg-slate-50 rounded-2xl px-4 py-3.5 font-black text-2xl text-slate-800 outline-none focus:ring-2 focus:ring-emerald-100"
            placeholder="0"
          />
        </div>

        <div className="mb-6">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
            Notas {requiereNota ? "(requerido)" : "(opcional)"}
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder={
              modo === "diverso"
                ? "Ej. Asesoría puntual, proyecto único, reembolso..."
                : "Ej. Pago extraordinario, ajuste..."
            }
            className="w-full bg-slate-50 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none resize-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <button
          type="submit"
          disabled={!puedeGuardar}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
            puedeGuardar
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Registrar ingreso
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import { formatCurrencyInput, parseMontoInput } from "@/lib/monto-input";
import { MESES_NOM } from "@/lib/clientes";

type Props = {
  open: boolean;
  clienteNombre: string;
  montoActual: number;
  /** Mes 0–11 desde el cual aplica el cambio (periodo vigente del CRM). */
  mesDesde: number;
  anioDesde: number;
  onConfirmar: (nuevoMonto: number) => void;
  onCancelar: () => void;
};

/**
 * Ventana formal para ajustar la cuota mensual.
 * No permite editar el monto en el formulario de cliente: hay que pasar
 * por esta confirmación explícita (aviso + casilla de enterado).
 */
export default function ModalCambioHonorarios({
  open,
  clienteNombre,
  montoActual,
  mesDesde,
  anioDesde,
  onConfirmar,
  onCancelar,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [nuevoRaw, setNuevoRaw] = useState("");
  const [enterado, setEnterado] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setNuevoRaw("");
    setEnterado(false);
  }, [open, montoActual]);

  useScrollLock(open);

  const nuevoMonto = useMemo(() => parseMontoInput(nuevoRaw), [nuevoRaw]);
  const mesLabel = MESES_NOM[mesDesde] ?? "";
  const diferencia = nuevoMonto - montoActual;
  const hayCambio = nuevoMonto > 0 && nuevoMonto !== montoActual;
  const puedeConfirmar = hayCambio && enterado;

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-900/55 backdrop-blur-sm p-4"
      onClick={onCancelar}
      role="presentation"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cambio-honorarios-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 bg-slate-50/80 px-7 py-5">
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-700">
            Ajuste formal de cuota
          </p>
          <h2
            id="cambio-honorarios-titulo"
            className="mt-1 text-xl font-black tracking-tight text-slate-900"
          >
            Modificar honorarios
          </h2>
          <p className="mt-1 text-[13px] font-semibold text-slate-500 truncate">
            {clienteNombre || "Cliente"}
          </p>
        </div>

        <div className="space-y-5 px-7 py-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Cuota vigente
              </p>
              <p className="mt-1 text-lg font-black tabular-nums text-slate-800">
                ${montoActual.toLocaleString("es-MX")}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-700/80">
                Vigencia del cambio
              </p>
              <p className="mt-1 text-sm font-black text-amber-900">
                Desde {mesLabel} {anioDesde}
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="nuevo-honorario"
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block"
            >
              Nueva cuota mensual ($)
            </label>
            <input
              id="nuevo-honorario"
              type="text"
              inputMode="numeric"
              autoFocus
              value={nuevoRaw}
              onChange={(e) =>
                setNuevoRaw(formatCurrencyInput(e.target.value))
              }
              placeholder="0"
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xl font-black tabular-nums text-slate-800 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
            {hayCambio && (
              <p
                className={`mt-2 ml-1 text-[11px] font-bold tabular-nums ${
                  diferencia > 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {diferencia > 0 ? "Incremento" : "Reducción"} de $
                {Math.abs(diferencia).toLocaleString("es-MX")}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[12px] leading-relaxed text-slate-600">
            <p className="font-bold text-slate-800 mb-1">Efectos del cambio</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                La nueva cuota aplica desde{" "}
                <span className="font-semibold">
                  {mesLabel} {anioDesde}
                </span>{" "}
                en adelante.
              </li>
              <li>
                Los pagos ya registrados conservan el monto con el que se
                cobraron.
              </li>
              <li>
                El cambio queda pendiente hasta que guardes la ficha del
                cliente.
              </li>
            </ul>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                enterado
                  ? "border-amber-600 bg-amber-600 text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {enterado && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={enterado}
              onChange={(e) => setEnterado(e.target.checked)}
            />
            <span className="text-[12px] font-semibold text-slate-700 leading-snug">
              Confirmo que revisé la cuota vigente y acepto aplicar este ajuste
              formal a partir de {mesLabel} {anioDesde}.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-7 py-4">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!puedeConfirmar}
            onClick={() => {
              if (!puedeConfirmar) return;
              onConfirmar(nuevoMonto);
            }}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirmar ajuste
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

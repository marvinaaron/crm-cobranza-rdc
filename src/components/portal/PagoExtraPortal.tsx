"use client";

import { useMemo, useState } from "react";
import {
  calcularCobroHonorarios,
  COMISION_PLATAFORMA_PCT,
} from "@/lib/stripe-honorarios";
import type { Cliente, ExtraEsperado, Periodo } from "@/lib/clientes";
import { fmtMxn } from "@/components/portal/portal-ui";
import { DATOS_BANCARIOS_PORTAL } from "@/lib/datos-bancarios";

const stripeHabilitado = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

type Props = {
  cliente: Cliente;
  extra: ExtraEsperado;
  saldo: number;
  /** Periodo al que se atribuye el abono (normalmente el mes en curso). */
  periodoAbono: Periodo;
};

/**
 * Opciones de pago para un trabajo adicional (extra por cobrar) en el portal.
 * Permite abonar el saldo (total o parcial) con tarjeta vía Stripe, o ver los
 * datos para transferencia. El abono se atribuye al mes en curso.
 */
export default function PagoExtraPortal({
  cliente,
  extra,
  saldo,
  periodoAbono,
}: Props) {
  const [metodo, setMetodo] = useState<null | "tarjeta" | "transferencia">(null);
  const [montoInput, setMontoInput] = useState<string>(String(saldo));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const monto = useMemo(() => {
    const n = Number(montoInput);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.min(saldo, Math.round(n * 100) / 100);
  }, [montoInput, saldo]);

  const desglose = calcularCobroHonorarios(monto);

  if (saldo <= 0) return null;

  const iniciarPagoTarjeta = async () => {
    if (monto <= 0) {
      setError("Captura un monto válido.");
      return;
    }
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: cliente.id,
          razonSocial: cliente.razonSocial,
          extra: {
            extraEsperadoId: extra.id,
            concepto: extra.concepto,
            monto,
            mes: periodoAbono.mes,
            anio: periodoAbono.anio,
          },
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo iniciar el pago.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const copiarClabe = async () => {
    try {
      await navigator.clipboard.writeText(DATOS_BANCARIOS_PORTAL.clabe);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-amber-100">
      {metodo === null ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMetodo("tarjeta")}
            className="flex-1 min-w-[8rem] py-2.5 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700"
          >
            Pagar con tarjeta
          </button>
          <button
            type="button"
            onClick={() => setMetodo("transferencia")}
            className="flex-1 min-w-[8rem] py-2.5 rounded-xl bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-800"
          >
            Pagar por transferencia
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              {metodo === "tarjeta" ? "Pago con tarjeta" : "Pago por transferencia"}
            </p>
            <button
              type="button"
              onClick={() => {
                setMetodo(null);
                setError(null);
              }}
              className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
            >
              ← Otras opciones
            </button>
          </div>

          {/* Monto a abonar (permite pago parcial). */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Monto a abonar
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={montoInput}
                onChange={(e) => setMontoInput(e.target.value)}
                max={saldo}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-black tabular-nums text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
              <button
                type="button"
                onClick={() => setMontoInput(String(saldo))}
                className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 whitespace-nowrap"
              >
                Todo · {fmtMxn(saldo)}
              </button>
            </div>
            {monto > 0 && monto < saldo && (
              <p className="text-[10px] font-bold text-amber-700 mt-1">
                Abono parcial. Te quedarían {fmtMxn(saldo - monto)} por pagar.
              </p>
            )}
          </div>

          {metodo === "tarjeta" ? (
            <>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-slate-600">Abono</span>
                  <span className="font-black text-slate-800 tabular-nums">
                    {fmtMxn(desglose.montoHonorarios, 2)}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-slate-500">
                    Comisión plataforma ({(COMISION_PLATAFORMA_PCT * 100).toFixed(0)}%)
                  </span>
                  <span className="font-black text-slate-600 tabular-nums">
                    {fmtMxn(desglose.comision, 2)}
                  </span>
                </div>
                <div className="flex justify-between gap-2 pt-2 border-t border-slate-200">
                  <span className="font-black text-slate-800">Total a pagar</span>
                  <span className="font-black text-indigo-700 text-base tabular-nums">
                    {fmtMxn(desglose.total, 2)}
                  </span>
                </div>
              </div>
              {!stripeHabilitado ? (
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  El pago con tarjeta no está disponible por ahora. Usa
                  transferencia.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={iniciarPagoTarjeta}
                  disabled={cargando || monto <= 0}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-60"
                >
                  {cargando ? "Redirigiendo a Stripe…" : "Pagar con tarjeta"}
                </button>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-3 text-sm">
              <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                Transfiere por <span className="font-black">SPEI</span> sin
                comisión. Después de transferir, avísale a tu contador para que
                registre tu abono.
              </p>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  Banco
                </p>
                <p className="font-black text-slate-800">
                  {DATOS_BANCARIOS_PORTAL.banco}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  Titular
                </p>
                <p className="font-black text-slate-800">
                  {DATOS_BANCARIOS_PORTAL.titular}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  CLABE interbancaria
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-slate-900 text-base tracking-wide tabular-nums">
                    {DATOS_BANCARIOS_PORTAL.clabeDisplay}
                  </span>
                  <button
                    type="button"
                    onClick={copiarClabe}
                    className="px-3 py-1.5 rounded-lg bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-800"
                  >
                    {copiado ? "Copiada" : "Copiar CLABE"}
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  Monto a transferir
                </p>
                <p className="text-2xl font-black text-emerald-700 tabular-nums">
                  {fmtMxn(monto, 2)}
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-[11px] font-bold text-red-600 text-center">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

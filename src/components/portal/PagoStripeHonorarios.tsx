"use client";

import { useMemo, useState } from "react";
import {
  calcularCobroHonorarios,
  COMISION_PLATAFORMA_PCT,
} from "@/lib/stripe-honorarios";
import { periodoLabel, type Cliente, type Periodo } from "@/lib/clientes";
import type { PagoHonorarioStripe } from "@/lib/stripe-checkout-types";
import { fmtMxn } from "@/components/portal/portal-ui";

type Props = {
  cliente: Cliente;
  periodo?: Periodo;
  montoHonorarios: number;
  pagos?: PagoHonorarioStripe[];
  embedded?: boolean;
  etiquetaBoton?: string;
  compacto?: boolean;
  /** Botones compactos un poco más grandes (sección de adeudos). */
  compactoGrande?: boolean;
};

const stripeHabilitado = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PagoStripeHonorarios({
  cliente,
  periodo,
  montoHonorarios,
  pagos: pagosProp,
  embedded = false,
  etiquetaBoton = "Pagar con tarjeta",
  compacto = false,
  compactoGrande = false,
}: Props) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagos = useMemo((): PagoHonorarioStripe[] => {
    if (pagosProp && pagosProp.length > 0) return pagosProp;
    if (periodo && montoHonorarios > 0) {
      return [{ periodo, montoHonorarios }];
    }
    return [];
  }, [pagosProp, periodo, montoHonorarios]);

  const desglose = calcularCobroHonorarios(montoHonorarios);

  if (montoHonorarios <= 0 || pagos.length === 0) return null;

  const iniciarPago = async () => {
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: cliente.id,
          razonSocial: cliente.razonSocial,
          pagos,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo iniciar el pago.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Error de conexión. Intente de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  if (compacto) {
    return (
      <div className="shrink-0">
        <button
          type="button"
          onClick={iniciarPago}
          disabled={cargando || !stripeHabilitado}
          title={
            stripeHabilitado
              ? `Total con comisión: ${fmtMxn(desglose.total, 2)}`
              : "Stripe no configurado"
          }
          className={`rounded-xl bg-emerald-600 text-white font-black uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap ${
            compactoGrande
              ? "px-4 py-2.5 text-[10px] shadow-md shadow-emerald-100"
              : "px-2.5 py-1 rounded-lg text-[8px]"
          }`}
        >
          {cargando ? "…" : etiquetaBoton}
        </button>
        {error && (
          <p className="text-[9px] font-bold text-red-600 mt-0.5 max-w-[8rem] text-right">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "mt-5 pt-5 border-t border-slate-100"}>
      {!embedded && (
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">
          Pago en línea con tarjeta
        </p>
      )}

      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-sm">
        {pagos.length > 1 ? (
          <>
            {pagos.map((p) => (
              <div
                key={`${p.periodo.anio}-${p.periodo.mes}`}
                className="flex justify-between gap-2"
              >
                <span className="font-bold text-slate-600">{periodoLabel(p.periodo)}</span>
                <span className="font-black text-slate-800 tabular-nums">
                  {fmtMxn(p.montoHonorarios, 2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between gap-2 pt-1 border-t border-slate-200">
              <span className="font-bold text-slate-600">Subtotal honorarios</span>
              <span className="font-black text-slate-800 tabular-nums">
                {fmtMxn(desglose.montoHonorarios, 2)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex justify-between gap-2">
            <span className="font-bold text-slate-600">
              Honorarios ({periodo ? periodoLabel(periodo) : "pendientes"})
            </span>
            <span className="font-black text-slate-800 tabular-nums">
              {fmtMxn(desglose.montoHonorarios, 2)}
            </span>
          </div>
        )}
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
          <span className="font-black text-indigo-700 text-lg tabular-nums">
            {fmtMxn(desglose.total, 2)}
          </span>
        </div>
      </div>

      {!stripeHabilitado ? (
        <p className="mt-4 text-[11px] font-bold text-amber-800 leading-relaxed rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
          Configure Stripe en <code className="text-[10px]">.env.local</code> para activar pagos con
          tarjeta.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={iniciarPago}
            disabled={cargando}
            className="mt-4 w-full py-3.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {cargando ? "Redirigiendo a Stripe…" : (
              <>
                <CardIcon />
                {etiquetaBoton}
              </>
            )}
          </button>
          <p className="mt-2 text-[10px] font-bold text-slate-400 text-center">
            Será redirigido a la página segura de Stripe para completar el pago.
          </p>
        </>
      )}

      {error && (
        <p className="mt-3 text-[11px] font-bold text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}

function CardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

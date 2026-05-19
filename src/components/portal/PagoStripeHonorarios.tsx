"use client";

import { useState } from "react";
import {
  calcularCobroHonorarios,
  COMISION_PLATAFORMA_PCT,
} from "@/lib/stripe-honorarios";
import { periodoLabel, type Cliente, type Periodo } from "@/lib/clientes";
import { fmtMxn } from "@/components/portal/portal-ui";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  montoHonorarios: number;
  /** Sin borde superior ni título (dentro de PortalSection). */
  embedded?: boolean;
};

const stripeHabilitado = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PagoStripeHonorarios({
  cliente,
  periodo,
  montoHonorarios,
  embedded = false,
}: Props) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const desglose = calcularCobroHonorarios(montoHonorarios);

  if (montoHonorarios <= 0) return null;

  const iniciarPago = async () => {
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: cliente.id,
          mes: periodo.mes,
          anio: periodo.anio,
          montoHonorarios: desglose.montoHonorarios,
          razonSocial: cliente.razonSocial,
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

  return (
    <div className={embedded ? "" : "mt-5 pt-5 border-t border-slate-100"}>
      {!embedded && (
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">
          Pago en línea con tarjeta
        </p>
      )}

      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <span className="font-bold text-slate-600">Honorarios ({periodoLabel(periodo)})</span>
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
          <span className="font-black text-indigo-700 text-lg tabular-nums">
            {fmtMxn(desglose.total, 2)}
          </span>
        </div>
      </div>

      {!stripeHabilitado ? (
        <p className="mt-4 text-[11px] font-bold text-amber-800 leading-relaxed rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
          El pago con tarjeta se activará cuando el despacho configure Stripe (llaves en{" "}
          <code className="text-[10px]">.env.local</code>).
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={iniciarPago}
            disabled={cargando}
            className="mt-4 w-full py-3.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {cargando ? "Redirigiendo a Stripe…" : (
              <>
                <CardIcon />
                Pagar con tarjeta
              </>
            )}
          </button>
          <p className="mt-2 text-[10px] font-bold text-slate-400 text-center">
            Pago seguro con Stripe · Visa, Mastercard, Amex
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

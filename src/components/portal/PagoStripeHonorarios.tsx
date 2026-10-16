"use client";

import { useMemo, useState } from "react";
import {
  calcularCobroHonorarios,
} from "@/lib/stripe-honorarios";
import { periodoLabel, type Cliente, type Periodo } from "@/lib/clientes";
import type {
  PagoHonorarioStripe,
  PagoExtraStripe,
} from "@/lib/stripe-checkout-types";
import { fmtMxn } from "@/components/portal/portal-ui";
import DesglosePagoTarjeta from "@/components/portal/DesglosePagoTarjeta";
import { AppleLogo } from "@/components/publico/PaymentMethodLogos";

type Props = {
  cliente: Cliente;
  periodo?: Periodo;
  montoHonorarios: number;
  pagos?: PagoHonorarioStripe[];
  extras?: PagoExtraStripe[];
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
  extras = [],
  embedded = false,
  etiquetaBoton = "Pagar con tarjeta",
  compacto = false,
  compactoGrande = false,
}: Props) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagos = useMemo((): PagoHonorarioStripe[] => {
    if (pagosProp) return pagosProp;
    if (periodo && montoHonorarios > 0 && extras.length === 0) {
      return [{ periodo, montoHonorarios }];
    }
    return [];
  }, [pagosProp, periodo, montoHonorarios, extras.length]);

  const desglose = calcularCobroHonorarios(montoHonorarios);

  if (montoHonorarios <= 0 || (pagos.length === 0 && extras.length === 0)) return null;

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
          ...(pagos.length > 0 ? { pagos } : {}),
          ...(extras.length > 0 ? { extras } : {}),
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
              ? `Total a pagar: ${fmtMxn(desglose.total, 2)} (incl. costo de procesamiento)`
              : "Stripe no configurado"
          }
          className={`rounded-xl bg-emerald-600 text-white font-black uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap ${
            compactoGrande
              ? "px-4 py-2.5 text-[10px] shadow-md shadow-emerald-600/25"
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

  if (embedded) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-slate-500">Total con tarjeta</p>
            <p className="mt-0.5 text-[28px] font-bold text-slate-900 tabular-nums leading-none">
              {fmtMxn(desglose.total, 2)}
            </p>
            <p className="mt-1 text-[13px] text-slate-500 leading-snug">
              {fmtMxn(desglose.montoHonorarios, 2)}
              {pagos.length > 0 && extras.length > 0
                ? " (honorarios y adicional)"
                : extras.length > 0
                  ? " de trabajo adicional"
                  : pagos.length > 1
                    ? ` · ${pagos.length} meses`
                    : " de honorarios"}
              {" + comisión Stripe"}
            </p>
          </div>
          <span className="shrink-0 mt-1 w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
            <CardIcon />
          </span>
        </div>
        {!stripeHabilitado ? (
          <p className="text-[15px] text-amber-800 leading-relaxed rounded-xl bg-amber-50 px-4 py-3">
            El pago con tarjeta no está disponible. Usa transferencia.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void iniciarPago()}
              disabled={cargando}
              className="w-full h-12 rounded-xl bg-[#1a164d] text-white text-[17px] font-semibold disabled:opacity-60 flex items-center justify-between px-5"
            >
              {cargando ? (
                <span className="w-full text-center">Redirigiendo a Stripe…</span>
              ) : (
                <>
                  <span className="w-5" aria-hidden />
                  <span>{etiquetaBoton}</span>
                  <ArrowRightIcon />
                </>
              )}
            </button>
            <NotaStripeApple />
          </>
        )}
        {error ? (
          <p className="text-[13px] text-red-600 text-center">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-5 pt-5 border-t border-slate-100">
      <p className="text-[13px] font-semibold text-slate-500 mb-3">
        Pago en línea con tarjeta
      </p>

      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-sm">
        {pagos.length > 1 ? (
          <>
            {pagos.map((p) => (
              <div
                key={`${p.periodo.anio}-${p.periodo.mes}`}
                className="flex justify-between gap-2"
              >
                <span className="font-semibold text-slate-600">{periodoLabel(p.periodo)}</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {fmtMxn(p.montoHonorarios, 2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between gap-2 pt-1 border-t border-slate-200">
              <span className="font-semibold text-slate-600">Subtotal honorarios</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {fmtMxn(desglose.montoHonorarios, 2)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex justify-between gap-2">
            <span className="font-semibold text-slate-600">
              Honorarios ({periodo ? periodoLabel(periodo) : "pendientes"})
            </span>
            <span className="font-semibold text-slate-800 tabular-nums">
              {fmtMxn(desglose.montoHonorarios, 2)}
            </span>
          </div>
        )}
        <DesglosePagoTarjeta desglose={desglose} />
      </div>

      {!stripeHabilitado ? (
        <p className="mt-4 text-[15px] text-amber-800 leading-relaxed rounded-xl bg-amber-50 px-4 py-3">
          El pago con tarjeta no está disponible. Usa transferencia.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => void iniciarPago()}
            disabled={cargando}
            className="mt-4 w-full h-12 rounded-xl bg-[#1a164d] text-white text-[17px] font-semibold disabled:opacity-60 flex items-center justify-between px-5"
          >
            {cargando ? (
              <span className="w-full text-center">Redirigiendo a Stripe…</span>
            ) : (
              <>
                <span className="w-5" aria-hidden />
                <span>{etiquetaBoton}</span>
                <ArrowRightIcon />
              </>
            )}
          </button>
          <div className="mt-2">
            <NotaStripeApple />
          </div>
        </>
      )}

      {error ? (
        <p className="mt-3 text-[13px] text-red-600 text-center">{error}</p>
      ) : null}
    </div>
  );
}

function NotaStripeApple() {
  return (
    <p className="text-[13px] text-slate-500 text-center leading-snug flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5">
      <span>En Stripe puedes pagar con tarjeta o</span>
      <span className="inline-flex items-center gap-0.5 text-slate-800 font-semibold">
        <AppleLogo className="h-3.5 w-3.5 text-slate-800" />
        Pay
      </span>
    </p>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
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

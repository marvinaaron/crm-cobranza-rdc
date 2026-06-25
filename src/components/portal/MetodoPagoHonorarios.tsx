"use client";

import { useState, type ReactNode } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
import { periodoLabel } from "@/lib/clientes";
import { calcularCobroHonorarios } from "@/lib/stripe-honorarios";
import { fmtMxn } from "@/components/portal/portal-ui";
import PortalSection from "@/components/portal/PortalSection";
import DatosTransferenciaPortal from "@/components/portal/DatosTransferenciaPortal";
import SubirComprobante from "@/components/SubirComprobante";
import PagoStripeHonorarios from "@/components/portal/PagoStripeHonorarios";

type Metodo = "transferencia" | "tarjeta";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  montoHonorarios: number;
};

/**
 * Paso 1: elige método (SPEI recomendado o tarjeta).
 * Paso 2: muestra solo el flujo del método elegido.
 */
export default function MetodoPagoHonorarios({
  cliente,
  periodo,
  montoHonorarios,
}: Props) {
  const [metodo, setMetodo] = useState<Metodo>("transferencia");
  const totalTarjeta = calcularCobroHonorarios(montoHonorarios).total;

  return (
    <PortalSection title="Pagar honorarios">
      <p className="text-[11px] font-bold text-slate-500 mb-4 leading-relaxed">
        Elige cómo quieres pagar{" "}
        <span className="font-black text-slate-800 tabular-nums">
          {fmtMxn(montoHonorarios, 2)}
        </span>{" "}
        de {periodoLabel(periodo)}.
      </p>

      <div
        role="radiogroup"
        aria-label="Método de pago"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5"
      >
        <MetodoCard
          seleccionado={metodo === "transferencia"}
          onSelect={() => setMetodo("transferencia")}
          titulo="Transferencia SPEI"
          subtitulo="Recomendado · sin costo extra"
          monto={fmtMxn(montoHonorarios, 2)}
          tono="emerald"
          icono={<SpeiIcon />}
          badge="Recomendado"
        />
        <MetodoCard
          seleccionado={metodo === "tarjeta"}
          onSelect={() => setMetodo("tarjeta")}
          titulo="Tarjeta"
          subtitulo="Visa, MC, Amex · Stripe"
          monto={fmtMxn(totalTarjeta, 2)}
          tono="navy"
          icono={<CardIcon />}
        />
      </div>

      {metodo === "transferencia" ? (
        <div className="space-y-4">
          <DatosTransferenciaPortal
            montoReferencia={montoHonorarios}
            embedded
          />
          <SubirComprobante
            clienteId={cliente.id}
            periodo={periodo}
            className="min-w-0 flex flex-col"
          />
        </div>
      ) : (
        <PagoStripeHonorarios
          cliente={cliente}
          periodo={periodo}
          montoHonorarios={montoHonorarios}
          embedded
        />
      )}
    </PortalSection>
  );
}

function MetodoCard({
  seleccionado,
  onSelect,
  titulo,
  subtitulo,
  monto,
  tono,
  icono,
  badge,
}: {
  seleccionado: boolean;
  onSelect: () => void;
  titulo: string;
  subtitulo: string;
  monto: string;
  tono: "emerald" | "navy";
  icono: ReactNode;
  badge?: string;
}) {
  const ring =
    tono === "emerald"
      ? seleccionado
        ? "ring-2 ring-emerald-500 border-emerald-200 bg-emerald-50/50"
        : "border-slate-200 bg-white hover:border-emerald-200"
      : seleccionado
        ? "ring-2 ring-[var(--portal-navy)] border-[var(--portal-navy-border)] bg-[var(--portal-navy-soft)]"
        : "border-slate-200 bg-white hover:border-slate-300";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={seleccionado}
      onClick={onSelect}
      className={`relative text-left rounded-2xl border p-4 transition-all ${ring}`}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-600 text-white">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            tono === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-[var(--portal-navy)]"
          }`}
        >
          {icono}
        </span>
        <div className="min-w-0 pr-8">
          <p className="text-sm font-black text-slate-800">{titulo}</p>
          <p className="text-[10px] font-bold text-slate-500 mt-0.5">{subtitulo}</p>
          <p
            className={`text-base font-black tabular-nums mt-2 ${
              tono === "emerald" ? "text-emerald-700" : "text-[var(--portal-navy)]"
            }`}
          >
            {monto}
          </p>
        </div>
      </div>
      <span
        className={`absolute bottom-4 right-4 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
          seleccionado
            ? tono === "emerald"
              ? "border-emerald-600"
              : "border-[var(--portal-navy)]"
            : "border-slate-300"
        }`}
        aria-hidden
      >
        {seleccionado && (
          <span
            className={`h-2 w-2 rounded-full ${
              tono === "emerald" ? "bg-emerald-600" : "bg-[var(--portal-navy)]"
            }`}
          />
        )}
      </span>
    </button>
  );
}

function SpeiIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 9-5 9 5" />
      <path d="M9 22V9" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

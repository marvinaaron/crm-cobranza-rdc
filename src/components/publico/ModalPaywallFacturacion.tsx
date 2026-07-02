"use client";

import Link from "next/link";
import type { EstadoUsoFacturacion } from "@/lib/herramientas/facturacion-uso";
import HerramientasPricingExperience from "@/components/publico/HerramientasPricingExperience";

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  uso: EstadoUsoFacturacion | null;
};

export default function ModalPaywallFacturacion({ abierto, onCerrar, uso }: Props) {
  if (!abierto) return null;

  const requiereCuenta = uso?.requiereCuenta === true;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-facturacion-titulo"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCerrar}
        aria-label="Cerrar"
      />
      <div className="relative w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl ring-1 ring-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-violet-950 to-indigo-950 px-6 py-8 text-white text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-300">
            {requiereCuenta ? "Consultas gratis agotadas" : "Desbloquea Pro+"}
          </p>
          <h2 id="paywall-facturacion-titulo" className="mt-2 text-2xl sm:text-3xl font-black">
            {requiereCuenta
              ? "Sigue calculando sin límites"
              : "Calculadora de Facturación Pro+"}
          </h2>
          <p className="mt-2 text-sm text-white/85 max-w-md mx-auto leading-relaxed">
            {requiereCuenta
              ? "Ya usaste tus 3 consultas gratis. Elige un plan o entra al portal si ya eres cliente RDC."
              : "Accede ilimitado a esta y todas las herramientas fiscales con un solo plan."}
          </p>
          <Link
            href="/herramientas/pro"
            onClick={onCerrar}
            className="mt-4 inline-flex text-xs font-bold text-violet-200 hover:text-white underline underline-offset-2"
          >
            Ver experiencia completa Pro+ →
          </Link>
        </div>

        <div className="p-6">
          <HerramientasPricingExperience herramientaDestacada="facturacion" compacto onCerrar={onCerrar} />
          <button
            type="button"
            onClick={onCerrar}
            className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  );
}

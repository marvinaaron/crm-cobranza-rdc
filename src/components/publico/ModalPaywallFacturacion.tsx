"use client";

import type { EstadoUsoFacturacion } from "@/lib/herramientas/facturacion-uso";

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  uso: EstadoUsoFacturacion | null;
};

const PLANES = [
  {
    id: "mensual",
    nombre: "Pro mensual",
    precio: "$149",
    periodo: "/mes",
    destacado: false,
    bullets: ["Cálculos ilimitados", "Historial en la nube", "Soporte prioritario"],
  },
  {
    id: "anual",
    nombre: "Pro anual",
    precio: "$1,299",
    periodo: "/año",
    destacado: true,
    ahorro: "Ahorra 27%",
    bullets: ["Todo lo del mensual", "Facturación anual", "Mejor precio por cálculo"],
  },
  {
    id: "lifetime",
    nombre: "Lifetime",
    precio: "$1,999",
    periodo: "pago único",
    destacado: false,
    bullets: ["Acceso de por vida", "Hasta 50 clientes", "Oferta limitada"],
  },
] as const;

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
      <div className="relative w-full max-w-lg sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl ring-1 ring-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 px-6 py-8 text-white text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
            {requiereCuenta ? "Consultas gratis agotadas" : "Desbloquea Pro"}
          </p>
          <h2 id="paywall-facturacion-titulo" className="mt-2 text-2xl sm:text-3xl font-black">
            {requiereCuenta
              ? "Crea cuenta para 1 cálculo extra"
              : "Calculadora de Facturación Pro"}
          </h2>
          <p className="mt-2 text-sm text-white/85 max-w-md mx-auto leading-relaxed">
            {requiereCuenta
              ? "Ya usaste tus 3 consultas gratuitas. Verifica tu correo y obtén 1 cálculo adicional, o desbloquea Pro para uso ilimitado."
              : "Accede a cálculos ilimitados, historial y todas las combinaciones emisor/receptor."}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {requiereCuenta && (
            <div className="rounded-2xl bg-sky-50 ring-1 ring-sky-200 p-4 text-center">
              <p className="text-sm font-bold text-sky-900">Cuenta gratis — próximamente</p>
              <p className="text-xs text-sky-800 mt-1">
                Google o magic link en <strong>/cuenta/login</strong> (Fase 2).
              </p>
              <button
                type="button"
                disabled
                className="mt-3 w-full py-2.5 rounded-xl bg-sky-600/50 text-white text-sm font-bold cursor-not-allowed"
              >
                Crear cuenta (próximamente)
              </button>
            </div>
          )}

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
            Planes Pro — disponibles en Fase 2
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLANES.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-4 ring-1 ${
                  plan.destacado
                    ? "ring-violet-400 bg-violet-50/50 shadow-lg shadow-violet-100"
                    : "ring-slate-200 bg-white"
                }`}
              >
                {plan.destacado && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-violet-600 text-white text-[9px] font-black uppercase tracking-wider">
                    Recomendado
                  </span>
                )}
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  {plan.nombre}
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums">
                  {plan.precio}
                  <span className="text-xs font-bold text-slate-500">{plan.periodo}</span>
                </p>
                {"ahorro" in plan && plan.ahorro ? (
                  <p className="text-[10px] font-bold text-emerald-600">{plan.ahorro}</p>
                ) : (
                  <p className="h-4" />
                )}
                <ul className="mt-3 space-y-1">
                  {plan.bullets.map((b) => (
                    <li key={b} className="text-[11px] text-slate-600 flex gap-1.5">
                      <span className="text-emerald-500 shrink-0">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled
                  className={`mt-4 w-full py-2 rounded-xl text-xs font-black transition cursor-not-allowed opacity-60 ${
                    plan.destacado
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  Próximamente
                </button>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Clientes activos de RDC Contadores tendrán Pro gratis por email en lista blanca.
          </p>

          <button
            type="button"
            onClick={onCerrar}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  );
}

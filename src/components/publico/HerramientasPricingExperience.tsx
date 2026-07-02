"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  ETIQUETAS_HERRAMIENTA,
  formatPrecioMxn,
  PLANES_HERRAMIENTAS,
  PRECIO_HERRAMIENTA_MENSUAL,
  type PlanHerramientasId,
} from "@/lib/herramientas/pricing";
import { HERRAMIENTAS, type HerramientaId } from "@/lib/seo/herramientas-config";

type Props = {
  herramientaDestacada?: HerramientaId;
  compacto?: boolean;
  onCerrar?: () => void;
};

const stripeHabilitado = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function HerramientasPricingExperience({
  herramientaDestacada,
  compacto = false,
  onCerrar,
}: Props) {
  const [herramientaElegida, setHerramientaElegida] = useState<HerramientaId>(
    herramientaDestacada ?? "facturacion"
  );
  const [cargando, setCargando] = useState<PlanHerramientasId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const iniciarPago = useCallback(
    async (planId: PlanHerramientasId) => {
      setError(null);
      setCargando(planId);
      try {
        const res = await fetch("/api/stripe/checkout-herramientas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            herramientaId:
              planId === "herramienta-mensual" ? herramientaElegida : undefined,
          }),
        });
        const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
        if (!res.ok || !data.url) {
          setError(data.error ?? "No se pudo iniciar el pago.");
          return;
        }
        window.location.href = data.url;
      } catch {
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setCargando(null);
      }
    },
    [herramientaElegida]
  );

  const loginNext = encodeURIComponent("/herramientas/pro");

  return (
    <div className={compacto ? "space-y-4" : "space-y-8"}>
      {!compacto && (
        <div className="text-center max-w-xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600">
            Herramientas Pro+
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            El suite fiscal completo, sin límites
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            3 consultas gratis en cada herramienta. Después, elige una sola por{" "}
            {formatPrecioMxn(PRECIO_HERRAMIENTA_MENSUAL)}/mes o desbloquea{" "}
            <strong>todas</strong> con un solo plan.
          </p>
        </div>
      )}

      <div
        className={`grid gap-3 ${
          compacto
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {PLANES_HERRAMIENTAS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-4 ring-1 flex flex-col ${
              plan.destacado
                ? "ring-violet-400 bg-gradient-to-b from-violet-50 to-white shadow-lg shadow-violet-100"
                : "ring-slate-200 bg-white"
            }`}
          >
            {plan.destacado && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-violet-600 text-white text-[9px] font-black uppercase tracking-wider">
                Favorito
              </span>
            )}
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              {plan.nombre}
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums">
              {formatPrecioMxn(plan.precio)}
              <span className="text-xs font-bold text-slate-500">{plan.periodo}</span>
            </p>
            {plan.ahorro ? (
              <p className="text-[10px] font-bold text-emerald-600">{plan.ahorro}</p>
            ) : (
              <p className="h-4" />
            )}

            {plan.id === "herramienta-mensual" && (
              <select
                value={herramientaElegida}
                onChange={(e) =>
                  setHerramientaElegida(e.target.value as HerramientaId)
                }
                className="mt-2 w-full text-[11px] font-semibold rounded-lg border border-slate-200 px-2 py-1.5 bg-slate-50"
              >
                {HERRAMIENTAS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {ETIQUETAS_HERRAMIENTA[h.id]}
                  </option>
                ))}
              </select>
            )}

            <ul className="mt-3 space-y-1 flex-1">
              {plan.bullets.map((b) => (
                <li key={b} className="text-[11px] text-slate-600 flex gap-1.5">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  {b}
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={!stripeHabilitado || cargando !== null}
              onClick={() => void iniciarPago(plan.id)}
              className={`mt-4 w-full py-2.5 rounded-xl text-xs font-black transition disabled:opacity-50 ${
                plan.destacado
                  ? "bg-violet-600 text-white hover:bg-violet-700"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {cargando === plan.id
                ? "Redirigiendo a Stripe…"
                : stripeHabilitado
                  ? "Continuar al pago"
                  : "Próximamente"}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center">
          {error}
        </p>
      )}

      <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">
            ¿Ya eres cliente de RDC Contadores?
          </p>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Inicia sesión en el portal con tu correo registrado. Los clientes activos
            tienen Pro incluido sin costo extra.
          </p>
        </div>
        <Link
          href={`/portal/login?next=${loginNext}`}
          onClick={onCerrar}
          className="shrink-0 inline-flex px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 hover:bg-slate-100 transition"
        >
          Entrar al portal
        </Link>
      </div>

      {!stripeHabilitado && (
        <p className="text-[11px] text-center text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
          Pagos en línea en configuración. Mientras tanto, escríbenos por{" "}
          <Link href="/contacto" className="font-bold underline">
            contacto
          </Link>{" "}
          o WhatsApp.
        </p>
      )}
    </div>
  );
}

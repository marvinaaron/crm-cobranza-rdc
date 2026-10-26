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
import "./herramientas-pro-cine.css";

type Props = {
  herramientaDestacada?: HerramientaId;
  compacto?: boolean;
  ocultarBannerCliente?: boolean;
  onCerrar?: () => void;
};

const stripeHabilitado = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function HerramientasPricingExperience({
  herramientaDestacada,
  compacto = false,
  ocultarBannerCliente = false,
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
        const data = (await res.json()) as {
          ok?: boolean;
          url?: string;
          error?: string;
        };
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
    <div className="hp-xp" data-compact={compacto ? "" : undefined}>
      {!compacto ? (
        <div className="hp-planes-cab">
          <h2>Compara y elige</h2>
          <p>
            3 consultas gratis por calculadora. Luego una sola por{" "}
            <strong>{formatPrecioMxn(PRECIO_HERRAMIENTA_MENSUAL)}/mes</strong> o
            el suite completo.
          </p>
        </div>
      ) : null}

      <div className="hp-grid-planes">
        {PLANES_HERRAMIENTAS.map((plan) => (
          <article
            key={plan.id}
            className="hp-plan"
            data-favorito={plan.destacado ? "" : undefined}
          >
            <p className="hp-plan-nombre">{plan.nombre}</p>
            <p className="hp-plan-precio">
              {formatPrecioMxn(plan.precio)}
              <small>{plan.periodo}</small>
            </p>
            <p className="hp-plan-ahorro">{plan.ahorro ?? "\u00a0"}</p>

            {plan.id === "herramienta-mensual" ? (
              <select
                value={herramientaElegida}
                onChange={(e) =>
                  setHerramientaElegida(e.target.value as HerramientaId)
                }
                aria-label="Elige la herramienta"
              >
                {HERRAMIENTAS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {ETIQUETAS_HERRAMIENTA[h.id]}
                  </option>
                ))}
              </select>
            ) : null}

            <ul>
              {plan.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <button
              type="button"
              className="hp-btn"
              data-chispa={plan.destacado ? "" : undefined}
              data-navy={!plan.destacado ? "" : undefined}
              disabled={!stripeHabilitado || cargando !== null}
              onClick={() => void iniciarPago(plan.id)}
            >
              {cargando === plan.id
                ? "Redirigiendo a Stripe…"
                : stripeHabilitado
                  ? "Continuar al pago"
                  : "Próximamente"}
            </button>
          </article>
        ))}
      </div>

      {error ? <p className="hp-error">{error}</p> : null}

      {!ocultarBannerCliente ? (
        <div className="hp-cliente">
          <div>
            <b>¿Ya eres cliente de RDC Contadores?</b>
            <span>
              Entra al portal con tu correo. Los clientes activos tienen Pro
              incluido, sin costo extra.
            </span>
          </div>
          <Link
            href={`/portal/login?next=${loginNext}`}
            onClick={onCerrar}
            className="hp-btn"
          >
            Entrar al portal
          </Link>
        </div>
      ) : null}

      {!stripeHabilitado ? (
        <p className="hp-aviso-stripe">
          Pagos en línea en configuración. Mientras tanto, escríbenos por{" "}
          <Link href="/contacto">contacto</Link> o WhatsApp.
        </p>
      ) : null}
    </div>
  );
}

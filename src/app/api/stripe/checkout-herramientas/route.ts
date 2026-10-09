import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getPlanHerramientas,
  type PlanHerramientasId,
} from "@/lib/herramientas/pricing";
import { ETIQUETAS_HERRAMIENTA } from "@/lib/herramientas/pricing";
import type { HerramientaId } from "@/lib/seo/herramientas-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function nombreProducto(
  planId: PlanHerramientasId,
  herramientaId?: HerramientaId
): string {
  if (planId === "herramienta-mensual" && herramientaId) {
    return `Pro · ${ETIQUETAS_HERRAMIENTA[herramientaId] ?? herramientaId}`;
  }
  const plan = getPlanHerramientas(planId);
  return `Herramientas Pro · ${plan.nombre}`;
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe no está configurado. Contacta al despacho." },
      { status: 503 }
    );
  }

  let body: {
    planId?: PlanHerramientasId;
    herramientaId?: HerramientaId;
    email?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const planId = body.planId;
  if (
    !planId ||
    !["herramienta-mensual", "bundle-mensual", "bundle-anual", "bundle-lifetime"].includes(
      planId
    )
  ) {
    return NextResponse.json({ error: "Plan no válido." }, { status: 400 });
  }

  if (planId === "herramienta-mensual" && !body.herramientaId) {
    return NextResponse.json(
      { error: "Elige qué herramienta quieres desbloquear." },
      { status: 400 }
    );
  }

  const plan = getPlanHerramientas(planId);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const producto = nombreProducto(planId, body.herramientaId);
  const centavos = Math.round(plan.precio * 100);

  const metadata: Record<string, string> = {
    tipo: "herramientas_pro",
    planId,
    ...(body.herramientaId ? { herramientaId: body.herramientaId } : {}),
  };

  const lineItem = {
    quantity: 1,
    price_data: {
      currency: "mxn" as const,
      unit_amount: centavos,
      product_data: {
        name: producto,
        description:
          planId === "herramienta-mensual"
            ? "Suscripción mensual a una herramienta fiscal RDC"
            : "Acceso Pro a herramientas fiscales RDC Contadores",
      },
      ...(plan.stripeMode === "subscription" && plan.stripeInterval
        ? { recurring: { interval: plan.stripeInterval as "month" | "year" } }
        : {}),
    },
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: plan.stripeMode,
      line_items: [lineItem],
      success_url: `${appUrl}/herramientas/pro/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/herramientas/pro?cancelado=1`,
      customer_email: body.email?.trim() || undefined,
      metadata,
      ...(plan.stripeMode === "subscription"
        ? { subscription_data: { metadata } }
        : {}),
    });

    return NextResponse.json({ ok: true, url: session.url, id: session.id });
  } catch (err) {
    console.error("[stripe/checkout-herramientas]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "No se pudo iniciar el pago con Stripe.",
      },
      { status: 500 }
    );
  }
}

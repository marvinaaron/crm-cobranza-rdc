import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { calcularCobroHonorarios } from "@/lib/stripe-honorarios";
import { periodoLabel } from "@/lib/clientes";
import type { PagoHonorarioStripe } from "@/lib/stripe-checkout-types";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function normalizarPagos(
  body: {
    mes?: number;
    anio?: number;
    montoHonorarios?: number;
    pagos?: PagoHonorarioStripe[];
  }
): PagoHonorarioStripe[] | null {
  if (Array.isArray(body.pagos) && body.pagos.length > 0) {
    const validos = body.pagos.filter(
      (p) =>
        p?.periodo &&
        Number.isFinite(p.periodo.mes) &&
        Number.isFinite(p.periodo.anio) &&
        Number.isFinite(p.montoHonorarios) &&
        p.montoHonorarios > 0
    );
    return validos.length > 0 ? validos : null;
  }

  const mes = Number(body.mes);
  const anio = Number(body.anio);
  const monto = Number(body.montoHonorarios);
  if (!Number.isFinite(mes) || !Number.isFinite(anio) || !Number.isFinite(monto) || monto <= 0) {
    return null;
  }
  return [{ periodo: { mes, anio }, montoHonorarios: monto }];
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe no está configurado en el servidor." },
      { status: 503 }
    );
  }

  let body: {
    clienteId?: number;
    mes?: number;
    anio?: number;
    montoHonorarios?: number;
    razonSocial?: string;
    pagos?: PagoHonorarioStripe[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const clienteId = Number(body.clienteId);
  const razonSocial = String(body.razonSocial ?? "Cliente").slice(0, 200);
  const pagos = normalizarPagos(body);

  if (!Number.isFinite(clienteId) || !pagos) {
    return NextResponse.json({ error: "Datos de pago incompletos." }, { status: 400 });
  }

  const montoTotalHonorarios = Math.round(
    pagos.reduce((s, p) => s + p.montoHonorarios, 0) * 100
  ) / 100;
  const desglose = calcularCobroHonorarios(montoTotalHonorarios);

  if (desglose.centavosTotal < 1000) {
    return NextResponse.json(
      { error: "El monto mínimo para pago con tarjeta es $10.00 MXN." },
      { status: 400 }
    );
  }

  const esMulti = pagos.length > 1;
  const periodoPrincipal = pagos[pagos.length - 1].periodo;
  const tituloHonorarios = esMulti
    ? `Honorarios pendientes (${pagos.length} meses)`
    : `Honorarios — ${periodoLabel(periodoPrincipal)}`;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

  const metadata: Record<string, string> = {
    clienteId: String(clienteId),
    montoHonorarios: String(desglose.montoHonorarios),
    comision: String(desglose.comision),
    total: String(desglose.total),
    tipo: esMulti ? "multi" : "single",
    pagos: JSON.stringify(
      pagos.map((p) => ({
        mes: p.periodo.mes,
        anio: p.periodo.anio,
        monto: p.montoHonorarios,
      }))
    ),
  };

  if (!esMulti) {
    metadata.mes = String(periodoPrincipal.mes);
    metadata.anio = String(periodoPrincipal.anio);
  }

  try {
    const baseSession: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      currency: "mxn",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "mxn",
            unit_amount: desglose.centavosHonorarios,
            product_data: {
              name: tituloHonorarios,
              description: razonSocial,
            },
          },
        },
        {
          quantity: 1,
          price_data: {
            currency: "mxn",
            unit_amount: desglose.centavosComision,
            product_data: {
              name: "Comisión plataforma de pago (3%)",
              description: "Cargo por pago con tarjeta en línea",
            },
          },
        },
      ],
      metadata,
    };

    const session = await stripe.checkout.sessions.create({
      ...baseSession,
      success_url: `${appUrl}/portal/honorarios?stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/portal/honorarios?stripe_cancelado=1`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "No se pudo crear la sesión de pago." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const detalle =
      err instanceof Error && err.message ? err.message : "Error desconocido";
    const esStripe =
      typeof err === "object" &&
      err !== null &&
      "type" in err &&
      String((err as { type?: string }).type).startsWith("Stripe");
    return NextResponse.json(
      {
        error: esStripe
          ? `Stripe: ${detalle}`
          : "No se pudo conectar con Stripe. Verifique STRIPE_SECRET_KEY en .env.local y reinicie el servidor.",
      },
      { status: 500 }
    );
  }
}

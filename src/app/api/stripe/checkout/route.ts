import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { calcularCobroHonorarios } from "@/lib/stripe-honorarios";
import { periodoLabel, type Periodo } from "@/lib/clientes";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
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
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const clienteId = Number(body.clienteId);
  const mes = Number(body.mes);
  const anio = Number(body.anio);
  const montoHonorarios = Number(body.montoHonorarios);
  const razonSocial = String(body.razonSocial ?? "Cliente").slice(0, 200);

  if (
    !Number.isFinite(clienteId) ||
    !Number.isFinite(mes) ||
    !Number.isFinite(anio) ||
    !Number.isFinite(montoHonorarios) ||
    montoHonorarios <= 0
  ) {
    return NextResponse.json({ error: "Datos de pago incompletos." }, { status: 400 });
  }

  const periodo: Periodo = { mes, anio };
  const desglose = calcularCobroHonorarios(montoHonorarios);

  if (desglose.centavosTotal < 1000) {
    return NextResponse.json(
      { error: "El monto mínimo para pago con tarjeta es $10.00 MXN." },
      { status: 400 }
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "mxn",
      payment_method_types: ["card"],
      customer_email: undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "mxn",
            unit_amount: desglose.centavosHonorarios,
            product_data: {
              name: `Honorarios — ${periodoLabel(periodo)}`,
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
      metadata: {
        clienteId: String(clienteId),
        mes: String(mes),
        anio: String(anio),
        montoHonorarios: String(desglose.montoHonorarios),
        comision: String(desglose.comision),
        total: String(desglose.total),
      },
      success_url: `${appUrl}/portal/honorarios?stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/portal/honorarios?stripe_cancelado=1`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "No se pudo crear la sesión de pago." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: "Error al conectar con Stripe. Revise las llaves en .env.local." },
      { status: 500 }
    );
  }
}

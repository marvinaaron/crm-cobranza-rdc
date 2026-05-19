import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function GET(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe no está configurado en el servidor." },
      { status: 503 }
    );
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Falta session_id." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "El pago aún no está confirmado.", paymentStatus: session.payment_status },
        { status: 402 }
      );
    }

    const meta = session.metadata ?? {};
    const clienteId = Number(meta.clienteId);
    const mes = Number(meta.mes);
    const anio = Number(meta.anio);
    const montoHonorarios = Number(meta.montoHonorarios);

    if (
      !Number.isFinite(clienteId) ||
      !Number.isFinite(mes) ||
      !Number.isFinite(anio) ||
      !Number.isFinite(montoHonorarios)
    ) {
      return NextResponse.json({ error: "Metadatos de sesión inválidos." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      sessionId,
      clienteId,
      periodo: { mes, anio },
      montoHonorarios,
      comision: Number(meta.comision) || 0,
      total: Number(meta.total) || session.amount_total! / 100,
    });
  } catch (err) {
    console.error("[stripe/verificar]", err);
    return NextResponse.json({ error: "No se pudo verificar el pago." }, { status: 500 });
  }
}

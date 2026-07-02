import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { activarProHerramientasPorEmail } from "@/lib/herramientas/pro-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

/** Confirma pago de herramientas Pro y activa el correo. */
export async function GET(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe no configurado." },
      { status: 503 }
    );
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Falta session_id." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.tipo !== "herramientas_pro") {
      return NextResponse.json({ error: "Sesión no válida." }, { status: 400 });
    }

    const pagado =
      session.payment_status === "paid" ||
      session.status === "complete";

    if (!pagado) {
      return NextResponse.json({
        ok: false,
        pagado: false,
        estado: session.payment_status,
      });
    }

    const email =
      session.customer_details?.email ??
      session.customer_email ??
      null;

    if (email) {
      await activarProHerramientasPorEmail(email, {
        planId: session.metadata.planId,
      });
    }

    return NextResponse.json({
      ok: true,
      pagado: true,
      email,
      planId: session.metadata.planId,
    });
  } catch (err) {
    console.error("[stripe/verificar-herramientas]", err);
    return NextResponse.json(
      { error: "No se pudo verificar el pago." },
      { status: 500 }
    );
  }
}

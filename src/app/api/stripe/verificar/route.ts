import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import type { Periodo } from "@/lib/clientes";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

type PagoMeta = { mes: number; anio: number; monto: number };

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
    const montoHonorarios = Number(meta.montoHonorarios);

    if (!Number.isFinite(clienteId) || !Number.isFinite(montoHonorarios)) {
      return NextResponse.json({ error: "Metadatos de sesión inválidos." }, { status: 500 });
    }

    let pagos: { periodo: Periodo; montoHonorarios: number }[] = [];

    try {
      const parsed = JSON.parse(meta.pagos ?? "[]") as PagoMeta[];
      if (Array.isArray(parsed)) {
        pagos = parsed
          .filter(
            (p) =>
              Number.isFinite(p.mes) &&
              Number.isFinite(p.anio) &&
              Number.isFinite(p.monto) &&
              p.monto > 0
          )
          .map((p) => ({
            periodo: { mes: p.mes, anio: p.anio },
            montoHonorarios: p.monto,
          }));
      }
    } catch {
      pagos = [];
    }

    if (pagos.length === 0 && meta.tipo !== "multi") {
      const mes = Number(meta.mes);
      const anio = Number(meta.anio);
      if (Number.isFinite(mes) && Number.isFinite(anio)) {
        pagos = [{ periodo: { mes, anio }, montoHonorarios }];
      }
    }

    if (pagos.length === 0) {
      return NextResponse.json({ error: "No se encontraron periodos en el pago." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      sessionId,
      clienteId,
      montoHonorarios,
      pagos,
      comision: Number(meta.comision) || 0,
      total: Number(meta.total) || session.amount_total! / 100,
    });
  } catch (err) {
    console.error("[stripe/verificar]", err);
    return NextResponse.json({ error: "No se pudo verificar el pago." }, { status: 500 });
  }
}

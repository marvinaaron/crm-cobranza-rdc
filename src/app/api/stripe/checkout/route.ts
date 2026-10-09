import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { calcularCobroHonorarios, STRIPE_TARIFA_FIJO_MXN, STRIPE_TARIFA_PCT } from "@/lib/stripe-honorarios";
import { periodoLabel } from "@/lib/clientes";
import type {
  PagoHonorarioStripe,
  PagoExtraStripe,
} from "@/lib/stripe-checkout-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function normalizarExtra(extra?: PagoExtraStripe): PagoExtraStripe | null {
  if (
    !extra ||
    typeof extra.extraEsperadoId !== "string" ||
    !extra.extraEsperadoId ||
    !Number.isFinite(extra.monto) ||
    extra.monto <= 0 ||
    !Number.isFinite(extra.mes) ||
    !Number.isFinite(extra.anio)
  ) {
    return null;
  }
  return {
    extraEsperadoId: extra.extraEsperadoId,
    concepto: String(extra.concepto ?? "Trabajo adicional").slice(0, 120),
    monto: extra.monto,
    mes: extra.mes,
    anio: extra.anio,
  };
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
    extra?: PagoExtraStripe;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const clienteId = Number(body.clienteId);
  const razonSocial = String(body.razonSocial ?? "Cliente").slice(0, 200);
  const extra = normalizarExtra(body.extra);
  // Si viene `extra`, el pago es un abono a un trabajo adicional. Si no,
  // es el flujo normal de honorarios (uno o varios meses).
  const pagos = extra
    ? [{ periodo: { mes: extra.mes, anio: extra.anio }, montoHonorarios: extra.monto }]
    : normalizarPagos(body);

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

  const esMulti = !extra && pagos.length > 1;
  const periodoPrincipal = pagos[pagos.length - 1].periodo;
  const tituloHonorarios = extra
    ? `Trabajo adicional — ${extra.concepto}`
    : esMulti
      ? `Honorarios pendientes (${pagos.length} meses)`
      : `Honorarios — ${periodoLabel(periodoPrincipal)}`;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

  const metadata: Record<string, string> = {
    clienteId: String(clienteId),
    montoHonorarios: String(desglose.montoHonorarios),
    comision: String(desglose.comision),
    comisionStripe: String(desglose.comisionStripe),
    ivaStripe: String(desglose.ivaStripe),
    total: String(desglose.total),
    tipo: extra ? "extra" : esMulti ? "multi" : "single",
    pagos: JSON.stringify(
      pagos.map((p) => ({
        mes: p.periodo.mes,
        anio: p.periodo.anio,
        monto: p.montoHonorarios,
      }))
    ),
  };

  if (extra) {
    metadata.extraEsperadoId = extra.extraEsperadoId;
    metadata.extraConcepto = extra.concepto;
    metadata.mes = String(extra.mes);
    metadata.anio = String(extra.anio);
  } else if (!esMulti) {
    metadata.mes = String(periodoPrincipal.mes);
    metadata.anio = String(periodoPrincipal.anio);
  }

  try {
    const pctLabel = (STRIPE_TARIFA_PCT * 100).toFixed(1).replace(/\.0$/, "");
    const lineItems = [
      {
        quantity: 1,
        price_data: {
          currency: "mxn" as const,
          unit_amount: desglose.centavosHonorarios,
          product_data: {
            name: tituloHonorarios,
            description: razonSocial,
          },
        },
      },
    ];

    if (desglose.centavosComisionStripe > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "mxn" as const,
          unit_amount: desglose.centavosComisionStripe,
          product_data: {
            name: "Comisión Stripe",
            description: `${pctLabel}% + $${STRIPE_TARIFA_FIJO_MXN} MXN`,
          },
        },
      });
    }

    if (desglose.centavosIvaStripe > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "mxn" as const,
          unit_amount: desglose.centavosIvaStripe,
          product_data: {
            name: "IVA (16%)",
            description: "Sobre la comisión de Stripe",
          },
        },
      });
    }

    const ajusteCent =
      desglose.centavosComision -
      desglose.centavosComisionStripe -
      desglose.centavosIvaStripe;
    if (ajusteCent > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "mxn" as const,
          unit_amount: ajusteCent,
          product_data: {
            name: "Ajuste redondeo",
            description: "Ajuste mínimo para cubrir comisiones",
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "mxn",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata,
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

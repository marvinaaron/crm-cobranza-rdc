import { NextResponse } from "next/server";
import { guardarSiteLead } from "@/lib/site-leads-db";
import {
  ipDeRequest,
  ipExcedioLimite,
  validarLeadPublico,
} from "@/lib/leads-publicos";

export const dynamic = "force-dynamic";

/**
 * POST /api/publico/empezar
 * Registra un prospecto desde /empezar u otros formularios públicos.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const validado = validarLeadPublico(body);
  if (!validado.ok) {
    // Honeypot / relleno instantáneo: fingimos éxito para no entrenar al bot.
    if (validado.error === "honeypot") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: validado.error }, { status: 400 });
  }

  const ip = ipDeRequest(req);
  if (ipExcedioLimite(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta más tarde o escríbenos por WhatsApp." },
      { status: 429 }
    );
  }

  const resultado = await guardarSiteLead(validado.data);

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}

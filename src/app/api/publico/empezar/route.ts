import { NextResponse } from "next/server";
import { guardarSiteLead } from "@/lib/site-leads-db";

export const dynamic = "force-dynamic";

type Body = {
  nombre?: string;
  email?: string;
  telefono?: string;
  mensaje?: string;
  fuente?: string;
};

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/publico/empezar
 * Registra un prospecto desde /empezar u otros formularios públicos.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const nombre = body.nombre?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const telefono = body.telefono?.trim();
  const mensaje = body.mensaje?.trim();
  const fuente = body.fuente?.trim() || "empezar";

  if (nombre.length < 2) {
    return NextResponse.json({ error: "Indica tu nombre." }, { status: 400 });
  }
  if (!emailValido(email)) {
    return NextResponse.json({ error: "Correo electrónico inválido." }, { status: 400 });
  }

  const resultado = await guardarSiteLead({
    nombre,
    email,
    telefono,
    mensaje,
    fuente,
  });

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}

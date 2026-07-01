import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_VISITOR,
  nuevoVisitorId,
} from "@/lib/herramientas/facturacion-uso";
import { obtenerEstadoUso } from "@/lib/herramientas/facturacion-uso-db";

export const dynamic = "force-dynamic";

/**
 * GET /api/herramientas/facturacion/uso
 * Devuelve cuántas consultas gratis le quedan al visitante.
 */
export async function GET() {
  const jar = await cookies();
  let visitorId = jar.get(COOKIE_VISITOR)?.value;
  const nuevo = !visitorId;
  if (!visitorId) visitorId = nuevoVisitorId();

  const estado = await obtenerEstadoUso(visitorId);
  const res = NextResponse.json({ ...estado, nuevoVisitante: nuevo });
  if (nuevo) {
    res.cookies.set(COOKIE_VISITOR, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
  }
  return res;
}

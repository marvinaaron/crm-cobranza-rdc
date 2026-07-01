import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  calcularFacturacionDesdeNeto,
  formatearDesgloseTexto,
  type EntradaFacturacionNeto,
} from "@/lib/fiscal/facturacion-neto";
import {
  COOKIE_VISITOR,
  nuevoVisitorId,
} from "@/lib/herramientas/facturacion-uso";
import {
  obtenerEstadoUso,
  registrarCalculo,
} from "@/lib/herramientas/facturacion-uso-db";
import type {
  RegimenEmisor,
  TipoEmisor,
  TipoOperacion,
  TipoReceptor,
} from "@/lib/fiscal/facturacion-tablas";

export const dynamic = "force-dynamic";

type BodyCalcular = {
  emisor?: TipoEmisor;
  regimen?: RegimenEmisor;
  receptor?: TipoReceptor;
  operacion?: TipoOperacion;
  netoDeseado?: number;
  ivaFrontera?: boolean;
  agapesExento?: boolean;
};

const OPERACIONES: TipoOperacion[] = [
  "honorarios",
  "venta_bienes",
  "arrendamiento_domestico",
  "arrendamiento_amueblado",
  "arrendamiento_comercial",
  "comisionista",
  "autotransporte",
  "agapes",
];

function parseBody(body: BodyCalcular): EntradaFacturacionNeto | { error: string } {
  const emisor = body.emisor === "pm" ? "pm" : body.emisor === "pf" ? "pf" : null;
  const receptor =
    body.receptor === "pf" ? "pf" : body.receptor === "pm" ? "pm" : null;
  const operacion = OPERACIONES.includes(body.operacion as TipoOperacion)
    ? (body.operacion as TipoOperacion)
    : null;
  const neto = Number(body.netoDeseado);

  if (!emisor) return { error: "Indica si el emisor es persona física o moral." };
  if (!receptor) return { error: "Indica si el receptor es persona física o moral." };
  if (!operacion) return { error: "Selecciona un tipo de operación." };
  if (!Number.isFinite(neto) || neto <= 0) {
    return { error: "El neto deseado debe ser mayor a cero." };
  }

  let regimen: RegimenEmisor | undefined;
  if (emisor === "pf") {
    if (body.regimen === "resico" || body.regimen === "pfae") {
      regimen = body.regimen;
    } else {
      return { error: "Selecciona régimen RESICO o PFAE." };
    }
  }

  return {
    emisor,
    regimen,
    receptor,
    operacion,
    netoDeseado: neto,
    ivaFrontera: body.ivaFrontera === true,
    agapesExento: body.agapesExento === true,
  };
}

/**
 * POST /api/herramientas/facturacion/calcular
 * Calcula desglose y registra uso freemium.
 */
export async function POST(req: Request) {
  const jar = await cookies();
  let visitorId = jar.get(COOKIE_VISITOR)?.value;
  const setCookie = !visitorId;
  if (!visitorId) visitorId = nuevoVisitorId();

  let body: BodyCalcular;
  try {
    body = (await req.json()) as BodyCalcular;
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido." }, { status: 400 });
  }

  const entrada = parseBody(body);
  if ("error" in entrada) {
    return NextResponse.json({ error: entrada.error }, { status: 400 });
  }

  const estadoAntes = await obtenerEstadoUso(visitorId);
  if (!estadoAntes.puedeCalcular) {
    return NextResponse.json(
      {
        error: estadoAntes.requiereCuenta
          ? "Usaste tus 3 consultas gratis. Crea cuenta para 1 extra o desbloquea Pro."
          : "Desbloquea Pro para seguir calculando.",
        uso: estadoAntes,
        bloqueado: true,
      },
      { status: 402 }
    );
  }

  const resultado = calcularFacturacionDesdeNeto(entrada);
  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: 400 });
  }

  const estadoDespues = await registrarCalculo(visitorId);

  const res = NextResponse.json({
    resultado: {
      ...resultado,
      textoCopiar: formatearDesgloseTexto(resultado),
    },
    uso: estadoDespues,
  });

  if (setCookie) {
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

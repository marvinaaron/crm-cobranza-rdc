import { NextResponse } from "next/server";
import {
  DIVISAS_FALLBACK,
  MONEDAS_ORDEN,
  type CodigoMoneda,
  type RespuestaDivisas,
  type TasaDivisa,
} from "@/lib/fiscal/divisas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RespuestaFrankfurter = {
  amount?: number;
  base?: string;
  date?: string;
  rates?: Partial<Record<string, number>>;
};

/**
 * Frankfurter devuelve tasas con base = una sola moneda. Le pedimos
 * base=MXN y nos da MXN→X. Para mostrar "1 X = N MXN" invertimos: 1/rate.
 */
function invertir(rate: number | undefined): number | null {
  if (!rate || !Number.isFinite(rate)) return null;
  return 1 / rate;
}

function diaAnteriorHabil(fechaIso: string): string {
  // Frankfurter trabaja con días hábiles BCE. Para variación contra el día
  // hábil previo intentamos restar 1; si la API regresa la fecha más
  // reciente, eso ya es suficiente para tener algo razonable.
  const d = new Date(`${fechaIso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  // Si cae sábado/domingo, retrocede al viernes.
  if (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() - 2);
  if (d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function pedirFrankfurter(fechaPath: string, symbols: string) {
  const url = `https://api.frankfurter.app/${fechaPath}?from=MXN&to=${symbols}`;
  const resp = await fetch(url, { next: { revalidate: 60 * 30 } });
  if (!resp.ok) return null;
  return (await resp.json()) as RespuestaFrankfurter;
}

export async function GET() {
  const symbols = MONEDAS_ORDEN.join(",");
  try {
    const actual = await pedirFrankfurter("latest", symbols);
    if (!actual?.rates || !actual.date) {
      return NextResponse.json(DIVISAS_FALLBACK, {
        headers: { "Cache-Control": "public, s-maxage=600" },
      });
    }

    const fechaPrev = diaAnteriorHabil(actual.date);
    const previo = await pedirFrankfurter(fechaPrev, symbols);

    const tasas: TasaDivisa[] = MONEDAS_ORDEN.map((codigo: CodigoMoneda) => {
      const ratioActual = actual.rates?.[codigo];
      const ratioPrev = previo?.rates?.[codigo];
      const valorMxn = invertir(ratioActual);
      const valorPrev = invertir(ratioPrev);

      const variacion = valorMxn !== null && valorPrev !== null ? valorMxn - valorPrev : null;
      const variacionPct =
        valorMxn !== null && valorPrev !== null && valorPrev !== 0
          ? ((valorMxn - valorPrev) / valorPrev) * 100
          : null;

      return {
        codigo,
        valorMxn: valorMxn ?? 0,
        variacion,
        variacionPct,
      };
    });

    const respuesta: RespuestaDivisas = {
      base: "MXN",
      fecha: actual.date,
      fuente: "BCE",
      actualizadoEn: new Date(actual.date).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      tasas,
    };

    return NextResponse.json(respuesta, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(DIVISAS_FALLBACK, {
      headers: { "Cache-Control": "public, s-maxage=300" },
    });
  }
}

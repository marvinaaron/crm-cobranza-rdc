import { NextResponse } from "next/server";
import { obtenerIndicadoresBanxico } from "@/lib/fiscal/banxico";
import {
  MERCADOS_FALLBACK,
  MONEDAS_ORDEN,
  type CodigoMoneda,
  type IndicadorMercado,
  type PuntoHistorial,
  type RespuestaMercados,
  type TasaActivo,
  normalizarSparkline,
} from "@/lib/fiscal/divisas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RespuestaFrankfurter = {
  date?: string;
  rates?: Partial<Record<string, number>>;
};

type FrankfurterRango = {
  rates?: Record<string, Record<string, number>>;
};

type CoinGeckoSimple = {
  bitcoin?: { mxn?: number; mxn_24h_change?: number };
  "tether-gold"?: { mxn?: number; mxn_24h_change?: number };
};

function invertir(rate: number | undefined): number | null {
  if (!rate || !Number.isFinite(rate)) return null;
  return 1 / rate;
}

function diaAnteriorHabil(fechaIso: string): string {
  const d = new Date(`${fechaIso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  if (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() - 2);
  if (d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function haceDias(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function pedirFrankfurter(path: string, symbols: string) {
  const url = `https://api.frankfurter.app/${path}?from=MXN&to=${symbols}`;
  const resp = await fetch(url, { next: { revalidate: 60 * 30 } });
  if (!resp.ok) return null;
  return (await resp.json()) as RespuestaFrankfurter;
}

async function pedirHistorialUsd(): Promise<PuntoHistorial[]> {
  const ini = haceDias(45);
  const fin = new Date().toISOString().slice(0, 10);
  const url = `https://api.frankfurter.app/${ini}..${fin}?from=USD&to=MXN`;
  try {
    const resp = await fetch(url, { next: { revalidate: 60 * 60 } });
    if (!resp.ok) return [];
    const data = (await resp.json()) as FrankfurterRango;
    const rates = data.rates ?? {};
    const puntos: PuntoHistorial[] = [];
    for (const [fecha, obj] of Object.entries(rates)) {
      const v = obj.MXN;
      if (v && Number.isFinite(v)) puntos.push({ fecha, valor: v });
    }
    puntos.sort((a, b) => a.fecha.localeCompare(b.fecha));
    return puntos.slice(-30);
  } catch {
    return [];
  }
}

async function pedirCoinGecko(): Promise<{
  btc: { valor: number; variacionPct: number | null };
  xau: { valor: number; variacionPct: number | null };
  fuente: "CoinGecko" | "fallback";
}> {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether-gold&vs_currencies=mxn&include_24hr_change=true";
  try {
    const resp = await fetch(url, { next: { revalidate: 60 * 15 } });
    if (!resp.ok) {
      const fb = MERCADOS_FALLBACK.activos;
      return {
        btc: { valor: fb.find((a) => a.id === "BTC")!.valor, variacionPct: null },
        xau: { valor: fb.find((a) => a.id === "XAU")!.valor, variacionPct: null },
        fuente: "fallback",
      };
    }
    const data = (await resp.json()) as CoinGeckoSimple;
    return {
      btc: {
        valor: data.bitcoin?.mxn ?? 0,
        variacionPct: data.bitcoin?.mxn_24h_change ?? null,
      },
      xau: {
        valor: data["tether-gold"]?.mxn ?? 0,
        variacionPct: data["tether-gold"]?.mxn_24h_change ?? null,
      },
      fuente: "CoinGecko",
    };
  } catch {
    const fb = MERCADOS_FALLBACK.activos;
    return {
      btc: { valor: fb.find((a) => a.id === "BTC")!.valor, variacionPct: null },
      xau: { valor: fb.find((a) => a.id === "XAU")!.valor, variacionPct: null },
      fuente: "fallback",
    };
  }
}

function sparklineDesdeHistorial(puntos: number[]): number[] {
  return normalizarSparkline(puntos);
}

export async function GET() {
  const symbols = MONEDAS_ORDEN.join(",");

  try {
    const [actualFx, banxico, crypto, historialUsd] = await Promise.all([
      pedirFrankfurter("latest", symbols),
      obtenerIndicadoresBanxico(),
      pedirCoinGecko(),
      pedirHistorialUsd(),
    ]);

    const fecha = actualFx?.date ?? new Date().toISOString().slice(0, 10);
    const fechaPrev = diaAnteriorHabil(fecha);
    const previoFx = actualFx ? await pedirFrankfurter(fechaPrev, symbols) : null;

    const usdFix = banxico.indicadores.find((i) => i.id === "USD_FIX")?.valor ?? null;

    const activosForex: TasaActivo[] = MONEDAS_ORDEN.map((codigo: CodigoMoneda) => {
      const ratioActual = actualFx?.rates?.[codigo];
      const ratioPrev = previoFx?.rates?.[codigo];
      let valorMxn = invertir(ratioActual);
      const valorPrev = invertir(ratioPrev);

      if (codigo === "USD" && usdFix !== null) {
        valorMxn = usdFix;
      }

      const variacion =
        valorMxn !== null && valorPrev !== null ? valorMxn - valorPrev : null;
      const variacionPct =
        valorMxn !== null && valorPrev !== null && valorPrev !== 0
          ? ((valorMxn - valorPrev) / valorPrev) * 100
          : null;

      const sparkVals =
        codigo === "USD" && historialUsd.length
          ? historialUsd.map((p) => p.valor)
          : valorMxn !== null
          ? [valorMxn]
          : [];

      return {
        id: codigo,
        valor: valorMxn ?? 0,
        unidad: "MXN",
        variacion,
        variacionPct,
        sparkline: sparklineDesdeHistorial(sparkVals),
      };
    });

    const wtiFallback = MERCADOS_FALLBACK.activos.find((a) => a.id === "WTI")!;

    const activosExtra: TasaActivo[] = [
      {
        id: "BTC",
        valor: crypto.btc.valor,
        unidad: "MXN",
        variacion: null,
        variacionPct: crypto.btc.variacionPct,
        sparkline: sparklineDesdeHistorial([crypto.btc.valor * 0.97, crypto.btc.valor]),
      },
      {
        id: "XAU",
        valor: crypto.xau.valor,
        unidad: "MXN",
        variacion: null,
        variacionPct: crypto.xau.variacionPct,
        sparkline: sparklineDesdeHistorial([crypto.xau.valor * 0.99, crypto.xau.valor]),
      },
      {
        id: "WTI",
        valor: wtiFallback.valor,
        unidad: "USD/bbl",
        variacion: null,
        variacionPct: null,
        sparkline: [],
      },
    ];

    const indicadores: IndicadorMercado[] = banxico.indicadores.map((i) => ({
      id: i.id,
      etiqueta: i.etiqueta,
      valor: i.valor,
      unidad: i.unidad,
      variacionPct: i.variacionPct,
    }));

    if (!indicadores.some((i) => i.id === "USD_FIX")) {
      const usdTasa = activosForex.find((a) => a.id === "USD");
      if (usdTasa) {
        indicadores.unshift({
          id: "USD_FIX",
          etiqueta: "USD FIX",
          valor: usdTasa.valor,
          unidad: "MXN",
          variacionPct: usdTasa.variacionPct,
        });
      }
    }

    indicadores.push({
      id: "WTI",
      etiqueta: "WTI",
      valor: wtiFallback.valor,
      unidad: "USD/bbl",
      variacionPct: null,
    });

    const respuesta: RespuestaMercados = {
      fecha,
      actualizadoEn: new Date(fecha).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      activos: [...activosForex, ...activosExtra],
      indicadores,
      historialUsd,
      usdFix,
      fuentes: {
        divisas: banxico.fuente === "Banxico" && usdFix ? "Banxico" : actualFx ? "BCE" : "fallback",
        banxico: banxico.fuente,
        crypto: crypto.fuente,
      },
    };

    return NextResponse.json(respuesta, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(MERCADOS_FALLBACK, {
      headers: { "Cache-Control": "public, s-maxage=300" },
    });
  }
}

/**
 * Indicadores del Sistema de Información Económica (SIE) de Banxico.
 *
 * Token gratuito: https://www.banxico.org.mx/SieAPIRest/
 * Variable de entorno: BANXICO_TOKEN
 */

export const SERIES_BANXICO = {
  /** Tipo de cambio FIX (DOF). */
  USD_FIX: "SF43718",
  UDI: "SP68257",
  TIIE_28: "SF60648",
} as const;

type DatoBanxico = {
  fecha: string;
  dato: string;
};

type RespuestaOportuno = {
  bmx?: {
    series?: Array<{
      idSerie?: string;
      titulo?: string;
      datos?: DatoBanxico[];
    }>;
  };
};

export type IndicadorBanxico = {
  id: keyof typeof SERIES_BANXICO;
  etiqueta: string;
  valor: number;
  unidad: string;
  variacionPct: number | null;
};

const FALLBACK_INDICADORES: IndicadorBanxico[] = [
  { id: "USD_FIX", etiqueta: "USD FIX", valor: 17.23, unidad: "MXN", variacionPct: null },
  { id: "UDI", etiqueta: "UDI", valor: 8.1234, unidad: "UDI", variacionPct: null },
  { id: "TIIE_28", etiqueta: "TIIE 28D", valor: 10.5, unidad: "%", variacionPct: null },
];

function parseValor(dato: string): number | null {
  const n = Number(dato.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function variacionPct(actual: number, anterior: number | null): number | null {
  if (anterior === null || anterior === 0) return null;
  return ((actual - anterior) / anterior) * 100;
}

export async function obtenerIndicadoresBanxico(): Promise<{
  indicadores: IndicadorBanxico[];
  fuente: "Banxico" | "fallback";
}> {
  const token = process.env.BANXICO_TOKEN;
  if (!token) {
    return { indicadores: FALLBACK_INDICADORES, fuente: "fallback" };
  }

  const ids = Object.values(SERIES_BANXICO).join(",");
  const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${ids}/datos/oportuno`;

  try {
    const resp = await fetch(url, {
      headers: { "Bmx-Token": token },
      next: { revalidate: 60 * 60 },
    });

    if (!resp.ok) {
      return { indicadores: FALLBACK_INDICADORES, fuente: "fallback" };
    }

    const data = (await resp.json()) as RespuestaOportuno;
    const series = data.bmx?.series ?? [];

    const mapEtiqueta: Record<string, keyof typeof SERIES_BANXICO> = {
      [SERIES_BANXICO.USD_FIX]: "USD_FIX",
      [SERIES_BANXICO.UDI]: "UDI",
      [SERIES_BANXICO.TIIE_28]: "TIIE_28",
    };

    const labels: Record<keyof typeof SERIES_BANXICO, { etiqueta: string; unidad: string }> = {
      USD_FIX: { etiqueta: "USD FIX", unidad: "MXN" },
      UDI: { etiqueta: "UDI", unidad: "UDI" },
      TIIE_28: { etiqueta: "TIIE 28D", unidad: "%" },
    };

    const indicadores: IndicadorBanxico[] = [];

    for (const s of series) {
      const idSerie = s.idSerie ?? "";
      const key = mapEtiqueta[idSerie];
      if (!key) continue;
      const datos = s.datos ?? [];
      if (datos.length === 0) continue;
      const ultimo = datos[datos.length - 1];
      const penultimo = datos.length > 1 ? datos[datos.length - 2] : null;
      const valor = parseValor(ultimo.dato);
      if (valor === null) continue;
      const valorPrev = penultimo ? parseValor(penultimo.dato) : null;
      indicadores.push({
        id: key,
        etiqueta: labels[key].etiqueta,
        valor,
        unidad: labels[key].unidad,
        variacionPct: variacionPct(valor, valorPrev),
      });
    }

    if (indicadores.length === 0) {
      return { indicadores: FALLBACK_INDICADORES, fuente: "fallback" };
    }

    // Asegurar orden consistente
    const orden: (keyof typeof SERIES_BANXICO)[] = ["USD_FIX", "UDI", "TIIE_28"];
    const ordenados = orden
      .map((k) => indicadores.find((i) => i.id === k))
      .filter((i): i is IndicadorBanxico => !!i);

    return {
      indicadores: ordenados.length ? ordenados : FALLBACK_INDICADORES,
      fuente: "Banxico",
    };
  } catch {
    return { indicadores: FALLBACK_INDICADORES, fuente: "fallback" };
  }
}

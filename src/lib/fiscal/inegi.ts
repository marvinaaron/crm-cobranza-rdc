/**
 * Cliente para la API del Banco de Información Económica (BIE) de INEGI.
 *
 * Documentación: https://www.inegi.org.mx/servicios/api_indicadores.html
 *
 * - Requiere un token gratuito que se obtiene en:
 *     https://www.inegi.org.mx/app/desarrolladores/
 * - El token se configura en la variable de entorno `INEGI_TOKEN`.
 * - Si no está configurado, regresamos `null` para que el sitio use el
 *   fallback hardcodeado.
 *
 * Indicador utilizado:
 *   `628194` = INPC base segunda quincena julio 2018 (mensual).
 */

import { INPC_FALLBACK, type RegistroInpc } from "./inpc";

const INDICADOR_INPC = "628194";

type RespuestaInegi = {
  Series?: Array<{
    INDICADOR?: string;
    OBSERVATIONS?: Array<{
      TIME_PERIOD?: string;
      OBS_VALUE?: string;
    }>;
  }>;
};

function parsePeriodo(timePeriod: string): { anio: number; mes: number } | null {
  // INEGI suele devolver "YYYY/MM" (mensual) o "YYYY-MM".
  const limpio = timePeriod.replace("-", "/");
  const [anioStr, mesStr] = limpio.split("/");
  const anio = Number(anioStr);
  const mes = Number(mesStr);
  if (!Number.isFinite(anio) || !Number.isFinite(mes)) return null;
  return { anio, mes };
}

/**
 * Devuelve la serie histórica del INPC desde 2024 al mes más reciente
 * disponible. Si no hay token o la petición falla, regresa el fallback
 * local.
 */
export async function obtenerSerieInpc(): Promise<{
  serie: RegistroInpc[];
  fuente: "INEGI" | "fallback";
  actualizadoEn: string;
}> {
  const token = process.env.INEGI_TOKEN;
  if (!token) {
    return {
      serie: INPC_FALLBACK,
      fuente: "fallback",
      actualizadoEn: "Datos locales (sin token INEGI)",
    };
  }

  const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${INDICADOR_INPC}/es/0700/false/BIE/2.0/${token}?type=json`;

  try {
    const respuesta = await fetch(url, { next: { revalidate: 60 * 60 * 12 } });
    if (!respuesta.ok) {
      return {
        serie: INPC_FALLBACK,
        fuente: "fallback",
        actualizadoEn: `Fallback (HTTP ${respuesta.status})`,
      };
    }

    const data = (await respuesta.json()) as RespuestaInegi;
    const observaciones = data.Series?.[0]?.OBSERVATIONS ?? [];
    const serie: RegistroInpc[] = [];

    for (const obs of observaciones) {
      if (!obs.TIME_PERIOD || !obs.OBS_VALUE) continue;
      const periodo = parsePeriodo(obs.TIME_PERIOD);
      if (!periodo) continue;
      if (periodo.anio < 2024) continue;
      const valor = Number(obs.OBS_VALUE);
      if (!Number.isFinite(valor)) continue;
      serie.push({ ...periodo, valor });
    }

    serie.sort((a, b) => (a.anio === b.anio ? a.mes - b.mes : a.anio - b.anio));

    if (serie.length === 0) {
      return {
        serie: INPC_FALLBACK,
        fuente: "fallback",
        actualizadoEn: "Fallback (respuesta vacía)",
      };
    }

    return {
      serie,
      fuente: "INEGI",
      actualizadoEn: new Date().toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
  } catch {
    return {
      serie: INPC_FALLBACK,
      fuente: "fallback",
      actualizadoEn: "Fallback (error de red)",
    };
  }
}

/**
 * Cliente para la API del Banco de Información Económica (BIE) de INEGI.
 *
 * Documentación: https://www.inegi.org.mx/servicios/api_indicadores.html
 *
 * - Requiere un token gratuito que se obtiene en:
 *     https://www.inegi.org.mx/app/desarrolladores/
 * - El token se configura en la variable de entorno `INEGI_TOKEN`.
 * - Si no está configurado, se intenta Banxico (`BANXICO_TOKEN`, serie SP1).
 * - Si ambos fallan, regresamos el fallback hardcodeado.
 *
 * Indicador utilizado:
 *   `628194` = INPC base segunda quincena julio 2018 (mensual).
 */

import { obtenerSerieInpcBanxico } from "./banxico";
import { INPC_FALLBACK, type InpcFuente, type RegistroInpc } from "./inpc";

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

function etiquetaActualizacion(): string {
  return new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function obtenerSerieInpcInegi(): Promise<{
  serie: RegistroInpc[];
  fuente: InpcFuente;
  actualizadoEn: string;
} | null> {
  const token = process.env.INEGI_TOKEN;
  if (!token) return null;

  const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${INDICADOR_INPC}/es/0700/false/BIE/2.0/${token}?type=json`;

  try {
    const respuesta = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
    if (!respuesta.ok) return null;

    const data = (await respuesta.json()) as RespuestaInegi;
    const observaciones = data.Series?.[0]?.OBSERVATIONS ?? [];
    const serie: RegistroInpc[] = [];

    for (const obs of observaciones) {
      if (!obs.TIME_PERIOD || !obs.OBS_VALUE) continue;
      const periodo = parsePeriodo(obs.TIME_PERIOD);
      if (!periodo) continue;
      if (periodo.anio < 2016) continue;
      const valor = Number(obs.OBS_VALUE);
      if (!Number.isFinite(valor)) continue;
      serie.push({ ...periodo, valor });
    }

    serie.sort((a, b) => (a.anio === b.anio ? a.mes - b.mes : a.anio - b.anio));

    if (serie.length === 0) return null;

    return {
      serie,
      fuente: "INEGI",
      actualizadoEn: etiquetaActualizacion(),
    };
  } catch {
    return null;
  }
}

/**
 * Devuelve la serie histórica del INPC desde 2016 al mes más reciente
 * disponible. Prioridad: INEGI → Banxico → fallback local.
 */
export async function obtenerSerieInpc(): Promise<{
  serie: RegistroInpc[];
  fuente: InpcFuente;
  actualizadoEn: string;
}> {
  const inegi = await obtenerSerieInpcInegi();
  if (inegi) return inegi;

  const banxico = await obtenerSerieInpcBanxico();
  if (banxico.fuente === "Banxico") return banxico;

  return {
    serie: INPC_FALLBACK,
    fuente: "fallback",
    actualizadoEn: banxico.actualizadoEn.includes("sin token")
      ? "Datos locales (sin token INEGI ni Banxico)"
      : banxico.actualizadoEn,
  };
}

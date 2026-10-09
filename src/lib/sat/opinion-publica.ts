import type { OpinionPublicaEstado } from "@/lib/sat/types";

const SAT_CONSULTA_URL =
  "https://ptsc32d.clouda.sat.gob.mx/ConsultaPublico/Index";

export type ResultadoOpinionPublica = {
  estado: OpinionPublicaEstado;
  mensaje: string;
};

function limpiarHtmlSat(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clasificarHtmlOpinion(htmlRaw: string): ResultadoOpinionPublica {
  const html = htmlRaw.toLowerCase();

  if (/sin obligaciones/i.test(htmlRaw)) {
    return {
      estado: "sin_obligaciones",
      mensaje: "Sin obligaciones fiscales reportadas.",
    };
  }

  if (
    /negativ[ao]/i.test(htmlRaw) ||
    /sentido\s+negativ/i.test(htmlRaw) ||
    /opini[oó]n\s+negativ/i.test(htmlRaw)
  ) {
    return {
      estado: "negativa",
      mensaje: "Opinión de cumplimiento en sentido negativo.",
    };
  }

  if (
    /positiv[ao]/i.test(htmlRaw) ||
    /sentido\s+positiv/i.test(htmlRaw) ||
    /opini[oó]n\s+positiv/i.test(htmlRaw)
  ) {
    return {
      estado: "positiva",
      mensaje: "Opinión de cumplimiento en sentido positivo.",
    };
  }

  if (
    html.includes("application/pdf") ||
    html.includes("embed") ||
    html.includes(".pdf")
  ) {
    return {
      estado: "positiva",
      mensaje: "Opinión disponible en consulta pública.",
    };
  }

  const texto = limpiarHtmlSat(htmlRaw).slice(0, 280);
  return {
    estado: "error",
    mensaje: texto || "No se pudo interpretar la respuesta del SAT.",
  };
}

/**
 * Consulta la opinión de cumplimiento 32-D vía el servicio público del SAT.
 * Requiere que el contribuyente haya autorizado la opinión pública en sat.gob.mx.
 */
export async function consultarOpinionPublicaSat(
  rfc: string
): Promise<ResultadoOpinionPublica> {
  const rfcLimpio = String(rfc).replace(/\s+/g, "").toUpperCase();
  if (rfcLimpio.length < 12) {
    return { estado: "error", mensaje: "RFC inválido para consulta." };
  }

  const form = new FormData();
  form.append("Rfc", rfcLimpio);
  form.append("Curp", "");

  let res: Response;
  try {
    res = await fetch(SAT_CONSULTA_URL, {
      method: "POST",
      body: form,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RDC-CRM/1.0)",
        Accept: "text/html,application/json,*/*",
      },
      signal: AbortSignal.timeout(25_000),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de red";
    return {
      estado: "error",
      mensaje: `No se pudo contactar al SAT: ${msg}`,
    };
  }

  const text = (await res.text()).trim();
  if (!text) {
    return { estado: "error", mensaje: "El SAT devolvió una respuesta vacía." };
  }

  if (text.startsWith("{")) {
    try {
      const json = JSON.parse(text) as { MsjeIformativo?: string };
      const msg = limpiarHtmlSat(json.MsjeIformativo ?? "Sin información del SAT.");
      if (
        /no se encuentra autorizado/i.test(msg) ||
        /no autorizado/i.test(msg) ||
        /hacerse p[uú]blico/i.test(msg)
      ) {
        return {
          estado: "no_autorizada",
          mensaje: msg,
        };
      }
      return { estado: "error", mensaje: msg };
    } catch {
      return {
        estado: "error",
        mensaje: "Respuesta del SAT no interpretable.",
      };
    }
  }

  return clasificarHtmlOpinion(text);
}

/** Horas entre consultas automáticas al SAT (evita saturar el servicio). */
export const CACHE_OPINION_HORAS = 24;

export function debeReconsultarOpinion(
  ultimaConsulta: string | undefined,
  forzar = false
): boolean {
  if (forzar) return true;
  if (!ultimaConsulta) return true;
  const t = Date.parse(ultimaConsulta);
  if (Number.isNaN(t)) return true;
  const ms = CACHE_OPINION_HORAS * 60 * 60 * 1000;
  return Date.now() - t >= ms;
}

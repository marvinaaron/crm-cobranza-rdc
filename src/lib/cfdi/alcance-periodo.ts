import {
  MESES_NOM,
  esMismoPeriodo,
  getPeriodoFiscalVigente,
  getPeriodoHoy,
  periodoKey,
  periodoLabel,
  type Periodo,
} from "@/lib/clientes";

/** Presets estilo SAP para consulta de CFDI. */
export type PresetAlcanceCfdi =
  | "este_mes"
  | "mes_anterior"
  | "ytd"
  | "anio_completo"
  | "rango";

export type AlcancePeriodoCfdi = {
  preset: PresetAlcanceCfdi;
  desde: Periodo;
  hasta: Periodo;
  /** Año de referencia para YTD / año completo. */
  anioRef?: number;
};

export const PRESETS_ALCANCE_CFDI: Array<{
  id: Exclude<PresetAlcanceCfdi, "rango">;
  label: string;
  descripcion: string;
}> = [
  { id: "este_mes", label: "Este mes", descripcion: "Mes calendario actual" },
  { id: "mes_anterior", label: "Mes anterior", descripcion: "Periodo fiscal vigente" },
  { id: "ytd", label: "Año en curso", descripcion: "Enero hasta hoy (YTD)" },
  { id: "anio_completo", label: "Año completo", descripcion: "Enero a diciembre" },
];

export function esAlcanceUnMes(a: Pick<AlcancePeriodoCfdi, "desde" | "hasta">): boolean {
  return esMismoPeriodo(a.desde, a.hasta);
}

export function normalizarRango(desde: Periodo, hasta: Periodo): {
  desde: Periodo;
  hasta: Periodo;
} {
  if (periodoKey(desde) <= periodoKey(hasta)) return { desde, hasta };
  return { desde: hasta, hasta: desde };
}

export function resolverPresetAlcance(
  preset: Exclude<PresetAlcanceCfdi, "rango">,
  ref = new Date(),
  anioRef?: number
): AlcancePeriodoCfdi {
  const hoy = {
    mes: ref.getMonth(),
    anio: ref.getFullYear(),
  };

  switch (preset) {
    case "este_mes":
      return { preset, desde: hoy, hasta: { ...hoy } };
    case "mes_anterior": {
      const p = getPeriodoFiscalVigente(ref);
      return { preset, desde: p, hasta: { ...p } };
    }
    case "ytd": {
      const anio = anioRef ?? hoy.anio;
      const hasta =
        anio === hoy.anio ? { ...hoy } : { mes: 11, anio };
      return {
        preset,
        desde: { mes: 0, anio },
        hasta,
        anioRef: anio,
      };
    }
    case "anio_completo": {
      const anio = anioRef ?? hoy.anio;
      return {
        preset,
        desde: { mes: 0, anio },
        hasta: { mes: 11, anio },
        anioRef: anio,
      };
    }
  }
}

export function alcanceDesdeRango(
  desde: Periodo,
  hasta: Periodo
): AlcancePeriodoCfdi {
  const rango = normalizarRango(desde, hasta);
  if (esMismoPeriodo(rango.desde, rango.hasta)) {
    const hoy = getPeriodoHoy();
    const fiscal = getPeriodoFiscalVigente();
    if (esMismoPeriodo(rango.desde, hoy)) {
      return { preset: "este_mes", ...rango };
    }
    if (esMismoPeriodo(rango.desde, fiscal)) {
      return { preset: "mes_anterior", ...rango };
    }
  }
  if (
    rango.desde.mes === 0 &&
    rango.desde.anio === rango.hasta.anio &&
    rango.hasta.mes === 11
  ) {
    return {
      preset: "anio_completo",
      ...rango,
      anioRef: rango.desde.anio,
    };
  }
  const hoy = getPeriodoHoy();
  if (
    rango.desde.mes === 0 &&
    rango.desde.anio === hoy.anio &&
    esMismoPeriodo(rango.hasta, hoy)
  ) {
    return { preset: "ytd", ...rango, anioRef: hoy.anio };
  }
  return { preset: "rango", ...rango };
}

export function alcanceLabel(a: Pick<AlcancePeriodoCfdi, "desde" | "hasta" | "preset">): string {
  if (esAlcanceUnMes(a)) return periodoLabel(a.desde);
  if (a.preset === "anio_completo" || (a.desde.mes === 0 && a.hasta.mes === 11 && a.desde.anio === a.hasta.anio)) {
    return `Año ${a.desde.anio}`;
  }
  if (a.preset === "ytd" && a.desde.mes === 0 && a.desde.anio === a.hasta.anio) {
    return `Ene–${MESES_NOM[a.hasta.mes].slice(0, 3)} ${a.hasta.anio}`;
  }
  if (a.desde.anio === a.hasta.anio) {
    return `${MESES_NOM[a.desde.mes].slice(0, 3)}–${MESES_NOM[a.hasta.mes].slice(0, 3)} ${a.desde.anio}`;
  }
  return `${periodoLabel(a.desde)} – ${periodoLabel(a.hasta)}`;
}

export function alcanceASearchParams(a: AlcancePeriodoCfdi): URLSearchParams {
  return new URLSearchParams({
    mes: String(a.desde.mes),
    anio: String(a.desde.anio),
    mesHasta: String(a.hasta.mes),
    anioHasta: String(a.hasta.anio),
  });
}

export type AlcanceParseado =
  | { ok: true; alcance: { desde: Periodo; hasta: Periodo } }
  | { ok: false; error: string };

/** Parsea mes/anio (+ opcionales mesHasta/anioHasta) desde query string. */
export function parseAlcanceDesdeSearchParams(
  searchParams: URLSearchParams,
  fallback: Periodo = getPeriodoFiscalVigente()
): AlcanceParseado {
  const mes = Number.parseInt(searchParams.get("mes") ?? String(fallback.mes), 10);
  const anio = Number.parseInt(searchParams.get("anio") ?? String(fallback.anio), 10);
  if (!Number.isFinite(mes) || mes < 0 || mes > 11) {
    return { ok: false, error: "Mes inválido." };
  }
  if (!Number.isFinite(anio) || anio < 2000 || anio > 2100) {
    return { ok: false, error: "Año inválido." };
  }

  const mesHastaRaw = searchParams.get("mesHasta");
  const anioHastaRaw = searchParams.get("anioHasta");
  if (mesHastaRaw == null && anioHastaRaw == null) {
    return { ok: true, alcance: { desde: { mes, anio }, hasta: { mes, anio } } };
  }

  const mesHasta = Number.parseInt(mesHastaRaw ?? String(mes), 10);
  const anioHasta = Number.parseInt(anioHastaRaw ?? String(anio), 10);
  if (!Number.isFinite(mesHasta) || mesHasta < 0 || mesHasta > 11) {
    return { ok: false, error: "Mes hasta inválido." };
  }
  if (!Number.isFinite(anioHasta) || anioHasta < 2000 || anioHasta > 2100) {
    return { ok: false, error: "Año hasta inválido." };
  }

  return {
    ok: true,
    alcance: normalizarRango({ mes, anio }, { mes: mesHasta, anio: anioHasta }),
  };
}

/** Meses (0–11) del alcance que caen en un año dado (para resaltar en gráfica). */
export function mesesActivosEnAnio(
  a: Pick<AlcancePeriodoCfdi, "desde" | "hasta">,
  anio: number
): number[] {
  const out: number[] = [];
  let key = periodoKey(a.desde);
  const fin = periodoKey(a.hasta);
  while (key <= fin) {
    const m = key % 12;
    const y = Math.floor(key / 12);
    if (y === anio) out.push(m);
    key += 1;
  }
  return out;
}

export function alcanceInicialCfdi(): AlcancePeriodoCfdi {
  return resolverPresetAlcance("mes_anterior");
}

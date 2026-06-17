/**
 * Cálculo de fechas límite fiscales para el portal del cliente.
 *
 * Reglas implementadas:
 *
 *  1. SAT (declaración mensual ISR/IVA):
 *     - Día base: 17 del mes siguiente al periodo fiscal.
 *     - Se le suman días hábiles según el SEXTO dígito del RFC del cliente:
 *         1-2 → +1 día hábil
 *         3-4 → +2 días hábiles
 *         5-6 → +3 días hábiles
 *         7-8 → +4 días hábiles
 *         9-0 → +5 días hábiles
 *     - Si la fecha final cae en fin de semana, se mueve al lunes siguiente.
 *
 *  2. IMSS (SIPARE / cuotas obrero-patronales):
 *     - Día 17 del mes siguiente.
 *     - Si cae en sábado o domingo, se recorre al lunes inmediato.
 *
 *  3. REPSE (ICSOE / SISUB):
 *     - Día 17 del mes siguiente.
 *     - Si cae en sábado o domingo, se recorre al lunes inmediato.
 *
 *  4. Impuesto Estatal (ej. nómina estatal / ISN):
 *     - Día 12 del mes siguiente.
 *     - Si cae en sábado, domingo o festivo, se recorre al siguiente día
 *       hábil.
 *
 * Festivos: la lista oficial de festivos federales según la LFT art. 74,
 * con la regla "tercer lunes" / "primer lunes" para los movibles.
 */

import type { Cliente, Periodo } from "@/lib/clientes";
import { categoriasHabilitadasCliente } from "@/lib/config-cumplimiento-cliente";

export type TipoEventoFiscal = "sat" | "imss" | "estatal" | "repse" | "honorarios";

export type EventoFiscal = {
  tipo: TipoEventoFiscal;
  /** Título corto para mostrar (ej. "SAT — declaración abril"). */
  etiqueta: string;
  /** Fecha límite (siempre normalizada a hora 00:00 local). */
  fecha: Date;
  /** Periodo al que corresponde (mes/año). */
  periodo: Periodo;
  /**
   * Descripción opcional para el .ics. Si se omite, se usa la descripción
   * por defecto según el `tipo`. Útil para eventos "internos" (agenda de
   * cierre del despacho) que reusan el flujo de .ics pero necesitan otra
   * narrativa.
   */
  descripcion?: string;
};

// ============================================================================
// Festivos federales mexicanos (LFT art. 74)
// ============================================================================

/** Día del mes (1-31) del enésimo día-de-la-semana en un mes. Ej: 3er lunes. */
function nthDow(anio: number, mes: number, dow: number, n: number): Date {
  const primero = new Date(anio, mes, 1);
  const diff = (dow - primero.getDay() + 7) % 7;
  return new Date(anio, mes, 1 + diff + (n - 1) * 7);
}

/** Genera todos los festivos federales del año (LFT art. 74). */
function festivosDelAnio(anio: number): Date[] {
  const out: Date[] = [
    new Date(anio, 0, 1), // Año nuevo
    nthDow(anio, 1, 1, 1), // Primer lunes de febrero (Constitución)
    nthDow(anio, 2, 1, 3), // Tercer lunes de marzo (Natalicio Juárez)
    new Date(anio, 4, 1), // 1 mayo (Día del trabajo)
    new Date(anio, 8, 16), // 16 septiembre (Independencia)
    nthDow(anio, 10, 1, 3), // Tercer lunes de noviembre (Revolución)
    new Date(anio, 11, 25), // 25 diciembre (Navidad)
  ];
  // Transmisión presidencial cada 6 años: 1 dic de 2024, 2030, 2036…
  if ((anio - 2024) % 6 === 0 && anio >= 2024) {
    out.push(new Date(anio, 11, 1));
  }
  return out;
}

function mismaFecha(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const festivosCache = new Map<number, Date[]>();
function getFestivos(anio: number): Date[] {
  let v = festivosCache.get(anio);
  if (!v) {
    v = festivosDelAnio(anio);
    festivosCache.set(anio, v);
  }
  return v;
}

export function esFestivoFederal(d: Date): boolean {
  return getFestivos(d.getFullYear()).some((f) => mismaFecha(f, d));
}

export function esFinDeSemana(d: Date): boolean {
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

/** Inhábil = fin de semana o festivo federal. */
export function esInhabil(d: Date): boolean {
  return esFinDeSemana(d) || esFestivoFederal(d);
}

// ============================================================================
// Recorridos por inhábil
// ============================================================================

/** Si la fecha cae en sábado o domingo, la mueve al lunes inmediato. */
export function recorrerSiFinDeSemana(d: Date): Date {
  const dow = d.getDay();
  if (dow === 6) return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 2);
  if (dow === 0) return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return d;
}

/** Si la fecha cae en inhábil (s/d/festivo), la mueve al siguiente día hábil. */
export function siguienteDiaHabil(d: Date): Date {
  let r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  while (esInhabil(r)) {
    r = new Date(r.getFullYear(), r.getMonth(), r.getDate() + 1);
  }
  return r;
}

/** Suma N días hábiles a la fecha (salta s/d y festivos). */
export function sumarDiasHabiles(d: Date, n: number): Date {
  let r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  let restantes = n;
  while (restantes > 0) {
    r = new Date(r.getFullYear(), r.getMonth(), r.getDate() + 1);
    if (!esInhabil(r)) restantes -= 1;
  }
  return r;
}

// ============================================================================
// Sexto dígito del RFC → días hábiles a sumar para SAT
// ============================================================================

/** Devuelve el sexto dígito numérico del RFC (PF o PM) o null si no aplica. */
export function sextoDigitoRFC(rfc: string | undefined | null): number | null {
  if (!rfc) return null;
  const limpio = rfc.toUpperCase().trim();
  // PF: 4 letras + YYMMDD; el 6º dígito numérico es el carácter en pos 9 (índice 8).
  // PM: 3 letras + YYMMDD; el 6º dígito numérico es el carácter en pos 8 (índice 7).
  // Como ambos casos terminan los 6 dígitos en el mismo offset relativo al final
  // del bloque AAAAAA-YYMMDD-XXX, podemos buscar directo todos los dígitos juntos.
  const digitos = limpio.match(/\d/g);
  if (!digitos || digitos.length < 6) return null;
  const sexto = digitos[5];
  const n = Number(sexto);
  return Number.isFinite(n) ? n : null;
}

/** Días hábiles que se suman al 17 según el sexto dígito del RFC. */
export function diasHabilesAdicionalesSAT(rfc: string | undefined | null): number {
  const sexto = sextoDigitoRFC(rfc);
  if (sexto == null) return 0;
  return diasHabilesPorSextoDigito(sexto);
}

export function diasHabilesPorSextoDigito(sexto: number): number {
  if (sexto === 1 || sexto === 2) return 1;
  if (sexto === 3 || sexto === 4) return 2;
  if (sexto === 5 || sexto === 6) return 3;
  if (sexto === 7 || sexto === 8) return 4;
  return 5; // 9 y 0
}

/** Texto legible del rango del sexto dígito numérico del RFC. */
export function rangoSextoDigitoSAT(sexto: number): string {
  if (sexto === 1 || sexto === 2) return "1 o 2";
  if (sexto === 3 || sexto === 4) return "3 o 4";
  if (sexto === 5 || sexto === 6) return "5 o 6";
  if (sexto === 7 || sexto === 8) return "7 u 8";
  return "9 o 0";
}

export const TABLA_SEXTO_DIGITO_SAT: Array<{
  rango: string;
  dias: number;
}> = [
  { rango: "1 o 2", dias: 1 },
  { rango: "3 o 4", dias: 2 },
  { rango: "5 o 6", dias: 3 },
  { rango: "7 u 8", dias: 4 },
  { rango: "9 o 0", dias: 5 },
];

export type DesgloseVencimientoSAT = {
  sextoDigito: number;
  rangoSextoDigito: string;
  diasHabilesExtra: number;
  mesVencimiento: number;
  anioVencimiento: number;
  nombreMesVencimiento: string;
  nombreMesPeriodo: string;
  fechaBase17: Date;
  fechaTrasDiasHabiles: Date;
  fechaFinal: Date;
  huboRecorridoFinDeSemana: boolean;
};

/** Paso a paso del vencimiento SAT mensual para un RFC y periodo fiscal. */
export function desgloseVencimientoSAT(
  rfc: string,
  periodoFiscal: Periodo
): DesgloseVencimientoSAT | { error: string } {
  const limpio = rfc.toUpperCase().trim();
  if (!limpio) return { error: "Captura tu RFC." };
  const sexto = sextoDigitoRFC(limpio);
  if (sexto == null) {
    return {
      error:
        "No pudimos leer el sexto dígito numérico del RFC. Verifica que tenga al menos 6 números (persona física o moral).",
    };
  }

  const { mes, anio } = mesSiguienteAlPeriodo(periodoFiscal);
  const diasExtra = diasHabilesPorSextoDigito(sexto);
  const fechaBase17 = new Date(anio, mes, 17);
  const fechaTrasDiasHabiles = sumarDiasHabiles(fechaBase17, diasExtra);
  const fechaFinal = recorrerSiFinDeSemana(fechaTrasDiasHabiles);

  return {
    sextoDigito: sexto,
    rangoSextoDigito: rangoSextoDigitoSAT(sexto),
    diasHabilesExtra: diasExtra,
    mesVencimiento: mes,
    anioVencimiento: anio,
    nombreMesVencimiento: MES_NOM_LC[mes],
    nombreMesPeriodo: MES_NOM_LC[periodoFiscal.mes],
    fechaBase17,
    fechaTrasDiasHabiles,
    fechaFinal,
    huboRecorridoFinDeSemana:
      fechaFinal.getTime() !== fechaTrasDiasHabiles.getTime(),
  };
}

/** Fecha larga en español (ej. "lunes 19 de mayo de 2026"). */
export function formatearFechaVencimiento(d: Date): string {
  const raw = d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Día y mes cortos para tarjetas (ej. "19 may"). */
export function formatearDiaMesCorto(d: Date): string {
  return d
    .toLocaleDateString("es-MX", { day: "numeric", month: "short" })
    .replace(".", "");
}

// ============================================================================
// Cálculo de fechas límite por tipo de obligación
// ============================================================================

/** Calcula el (mes, año) del mes siguiente al periodo fiscal. */
function mesSiguienteAlPeriodo(periodoFiscal: Periodo): { mes: number; anio: number } {
  const mes = (periodoFiscal.mes + 1) % 12;
  const anio = periodoFiscal.mes === 11 ? periodoFiscal.anio + 1 : periodoFiscal.anio;
  return { mes, anio };
}

/** Fecha límite SAT (ISR/IVA mensual) según RFC del cliente. */
export function fechaLimiteSAT(
  rfc: string | undefined | null,
  periodoFiscal: Periodo
): Date {
  const { mes, anio } = mesSiguienteAlPeriodo(periodoFiscal);
  const base = new Date(anio, mes, 17);
  const conDiasHabiles = sumarDiasHabiles(base, diasHabilesAdicionalesSAT(rfc));
  return recorrerSiFinDeSemana(conDiasHabiles);
}

/** Fecha límite IMSS: día 17, si cae en s/d se recorre al lunes. */
export function fechaLimiteIMSS(periodoFiscal: Periodo): Date {
  const { mes, anio } = mesSiguienteAlPeriodo(periodoFiscal);
  return recorrerSiFinDeSemana(new Date(anio, mes, 17));
}

/** Fecha límite REPSE (ICSOE/SISUB): día 17, recorrido por s/d. */
export function fechaLimiteREPSE(periodoFiscal: Periodo): Date {
  return fechaLimiteIMSS(periodoFiscal);
}

/** Fecha límite impuesto estatal (ej. ISN): día 12, recorrido por inhábil. */
export function fechaLimiteEstatal(periodoFiscal: Periodo): Date {
  const { mes, anio } = mesSiguienteAlPeriodo(periodoFiscal);
  return siguienteDiaHabil(new Date(anio, mes, 12));
}

// ============================================================================
// Generador de eventos del calendario fiscal del cliente
// ============================================================================

const ETIQUETA_TIPO: Record<TipoEventoFiscal, string> = {
  sat: "SAT",
  imss: "IMSS",
  estatal: "Impuesto estatal",
  repse: "REPSE",
  honorarios: "Honorarios",
};

const MES_NOM_LC = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/**
 * Devuelve todos los vencimientos fiscales que aplican al cliente para los
 * próximos `mesesAdelante` periodos (incluyendo el periodo fiscal vigente).
 *
 * No incluye honorarios; ese vencimiento se calcula aparte porque depende
 * del cliente, no del calendario fiscal en sí.
 */
export function eventosFiscalesParaCliente(
  cliente: Cliente,
  periodoFiscalActual: Periodo,
  mesesAdelante = 4
): EventoFiscal[] {
  const categorias = categoriasHabilitadasCliente(cliente);
  const tieneRepse = cliente.configRepse?.habilitado === true;
  if (categorias.length === 0 && !tieneRepse) return [];

  const eventos: EventoFiscal[] = [];

  for (let i = 0; i < mesesAdelante; i += 1) {
    const refMes = periodoFiscalActual.mes + i;
    const offsetAnio = Math.floor(refMes / 12);
    const mesPeriodo = ((refMes % 12) + 12) % 12;
    const anioPeriodo = periodoFiscalActual.anio + offsetAnio;
    const periodo: Periodo = { mes: mesPeriodo, anio: anioPeriodo };
    const nombreMes = MES_NOM_LC[mesPeriodo];

    if (categorias.includes("federales")) {
      eventos.push({
        tipo: "sat",
        etiqueta: `${ETIQUETA_TIPO.sat} — declaración de ${nombreMes}`,
        fecha: fechaLimiteSAT(cliente.rfc, periodo),
        periodo,
      });
    }
    if (categorias.includes("imss")) {
      eventos.push({
        tipo: "imss",
        etiqueta: `${ETIQUETA_TIPO.imss} — cuotas de ${nombreMes}`,
        fecha: fechaLimiteIMSS(periodo),
        periodo,
      });
    }
    if (categorias.includes("estatales")) {
      eventos.push({
        tipo: "estatal",
        etiqueta: `${ETIQUETA_TIPO.estatal} — pago de ${nombreMes}`,
        fecha: fechaLimiteEstatal(periodo),
        periodo,
      });
    }
    if (tieneRepse) {
      eventos.push({
        tipo: "repse",
        etiqueta: `${ETIQUETA_TIPO.repse} — presentación de ${nombreMes}`,
        fecha: fechaLimiteREPSE(periodo),
        periodo,
      });
    }
  }

  return eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
}

/** Colores Tailwind por tipo de evento, para badges y dots del calendario. */
export const COLORES_EVENTO: Record<TipoEventoFiscal, {
  dot: string;
  textoBadge: string;
  fondoBadge: string;
  borde: string;
}> = {
  sat: {
    dot: "bg-blue-500",
    textoBadge: "text-blue-700",
    fondoBadge: "bg-blue-50",
    borde: "border-blue-200",
  },
  imss: {
    dot: "bg-emerald-500",
    textoBadge: "text-emerald-700",
    fondoBadge: "bg-emerald-50",
    borde: "border-emerald-200",
  },
  estatal: {
    dot: "bg-amber-500",
    textoBadge: "text-amber-700",
    fondoBadge: "bg-amber-50",
    borde: "border-amber-200",
  },
  repse: {
    dot: "bg-violet-500",
    textoBadge: "text-violet-700",
    fondoBadge: "bg-violet-50",
    borde: "border-violet-200",
  },
  honorarios: {
    dot: "bg-rose-500",
    textoBadge: "text-rose-700",
    fondoBadge: "bg-rose-50",
    borde: "border-rose-200",
  },
};

import { MESES_NOM, periodoKey, type Periodo } from "@/lib/clientes";
import {
  asegurarBloques,
  cierreContableCapturado,
  getSaldoFavorPeriodo,
  lineaExtemporaneaVigente,
  pagoValidadoCategoria,
  type CategoriaId,
  type RegistroCumplimiento,
} from "@/lib/cumplimiento";
import type { PuntoTendenciaMes } from "@/lib/cfdi/resumen-mes";

export function utilidadCierre(ingresos: number, gastos: number) {
  return Math.round((ingresos - gastos) * 100) / 100;
}

export type CierreMesVista = {
  mes: number;
  anio: number;
  capturado: boolean;
  ingresos: number;
  gastos: number;
  ventasExentas: number;
  utilidad: number;
};

export function cierreDesdeRegistro(
  mes: number,
  anio: number,
  reg: RegistroCumplimiento | undefined
): CierreMesVista {
  const capturado = cierreContableCapturado(reg);
  const ingresos = capturado ? reg?.cierreContable?.ingresos ?? 0 : 0;
  const gastos = capturado ? reg?.cierreContable?.gastos ?? 0 : 0;
  return {
    mes,
    anio,
    capturado,
    ingresos,
    gastos,
    ventasExentas: capturado ? reg?.cierreContable?.ventasExentas ?? 0 : 0,
    utilidad: capturado ? utilidadCierre(ingresos, gastos) : 0,
  };
}

export function periodosEnRango(desde: Periodo, hasta: Periodo): Periodo[] {
  const out: Periodo[] = [];
  let key = periodoKey(desde);
  const fin = periodoKey(hasta);
  while (key <= fin) {
    out.push({ mes: key % 12, anio: Math.floor(key / 12) });
    key += 1;
  }
  return out;
}

export function sumarCierres(meses: CierreMesVista[]) {
  const capturados = meses.filter((m) => m.capturado);
  const ingresos = capturados.reduce((s, m) => s + m.ingresos, 0);
  const gastos = capturados.reduce((s, m) => s + m.gastos, 0);
  return {
    ingresos: Math.round(ingresos * 100) / 100,
    gastos: Math.round(gastos * 100) / 100,
    utilidad: utilidadCierre(ingresos, gastos),
    mesesConCierre: capturados.length,
  };
}

const CONCEPTO_SUELDOS = "Retenciones Salarios";
const ETIQUETA_SUELDOS = "Sueldos y salarios";

export type ConceptoAcumulado = { etiqueta: string; monto: number };

function redondearCentavos(n: number) {
  return Math.round(n * 100) / 100;
}

function sinAcentos(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function canonConcepto(raw: string): string {
  const t = raw.trim();
  const n = sinAcentos(t);
  if (n === "isr") return "ISR";
  if (n === "iva") return "IVA";
  if (n.includes("retencion") && n.includes("salario")) {
    return "Retenciones Salarios";
  }
  if (n.includes("isr") && n.includes("reten")) return "ISR Retenido";
  if (n.includes("iva") && n.includes("reten")) return "IVA Retenido";
  return t || "Otros";
}

function sumarConcepto(
  mapa: Map<string, number>,
  etiqueta: string,
  monto: number
) {
  if (!(monto > 0)) return;
  const k = canonConcepto(etiqueta);
  mapa.set(k, redondearCentavos((mapa.get(k) ?? 0) + monto));
}

function filasConcepto(
  mapa: Map<string, number>,
  mostrarSueldos: boolean
): ConceptoAcumulado[] {
  const filas: ConceptoAcumulado[] = [
    { etiqueta: "ISR", monto: redondearCentavos(mapa.get("ISR") ?? 0) },
    { etiqueta: "IVA", monto: redondearCentavos(mapa.get("IVA") ?? 0) },
  ];
  if (mostrarSueldos) {
    filas.push({
      etiqueta: ETIQUETA_SUELDOS,
      monto: redondearCentavos(mapa.get(CONCEPTO_SUELDOS) ?? 0),
    });
  }
  return filas;
}

function catPagadaEnMes(
  historial: Array<{
    mes: number;
    anio: number;
    monto: number;
    categoria: CategoriaId;
  }>,
  mes: number,
  anio: number,
  cat: CategoriaId,
  reg: RegistroCumplimiento | undefined
) {
  const hist = historial.find(
    (h) => h.anio === anio && h.mes === mes && h.categoria === cat
  );
  if (hist && hist.monto > 0) return true;
  return !!reg && pagoValidadoCategoria(reg, cat);
}

function sumarCargosFederales(
  mapa: Map<string, number>,
  reg: RegistroCumplimiento
) {
  const r = asegurarBloques(reg);
  const ext = lineaExtemporaneaVigente(r, "federales");
  const lineas = ext ? [ext] : r.federales.lineasCaptura;
  for (const l of lineas) {
    if (l.conceptos?.length) {
      for (const c of l.conceptos) {
        if (c.aFavor) continue;
        sumarConcepto(mapa, c.etiqueta, Number(c.monto) || 0);
      }
      continue;
    }
    if (l.monto > 0) sumarConcepto(mapa, l.etiqueta, l.monto);
  }
}

function sumarFavorDelRegistro(
  mapa: Map<string, number>,
  reg: RegistroCumplimiento | undefined
) {
  const sf = getSaldoFavorPeriodo(reg);
  if (sf) {
    for (const l of sf.lineas) sumarConcepto(mapa, l.etiqueta, l.monto);
    return;
  }
  if (!reg) return;
  const r = asegurarBloques(reg);
  for (const l of r.federales.lineasCaptura) {
    for (const c of l.conceptos ?? []) {
      if (!c.aFavor) continue;
      sumarConcepto(mapa, c.etiqueta, Number(c.monto) || 0);
    }
  }
}

/** Pagado a Hacienda y saldo a favor del año, cada uno por su lado y por concepto. */
export function acumuladoContribucionesAnio(
  getReg: (p: Periodo) => RegistroCumplimiento | undefined,
  historial: Array<{
    mes: number;
    anio: number;
    monto: number;
    categoria: CategoriaId;
  }>,
  anio: number,
  mostrarSueldos = false
) {
  const pagadoMap = new Map<string, number>();
  const favorMap = new Map<string, number>();

  for (let mes = 0; mes < 12; mes++) {
    const reg = getReg({ mes, anio });
    sumarFavorDelRegistro(favorMap, reg);

    if (catPagadaEnMes(historial, mes, anio, "federales", reg) && reg) {
      sumarCargosFederales(pagadoMap, reg);
    }
  }

  const pagadoPorConcepto = filasConcepto(pagadoMap, mostrarSueldos);
  const favorPorConcepto = filasConcepto(favorMap, mostrarSueldos);

  return {
    pagado: redondearCentavos(
      pagadoPorConcepto.reduce((s, c) => s + c.monto, 0)
    ),
    saldoFavor: redondearCentavos(
      favorPorConcepto.reduce((s, c) => s + c.monto, 0)
    ),
    pagadoPorConcepto,
    favorPorConcepto,
  };
}

/** Doce meses del año; sin cierre van en cero para el eje calendario. */
export function tendenciaCierreAnio(
  getReg: (p: Periodo) => RegistroCumplimiento | undefined,
  anio: number
): PuntoTendenciaMes[] {
  return MESES_NOM.map((nombre, mes) => {
    const c = cierreDesdeRegistro(mes, anio, getReg({ mes, anio }));
    return {
      mes,
      label: nombre.slice(0, 3),
      ingresos: c.capturado ? c.ingresos : 0,
      egresos: c.capturado ? c.gastos : 0,
      nomina: 0,
    };
  });
}

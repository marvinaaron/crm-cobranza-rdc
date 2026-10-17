import { MESES_NOM, periodoKey, type Periodo } from "@/lib/clientes";
import {
  cierreContableCapturado,
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

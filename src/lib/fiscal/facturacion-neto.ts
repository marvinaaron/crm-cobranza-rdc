/**
 * Calculadora inversa de facturación: neto deseado → desglose CFDI.
 */

import {
  tasasParaOperacion,
  type RegimenEmisor,
  type TipoEmisor,
  type TipoOperacion,
  type TipoReceptor,
  type FundamentoLegal,
  type TasasOperacion,
} from "@/lib/fiscal/facturacion-tablas";

export type EntradaFacturacionNeto = {
  emisor: TipoEmisor;
  regimen?: RegimenEmisor;
  receptor: TipoReceptor;
  operacion: TipoOperacion;
  netoDeseado: number;
  ivaFrontera?: boolean;
  agapesExento?: boolean;
};

export type LineaDesglose = {
  concepto: string;
  monto: number;
  aplica: boolean;
  texto?: string;
};

export type ResultadoFacturacionNeto =
  | {
      ok: true;
      netoDeseado: number;
      subtotal: number;
      iva: number;
      retIva: number;
      retIsr: number;
      totalCfdi: number;
      netoVerificado: number;
      diferencialRedondeo: number;
      tasaIva: number;
      lineas: LineaDesglose[];
      fundamentos: FundamentoLegal[];
      advertencias: string[];
      tasas: TasasOperacion;
    }
  | { ok: false; error: string };

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcularFacturacionDesdeNeto(
  entrada: EntradaFacturacionNeto
): ResultadoFacturacionNeto {
  const neto = entrada.netoDeseado;
  if (!Number.isFinite(neto) || neto <= 0) {
    return { ok: false, error: "Captura un neto mayor a cero." };
  }

  const tasasResult = tasasParaOperacion({
    emisor: entrada.emisor,
    regimen: entrada.regimen,
    receptor: entrada.receptor,
    operacion: entrada.operacion,
    ivaFrontera: entrada.ivaFrontera === true,
    agapesExento: entrada.agapesExento === true,
  });

  if ("error" in tasasResult) {
    return { ok: false, error: tasasResult.error };
  }

  const tasas = tasasResult;
  const tasaIva = tasas.aplicaIva ? (entrada.ivaFrontera ? 0.08 : 0.16) : 0;
  const factor =
    1 + tasaIva - tasas.retIvaSubtotal - tasas.retIsrSubtotal;

  if (factor <= 0) {
    return {
      ok: false,
      error:
        "No se puede calcular: las retenciones superan el total. Revisa emisor, receptor y tipo de operación.",
    };
  }

  const subtotal = redondear(neto / factor);
  const iva = tasas.aplicaIva ? redondear(subtotal * tasaIva) : 0;
  const retIva =
    tasas.retIvaSubtotal > 0
      ? redondear(subtotal * tasas.retIvaSubtotal)
      : 0;
  const retIsr =
    tasas.retIsrSubtotal > 0
      ? redondear(subtotal * tasas.retIsrSubtotal)
      : 0;
  const totalCfdi = redondear(subtotal + iva);
  const netoVerificado = redondear(subtotal + iva - retIva - retIsr);
  const diferencialRedondeo = redondear(netoVerificado - neto);

  const advertencias: string[] = [];
  if (entrada.emisor === "pm") {
    advertencias.push(
      "Como persona moral emisora, las retenciones modeladas para PF no aplican al facturar. El desglose muestra IVA trasladado sin retenciones."
    );
  }
  if (entrada.receptor === "pf") {
    advertencias.push(
      "Receptor persona física: sin retenciones de ISR ni IVA en este escenario."
    );
  }
  if (Math.abs(diferencialRedondeo) > 0.02) {
    advertencias.push(
      `Diferencia por redondeo: ${diferencialRedondeo >= 0 ? "+" : ""}${diferencialRedondeo.toFixed(2)} MXN. Ajusta centavos en el CFDI si el banco exige exactitud al centavo.`
    );
  }

  const lineas: LineaDesglose[] = [
    { concepto: "Subtotal", monto: subtotal, aplica: true },
    {
      concepto: tasas.etiquetaIva,
      monto: iva,
      aplica: tasas.aplicaIva,
      texto: tasas.aplicaIva ? undefined : "No aplica",
    },
    {
      concepto: tasas.etiquetaRetIva,
      monto: retIva,
      aplica: tasas.retIvaSubtotal > 0,
      texto: tasas.retIvaSubtotal > 0 ? undefined : "No aplica",
    },
    {
      concepto: tasas.etiquetaRetIsr,
      monto: retIsr,
      aplica: tasas.retIsrSubtotal > 0,
      texto: tasas.retIsrSubtotal > 0 ? undefined : "No aplica",
    },
    { concepto: "Total CFDI", monto: totalCfdi, aplica: true },
    { concepto: "Neto que recibes", monto: netoVerificado, aplica: true },
  ];

  return {
    ok: true,
    netoDeseado: neto,
    subtotal,
    iva,
    retIva,
    retIsr,
    totalCfdi,
    netoVerificado,
    diferencialRedondeo,
    tasaIva,
    lineas,
    fundamentos: tasas.fundamentos,
    advertencias,
    tasas,
  };
}

export function formatearDesgloseTexto(r: Extract<ResultadoFacturacionNeto, { ok: true }>): string {
  const filas = [
    `Subtotal: ${r.subtotal.toFixed(2)}`,
    r.iva > 0 ? `IVA: ${r.iva.toFixed(2)}` : "IVA: No aplica",
    r.retIva > 0 ? `Ret. IVA: ${r.retIva.toFixed(2)}` : "Ret. IVA: No aplica",
    r.retIsr > 0 ? `Ret. ISR: ${r.retIsr.toFixed(2)}` : "Ret. ISR: No aplica",
    `Total CFDI: ${r.totalCfdi.toFixed(2)}`,
    `Neto verificado: ${r.netoVerificado.toFixed(2)}`,
  ];
  return filas.join("\n");
}

export { fmtMxn } from "@/lib/fiscal/resico";

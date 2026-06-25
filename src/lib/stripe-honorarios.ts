/**
 * Tarifa Stripe México (tarjeta): % del cobro + fijo MXN.
 * El IVA (16%) aplica solo sobre la comisión de Stripe, no sobre honorarios.
 */
export const STRIPE_TARIFA_PCT = 0.036;
export const STRIPE_TARIFA_FIJO_MXN = 3;
export const IVA_SOBRE_COMISION_STRIPE = 0.16;

export type DesgloseCobro = {
  montoHonorarios: number;
  /** Cargo extra al cliente (total − honorarios). Cubre Stripe + IVA (+ ajuste mínimo). */
  comision: number;
  comisionStripe: number;
  ivaStripe: number;
  /** Centavos de ajuste por redondeo al alza (comisión − Stripe − IVA). */
  ajusteRedondeo: number;
  total: number;
  centavosHonorarios: number;
  centavosComision: number;
  centavosComisionStripe: number;
  centavosIvaStripe: number;
  centavosTotal: number;
};

function comisionStripeCentavos(totalCent: number): number {
  return Math.round(totalCent * STRIPE_TARIFA_PCT) + STRIPE_TARIFA_FIJO_MXN * 100;
}

function ivaStripeCentavos(comisionStripeCent: number): number {
  return Math.round(comisionStripeCent * IVA_SOBRE_COMISION_STRIPE);
}

function totalDescontadoStripeCentavos(totalCent: number): number {
  const comision = comisionStripeCentavos(totalCent);
  return comision + ivaStripeCentavos(comision);
}

const DESGLOSE_VACIO: DesgloseCobro = {
  montoHonorarios: 0,
  comision: 0,
  comisionStripe: 0,
  ivaStripe: 0,
  ajusteRedondeo: 0,
  total: 0,
  centavosHonorarios: 0,
  centavosComision: 0,
  centavosComisionStripe: 0,
  centavosIvaStripe: 0,
  centavosTotal: 0,
};

/**
 * Calcula el total a cobrar con tarjeta para que, después de Stripe + IVA,
 * el despacho reciba exactamente `montoHonorarios` (redondeo al centavo arriba).
 */
export function calcularCobroHonorarios(montoHonorarios: number): DesgloseCobro {
  const honorariosCent = Math.round(Math.max(0, montoHonorarios) * 100);
  if (honorariosCent <= 0) return DESGLOSE_VACIO;

  const factorIva = 1 + IVA_SOBRE_COMISION_STRIPE;
  const tasaConIva = STRIPE_TARIFA_PCT * factorIva;
  const fijoConIvaCent = STRIPE_TARIFA_FIJO_MXN * 100 * factorIva;

  let totalCent = Math.ceil((honorariosCent + fijoConIvaCent) / (1 - tasaConIva));

  while (totalCent - totalDescontadoStripeCentavos(totalCent) < honorariosCent) {
    totalCent += 1;
  }

  const comisionStripeCent = comisionStripeCentavos(totalCent);
  const ivaStripeCent = ivaStripeCentavos(comisionStripeCent);
  const comisionCent = totalCent - honorariosCent;
  const ajusteCent = Math.max(0, comisionCent - comisionStripeCent - ivaStripeCent);

  return {
    montoHonorarios: honorariosCent / 100,
    comision: comisionCent / 100,
    comisionStripe: comisionStripeCent / 100,
    ivaStripe: ivaStripeCent / 100,
    ajusteRedondeo: ajusteCent / 100,
    total: totalCent / 100,
    centavosHonorarios: honorariosCent,
    centavosComision: comisionCent,
    centavosComisionStripe: comisionStripeCent,
    centavosIvaStripe: ivaStripeCent,
    centavosTotal: totalCent,
  };
}

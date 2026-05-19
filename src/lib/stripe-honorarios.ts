/** Comisión por uso de plataforma de pago con tarjeta (sobre el monto de honorarios). */
export const COMISION_PLATAFORMA_PCT = 0.03;

export type DesgloseCobro = {
  montoHonorarios: number;
  comision: number;
  total: number;
  centavosHonorarios: number;
  centavosComision: number;
  centavosTotal: number;
};

export function calcularCobroHonorarios(montoHonorarios: number): DesgloseCobro {
  const base = Math.max(0, Math.round(montoHonorarios * 100) / 100);
  const comision = Math.round(base * COMISION_PLATAFORMA_PCT * 100) / 100;
  const total = Math.round((base + comision) * 100) / 100;
  return {
    montoHonorarios: base,
    comision,
    total,
    centavosHonorarios: Math.round(base * 100),
    centavosComision: Math.round(comision * 100),
    centavosTotal: Math.round(total * 100),
  };
}

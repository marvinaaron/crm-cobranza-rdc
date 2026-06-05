import type { Periodo } from "@/lib/clientes";

export type PagoHonorarioStripe = {
  periodo: Periodo;
  montoHonorarios: number;
};

/**
 * Pago en línea de un "trabajo adicional" (extra por cobrar). El abono se
 * atribuye a un periodo (mes/anio) para que cuente como cobrado de ese mes,
 * y se vincula al `extraEsperadoId` para descontar su saldo.
 */
export type PagoExtraStripe = {
  extraEsperadoId: string;
  concepto: string;
  monto: number;
  mes: number;
  anio: number;
};

export type CheckoutStripeBody = {
  clienteId: number;
  razonSocial: string;
  mes?: number;
  anio?: number;
  montoHonorarios?: number;
  pagos?: PagoHonorarioStripe[];
  extra?: PagoExtraStripe;
};

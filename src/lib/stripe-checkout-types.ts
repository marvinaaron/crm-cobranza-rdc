import type { Periodo } from "@/lib/clientes";

export type PagoHonorarioStripe = {
  periodo: Periodo;
  montoHonorarios: number;
};

export type CheckoutStripeBody = {
  clienteId: number;
  razonSocial: string;
  mes?: number;
  anio?: number;
  montoHonorarios?: number;
  pagos?: PagoHonorarioStripe[];
};

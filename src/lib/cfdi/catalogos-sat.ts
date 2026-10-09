/** Catálogos SAT simplificados para mostrar en consulta (sin códigos crudos). */

export const FORMA_PAGO: Record<string, string> = {
  "01": "Efectivo",
  "02": "Cheque nominativo",
  "03": "Transferencia",
  "04": "Tarjeta de crédito",
  "05": "Monedero electrónico",
  "06": "Dinero electrónico",
  "08": "Vales de despensa",
  "12": "Dación en pago",
  "13": "Pago por subrogación",
  "14": "Pago por consignación",
  "15": "Condonación",
  "17": "Compensación",
  "23": "Novación",
  "24": "Confusión",
  "25": "Remisión de deuda",
  "26": "Prescripción o caducidad",
  "27": "A satisfacción del acreedor",
  "28": "Tarjeta de débito",
  "29": "Tarjeta de servicios",
  "30": "Aplicación de anticipos",
  "31": "Intermediario pagos",
  "99": "Por definir",
};

export const METODO_PAGO: Record<string, string> = {
  PUE: "Pago en una sola exhibición",
  PPD: "Pago en parcialidades o diferido",
};

export function etiquetaFormaPago(codigo?: string | null): string {
  if (!codigo) return "—";
  return FORMA_PAGO[codigo] ?? `Forma ${codigo}`;
}

export function etiquetaMetodoPago(codigo?: string | null): string {
  if (!codigo) return "—";
  return METODO_PAGO[codigo] ?? codigo;
}

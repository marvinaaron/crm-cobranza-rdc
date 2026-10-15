/** Cuentas SPEI del despacho en el portal del cliente. */

export type CuentaBancariaPortal = {
  id: "bbva" | "revolut";
  banco: string;
  titular: string;
  clabe: string;
  clabeDisplay: string;
  nota?: string;
};

export const CUENTAS_BANCARIAS_PORTAL: readonly CuentaBancariaPortal[] = [
  {
    id: "bbva",
    banco: "BBVA",
    titular: "Aaron Rosales",
    clabe: "012180015696966985",
    clabeDisplay: "0121 8001 5696 9669 85",
  },
  {
    id: "revolut",
    banco: "Revolut",
    titular: "Aaron Rosales",
    clabe: "646990404053101877",
    clabeDisplay: "6469 9040 4053 1018 77",
    nota: "Cuenta alternativa, por si BBVA no te funciona.",
  },
] as const;

/** Cuenta principal (BBVA). Conservada para usos que esperan una sola cuenta. */
export const DATOS_BANCARIOS_PORTAL = CUENTAS_BANCARIAS_PORTAL[0];

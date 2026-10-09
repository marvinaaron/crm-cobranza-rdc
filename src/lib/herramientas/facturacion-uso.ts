/**
 * Límites freemium — Calculadora de Facturación.
 * 3 cálculos anónimos + 1 extra al verificar cuenta (Fase 2).
 */

export const LIMITE_VISITANTE_ANONIMO = 3;
export const LIMITE_CON_CUENTA_VERIFICADA = 4;
export const COOKIE_VISITOR = "rdc-herramientas-visitor";

export type EstadoUsoFacturacion = {
  visitorId: string;
  calculosUsados: number;
  cuentaVerificada: boolean;
  esPro: boolean;
  limite: number;
  restantes: number;
  puedeCalcular: boolean;
  requiereCuenta: boolean;
  requierePago: boolean;
};

export function evaluarUsoFacturacion(row: {
  calculos: number;
  cuentaVerificada: boolean;
  esPro: boolean;
}): Omit<EstadoUsoFacturacion, "visitorId"> {
  const { calculos, cuentaVerificada, esPro } = row;

  if (esPro) {
    return {
      calculosUsados: calculos,
      cuentaVerificada,
      esPro: true,
      limite: Number.POSITIVE_INFINITY,
      restantes: Number.POSITIVE_INFINITY,
      puedeCalcular: true,
      requiereCuenta: false,
      requierePago: false,
    };
  }

  const limite = cuentaVerificada
    ? LIMITE_CON_CUENTA_VERIFICADA
    : LIMITE_VISITANTE_ANONIMO;
  const restantes = Math.max(0, limite - calculos);
  const puedeCalcular = calculos < limite;

  if (puedeCalcular) {
    return {
      calculosUsados: calculos,
      cuentaVerificada,
      esPro: false,
      limite,
      restantes,
      puedeCalcular: true,
      requiereCuenta: false,
      requierePago: false,
    };
  }

  if (!cuentaVerificada && calculos >= LIMITE_VISITANTE_ANONIMO) {
    return {
      calculosUsados: calculos,
      cuentaVerificada: false,
      esPro: false,
      limite,
      restantes: 0,
      puedeCalcular: false,
      requiereCuenta: true,
      requierePago: false,
    };
  }

  return {
    calculosUsados: calculos,
    cuentaVerificada,
    esPro: false,
    limite,
    restantes: 0,
    puedeCalcular: false,
    requiereCuenta: false,
    requierePago: true,
  };
}

export function nuevoVisitorId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

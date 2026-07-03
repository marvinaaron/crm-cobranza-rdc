/** Calculadoras con límite freemium (3 intentos c/u). */
export type CalculadoraId = "rfc" | "resico" | "facturacion" | "vencimiento";

export const CALCULADORAS_CON_LIMITE: CalculadoraId[] = [
  "rfc",
  "resico",
  "facturacion",
  "vencimiento",
];

export const LIMITE_CALCULADORA = 3;
export const COOKIE_VISITOR = "rdc-herramientas-visitor";
export const COOKIE_USO_LOCAL = "rdc-herramientas-uso-local";

export type EstadoUsoCalculadora = {
  herramienta: CalculadoraId;
  visitorId: string;
  calculosUsados: number;
  esPro: boolean;
  limite: number;
  restantes: number;
  puedeCalcular: boolean;
  requierePago: boolean;
};

export function evaluarUsoCalculadora(
  herramienta: CalculadoraId,
  visitorId: string,
  calculos: number,
  esPro: boolean
): EstadoUsoCalculadora {
  if (esPro) {
    return {
      herramienta,
      visitorId,
      calculosUsados: calculos,
      esPro: true,
      limite: Number.POSITIVE_INFINITY,
      restantes: Number.POSITIVE_INFINITY,
      puedeCalcular: true,
      requierePago: false,
    };
  }

  const limite = LIMITE_CALCULADORA;
  const restantes = Math.max(0, limite - calculos);
  const puedeCalcular = calculos < limite;

  return {
    herramienta,
    visitorId,
    calculosUsados: calculos,
    esPro: false,
    limite,
    restantes,
    puedeCalcular,
    requierePago: !puedeCalcular,
  };
}

export function nuevoVisitorId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function esCalculadoraId(v: string): v is CalculadoraId {
  return (CALCULADORAS_CON_LIMITE as string[]).includes(v);
}

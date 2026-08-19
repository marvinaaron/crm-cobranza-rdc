import type { HerramientaId } from "@/lib/seo/herramientas-config";

/** Precios en MXN — bundle desbloquea todas las herramientas. */
export const PRECIO_HERRAMIENTA_MENSUAL = 79;
export const PRECIO_BUNDLE_MENSUAL = 249;
export const PRECIO_BUNDLE_ANUAL = 899;
export const PRECIO_BUNDLE_LIFETIME = 1499;

export const LIMITE_GRATIS_POR_HERRAMIENTA = 3;

export type PlanHerramientasId =
  | "herramienta-mensual"
  | "bundle-mensual"
  | "bundle-anual"
  | "bundle-lifetime";

export type PlanHerramientas = {
  id: PlanHerramientasId;
  nombre: string;
  precio: number;
  periodo: string;
  destacado?: boolean;
  ahorro?: string;
  bullets: string[];
  stripeMode: "subscription" | "payment";
  stripeInterval?: "month" | "year";
};

export const PLANES_HERRAMIENTAS: PlanHerramientas[] = [
  {
    id: "herramienta-mensual",
    nombre: "Una herramienta",
    precio: PRECIO_HERRAMIENTA_MENSUAL,
    periodo: "/mes",
    bullets: [
      "1 herramienta a tu elección",
      "Consultas ilimitadas en esa herramienta",
      "Actualizaciones fiscales incluidas",
    ],
    stripeMode: "subscription",
    stripeInterval: "month",
  },
  {
    id: "bundle-mensual",
    nombre: "Todas las herramientas",
    precio: PRECIO_BUNDLE_MENSUAL,
    periodo: "/mes",
    destacado: true,
    bullets: [
      "Las 10 herramientas fiscales incluidas",
      "Consultas ilimitadas en todo el suite",
      "Nuevas herramientas sin costo extra",
      "Soporte prioritario por correo",
    ],
    stripeMode: "subscription",
    stripeInterval: "month",
  },
  {
    id: "bundle-anual",
    nombre: "Todas · Anual",
    precio: PRECIO_BUNDLE_ANUAL,
    periodo: "/año",
    ahorro: "Ahorra vs. 12 meses",
    bullets: [
      "Acceso completo por 12 meses",
      "Ideal para despachos y freelancers",
      "Facturación anual en un solo pago",
    ],
    stripeMode: "subscription",
    stripeInterval: "year",
  },
  {
    id: "bundle-lifetime",
    nombre: "Todas · Lifetime",
    precio: PRECIO_BUNDLE_LIFETIME,
    periodo: "pago único",
    bullets: [
      "Acceso de por vida a todo el suite",
      "Sin renovaciones ni sorpresas",
      "Incluye herramientas futuras",
    ],
    stripeMode: "payment",
  },
];

export const PLAN_FAVORITO_ID: PlanHerramientasId = "bundle-mensual";

export function getPlanHerramientas(id: PlanHerramientasId): PlanHerramientas {
  const plan = PLANES_HERRAMIENTAS.find((p) => p.id === id);
  if (!plan) throw new Error(`Plan desconocido: ${id}`);
  return plan;
}

export function formatPrecioMxn(monto: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
}

export const ETIQUETAS_HERRAMIENTA: Record<HerramientaId, string> = {
  rfc: "Calculadora RFC",
  resico: "ISR RESICO",
  facturacion: "Facturación neto → CFDI",
  vencimiento: "Vencimiento declaración",
  inpc: "INPC histórico",
  isr: "Tarifas ISR 2026",
  uma: "UMA vigente",
  salario: "Salario mínimo",
  "recargos-sat": "Recargos y actualización SAT",
  recargos: "Recargos federales",
  divisas: "Tipo de cambio",
  sdi: "Salario Diario Integrado",
  "prima-vacacional": "Prima Vacacional",
};

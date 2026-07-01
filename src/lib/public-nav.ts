import type { MegaMenuIconKey } from "@/lib/public-nav";
  href: string;
  label: string;
  descripcion: string;
  nuevo?: boolean;
};

export type MegaMenuSection = {
  titulo: string;
  items: MegaMenuLink[];
};

export type MegaMenuFooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

export type MegaMenuConfig = {
  id: string;
  label: string;
  href: string;
  sections: MegaMenuSection[];
  footer: MegaMenuFooterLink[];
};

export const MEGA_SERVICIOS: MegaMenuConfig = {
  id: "servicios",
  label: "Servicios",
  href: "/servicios",
  sections: [
    {
      titulo: "Contabilidad mensual",
      items: [
        {
          href: "/servicios",
          label: "RESICO · personas físicas",
          descripcion: "Desde $812/mes · declaraciones y portal incluidos",
        },
        {
          href: "/servicios",
          label: "Personas morales con nómina",
          descripcion: "IVA, ISR, IMSS, INFONAVIT y cumplimiento mensual",
        },
        {
          href: "/servicios",
          label: "Honorarios y cotización",
          descripcion: "Precios transparentes por régimen fiscal",
        },
      ],
    },
    {
      titulo: "Servicios especializados",
      items: [
        {
          href: "/servicios",
          label: "REPSE · ICSOE · SISUB",
          descripcion: "Cumplimiento laboral y contratos de servicios",
        },
        {
          href: "/servicios",
          label: "Declaración anual",
          descripcion: "Personas físicas y morales · sin sorpresas",
        },
        {
          href: "/comparativa",
          label: "Portal vs otros despachos",
          descripcion: "Por qué RDC es distinto a un contador tradicional",
        },
      ],
    },
    {
      titulo: "Tu experiencia",
      items: [
        {
          href: "/proceso",
          label: "Cómo trabajamos",
          descripcion: "Flujo mes a mes: previo, declaración y portal",
        },
        {
          href: "/nosotros",
          label: "Conoce al equipo",
          descripcion: "Aaron Rosales · +10 años en Guadalajara",
        },
        {
          href: "/empezar",
          label: "Empezar con RDC",
          descripcion: "Cotización gratis · sin compromiso",
          nuevo: true,
        },
      ],
    },
  ],
  footer: [
    { href: "/empezar", label: "Solicitar cotización" },
    { href: "/contacto", label: "Hablar por WhatsApp" },
    { href: "/portal/login", label: "Acceso clientes" },
  ],
};

export const MEGA_HERRAMIENTAS: MegaMenuConfig = {
  id: "herramientas",
  label: "Herramientas",
  href: "/herramientas",
  sections: [
    {
      titulo: "Calculadoras",
      items: [
        {
          href: "/herramientas/rfc",
          label: "Calculadora de RFC",
          descripcion: "Persona física con homoclave SAT",
          nuevo: true,
        },
        {
          href: "/herramientas/isr-resico",
          label: "ISR RESICO",
          descripcion: "Estima tu impuesto del mes",
          nuevo: true,
        },
        {
          href: "/herramientas/calculadora-facturacion",
          label: "Facturación neto → CFDI",
          descripcion: "Subtotal con IVA y retenciones",
          nuevo: true,
        },
        {
          href: "/herramientas/vencimiento-declaracion",
          label: "Vencimiento de declaración",
          descripcion: "Fecha límite según tu RFC",
          nuevo: true,
        },
      ],
    },
    {
      titulo: "Tablas fiscales",
      items: [
        {
          href: "/herramientas/isr-2026",
          label: "Tarifas ISR 2026",
          descripcion: "Anual, retenciones, provisionales y RIF",
        },
        {
          href: "/herramientas/inpc",
          label: "INPC · INEGI",
          descripcion: "Índice nacional de precios al consumidor",
        },
        {
          href: "/herramientas/uma",
          label: "UMA vigente",
          descripcion: "Unidad de medida y actualización",
        },
        {
          href: "/herramientas/salario-minimo-2026",
          label: "Salario mínimo 2026",
          descripcion: "Zona general y frontera norte",
        },
        {
          href: "/herramientas/recargos-federales",
          label: "Recargos federales",
          descripcion: "Pago extemporáneo ante el SAT",
        },
        {
          href: "/herramientas/tipo-de-cambio",
          label: "Tipo de cambio",
          descripcion: "USD FIX, UDI, TIIE y divisas",
        },
      ],
    },
    {
      titulo: "Para tu negocio",
      items: [
        {
          href: "/herramientas",
          label: "Todas las herramientas",
          descripcion: "Hub completo · gratis y sin registro",
        },
        {
          href: "/blog",
          label: "Artículos del blog",
          descripcion: "Guías fiscales y novedades SAT",
        },
        {
          href: "/preguntas-frecuentes",
          label: "Preguntas frecuentes",
          descripcion: "RESICO, portal, honorarios y más",
        },
      ],
    },
  ],
  footer: [
    { href: "/herramientas", label: "Ver todas las herramientas" },
    { href: "/empezar", label: "¿Quieres que lo hagamos por ti?" },
    { href: "/contacto", label: "Contactar al despacho" },
  ],
};

export const MEGA_RECURSOS: MegaMenuConfig = {
  id: "recursos",
  label: "Recursos",
  href: "/blog",
  sections: [
    {
      titulo: "Aprende y conecta",
      items: [
        {
          href: "/blog",
          label: "Blog fiscal",
          descripcion: "Artículos, guías y novedades del SAT",
        },
        {
          href: "/preguntas-frecuentes",
          label: "Preguntas frecuentes",
          descripcion: "RESICO, portal, cobranza y trámites",
        },
        {
          href: "/nosotros",
          label: "Nosotros",
          descripcion: "Equipo, historia y portal propio",
        },
        {
          href: "/proceso",
          label: "Cómo trabajamos",
          descripcion: "Flujo transparente mes con mes",
        },
      ],
    },
    {
      titulo: "Conoce RDC",
      items: [
        {
          href: "/comparativa",
          label: "Comparativa de despachos",
          descripcion: "Portal, precios y atención personalizada",
        },
        {
          href: "/mundial-2026",
          label: "Mundial 2026 · divertido",
          descripcion: "Quiniela del despacho (clientes y amigos)",
        },
        {
          href: "/aviso-de-privacidad",
          label: "Aviso de privacidad",
          descripcion: "Cómo protegemos tus datos",
        },
      ],
    },
    {
      titulo: "Herramientas destacadas",
      items: [
        {
          href: "/herramientas/rfc",
          label: "Calculadora de RFC",
          descripcion: "Homoclave gratis al instante",
          nuevo: true,
        },
        {
          href: "/herramientas/calculadora-facturacion",
          label: "Calculadora de facturación",
          descripcion: "Neto deseado → monto a facturar",
          nuevo: true,
        },
        {
          href: "/herramientas",
          label: "Todas las herramientas",
          descripcion: "10+ calculadoras y tablas fiscales",
        },
      ],
    },
  ],
  footer: [
    { href: "/contacto", label: "Contactar ventas" },
    { href: "/empezar", label: "Empezar ahora" },
    { href: "/blog", label: "Leer el blog" },
  ],
};

export const NAV_MEGA_MENUS: MegaMenuConfig[] = [
  MEGA_SERVICIOS,
  MEGA_HERRAMIENTAS,
  MEGA_RECURSOS,
];

export const NAV_LINKS_SIMPLES = [
  { href: "/contacto", label: "Contacto" },
] as const;

/** Evita importar React en el config del servidor; los iconos viven en el componente. */
export type MegaMenuIconKey =
  | "document"
  | "calculator"
  | "chart"
  | "users"
  | "book"
  | "grid"
  | "sparkles"
  | "calendar"
  | "shield"
  | "wallet";

export function iconKeyForHref(href: string, section: string): MegaMenuIconKey {
  if (href.includes("herramientas") || section.toLowerCase().includes("herramienta")) {
    if (href.includes("rfc") || href.includes("resico") || href.includes("facturacion")) {
      return "calculator";
    }
    return "chart";
  }
  if (href.includes("blog") || href.includes("preguntas")) return "book";
  if (href.includes("proceso") || href.includes("nosotros")) return "users";
  if (href.includes("empezar") || href.includes("contacto")) return "sparkles";
  if (href.includes("servicios")) return "wallet";
  return "document";
}

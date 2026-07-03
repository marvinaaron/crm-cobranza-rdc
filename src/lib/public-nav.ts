export type MegaMenuLink = {
  href: string;
  label: string;
  descripcion?: string;
  nuevo?: boolean;
  destacado?: boolean;
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
      titulo: "Experiencia RDC",
      items: [
        { href: "/proceso", label: "Cómo trabajamos", destacado: true },
        { href: "/nosotros", label: "Conoce al equipo", destacado: true },
        { href: "/servicios", label: "Servicios y honorarios", destacado: true },
      ],
    },
    {
      titulo: "Personas físicas",
      items: [
        { href: "/servicios/resico", label: "RESICO (626)" },
        { href: "/servicios/actividades-empresariales", label: "Actividades empresariales (612)" },
        { href: "/servicios/plataformas-tecnologicas", label: "Plataformas tecnológicas (625)" },
        { href: "/servicios/arrendamiento", label: "Arrendamiento (606)" },
        { href: "/servicios/sueldos-salarios", label: "Sueldos y salarios (605)" },
        { href: "/servicios/rif", label: "RIF en transición (621)" },
      ],
    },
    {
      titulo: "Personas morales",
      items: [
        { href: "/servicios/regimen-general", label: "Régimen general (601)" },
        { href: "/servicios/fines-no-lucrativos", label: "Fines no lucrativos (603)" },
      ],
    },
    {
      titulo: "Otras especialidades",
      items: [
        { href: "/servicios/repse", label: "REPSE" },
        { href: "/servicios/icsoe", label: "ICSOE" },
        { href: "/servicios/sisub", label: "SISUB" },
        { href: "/comparativa", label: "Portal vs otros despachos" },
        { href: "/empezar", label: "Empezar con RDC", nuevo: true },
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
        { href: "/herramientas", label: "Todas las herramientas" },
        { href: "/herramientas/rfc", label: "Calcula tu RFC", nuevo: true },
        { href: "/herramientas/isr-resico", label: "Calcula ISR RESICO", nuevo: true },
        {
          href: "/herramientas/calculadora-facturacion",
          label: "Factura neto → CFDI",
          nuevo: true,
        },
        {
          href: "/herramientas/vencimiento-declaracion",
          label: "¿Cuándo vence mi declaración?",
          nuevo: true,
        },
      ],
    },
    {
      titulo: "Tablas fiscales",
      items: [
        { href: "/herramientas/isr-2026", label: "Tarifas ISR 2026" },
        { href: "/herramientas/inpc", label: "INPC · INEGI" },
        { href: "/herramientas/uma", label: "UMA vigente" },
        { href: "/herramientas/salario-minimo-2026", label: "Salario mínimo 2026" },
        { href: "/herramientas/recargos-federales", label: "Recargos federales" },
        { href: "/herramientas/tipo-de-cambio", label: "Tipo de cambio" },
      ],
    },
  ],
  footer: [
    { href: "/herramientas/pro", label: "Cliente Pro+ · planes" },
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
        { href: "/blog", label: "Blog fiscal" },
        { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
        { href: "/nosotros", label: "Nosotros" },
        { href: "/proceso", label: "Cómo trabajamos" },
      ],
    },
    {
      titulo: "Conoce RDC",
      items: [
        { href: "/comparativa", label: "Comparativa de despachos" },
        { href: "/mundial-2026", label: "Mundial 2026" },
        { href: "/aviso-de-privacidad", label: "Aviso de privacidad" },
      ],
    },
    {
      titulo: "Herramientas destacadas",
      items: [
        { href: "/herramientas/rfc", label: "Calcula tu RFC", nuevo: true },
        {
          href: "/herramientas/calculadora-facturacion",
          label: "Calculadora de facturación",
          nuevo: true,
        },
        { href: "/herramientas", label: "Todas las herramientas" },
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
  | "wallet"
  | "football"
  | "building"
  | "user"
  | "smartphone"
  | "percent"
  | "help"
  | "columns"
  | "lock"
  | "receipt"
  | "table"
  | "trending"
  | "banknote"
  | "alert"
  | "exchange"
  | "briefcase"
  | "file-check"
  | "workflow"
  | "idcard"
  | "phone"
  | "login"
  | "star"
  | "scale";

/** Solo color del trazo — sin fondo ni borde en el icono. */
export function iconStyleForHref(href: string, label?: string): string {
  const l = label?.toLowerCase() ?? "";
  if (href.includes("/herramientas/rfc")) return "text-indigo-600";
  if (href.includes("vencimiento-declaracion")) return "text-amber-600";
  if (href.includes("isr-resico")) return "text-violet-600";
  if (href.includes("calculadora-facturacion")) return "text-indigo-600";
  if (href.includes("isr-2026")) return "text-amber-600";
  if (href.includes("/herramientas/inpc")) return "text-emerald-600";
  if (href.includes("/herramientas/uma")) return "text-violet-600";
  if (href.includes("salario-minimo")) return "text-sky-600";
  if (href.includes("recargos-federales")) return "text-rose-600";
  if (href.includes("tipo-de-cambio")) return "text-slate-600";
  if (href.includes("/herramientas/pro")) return "text-violet-600";
  if (href.includes("/herramientas")) return "text-teal-600";
  if (href.includes("/empezar")) return "text-emerald-600";
  if (href.includes("/contacto")) return "text-green-600";
  if (href.includes("/blog")) return "text-sky-600";
  if (href.includes("preguntas-frecuentes")) return "text-blue-600";
  if (href.includes("/nosotros")) return "text-rose-600";
  if (href.includes("/proceso")) return "text-cyan-600";
  if (href.includes("/comparativa")) return "text-indigo-600";
  if (href.includes("/mundial-2026")) return "text-lime-700";
  if (href.includes("/servicios/sueldos-salarios")) return "text-slate-600";
  if (href.includes("/servicios/resico")) return "text-violet-600";
  if (href.includes("/servicios/actividades-empresariales")) return "text-cyan-600";
  if (href.includes("/servicios/arrendamiento")) return "text-amber-600";
  if (href.includes("/servicios/plataformas-tecnologicas")) return "text-emerald-600";
  if (href.includes("/servicios/rif")) return "text-stone-600";
  if (href.includes("/servicios/regimen-general")) return "text-indigo-600";
  if (href.includes("/servicios/fines-no-lucrativos")) return "text-rose-600";
  if (l.includes("repse")) return "text-amber-700";
  if (l.includes("icsoe")) return "text-emerald-700";
  if (l.includes("sisub")) return "text-rose-700";
  if (href.includes("/servicios") && !href.includes("/servicios/")) return "text-marca-navy";
  if (href.includes("/servicios")) return "text-marca-navy";
  if (href.includes("/portal")) return "text-slate-600";
  if (href.includes("aviso-de-privacidad")) return "text-slate-500";
  return "text-orange-600";
}

export function iconKeyForHref(
  href: string,
  _section: string,
  label?: string
): MegaMenuIconKey {
  const l = label?.toLowerCase() ?? "";

  if (href === "/herramientas") return "grid";
  if (href.includes("mundial-2026")) return "football";
  if (href.includes("aviso-de-privacidad")) return "lock";
  if (href.includes("preguntas-frecuentes")) return "help";
  if (href.includes("/comparativa") || l.includes("portal vs")) return "columns";
  if (href.includes("/blog") || l.includes("leer el blog")) return "book";
  if (href.includes("/nosotros")) return "users";
  if (href.includes("/proceso")) return "workflow";
  if (href.includes("/empezar") || l.includes("empezar") || l.includes("cotización")) return "sparkles";
  if (href.includes("/contacto") || l.includes("whatsapp") || l.includes("contactar")) return "phone";
  if (href.includes("/portal")) return "login";
  if (href.includes("herramientas/pro")) return "star";
  if (href.includes("/herramientas/rfc")) return "idcard";
  if (href.includes("isr-resico")) return "calculator";
  if (href.includes("calculadora-facturacion")) return "receipt";
  if (href.includes("vencimiento-declaracion")) return "calendar";
  if (href.includes("isr-2026")) return "table";
  if (href.includes("/herramientas/inpc")) return "trending";
  if (href.includes("/herramientas/uma")) return "scale";
  if (href.includes("salario-minimo")) return "banknote";
  if (href.includes("recargos-federales")) return "alert";
  if (href.includes("tipo-de-cambio")) return "exchange";
  if (href.includes("/servicios/sueldos-salarios")) return "briefcase";
  if (href.includes("/servicios/resico")) return "percent";
  if (href.includes("/servicios/actividades-empresariales")) return "user";
  if (href.includes("/servicios/arrendamiento")) return "building";
  if (href.includes("/servicios/plataformas-tecnologicas")) return "smartphone";
  if (href.includes("/servicios/rif")) return "trending";
  if (href.includes("/servicios/regimen-general")) return "building";
  if (href.includes("/servicios/fines-no-lucrativos")) return "shield";
  if (l.includes("declaración")) return "file-check";
  if (l.includes("repse") || l.includes("icsoe")) return "briefcase";
  if (l.includes("sisub")) return "shield";
  if (href.includes("/servicios")) return "wallet";
  if (href.includes("herramientas")) return "chart";
  return "document";
}

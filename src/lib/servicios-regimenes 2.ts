export type RegimenSlug =
  | "resico"
  | "personas-fisicas"
  | "personas-morales"
  | "plataformas-digitales";

export type RegimenServicio = {
  slug: RegimenSlug;
  titulo: string;
  subtitulo: string;
  badge: string;
  metaDescription: string;
  keywords: string[];
  heroFrom: string;
  heroTo: string;
  iconBg: string;
  iconColor: string;
  paraQuien: string[];
  queHacemos: { titulo: string; texto: string }[];
  cumplimiento: string[];
  portal: string[];
  precio?: { monto?: string; nota: string };
  herramienta?: { href: string; label: string };
};

export const REGIMENES_SERVICIO: Record<RegimenSlug, RegimenServicio> = {
  resico: {
    slug: "resico",
    titulo: "RESICO",
    subtitulo:
      "Régimen Simplificado de Confianza para personas físicas con actividad empresarial, profesional o de arrendamiento.",
    badge: "Persona física · más solicitado",
    metaDescription:
      "Contabilidad mensual RESICO: ISR con tasas bajas, declaraciones, declaración anual incluida y portal de cliente. Desde $812/mes IVA incluido.",
    keywords: [
      "contador RESICO Guadalajara",
      "contabilidad RESICO precio",
      "declaración RESICO mensual",
    ],
    heroFrom: "from-violet-950",
    heroTo: "to-indigo-950",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    paraQuien: [
      "Profesionistas y prestadores de servicios independientes",
      "Arrendadores de inmuebles con ingresos moderados",
      "Personas físicas con ingresos anuales hasta $3.5 MDP",
      "Quienes buscan tasas de ISR bajas sin deducciones complejas",
    ],
    queHacemos: [
      {
        titulo: "ISR mensual RESICO",
        texto: "Calculamos y presentamos tu pago provisional con las tasas del 1% al 2.5% sobre ingresos cobrados.",
      },
      {
        titulo: "IVA y retenciones",
        texto: "Conciliamos CFDIs, retenciones recibidas y devoluciones cuando te retienen de más.",
      },
      {
        titulo: "Declaración anual incluida",
        texto: "Cerramos el ejercicio, revisamos límites de ingreso y te acompañamos en la anual sin costo extra.",
      },
      {
        titulo: "Portal en tiempo real",
        texto: "Ves acuses del SAT, calendario de vencimientos y estado de tu mes sin esperar al contador.",
      },
    ],
    cumplimiento: [
      "Pago provisional ISR RESICO",
      "Declaración informativa de IVA",
      "DIOT cuando aplica",
      "Declaración anual persona física",
      "Buzón tributario monitoreado",
      "Asesoría por WhatsApp en horario hábil",
    ],
    portal: [
      "Acuses de declaraciones mensuales",
      "Previo de impuestos antes de pagar",
      "Calendario de vencimientos por RFC",
      "Honorarios y factura digital",
      "Historial de cumplimiento mes a mes",
    ],
    precio: { monto: "$812", nota: "IVA incluido · declaración anual incluida" },
    herramienta: {
      href: "/herramientas/isr-resico",
      label: "Calculadora ISR RESICO",
    },
  },
  "personas-fisicas": {
    slug: "personas-fisicas",
    titulo: "Personas físicas",
    subtitulo:
      "Actividad empresarial y profesional en régimen general (PFAE): honorarios, arrendamiento y actividades con deducciones.",
    badge: "PFAE · régimen general",
    metaDescription:
      "Contabilidad para personas físicas con actividad empresarial: ISR, IVA, deducciones, declaración anual y portal de cliente en Guadalajara.",
    keywords: [
      "contador persona física actividad empresarial",
      "contabilidad PFAE",
      "honorarios contador persona física",
    ],
    heroFrom: "from-cyan-950",
    heroTo: "to-sky-950",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    paraQuien: [
      "Profesionistas con ingresos que superan el límite RESICO",
      "Arrendadores con gastos deducibles significativos",
      "Personas físicas con actividad empresarial mixta",
      "Quienes necesitan optimizar deducciones autorizadas",
    ],
    queHacemos: [
      {
        titulo: "Contabilidad electrónica",
        texto: "Registramos pólizas, auxiliares y XML al SAT conforme a NIF.",
      },
      {
        titulo: "ISR con deducciones",
        texto: "Aplicamos tablas del régimen general y validamos gastos deducibles.",
      },
      {
        titulo: "IVA y retenciones",
        texto: "Calculamos IVA a cargo, retenciones recibidas y saldos a favor.",
      },
      {
        titulo: "Declaración anual",
        texto: "Cerramos ejercicio, saldos a favor y devoluciones cuando procede.",
      },
    ],
    cumplimiento: [
      "ISR provisional persona física",
      "IVA mensual",
      "Retenciones ISR e IVA",
      "DIOT",
      "Declaración anual",
      "Contabilidad electrónica SAT",
    ],
    portal: [
      "Estado de cumplimiento mensual",
      "Descarga de acuses y comprobantes",
      "Previo de impuestos del mes",
      "Calendario fiscal personalizado",
    ],
    precio: { nota: "Cotización personalizada según volumen y actividad" },
    herramienta: {
      href: "/herramientas/calculadora-facturacion",
      label: "Calculadora de facturación",
    },
  },
  "personas-morales": {
    slug: "personas-morales",
    titulo: "Personas morales",
    subtitulo:
      "Empresas con nómina, IVA acreditable, obligaciones laborales y cumplimiento integral ante SAT, IMSS e Infonavit.",
    badge: "Empresa · con o sin nómina",
    metaDescription:
      "Contabilidad mensual para personas morales: pólizas, nómina, IMSS, Infonavit, ISN, ISR, IVA y portal de cliente. Cotización en 24 h.",
    keywords: [
      "contador persona moral Guadalajara",
      "contabilidad empresa con nómina",
      "honorarios contador persona moral",
    ],
    heroFrom: "from-marca-navy",
    heroTo: "to-indigo-950",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    paraQuien: [
      "PYMES con empleados y nómina quincenal o mensual",
      "Empresas de servicios, comercio o manufactura",
      "Personas morales en régimen general o RESICO PM",
      "Dueños que quieren ver balanza y cumplimiento sin llamar al contador",
    ],
    queHacemos: [
      {
        titulo: "Contabilidad y balanzas",
        texto: "Pólizas, auxiliares, balanza de comprobación y estados financieros básicos.",
      },
      {
        titulo: "Nómina e IMSS",
        texto: "Cálculo, timbrado, SUA, IDSE, cuotas obrero-patronales e Infonavit.",
      },
      {
        titulo: "ISR e IVA empresarial",
        texto: "Provisionales, pagos definitivos, DIOT y retenciones a proveedores.",
      },
      {
        titulo: "ISN y estatal",
        texto: "Impuesto sobre nómina y obligaciones estatales según tu entidad.",
      },
    ],
    cumplimiento: [
      "ISR e IVA mensual persona moral",
      "Nómina timbrada y CFDI de nómina",
      "IMSS · SIPARE · SUA",
      "Infonavit",
      "ISN estatal",
      "DIOT y contabilidad electrónica",
      "Declaración anual PM",
    ],
    portal: [
      "Cumplimiento SAT, IMSS y estatal en un tablero",
      "Acuses y comprobantes descargables",
      "Estado de nómina y obligaciones laborales",
      "Honorarios con pago Stripe integrado",
    ],
    precio: { nota: "Cotización según número de trabajadores y volumen" },
  },
  "plataformas-digitales": {
    slug: "plataformas-digitales",
    titulo: "Plataformas digitales",
    subtitulo:
      "Ingresos por apps y marketplaces: Uber, Rappi, Mercado Libre, Airbnb y retenciones que exige el SAT.",
    badge: "Apps · marketplaces · retenciones",
    metaDescription:
      "Contabilidad para ingresos por plataformas digitales: retenciones 2.5%, RESICO, declaraciones y portal. Guadalajara y todo México.",
    keywords: [
      "contador plataformas digitales",
      "Uber contador México",
      "Mercado Libre impuestos contador",
      "retención plataformas digitales SAT",
    ],
    heroFrom: "from-emerald-950",
    heroTo: "to-teal-950",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    paraQuien: [
      "Conductores y repartidores de apps de movilidad",
      "Vendedores en marketplaces (Mercado Libre, Amazon, etc.)",
      "Anfitriones y prestadores en plataformas de hospedaje",
      "Creadores y freelancers con ingresos por plataformas",
    ],
    queHacemos: [
      {
        titulo: "Retenciones de plataformas",
        texto: "Conciliamos el 2.5% retenido, CFDIs de plataforma y tu facturación real.",
      },
      {
        titulo: "Régimen óptimo",
        texto: "Evaluamos RESICO vs PFAE según tu volumen y tipo de ingreso.",
      },
      {
        titulo: "Declaraciones mensuales",
        texto: "Presentamos ISR e IVA con la documentación que exige el SAT.",
      },
      {
        titulo: "Devoluciones de ISR",
        texto: "Cuando te retienen de más, gestionamos saldos a favor y devoluciones.",
      },
    ],
    cumplimiento: [
      "ISR mensual (RESICO o PFAE)",
      "IVA e informativas",
      "Conciliación retenciones plataforma",
      "Declaración anual",
      "CFDIs de plataformas y complementos",
    ],
    portal: [
      "Resumen de ingresos y retenciones del mes",
      "Acuses de declaraciones",
      "Calendario de obligaciones",
      "Asesoría cuando cambian reglas del SAT",
    ],
    precio: { monto: "$812", nota: "Desde · RESICO PF · IVA incluido" },
    herramienta: {
      href: "/herramientas/isr-resico",
      label: "Calcula tu ISR RESICO",
    },
  },
};

export const SLUGS_REGIMEN: RegimenSlug[] = [
  "resico",
  "personas-fisicas",
  "personas-morales",
  "plataformas-digitales",
];

export function regimenPorSlug(slug: string): RegimenServicio | null {
  if (slug in REGIMENES_SERVICIO) {
    return REGIMENES_SERVICIO[slug as RegimenSlug];
  }
  return null;
}

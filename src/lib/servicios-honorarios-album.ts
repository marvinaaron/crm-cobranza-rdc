import type { FiscalinoMood } from "@/components/Fiscalino";
import { ESPECIALIDADES_PAGINA, type EspecialidadSlug } from "@/lib/servicios-especialidades";
import { hrefEmpezarResico } from "@/lib/servicios-cotizables";
import { REGIMENES_SERVICIO, type RegimenSlug } from "@/lib/servicios-regimenes";

export type AlbumSlug = RegimenSlug | EspecialidadSlug;

export type ReciboAlbum = {
  slug: AlbumSlug;
  frase: string;
  mood: FiscalinoMood;
  precio:
    | { tipo: "publico"; monto: "$812"; periodo: "/ mes"; nota: "IVA incluido" }
    | { tipo: "cotizar"; etiqueta: "Cotizamos en 24 h"; nota: string };
  incluye: readonly string[];
  cta: { href: string; label: string };
  guia: { href: string; label: string };
};

const INCLUYE_RESICO = [
  "Alta o cambio a RESICO (clave 626) sin costo extra",
  "Cálculo y presentación mensual de ISR RESICO",
  "IVA mensual cuando aplique",
  "Emisión y control de CFDI",
  "Declaración anual incluida",
  "Portal de cliente con acuses",
] as const;

function incluyeRegimen(slug: RegimenSlug): string[] {
  return REGIMENES_SERVICIO[slug].queHacemos.map((q) => q.titulo);
}

function incluyeEspecialidad(slug: EspecialidadSlug): string[] {
  return ESPECIALIDADES_PAGINA[slug].queHacemos.map((q) => q.titulo);
}

const COTIZAR = "/cotizar";
const CONTRATAR_RESICO = hrefEmpezarResico();

export const RECIBOS_ALBUM: Record<AlbumSlug, ReciboAlbum> = {
  resico: {
    slug: "resico",
    frase: "Este es el más común. $812 al mes, IVA incluido.",
    mood: "celebrating",
    precio: { tipo: "publico", monto: "$812", periodo: "/ mes", nota: "IVA incluido" },
    incluye: INCLUYE_RESICO,
    cta: { href: CONTRATAR_RESICO, label: "Quiero contratar RESICO" },
    guia: { href: "/servicios/resico", label: "Ver guía RESICO" },
  },
  "sueldos-salarios": {
    slug: "sueldos-salarios",
    frase: "Aquí el patrón retiene. Te ayudamos con la anual.",
    mood: "confident",
    precio: {
      tipo: "cotizar",
      etiqueta: "Cotizamos en 24 h",
      nota: "Honorarios según la anual y las deducciones personales.",
    },
    incluye: incluyeRegimen("sueldos-salarios"),
    cta: { href: COTIZAR, label: "Cotizar este régimen" },
    guia: { href: "/servicios/sueldos-salarios", label: "Ver guía de sueldos" },
  },
  "actividades-empresariales": {
    slug: "actividades-empresariales",
    frase: "Contabilidad completa. Este sí se cotiza, no hay tarifa única.",
    mood: "happy",
    precio: {
      tipo: "cotizar",
      etiqueta: "Cotizamos en 24 h",
      nota: "El precio cierra al ver volumen, gastos y si hay personal.",
    },
    incluye: incluyeRegimen("actividades-empresariales"),
    cta: { href: COTIZAR, label: "Cotizar este régimen" },
    guia: { href: "/servicios/actividades-empresariales", label: "Ver guía PFAE" },
  },
  arrendamiento: {
    slug: "arrendamiento",
    frase: "Rentas, depreciación y CFDI a inquilinos.",
    mood: "confident",
    precio: {
      tipo: "cotizar",
      etiqueta: "Cotizamos en 24 h",
      nota: "Depende de cuántos inmuebles y si hay IVA.",
    },
    incluye: incluyeRegimen("arrendamiento"),
    cta: { href: COTIZAR, label: "Cotizar este régimen" },
    guia: { href: "/servicios/arrendamiento", label: "Ver guía de arrendamiento" },
  },
  "plataformas-tecnologicas": {
    slug: "plataformas-tecnologicas",
    frase: "Uber, DiDi, Rappi. Las retenciones de la app no son toda la historia.",
    mood: "happy",
    precio: {
      tipo: "cotizar",
      etiqueta: "Cotizamos en 24 h",
      nota: "Revisamos si te conviene quedarte o pasar a RESICO.",
    },
    incluye: incluyeRegimen("plataformas-tecnologicas"),
    cta: { href: COTIZAR, label: "Cotizar este régimen" },
    guia: { href: "/servicios/plataformas-tecnologicas", label: "Ver guía de plataformas" },
  },
  rif: {
    slug: "rif",
    frase: "El RIF ya no admite altas. Te pasamos a RESICO cuando convenga.",
    mood: "worried",
    precio: {
      tipo: "cotizar",
      etiqueta: "Cotizamos en 24 h",
      nota: "Diagnóstico de transición y cumplimiento bimestral mientras duras en 621.",
    },
    incluye: incluyeRegimen("rif"),
    cta: { href: COTIZAR, label: "Cotizar este régimen" },
    guia: { href: "/servicios/rif", label: "Ver guía RIF" },
  },
  "regimen-general": {
    slug: "regimen-general",
    frase: "Persona moral: libros, ISR, IVA y nómina si hay personal.",
    mood: "confident",
    precio: {
      tipo: "cotizar",
      etiqueta: "Cotizamos en 24 h",
      nota: "El paquete se arma con operaciones, empleados y complementos.",
    },
    incluye: incluyeRegimen("regimen-general"),
    cta: { href: COTIZAR, label: "Cotizar este régimen" },
    guia: { href: "/servicios/regimen-general", label: "Ver guía de persona moral" },
  },
  "fines-no-lucrativos": {
    slug: "fines-no-lucrativos",
    frase: "Asociación o donataria. El IVA no se apaga por ser 603.",
    mood: "happy",
    precio: {
      tipo: "cotizar",
      etiqueta: "Cotizamos en 24 h",
      nota: "Depende del objeto social, donataria y si hay nómina.",
    },
    incluye: incluyeRegimen("fines-no-lucrativos"),
    cta: { href: COTIZAR, label: "Cotizar este régimen" },
    guia: { href: "/servicios/fines-no-lucrativos", label: "Ver guía 603" },
  },
  repse: {
    slug: "repse",
    frase: "Si subcontratas, el padrón no es opcional.",
    mood: "worried",
    precio: {
      tipo: "cotizar",
      etiqueta: "Cotizamos en 24 h",
      nota: "Alta, renovación a tres años e informes que vienen después.",
    },
    incluye: incluyeEspecialidad("repse"),
    cta: { href: COTIZAR, label: "Cotizar esta especialidad" },
    guia: { href: "/servicios/repse", label: "Ver guía REPSE" },
  },
  icsoe: {
    slug: "icsoe",
    frase: "Informe cuatrimestral al IMSS. Va de la mano con SISUB.",
    mood: "confident",
    precio: {
      tipo: "cotizar",
      etiqueta: "Cotizamos en 24 h",
      nota: "Paquete cuatrimestral o anual, con SISUB si aplica.",
    },
    incluye: incluyeEspecialidad("icsoe"),
    cta: { href: COTIZAR, label: "Cotizar esta especialidad" },
    guia: { href: "/servicios/icsoe", label: "Ver guía ICSOE" },
  },
  sisub: {
    slug: "sisub",
    frase: "Lo mismo, ante Infonavit. Los dos acuses salen juntos.",
    mood: "confident",
    precio: {
      tipo: "cotizar",
      etiqueta: "Cotizamos en 24 h",
      nota: "Mismos trabajadores que el ICSOE, otra autoridad.",
    },
    incluye: incluyeEspecialidad("sisub"),
    cta: { href: COTIZAR, label: "Cotizar esta especialidad" },
    guia: { href: "/servicios/sisub", label: "Ver guía SISUB" },
  },
};

export function reciboDe(slug: AlbumSlug): ReciboAlbum {
  return RECIBOS_ALBUM[slug];
}

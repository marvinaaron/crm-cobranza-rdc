/**
 * Dueto visual de las especialidades de subcontratación.
 * Misma receta que los expositores de régimen: campo oscuro + chispa.
 * Clases Tailwind en literales para el scanner.
 */
export type TonoEspecialidad = {
  campo: string;
  campoDeep: string;
  chispa: string;
  heroFrom: string;
  heroTo: string;
  bgCampo: string;
  textChispa: string;
  bgChispa: string;
  iconBg: string;
  iconColor: string;
  nav: string;
};

export const TONOS_ESPECIALIDAD = {
  repse: {
    campo: "#1C140C",
    campoDeep: "#120D08",
    chispa: "#E8C36A",
    heroFrom: "from-[#1C140C]",
    heroTo: "to-[#120D08]",
    bgCampo: "bg-[#1C140C]",
    textChispa: "text-[#E8C36A]",
    bgChispa: "bg-[#E8C36A]",
    iconBg: "bg-[#F6E9C8]",
    iconColor: "text-[#8A6414]",
    nav: "#9A7020",
  },
  icsoe: {
    campo: "#10241C",
    campoDeep: "#0A1812",
    chispa: "#C6FF2E",
    heroFrom: "from-[#10241C]",
    heroTo: "to-[#0A1812]",
    bgCampo: "bg-[#10241C]",
    textChispa: "text-[#C6FF2E]",
    bgChispa: "bg-[#C6FF2E]",
    iconBg: "bg-[#E8F9A8]",
    iconColor: "text-[#1AA31A]",
    nav: "#1AA31A",
  },
  sisub: {
    campo: "#2C0A12",
    campoDeep: "#180608",
    chispa: "#FF2E3A",
    heroFrom: "from-[#2C0A12]",
    heroTo: "to-[#180608]",
    bgCampo: "bg-[#2C0A12]",
    textChispa: "text-[#FF2E3A]",
    bgChispa: "bg-[#FF2E3A]",
    iconBg: "bg-[#F6C8C4]",
    iconColor: "text-[#C41622]",
    nav: "#C41622",
  },
} as const satisfies Record<"repse" | "icsoe" | "sisub", TonoEspecialidad>;

export function tonoEspecialidad(
  slug: "repse" | "icsoe" | "sisub"
): TonoEspecialidad {
  return TONOS_ESPECIALIDAD[slug];
}

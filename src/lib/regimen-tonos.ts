import type { RegimenSlug } from "./regimenes-fiscales-types";

/**
 * Dueto visual de cada régimen: campo oscuro (hero) + chispa (kicker, icono, acento).
 * Misma receta que RESICO navy + naranja; cada página cambia de tono, no de estructura.
 *
 * Las clases Tailwind van literales para que el scanner las vea.
 */
export type TonoRegimen = {
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
  glass: string;
  glow: string;
  ring: string;
  title: string;
  watermark: string;
  nav: string;
};

export const TONOS_REGIMEN: Record<RegimenSlug, TonoRegimen> = {
  resico: {
    campo: "#0f1d2e",
    campoDeep: "#0a1424",
    chispa: "#fdb203",
    heroFrom: "from-marca-navy",
    heroTo: "to-marca-navy-deep",
    bgCampo: "bg-marca-navy",
    textChispa: "text-marca-naranja",
    bgChispa: "bg-marca-naranja",
    iconBg: "bg-[#E3E8F4]",
    iconColor: "text-marca-navy",
    glass: "bg-gradient-to-br from-[#fdb203]/35 via-[#fdb203]/15 to-white/40",
    glow: "from-[#fdb203]/50 via-[#fdb203]/30 to-white/20",
    ring: "ring-[#fdb203]/55",
    title: "text-marca-navy",
    watermark: "text-marca-naranja/[0.16] sm:text-marca-naranja/[0.20]",
    nav: "text-[#B8860A]",
  },
  "actividades-empresariales": {
    campo: "#0F3A42",
    campoDeep: "#0B2A30",
    chispa: "#E3B23C",
    heroFrom: "from-[#0F3A42]",
    heroTo: "to-[#0B2A30]",
    bgCampo: "bg-[#0F3A42]",
    textChispa: "text-[#E3B23C]",
    bgChispa: "bg-[#E3B23C]",
    iconBg: "bg-[#F8EFC8]",
    iconColor: "text-[#8A6814]",
    glass: "bg-gradient-to-br from-[#E3B23C]/35 via-[#5BA8B0]/15 to-white/40",
    glow: "from-[#E3B23C]/50 via-[#5BA8B0]/25 to-white/20",
    ring: "ring-[#E3B23C]/55",
    title: "text-[#0F3A42]",
    watermark: "text-[#E3B23C]/[0.16] sm:text-[#E3B23C]/[0.20]",
    nav: "text-[#8A6814]",
  },
  "plataformas-tecnologicas": {
    campo: "#16351A",
    campoDeep: "#0E2412",
    chispa: "#D2F25A",
    heroFrom: "from-[#16351A]",
    heroTo: "to-[#0E2412]",
    bgCampo: "bg-[#16351A]",
    textChispa: "text-[#D2F25A]",
    bgChispa: "bg-[#D2F25A]",
    iconBg: "bg-[#EAF8C8]",
    iconColor: "text-[#2F7A24]",
    glass: "bg-gradient-to-br from-[#D2F25A]/40 via-[#6BB83A]/18 to-white/40",
    glow: "from-[#D2F25A]/55 via-[#6BB83A]/30 to-white/20",
    ring: "ring-[#D2F25A]/60",
    title: "text-[#16351A]",
    watermark: "text-[#D2F25A]/[0.18] sm:text-[#D2F25A]/[0.24]",
    nav: "text-[#2F7A24]",
  },
  arrendamiento: {
    campo: "#3C1A16",
    campoDeep: "#271210",
    chispa: "#E8895A",
    heroFrom: "from-[#3C1A16]",
    heroTo: "to-[#271210]",
    bgCampo: "bg-[#3C1A16]",
    textChispa: "text-[#E8895A]",
    bgChispa: "bg-[#E8895A]",
    iconBg: "bg-[#F8E0D4]",
    iconColor: "text-[#B04A28]",
    glass: "bg-gradient-to-br from-[#E8895A]/35 via-[#E8895A]/15 to-white/40",
    glow: "from-[#E8895A]/50 via-[#E8895A]/28 to-white/20",
    ring: "ring-[#E8895A]/55",
    title: "text-[#3C1A16]",
    watermark: "text-[#E8895A]/[0.16] sm:text-[#E8895A]/[0.20]",
    nav: "text-[#B04A28]",
  },
  "sueldos-salarios": {
    campo: "#1C2533",
    campoDeep: "#121820",
    chispa: "#9EC9E0",
    heroFrom: "from-[#1C2533]",
    heroTo: "to-[#121820]",
    bgCampo: "bg-[#1C2533]",
    textChispa: "text-[#9EC9E0]",
    bgChispa: "bg-[#9EC9E0]",
    iconBg: "bg-[#E4F0F6]",
    iconColor: "text-[#3A6A88]",
    glass: "bg-gradient-to-br from-[#9EC9E0]/35 via-[#9EC9E0]/15 to-white/40",
    glow: "from-[#9EC9E0]/50 via-[#9EC9E0]/28 to-white/20",
    ring: "ring-[#9EC9E0]/55",
    title: "text-[#1C2533]",
    watermark: "text-[#9EC9E0]/[0.16] sm:text-[#9EC9E0]/[0.20]",
    nav: "text-[#3A6A88]",
  },
  rif: {
    campo: "#2A221C",
    campoDeep: "#1C1712",
    chispa: "#E8A060",
    heroFrom: "from-[#2A221C]",
    heroTo: "to-[#1C1712]",
    bgCampo: "bg-[#2A221C]",
    textChispa: "text-[#E8A060]",
    bgChispa: "bg-[#E8A060]",
    iconBg: "bg-[#F6E6D4]",
    iconColor: "text-[#A06030]",
    glass: "bg-gradient-to-br from-[#E8A060]/35 via-[#E8A060]/15 to-white/40",
    glow: "from-[#E8A060]/50 via-[#E8A060]/28 to-white/20",
    ring: "ring-[#E8A060]/55",
    title: "text-[#2A221C]",
    watermark: "text-[#E8A060]/[0.16] sm:text-[#E8A060]/[0.20]",
    nav: "text-[#A06030]",
  },
  "regimen-general": {
    campo: "#161B45",
    campoDeep: "#0E1230",
    chispa: "#9AA8FF",
    heroFrom: "from-[#161B45]",
    heroTo: "to-[#0E1230]",
    bgCampo: "bg-[#161B45]",
    textChispa: "text-[#9AA8FF]",
    bgChispa: "bg-[#9AA8FF]",
    iconBg: "bg-[#E8EBFF]",
    iconColor: "text-[#3A48B0]",
    glass: "bg-gradient-to-br from-[#9AA8FF]/35 via-[#9AA8FF]/15 to-white/40",
    glow: "from-[#9AA8FF]/50 via-[#9AA8FF]/28 to-white/20",
    ring: "ring-[#9AA8FF]/55",
    title: "text-[#161B45]",
    watermark: "text-[#9AA8FF]/[0.16] sm:text-[#9AA8FF]/[0.20]",
    nav: "text-[#3A48B0]",
  },
  "fines-no-lucrativos": {
    campo: "#0D2744",
    campoDeep: "#0A1C30",
    chispa: "#4ECDC4",
    heroFrom: "from-[#0D2744]",
    heroTo: "to-[#0A1C30]",
    bgCampo: "bg-[#0D2744]",
    textChispa: "text-[#4ECDC4]",
    bgChispa: "bg-[#4ECDC4]",
    iconBg: "bg-[#D8F4F3]",
    iconColor: "text-[#1A7A78]",
    glass: "bg-gradient-to-br from-[#4ECDC4]/35 via-[#4ECDC4]/15 to-white/40",
    glow: "from-[#4ECDC4]/50 via-[#4ECDC4]/28 to-white/20",
    ring: "ring-[#4ECDC4]/55",
    title: "text-[#0D2744]",
    watermark: "text-[#4ECDC4]/[0.16] sm:text-[#4ECDC4]/[0.20]",
    nav: "text-[#1A7A78]",
  },
};

export function tonoRegimen(slug: RegimenSlug): TonoRegimen {
  return TONOS_REGIMEN[slug];
}

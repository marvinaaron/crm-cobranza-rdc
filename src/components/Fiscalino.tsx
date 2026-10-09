import Image from "next/image";

/**
 * Fiscalino — mascota del portal.
 * Búho morado con sombrero bombín (estilo Chaplin) y orejas emplumadas.
 * Ilustraciones planas en PNG transparente (public/fiscalino/).
 */

export type FiscalinoMood =
  | "sleeping"
  | "happy"
  | "confident"
  | "celebrating"
  | "worried"
  | "desperate";

export type FiscalinoProps = {
  mood: FiscalinoMood;
  size?: number;
  className?: string;
};

const SRC: Record<FiscalinoMood, string> = {
  sleeping: "/fiscalino/fiscalino-sleeping.png",
  happy: "/fiscalino/fiscalino-happy.png",
  confident: "/fiscalino/fiscalino-confident.png",
  celebrating: "/fiscalino/fiscalino-celebrating.png",
  worried: "/fiscalino/fiscalino-worried.png",
  desperate: "/fiscalino/fiscalino-desperate.png",
};

const ALT: Record<FiscalinoMood, string> = {
  sleeping: "Fiscalino dormido",
  happy: "Fiscalino saludando",
  confident: "Fiscalino tranquilo y seguro",
  celebrating: "Fiscalino celebrando",
  worried: "Fiscalino en alerta",
  desperate: "Fiscalino abrumado",
};

export default function Fiscalino({
  mood,
  size = 120,
  className = "",
}: FiscalinoProps) {
  return (
    <div
      className={`relative inline-block fiscalino-enter ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <Image
        src={SRC[mood]}
        alt={ALT[mood]}
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority={false}
      />
    </div>
  );
}

import type { CSSProperties } from "react";
import { tonoHerramienta } from "@/lib/herramienta-tonos";
import type { HerramientaId } from "@/lib/seo/herramientas-config";

type Props = {
  id: HerramientaId;
  size?: number;
  className?: string;
};

/**
 * Icono de producto (misma receta que hz-h1-icon):
 * diagonal 135° + brillo + R blanca.
 */
export default function IconoAppHerramienta({
  id,
  size = 56,
  className,
}: Props) {
  const t = tonoHerramienta(id);
  const style = {
    width: size,
    height: size,
    borderRadius: "22%",
    background: `
      radial-gradient(
        circle at 38% 32%,
        rgb(255 255 255 / 0.28) 0%,
        rgb(255 255 255 / 0) 55%
      ),
      linear-gradient(135deg, ${t.chispaClara} 0%, ${t.chispa} 100%)
    `,
    boxShadow: `0 10px 24px color-mix(in srgb, ${t.chispa} 28%, transparent)`,
  } as CSSProperties;

  return (
    <span
      className={`inline-grid place-items-center overflow-hidden shrink-0 ${className ?? ""}`}
      style={style}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/r-white.png"
        alt=""
        width={418}
        height={395}
        style={{ width: "54%", height: "auto" }}
        draggable={false}
      />
    </span>
  );
}

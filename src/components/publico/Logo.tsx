import Image from "next/image";

/**
 * Logo oficial de RDC Contadores.
 *
 * Tres variantes de color disponibles, todas con fondo transparente:
 *  - `black` — para fondos claros (header, body)
 *  - `white` — para fondos oscuros (footer, hero invertido, correos)
 *  - `gray` — versión sutil (slate-300)
 *
 * Dos formas:
 *  - `mark="rdc"` — logotipo completo "RDC" (default)
 *  - `mark="r"` — solo el isotipo "R", ideal para espacios cuadrados
 */

type Variante = "black" | "white" | "gray";
type Mark = "rdc" | "r";

export type LogoProps = {
  variante?: Variante;
  mark?: Mark;
  /** Alto en píxeles. El ancho se ajusta automáticamente. */
  alto?: number;
  className?: string;
};

const DIMENSIONES: Record<Mark, { width: number; height: number }> = {
  rdc: { width: 999, height: 396 },
  r: { width: 418, height: 395 },
};

export default function Logo({
  variante = "black",
  mark = "rdc",
  alto = 36,
  className,
}: LogoProps) {
  const dim = DIMENSIONES[mark];
  const ratio = dim.width / dim.height;
  const ancho = Math.round(alto * ratio);

  return (
    <Image
      src={`/logos/${mark}-${variante}.png`}
      alt="RDC Contadores"
      width={ancho}
      height={alto}
      priority
      fetchPriority="high"
      sizes={`${ancho}px`}
      className={className}
    />
  );
}

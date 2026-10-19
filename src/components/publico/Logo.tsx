import Image from "next/image";

/**
 * Logo oficial de RDC Contadores.
 *
 * Cuatro variantes de color disponibles, todas con fondo transparente:
 *  - `black` — para fondos claros (header, body)
 *  - `white` — para fondos oscuros (footer, hero invertido, correos)
 *  - `gray` — versión sutil (slate-300)
 *  - `violet` — versión admin sobre fondo oscuro (modo oscuro). Solo
 *    disponible para mark="r" actualmente.
 *  - `auto` — negro en claro, blanco en oscuro (usa los PNG oficiales).
 *
 * Dos formas:
 *  - `mark="rdc"` — logotipo completo "RDC" (default)
 *  - `mark="r"` — solo el isotipo "R", ideal para espacios cuadrados
 */

type Variante = "black" | "white" | "gray" | "violet" | "auto";
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

  if (variante === "auto") {
    return (
      <span className={`inline-flex ${className ?? ""}`}>
        <Image
          src={`/logos/${mark}-black.png`}
          alt="RDC Contadores"
          width={ancho}
          height={alto}
          priority
          fetchPriority="high"
          sizes={`${ancho}px`}
          className="dark:hidden"
        />
        <Image
          src={`/logos/${mark}-white.png`}
          alt=""
          width={ancho}
          height={alto}
          sizes={`${ancho}px`}
          className="hidden dark:inline"
          aria-hidden
        />
      </span>
    );
  }

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

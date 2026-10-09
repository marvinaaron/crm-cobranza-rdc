import Image from "next/image";

/**
 * Wordmark del blog: el isotipo RDC (imagen) seguido de la palabra "Blog".
 *
 * Reemplaza el texto "RDC" de "RDCBlog" por el logo de marca, manteniendo
 * la lectura "RDCBlog". El logo se dimensiona en `em` para que escale con
 * el tamaño de fuente del contexto (hero grande, chip pequeño, etc.) y
 * quede "casi del tamaño de las letras".
 *
 * Accesibilidad: el logo lleva alt="RDC", así un lector de pantalla lee
 * "RDC" + "Blog" = "RDCBlog".
 */

/** Proporción real del PNG (236×125 ≈ 1.888). */
const LOGO_RATIO = 236 / 125;

export default function RdcBlogWordmark({
  logoEm = 0.74,
  blogClassName = "",
  className = "",
}: {
  /** Alto del logo en `em` (relativo a la fuente del contexto). */
  logoEm?: number;
  /** Clases para la palabra "Blog" (color, tracking, etc.). */
  blogClassName?: string;
  /** Clases para el contenedor. */
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-[0.06em] ${className}`}>
      <span
        className="relative inline-block shrink-0"
        style={{ height: `${logoEm}em`, width: `${logoEm * LOGO_RATIO}em` }}
      >
        <Image
          src="/logos/rdc-blog-mark.png"
          alt="RDC"
          fill
          sizes="160px"
          className="object-contain"
        />
      </span>
      <span className={blogClassName}>Blog</span>
    </span>
  );
}

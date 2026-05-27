/**
 * Builder de `Metadata` para páginas públicas. Estandariza:
 *  - Title con sufijo de marca consistente.
 *  - Description optimizada (≤ 160 chars).
 *  - Canonical URL.
 *  - Open Graph (lo que aparece al compartir en WhatsApp, FB, LinkedIn).
 *  - Twitter Card (large image).
 *  - Tag de robots.
 *
 * Cada página pública debe exportar su `metadata` usando este helper
 * para que la experiencia de compartir sea consistente y siempre se vea
 * la portada de marca.
 */

import type { Metadata } from "next";
import { NEGOCIO } from "./negocio";
import { SITE_URL } from "./site";

type BuildArgs = {
  /** Título sin sufijo. Se concatena " · RDC Contadores". */
  title: string;
  /** Descripción 120-160 chars idealmente. */
  description: string;
  /** Path relativo de la página, ej. "/nosotros". */
  path: string;
  /**
   * Imagen OG opcional (URL absoluta o ruta del sitio). Default: og-default.png
   * que contiene la portada de marca aprobada.
   */
  imagen?: string;
  /** Keywords opcional (no muy importante hoy, pero conserva contexto). */
  keywords?: string[];
};

export function buildPublicMetadata({
  title,
  description,
  path,
  imagen = "/og-default.jpg",
  keywords,
}: BuildArgs): Metadata {
  const tituloCompleto = path === "/" ? title : `${title} · ${NEGOCIO.nombre}`;
  const urlAbsoluta = `${SITE_URL}${path === "/" ? "" : path}`;
  const imagenAbsoluta = imagen.startsWith("http")
    ? imagen
    : `${SITE_URL}${imagen}`;

  return {
    title: tituloCompleto,
    description,
    keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: urlAbsoluta,
    },
    openGraph: {
      type: "website",
      siteName: NEGOCIO.nombre,
      title: tituloCompleto,
      description,
      url: urlAbsoluta,
      locale: "es_MX",
      images: [
        {
          url: imagenAbsoluta,
          width: 1024,
          height: 683,
          alt: NEGOCIO.nombre,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: tituloCompleto,
      description,
      images: [imagenAbsoluta],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

import type { MetadataRoute } from "next";
import { HERRAMIENTAS } from "@/lib/seo/herramientas-config";
import { getPosts } from "@/lib/blog/posts";
import { SITE_URL } from "@/lib/seo/site";

const RUTAS_PUBLICAS = [
  "",
  "/mundial-2026",
  "/servicios",
  "/proceso",
  "/herramientas",
  "/blog",
  "/nosotros",
  "/preguntas-frecuentes",
  "/comparativa",
  "/contacto",
  "/empezar",
  "/aviso-de-privacidad",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  const base: MetadataRoute.Sitemap = RUTAS_PUBLICAS.map((ruta) => ({
    url: `${SITE_URL}${ruta}`,
    lastModified: ahora,
    changeFrequency:
      ruta === "/mundial-2026"
        ? "daily"
        : ruta === ""
          ? "weekly"
          : "monthly",
    priority:
      ruta === ""
        ? 1
        : ruta === "/herramientas" || ruta === "/mundial-2026"
          ? 0.9
          : 0.7,
  }));

  const herramientas: MetadataRoute.Sitemap = HERRAMIENTAS.map((h) => ({
    url: `${SITE_URL}${h.path}`,
    lastModified: ahora,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  const blog: MetadataRoute.Sitemap = getPosts().map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(`${p.actualizado ?? p.fecha}T12:00:00`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...base, ...herramientas, ...blog];
}

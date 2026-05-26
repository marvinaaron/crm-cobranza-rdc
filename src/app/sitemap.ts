import type { MetadataRoute } from "next";
import { HERRAMIENTAS } from "@/lib/seo/herramientas-config";
import { SITE_URL } from "@/lib/seo/site";

const RUTAS_PUBLICAS = [
  "",
  "/servicios",
  "/proceso",
  "/herramientas",
  "/nosotros",
  "/preguntas-frecuentes",
  "/contacto",
  "/aviso-de-privacidad",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  const base: MetadataRoute.Sitemap = RUTAS_PUBLICAS.map((ruta) => ({
    url: `${SITE_URL}${ruta}`,
    lastModified: ahora,
    changeFrequency: ruta === "" ? "weekly" : "monthly",
    priority: ruta === "" ? 1 : ruta === "/herramientas" ? 0.9 : 0.7,
  }));

  const herramientas: MetadataRoute.Sitemap = HERRAMIENTAS.map((h) => ({
    url: `${SITE_URL}${h.path}`,
    lastModified: ahora,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  return [...base, ...herramientas];
}

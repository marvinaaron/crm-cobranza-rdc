/**
 * Helpers SEO del blog: metadata Open Graph/Twitter + JSON-LD.
 *
 * Replica el patrón de `herramientas-config.ts` (`buildHerramientaMetadata`
 * / `buildHerramientaJsonLd`) pero para artículos del blog:
 *   - Metadata con `openGraph.type = "article"` y fechas de publicación.
 *   - JSON-LD `BlogPosting` + `BreadcrumbList`.
 *   - JSON-LD `Blog` + `ItemList` para el índice `/blog`.
 */

import type { Metadata } from "next";
import type { BlogPostVista } from "@/lib/blog/posts";
import { getPosts } from "@/lib/blog/posts";
import { NEGOCIO } from "./negocio";
import { SITE_URL } from "./site";

const CONTEXT = "https://schema.org";

/** Imagen OG por defecto del blog (mientras no haya portadas propias). */
const OG_BLOG = `${SITE_URL}/og-default.jpg`;

/* ── Metadata por artículo ─────────────────────────────────────────── */

export function buildBlogPostMetadata(post: BlogPostVista): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = `${post.tituloSeo ?? post.titulo} · ${NEGOCIO.nombre}`;
  return {
    title,
    description: post.resumen,
    keywords: post.tags,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: NEGOCIO.nombre,
      title,
      description: post.resumen,
      url,
      locale: "es_MX",
      publishedTime: post.fecha,
      modifiedTime: post.actualizado ?? post.fecha,
      authors: [post.autor],
      tags: post.tags,
      images: [{ url: OG_BLOG, width: 1024, height: 683, alt: post.titulo }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.resumen,
      images: [OG_BLOG],
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

/* ── JSON-LD por artículo ──────────────────────────────────────────── */

export function buildBlogPostJsonLd(post: BlogPostVista) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const blogPosting = {
    "@context": CONTEXT,
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.titulo,
    description: post.resumen,
    inLanguage: "es-MX",
    datePublished: post.fecha,
    dateModified: post.actualizado ?? post.fecha,
    image: OG_BLOG,
    keywords: post.tags.join(", "),
    articleSection: post.categoriaInfo.label,
    author: {
      "@type": "Person",
      name: post.autor,
      url: `${SITE_URL}/nosotros`,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  const breadcrumb = {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.titulo,
        item: url,
      },
    ],
  };

  return [blogPosting, breadcrumb];
}

/* ── JSON-LD del índice /blog ──────────────────────────────────────── */

export function buildBlogIndexJsonLd() {
  const posts = getPosts();
  const blog = {
    "@context": CONTEXT,
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: `Blog · ${NEGOCIO.nombre}`,
    description:
      "Guías fiscales, trámites del SAT, impuestos y tips para PyMEs explicados fácil por el equipo de RDC Contadores.",
    url: `${SITE_URL}/blog`,
    inLanguage: "es-MX",
    publisher: { "@id": `${SITE_URL}/#organization` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.titulo,
      description: p.resumen,
      datePublished: p.fecha,
      dateModified: p.actualizado ?? p.fecha,
      url: `${SITE_URL}/blog/${p.slug}`,
      author: { "@type": "Person", name: p.autor },
    })),
  };

  const breadcrumb = {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
    ],
  };

  return [blog, breadcrumb];
}

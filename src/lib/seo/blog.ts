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
import { getFaqsDelPost, getPosts } from "@/lib/blog/posts";
import { NEGOCIO } from "./negocio";
import { SITE_URL } from "./site";

const CONTEXT = "https://schema.org";

/** Imagen OG por defecto del blog (cuando un artículo no tiene portada propia). */
const OG_BLOG = `${SITE_URL}/og-default.jpg`;

/** URL absoluta de la portada del artículo, o la OG por defecto. */
function ogImagen(post: BlogPostVista): string {
  return post.portada ? `${SITE_URL}${post.portada}` : OG_BLOG;
}

/* ── Metadata por artículo ─────────────────────────────────────────── */

export function buildBlogPostMetadata(post: BlogPostVista): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = `${post.tituloSeo ?? post.titulo} · ${NEGOCIO.nombre}`;
  // Nota: NO declaramos `images` aquí a propósito. La tarjeta social la
  // genera `opengraph-image.tsx` (imagen de marca RDCBlog con el título
  // grande). Así evitamos duplicar og:image y que las redes tomen la
  // portada del recuadro en lugar de la versión con texto.
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.resumen,
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
    image: ogImagen(post),
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

  const faqs = getFaqsDelPost(post);
  const faqPage =
    faqs.length > 0
      ? {
          "@context": CONTEXT,
          "@type": "FAQPage",
          mainEntity: faqs.map((q) => ({
            "@type": "Question",
            name: q.pregunta,
            acceptedAnswer: {
              "@type": "Answer",
              text: q.respuesta,
            },
          })),
        }
      : null;

  return faqPage
    ? [blogPosting, breadcrumb, faqPage]
    : [blogPosting, breadcrumb];
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

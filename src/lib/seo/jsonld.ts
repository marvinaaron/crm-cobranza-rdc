/**
 * Builders de schemas estructurados JSON-LD para Google Rich Results.
 *
 * Cada función devuelve un objeto plano serializable a JSON. Se inyecta
 * en el HTML usando el componente `<JsonLd>` (que lo serializa dentro de
 * un `<script type="application/ld+json">`).
 *
 * Schemas implementados:
 *  - Organization: identidad del despacho.
 *  - LocalBusiness (AccountingService): para que Google muestre panel
 *    lateral con teléfono, horario, dirección.
 *  - WebSite: para sitelinks search box potencial.
 *  - Person: para que Aaron aparezca como contador titular en knowledge
 *    panel propio.
 *  - Service: cada servicio con precio para rich snippets.
 *  - BreadcrumbList: navegación migajas.
 *  - FAQPage: ya está implementado inline en /preguntas-frecuentes.
 *
 * Referencias: https://developers.google.com/search/docs/appearance/structured-data
 */

import { HERRAMIENTAS } from "./herramientas-config";
import { NEGOCIO } from "./negocio";
import { SITE_URL } from "./site";

const CONTEXT = "https://schema.org";

/** Organization global del despacho. */
export function buildOrganizationSchema() {
  return {
    "@context": CONTEXT,
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: NEGOCIO.nombre,
    legalName: NEGOCIO.razonSocial,
    url: NEGOCIO.url,
    logo: NEGOCIO.logoUrl,
    image: NEGOCIO.imagenMarcaUrl,
    description: NEGOCIO.descripcionLarga,
    foundingDate: NEGOCIO.fundado,
    email: NEGOCIO.email,
    telephone: NEGOCIO.telefono.nacional,
    sameAs: [NEGOCIO.redes.instagram, NEGOCIO.redes.facebook],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: NEGOCIO.telefono.nacional,
      contactType: "customer support",
      areaServed: NEGOCIO.ubicacion.pais,
      availableLanguage: ["Spanish"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: NEGOCIO.ubicacion.ciudad,
      addressRegion: NEGOCIO.ubicacion.estado,
      addressCountry: NEGOCIO.ubicacion.pais,
    },
  } as const;
}

/** LocalBusiness con horario, teléfono, geo. Lo que Google muestra en panel. */
export function buildLocalBusinessSchema() {
  return {
    "@context": CONTEXT,
    "@type": [NEGOCIO.tipo, "LocalBusiness"],
    "@id": `${SITE_URL}/#localbusiness`,
    name: NEGOCIO.nombre,
    image: NEGOCIO.imagenMarcaUrl,
    description: NEGOCIO.descripcionCorta,
    url: NEGOCIO.url,
    telephone: NEGOCIO.telefono.nacional,
    email: NEGOCIO.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: NEGOCIO.ubicacion.ciudad,
      addressRegion: NEGOCIO.ubicacion.estado,
      addressCountry: NEGOCIO.ubicacion.pais,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: NEGOCIO.ubicacion.latitud,
      longitude: NEGOCIO.ubicacion.longitud,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    areaServed: NEGOCIO.areaDeServicio.map((a) => ({
      "@type": "City",
      name: a,
    })),
    sameAs: [NEGOCIO.redes.instagram, NEGOCIO.redes.facebook],
  } as const;
}

/** WebSite con potencial SearchAction (para sitelinks search box). */
export function buildWebSiteSchema() {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: NEGOCIO.nombre,
    description: NEGOCIO.descripcionCorta,
    inLanguage: "es-MX",
    publisher: { "@id": `${SITE_URL}/#organization` },
  } as const;
}

/**
 * SiteNavigationElement: declara el menú principal. Sirve a Google para
 * entender la jerarquía del sitio (ayuda a obtener sitelinks).
 */
export function buildSiteNavigationSchema() {
  const items = [
    { name: "Inicio", path: "/" },
    { name: "Servicios", path: "/servicios" },
    { name: "Proceso", path: "/proceso" },
    { name: "Herramientas fiscales", path: "/herramientas" },
    { name: "Nosotros", path: "/nosotros" },
    { name: "Contacto", path: "/contacto" },
    ...HERRAMIENTAS.map((h) => ({ name: h.h1, path: h.path })),
  ];
  return items.map((item) => ({
    "@context": CONTEXT,
    "@type": "SiteNavigationElement",
    name: item.name,
    url: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
  }));
}

/** ItemList de las herramientas (rich result de lista en /herramientas). */
export function buildHerramientasItemListSchema() {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    name: "Herramientas fiscales gratuitas",
    description:
      "Calculadora de RFC, INPC, ISR, UMA, salario mínimo, recargos y tipo de cambio.",
    itemListElement: HERRAMIENTAS.map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: h.h1,
      url: `${SITE_URL}${h.path}`,
      description: h.description,
    })),
  } as const;
}

/** Person schema para el contador titular. */
export function buildPersonSchema() {
  const p = NEGOCIO.contadorTitular;
  return {
    "@context": CONTEXT,
    "@type": "Person",
    "@id": `${SITE_URL}/nosotros#${p.nombre.toLowerCase().replace(/\s+/g, "-")}`,
    name: p.nombre,
    jobTitle: p.titulo,
    description: p.descripcion,
    image: p.foto,
    worksFor: { "@id": `${SITE_URL}/#organization` },
    url: `${SITE_URL}/nosotros`,
    knowsAbout: [
      "Contabilidad fiscal",
      "RESICO",
      "Personas físicas con actividad empresarial",
      "Personas morales",
      "Nóminas IMSS Infonavit",
      "REPSE ICSOE SISUB",
      "SAT México",
    ],
    workLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: NEGOCIO.ubicacion.ciudad,
        addressRegion: NEGOCIO.ubicacion.estado,
        addressCountry: NEGOCIO.ubicacion.pais,
      },
    },
  } as const;
}

/** Catálogo de servicios para rich snippets con precio. */
export function buildServicesSchema() {
  return NEGOCIO.serviciosCatalogo.map((s, i) => ({
    "@context": CONTEXT,
    "@type": "Service",
    "@id": `${SITE_URL}/servicios#${i + 1}`,
    name: s.nombre,
    description: s.descripcion,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "México" },
    serviceType: NEGOCIO.tipo,
    ...(s.precioDesde
      ? {
          offers: {
            "@type": "Offer",
            price: String(s.precioDesde),
            priceCurrency: s.moneda,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: s.precioDesde,
              priceCurrency: s.moneda,
              referenceQuantity: {
                "@type": "QuantitativeValue",
                value: 1,
                unitText: s.unidad,
              },
            },
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/servicios`,
          },
        }
      : {}),
  }));
}

/** Migajas de navegación. `crumbs` en orden raíz → actual. */
export function buildBreadcrumbSchema(
  crumbs: ReadonlyArray<{ name: string; path: string }>
) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  } as const;
}

/**
 * URL canónica del sitio público (producción).
 * Vercel redirige rdcontadores.com → www.rdcontadores.com; el sitemap,
 * canonical y JSON-LD deben usar siempre la versión www para que Google
 * no indexe duplicados (http/https con y sin www).
 */
function normalizarUrlSitio(raw: string): string {
  try {
    const u = new URL(raw.trim());
    if (u.hostname === "rdcontadores.com") {
      u.hostname = "www.rdcontadores.com";
    }
    return u.origin;
  } catch {
    return "https://www.rdcontadores.com";
  }
}

export const SITE_URL = normalizarUrlSitio(
  process.env.NEXT_PUBLIC_DESPACHO_SITIO ?? "https://www.rdcontadores.com"
);

export const ORGANIZACION = {
  name: "RDC Contadores",
  legalName: "RDC Contadores",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  email: "contacto@rdcontadores.com",
  description:
    "Tus impuestos en una app: despacho fiscal en Guadalajara, herramientas SAT gratis y portal para clientes.",
  areaServed: "MX",
} as const;

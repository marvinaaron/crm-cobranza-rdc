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
    "Despacho contable y fiscal en México: cumplimiento SAT, contabilidad, nóminas y herramientas fiscales de consulta (ISR, INPC, UMA, tipo de cambio).",
  areaServed: "MX",
} as const;

/** URL canónica del sitio público (producción). */
/** Dominio canónico (Vercel redirige rdcontadores.com → www). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_DESPACHO_SITIO ?? "https://www.rdcontadores.com";

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

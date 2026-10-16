import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { NEGOCIO } from "@/lib/seo/negocio";
import { parseTipoLigaComprobante } from "@/lib/portal/liga-comprobante";
import SubirPagoLanding from "./SubirPagoLanding";

const TITULO = "Sube tu captura de pago";
const DESCRIPCION =
  "Al parecer recibimos un pago. Súbelo en tu portal de cliente RDC para validarlo — transferencia, BBVA, Apple Pay o Google Pay.";

export const metadata: Metadata = {
  title: `${TITULO} · ${NEGOCIO.nombre}`,
  description: DESCRIPCION,
  metadataBase: new URL(SITE_URL),
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: NEGOCIO.nombre,
    title: TITULO,
    description: DESCRIPCION,
    url: `${SITE_URL}/subir-pago`,
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRIPCION,
  },
};

export default async function SubirPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; tipo?: string }>;
}) {
  const sp = await searchParams;
  const id = Number(sp.c);
  const clienteId = Number.isFinite(id) && id > 0 ? id : null;
  const tipo = parseTipoLigaComprobante(sp.tipo);

  return <SubirPagoLanding clienteId={clienteId} tipo={tipo} />;
}

import { NextResponse } from "next/server";

const MANIFEST_BASE = {
  name: "RDC Admin · Consola",
  short_name: "RDC Admin",
  description:
    "Consola de administración RDC Contadores: clientes, cobranza, cumplimiento y dashboard.",
  id: "/admin",
  start_url: "/dashboard",
  scope: "/",
  display: "standalone" as const,
  orientation: "any" as const,
  lang: "es-MX",
  categories: ["business", "productivity"],
};

const ICONS_CLARO = [
  { src: "/icon-192-admin.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icon-512-admin.png", sizes: "512x512", type: "image/png", purpose: "any" },
  {
    src: "/apple-touch-icon-admin.png",
    sizes: "180x180",
    type: "image/png",
    purpose: "any",
  },
];

const ICONS_OSCURO = [
  {
    src: "/icon-192-admin-dark.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/icon-512-admin-dark.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/apple-touch-icon-admin-dark.png",
    sizes: "180x180",
    type: "image/png",
    purpose: "any",
  },
];

/**
 * Manifest dinámico: al instalar la PWA, Safari puede enviar
 * Sec-CH-Prefers-Color-Scheme y recibir el set de íconos acorde al tema actual.
 * Nota: iOS no actualiza el ícono del acceso directo al cambiar el tema después.
 */
export async function GET(request: Request) {
  const scheme = request.headers.get("Sec-CH-Prefers-Color-Scheme");
  const oscuro = scheme === "dark";

  return NextResponse.json(
    {
      ...MANIFEST_BASE,
      background_color: oscuro ? "#0a0a0a" : "#1e1b4b",
      theme_color: oscuro ? "#0a0a0a" : "#7c3aed",
      icons: oscuro ? ICONS_OSCURO : ICONS_CLARO,
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "private, no-cache",
        "Accept-CH": "Sec-CH-Prefers-Color-Scheme",
      },
    }
  );
}

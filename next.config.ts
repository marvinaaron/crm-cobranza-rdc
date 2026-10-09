import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ["@nodecfdi/sat-ws-descarga-masiva"],

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 64, 96, 128, 256],
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  async redirects() {
    return [
      {
        source: "/servicios/personas-fisicas",
        destination: "/servicios/actividades-empresariales",
        permanent: true,
      },
      {
        source: "/servicios/personas-morales",
        destination: "/servicios/regimen-general",
        permanent: true,
      },
      {
        source: "/servicios/plataformas-digitales",
        destination: "/servicios/plataformas-tecnologicas",
        permanent: true,
      },
      {
        source: "/mundial-2026",
        destination: "/",
        permanent: true,
      },
      {
        source: "/api/mundial-2026",
        destination: "/",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2|ttf)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

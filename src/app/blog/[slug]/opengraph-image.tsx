import { ImageResponse } from "next/og";
import { POSTS, getPost } from "@/lib/blog/posts";

/**
 * OG image dinámica por artículo del blog (lo que se ve al compartir el
 * link en WhatsApp, Instagram, LinkedIn, etc.).
 *
 * Mantiene las portadas del recuadro 100% limpias: esta imagen es aparte
 * y SÍ trae texto grande + branding RDCBlog, como hace ContaBlog, pero sin
 * ensuciar las cards del índice. Se genera en el servidor con CSS (sin
 * imágenes externas) para que el build sea estable.
 */

export const alt = "RDCBlog · RDC Contadores";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Pre-genera la OG por cada artículo (igual que la página). */
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

/** Acento por categoría (hex, porque ImageResponse no usa clases Tailwind). */
const ACENTO: Record<string, { color: string; label: string }> = {
  guias: { color: "#a5b4fc", label: "Guías prácticas" },
  sat: { color: "#6ee7b7", label: "Trámites SAT" },
  impuestos: { color: "#fcd34d", label: "Impuestos" },
  nomina: { color: "#7dd3fc", label: "Nómina y RH" },
  pymes: { color: "#c4b5fd", label: "PyMEs y negocios" },
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  const titulo = post?.titulo ?? "RDCBlog";
  const acento = post ? ACENTO[post.categoria] : undefined;
  const acentoColor = acento?.color ?? "#c4b5fd";
  const acentoLabel = acento?.label ?? "Blog fiscal";
  const emoji = post?.emoji ?? "📝";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "radial-gradient(circle at 18% 12%, #1e3a5f 0%, #0f1d2e 45%, #0a1424 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Halo decorativo */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: "9999px",
            background: "rgba(124, 58, 237, 0.35)",
            filter: "blur(90px)",
            display: "flex",
          }}
        />

        {/* Encabezado: marca RDCBlog + chip de categoría */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(255,255,255,0.12)",
                color: "#ffffff",
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              RDC
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: 2,
              }}
            >
              RDC<span style={{ color: acentoColor }}>Blog</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 24px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: acentoColor,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {acentoLabel}
          </div>
        </div>

        {/* Cuerpo: emoji grande + título */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 90 }}>{emoji}</div>
          <div
            style={{
              display: "flex",
              fontSize: titulo.length > 60 ? 58 : 70,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.08,
              maxWidth: 1040,
            }}
          >
            {titulo}
          </div>
        </div>

        {/* Pie: barra de acento + dominio */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 220,
              height: 8,
              borderRadius: 9999,
              background: acentoColor,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            rdcontadores.com/blog
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

/**
 * OG image dinámica para la Calculadora de RFC.
 *
 * Next.js asocia este archivo automáticamente como `og:image` (y
 * `twitter:image`) de la ruta /herramientas/rfc. Así, al compartir el
 * link en WhatsApp, Instagram, LinkedIn, etc. se ve una portada de marca
 * con el branding navy de RDC en lugar del OG genérico del sitio.
 *
 * Se genera en el servidor con CSS (sin imágenes externas) para evitar
 * dependencias de fetch y mantener el build estable.
 */

export const alt =
  "Calculadora de RFC con homoclave gratis · RDC Contadores";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
            width: 380,
            height: 380,
            borderRadius: "9999px",
            background: "rgba(124, 58, 237, 0.35)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />

        {/* Encabezado: marca + eyebrow */}
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
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            RDC
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: 6,
            }}
          >
            HERRAMIENTA GRATUITA · RDC CONTADORES
          </div>
        </div>

        {/* Cuerpo: título + subtítulo + chip de ejemplo */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 82,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.05,
            }}
          >
            <span style={{ display: "flex" }}>Calcula tu RFC</span>
            <span style={{ display: "flex", color: "#c4b5fd" }}>
              con homoclave, gratis
            </span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Persona física · Algoritmo oficial del SAT · Resultado al instante
          </div>

          {/* Chip de RFC de ejemplo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 28px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#ffffff",
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: 4,
              }}
            >
              LOMA900315AB1
            </div>
          </div>
        </div>

        {/* Pie: badges + dominio */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            {["100% privado", "Sin registro", "Instantáneo"].map((b) => (
              <div
                key={b}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 20px",
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {b}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            rdcontadores.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

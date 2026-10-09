import { ImageResponse } from "next/og";

export const alt =
  "Calculadora de vencimiento de declaración SAT según RFC · RDC Contadores";
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
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 380,
            height: 380,
            borderRadius: "9999px",
            background: "rgba(251, 191, 36, 0.35)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />

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

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.05,
            }}
          >
            <span style={{ display: "flex" }}>¿Cuándo vence</span>
            <span style={{ display: "flex", color: "#fcd34d" }}>
              tu declaración?
            </span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            RFC + mes + año · 6º dígito · Días hábiles · Fin de semana
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 28px",
                borderRadius: 18,
                background: "rgba(251,191,36,0.15)",
                border: "1px solid rgba(251,191,36,0.35)",
                color: "#fcd34d",
                fontSize: 52,
                fontWeight: 900,
              }}
            >
              17 + RFC
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            {["100% privado", "Sin registro", "Al instante"].map((b) => (
              <div
                key={b}
                style={{
                  display: "flex",
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

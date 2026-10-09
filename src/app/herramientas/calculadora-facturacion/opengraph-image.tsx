import { ImageResponse } from "next/og";

export const alt =
  "Calculadora de Facturación · Neto a CFDI con retenciones · RDC Contadores";
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
            "radial-gradient(circle at 18% 12%, #312e81 0%, #1e1b4b 45%, #0f172a 100%)",
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
            background: "rgba(99, 102, 241, 0.4)",
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
            HERRAMIENTA · RDC CONTADORES
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
            <span style={{ display: "flex" }}>Calculadora de</span>
            <span style={{ display: "flex", color: "#a5b4fc" }}>Facturación</span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Neto deseado → subtotal, IVA y retenciones · RESICO y PFAE
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 8 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px 28px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#ffffff",
              }}
            >
              <span style={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }}>
                Neto deseado
              </span>
              <span style={{ fontSize: 44, fontWeight: 900 }}>$10,000.00</span>
            </div>
            <span style={{ fontSize: 36, color: "#a5b4fc" }}>→</span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px 28px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#ffffff",
              }}
            >
              <span style={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }}>
                Subtotal CFDI
              </span>
              <span style={{ fontSize: 44, fontWeight: 900 }}>$9,607.69</span>
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
            {["3 consultas gratis", "RESICO · PFAE", "Retenciones ISR/IVA"].map(
              (b) => (
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
              )
            )}
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

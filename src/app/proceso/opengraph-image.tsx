import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Portada al compartir /proceso (WhatsApp, etc.).
 * Formato “salchicha” (más ancho que alto) con icono de app + copy cinema.
 */

export const alt = "Cómo bajar la app · RDC Contadores";
export const size = { width: 1200, height: 420 };
export const contentType = "image/png";

async function pngData(rel: string) {
  const bytes = await readFile(join(process.cwd(), rel));
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

export default async function Image() {
  const [icono, fiscalino] = await Promise.all([
    pngData("public/icon-512-v2.png"),
    pngData("public/fiscalino/fiscalino-happy.png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "36px 56px",
          background: "linear-gradient(115deg, #0f1d2e 0%, #1a0f3a 48%, #2a1058 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Luz eléctrica */}
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -80,
            width: 420,
            height: 420,
            borderRadius: "9999px",
            background: "rgba(169, 45, 255, 0.45)",
            filter: "blur(70px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -60,
            bottom: -100,
            width: 360,
            height: 360,
            borderRadius: "9999px",
            background: "rgba(56, 189, 248, 0.22)",
            filter: "blur(70px)",
            display: "flex",
          }}
        />

        {/* Izquierda: icono + texto */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
            zIndex: 1,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 148,
              height: 148,
              borderRadius: 36,
              overflow: "hidden",
              boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
              border: "3px solid rgba(255,255,255,0.22)",
              background: "#0f1d2e",
            }}
          >
            <img src={icono} width={148} height={148} alt="" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 5,
                color: "#c4b5fd",
                textTransform: "uppercase",
              }}
            >
              RDC Contadores · Portal
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 64,
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 0.98,
                letterSpacing: -1.5,
              }}
            >
              <span style={{ display: "flex" }}>Cómo bajar</span>
              <span style={{ display: "flex", color: "#e9d5ff" }}>la app</span>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 600,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              7 pasos · comprobantes visibles todo el tiempo
            </div>
          </div>
        </div>

        {/* Fiscalino a la derecha */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            zIndex: 1,
            marginRight: -8,
          }}
        >
          <img src={fiscalino} width={280} height={280} alt="" />
        </div>
      </div>
    ),
    { ...size }
  );
}

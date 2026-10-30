import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Portada al compartir /proceso (WhatsApp, etc.).
 * Icono original de la app (solo clip redondeado), Fiscalino elegant con lente,
 * tipografía Black, fondo navy sólido.
 */

export const alt = "Cómo bajar la app · RDC Contadores";
export const size = { width: 1200, height: 420 };
export const contentType = "image/png";

const FONDO = "#0f1d2e";
/** Violeta del logo de la app. */
const VIOLETA = "#7c3aed";

async function pngData(rel: string) {
  const bytes = await readFile(join(process.cwd(), rel));
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

export default async function Image() {
  const [icono, fiscalino, fontBlack] = await Promise.all([
    pngData("public/proceso/app-icon-og.png"),
    pngData("public/fiscalino/fiscalino-elegant.png"),
    readFile(join(process.cwd(), "public/fonts/RedHatDisplay-Black.ttf")),
  ]);

  const iconSize = 168;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 44px",
          background: FONDO,
          fontFamily: '"Red Hat Display"',
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            zIndex: 1,
            flex: 1,
          }}
        >
          <img
            src={icono}
            width={iconSize}
            height={iconSize}
            alt=""
            style={{ display: "flex", flexShrink: 0 }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxWidth: 660,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: 4,
                color: VIOLETA,
                textTransform: "uppercase",
              }}
            >
              RDC Contadores · Portal
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 92,
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 0.88,
                letterSpacing: -3.5,
              }}
            >
              <span style={{ display: "flex" }}>Cómo bajar</span>
              <span style={{ display: "flex" }}>la app</span>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 32,
                fontWeight: 900,
                color: "rgba(255,255,255,0.9)",
                letterSpacing: -0.4,
                lineHeight: 1.1,
              }}
            >
              7 pasos · comprobantes visibles todo el tiempo
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            zIndex: 1,
            marginRight: -4,
          }}
        >
          <img src={fiscalino} width={290} height={328} alt="" />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Red Hat Display",
          data: fontBlack,
          style: "normal",
          weight: 900,
        },
      ],
    }
  );
}

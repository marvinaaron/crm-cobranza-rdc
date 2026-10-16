import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Portada WhatsApp de /subir-pago.
 * Iconos reales en PNG (Satori no pinta SVG en data-URI; WhatsApp los pierde).
 */

export const alt = "Sube tu captura de pago · Portal de clientes RDC Contadores";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function pngData(rel: string) {
  const bytes = await readFile(join(process.cwd(), rel));
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

export default async function Image() {
  const [logo, bbva, spei, applePay, googlePay] = await Promise.all([
    pngData("public/logos/rdc-white.png"),
    pngData("public/og-pago/chip-bbva.png"),
    pngData("public/og-pago/chip-spei.png"),
    pngData("public/og-pago/chip-apple-pay.png"),
    pngData("public/og-pago/chip-google-pay.png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 64px 48px",
          background: "#1a164d",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} width={176} height={70} alt="RDC Contadores" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: 5,
            }}
          >
            PORTAL DE CLIENTES
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 68,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.05,
            }}
          >
            <span style={{ display: "flex" }}>Sube tu captura</span>
            <span style={{ display: "flex", color: "#93c5fd" }}>de pago</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            Transferencia, tarjeta o wallet. Tu contador la valida.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={bbva} width={208} height={78} alt="BBVA" />
          <img src={spei} width={217} height={78} alt="SPEI" />
          <img src={applePay} width={242} height={78} alt="Apple Pay" />
          <img src={googlePay} width={242} height={78} alt="Google Pay" />
        </div>
      </div>
    ),
    { ...size }
  );
}

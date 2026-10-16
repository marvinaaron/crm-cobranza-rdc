import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Portada al compartir /subir-pago en WhatsApp.
 * Logo oficial RDC (sin retocar) + transferencia / BBVA / Apple Pay / Google Pay.
 */

export const alt = "Sube tu captura de pago · Portal de clientes RDC Contadores";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoBytes = await readFile(
    join(process.cwd(), "public/logos/rdc-white.png")
  );
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;
  const appleSrc = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#111" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>`
  ).toString("base64")}`;
  const googleSrc = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`
  ).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 72px",
          background: "#1a164d",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -60,
            width: 420,
            height: 420,
            borderRadius: "9999px",
            background: "rgba(37, 99, 235, 0.28)",
            filter: "blur(70px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -80,
            width: 360,
            height: 360,
            borderRadius: "9999px",
            background: "rgba(16, 185, 129, 0.18)",
            filter: "blur(70px)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={logoSrc} width={168} height={66} alt="RDC Contadores" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
              fontSize: 72,
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
              fontSize: 28,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            Transferencia, tarjeta o wallet. Tu contador la valida.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 22px",
              borderRadius: 16,
              background: "#004481",
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            BBVA
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 22px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.12)",
              color: "#ffffff",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            SPEI
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              borderRadius: 16,
              background: "#ffffff",
              color: "#111111",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            <img src={appleSrc} width={28} height={28} alt="" />
            Pay
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              borderRadius: 16,
              background: "#ffffff",
              color: "#1f2937",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            <img src={googleSrc} width={28} height={28} alt="" />
            Pay
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

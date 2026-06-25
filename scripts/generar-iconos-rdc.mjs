/**
 * Genera iconos PWA + apple-touch para portal cliente y consola admin.
 *
 * Cliente: degradado Draftea diagonal + R blanca brillante (pura #FFF + halo).
 * Admin: mismo fondo con viñeta + R blanca (más contraste en oscuro).
 *
 *   node scripts/generar-iconos-rdc.mjs
 */
import sharp from "sharp";
import { DRAFTEA_MORADO, DRAFTEA_AZUL } from "./draftea-colores.mjs";

const R_SOURCE = "public/logos/r-white.png";
const MASTER = 1024;
const R_RATIO = 0.54;

/** Degradado diagonal Draftea (arriba-izq → abajo-der). */
function fondoDrafteaSvg(size, { vignette = false } = {}) {
  const vignetteLayer = vignette
    ? `<rect width="${size}" height="${size}" fill="url(#vignette)"/>`
    : "";
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="draftea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${DRAFTEA_MORADO}"/>
          <stop offset="1" stop-color="${DRAFTEA_AZUL}"/>
        </linearGradient>
        <radialGradient id="shine" cx="0.38" cy="0.32" r="0.55">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.14"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        ${
          vignette
            ? `<radialGradient id="vignette" cx="0.5" cy="0.55" r="0.85">
          <stop offset="0" stop-color="#000000" stop-opacity="0"/>
          <stop offset="0.65" stop-color="#000000" stop-opacity="0.14"/>
          <stop offset="1" stop-color="#000000" stop-opacity="0.42"/>
        </radialGradient>`
            : ""
        }
      </defs>
      <rect width="${size}" height="${size}" fill="url(#draftea)"/>
      <rect width="${size}" height="${size}" fill="url(#shine)"/>
      ${vignetteLayer}
    </svg>`
  );
}

/**
 * Convierte la R a blanco puro (#FFF) usando el canal alpha del PNG.
 * Al escalar, los bordes anti-alias quedan grises — esto los corrige.
 */
async function rBlancaPura(logoPath, width) {
  const { data, info } = await sharp(logoPath)
    .resize({ width, kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 12) {
      data[i + 3] = 0;
      continue;
    }
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    // Bordes más opacos para que no se vean lavados sobre el morado.
    data[i + 3] = Math.min(255, Math.round(a * 1.15 + 18));
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

/** Halo blanco detrás de la R (brillo tipo Draftea). */
async function haloR(rPura, expand = 28) {
  return sharp(rPura)
    .extend({
      top: expand,
      bottom: expand,
      left: expand,
      right: expand,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .blur(expand * 0.85)
    .linear(1.35, 12)
    .png()
    .toBuffer();
}

async function construirMaster(fondoSvg, { vignette = false } = {}) {
  const fondo = await sharp(fondoSvg(MASTER)).png().toBuffer();
  const anchoR = Math.round(MASTER * R_RATIO);
  const rPura = await rBlancaPura(R_SOURCE, anchoR);
  const meta = await sharp(rPura).metadata();
  const left = Math.round((MASTER - meta.width) / 2);
  const top = Math.round((MASTER - meta.height) / 2);

  const expand = Math.round(MASTER * 0.028);
  const glow = await haloR(rPura, expand);
  const glowMeta = await sharp(glow).metadata();
  const glowLeft = left - expand;
  const glowTop = top - expand;

  const capaBrilloR = await sharp(rPura)
    .linear(1.08, 6)
    .png()
    .toBuffer();

  return sharp(fondo)
    .composite([
      { input: glow, left: glowLeft, top: glowTop, blend: "screen" },
      { input: capaBrilloR, left, top },
    ])
    .png()
    .toBuffer();
}

const SALIDAS_CLIENTE = [
  ["public/icon-512-v2.png", 512],
  ["public/icon-192-v2.png", 192],
  ["public/apple-touch-icon-v2.png", 180],
];

const SALIDAS_ADMIN = [
  ["public/icon-512-admin-v2.png", 512],
  ["public/icon-192-admin-v2.png", 192],
  ["public/apple-touch-icon-admin-v2.png", 180],
];

const masterCliente = await construirMaster(fondoDrafteaSvg, { vignette: false });
for (const [archivo, size] of SALIDAS_CLIENTE) {
  await sharp(masterCliente)
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(archivo);
  console.log(`✓ cliente ${archivo} (${size}x${size})`);
}

const masterAdmin = await construirMaster(fondoDrafteaSvg, { vignette: true });
for (const [archivo, size] of SALIDAS_ADMIN) {
  await sharp(masterAdmin)
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(archivo);
  console.log(`✓ admin ${archivo} (${size}x${size})`);
}

console.log("Listo.");

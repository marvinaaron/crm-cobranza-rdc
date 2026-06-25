/**
 * Genera iconos PWA + apple-touch para portal cliente y consola admin.
 *
 * Cliente: degradado Draftea (#B026FF → #4B00FF) + R blanca.
 * Admin: mismo degradado con viñeta oscura + R violeta.
 *
 *   node scripts/generar-iconos-rdc.mjs
 */
import sharp from "sharp";
import { DRAFTEA_MORADO, DRAFTEA_AZUL } from "./draftea-colores.mjs";

const R_WHITE = "public/logos/r-white.png";
const R_VIOLET = "public/logos/r-violet.png";
const MASTER = 1024;
const R_RATIO = 0.52;

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
        ${
          vignette
            ? `<radialGradient id="vignette" cx="0.5" cy="0.55" r="0.85">
          <stop offset="0" stop-color="#000000" stop-opacity="0"/>
          <stop offset="0.65" stop-color="#000000" stop-opacity="0.12"/>
          <stop offset="1" stop-color="#000000" stop-opacity="0.38"/>
        </radialGradient>`
            : ""
        }
      </defs>
      <rect width="${size}" height="${size}" fill="url(#draftea)"/>
      ${vignetteLayer}
    </svg>`
  );
}

async function construirMaster(fondoSvg, logoPath) {
  const fondo = await sharp(fondoSvg(MASTER)).png().toBuffer();
  const anchoR = Math.round(MASTER * R_RATIO);
  const r = await sharp(logoPath).resize({ width: anchoR }).toBuffer();
  const meta = await sharp(r).metadata();
  const left = Math.round((MASTER - meta.width) / 2);
  const top = Math.round((MASTER - meta.height) / 2);
  return sharp(fondo).composite([{ input: r, left, top }]).png().toBuffer();
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

const masterCliente = await construirMaster(
  (size) => fondoDrafteaSvg(size, { vignette: false }),
  R_WHITE
);
for (const [archivo, size] of SALIDAS_CLIENTE) {
  await sharp(masterCliente).resize(size, size).png().toFile(archivo);
  console.log(`✓ cliente ${archivo} (${size}x${size})`);
}

const masterAdmin = await construirMaster(
  (size) => fondoDrafteaSvg(size, { vignette: true }),
  R_VIOLET
);
for (const [archivo, size] of SALIDAS_ADMIN) {
  await sharp(masterAdmin).resize(size, size).png().toFile(archivo);
  console.log(`✓ admin ${archivo} (${size}x${size})`);
}

console.log("Listo.");

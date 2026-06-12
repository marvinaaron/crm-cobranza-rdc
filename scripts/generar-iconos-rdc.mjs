/**
 * Genera los iconos de la marca RDC (PWA + apple-touch) con el diseño "C2":
 * base navy profundo con un brillo violeta/morado que florece desde la esquina
 * superior derecha, y la "R" blanca real (public/logos/r-white.png) centrada.
 *
 * Full-bleed (sin esquinas redondeadas ni márgenes): el sistema operativo se
 * encarga de la máscara/redondeo. Construye un master 1024 y de ahí escala.
 *
 *   node scripts/generar-iconos-rdc.mjs
 */
import sharp from "sharp";

const R_PATH = "public/logos/r-white.png";
const MASTER = 1024;
const R_RATIO = 0.5; // ancho de la R relativo al icono

function fondoSvg(size) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="base" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#0a1424"/>
          <stop offset="0.55" stop-color="#0f1d2e"/>
          <stop offset="1" stop-color="#241a4d"/>
        </linearGradient>
        <radialGradient id="glow" cx="0.78" cy="0.20" r="0.95">
          <stop offset="0" stop-color="#9333ea" stop-opacity="0.95"/>
          <stop offset="0.32" stop-color="#7c3aed" stop-opacity="0.55"/>
          <stop offset="0.7" stop-color="#7c3aed" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#base)"/>
      <rect width="${size}" height="${size}" fill="url(#glow)"/>
    </svg>`
  );
}

async function construirMaster() {
  const fondo = await sharp(fondoSvg(MASTER)).png().toBuffer();
  const anchoR = Math.round(MASTER * R_RATIO);
  const r = await sharp(R_PATH).resize({ width: anchoR }).toBuffer();
  const meta = await sharp(r).metadata();
  const left = Math.round((MASTER - meta.width) / 2);
  const top = Math.round((MASTER - meta.height) / 2);
  return sharp(fondo).composite([{ input: r, left, top }]).png().toBuffer();
}

const SALIDAS = [
  // Portal del cliente + sitio público (comparten los archivos -v2)
  ["public/icon-512-v2.png", 512],
  ["public/icon-192-v2.png", 192],
  ["public/apple-touch-icon-v2.png", 180],
  // Consola admin
  ["public/icon-512-admin-v2.png", 512],
  ["public/icon-192-admin-v2.png", 192],
  ["public/apple-touch-icon-admin-v2.png", 180],
];

const master = await construirMaster();
for (const [archivo, size] of SALIDAS) {
  await sharp(master).resize(size, size).png().toFile(archivo);
  console.log(`✓ ${archivo} (${size}x${size})`);
}
console.log("Listo.");

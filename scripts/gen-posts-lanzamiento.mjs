// Genera el set de posts de lanzamiento del Portal de Clientes RDC.
// Mismo fondo que el kit social (navy -> violeta, patron de puntos, iconos sutiles)
// + copy de marketing. Salida: branding-social/posts/*.png
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "branding-social/posts";
const LOGO = "public/logos/rdc-white.png";

// --- PRNG reproducible (mulberry32) ---
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Iconos de industria (paths en viewBox 24x24, estilo linea) ---
const ICONS = [
  "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z", // casa
  "M4 7h16v10H4z M8 7V5h8v2", // maletin
  "M5 8h11v8H5z M16 10h3l2 2v4h-5z M7 18a2 2 0 1 0 0-0.01 M17 18a2 2 0 1 0 0-0.01", // camion
  "M6 4h9l4 4v12H6z M14 4v4h4", // documento
  "M12 3a4 4 0 0 1 4 4c0 2-2 3-2 5h-4c0-2-2-3-2-5a4 4 0 0 1 4-4z M10 18h4 M11 21h2", // foco/idea
  "M4 6h12v9H4z M16 9h4v6h-4 M8 19a1.5 1.5 0 1 0 0-0.01 M16 19a1.5 1.5 0 1 0 0-0.01", // bolsa/carga
  "M7 4h10v3H7z M5 7h14l-1 13H6z", // bolsa shopping
  "M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z", // estrella
  "M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0z M12 8v4l3 2", // reloj
  "M3 6h18v12H3z M3 10h18 M7 15h4", // tarjeta
  "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z", // escudo
  "M5 19V9l7-5 7 5v10 M9 19v-5h6v5", // grafica/edificio
  "M5 17l4-4 3 3 5-6 M5 20h14 M5 4v16", // grafica linea
];

// zonas protegidas (rects en %) donde NO se dibujan iconos: handle y badge/eyebrow
function inProtected(x, y, w, h) {
  // banda del @handle (abajo centro)
  if (y > h - 150 && x > w * 0.22 && x < w * 0.78) return true;
  // banda del badge + eyebrow (arriba del titulo, centro)
  if (y > h * 0.3 && y < h * 0.42 && x > w * 0.2 && x < w * 0.8) return true;
  return false;
}

function iconLayer(rand, w, h, count, opacity) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const ic = ICONS[Math.floor(rand() * ICONS.length)];
    let x = rand() * (w - 60) + 30;
    let y = rand() * (h - 60) + 30;
    let tries = 0;
    while (inProtected(x, y, w, h) && tries < 6) {
      x = rand() * (w - 60) + 30;
      y = rand() * (h - 60) + 30;
      tries++;
    }
    if (inProtected(x, y, w, h)) continue;
    const scale = 1.4 + rand() * 1.6;
    const rot = (rand() * 30 - 15).toFixed(1);
    out += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(
      0
    )}) rotate(${rot}) scale(${scale.toFixed(2)})" opacity="${opacity}">
      <path d="${ic}" fill="none" stroke="#ffffff" stroke-width="1.1"
        stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  return out;
}

function dotPattern() {
  return `<pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.1" fill="#ffffff" opacity="0.05"/>
    </pattern>`;
}

function background(w, h, seed) {
  const rand = mulberry32(seed);
  const cx = w * 0.5;
  const cy = h * 0.42;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="42%" r="75%">
        <stop offset="0%" stop-color="#5538a8"/>
        <stop offset="45%" stop-color="#372673"/>
        <stop offset="100%" stop-color="#171132"/>
      </radialGradient>
      ${dotPattern()}
      <radialGradient id="glow" cx="50%" cy="42%" r="55%">
        <stop offset="0%" stop-color="#6a47c9" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#6a47c9" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect width="${w}" height="${h}" fill="url(#dots)"/>
    ${iconLayer(rand, w, h, Math.round((w * h) / 70000), 0.5)}
    <circle cx="${cx}" cy="${cy}" r="${w * 0.5}" fill="url(#glow)"/>
  </svg>`;
}

// --- Texto del post ---
function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function textOverlay(w, h, opts) {
  const {
    eyebrow,
    titulo, // array de lineas
    subtitulo,
    handle,
    badge,
  } = opts;

  const fontStack =
    "'Helvetica Neue', Helvetica, Arial, 'DejaVu Sans', sans-serif";
  const cx = w / 2;
  const titleSize = w < 1200 ? 78 : 70;
  const lineGap = titleSize * 1.16;
  // bloque de titulo centrado verticalmente, un poco abajo del logo
  const titleStartY = h * 0.5;

  const titleLines = titulo
    .map(
      (line, i) =>
        `<text x="${cx}" y="${(
          titleStartY +
          i * lineGap
        ).toFixed(0)}" text-anchor="middle" font-family="${fontStack}" font-size="${titleSize}" font-weight="800" fill="#ffffff" letter-spacing="-1">${esc(
          line
        )}</text>`
    )
    .join("");

  const subY = titleStartY + titulo.length * lineGap + 28;
  const accentY = titleStartY - titleSize - 34;

  let badgeSvg = "";
  if (badge) {
    const bw = 24 + badge.length * 18;
    badgeSvg = `<g transform="translate(${cx - bw / 2} ${accentY - 64})">
      <rect width="${bw}" height="46" rx="23" fill="#8b6cff"/>
      <text x="${bw / 2}" y="30" text-anchor="middle" font-family="${fontStack}" font-size="22" font-weight="800" fill="#ffffff" letter-spacing="2">${esc(
      badge
    )}</text></g>`;
  }

  const eyebrowSvg = eyebrow
    ? `<text x="${cx}" y="${accentY}" text-anchor="middle" font-family="${fontStack}" font-size="26" font-weight="700" fill="#bfa9ff" letter-spacing="4">${esc(
        eyebrow.toUpperCase()
      )}</text>`
    : "";

  const subSvg = subtitulo
    ? `<text x="${cx}" y="${subY.toFixed(
        0
      )}" text-anchor="middle" font-family="${fontStack}" font-size="34" font-weight="400" fill="#d9d2f5">${esc(
        subtitulo
      )}</text>`
    : "";

  const handleSvg = handle
    ? `<text x="${cx}" y="${h - 70}" text-anchor="middle" font-family="${fontStack}" font-size="30" font-weight="600" fill="#9f8ae0" letter-spacing="1">${esc(
        handle
      )}</text>`
    : "";

  // linea acento bajo el subtitulo
  const accentLine = `<rect x="${cx - 44}" y="${(subY + 34).toFixed(
    0
  )}" width="88" height="5" rx="2.5" fill="#8b6cff"/>`;

  return Buffer.from(
    `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${badgeSvg}
      ${eyebrowSvg}
      ${titleLines}
      ${subSvg}
      ${subtitulo ? accentLine : ""}
      ${handleSvg}
    </svg>`
  );
}

async function buildPost(file, w, h, seed, logoW, opts) {
  const bg = Buffer.from(background(w, h, seed));
  const base = sharp(bg);

  const logo = await sharp(LOGO)
    .resize({ width: logoW })
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const logoY = Math.round(h * 0.5 - (h < 1200 ? 320 : 300) - logoMeta.height);

  const layers = [
    {
      input: logo,
      top: Math.max(60, Math.round(h * 0.12)),
      left: Math.round((w - logoMeta.width) / 2),
    },
    { input: textOverlay(w, h, opts), top: 0, left: 0 },
  ];

  await base
    .composite(layers)
    .png()
    .toFile(path.join(OUT_DIR, file));
  console.log("ok", file);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const W = 1080,
    H = 1080;
  const logoW = 300;

  await buildPost("01-hero.png", W, H, 7, logoW, {
    badge: "NUEVO",
    eyebrow: "Portal de clientes",
    titulo: ["Tu despacho contable,", "ahora en tu bolsillo"],
    subtitulo: "Todo tu estado fiscal en un solo lugar",
    handle: "@rdccontadores",
  });

  await buildPost("02-comprobante.png", W, H, 21, logoW, {
    eyebrow: "Funci\u00f3n 1 de 3",
    titulo: ["Sube tu comprobante", "en segundos"],
    subtitulo: "Sin correos ni llamadas. Desde tu celular.",
    handle: "@rdccontadores",
  });

  await buildPost("03-honorarios.png", W, H, 33, logoW, {
    eyebrow: "Funci\u00f3n 2 de 3",
    titulo: ["Tus honorarios,", "siempre claros"],
    subtitulo: "Consulta lo que debes y lo pagado, 24/7.",
    handle: "@rdccontadores",
  });

  await buildPost("04-cumplimiento.png", W, H, 48, logoW, {
    eyebrow: "Funci\u00f3n 3 de 3",
    titulo: ["Tu cumplimiento", "fiscal a la vista"],
    subtitulo: "Transparencia total con el SAT.",
    handle: "@rdccontadores",
  });

  await buildPost("05-cta.png", W, H, 61, logoW, {
    badge: "EMPIEZA HOY",
    eyebrow: "Activa tu portal",
    titulo: ["Pide tu acceso", "por WhatsApp"],
    subtitulo: "Te lo activo el mismo d\u00eda.",
    handle: "@rdccontadores",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

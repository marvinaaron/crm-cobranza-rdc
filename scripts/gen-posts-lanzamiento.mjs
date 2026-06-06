// Genera el set de posts de lanzamiento del Portal de Clientes RDC.
// Fondo navy degradado con toque violeta, patron de iconos tenues y esparcidos,
// logo RDC, badges con degradado violeta y Fiscalino (#fiscalino el contador).
// Salida: branding-social/posts/*.png
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "branding-social/posts";
const LOGO = "public/logos/rdc-white.png";
const FISCALINO = "public/fiscalino/fiscalino-happy.png";

// Los ojos del PNG de Fiscalino son blancos pero semitransparentes (~28% alpha),
// por eso sobre fondo navy se ven grises. Forzamos esos pixeles blancos a opacos
// solo para los posts (no tocamos el asset original del portal).
async function fiscalinoOjosSolidos(width) {
  const { data, info } = await sharp(FISCALINO)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3];
    if (r > 225 && g > 225 && b > 225 && a > 10 && a < 235) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: ch },
  })
    .resize({ width })
    .png()
    .toBuffer();
}

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

// --- Iconos de industria contable/fiscal (paths en viewBox 24x24, linea) ---
const ICONS = [
  // diente
  "M7 4C5 4 4 5.5 4 8c0 3 1 5 1.5 8 .4 2 .6 3.5 1.5 3.5s1-1.8 1.4-3.3C9.8 14.7 10.6 14 12 14s2.2.7 2.6 2.2c.4 1.5.5 3.3 1.4 3.3s1.1-1.5 1.5-3.5c.5-3 1.5-5 1.5-8 0-2.5-1-4-3-4-1.4 0-2.4.9-3.5.9S8.4 4 7 4z",
  // tuerca
  "M12 3l7 4v8l-7 4-7-4V7z M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z",
  // casco de trabajador
  "M4 18h16 M6 18v-3a6 6 0 0 1 12 0v3 M10 8.5V6h4v2.5",
  // birrete de graduacion
  "M2 9l10-4 10 4-10 4z M6 11v4.5c0 1.2 2.7 2 6 2s6-.8 6-2V11 M21 9.2v5",
  // camion
  "M3 7h11v8H3z M14 10h3l3 3v2h-6 M5 17a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 0 0-3.2 0z M15.8 17a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 0 0-3.2 0z",
  // foco
  "M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3z M9.5 19h5 M10.5 21.5h3",
  // camara
  "M3 7.5h3.5l1.8-2h5.4l1.8 2H20v11H3z M8.5 13a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0z",
  // mazo de juez
  "M13 3l5 5-2.5 2.5-5-5z M11 6.5l-7 7 2.5 2.5 7-7 M4 20h8",
  // impresora
  "M7 8.5V3.5h10v5 M5 8.5h14v7H5z M8 15.5h8v5H8z M9 11.5h6",
  // carro
  "M5 12l1.6-4.5h10.8L19 12 M3.5 12h17v5h-14 M3.5 17v-5 M20.5 17v-5 M6 17a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z M15 17a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z",
  // signo de pesos
  "M9 4v16 M12.5 4v16 M6.5 8.5h11 M6.5 13.5h11 M9 4h5a4 4 0 0 1 0 8H9",
  // casa
  "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  // check en circulo
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M7.5 12l3 3 5.5-6",
  // llave
  "M14.5 3.5a5 5 0 1 0 3.5 8.5 5 5 0 0 0-3.5-8.5z M11 11l-7 7v2.5h2.5l.7-.7 M8 18l1.5 1.5 M16.5 8a.9.9 0 1 0 .01 0z",
  // estrella
  "M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z",
  // grafica de barras
  "M5 19V9 M10 19V5 M15 19v-7 M20 19v-4 M4 20.5h17",
  // escudo
  "M12 3l8 3.5v5c0 5-3.5 8-8 9.5-4.5-1.5-8-4.5-8-9.5v-5z",
  // folder
  "M3 6h6l2 2h10v11H3z",
  // archivos
  "M8 3.5h7l4 4v11H8z M15 3.5v4h4 M5 7.5v13h11",
  // portafolio
  "M4 7.5h16v11H4z M9 7.5V5.5h6v2 M4 12h16",
  // computadora / monitor
  "M3 5h18v11H3z M9 20h6 M12 16v4",
  // telefono
  "M7.5 3h9v18h-9z M10.5 18h3",
  // reloj
  "M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0z M12 8v4l3 2",
  // llave perico (wrench)
  "M15.5 5a4 4 0 0 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-2.2 2.2-2.8-.7-.7-2.8z",
  // chaleco de trabajador
  "M9 4l3 2.5L15 4l3 2 .8 13H5.2L6 6z M12 6.5V19 M8 9.5l-1 6 M16 9.5l1 6",
];

// zonas protegidas (en %) donde NO se dibujan iconos para legibilidad
function protectedZones(w, h, opts) {
  const z = [
    { x0: 0.2, x1: 0.8, y0: 0.08, y1: 0.26 }, // logo
    { x0: 0.1, x1: 0.9, y0: 0.3, y1: 0.72 }, // badge/eyebrow/titulo/sub
    { x0: 0.22, x1: 0.78, y0: 0.88, y1: 1.0 }, // handle
  ];
  if (opts && opts.fiscalino)
    z.push({ x0: 0.0, x1: 0.42, y0: 0.7, y1: 1.0 }); // esquina de Fiscalino
  return z;
}

function inProtected(x, y, w, h, zones) {
  const px = x / w;
  const py = y / h;
  return zones.some(
    (z) => px > z.x0 && px < z.x1 && py > z.y0 && py < z.y1
  );
}

// rejilla con jitter -> iconos esparcidos por TODA la imagen, sin amontonar
function iconLayer(rand, w, h, opts) {
  const zones = protectedZones(w, h, opts);
  const cols = 6;
  const rows = Math.round((cols * h) / w);
  const cw = w / cols;
  const ch = h / rows;
  let out = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rand() < 0.12) continue; // pequenos huecos naturales
      const jx = (rand() - 0.5) * cw * 0.7;
      const jy = (rand() - 0.5) * ch * 0.7;
      const x = c * cw + cw / 2 + jx;
      const y = r * ch + ch / 2 + jy;
      if (inProtected(x, y, w, h, zones)) continue;
      const ic = ICONS[Math.floor(rand() * ICONS.length)];
      const scale = 1.5 + rand() * 1.3;
      const rot = (rand() * 36 - 18).toFixed(1);
      const op = (0.1 + rand() * 0.07).toFixed(3);
      const cxIcon = 12 * scale;
      out += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(
        0
      )}) rotate(${rot}) scale(${scale.toFixed(
        2
      )}) translate(-12 -12)" opacity="${op}">
        <path d="${ic}" fill="none" stroke="#cdd6ff" stroke-width="1.1"
          stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }
  }
  return out;
}

function background(w, h, seed, opts) {
  const rand = mulberry32(seed);
  const cx = w * 0.5;
  const cy = h * 0.4;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="38%" r="80%">
        <stop offset="0%" stop-color="#243a72"/>
        <stop offset="48%" stop-color="#152546"/>
        <stop offset="100%" stop-color="#0a1228"/>
      </radialGradient>
      <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#ffffff" opacity="0.035"/>
      </pattern>
      <radialGradient id="violet" cx="50%" cy="34%" r="42%">
        <stop offset="0%" stop-color="#6a4fc0" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="#6a4fc0" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect width="${w}" height="${h}" fill="url(#dots)"/>
    ${iconLayer(rand, w, h, opts)}
    <circle cx="${cx}" cy="${cy}" r="${w * 0.46}" fill="url(#violet)"/>
  </svg>`;
}

// --- Texto ---
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textOverlay(w, h, opts) {
  const { eyebrow, titulo, subtitulo, handle, badge, fiscalinoTag } = opts;
  const fontStack =
    "'Helvetica Neue', Helvetica, Arial, 'DejaVu Sans', sans-serif";
  const cx = w / 2;
  const titleSize = 70;
  const lineGap = titleSize * 1.16;
  const titleStartY = h * 0.5;

  const titleLines = titulo
    .map(
      (line, i) =>
        `<text x="${cx}" y="${(titleStartY + i * lineGap).toFixed(
          0
        )}" text-anchor="middle" font-family="${fontStack}" font-size="${titleSize}" font-weight="800" fill="#ffffff" letter-spacing="-1">${esc(
          line
        )}</text>`
    )
    .join("");

  const subY = titleStartY + titulo.length * lineGap + 28;
  const eyebrowY = titleStartY - titleSize - 40;
  const badgeY = eyebrowY - 78; // gap claro entre badge y eyebrow

  let badgeSvg = "";
  if (badge) {
    const bw = 34 + badge.length * 17;
    badgeSvg = `<g transform="translate(${cx - bw / 2} ${badgeY})">
      <rect width="${bw}" height="48" rx="24" fill="url(#badgeGrad)"/>
      <text x="${bw / 2}" y="31" text-anchor="middle" font-family="${fontStack}" font-size="22" font-weight="800" fill="#ffffff" letter-spacing="2.5">${esc(
      badge
    )}</text></g>`;
  }

  const eyebrowSvg = eyebrow
    ? `<text x="${cx}" y="${eyebrowY}" text-anchor="middle" font-family="${fontStack}" font-size="26" font-weight="700" fill="#aab8ec" letter-spacing="4">${esc(
        eyebrow.toUpperCase()
      )}</text>`
    : "";

  const subSvg = subtitulo
    ? `<text x="${cx}" y="${subY.toFixed(
        0
      )}" text-anchor="middle" font-family="${fontStack}" font-size="34" font-weight="400" fill="#d3dbf5">${esc(
        subtitulo
      )}</text>`
    : "";

  const handleSvg = handle
    ? `<text x="${cx}" y="${h - 64}" text-anchor="middle" font-family="${fontStack}" font-size="30" font-weight="600" fill="#8ea0e0" letter-spacing="1">${esc(
        handle
      )}</text>`
    : "";

  const accentLine = subtitulo
    ? `<rect x="${cx - 44}" y="${(subY + 34).toFixed(
        0
      )}" width="88" height="5" rx="2.5" fill="url(#badgeGrad)"/>`
    : "";

  let tagSvg = "";
  if (fiscalinoTag) {
    const { x, y } = fiscalinoTag;
    const pw = 158;
    tagSvg = `<g transform="translate(${x} ${y})">
      <rect width="${pw}" height="44" rx="22" fill="#ffffff" opacity="0.10"/>
      <rect width="${pw}" height="44" rx="22" fill="none" stroke="#8b6cff" stroke-opacity="0.5" stroke-width="1.5"/>
      <text x="18" y="29" font-family="${fontStack}" font-size="22" font-weight="800" fill="#b9a6ff">#fiscalino</text>
    </g>`;
  }

  return Buffer.from(
    `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4f46e5"/>
          <stop offset="100%" stop-color="#7c3aed"/>
        </linearGradient>
      </defs>
      ${badgeSvg}
      ${eyebrowSvg}
      ${titleLines}
      ${subSvg}
      ${accentLine}
      ${tagSvg}
      ${handleSvg}
    </svg>`
  );
}

async function buildPost(file, w, h, seed, logoW, opts) {
  const bg = Buffer.from(background(w, h, seed, opts));
  const base = sharp(bg);

  const logo = await sharp(LOGO).resize({ width: logoW }).toBuffer();
  const logoMeta = await sharp(logo).metadata();

  const layers = [
    {
      input: logo,
      top: Math.round(h * 0.12),
      left: Math.round((w - logoMeta.width) / 2),
    },
  ];

  const textOpts = { ...opts };

  if (opts.fiscalino) {
    const owlW = 250;
    const owl = await fiscalinoOjosSolidos(owlW);
    const owlMeta = await sharp(owl).metadata();
    const owlLeft = 22;
    const owlTop = h - owlMeta.height - 18;
    layers.push({ input: owl, top: owlTop, left: owlLeft });
    textOpts.fiscalinoTag = {
      x: owlLeft + owlW - 6,
      y: owlTop + Math.round(owlMeta.height * 0.22),
    };
  }

  layers.push({ input: textOverlay(w, h, textOpts), top: 0, left: 0 });

  await base.composite(layers).png().toFile(path.join(OUT_DIR, file));
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
    fiscalino: true,
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

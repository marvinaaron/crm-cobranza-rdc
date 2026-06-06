// Genera el set de posts de lanzamiento del Portal de Clientes RDC.
// Fondo navy con toque violeta + mockups reales del portal (alta dopamina):
// cuenta, pago en linea y timeline del proceso de 7 pasos.
// Salida: branding-social/posts/*.png
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "branding-social/posts";
const LOGO = "public/logos/rdc-white.png";
const FISCALINO = "public/fiscalino/fiscalino-happy.png";

const FONT =
  "'Helvetica Neue', Helvetica, Arial, 'DejaVu Sans', sans-serif";

// Los ojos del PNG de Fiscalino son blancos pero semitransparentes (~28% alpha),
// por eso sobre fondo navy se ven grises. Forzamos esos pixeles a opacos.
async function fiscalinoOjosSolidos(width) {
  const { data, info } = await sharp(FISCALINO)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    if (
      data[i] > 225 &&
      data[i + 1] > 225 &&
      data[i + 2] > 225 &&
      data[i + 3] > 10 &&
      data[i + 3] < 235
    ) {
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

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ICONS = [
  "M7 4C5 4 4 5.5 4 8c0 3 1 5 1.5 8 .4 2 .6 3.5 1.5 3.5s1-1.8 1.4-3.3C9.8 14.7 10.6 14 12 14s2.2.7 2.6 2.2c.4 1.5.5 3.3 1.4 3.3s1.1-1.5 1.5-3.5c.5-3 1.5-5 1.5-8 0-2.5-1-4-3-4-1.4 0-2.4.9-3.5.9S8.4 4 7 4z",
  "M12 3l7 4v8l-7 4-7-4V7z M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z",
  "M4 18h16 M6 18v-3a6 6 0 0 1 12 0v3 M10 8.5V6h4v2.5",
  "M2 9l10-4 10 4-10 4z M6 11v4.5c0 1.2 2.7 2 6 2s6-.8 6-2V11 M21 9.2v5",
  "M3 7h11v8H3z M14 10h3l3 3v2h-6 M5 17a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 0 0-3.2 0z M15.8 17a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 0 0-3.2 0z",
  "M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3z M9.5 19h5 M10.5 21.5h3",
  "M3 7.5h3.5l1.8-2h5.4l1.8 2H20v11H3z M8.5 13a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0z",
  "M13 3l5 5-2.5 2.5-5-5z M11 6.5l-7 7 2.5 2.5 7-7 M4 20h8",
  "M7 8.5V3.5h10v5 M5 8.5h14v7H5z M8 15.5h8v5H8z M9 11.5h6",
  "M9 4v16 M12.5 4v16 M6.5 8.5h11 M6.5 13.5h11 M9 4h5a4 4 0 0 1 0 8H9",
  "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M7.5 12l3 3 5.5-6",
  "M14.5 3.5a5 5 0 1 0 3.5 8.5 5 5 0 0 0-3.5-8.5z M11 11l-7 7v2.5h2.5l.7-.7 M8 18l1.5 1.5 M16.5 8a.9.9 0 1 0 .01 0z",
  "M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z",
  "M5 19V9 M10 19V5 M15 19v-7 M20 19v-4 M4 20.5h17",
  "M12 3l8 3.5v5c0 5-3.5 8-8 9.5-4.5-1.5-8-4.5-8-9.5v-5z",
  "M3 6h6l2 2h10v11H3z",
  "M8 3.5h7l4 4v11H8z M15 3.5v4h4 M5 7.5v13h11",
  "M4 7.5h16v11H4z M9 7.5V5.5h6v2 M4 12h16",
  "M3 5h18v11H3z M9 20h6 M12 16v4",
  "M7.5 3h9v18h-9z M10.5 18h3",
  "M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0z M12 8v4l3 2",
  "M15.5 5a4 4 0 0 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-2.2 2.2-2.8-.7-.7-2.8z",
  "M9 4l3 2.5L15 4l3 2 .8 13H5.2L6 6z M12 6.5V19 M8 9.5l-1 6 M16 9.5l1 6",
];

function protectedZones(w, h, opts) {
  const z = [
    { x0: 0.2, x1: 0.8, y0: 0.04, y1: 0.16 }, // logo
    { x0: 0.06, x1: 0.94, y0: 0.16, y1: 0.92 }, // headline + tarjeta
    { x0: 0.22, x1: 0.78, y0: 0.92, y1: 1.0 }, // handle
  ];
  if (opts && opts.heroLayout) {
    // hero usa layout centrado: proteger franja central y esquina de Fiscalino
    z.length = 0;
    z.push({ x0: 0.2, x1: 0.8, y0: 0.08, y1: 0.26 });
    z.push({ x0: 0.1, x1: 0.9, y0: 0.3, y1: 0.72 });
    z.push({ x0: 0.22, x1: 0.78, y0: 0.88, y1: 1.0 });
    if (opts.fiscalino) z.push({ x0: 0, x1: 0.42, y0: 0.7, y1: 1.0 });
  }
  return z;
}

function inProtected(x, y, w, h, zones) {
  const px = x / w,
    py = y / h;
  return zones.some((z) => px > z.x0 && px < z.x1 && py > z.y0 && py < z.y1);
}

function iconLayer(rand, w, h, opts) {
  const zones = protectedZones(w, h, opts);
  const cols = 6;
  const rows = Math.round((cols * h) / w);
  const cw = w / cols;
  const ch = h / rows;
  let out = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rand() < 0.12) continue;
      const x = c * cw + cw / 2 + (rand() - 0.5) * cw * 0.7;
      const y = r * ch + ch / 2 + (rand() - 0.5) * ch * 0.7;
      if (inProtected(x, y, w, h, zones)) continue;
      const ic = ICONS[Math.floor(rand() * ICONS.length)];
      const scale = 1.5 + rand() * 1.3;
      const rot = (rand() * 36 - 18).toFixed(1);
      const op = (0.1 + rand() * 0.07).toFixed(3);
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
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="36%" r="80%">
        <stop offset="0%" stop-color="#243a72"/>
        <stop offset="48%" stop-color="#152546"/>
        <stop offset="100%" stop-color="#0a1228"/>
      </radialGradient>
      <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#ffffff" opacity="0.035"/>
      </pattern>
      <radialGradient id="violet" cx="50%" cy="30%" r="42%">
        <stop offset="0%" stop-color="#6a4fc0" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="#6a4fc0" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect width="${w}" height="${h}" fill="url(#dots)"/>
    ${iconLayer(rand, w, h, opts)}
    <circle cx="${w * 0.5}" cy="${h * 0.3}" r="${w * 0.46}" fill="url(#violet)"/>
  </svg>`;
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const DEFS = `
  <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#4f46e5"/>
    <stop offset="100%" stop-color="#7c3aed"/>
  </linearGradient>
  <linearGradient id="payGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#4f46e5"/>
    <stop offset="100%" stop-color="#7c3aed"/>
  </linearGradient>
  <filter id="cardShadow" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="20" stdDeviation="28" flood-color="#050912" flood-opacity="0.55"/>
  </filter>`;

// ---------- MOCKUPS ----------
function check(cx, cy, color = "#ffffff") {
  return `<path d="M${cx - 7} ${cy} l5 5 l10 -12" fill="none" stroke="${color}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function subcard(x, y, w, h, bg, label, value, note, valueColor) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${bg}"/>
    <text x="${x + 24}" y="${y + 36}" font-family="${FONT}" font-size="18" font-weight="700" fill="#94a3b8" letter-spacing="1.5">${label}</text>
    <text x="${x + 24}" y="${y + 84}" font-family="${FONT}" font-size="42" font-weight="800" fill="${valueColor}">${value}</text>
    <text x="${x + 24}" y="${y + 114}" font-family="${FONT}" font-size="18" fill="#94a3b8">${note}</text>`;
}

function mockCuenta(x, y, w) {
  const pad = 42,
    ix = x + pad,
    iw = w - pad * 2;
  const gap = 22,
    cw = (iw - gap) / 2,
    chh = 128;
  const r1 = y + 150,
    r2 = r1 + chh + 18,
    sy = r2 + chh + 22;
  const h = sy + 92 + pad - y;
  const pillW = 176,
    pillX = x + w - pad - pillW,
    pillY = y + 50;
  return {
    h,
    svg: `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="#ffffff" filter="url(#cardShadow)"/>
    <text x="${ix}" y="${y + 56}" font-family="${FONT}" font-size="20" font-weight="700" fill="#94a3b8" letter-spacing="2">MI CUENTA</text>
    <text x="${ix}" y="${y + 100}" font-family="${FONT}" font-size="38" font-weight="800" fill="#0f172a">Honorarios &#183; Mayo 2026</text>
    <rect x="${pillX}" y="${pillY}" width="${pillW}" height="48" rx="24" fill="#d1fae5"/>
    ${check(pillX + 30, pillY + 24, "#059669")}
    <text x="${pillX + 50}" y="${pillY + 31}" font-family="${FONT}" font-size="22" font-weight="800" fill="#047857">PAGADO</text>
    ${subcard(ix, r1, cw, chh, "#ecfdf5", "SALDO DEL MES", "$0.00", "Sin adeudo", "#059669")}
    ${subcard(ix + cw + gap, r1, cw, chh, "#ecfdf5", "PENDIENTE ACUM.", "$0.00", "Est&#225;s al d&#237;a", "#059669")}
    ${subcard(ix, r2, cw, chh, "#f1f5f9", "COMPROMISO", "$2,500", "Honorarios mensuales", "#0f172a")}
    ${subcard(ix + cw + gap, r2, cw, chh, "#f1f5f9", "D&#205;A DE PAGO", "D&#237;a 5", "Cada mes", "#0f172a")}
    <rect x="${ix}" y="${sy}" width="${iw}" height="92" rx="20" fill="#ecfdf5"/>
    <circle cx="${ix + 36}" cy="${sy + 46}" r="17" fill="#10b981"/>
    ${check(ix + 36, sy + 46)}
    <text x="${ix + 66}" y="${sy + 40}" font-family="${FONT}" font-size="24" font-weight="700" fill="#065f46">Pago confirmado &#183; 4 may 2026</text>
    <text x="${ix + 66}" y="${sy + 72}" font-family="${FONT}" font-size="19" fill="#059669">$2,500.00 MXN &#183; Visa terminada en 4242</text>`,
  };
}

function chip(x, y, w, label, sub) {
  return `<rect x="${x}" y="${y}" width="${w}" height="44" rx="10" fill="#f1f5f9" stroke="#e2e8f0"/>
    <text x="${x + w / 2}" y="${y + 29}" text-anchor="middle" font-family="${FONT}" font-size="${sub ? 16 : 18}" font-weight="800" fill="#475569">${label}</text>`;
}

function mockPago(x, y, w) {
  const pad = 42,
    ix = x + pad,
    iw = w - pad * 2;
  const b1 = y + 150,
    b2 = b1 + 88 + 18,
    chy = b2 + 76 + 34;
  const stripeY = chy + 44 + 40;
  const h = stripeY + pad - y;
  // chips
  let cx = ix;
  const chips = [
    ["VISA", 92],
    ["MC", 74],
    ["AMEX", 100],
    ["Apple Pay", 132],
    ["G Pay", 110],
  ];
  let chipsSvg = "";
  for (const [lbl, cw] of chips) {
    chipsSvg += chip(cx, chy, cw, lbl);
    cx += cw + 14;
  }
  return {
    h,
    svg: `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="#ffffff" filter="url(#cardShadow)"/>
    <text x="${ix}" y="${y + 56}" font-family="${FONT}" font-size="20" font-weight="700" fill="#94a3b8" letter-spacing="2">PAGAR HONORARIOS</text>
    <text x="${ix}" y="${y + 104}" font-family="${FONT}" font-size="36" font-weight="800" fill="#0f172a">Mayo 2026 &#183; $2,500.00 MXN</text>
    <rect x="${ix}" y="${b1}" width="${iw}" height="88" rx="20" fill="url(#payGrad)"/>
    <rect x="${ix + 34}" y="${b1 + 30}" width="34" height="26" rx="5" fill="#ffffff" opacity="0.9"/>
    <rect x="${ix + 34}" y="${b1 + 37}" width="34" height="6" fill="#7c3aed"/>
    <text x="${ix + iw / 2 + 24}" y="${b1 + 55}" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="800" fill="#ffffff">Pagar con tarjeta</text>
    <rect x="${ix}" y="${b2}" width="${iw}" height="76" rx="20" fill="#f1f5f9"/>
    <text x="${ix + iw / 2}" y="${b2 + 48}" text-anchor="middle" font-family="${FONT}" font-size="25" font-weight="700" fill="#475569">Pagar por transferencia</text>
    ${chipsSvg}
    <circle cx="${ix + 9}" cy="${stripeY - 27}" r="0" fill="none"/>
    <text x="${ix}" y="${stripeY - 18}" font-family="${FONT}" font-size="19" font-weight="600" fill="#94a3b8">&#128274; Procesado por Stripe</text>`,
  };
}

function mockProceso(x, y, w) {
  const pad = 42,
    ix = x + pad,
    iw = w - pad * 2;
  const steps = [
    ["Sin iniciar", "done"],
    ["En preparaci\u00f3n", "done"],
    ["Revisi\u00f3n de impuestos", "done"],
    ["Confirmado", "current"],
    ["Declarando", "todo"],
    ["Confirmando pago", "todo"],
    ["Completado", "todo"],
  ];
  const barY = y + 116;
  const ls = y + 158;
  const rowH = 56;
  const footY = ls + steps.length * rowH + 6;
  const h = footY + 70 + pad - y;
  const prog = 4 / 7;

  let rail = "";
  steps.forEach((s, i) => {
    const cy = ls + rowH / 2 + i * rowH;
    const cxp = ix + 22;
    if (i < steps.length - 1) {
      const ny = ls + rowH / 2 + (i + 1) * rowH;
      const col = s[1] === "done" ? "#10b981" : "#e2e8f0";
      rail += `<line x1="${cxp}" y1="${cy + 20}" x2="${cxp}" y2="${ny - 20}" stroke="${col}" stroke-width="3"/>`;
    }
    let node, txtColor, weight;
    if (s[1] === "done") {
      node = `<circle cx="${cxp}" cy="${cy}" r="18" fill="#10b981"/>${check(cxp, cy)}`;
      txtColor = "#0f172a";
      weight = 700;
    } else if (s[1] === "current") {
      node = `<circle cx="${cxp}" cy="${cy}" r="27" fill="#7c3aed" opacity="0.18"/>
        <circle cx="${cxp}" cy="${cy}" r="18" fill="url(#payGrad)"/>
        <circle cx="${cxp}" cy="${cy}" r="6" fill="#ffffff"/>`;
      txtColor = "#6d28d9";
      weight = 800;
    } else {
      node = `<circle cx="${cxp}" cy="${cy}" r="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5"/>
        <circle cx="${cxp}" cy="${cy}" r="5" fill="#cbd5e1"/>`;
      txtColor = "#94a3b8";
      weight = 500;
    }
    rail += node;
    rail += `<text x="${cxp + 40}" y="${cy + 9}" font-family="${FONT}" font-size="26" font-weight="${weight}" fill="${txtColor}">${s[0]}</text>`;
    if (s[1] === "current")
      rail += `<rect x="${ix + w - pad * 2 - 96}" y="${cy - 17}" width="96" height="34" rx="17" fill="#ede9fe"/>
        <text x="${ix + w - pad * 2 - 48}" y="${cy + 6}" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="800" fill="#6d28d9">AHORA</text>`;
  });

  return {
    h,
    svg: `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="#ffffff" filter="url(#cardShadow)"/>
    <text x="${ix}" y="${y + 52}" font-family="${FONT}" font-size="20" font-weight="700" fill="#94a3b8" letter-spacing="2">TU CIERRE DE MAYO 2026</text>
    <text x="${ix}" y="${y + 96}" font-family="${FONT}" font-size="30" font-weight="800" fill="#6d28d9">Paso 4 de 7</text>
    <rect x="${ix}" y="${barY}" width="${iw}" height="10" rx="5" fill="#e9edf5"/>
    <rect x="${ix}" y="${barY}" width="${(iw * prog).toFixed(0)}" height="10" rx="5" fill="url(#payGrad)"/>
    ${rail}
    <rect x="${ix}" y="${footY}" width="${iw}" height="62" rx="16" fill="#ede9fe"/>
    <text x="${ix + 26}" y="${footY + 39}" font-family="${FONT}" font-size="22" font-weight="600" fill="#5b21b6">Tu contador ya revis&#243; tus impuestos. Vas al d&#237;a.</text>`,
  };
}

const MOCKS = { cuenta: mockCuenta, pago: mockPago, proceso: mockProceso };

// ---------- POSTS ----------
async function buildMockupPost(file, seed, opts) {
  const W = 1080,
    H = 1080;
  const bg = Buffer.from(background(W, H, seed, {}));
  const base = sharp(bg);

  const logoW = 200;
  const logo = await sharp(LOGO).resize({ width: logoW }).toBuffer();
  const logoMeta = await sharp(logo).metadata();

  const cardX = 84,
    cardY = 332,
    cardW = W - cardX * 2;
  const m = MOCKS[opts.mock](cardX, cardY, cardW);

  const fg = Buffer.from(
    `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>${DEFS}</defs>
      <text x="${W / 2}" y="208" text-anchor="middle" font-family="${FONT}" font-size="25" font-weight="700" fill="#aab8ec" letter-spacing="4">${esc(
      opts.eyebrow.toUpperCase()
    )}</text>
      <text x="${W / 2}" y="272" text-anchor="middle" font-family="${FONT}" font-size="52" font-weight="800" fill="#ffffff" letter-spacing="-1">${esc(
      opts.titulo
    )}</text>
      ${m.svg}
      <text x="${W / 2}" y="${H - 44}" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="600" fill="#8ea0e0" letter-spacing="1">@rdccontadores</text>
    </svg>`
  );

  await base
    .composite([
      { input: logo, top: 62, left: Math.round((W - logoMeta.width) / 2) },
      { input: fg, top: 0, left: 0 },
    ])
    .png()
    .toFile(path.join(OUT_DIR, file));
  console.log("ok", file);
}

function heroOverlay(W, H, opts) {
  const cx = W / 2;
  const titleSize = 70;
  const lineGap = titleSize * 1.16;
  const titleStartY = H * 0.5;
  const titleLines = opts.titulo
    .map(
      (l, i) =>
        `<text x="${cx}" y="${(titleStartY + i * lineGap).toFixed(
          0
        )}" text-anchor="middle" font-family="${FONT}" font-size="${titleSize}" font-weight="800" fill="#ffffff" letter-spacing="-1">${esc(
          l
        )}</text>`
    )
    .join("");
  const subY = titleStartY + opts.titulo.length * lineGap + 28;
  const eyebrowY = titleStartY - titleSize - 40;
  const badgeY = eyebrowY - 78;
  const bw = 34 + opts.badge.length * 17;
  return Buffer.from(
    `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>${DEFS}</defs>
      <g transform="translate(${cx - bw / 2} ${badgeY})">
        <rect width="${bw}" height="48" rx="24" fill="url(#badgeGrad)"/>
        <text x="${bw / 2}" y="31" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="800" fill="#ffffff" letter-spacing="2.5">${esc(
      opts.badge
    )}</text>
      </g>
      <text x="${cx}" y="${eyebrowY}" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="700" fill="#aab8ec" letter-spacing="4">${esc(
      opts.eyebrow.toUpperCase()
    )}</text>
      ${titleLines}
      <text x="${cx}" y="${subY.toFixed(
      0
    )}" text-anchor="middle" font-family="${FONT}" font-size="34" fill="#d3dbf5">${esc(
      opts.subtitulo
    )}</text>
      <rect x="${cx - 44}" y="${(subY + 34).toFixed(
      0
    )}" width="88" height="5" rx="2.5" fill="url(#badgeGrad)"/>
      ${
        opts.fiscalinoTag
          ? `<g transform="translate(${opts.fiscalinoTag.x} ${opts.fiscalinoTag.y})">
        <rect width="158" height="44" rx="22" fill="#ffffff" opacity="0.10"/>
        <rect width="158" height="44" rx="22" fill="none" stroke="#8b6cff" stroke-opacity="0.5" stroke-width="1.5"/>
        <text x="18" y="29" font-family="${FONT}" font-size="22" font-weight="800" fill="#b9a6ff">#fiscalino</text></g>`
          : ""
      }
      <text x="${cx}" y="${H - 64}" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="600" fill="#8ea0e0" letter-spacing="1">@rdccontadores</text>
    </svg>`
  );
}

async function buildHeroPost(file, seed, opts) {
  const W = 1080,
    H = 1080;
  const bg = Buffer.from(
    background(W, H, seed, { heroLayout: true, fiscalino: !!opts.fiscalino })
  );
  const base = sharp(bg);
  const logo = await sharp(LOGO).resize({ width: 300 }).toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const layers = [
    { input: logo, top: Math.round(H * 0.12), left: Math.round((W - logoMeta.width) / 2) },
  ];
  const textOpts = { ...opts };
  if (opts.fiscalino) {
    const owlW = 250;
    const owl = await fiscalinoOjosSolidos(owlW);
    const owlMeta = await sharp(owl).metadata();
    const owlLeft = 22,
      owlTop = H - owlMeta.height - 18;
    layers.push({ input: owl, top: owlTop, left: owlLeft });
    textOpts.fiscalinoTag = {
      x: owlLeft + owlW - 6,
      y: owlTop + Math.round(owlMeta.height * 0.22),
    };
  }
  layers.push({ input: heroOverlay(W, H, textOpts), top: 0, left: 0 });
  await base.composite(layers).png().toFile(path.join(OUT_DIR, file));
  console.log("ok", file);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  await buildHeroPost("01-hero.png", 7, {
    badge: "NUEVO",
    eyebrow: "Portal de clientes",
    titulo: ["Tu despacho contable,", "ahora en tu bolsillo"],
    subtitulo: "Todo tu estado fiscal en un solo lugar",
    fiscalino: true,
  });

  await buildMockupPost("02-cuenta.png", 21, {
    eyebrow: "Estado de cuenta",
    titulo: "Tu cuenta, siempre clara",
    mock: "cuenta",
  });

  await buildMockupPost("03-pago.png", 33, {
    eyebrow: "Pago en l\u00ednea",
    titulo: "Paga en 2 toques",
    mock: "pago",
  });

  await buildMockupPost("04-proceso.png", 48, {
    eyebrow: "En tiempo real",
    titulo: "Mira tu proceso paso a paso",
    mock: "proceso",
  });

  await buildHeroPost("05-cta.png", 61, {
    badge: "EMPIEZA HOY",
    eyebrow: "Activa tu portal",
    titulo: ["Pide tu acceso", "por WhatsApp"],
    subtitulo: "Te lo activo el mismo d\u00eda.",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

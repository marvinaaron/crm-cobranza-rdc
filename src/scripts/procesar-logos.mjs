/**
 * Procesa los logos crudos (PNG con fondo blanco) en `public/logos/_source-*.png`
 * y genera variantes transparentes en negro, blanco y gris claro.
 *
 * Estrategia:
 *  1. Lee el PNG y obtiene su buffer RAW (RGBA).
 *  2. Calcula el brillo de cada pixel (promedio RGB).
 *  3. Define el alpha como (255 - brillo) → blanco se vuelve transparente,
 *     negro queda completamente opaco, los grises (anti-alias del borde)
 *     mantienen alpha intermedio para conservar suavidad de los bordes.
 *  4. Setea los canales RGB al color destino y mantiene el alpha calculado.
 *  5. Recorta espacios transparentes (`trim`) para que el logo quede ajustado.
 *  6. Guarda PNG optimizado.
 *
 * Esto produce logos sin fondo y con bordes anti-aliased correctos.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "public/logos");

const COLORES = [
  { nombre: "black", rgb: [15, 23, 42] }, // slate-900
  { nombre: "white", rgb: [255, 255, 255] },
  { nombre: "gray", rgb: [203, 213, 225] }, // slate-300
];

const SOURCES = [
  { src: "_source-r.png", out: "r" },
  { src: "_source-rdc.png", out: "rdc" },
];

async function procesarLogo(srcPath, outBaseName) {
  const buf = await fs.readFile(srcPath);
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Umbral: cualquier pixel con brillo > UMBRAL_BLANCO se considera fondo
  // y se vuelve totalmente transparente. Esto limpia los artefactos casi-
  // blancos del JPEG/PNG original que ensucian el trim.
  const UMBRAL_BLANCO = 230;
  // Por debajo de UMBRAL_NEGRO el pixel se considera completamente sólido
  // (alpha 255) para que el cuerpo del logo no pierda densidad.
  const UMBRAL_NEGRO = 80;

  for (const color of COLORES) {
    const out = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const brillo = Math.round((r + g + b) / 3);

      let alphaCalculado;
      if (brillo >= UMBRAL_BLANCO) {
        // Fondo blanco/casi blanco → transparente puro.
        alphaCalculado = 0;
      } else if (brillo <= UMBRAL_NEGRO) {
        // Cuerpo sólido del logo → opaco puro.
        alphaCalculado = 255;
      } else {
        // Borde anti-aliased: mapeo lineal entre umbrales para conservar
        // bordes suaves y nítidos.
        const t = (UMBRAL_BLANCO - brillo) / (UMBRAL_BLANCO - UMBRAL_NEGRO);
        alphaCalculado = Math.round(255 * t);
      }

      // Respeta el alpha original (si el PNG ya tenía transparencias).
      const alphaFinal = Math.round((alphaCalculado * a) / 255);
      out[i] = color.rgb[0];
      out[i + 1] = color.rgb[1];
      out[i + 2] = color.rgb[2];
      out[i + 3] = alphaFinal;
    }

    const filePath = path.join(ROOT, `${outBaseName}-${color.nombre}.png`);
    await sharp(out, { raw: { width, height, channels } })
      // Trim agresivo: ahora que los píxeles blancos son totalmente
      // transparentes, el trim recorta correctamente el área del logo.
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
      .png({ compressionLevel: 9, palette: false })
      .toFile(filePath);

    console.log(`✓ Generado ${path.relative(process.cwd(), filePath)}`);
  }
}

/**
 * Genera favicons a partir del isotipo "R" en sus dos versiones.
 *
 * Diseño híbrido (lo más profesional):
 *  - Favicon de pestaña del navegador → "R" navy sobre fondo TRANSPARENTE.
 *    Se ve como una marca seria estilo Apple/Stripe en navegadores claros.
 *    En modo oscuro se mantiene legible por el contraste del trazo.
 *  - Apple touch icon / Android / PWA → "R" blanca sobre slate-900 con
 *    esquinas redondeadas suaves (radio 18%). Look "app nativa".
 *
 * Genera:
 *  - public/favicon.ico (multi-size: 16, 32, 48 — transparente)
 *  - public/apple-touch-icon.png (180x180 — redondeado)
 *  - public/icon-192.png, public/icon-512.png (PWA / Android — redondeado)
 */
async function generarFavicons() {
  const ROOT_PUBLIC = path.resolve(process.cwd(), "public");
  const SRC_R_BLANCO = path.join(ROOT, "r-white.png");
  const SRC_R_NEGRO = path.join(ROOT, "r-black.png");

  for (const src of [SRC_R_BLANCO, SRC_R_NEGRO]) {
    try {
      await fs.access(src);
    } catch {
      console.warn("(skip favicons) no existe", src);
      return;
    }
  }

  // Variante violeta del isotipo (R sola, transparente). Estrategia: tomar la
  // R en negro (que tiene el alpha bien definido del trazo) y reemplazar los
  // canales RGB por violet-600, conservando el alpha original. Nota: NO
  // usamos sharp.tint() porque preserva luminosidad (LAB) y un píxel blanco
  // se queda blanco.
  const R_VIOLETA_PATH = path.join(ROOT, "r-violet.png");
  {
    const { data, info } = await sharp(SRC_R_NEGRO)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const out = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += info.channels) {
      out[i] = 124;
      out[i + 1] = 58;
      out[i + 2] = 237;
      out[i + 3] = data[i + 3];
    }
    await sharp(out, {
      raw: { width: info.width, height: info.height, channels: info.channels },
    })
      .png({ compressionLevel: 9 })
      .toFile(R_VIOLETA_PATH);
  }
  console.log(`✓ Generado ${path.relative(process.cwd(), R_VIOLETA_PATH)}`);

  const BG_OSCURO = { r: 15, g: 23, b: 42, alpha: 1 }; // slate-900 (portal)
  const BG_TRANSPARENTE = { r: 0, g: 0, b: 0, alpha: 0 };
  // Admin modo claro: degradado violet-600 → indigo-700 (igual al sidebar).
  const ADMIN_GRADIENT_CLARO = {
    inicio: "#7c3aed", // violet-600
    fin: "#4338ca", // indigo-700
  };
  // Admin modo oscuro: fondo casi-negro con sutil degradado para profundidad.
  const ADMIN_GRADIENT_OSCURO = {
    inicio: "#0a0a0a", // casi negro (zinc-950 +)
    fin: "#1c1917", // stone-900 (calidez sutil para que no sea plano)
  };
  // R con el mismo degradado del sidebar admin (violet-600 → indigo-700)
  // para mantener coherencia visual con el cuadrito del logo en la consola.
  const R_GRADIENT_OSCURO = {
    inicio: "#7c3aed", // violet-600 (igual al sidebar)
    fin: "#4338ca", // indigo-700 (igual al sidebar)
  };

  /**
   * Crea un PNG cuadrado con degradado lineal diagonal usando SVG.
   */
  function gradienteSvgBuffer(tamano, gradient) {
    return Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${tamano}" height="${tamano}">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${gradient.inicio}"/>
            <stop offset="100%" stop-color="${gradient.fin}"/>
          </linearGradient>
        </defs>
        <rect width="${tamano}" height="${tamano}" fill="url(#g)"/>
      </svg>`
    );
  }

  /**
   * Devuelve un buffer PNG (fullSize × fullSize) con la silueta de la R
   * recortada sobre un degradado que se calcula a TODO el cuadro del ícono.
   *
   * Esto hace que la R en modo oscuro tome exactamente los mismos colores
   * que tendría el fondo del ícono en modo claro en esas posiciones,
   * conservando coherencia visual con el sidebar.
   */
  async function rConGradiente(srcR, fullSize, interiorSize, rGradient) {
    // R redimensionada al tamaño interior y centrada en un canvas full.
    const rResized = await sharp(srcR)
      .resize(interiorSize, interiorSize, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
    const rOnFull = await sharp({
      create: {
        width: fullSize,
        height: fullSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: rResized, gravity: "center" }])
      .png()
      .toBuffer();

    // Degradado calculado a tamaño completo (igual que el fondo del ícono claro).
    const cuadradoGradiente = await sharp(gradienteSvgBuffer(fullSize, rGradient))
      .png()
      .toBuffer();

    // dest-in: el degradado solo se conserva donde está la silueta de la R.
    return sharp(cuadradoGradiente)
      .composite([{ input: rOnFull, blend: "dest-in" }])
      .png()
      .toBuffer();
  }

  /**
   * Genera un set de íconos PWA (180/192/512). Acepta:
   *  - `bg`: color sólido de fondo, o
   *  - `bgGradient`: { inicio, fin } degradado diagonal (top-left → bottom-right).
   *  - `rGradient`: si se pasa, la R se rellena con ese degradado (en lugar
   *    de usar el color sólido del srcR).
   * Si suffix es vacío, sobrescribe los íconos por defecto del sitio (portal).
   */
  async function generarSetIconosPwa({ bg, bgGradient, srcR, rGradient, suffix = "" }) {
    const tamanos = [
      { tamano: 180, base: "apple-touch-icon" },
      { tamano: 192, base: "icon-192" },
      { tamano: 512, base: "icon-512" },
    ];
    for (const { tamano, base } of tamanos) {
      const escala = 0.6;
      const interior = Math.round(tamano * escala);

      let baseImg;
      if (bgGradient) {
        baseImg = await sharp(gradienteSvgBuffer(tamano, bgGradient)).png().toBuffer();
      } else {
        baseImg = await sharp({
          create: { width: tamano, height: tamano, channels: 4, background: bg },
        })
          .png()
          .toBuffer();
      }

      let composiciones;
      if (rGradient) {
        // R con degradado a "tamaño completo" — ya viene del tamaño del ícono.
        const rFull = await rConGradiente(srcR, tamano, interior, rGradient);
        composiciones = [{ input: rFull, top: 0, left: 0 }];
      } else {
        const rResized = await sharp(srcR)
          .resize(interior, interior, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .toBuffer();
        composiciones = [{ input: rResized, gravity: "center" }];
      }

      let img = sharp(baseImg).composite(composiciones);
      const radio = Math.round(tamano * 0.18);
      const mask = Buffer.from(
        `<svg width="${tamano}" height="${tamano}"><rect width="${tamano}" height="${tamano}" rx="${radio}" ry="${radio}" fill="#fff"/></svg>`
      );
      const pngPlano = await img.png().toBuffer();
      img = sharp(pngPlano).composite([{ input: mask, blend: "dest-in" }]);
      const nombre = suffix ? `${base}-${suffix}.png` : `${base}.png`;
      const dest = path.join(ROOT_PUBLIC, nombre);
      await img.png({ compressionLevel: 9 }).toFile(dest);
      console.log(`✓ Generado ${path.relative(process.cwd(), dest)}`);
    }
  }

  // Set portal (default, azul marino, R blanca)
  await generarSetIconosPwa({ bg: BG_OSCURO, srcR: SRC_R_BLANCO, suffix: "" });

  // Set admin modo claro: degradado violeta → índigo, R blanca.
  await generarSetIconosPwa({
    bgGradient: ADMIN_GRADIENT_CLARO,
    srcR: SRC_R_BLANCO,
    suffix: "admin",
  });

  // Set admin modo oscuro: degradado negro sutil + R con degradado violeta.
  // Como base usamos la R en NEGRO (que tiene el alpha del trazo nítido) y
  // la coloreamos con el degradado violet-400 → violet-700.
  await generarSetIconosPwa({
    bgGradient: ADMIN_GRADIENT_OSCURO,
    srcR: SRC_R_NEGRO,
    rGradient: R_GRADIENT_OSCURO,
    suffix: "admin-dark",
  });

  // Favicons de pestaña (R navy sobre transparente)
  const TAB_TAMANOS = [
    { tamano: 48, nombre: "_favicon-48.png" },
    { tamano: 32, nombre: "_favicon-32.png" },
    { tamano: 16, nombre: "_favicon-16.png" },
  ];
  for (const { tamano, nombre } of TAB_TAMANOS) {
    const escala = 0.95;
    const interior = Math.round(tamano * escala);
    const rResized = await sharp(SRC_R_NEGRO)
      .resize(interior, interior, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
    const img = sharp({
      create: {
        width: tamano,
        height: tamano,
        channels: 4,
        background: BG_TRANSPARENTE,
      },
    }).composite([{ input: rResized, gravity: "center" }]);
    const dest = path.join(ROOT_PUBLIC, nombre);
    await img.png({ compressionLevel: 9 }).toFile(dest);
    console.log(`✓ Generado ${path.relative(process.cwd(), dest)}`);
  }

  // favicon.ico multi-size — usamos sharp + ico-endec si está disponible;
  // si no, escribimos solo el de 32px que la mayoría de navegadores acepta.
  try {
    const { default: png2icojs } = await import("png-to-ico");
    const buffers = await Promise.all(
      [16, 32, 48].map((s) => fs.readFile(path.join(ROOT_PUBLIC, `_favicon-${s}.png`)))
    );
    const ico = await png2icojs(buffers);
    await fs.writeFile(path.join(ROOT_PUBLIC, "favicon.ico"), ico);
    console.log("✓ Generado public/favicon.ico (multi-size 16/32/48)");
  } catch {
    // Fallback: copiar el de 32px como favicon.ico (sin multi-size).
    const buf = await fs.readFile(path.join(ROOT_PUBLIC, "_favicon-32.png"));
    await fs.writeFile(path.join(ROOT_PUBLIC, "favicon.ico"), buf);
    console.log("✓ Generado public/favicon.ico (solo 32px, instala png-to-ico para multi-size)");
  }

  // Favicons adaptativos por tema del SO (pestaña / Vercel): sin fondo.
  const FAVICON_TAB = 32;
  const interiorFav = Math.round(FAVICON_TAB * 0.95);
  for (const [srcR, nombre] of [
    [SRC_R_NEGRO, "favicon-light.png"],
    [SRC_R_BLANCO, "favicon-dark.png"],
  ]) {
    const rResized = await sharp(srcR)
      .resize(interiorFav, interiorFav, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
    const dest = path.join(ROOT_PUBLIC, nombre);
    await sharp({
      create: {
        width: FAVICON_TAB,
        height: FAVICON_TAB,
        channels: 4,
        background: BG_TRANSPARENTE,
      },
    })
      .composite([{ input: rResized, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(dest);
    console.log(`✓ Generado ${path.relative(process.cwd(), dest)}`);
  }

  // Limpieza de auxiliares.
  for (const s of [16, 32, 48]) {
    await fs.unlink(path.join(ROOT_PUBLIC, `_favicon-${s}.png`)).catch(() => {});
  }

  // Genera la versión transparente grande (512px) que usará Next.js como
  // src/app/icon.png — algunos navegadores modernos prefieren PNG sobre ICO.
  // Debe ser TRANSPARENTE para mantener el estilo minimalista en la pestaña.
  const iconTabSize = 512;
  const interiorTab = Math.round(iconTabSize * 0.95);
  const rTabResized = await sharp(SRC_R_NEGRO)
    .resize(interiorTab, interiorTab, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
  const iconTab = await sharp({
    create: {
      width: iconTabSize,
      height: iconTabSize,
      channels: 4,
      background: BG_TRANSPARENTE,
    },
  })
    .composite([{ input: rTabResized, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Sincroniza solo favicon.ico y icon.png (transparente). NO copiamos
  // apple-icon.png a src/app/ porque Next.js lo inyectaría en TODAS las rutas
  // (incluido el admin) y pisaría los <link rel="apple-touch-icon"> que cada
  // layout define con su variante correcta (portal navy / admin violeta).
  const APP_DIR = path.resolve(process.cwd(), "src/app");
  await fs.copyFile(path.join(ROOT_PUBLIC, "favicon.ico"), path.join(APP_DIR, "favicon.ico"));
  await fs.writeFile(path.join(APP_DIR, "icon.png"), iconTab);
  // Si existía un apple-icon.png anterior, lo eliminamos para evitar inyección global.
  await fs
    .unlink(path.join(APP_DIR, "apple-icon.png"))
    .catch(() => {});
  console.log("✓ Sincronizado src/app/{favicon.ico,icon.png(transparente)}");
}

async function main() {
  for (const s of SOURCES) {
    const srcPath = path.join(ROOT, s.src);
    try {
      await fs.access(srcPath);
    } catch {
      console.warn(`(skip) no existe: ${srcPath}`);
      continue;
    }
    await procesarLogo(srcPath, s.out);
  }
  await generarFavicons();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

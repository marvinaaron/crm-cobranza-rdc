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
 * Genera favicons a partir de la versión blanca del isotipo "R".
 *
 * Diseño: cuadrado con fondo slate-900 (#0f172a), esquinas redondeadas
 * (solo en apple-touch-icon, los demás los renderiza el SO), y la "R"
 * blanca centrada al ~60% del tamaño.
 *
 * Genera:
 *  - public/favicon.ico (multi-size: 16, 32, 48)
 *  - public/apple-touch-icon.png (180x180, rounded corners)
 *  - public/icon-192.png, public/icon-512.png (para PWA / Android)
 */
async function generarFavicons() {
  const ROOT_PUBLIC = path.resolve(process.cwd(), "public");
  const SRC_R_BLANCO = path.join(ROOT, "r-white.png");

  try {
    await fs.access(SRC_R_BLANCO);
  } catch {
    console.warn("(skip favicons) no existe", SRC_R_BLANCO);
    return;
  }

  const BG = { r: 15, g: 23, b: 42, alpha: 1 }; // slate-900
  const TAMANOS = [
    { tamano: 180, nombre: "apple-touch-icon.png", redondeado: true },
    { tamano: 192, nombre: "icon-192.png", redondeado: false },
    { tamano: 512, nombre: "icon-512.png", redondeado: false },
    { tamano: 48, nombre: "_favicon-48.png", redondeado: false },
    { tamano: 32, nombre: "_favicon-32.png", redondeado: false },
    { tamano: 16, nombre: "_favicon-16.png", redondeado: false },
  ];

  for (const { tamano, nombre, redondeado } of TAMANOS) {
    // Capa "R" blanca al ~60% del lienzo, centrada.
    const interior = Math.round(tamano * 0.6);
    const rResized = await sharp(SRC_R_BLANCO)
      .resize(interior, interior, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Fondo cuadrado slate-900 + composición central.
    let img = sharp({
      create: {
        width: tamano,
        height: tamano,
        channels: 4,
        background: BG,
      },
    }).composite([{ input: rResized, gravity: "center" }]);

    if (redondeado) {
      // Máscara de esquinas redondeadas: SVG circular mask al 22% del tamaño.
      const radio = Math.round(tamano * 0.22);
      const mask = Buffer.from(
        `<svg width="${tamano}" height="${tamano}"><rect width="${tamano}" height="${tamano}" rx="${radio}" ry="${radio}" fill="#fff"/></svg>`
      );
      const pngPlano = await img.png().toBuffer();
      img = sharp(pngPlano).composite([{ input: mask, blend: "dest-in" }]);
    }

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

  // Limpieza de auxiliares.
  for (const s of [16, 32, 48]) {
    await fs.unlink(path.join(ROOT_PUBLIC, `_favicon-${s}.png`)).catch(() => {});
  }

  // Copia los archivos mágicos al directorio src/app/ para que Next.js los
  // sirva automáticamente con los <link rel="..."> correctos en el <head>.
  const APP_DIR = path.resolve(process.cwd(), "src/app");
  await fs.copyFile(path.join(ROOT_PUBLIC, "favicon.ico"), path.join(APP_DIR, "favicon.ico"));
  await fs.copyFile(path.join(ROOT_PUBLIC, "icon-512.png"), path.join(APP_DIR, "icon.png"));
  await fs.copyFile(
    path.join(ROOT_PUBLIC, "apple-touch-icon.png"),
    path.join(APP_DIR, "apple-icon.png")
  );
  console.log("✓ Sincronizado src/app/{favicon.ico,icon.png,apple-icon.png}");
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

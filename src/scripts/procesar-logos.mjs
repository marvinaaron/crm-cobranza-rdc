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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

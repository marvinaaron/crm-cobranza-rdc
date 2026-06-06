// Captura la demo animada del portal (branding-social/demo/portal-demo.html)
// usando el Chrome instalado (via CDP screencast) y la exporta como MP4 1080x1920
// con el telefono + fondo alrededor. Requiere: puppeteer-core, ffmpeg-static.
import puppeteer from "puppeteer-core";
import ffmpegPath from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HTML = path.join(ROOT, "branding-social/demo/portal-demo.html");
const FRAMES = path.join(ROOT, "branding-social/demo/_frames");
const OUT = path.join(ROOT, "branding-social/demo/portal-demo-loop-1080x1920.mp4");

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CAPTURE_MS = 48500; // un ciclo completo del loop (~48s) + margen

async function main() {
  await rm(FRAMES, { recursive: true, force: true });
  await mkdir(FRAMES, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--force-device-scale-factor=2", "--hide-scrollbars"],
    defaultViewport: { width: 540, height: 960, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();
  await page.goto("file://" + HTML, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600)); // assets/fuentes

  const client = await page.target().createCDPSession();
  const frames = [];
  client.on("Page.screencastFrame", async (f) => {
    frames.push({ data: Buffer.from(f.data, "base64"), ts: f.metadata.timestamp });
    try {
      await client.send("Page.screencastFrameAck", { sessionId: f.sessionId });
    } catch {}
  });

  console.log("Capturando ~" + CAPTURE_MS / 1000 + "s ...");
  await client.send("Page.startScreencast", {
    format: "jpeg",
    quality: 95,
    maxWidth: 1080,
    maxHeight: 1920,
    everyNthFrame: 1,
  });
  await new Promise((r) => setTimeout(r, CAPTURE_MS));
  await client.send("Page.stopScreencast");
  await browser.close();

  console.log("Frames capturados:", frames.length);
  if (frames.length < 10) throw new Error("Muy pocos frames capturados.");

  // guarda frames y arma lista concat con duraciones reales
  let list = "";
  const t0 = frames[0].ts;
  for (let i = 0; i < frames.length; i++) {
    const name = "f" + String(i).padStart(5, "0") + ".jpg";
    await writeFile(path.join(FRAMES, name), frames[i].data);
    const next = i < frames.length - 1 ? frames[i + 1].ts : frames[i].ts + 0.066;
    const dur = Math.max(0.016, next - frames[i].ts);
    list += `file '${name}'\nduration ${dur.toFixed(4)}\n`;
  }
  // concat demuxer requiere repetir el ultimo archivo
  list += `file 'f${String(frames.length - 1).padStart(5, "0")}.jpg'\n`;
  await writeFile(path.join(FRAMES, "list.txt"), list);

  const dur = (frames[frames.length - 1].ts - t0).toFixed(1);
  console.log("Duracion real:", dur + "s. Codificando MP4...");

  const r = spawnSync(
    ffmpegPath,
    [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", "list.txt",
      "-vf", "scale=1080:1920:flags=lanczos,format=yuv420p",
      "-r", "30",
      "-c:v", "libx264",
      "-profile:v", "high",
      "-crf", "18",
      "-movflags", "+faststart",
      OUT,
    ],
    { cwd: FRAMES, stdio: "inherit" }
  );
  if (r.status !== 0) throw new Error("ffmpeg fallo");

  await rm(FRAMES, { recursive: true, force: true });
  console.log("Listo ->", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

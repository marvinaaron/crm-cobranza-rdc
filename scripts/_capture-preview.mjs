import puppeteer from "puppeteer-core";
import { readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOGO = "file://" + path.join(ROOT, "public/logos/rdc-white.png");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const jobs = [
  { src: "_preview-nuevo.html", out: "_preview-nuevo.png" },
];

async function capture({ src, out }) {
  const srcPath = path.join(ROOT, "scripts", src);
  const tmpPath = srcPath.replace(".html", ".tmp.html");
  const outPath = path.join(ROOT, "scripts", out);
  const html = (await readFile(srcPath, "utf8")).replaceAll("LOGO_SRC", LOGO);
  await writeFile(tmpPath, html);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--force-device-scale-factor=2", "--hide-scrollbars"],
    defaultViewport: { width: 900, height: 1400, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();
  await page.goto("file://" + tmpPath, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  await rm(tmpPath, { force: true });
  console.log("OK ->", outPath);
}

for (const job of jobs) {
  await capture(job);
}

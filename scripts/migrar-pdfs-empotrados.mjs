/**
 * Saca PDFs/imagenes embebidos (data:) de crm_estado y los sube a Storage.
 * Deja storagePath y vacía dataUrl. Pensado para facturas y comprobantes viejos.
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./_load-env.mjs";

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function esEmpotrado(dataUrl) {
  return typeof dataUrl === "string" && dataUrl.startsWith("data:");
}

function bufferDesdeDataUrl(dataUrl) {
  const m = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/i.exec(String(dataUrl).trim());
  if (!m) return null;
  const contentType = (m[1] || "application/octet-stream").trim();
  const esB64 = (m[2] || "").toLowerCase().includes("base64");
  const cuerpo = (m[3] ?? "").replace(/\s/g, "");
  try {
    const buffer = Buffer.from(cuerpo, esB64 ? "base64" : "utf8");
    if (buffer.length < 16) return null;
    return { buffer, contentType };
  } catch {
    return null;
  }
}

function nuevoPath(nombreArchivo) {
  const safe = String(nombreArchivo || "archivo.pdf")
    .replace(/[^\w.\-]/g, "_")
    .slice(-80);
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
}

async function extraerItem(item, bucket) {
  if (!item || item.storagePath || !esEmpotrado(item.dataUrl)) {
    return { item, cambio: false };
  }
  const parsed = bufferDesdeDataUrl(item.dataUrl);
  if (!parsed) return { item, cambio: false };
  const path = nuevoPath(item.nombreArchivo);
  const { error } = await supabase.storage.from(bucket).upload(path, parsed.buffer, {
    contentType: item.tipoMime || parsed.contentType || "application/pdf",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return { item: { ...item, storagePath: path, dataUrl: "" }, cambio: true };
}

async function migrarClave(clave, bucket) {
  const { data, error } = await supabase
    .from("crm_estado")
    .select("payload")
    .eq("clave", clave)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const lista = Array.isArray(data?.payload) ? data.payload : [];
  let migrados = 0;
  const next = [];
  for (const item of lista) {
    try {
      const r = await extraerItem(item, bucket);
      next.push(r.item);
      if (r.cambio) migrados += 1;
    } catch (e) {
      console.error(`  ${clave}: no se pudo subir un archivo (${e instanceof Error ? e.message : e})`);
      next.push(item);
    }
  }
  if (migrados === 0) {
    return { clave, total: lista.length, migrados: 0 };
  }
  const { error: upErr } = await supabase.from("crm_estado").upsert(
    {
      clave,
      payload: next,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clave" }
  );
  if (upErr) throw new Error(upErr.message);
  return { clave, total: lista.length, migrados };
}

const resultados = [];
resultados.push(await migrarClave("facturas", "facturas"));
resultados.push(await migrarClave("comprobantes", "comprobantes-honorarios"));

for (const r of resultados) {
  console.log(`${r.clave}: ${r.migrados}/${r.total} movidos a Storage`);
}

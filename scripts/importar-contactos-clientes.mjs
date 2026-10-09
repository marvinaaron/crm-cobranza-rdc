/**
 * Aplica WhatsApp/correo desde Excel a clientes en Supabase (match por RFC).
 * Uso: node scripts/importar-contactos-clientes.mjs [ruta.xlsx]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";
import { loadEnv } from "./_load-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function digitos(val) {
  return String(val ?? "").replace(/\D/g, "");
}

function normalizarTelefono(val) {
  const raw = String(val ?? "").trim();
  if (!raw) return "";
  const d = digitos(raw);
  if (!d) return "";
  if (/\s/.test(raw)) return raw.replace(/\s+/g, " ").trim();
  if (d.length === 10) {
    return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`;
  }
  return raw;
}

function normalizarEmail(val) {
  return String(val ?? "").trim().toLowerCase();
}

function mapearFila(row) {
  const keys = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      v,
    ])
  );
  const rfc = String(keys.rfc ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  const whatsappKey =
    Object.keys(keys).find((k) => k.includes("whatsapp") || k === "telefono") ??
    "whatsapp / telefono";
  return {
    razonSocial: String(keys.cliente ?? keys.nombre ?? "").trim(),
    rfc,
    email: normalizarEmail(keys.email ?? keys.correo ?? ""),
    whatsapp: normalizarTelefono(keys[whatsappKey] ?? ""),
  };
}

const archivo =
  process.argv[2] ??
  path.resolve(process.env.HOME ?? "", "Downloads/Clientes.xlsx");

if (!fs.existsSync(archivo)) {
  console.error("No se encontró:", archivo);
  process.exit(1);
}

const env = loadEnv();
const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const wb = XLSX.readFile(archivo);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
const filas = rows.map(mapearFila).filter((f) => f.rfc);

const { data, error } = await sb
  .from("crm_estado")
  .select("payload")
  .eq("clave", "clientes")
  .maybeSingle();

if (error) {
  console.error(error.message);
  process.exit(1);
}

const clientes = data?.payload ?? [];
let actualizados = 0;
let noEncontrados = 0;

const next = clientes.map((c) => {
  const match = filas.find((f) => f.rfc === c.rfc?.toUpperCase().trim());
  if (!match) return c;
  const upd = { ...c };
  let cambio = false;
  if (match.whatsapp && match.whatsapp !== c.whatsapp) {
    upd.whatsapp = match.whatsapp;
    cambio = true;
  }
  if (match.email && match.email !== normalizarEmail(c.email)) {
    upd.email = match.email;
    cambio = true;
  }
  if (cambio) {
    actualizados += 1;
    console.log(`✓ ${c.razonSocial} (${c.rfc})`);
    if (upd.whatsapp !== c.whatsapp) {
      console.log(`    WhatsApp: ${c.whatsapp ?? "—"} → ${upd.whatsapp}`);
    }
    if (upd.email !== c.email) {
      console.log(`    Email: ${c.email ?? "—"} → ${upd.email}`);
    }
  }
  return upd;
});

for (const f of filas) {
  if (!clientes.some((c) => c.rfc?.toUpperCase().trim() === f.rfc)) {
    noEncontrados += 1;
    console.warn(`⚠ RFC no en CRM: ${f.rfc} (${f.razonSocial})`);
  }
}

if (actualizados === 0) {
  console.log("\nNada que actualizar (datos ya coinciden o sin match).");
  process.exit(0);
}

const { error: saveErr } = await sb.from("crm_estado").upsert(
  {
    clave: "clientes",
    payload: next,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "clave" }
);

if (saveErr) {
  console.error(saveErr.message);
  process.exit(1);
}

console.log(`\n✓ ${actualizados} cliente(s) actualizados en Supabase.`);
if (noEncontrados) console.log(`  ${noEncontrados} RFC(s) del archivo no estaban en el CRM.`);

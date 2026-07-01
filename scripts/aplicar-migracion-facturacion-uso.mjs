/**
 * Aplica la migración herramientas_facturacion_uso en Supabase.
 * Ejecutar: node scripts/aplicar-migracion-facturacion-uso.mjs
 *
 * Requiere en .env.local:
 *   SUPABASE_DB_URL_DIRECT=postgresql://postgres.[ref]:[password]@...
 * (Connection string → URI en Supabase Dashboard → Settings → Database)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env.local");

function loadEnv() {
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split("\n")
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
  );
}

const env = loadEnv();
const dbUrl =
  env.SUPABASE_DB_URL_DIRECT ||
  env.SUPABASE_DB_URL ||
  env.DATABASE_URL;

if (!dbUrl) {
  console.error(
    "✗ Falta SUPABASE_DB_URL_DIRECT en .env.local (URI de Postgres en Supabase Dashboard)."
  );
  process.exit(1);
}

const sqlPath = path.resolve(
  __dirname,
  "..",
  "supabase/migrations/20260615_herramientas_facturacion_uso.sql"
);
const sql = fs.readFileSync(sqlPath, "utf8");

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    `select to_regclass('public.herramientas_facturacion_uso') as tabla`
  );
  console.log("✓ Migración aplicada.");
  console.log("  Tabla:", rows[0]?.tabla ?? "(no encontrada)");
} catch (err) {
  console.error("✗ Error:", err.message);
  process.exit(1);
} finally {
  await client.end();
}

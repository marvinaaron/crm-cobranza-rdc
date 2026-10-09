import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { loadEnv } from "./_load-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "..", "supabase", "schema.sql");

const env = loadEnv();
const connectionString = env.SUPABASE_DB_URL_DIRECT;
if (!connectionString) {
  console.error("✗ Falta SUPABASE_DB_URL_DIRECT en .env.local");
  process.exit(1);
}

const sql = fs.readFileSync(schemaPath, "utf8");

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Supabase usa SSL en producción
});

console.log("→ Conectando a Postgres (Supabase)…");
await client.connect();
console.log("✓ Conectado.");

console.log(`→ Ejecutando ${path.basename(schemaPath)} (${sql.length} bytes)…`);
try {
  await client.query(sql);
  console.log("✓ Esquema aplicado sin errores.");
} catch (err) {
  console.error("✗ Error aplicando esquema:");
  console.error(err.message);
  process.exitCode = 1;
} finally {
  // Verificación: listar las tablas creadas en public
  try {
    const { rows } = await client.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_type = 'BASE TABLE'
      order by table_name;
    `);
    console.log(`\n→ Tablas en schema public (${rows.length}):`);
    for (const r of rows) console.log("   ·", r.table_name);
  } catch (e) {
    console.error("(no se pudo listar tablas:", e.message, ")");
  }
  await client.end();
}

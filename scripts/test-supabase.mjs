import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env.local");

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL ........", url ? "✓" : "✗ falta");
console.log("Anon key ...", anonKey ? "✓" : "✗ falta");
console.log("Service key.", serviceKey ? "✓" : "✗ falta");

if (!url || !serviceKey) process.exit(1);

const client = createClient(url, serviceKey);
const { data, error } = await client.auth.admin.listUsers({ perPage: 1 });
if (error) {
  console.log("\n⚠️ Error:", error.message);
  process.exit(1);
}
console.log("\n✓ Cliente Supabase responde correctamente.");
console.log("  Usuarios actuales en auth:", data.users.length);

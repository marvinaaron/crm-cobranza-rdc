/**
 * Imprime app_metadata + user_metadata de un usuario por correo.
 *   node scripts/verificar-admin.mjs <email>
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./_load-env.mjs";

const env = loadEnv();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const [, , emailArg] = process.argv;
if (!emailArg) {
  console.error("Uso: node scripts/verificar-admin.mjs <email>");
  process.exit(1);
}
const email = emailArg.trim().toLowerCase();

const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
if (error) {
  console.error(error.message);
  process.exit(1);
}
const u = data.users.find((u) => u.email?.toLowerCase() === email);
if (!u) {
  console.error("✗ no encontrado");
  process.exit(1);
}
console.log("id            :", u.id);
console.log("email         :", u.email);
console.log("created_at    :", u.created_at);
console.log("app_metadata  :", JSON.stringify(u.app_metadata, null, 2));
console.log("user_metadata :", JSON.stringify(u.user_metadata, null, 2));

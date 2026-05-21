/**
 * Marca a un admin existente como propietario del despacho (acceso total).
 *
 * Uso:
 *   node scripts/marcar-propietario.mjs <email>
 */

import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./_load-env.mjs";

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("✗ Faltan credenciales Supabase en .env.local");
  process.exit(1);
}

const [, , emailArg] = process.argv;
if (!emailArg) {
  console.error("Uso: node scripts/marcar-propietario.mjs <email>");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
  perPage: 200,
});
if (listErr) {
  console.error("✗ No se pudo listar usuarios:", listErr.message);
  process.exit(1);
}

const user = list.users.find((u) => u.email?.toLowerCase() === email);
if (!user) {
  console.error(`✗ No se encontró el usuario ${email}.`);
  process.exit(1);
}

console.log(`→ ${email} (id=${user.id}). Marcando como propietario…`);
const { error } = await supabase.auth.admin.updateUserById(user.id, {
  app_metadata: {
    ...user.app_metadata,
    rol: "admin",
    propietario: true,
    permisos: [
      "dashboard",
      "clientes",
      "cobranza",
      "cumplimiento",
      "configuracion",
    ],
  },
});
if (error) {
  console.error("✗", error.message);
  process.exit(1);
}
console.log("✓ Listo. Tiene acceso total al CRM.");

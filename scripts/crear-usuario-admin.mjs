/**
 * Crea (o actualiza) un usuario admin en Supabase Auth.
 *
 * Uso:
 *   node scripts/crear-usuario-admin.mjs <email> [password]
 *
 * Si no pasas password, se genera una temporal aleatoria (16 caracteres).
 * Después puedes cambiarla desde "Recuperar contraseña" del login.
 */

import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./_load-env.mjs";

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("✗ Faltan credenciales Supabase en .env.local");
  process.exit(1);
}

const [, , emailArg, passwordArg] = process.argv;
if (!emailArg) {
  console.error("Uso: node scripts/crear-usuario-admin.mjs <email> [password]");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const password = passwordArg ?? crypto.randomBytes(12).toString("base64url");

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log(`→ Buscando si el usuario ${email} ya existe…`);
const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
  perPage: 200,
});
if (listErr) {
  console.error("✗ No se pudo listar usuarios:", listErr.message);
  process.exit(1);
}

const existente = list.users.find((u) => u.email?.toLowerCase() === email);

if (existente) {
  console.log(`   · Ya existe (id=${existente.id}). Actualizando rol/password…`);
  const { error } = await supabase.auth.admin.updateUserById(existente.id, {
    password,
    email_confirm: true,
    app_metadata: { ...existente.app_metadata, rol: "admin" },
  });
  if (error) {
    console.error("✗ Error actualizando usuario:", error.message);
    process.exit(1);
  }
  console.log("✓ Usuario admin actualizado.");
} else {
  console.log("   · No existe, creándolo…");
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { rol: "admin" },
  });
  if (error || !data.user) {
    console.error("✗ Error creando usuario:", error?.message);
    process.exit(1);
  }
  console.log(`✓ Usuario admin creado (id=${data.user.id}).`);
}

console.log("\n─────────────────────────────────────────────");
console.log("  Credenciales para iniciar sesión:");
console.log(`  Email:    ${email}`);
console.log(`  Password: ${password}`);
console.log("─────────────────────────────────────────────");
console.log("Guarda la contraseña en un lugar seguro.");
console.log("Puedes cambiarla luego desde 'Recuperar contraseña' del login.");

"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getRol } from "@/lib/supabase/roles";
import { RUTA_DEFAULT_ADMIN, RUTA_DEFAULT_CLIENTE } from "@/lib/auth/rutas";

export type LoginResult =
  | { ok: true; redirect: string }
  | { ok: false; error: string };

export async function loginAdminAction(
  _prev: LoginResult | null,
  formData: FormData
): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();

  if (!email || !password) {
    return { ok: false, error: "Captura correo y contraseña." };
  }

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      ok: false,
      error: error?.message ?? "No se pudo iniciar sesión.",
    };
  }

  const rol = getRol(data.user);
  if (rol !== "admin") {
    // Hubo login válido pero no es admin. Cerramos sesión y devolvemos error
    // para evitar dejar a un cliente "logueado" en la pantalla de admin.
    await supabase.auth.signOut();
    return {
      ok: false,
      error:
        "Esta cuenta no tiene permisos de administrador. Usa el portal del cliente.",
    };
  }

  const destino = next && next.startsWith("/") ? next : RUTA_DEFAULT_ADMIN;
  return { ok: true, redirect: destino };
}

/** Preferir cierre de sesión en el cliente o GET /auth/signout */
export async function logoutAction() {
  redirect("/auth/signout");
}

void RUTA_DEFAULT_CLIENTE;

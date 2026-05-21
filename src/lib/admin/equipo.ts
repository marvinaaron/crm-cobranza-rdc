/**
 * Helpers server-side para administrar usuarios admin del CRM.
 * Solo accesibles desde el propietario o admins con módulo `configuracion`.
 */
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { MODULOS, type Modulo } from "@/lib/admin/permisos";
import { enviarCorreo } from "@/lib/mailer";
import { plantillaInvitacionPortal } from "@/lib/mailer/templates";

export type AdminEquipo = {
  id: string;
  email: string;
  nombreCompleto?: string;
  cargo?: string;
  avatarUrl?: string;
  propietario: boolean;
  permisos: Modulo[];
  lastSignInAt?: string;
  createdAt?: string;
};

function permisosValidos(input: unknown): Modulo[] {
  if (!Array.isArray(input)) return [];
  return input.filter((m): m is Modulo =>
    (MODULOS as readonly string[]).includes(m as string)
  );
}

function asAdminEquipo(user: {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  last_sign_in_at?: string | null;
  created_at?: string | null;
}): AdminEquipo {
  const app = user.app_metadata ?? {};
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? "",
    nombreCompleto:
      typeof meta.nombreCompleto === "string" ? meta.nombreCompleto : undefined,
    cargo: typeof meta.cargo === "string" ? meta.cargo : undefined,
    avatarUrl: typeof meta.avatarUrl === "string" ? meta.avatarUrl : undefined,
    propietario: app.propietario === true,
    permisos: permisosValidos(app.permisos),
    lastSignInAt: user.last_sign_in_at ?? undefined,
    createdAt: user.created_at ?? undefined,
  };
}

/** Lista todos los usuarios con rol admin. */
export async function listarEquipoAdmin(): Promise<AdminEquipo[]> {
  const supabase = getSupabaseAdmin();
  const todos: AdminEquipo[] = [];
  let page = 1;
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(error.message);
    for (const u of data.users) {
      const rol = (u.app_metadata as Record<string, unknown> | undefined)?.rol;
      if (rol === "admin") todos.push(asAdminEquipo(u));
    }
    if (data.users.length < 200) break;
    page += 1;
  }
  // El propietario siempre primero, después por nombre/email.
  todos.sort((a, b) => {
    if (a.propietario !== b.propietario) return a.propietario ? -1 : 1;
    return (
      (a.nombreCompleto || a.email).localeCompare(b.nombreCompleto || b.email)
    );
  });
  return todos;
}

/** Si no hay ningún propietario, marca al primer admin como propietario. */
export async function asegurarPropietario(): Promise<void> {
  const equipo = await listarEquipoAdmin();
  if (equipo.length === 0) return;
  if (equipo.some((a) => a.propietario)) return;
  const candidato = equipo[0];
  const supabase = getSupabaseAdmin();
  await supabase.auth.admin.updateUserById(candidato.id, {
    app_metadata: {
      rol: "admin",
      propietario: true,
      permisos: [...MODULOS],
    },
  });
}

export async function crearAdmin(params: {
  email: string;
  nombreCompleto?: string;
  cargo?: string;
  permisos: Modulo[];
  redirectTo: string;
}): Promise<AdminEquipo> {
  const supabase = getSupabaseAdmin();
  const email = params.email.trim().toLowerCase();
  if (!email) throw new Error("Captura un correo.");
  const permisos = permisosValidos(params.permisos);

  // Verifica que el correo no esté en uso.
  const { data: lista, error: listErr } = await supabase.auth.admin.listUsers({
    perPage: 200,
  });
  if (listErr) throw new Error(listErr.message);
  const existente = lista.users.find((u) => u.email?.toLowerCase() === email);
  if (existente) {
    throw new Error(
      `El correo ${email} ya tiene una cuenta. Pide al propietario que ajuste sus permisos.`
    );
  }

  // Password aleatorio (se ignora; el admin elige el suyo al recibir invitación).
  const password = crypto.randomUUID().replace(/-/g, "") + "Aa1!";

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      rol: "admin",
      propietario: false,
      permisos,
    },
    user_metadata: {
      nombreCompleto: params.nombreCompleto?.trim() || undefined,
      cargo: params.cargo?.trim() || undefined,
    },
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "No se pudo crear el admin.");
  }

  // Genera link de invitación y envía con Resend.
  const { data: link, error: linkErr } = await supabase.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: params.redirectTo },
  });
  if (linkErr || !link.properties?.action_link) {
    throw new Error(
      linkErr?.message ?? "Admin creado, pero no se pudo generar el enlace."
    );
  }

  const plantilla = plantillaInvitacionPortal({
    nombreCliente: params.nombreCompleto?.trim() || email.split("@")[0],
    correoCliente: email,
    url: link.properties.action_link,
    nombreDespacho:
      process.env.NEXT_PUBLIC_DESPACHO_NOMBRE?.trim() || "RDC Contadores",
    correoSoporte:
      process.env.NEXT_PUBLIC_DESPACHO_EMAIL?.trim() ||
      "contacto@rdcontadores.com",
    sitioWeb: process.env.NEXT_PUBLIC_DESPACHO_SITIO?.trim(),
  });

  await enviarCorreo({
    to: email,
    subject: `Acceso al CRM · ${process.env.NEXT_PUBLIC_DESPACHO_NOMBRE ?? "RDC Contadores"}`,
    html: plantilla.html,
    text: plantilla.texto,
  });

  return asAdminEquipo(data.user);
}

export async function actualizarPermisosAdmin(params: {
  authUserId: string;
  permisos: Modulo[];
}): Promise<AdminEquipo> {
  const supabase = getSupabaseAdmin();
  const permisos = permisosValidos(params.permisos);
  const { data: actual, error: getErr } =
    await supabase.auth.admin.getUserById(params.authUserId);
  if (getErr || !actual.user) {
    throw new Error(getErr?.message ?? "No se encontró el usuario.");
  }
  if (actual.user.app_metadata?.propietario === true) {
    throw new Error(
      "No puedes cambiar los permisos del propietario; siempre tiene acceso total."
    );
  }
  const { data, error } = await supabase.auth.admin.updateUserById(
    params.authUserId,
    {
      app_metadata: {
        ...actual.user.app_metadata,
        rol: "admin",
        permisos,
      },
    }
  );
  if (error || !data.user) {
    throw new Error(error?.message ?? "No se pudo actualizar.");
  }
  return asAdminEquipo(data.user);
}

export async function eliminarAdmin(authUserId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data, error: getErr } =
    await supabase.auth.admin.getUserById(authUserId);
  if (getErr || !data.user) {
    throw new Error(getErr?.message ?? "No se encontró el usuario.");
  }
  if (data.user.app_metadata?.propietario === true) {
    throw new Error("No puedes eliminar al propietario.");
  }
  const { error } = await supabase.auth.admin.deleteUser(authUserId);
  if (error) throw new Error(error.message);
}

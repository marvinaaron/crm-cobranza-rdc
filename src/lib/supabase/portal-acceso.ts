import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Funciones server-side para administrar usuarios de Supabase Auth que
 * representan a clientes del portal. Se usan desde los route handlers.
 *
 * Convención: en `app_metadata` guardamos el rol y el id numérico del
 * cliente. Esto deja a `Cliente.id` intacto (sigue siendo `number`) y
 * evita reescribir el resto del CRM mientras los datos viven en
 * `localStorage`.
 */

export type AccesoPortalInfo = {
  exists: boolean;
  authUserId?: string;
  email?: string;
  clienteId?: number;
  lastSignInAt?: string;
  ultimoEnvioReset?: string;
};

function readClienteIdFromMeta(meta: unknown): number | undefined {
  if (!meta || typeof meta !== "object") return undefined;
  const v = (meta as Record<string, unknown>).clienteId;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return undefined;
}

/** Busca el usuario auth asociado al clienteId (por app_metadata.clienteId). */
export async function buscarAuthUserPorClienteId(
  clienteId: number
): Promise<AccesoPortalInfo> {
  const supabase = getSupabaseAdmin();
  let page = 1;
  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(error.message);
    const match = data.users.find(
      (u) => readClienteIdFromMeta(u.app_metadata) === clienteId
    );
    if (match) {
      return {
        exists: true,
        authUserId: match.id,
        email: match.email ?? undefined,
        clienteId,
        lastSignInAt: match.last_sign_in_at ?? undefined,
      };
    }
    if (data.users.length < 200) break;
    page += 1;
  }
  return { exists: false };
}

/** Error específico para que el front pueda ofrecer "reasignar". */
export class CorreoYaVinculadoError extends Error {
  readonly codigo = "EMAIL_YA_VINCULADO";
  readonly clienteIdExistente?: number;
  constructor(email: string, clienteIdExistente?: number) {
    super(
      `El correo ${email} ya está vinculado a otro acceso. Puedes reasignarlo a este cliente.`
    );
    this.clienteIdExistente = clienteIdExistente;
  }
}

/**
 * Crea (o actualiza) el acceso del cliente al portal.
 * - Si ya existe vinculado al mismo clienteId → solo actualiza correo/password.
 * - Si no existe ningún auth.user con ese correo → lo crea.
 * - Si el correo ya está en uso por otro clienteId:
 *     - Si `forzarReasignar=true` → cambia el `clienteId` en `app_metadata`
 *       del auth.user existente para reasignarlo al cliente actual.
 *     - Si no → lanza `CorreoYaVinculadoError` para que el admin decida.
 */
export async function crearOActualizarAccesoPortal(params: {
  clienteId: number;
  email: string;
  password?: string;
  forzarReasignar?: boolean;
}): Promise<{ authUserId: string; email: string; password: string }> {
  const supabase = getSupabaseAdmin();
  const email = params.email.trim().toLowerCase();
  if (!email) throw new Error("Falta el correo del cliente.");

  const password = params.password?.trim() || generarPasswordTemporal();

  const existente = await buscarAuthUserPorClienteId(params.clienteId);

  if (existente.exists && existente.authUserId) {
    const { data, error } = await supabase.auth.admin.updateUserById(
      existente.authUserId,
      {
        email,
        password,
        email_confirm: true,
        app_metadata: {
          rol: "cliente",
          clienteId: params.clienteId,
        },
      }
    );
    if (error || !data.user) {
      throw new Error(error?.message ?? "No se pudo actualizar el acceso.");
    }
    return { authUserId: data.user.id, email, password };
  }

  // Si no había acceso vinculado al clienteId, verifica que el correo no
  // esté siendo usado por otro auth.user (Supabase prohíbe duplicados).
  const { data: lista, error: listErr } = await supabase.auth.admin.listUsers({
    perPage: 200,
  });
  if (listErr) throw new Error(listErr.message);
  const conMismoCorreo = lista.users.find(
    (u) => u.email?.toLowerCase() === email
  );

  if (conMismoCorreo) {
    if (!params.forzarReasignar) {
      const clienteIdExistente = readClienteIdFromMeta(
        conMismoCorreo.app_metadata
      );
      throw new CorreoYaVinculadoError(email, clienteIdExistente);
    }
    // Reasignar: actualiza el clienteId del auth.user existente para que
    // apunte al nuevo cliente y resetea su password.
    const { data, error } = await supabase.auth.admin.updateUserById(
      conMismoCorreo.id,
      {
        password,
        email_confirm: true,
        app_metadata: {
          rol: "cliente",
          clienteId: params.clienteId,
        },
      }
    );
    if (error || !data.user) {
      throw new Error(
        error?.message ?? "No se pudo reasignar el acceso existente."
      );
    }
    return { authUserId: data.user.id, email, password };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      rol: "cliente",
      clienteId: params.clienteId,
    },
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "No se pudo crear el acceso.");
  }
  return { authUserId: data.user.id, email, password };
}

export async function eliminarAccesoPortal(clienteId: number): Promise<{
  removed: boolean;
}> {
  const supabase = getSupabaseAdmin();
  const existente = await buscarAuthUserPorClienteId(clienteId);
  if (!existente.exists || !existente.authUserId) return { removed: false };
  const { error } = await supabase.auth.admin.deleteUser(existente.authUserId);
  if (error) throw new Error(error.message);
  return { removed: true };
}

export async function enviarResetPasswordPortal(params: {
  email: string;
  redirectTo: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.resetPasswordForEmail(params.email, {
    redirectTo: params.redirectTo,
  });
  if (error) throw new Error(error.message);
}

/**
 * Genera un link de acción (invite/recovery/magiclink) sin que Supabase
 * mande el correo. Devuelve la URL completa para que la enviemos nosotros
 * mismos por Resend con un template profesional.
 */
export async function generarLinkAccesoPortal(params: {
  email: string;
  redirectTo: string;
  tipo: "invite" | "recovery" | "magiclink";
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: params.tipo,
    email: params.email,
    options: { redirectTo: params.redirectTo },
  });
  if (error || !data.properties?.action_link) {
    throw new Error(
      error?.message ?? "No se pudo generar el enlace de acceso."
    );
  }
  return data.properties.action_link;
}

function generarPasswordTemporal(): string {
  const alfabeto =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 12; i++) {
    out += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return out;
}

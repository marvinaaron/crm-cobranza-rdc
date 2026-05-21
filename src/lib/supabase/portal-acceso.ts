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
 *
 * Reglas:
 * - Usuario nuevo (no existe en Auth con ese clienteId NI ese correo): se
 *   crea con una contraseña temporal aleatoria y `requiereCambioClave=true`.
 *   Devuelve la contraseña temporal para que la incluyamos en el correo.
 * - Usuario existente vinculado al mismo clienteId:
 *     - Si `resetPassword=true` → genera nueva contraseña temporal y marca
 *       `requiereCambioClave=true`.
 *     - Si `resetPassword=false` → solo actualiza correo, no toca password.
 * - Correo ya usado por OTRO cliente:
 *     - Si `forzarReasignar=true` → reasigna (y genera nueva temp).
 *     - Si no → lanza `CorreoYaVinculadoError`.
 */
/**
 * Snapshot mínimo del cliente que guardamos en `app_metadata.snapshot`
 * para que el portal del cliente pueda mostrar sus datos básicos sin
 * depender del localStorage del admin. Este snapshot se actualiza cada
 * vez que el admin edita al cliente desde el CRM.
 */
export type SnapshotCliente = {
  razonSocial: string;
  rfc: string;
  email: string;
  honorarios: number;
  fechaPago: string;
  inicioMes: number;
  inicioAnio: string;
  esPersonaMoral: boolean;
  esIngresoGeneral?: boolean;
  activo: boolean;
  estado?: string;
  configCumplimiento?: unknown;
  historialHonorarios?: unknown;
};

export async function crearOActualizarAccesoPortal(params: {
  clienteId: number;
  email: string;
  /** Si true, fuerza generar una nueva contraseña temporal y marcar
   * `requiereCambioClave=true`. */
  resetPassword?: boolean;
  forzarReasignar?: boolean;
  /** Snapshot del cliente para que el portal pueda leer sus datos
   * sin depender del localStorage del admin. */
  snapshot?: SnapshotCliente;
}): Promise<{
  authUserId: string;
  email: string;
  /** Contraseña temporal generada (null si no se cambió). */
  passwordTemporal: string | null;
  /** True si fue el primer alta de este cliente en Supabase Auth. */
  esNuevo: boolean;
}> {
  const supabase = getSupabaseAdmin();
  const email = params.email.trim().toLowerCase();
  if (!email) throw new Error("Falta el correo del cliente.");

  const existente = await buscarAuthUserPorClienteId(params.clienteId);

  if (existente.exists && existente.authUserId) {
    const debeResetear = params.resetPassword === true;
    const nuevoPassword = debeResetear ? generarPasswordTemporal() : undefined;
    const { data, error } = await supabase.auth.admin.updateUserById(
      existente.authUserId,
      {
        email,
        ...(nuevoPassword ? { password: nuevoPassword } : {}),
        email_confirm: true,
        app_metadata: {
          rol: "cliente",
          clienteId: params.clienteId,
          ...(params.snapshot ? { snapshot: params.snapshot } : {}),
        },
        ...(debeResetear
          ? { user_metadata: { requiereCambioClave: true } }
          : {}),
      }
    );
    if (error || !data.user) {
      throw new Error(error?.message ?? "No se pudo actualizar el acceso.");
    }
    return {
      authUserId: data.user.id,
      email,
      passwordTemporal: nuevoPassword ?? null,
      esNuevo: false,
    };
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
    // Reasignar: actualiza el clienteId del auth.user existente y SIEMPRE
    // resetea su password (porque se está reasignando a otro cliente).
    const nuevoPassword = generarPasswordTemporal();
    const { data, error } = await supabase.auth.admin.updateUserById(
      conMismoCorreo.id,
      {
        password: nuevoPassword,
        email_confirm: true,
        app_metadata: {
          rol: "cliente",
          clienteId: params.clienteId,
          ...(params.snapshot ? { snapshot: params.snapshot } : {}),
        },
        user_metadata: { requiereCambioClave: true },
      }
    );
    if (error || !data.user) {
      throw new Error(
        error?.message ?? "No se pudo reasignar el acceso existente."
      );
    }
    return {
      authUserId: data.user.id,
      email,
      passwordTemporal: nuevoPassword,
      esNuevo: false,
    };
  }

  // Usuario completamente nuevo: lo creamos con temp password.
  const nuevoPassword = generarPasswordTemporal();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: nuevoPassword,
    email_confirm: true,
    app_metadata: {
      rol: "cliente",
      clienteId: params.clienteId,
      ...(params.snapshot ? { snapshot: params.snapshot } : {}),
    },
    user_metadata: { requiereCambioClave: true },
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "No se pudo crear el acceso.");
  }
  return {
    authUserId: data.user.id,
    email,
    passwordTemporal: nuevoPassword,
    esNuevo: true,
  };
}

/**
 * Actualiza solo el snapshot del cliente en app_metadata (sin tocar password
 * ni email). Lo usa el admin desde el CRM cada vez que edita los datos del
 * cliente para mantener sincronizado el portal del cliente.
 *
 * Devuelve null si el cliente no tiene acceso al portal todavía.
 */
export async function actualizarSnapshotCliente(params: {
  clienteId: number;
  snapshot: SnapshotCliente;
}): Promise<{ ok: boolean; razon?: string }> {
  const supabase = getSupabaseAdmin();
  const existente = await buscarAuthUserPorClienteId(params.clienteId);
  if (!existente.exists || !existente.authUserId) {
    return { ok: false, razon: "sin_acceso_portal" };
  }
  const { data: actual, error: getErr } =
    await supabase.auth.admin.getUserById(existente.authUserId);
  if (getErr || !actual.user) {
    return { ok: false, razon: getErr?.message ?? "no_encontrado" };
  }
  const appMeta = (actual.user.app_metadata ?? {}) as Record<string, unknown>;
  const { error } = await supabase.auth.admin.updateUserById(
    existente.authUserId,
    {
      app_metadata: {
        ...appMeta,
        rol: "cliente",
        clienteId: params.clienteId,
        snapshot: params.snapshot,
      },
    }
  );
  if (error) return { ok: false, razon: error.message };
  return { ok: true };
}

/**
 * Resetea la contraseña de un usuario existente del portal a una nueva temp.
 * Marca `requiereCambioClave=true` para forzar al cliente a definir su propia
 * contraseña al iniciar sesión.
 */
export async function resetearPasswordPortal(params: {
  email: string;
}): Promise<{ passwordTemporal: string; nombre?: string } | null> {
  const supabase = getSupabaseAdmin();
  const email = params.email.trim().toLowerCase();
  if (!email) return null;

  const { data: lista, error: listErr } = await supabase.auth.admin.listUsers({
    perPage: 200,
  });
  if (listErr) throw new Error(listErr.message);
  const user = lista.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) return null;

  const passwordTemporal = generarPasswordTemporal();
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: passwordTemporal,
    email_confirm: true,
    user_metadata: {
      ...(user.user_metadata ?? {}),
      requiereCambioClave: true,
    },
  });
  if (error) throw new Error(error.message);

  return { passwordTemporal };
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

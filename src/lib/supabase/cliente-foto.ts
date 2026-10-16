import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/buckets";
import { esIngresoGeneralCliente, type Cliente } from "@/lib/clientes";
import {
  actualizarClienteEnDb,
  leerCrmEstadoCompleto,
  parchearFotosClientesEnDb,
} from "@/lib/supabase/crm-estado-db";
import { buscarAuthUserPorClienteId } from "@/lib/supabase/portal-acceso";

const MAX_BYTES = 5 * 1024 * 1024;
const MIMES_VALIDOS = new Set(["image/png", "image/jpeg", "image/webp"]);

export function validarArchivoFoto(file: File): string | null {
  if (!MIMES_VALIDOS.has(file.type)) {
    return "Formato no válido. Usa PNG, JPG o WebP.";
  }
  if (file.size > MAX_BYTES) {
    return "La imagen no debe pesar más de 5 MB.";
  }
  return null;
}

function extDeMime(type: string): "png" | "webp" | "jpg" {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

async function sincronizarAvatarAuth(
  clienteId: number,
  avatar: { path?: string; url?: string }
): Promise<void> {
  const info = await buscarAuthUserPorClienteId(clienteId);
  if (!info.authUserId) return;
  const admin = getSupabaseAdmin();
  const { data } = await admin.auth.admin.getUserById(info.authUserId);
  const user = data.user;
  if (!user) return;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  await admin.auth.admin.updateUserById(info.authUserId, {
    user_metadata: {
      ...meta,
      avatarPath: avatar.path ?? "",
      avatarUrl: avatar.url ?? "",
    },
  });
}

export async function guardarFotoPerfilCliente(params: {
  clienteId: number;
  buffer: Buffer;
  contentType: string;
}): Promise<{ fotoPerfilUrl: string; fotoPerfilPath: string }> {
  const estado = await leerCrmEstadoCompleto();
  const actual = estado.clientes.find((c) => c.id === params.clienteId);
  if (!actual) throw new Error("Cliente no encontrado.");
  if (esIngresoGeneralCliente(actual)) {
    throw new Error("Este registro no usa foto de perfil.");
  }

  const admin = getSupabaseAdmin();
  const ext = extDeMime(params.contentType);
  const path = `clientes/${params.clienteId}/${Date.now()}.${ext}`;
  const { error: upErr } = await admin.storage
    .from(BUCKETS.avatares)
    .upload(path, params.buffer, {
      contentType: params.contentType,
      upsert: false,
    });
  if (upErr) throw new Error(upErr.message);

  const { data: pub } = admin.storage.from(BUCKETS.avatares).getPublicUrl(path);
  if (actual.fotoPerfilPath && actual.fotoPerfilPath !== path) {
    await admin.storage.from(BUCKETS.avatares).remove([actual.fotoPerfilPath]);
  }

  const next: Cliente = {
    ...actual,
    fotoPerfilPath: path,
    fotoPerfilUrl: pub.publicUrl,
  };
  await actualizarClienteEnDb(next);
  await sincronizarAvatarAuth(params.clienteId, {
    path,
    url: pub.publicUrl,
  });
  return { fotoPerfilUrl: pub.publicUrl, fotoPerfilPath: path };
}

export async function quitarFotoPerfilCliente(clienteId: number): Promise<void> {
  const estado = await leerCrmEstadoCompleto();
  const actual = estado.clientes.find((c) => c.id === clienteId);
  if (!actual) throw new Error("Cliente no encontrado.");

  const admin = getSupabaseAdmin();
  if (actual.fotoPerfilPath) {
    await admin.storage.from(BUCKETS.avatares).remove([actual.fotoPerfilPath]);
  }
  const next: Cliente = {
    ...actual,
    fotoPerfilPath: undefined,
    fotoPerfilUrl: undefined,
  };
  await actualizarClienteEnDb(next);
  await sincronizarAvatarAuth(clienteId, {});
}

function clienteIdDeAuthMeta(meta: unknown): number | undefined {
  if (!meta || typeof meta !== "object") return undefined;
  const v = (meta as Record<string, unknown>).clienteId;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return undefined;
}

/**
 * Copia al CRM las fotos que ya estaban en el portal (user_metadata)
 * y el admin todavía no veía en Mis clientes.
 */
export async function hidratarFotosDesdeAuth(): Promise<
  Array<{ id: number; fotoPerfilUrl: string; fotoPerfilPath?: string }>
> {
  const estado = await leerCrmEstadoCompleto();
  const faltan = new Set(
    estado.clientes
      .filter((c) => !c.fotoPerfilUrl?.trim() && !esIngresoGeneralCliente(c))
      .map((c) => c.id)
  );
  if (faltan.size === 0) return [];

  const admin = getSupabaseAdmin();
  const parches: Array<{
    id: number;
    fotoPerfilUrl: string;
    fotoPerfilPath?: string;
  }> = [];
  let page = 1;
  while (page <= 20 && faltan.size > 0) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(error.message);
    for (const u of data.users) {
      const clienteId = clienteIdDeAuthMeta(u.app_metadata);
      if (clienteId == null || !faltan.has(clienteId)) continue;
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const url =
        typeof meta.avatarUrl === "string" ? meta.avatarUrl.trim() : "";
      if (!url) continue;
      const path =
        typeof meta.avatarPath === "string" && meta.avatarPath.trim()
          ? meta.avatarPath.trim()
          : undefined;
      parches.push({ id: clienteId, fotoPerfilUrl: url, fotoPerfilPath: path });
      faltan.delete(clienteId);
    }
    if (data.users.length < 200) break;
    page += 1;
  }
  if (parches.length === 0) return [];
  await parchearFotosClientesEnDb(parches);
  return parches;
}

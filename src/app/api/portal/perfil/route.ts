import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esCliente } from "@/lib/supabase/roles";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import {
  actualizarClienteEnDb,
  leerCrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";

/**
 * Perfil personal del cliente del portal. Vive en `user_metadata` del
 * usuario de Supabase Auth (independiente del snapshot que vive en
 * app_metadata y mantiene el admin).
 */
export type PerfilCliente = {
  nombre?: string;
  telefono?: string;
  notas?: string;
  avatarPath?: string;
  avatarUrl?: string;
  /** Marca legacy: si está, no la borramos del user_metadata. */
  requiereCambioClave?: boolean;
};

function leerPerfil(user: { user_metadata?: unknown }): PerfilCliente {
  const m = (user.user_metadata as Record<string, unknown> | undefined) ?? {};
  return {
    nombre: typeof m.nombre === "string" ? m.nombre : undefined,
    telefono: typeof m.telefono === "string" ? m.telefono : undefined,
    notas: typeof m.notas === "string" ? m.notas : undefined,
    avatarPath:
      typeof m.avatarPath === "string" ? m.avatarPath : undefined,
    avatarUrl: typeof m.avatarUrl === "string" ? m.avatarUrl : undefined,
    requiereCambioClave: m.requiereCambioClave === true ? true : undefined,
  };
}

/** Lee al cliente con datos frescos (evita JWT cacheado). */
async function getUsuarioCliente() {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  if (!sess.user) return null;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.getUserById(sess.user.id);
  if (error || !data.user) return null;
  if (!esCliente(data.user)) return null;
  return data.user;
}

export async function GET() {
  const user = await getUsuarioCliente();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  // razón social desde el snapshot (la mantenida por el admin), para
  // mostrarla en el perfil del cliente.
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const snapshot = appMeta.snapshot as Record<string, unknown> | undefined;
  const razonSocial =
    typeof snapshot?.razonSocial === "string" ? snapshot.razonSocial : "";
  const rfc = typeof snapshot?.rfc === "string" ? snapshot.rfc : "";
  const perfil = leerPerfil(user);
  const clienteId = clienteIdDesdeUsuarioPortal(user);
  if (clienteId != null) {
    try {
      const estado = await leerCrmEstadoCompleto();
      const cli = estado.clientes.find((c) => c.id === clienteId);
      if (cli) {
        if (!perfil.avatarUrl?.trim() && cli.fotoPerfilUrl) {
          perfil.avatarUrl = cli.fotoPerfilUrl;
          perfil.avatarPath = cli.fotoPerfilPath;
        } else if (perfil.avatarUrl?.trim() && !cli.fotoPerfilUrl) {
          await actualizarClienteEnDb({
            ...cli,
            fotoPerfilUrl: perfil.avatarUrl,
            fotoPerfilPath: perfil.avatarPath,
          });
        }
      }
    } catch {
      // sin CRM: se queda el metadata
    }
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    razonSocial,
    rfc,
    perfil,
  });
}

export async function PUT(request: NextRequest) {
  const user = await getUsuarioCliente();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body: Partial<PerfilCliente> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const limpiar = (s: unknown): string | undefined => {
    if (typeof s !== "string") return undefined;
    const t = s.trim();
    return t.length ? t : undefined;
  };

  const previo = leerPerfil(user);
  const nuevoMeta: PerfilCliente = {
    ...previo,
    nombre: limpiar(body.nombre),
    telefono: limpiar(body.telefono),
    notas: limpiar(body.notas),
    // avatarPath/avatarUrl no se tocan acá, eso es vía /foto
  };

  const admin = getSupabaseAdmin();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: nuevoMeta,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, perfil: nuevoMeta });
}

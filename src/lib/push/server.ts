/**
 * Server-side helpers for Web Push notifications.
 *
 * Requiere variables de entorno:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT  (mailto:)
 *
 * Subscriptions viven en la tabla `push_subscriptions` (Supabase, ver migration).
 */

import webpush, { type PushSubscription as WebPushSubscription } from "web-push";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contacto@rdcontadores.com";
  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID keys faltantes (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)."
    );
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export type PushAction = {
  action: string;
  title: string;
  icon?: string;
};

export type PushPayload = {
  title: string;
  body: string;
  /** URL a abrir al clickear (relativa al dominio). */
  url?: string;
  /** Identificador de agrupamiento (mismo tag = reemplaza la anterior). */
  tag?: string;
  /** Si true, fuerza renotify aunque ya haya una con el mismo tag. */
  renotify?: boolean;
  /** Mantener visible hasta interacción (comprobantes, urgencias). */
  requireInteraction?: boolean;
  /** Botones de acción rápida (Chrome, Edge, Firefox; limitado en iOS). */
  actions?: PushAction[];
  /** Datos adicionales para la lógica del SW. */
  data?: Record<string, unknown>;
};

type SubscriptionRow = {
  id: string;
  cliente_id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
};

type AdminSubscriptionRow = {
  id: string;
  admin_user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Envía una push a UNA suscripción puntual ya conocida (no consulta la
 * base de datos). Útil para mensajes de bienvenida justo al
 * suscribirse: queremos pegarle solo al dispositivo que acaba de
 * activar las notificaciones, no a los demás del mismo usuario.
 *
 * Errores se atrapan y devuelven en el resultado para que el caller
 * (típicamente el endpoint /subscribe) decida si los reporta o no.
 */
export async function enviarPushASuscripcion(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    ensureConfigured();
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "vapid",
    };
  }
  const webSub: WebPushSubscription = {
    endpoint: sub.endpoint,
    keys: { p256dh: sub.p256dh, auth: sub.auth },
  };
  try {
    await webpush.sendNotification(webSub, JSON.stringify(payload));
    return { ok: true };
  } catch (err: unknown) {
    const status =
      err && typeof err === "object" && "statusCode" in err
        ? (err as { statusCode?: number }).statusCode
        : undefined;
    return {
      ok: false,
      status,
      error: err instanceof Error ? err.message : "error",
    };
  }
}

/**
 * Envía una push a TODAS las suscripciones activas del cliente indicado.
 * Si alguna suscripción expira (404/410), la elimina automáticamente.
 */
export async function enviarPushACliente(
  clienteId: number,
  payload: PushPayload
): Promise<{ enviadas: number; eliminadas: number; errores: number }> {
  ensureConfigured();
  const admin = getSupabaseAdmin();

  const { data: rows, error } = await admin
    .from("push_subscriptions")
    .select("id, cliente_id, endpoint, p256dh, auth")
    .eq("cliente_id", clienteId)
    .returns<SubscriptionRow[]>();

  if (error || !rows || rows.length === 0) {
    return { enviadas: 0, eliminadas: 0, errores: 0 };
  }

  let enviadas = 0;
  let eliminadas = 0;
  let errores = 0;

  const payloadJson = JSON.stringify(payload);

  await Promise.all(
    rows.map(async (row) => {
      const subscription: WebPushSubscription = {
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh,
          auth: row.auth,
        },
      };
      try {
        await webpush.sendNotification(subscription, payloadJson);
        enviadas++;
      } catch (err: unknown) {
        const status =
          err && typeof err === "object" && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("id", row.id);
          eliminadas++;
        } else {
          errores++;
        }
      }
    })
  );

  return { enviadas, eliminadas, errores };
}

/**
 * Envía una push a TODAS las suscripciones activas de TODOS los admins
 * del despacho. Las suscripciones expiradas se eliminan automáticamente.
 */
export async function enviarPushATodosLosAdmins(
  payload: PushPayload
): Promise<{ enviadas: number; eliminadas: number; errores: number }> {
  try {
    ensureConfigured();
  } catch {
    return { enviadas: 0, eliminadas: 0, errores: 0 };
  }
  const admin = getSupabaseAdmin();

  const { data: rows, error } = await admin
    .from("admin_push_subscriptions")
    .select("id, admin_user_id, endpoint, p256dh, auth")
    .returns<AdminSubscriptionRow[]>();

  if (error || !rows || rows.length === 0) {
    return { enviadas: 0, eliminadas: 0, errores: 0 };
  }

  let enviadas = 0;
  let eliminadas = 0;
  let errores = 0;
  const payloadJson = JSON.stringify(payload);

  await Promise.all(
    rows.map(async (row) => {
      const subscription: WebPushSubscription = {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      };
      try {
        await webpush.sendNotification(subscription, payloadJson);
        enviadas++;
      } catch (err: unknown) {
        const status =
          err && typeof err === "object" && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        if (status === 404 || status === 410) {
          await admin
            .from("admin_push_subscriptions")
            .delete()
            .eq("id", row.id);
          eliminadas++;
        } else {
          errores++;
        }
      }
    })
  );

  return { enviadas, eliminadas, errores };
}

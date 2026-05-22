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

export type PushPayload = {
  title: string;
  body: string;
  /** URL a abrir al clickear (relativa al dominio). */
  url?: string;
  /** Identificador de agrupamiento (mismo tag = reemplaza la anterior). */
  tag?: string;
  /** Si true, fuerza renotify aunque ya haya una con el mismo tag. */
  renotify?: boolean;
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

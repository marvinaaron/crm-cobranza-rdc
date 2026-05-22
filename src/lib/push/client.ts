/**
 * Client-side helpers for Web Push subscriptions (PWA / navegador).
 */

export const PUSH_OPCION_STORAGE = "rdc-push-recordatorio-v1";

export function pushSoportado(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function estadoPermisoPush(): NotificationPermission | "no-soportado" {
  if (!pushSoportado()) return "no-soportado";
  return Notification.permission;
}

/**
 * Registra el service worker (si aún no lo está) y devuelve su registro.
 */
export async function registrarServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg =
      (await navigator.serviceWorker.getRegistration("/sw.js")) ??
      (await navigator.serviceWorker.register("/sw.js", { scope: "/" }));
    return reg;
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; ++i) view[i] = raw.charCodeAt(i);
  return buffer;
}

export type ResultadoSuscripcion =
  | { ok: true; mensaje: "ya-activa" | "creada" }
  | {
      ok: false;
      razon: "no-soportado" | "denegado" | "sin-vapid" | "error";
      detalle?: string;
    };

type EndpointsPush = {
  subscribe: string;
  unsubscribe: string;
};

const ENDPOINTS_CLIENTE: EndpointsPush = {
  subscribe: "/api/portal/push/subscribe",
  unsubscribe: "/api/portal/push/unsubscribe",
};

const ENDPOINTS_ADMIN: EndpointsPush = {
  subscribe: "/api/admin/push/subscribe",
  unsubscribe: "/api/admin/push/unsubscribe",
};

async function activarPush(
  endpoints: EndpointsPush
): Promise<ResultadoSuscripcion> {
  if (!pushSoportado()) return { ok: false, razon: "no-soportado" };

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublic) return { ok: false, razon: "sin-vapid" };

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") return { ok: false, razon: "denegado" };

  const reg = await registrarServiceWorker();
  if (!reg) return { ok: false, razon: "error" };

  try {
    let subscription = await reg.pushManager.getSubscription();
    const yaActiva = !!subscription;
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublic),
      });
    }

    const resp = await fetch(endpoints.subscribe, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    });
    if (!resp.ok) {
      let detalle: string | undefined;
      try {
        const data = (await resp.json()) as { error?: string };
        detalle = data.error;
      } catch {}
      try {
        await subscription.unsubscribe();
      } catch {}
      return { ok: false, razon: "error", detalle };
    }

    return { ok: true, mensaje: yaActiva ? "ya-activa" : "creada" };
  } catch (e) {
    return {
      ok: false,
      razon: "error",
      detalle: e instanceof Error ? e.message : undefined,
    };
  }
}

async function desactivarPush(endpoints: EndpointsPush): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return true;
  const subscription = await reg.pushManager.getSubscription();
  if (!subscription) return true;

  try {
    await fetch(endpoints.unsubscribe, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
    return true;
  } catch {
    return false;
  }
}

export function activarPushParaCliente(): Promise<ResultadoSuscripcion> {
  return activarPush(ENDPOINTS_CLIENTE);
}

export function desactivarPushParaCliente(): Promise<boolean> {
  return desactivarPush(ENDPOINTS_CLIENTE);
}

export function activarPushParaAdmin(): Promise<ResultadoSuscripcion> {
  return activarPush(ENDPOINTS_ADMIN);
}

export function desactivarPushParaAdmin(): Promise<boolean> {
  return desactivarPush(ENDPOINTS_ADMIN);
}

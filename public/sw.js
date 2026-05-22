/**
 * RDC Contadores · Service Worker (PWA + Web Push v2)
 *
 * - Muestra notificaciones con botones de acción rápida.
 * - Click en la notificación o en un botón abre la URL correspondiente.
 */

const APP_NAME = "RDC Contadores";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function resolverUrlNotificacion(payload, actionId) {
  const data = payload.data || {};
  const actionUrls = data.actionUrls || {};
  if (actionId && actionUrls[actionId]) {
    return actionUrls[actionId];
  }
  return payload.url || data.url || "/portal/inicio";
}

async function abrirUrl(targetUrl) {
  const url =
    targetUrl.startsWith("http") || targetUrl.startsWith("/")
      ? targetUrl
      : `/${targetUrl}`;

  const clientsArr = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of clientsArr) {
    if ("focus" in client) {
      try {
        await client.focus();
        if ("navigate" in client) {
          await client.navigate(url);
        }
        return;
      } catch {
        // siguiente cliente o openWindow
      }
    }
  }

  if (self.clients.openWindow) {
    await self.clients.openWindow(url);
  }
}

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: APP_NAME, body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || APP_NAME;
  const data = {
    url: payload.url || "/portal/inicio",
    ...(payload.data || {}),
  };

  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    tag: payload.tag || "rdc-notificacion",
    renotify: payload.renotify ?? false,
    requireInteraction: payload.requireInteraction ?? false,
    data,
    actions: Array.isArray(payload.actions) ? payload.actions.slice(0, 2) : [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const payload = {
    url: event.notification.data?.url,
    data: event.notification.data || {},
  };
  const targetUrl = resolverUrlNotificacion(payload, event.action);

  event.waitUntil(abrirUrl(targetUrl));
});

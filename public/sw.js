/**
 * RDC Contadores · Service Worker para Push Notifications.
 *
 * - Recibe pushes del backend (web-push) y los muestra al usuario.
 * - Al hacer click en la notificación, abre la URL `data.url` (o el portal).
 * - Cachea muy poco; el objetivo de este SW es PWA + push, no offline-first.
 */

const APP_NAME = "RDC Contadores";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: APP_NAME, body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || APP_NAME;
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    tag: payload.tag || "rdc-notificacion",
    renotify: payload.renotify ?? false,
    requireInteraction: payload.requireInteraction ?? false,
    data: {
      url: payload.url || "/portal/inicio",
      ...(payload.data || {}),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/portal/inicio";

  event.waitUntil(
    (async () => {
      const clientsArr = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      // Si ya hay una ventana del portal abierta, la enfoca y navega.
      for (const client of clientsArr) {
        if ("focus" in client) {
          try {
            await client.focus();
            if ("navigate" in client && targetUrl) {
              await client.navigate(targetUrl);
            }
            return;
          } catch {
            // ignoramos y caemos al openWindow
          }
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

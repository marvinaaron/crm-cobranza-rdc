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
    // `lang` y `dir` le dicen al SO que el contenido es español de MX.
    // Algunos navegadores (Chrome desktop, ciertos Android) lo usan para
    // localizar el subtítulo del sitio que agregan automáticamente
    // ("from X" → "de X"). En iOS Safari el prefijo lo decide el idioma
    // del propio sistema operativo del usuario y no se puede sobreescribir.
    lang: payload.lang || "es-MX",
    dir: "ltr",
    data,
    actions: Array.isArray(payload.actions) ? payload.actions.slice(0, 2) : [],
  };

  // Badge sobre el ícono de la app (PWA instalada). Con la app cerrada no
  // conocemos el total de no leídas, así que ponemos un badge genérico
  // ("hay algo nuevo"); al abrir la app, la web lo corrige al número exacto.
  // Si el servidor manda `data.badgeCount`, lo respetamos.
  function marcarBadge() {
    try {
      if (!self.navigator || !self.navigator.setAppBadge) return Promise.resolve();
      const n = Number(data.badgeCount);
      return Number.isFinite(n) && n > 0
        ? self.navigator.setAppBadge(n)
        : self.navigator.setAppBadge();
    } catch {
      return Promise.resolve();
    }
  }

  event.waitUntil(
    Promise.all([self.registration.showNotification(title, options), marcarBadge()])
  );
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

"use client";

import { useEffect } from "react";

/**
 * Sincroniza el número rojo sobre el ícono de la app instalada (PWA) con la
 * cantidad de notificaciones no leídas, vía Badging API
 * (`navigator.setAppBadge`).
 *
 * - Funciona solo cuando la app está INSTALADA (pantalla de inicio / dock).
 *   En el navegador normal la API no tiene efecto, y es no-op donde no exista.
 * - El Service Worker pone un badge genérico al llegar un push con la app
 *   cerrada; al abrirla, este componente lo corrige al número exacto.
 * - Reaplica al volver el foco/visibilidad porque algunos sistemas (iOS)
 *   limpian el badge cuando se abre la app.
 */
export default function AppBadgeSync({ count }: { count: number }) {
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & {
      setAppBadge?: (n?: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    if (!nav.setAppBadge) return;

    const aplicar = () => {
      try {
        if (count > 0) {
          void nav.setAppBadge?.(count);
        } else {
          void nav.clearAppBadge?.();
        }
      } catch {
        // Plataforma sin soporte real; ignoramos.
      }
    };

    aplicar();

    const onVisible = () => {
      if (document.visibilityState === "visible") aplicar();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", aplicar);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", aplicar);
    };
  }, [count]);

  return null;
}

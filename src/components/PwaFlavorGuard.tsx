"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "rdc-pwa-flavor";

function esStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia?.("(display-mode: standalone)").matches;
  const ios =
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(mm || ios);
}

/**
 * - En rutas `/portal/*` marca la instalación como PWA de portal.
 * - Si la app standalone abre fuera del portal (home pública), y el flavor
 *   es portal, redirige a `/portal/login` (como el admin abre en dashboard).
 */
export default function PwaFlavorGuard() {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith("/portal")) {
      try {
        localStorage.setItem(STORAGE_KEY, "portal");
      } catch {
        // ignore
      }
      return;
    }

    if (!esStandalone()) return;

    // No interferir con admin ni herramientas.
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/clientes") ||
      pathname.startsWith("/acceso") ||
      pathname.startsWith("/herramientas") ||
      pathname.startsWith("/auth")
    ) {
      return;
    }

    let flavor: string | null = null;
    try {
      flavor = localStorage.getItem(STORAGE_KEY);
    } catch {
      flavor = null;
    }
    if (flavor !== "portal") return;

    // Caída típica: start_url viejo o “Volver al sitio” sacó del scope /portal/.
    router.replace("/portal/login?source=pwa-portal");
  }, [pathname, router]);

  return null;
}

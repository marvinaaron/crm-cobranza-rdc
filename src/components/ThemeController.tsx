"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { esRutaAdmin } from "@/lib/auth/rutas";

export type RdcTheme = "light" | "dark" | "auto";

/** Preferencia de tema del portal del cliente (default claro). */
export const RDC_THEME_KEY = "rdc-theme";
/** Preferencia de tema del CRM admin (default automático = sigue al SO). */
export const RDC_THEME_KEY_ADMIN = "rdc-theme-admin";

/** Lee una preferencia guardada; si no hay nada válido, usa el default. */
export function leerTema(key: string, def: RdcTheme): RdcTheme {
  if (typeof window === "undefined") return def;
  try {
    const t = window.localStorage.getItem(key);
    if (t === "light" || t === "dark" || t === "auto") return t;
  } catch {
    /* ignore */
  }
  return def;
}

function osPrefiereDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches === true
  );
}

/**
 * Qué preferencia manda según la ruta:
 *  - Portal del cliente → key propia, default claro.
 *  - CRM admin → key propia, default automático (conserva el comportamiento
 *    histórico de seguir al sistema operativo hasta que el admin elija).
 *  - Sitio público → siempre sigue al sistema operativo (sin toggle).
 */
function areaDeRuta(pathname: string): { key: string; def: RdcTheme } | null {
  if (pathname.startsWith("/portal")) {
    return { key: RDC_THEME_KEY, def: "light" };
  }
  if (esRutaAdmin(pathname)) {
    return { key: RDC_THEME_KEY_ADMIN, def: "auto" };
  }
  return null;
}

export function calcularDark(pathname: string): boolean {
  const area = areaDeRuta(pathname);
  if (!area) return osPrefiereDark();
  const t = leerTema(area.key, area.def);
  return t === "dark" || (t === "auto" && osPrefiereDark());
}

function aplicarDark(pathname: string) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", calcularDark(pathname));
}

/**
 * Mantiene la clase `.dark` sincronizada en vivo: al navegar entre rutas,
 * cuando se cambia el tema (evento "rdc:theme-change") y cuando el sistema
 * operativo cambia de modo (para "auto" y para el sitio público).
 */
export default function ThemeController() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    aplicarDark(pathname);

    const onThemeChange = () => aplicarDark(pathname);
    window.addEventListener("rdc:theme-change", onThemeChange);

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onOsChange = () => aplicarDark(pathname);
    mq?.addEventListener?.("change", onOsChange);

    return () => {
      window.removeEventListener("rdc:theme-change", onThemeChange);
      mq?.removeEventListener?.("change", onOsChange);
    };
  }, [pathname]);

  return null;
}

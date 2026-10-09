import type { Metadata } from "next";
import { RUTA_LOGIN_ADMIN, esRutaAdmin } from "@/lib/auth/rutas";

export const THEME_INIT_SCRIPT = `(function(){try{var p=location.pathname||"";var os=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var dark;if(p.indexOf("/portal")===0){var t=null;try{t=localStorage.getItem("rdc-theme");}catch(e){}if(t!=="dark"&&t!=="auto"&&t!=="light"){t="light";}dark=(t==="dark")||(t==="auto"&&os);}else{dark=os;}document.documentElement.classList.toggle("dark",!!dark);}catch(e){}})();`;

export const THEME_INIT_SCRIPT_ADMIN = `(function(){try{var os=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var t=null;try{t=localStorage.getItem("rdc-theme-admin");}catch(e){}if(t!=="dark"&&t!=="auto"&&t!=="light"){t="auto";}var dark=(t==="dark")||(t==="auto"&&os);document.documentElement.classList.toggle("dark",!!dark);}catch(e){}})();`;

export function esRutaAdminPwa(pathname: string): boolean {
  return esRutaAdmin(pathname) || pathname === RUTA_LOGIN_ADMIN;
}

export function themeInitScriptForPath(pathname: string): string {
  return esRutaAdminPwa(pathname) ? THEME_INIT_SCRIPT_ADMIN : THEME_INIT_SCRIPT;
}

function faviconIcons(apple: string): Metadata["icons"] {
  return {
    icon: [
      {
        url: "/favicon-light.png?v=13",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.png?v=13",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple,
  };
}

export function buildPwaMetadata(pathname: string): Metadata {
  const isPortal = pathname.startsWith("/portal");
  const usaAdmin = esRutaAdminPwa(pathname);

  if (usaAdmin) {
    return {
      manifest: "/manifest-admin.webmanifest?v=19",
      applicationName: "RDC Admin",
      appleWebApp: {
        capable: true,
        title: "RDC Admin",
        statusBarStyle: "black-translucent",
      },
      icons: faviconIcons("/apple-touch-icon-admin-v2.png?v=19"),
      other: {
        "theme-color": "#7c3aed",
      },
    };
  }

  if (isPortal) {
    return {
      manifest: "/manifest-portal.webmanifest",
      applicationName: "RDC Portal",
      appleWebApp: {
        capable: true,
        title: "RDC Portal",
        statusBarStyle: "black-translucent",
      },
      icons: faviconIcons("/apple-touch-icon-v2.png?v=18"),
      other: {
        "theme-color": "#2563eb",
      },
    };
  }

  return {
    manifest: "/manifest.webmanifest",
    applicationName: "RDC Contadores",
    appleWebApp: {
      capable: true,
      title: "RDC Contadores",
      statusBarStyle: "black-translucent",
    },
    icons: faviconIcons("/apple-touch-icon-v2.png?v=18"),
    other: {
      "theme-color": "#0f172a",
    },
  };
}

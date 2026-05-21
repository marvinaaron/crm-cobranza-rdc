"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClientesProvider } from "@/context/ClientesContext";
import { PortalAuthProvider, usePortalAuth } from "@/context/PortalAuthContext";
import PortalShell from "@/components/portal/PortalShell";

/** Rutas dentro de /portal que se renderizan sin chrome (sidebar). */
const RUTAS_SIN_SHELL = new Set([
  "/portal/login",
  "/portal/recuperar",
  "/portal/cambiar-clave",
]);

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, session, cliente, requiereCambioClave } = usePortalAuth();

  const sinShell = RUTAS_SIN_SHELL.has(pathname ?? "");
  const esCambiarClave = pathname === "/portal/cambiar-clave";
  const esLegacyId = /^\/portal\/\d+$/.test(pathname ?? "");

  useEffect(() => {
    if (!ready) return;
    if (esLegacyId) return;
    if (esCambiarClave) return; // se valida en su propia página

    // Si tiene sesión pero hay que cambiar clave, mandar ahí
    if (session && requiereCambioClave && !esCambiarClave) {
      router.replace("/portal/cambiar-clave");
      return;
    }
  }, [ready, session, requiereCambioClave, esCambiarClave, esLegacyId, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm font-bold text-slate-400">Cargando portal…</p>
      </div>
    );
  }

  if (esLegacyId) return <>{children}</>;
  if (sinShell) return <>{children}</>;

  // El proxy ya asegura sesión, pero por defensa:
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm font-bold text-slate-400">Redirigiendo…</p>
      </div>
    );
  }

  // Sesión válida pero todavía no encontramos el cliente en localStorage
  // (caso típico: pestaña nueva del cliente sin datos previos).
  if (!cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md text-center space-y-3">
          <p className="text-sm font-bold text-slate-600">
            Cargando información de su cuenta…
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Si esto persiste, contacte al despacho para que confirme que su
            cuenta está vinculada al portal.
          </p>
        </div>
      </div>
    );
  }

  return <PortalShell>{children}</PortalShell>;
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientesProvider>
      <PortalAuthProvider>
        <PortalLayoutInner>{children}</PortalLayoutInner>
      </PortalAuthProvider>
    </ClientesProvider>
  );
}

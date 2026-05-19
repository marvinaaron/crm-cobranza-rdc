"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClientesProvider } from "@/context/ClientesContext";
import { PortalAuthProvider, usePortalAuth } from "@/context/PortalAuthContext";
import PortalShell from "@/components/portal/PortalShell";

const RUTAS_PUBLICAS = ["/portal/login", "/portal/recuperar"];

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, session, cliente, requiereCambioClave } = usePortalAuth();

  const esPublica = RUTAS_PUBLICAS.includes(pathname ?? "");
  const esCambiarClave = pathname === "/portal/cambiar-clave";
  const esLegacyId = /^\/portal\/\d+$/.test(pathname ?? "");

  useEffect(() => {
    if (!ready) return;
    if (esLegacyId) return;

    if (!session) {
      if (!esPublica) router.replace("/portal/login");
      return;
    }

    if (requiereCambioClave) {
      if (!esCambiarClave) router.replace("/portal/cambiar-clave");
      return;
    }

    if (esPublica || esCambiarClave) {
      router.replace("/portal/honorarios");
    }
  }, [ready, session, requiereCambioClave, esPublica, esCambiarClave, esLegacyId, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm font-bold text-slate-400">Cargando portal…</p>
      </div>
    );
  }

  if (esLegacyId) {
    return <>{children}</>;
  }

  if (esPublica) {
    return <>{children}</>;
  }

  if (!session || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm font-bold text-slate-400">Redirigiendo…</p>
      </div>
    );
  }

  if (esCambiarClave) {
    return <>{children}</>;
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

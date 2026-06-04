"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClientesProvider, useClientes } from "@/context/ClientesContext";
import { PortalAuthProvider, usePortalAuth } from "@/context/PortalAuthContext";
import { PortalPerfilProvider } from "@/components/portal/PortalPerfilContext";
import PortalShell from "@/components/portal/PortalShell";
import PortalCargando from "@/components/portal/PortalCargando";

/** Rutas dentro de /portal que se renderizan sin chrome (sidebar). */
const RUTAS_SIN_SHELL = new Set([
  "/portal/login",
  "/portal/recuperar",
  "/portal/cambiar-clave",
]);

/**
 * Estado de carga de la cuenta. Muestra la barra normal y, si tras unos
 * segundos sigue sin cargar, asume que la cuenta no está vinculada y cambia
 * a Fiscalino preocupado con la guía para contactar al contador.
 */
function CuentaCargando() {
  const [tardoDemasiado, setTardoDemasiado] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTardoDemasiado(true), 7000);
    return () => clearTimeout(t);
  }, []);

  if (tardoDemasiado) {
    return (
      <PortalCargando
        mood="worried"
        mensaje="No encontramos tu cuenta vinculada"
        detalle="Escríbele a tu contador para que confirme que tu cuenta está vinculada al portal."
      />
    );
  }
  return <PortalCargando mensaje="Cargando información de tu cuenta…" />;
}

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, session, cliente, requiereCambioClave } = usePortalAuth();
  const { datosListos } = useClientes();

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
    return <PortalCargando mensaje="Preparando tu portal…" />;
  }

  if (esLegacyId) return <>{children}</>;
  if (sinShell) return <>{children}</>;

  // El proxy ya asegura sesión, pero por defensa:
  if (!session) {
    return <PortalCargando mensaje="Redirigiendo…" />;
  }

  if (!datosListos || !cliente) {
    return <CuentaCargando />;
  }

  return (
    <PortalPerfilProvider>
      <PortalShell>{children}</PortalShell>
    </PortalPerfilProvider>
  );
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

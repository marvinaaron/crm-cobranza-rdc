"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PortalPerfilSnapshot = {
  id: string;
  email: string;
  razonSocial: string;
  rfc: string;
  perfil: {
    nombre?: string;
    telefono?: string;
    notas?: string;
    avatarPath?: string;
    avatarUrl?: string;
  };
};

type Ctx = {
  perfil: PortalPerfilSnapshot | null;
  loading: boolean;
  refrescar: () => Promise<void>;
};

const PortalPerfilCtx = createContext<Ctx | null>(null);

/**
 * Provider que carga el perfil personal del cliente del portal (nombre,
 * teléfono, foto). Se monta solo dentro del shell autenticado del portal.
 */
export function PortalPerfilProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<PortalPerfilSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refrescar = useCallback(async () => {
    try {
      const r = await fetch("/api/portal/perfil", { cache: "no-store" });
      if (r.ok) {
        const data = (await r.json()) as PortalPerfilSnapshot;
        setPerfil(data);
      } else {
        setPerfil(null);
      }
    } catch {
      setPerfil(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refrescar();
  }, [refrescar]);

  const value = useMemo(
    () => ({ perfil, loading, refrescar }),
    [perfil, loading, refrescar]
  );

  return (
    <PortalPerfilCtx.Provider value={value}>
      {children}
    </PortalPerfilCtx.Provider>
  );
}

export function usePortalPerfil(): Ctx {
  const ctx = useContext(PortalPerfilCtx);
  if (!ctx) {
    throw new Error(
      "usePortalPerfil debe usarse dentro de <PortalPerfilProvider>."
    );
  }
  return ctx;
}

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
import type { Modulo } from "@/lib/admin/permisos";

export type AdminPerfilSnapshot = {
  id: string;
  email: string;
  propietario: boolean;
  permisos: Modulo[];
  perfil: {
    nombreCompleto?: string;
    cargo?: string;
    telefono?: string;
    cedulaProfesional?: string;
    ubicacion?: string;
    notas?: string;
    avatarPath?: string;
    avatarUrl?: string;
  };
};

type AdminPerfilCtx = {
  perfil: AdminPerfilSnapshot | null;
  loading: boolean;
  refrescar: () => Promise<void>;
};

const Ctx = createContext<AdminPerfilCtx | null>(null);

/**
 * Provider que carga (una vez) el perfil del admin autenticado y lo expone
 * al resto del shell. Pensado para envolver SOLO las rutas del back office.
 */
export function AdminPerfilProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<AdminPerfilSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refrescar = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/perfil", { cache: "no-store" });
      if (r.ok) {
        const data = (await r.json()) as AdminPerfilSnapshot;
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

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminPerfil(): AdminPerfilCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useAdminPerfil debe usarse dentro de <AdminPerfilProvider>."
    );
  }
  return ctx;
}

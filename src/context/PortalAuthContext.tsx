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
import type { Session, User } from "@supabase/supabase-js";
import { type Cliente } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type ResultadoLoginPortal =
  | { ok: false; mensaje: string }
  | { ok: true; clienteId: number; requiereCambioClave: boolean };

type ResultadoRecuperacion = { ok: true; mensaje: string };

type PortalAuthValue = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  cliente: Cliente | null;
  /** True hasta que el cliente cambie su contraseña la primera vez. */
  requiereCambioClave: boolean;
  esClaveTemporal: boolean;
  login: (email: string, clave: string) => Promise<ResultadoLoginPortal>;
  logout: () => Promise<void>;
  establecerNuevaClave: (
    nueva: string,
    confirmar: string
  ) => Promise<string | null>;
  recuperarContrasena: (email: string) => Promise<ResultadoRecuperacion>;
};

const PortalAuthContext = createContext<PortalAuthValue | null>(null);

function readClienteIdFromUser(user: User | null | undefined): number | null {
  if (!user) return null;
  const meta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const raw = meta.clienteId;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "" && !Number.isNaN(Number(raw))) {
    return Number(raw);
  }
  return null;
}

function readRequiereCambio(user: User | null | undefined): boolean {
  if (!user) return false;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return meta.requiereCambioClave === true;
}

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const { listaClientes } = useClientes();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;
  const clienteId = readClienteIdFromUser(user);

  const cliente = useMemo(() => {
    if (clienteId == null) return null;
    return listaClientes.find((c) => c.id === clienteId) ?? null;
  }, [clienteId, listaClientes]);

  const requiereCambioClave = readRequiereCambio(user);
  const esClaveTemporal = requiereCambioClave;

  const login = useCallback(
    async (email: string, clave: string): Promise<ResultadoLoginPortal> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: clave,
      });
      if (error || !data.user) {
        return {
          ok: false,
          mensaje:
            "Correo o contraseña incorrectos. Verifique sus datos con el despacho.",
        };
      }
      const cid = readClienteIdFromUser(data.user);
      if (cid == null) {
        await supabase.auth.signOut();
        return {
          ok: false,
          mensaje:
            "Esta cuenta no está vinculada a un cliente del portal. Contacte al despacho.",
        };
      }
      return {
        ok: true,
        clienteId: cid,
        requiereCambioClave: readRequiereCambio(data.user),
      };
    },
    []
  );

  const logout = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const establecerNuevaClave = useCallback(
    async (nueva: string, confirmar: string): Promise<string | null> => {
      if (nueva.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
      }
      if (nueva !== confirmar) {
        return "Las contraseñas no coinciden.";
      }
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.updateUser({
        password: nueva,
        data: { requiereCambioClave: false },
      });
      if (error) {
        return error.message || "No se pudo actualizar la contraseña.";
      }
      return null;
    },
    []
  );

  const recuperarContrasena = useCallback(
    async (email: string): Promise<ResultadoRecuperacion> => {
      await fetch("/api/portal/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      }).catch(() => null);
      return {
        ok: true,
        mensaje:
          "Si el correo está registrado, recibirá un enlace para restablecer su contraseña.",
      };
    },
    []
  );

  return (
    <PortalAuthContext.Provider
      value={{
        ready,
        session,
        user,
        cliente,
        requiereCambioClave,
        esClaveTemporal,
        login,
        logout,
        establecerNuevaClave,
        recuperarContrasena,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) {
    throw new Error("usePortalAuth debe usarse dentro de PortalAuthProvider");
  }
  return ctx;
}

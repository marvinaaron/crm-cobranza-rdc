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
import { type Cliente } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import {
  type PortalSession,
  type ResultadoLoginPortal,
  validarLoginPortal,
  loadPortalSession,
  crearPortalSession,
  clearPortalSession,
  sincronizarCredencialesPortal,
  clienteRequiereCambioClave,
  establecerClavePersonalizada,
  validarNuevaClave,
  buscarClientePorUsuarioPortal,
  asignarClaveTemporal,
  getCredencialPortal,
} from "@/lib/portal-auth";
import { enviarCorreoClaveTemporal } from "@/lib/correo-portal";

type ResultadoRecuperacion =
  | { ok: false; mensaje: string }
  | {
      ok: true;
      mensaje: string;
      correoEnviado: boolean;
      claveVisible?: string;
    };

type PortalAuthValue = {
  ready: boolean;
  session: PortalSession | null;
  cliente: Cliente | null;
  requiereCambioClave: boolean;
  esClaveTemporal: boolean;
  login: (usuario: string, clave: string) => ResultadoLoginPortal;
  logout: () => void;
  establecerNuevaClave: (nueva: string, confirmar: string) => string | null;
  recuperarContrasena: (usuario: string) => ResultadoRecuperacion;
};

const PortalAuthContext = createContext<PortalAuthValue | null>(null);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const { listaClientes } = useClientes();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    sincronizarCredencialesPortal(listaClientes);
  }, [listaClientes]);

  useEffect(() => {
    setSession(loadPortalSession());
    setReady(true);
  }, []);

  const cliente = useMemo(() => {
    if (!session) return null;
    return listaClientes.find((c) => c.id === session.clienteId) ?? null;
  }, [session, listaClientes]);

  const requiereCambioClave = useMemo(() => {
    if (!session) return false;
    return clienteRequiereCambioClave(session.clienteId);
  }, [session]);

  const esClaveTemporal = useMemo(() => {
    if (!session) return false;
    return getCredencialPortal(session.clienteId)?.esClaveTemporal ?? false;
  }, [session]);

  const login = useCallback(
    (usuario: string, clave: string): ResultadoLoginPortal => {
      const resultado = validarLoginPortal(usuario, clave, listaClientes);
      if (!resultado.ok) return resultado;
      const nueva = crearPortalSession(resultado.clienteId);
      setSession(nueva);
      return resultado;
    },
    [listaClientes]
  );

  const logout = useCallback(() => {
    clearPortalSession();
    setSession(null);
  }, []);

  const establecerNuevaClave = useCallback(
    (nueva: string, confirmar: string): string | null => {
      if (!session) return "Sesión no válida.";
      const err = validarNuevaClave(nueva, confirmar);
      if (err) return err;
      establecerClavePersonalizada(session.clienteId, nueva);
      return null;
    },
    [session]
  );

  const recuperarContrasena = useCallback(
    (usuario: string): ResultadoRecuperacion => {
      const clienteEncontrado = buscarClientePorUsuarioPortal(
        usuario,
        listaClientes
      );
      if (!clienteEncontrado) {
        return {
          ok: false,
          mensaje:
            "No encontramos ese usuario. Verifique su RFC o contacte al despacho.",
        };
      }
      const { clavePlana, usuario: usuarioCred } = asignarClaveTemporal(
        clienteEncontrado.id
      );
      const correoOk = enviarCorreoClaveTemporal(
        clienteEncontrado,
        usuarioCred,
        clavePlana
      );

      if (correoOk) {
        return {
          ok: true,
          correoEnviado: true,
          mensaje: `Se abrió un borrador en Gmail para enviar la contraseña temporal a ${clienteEncontrado.email}. Revise y pulse Enviar. Al ingresar deberá crear una contraseña nueva.`,
        };
      }

      return {
        ok: true,
        correoEnviado: false,
        claveVisible: clavePlana,
        mensaje:
          "No hay un correo válido en su expediente. Use la contraseña temporal que se muestra abajo. Al ingresar deberá crear una contraseña nueva. Contacte al despacho para actualizar su correo.",
      };
    },
    [listaClientes]
  );

  return (
    <PortalAuthContext.Provider
      value={{
        ready,
        session,
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

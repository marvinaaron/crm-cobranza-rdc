"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AdminPageToolbarContextValue = {
  acciones: ReactNode;
  setAcciones: (node: ReactNode) => void;
};

const AdminPageToolbarContext = createContext<AdminPageToolbarContextValue | null>(
  null
);

export function AdminPageToolbarProvider({ children }: { children: ReactNode }) {
  const [acciones, setAcciones] = useState<ReactNode>(null);
  return (
    <AdminPageToolbarContext.Provider value={{ acciones, setAcciones }}>
      {children}
    </AdminPageToolbarContext.Provider>
  );
}

export function useAdminPageToolbar() {
  const ctx = useContext(AdminPageToolbarContext);
  if (!ctx) {
    throw new Error(
      "useAdminPageToolbar debe usarse dentro de AdminPageToolbarProvider"
    );
  }
  return ctx;
}

/** Registra acciones en la barra de herramientas del admin (debajo del encabezado). */
export function useRegistrarAdminToolbar(acciones: ReactNode) {
  const { setAcciones } = useAdminPageToolbar();
  useEffect(() => {
    setAcciones(acciones);
    return () => setAcciones(null);
  }, [acciones, setAcciones]);
}

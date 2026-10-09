"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "rdc-admin-sidebar-colapsado-v1";
const STORAGE_EVENT = "rdc-sidebar-colapsado-change";

function leerColapsado(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function escribirColapsado(v: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function subscribeColapsado(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(STORAGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(STORAGE_EVENT, handler);
  };
}

type SidebarColapsoValue = {
  colapsado: boolean;
  hoverExpandido: boolean;
  efectivoExpandido: boolean;
  setColapsado: (v: boolean) => void;
  toggleColapsado: () => void;
  setHoverExpandido: (v: boolean) => void;
};

const SidebarColapsoContext = createContext<SidebarColapsoValue | null>(null);

export function SidebarColapsoProvider({ children }: { children: ReactNode }) {
  const colapsado = useSyncExternalStore(
    subscribeColapsado,
    leerColapsado,
    () => false
  );
  const [hoverExpandido, setHoverExpandido] = useState(false);

  const setColapsado = useCallback((v: boolean) => {
    escribirColapsado(v);
  }, []);

  const toggleColapsado = useCallback(() => {
    escribirColapsado(!leerColapsado());
  }, []);

  const value = useMemo<SidebarColapsoValue>(
    () => ({
      colapsado,
      hoverExpandido,
      efectivoExpandido: !colapsado || hoverExpandido,
      setColapsado,
      toggleColapsado,
      setHoverExpandido,
    }),
    [colapsado, hoverExpandido, setColapsado, toggleColapsado]
  );

  return (
    <SidebarColapsoContext.Provider value={value}>
      {children}
    </SidebarColapsoContext.Provider>
  );
}

export function useSidebarColapso(): SidebarColapsoValue {
  const ctx = useContext(SidebarColapsoContext);
  if (!ctx) {
    return {
      colapsado: false,
      hoverExpandido: false,
      efectivoExpandido: true,
      setColapsado: () => {},
      toggleColapsado: () => {},
      setHoverExpandido: () => {},
    };
  }
  return ctx;
}

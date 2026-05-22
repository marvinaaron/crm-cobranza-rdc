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

const STORAGE_KEY = "rdc-admin-sidebar-colapsado-v1";

type SidebarColapsoValue = {
  /** Preferencia del usuario: colapsado fijo o expandido. */
  colapsado: boolean;
  /** Hover temporal sobre la barra colapsada (efecto "peek"). */
  hoverExpandido: boolean;
  /** Verdadero si la barra está visualmente expandida (por preferencia u hover). */
  efectivoExpandido: boolean;
  setColapsado: (v: boolean) => void;
  toggleColapsado: () => void;
  setHoverExpandido: (v: boolean) => void;
};

const SidebarColapsoContext = createContext<SidebarColapsoValue | null>(null);

export function SidebarColapsoProvider({ children }: { children: ReactNode }) {
  const [colapsado, setColapsadoState] = useState(false);
  const [hoverExpandido, setHoverExpandido] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "1") setColapsadoState(true);
    } catch {}
    setHydrated(true);
  }, []);

  const setColapsado = useCallback((v: boolean) => {
    setColapsadoState(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {}
  }, []);

  const toggleColapsado = useCallback(() => {
    setColapsadoState((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }, []);

  const value = useMemo<SidebarColapsoValue>(
    () => ({
      colapsado: hydrated ? colapsado : false,
      hoverExpandido,
      efectivoExpandido: hydrated ? !colapsado || hoverExpandido : true,
      setColapsado,
      toggleColapsado,
      setHoverExpandido,
    }),
    [colapsado, hoverExpandido, hydrated, setColapsado, toggleColapsado]
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

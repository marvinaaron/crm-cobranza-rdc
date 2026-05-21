"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ConfirmDialog from "./ConfirmDialog";

type Tono = "danger" | "warning" | "info";

export type ConfirmOptions = {
  titulo: string;
  mensaje?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tono?: Tono;
  /** Si lo defines, el usuario debe escribir EXACTAMENTE este texto para habilitar el botón. */
  confirmacionEscrita?: string;
};

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    setOpts(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const cerrar = useCallback((valor: boolean) => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setOpen(false);
    if (r) r(valor);
  }, []);

  const valor = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={valor}>
      {children}
      <ConfirmDialog
        open={open}
        titulo={opts?.titulo ?? ""}
        mensaje={opts?.mensaje}
        textoConfirmar={opts?.textoConfirmar}
        textoCancelar={opts?.textoCancelar}
        tono={opts?.tono ?? "danger"}
        confirmacionEscrita={opts?.confirmacionEscrita}
        onConfirmar={() => cerrar(true)}
        onCancelar={() => cerrar(false)}
      />
    </ConfirmContext.Provider>
  );
}

/**
 * Hook para pedir confirmación al usuario con el modal del CRM.
 *
 * Reemplazo directo de `window.confirm`:
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ titulo: "¿Eliminar?" }))) return;
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      "useConfirm debe usarse dentro de <ConfirmProvider> (revisar root layout)."
    );
  }
  return ctx;
}

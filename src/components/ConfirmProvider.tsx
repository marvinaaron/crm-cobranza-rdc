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

export type NotifyOptions = {
  titulo: string;
  mensaje?: string;
  textoAceptar?: string;
  tono?: Tono;
};

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;
type NotifyFn = (opts: NotifyOptions) => Promise<void>;

type ContextValue = {
  confirm: ConfirmFn;
  notify: NotifyFn;
};

const ConfirmContext = createContext<ContextValue | null>(null);

type DialogState =
  | { modo: "confirm"; opts: ConfirmOptions }
  | { modo: "notify"; opts: NotifyOptions };

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DialogState | null>(null);
  const resolverRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    setState({ modo: "confirm", opts: options });
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const notify = useCallback<NotifyFn>((options) => {
    setState({ modo: "notify", opts: options });
    setOpen(true);
    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve();
    });
  }, []);

  const cerrar = useCallback((valor: boolean) => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setOpen(false);
    if (r) r(valor);
  }, []);

  const valor = useMemo<ContextValue>(
    () => ({ confirm, notify }),
    [confirm, notify]
  );

  const dialogProps = (() => {
    if (!state) {
      return {
        titulo: "",
        mensaje: undefined as string | undefined,
        textoConfirmar: undefined,
        textoCancelar: undefined,
        tono: "danger" as Tono,
        confirmacionEscrita: undefined,
        soloAceptar: false,
      };
    }
    if (state.modo === "confirm") {
      return {
        titulo: state.opts.titulo,
        mensaje: state.opts.mensaje,
        textoConfirmar: state.opts.textoConfirmar,
        textoCancelar: state.opts.textoCancelar,
        tono: state.opts.tono ?? "danger",
        confirmacionEscrita: state.opts.confirmacionEscrita,
        soloAceptar: false,
      };
    }
    return {
      titulo: state.opts.titulo,
      mensaje: state.opts.mensaje,
      textoConfirmar: state.opts.textoAceptar ?? "Entendido",
      textoCancelar: undefined,
      tono: state.opts.tono ?? "info",
      confirmacionEscrita: undefined,
      soloAceptar: true,
    };
  })();

  return (
    <ConfirmContext.Provider value={valor}>
      {children}
      <ConfirmDialog
        open={open}
        titulo={dialogProps.titulo}
        mensaje={dialogProps.mensaje}
        textoConfirmar={dialogProps.textoConfirmar}
        textoCancelar={dialogProps.textoCancelar}
        tono={dialogProps.tono}
        confirmacionEscrita={dialogProps.confirmacionEscrita}
        soloAceptar={dialogProps.soloAceptar}
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
  return ctx.confirm;
}

/**
 * Hook para mostrar un aviso al usuario con el modal del CRM (un solo botón).
 *
 * Reemplazo directo de `window.alert`:
 *
 *   const notify = useNotify();
 *   await notify({ titulo: "Listo", mensaje: "Tu acción se completó." });
 */
export function useNotify(): NotifyFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      "useNotify debe usarse dentro de <ConfirmProvider> (revisar root layout)."
    );
  }
  return ctx.notify;
}

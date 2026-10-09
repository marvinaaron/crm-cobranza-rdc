"use client";

import { useEffect, useState } from "react";

type Tono = "danger" | "warning" | "info";

type Props = {
  open: boolean;
  titulo: string;
  mensaje?: string;
  /** Texto del botón principal (acción a confirmar). */
  textoConfirmar?: string;
  textoCancelar?: string;
  tono?: Tono;
  /** Si lo defines, el usuario debe escribir ESTE texto para habilitar el botón. */
  confirmacionEscrita?: string;
  /** Si true, oculta el botón cancelar (modo alerta de un solo botón). */
  soloAceptar?: boolean;
  onConfirmar: () => void | Promise<void>;
  onCancelar: () => void;
};

const ESTILOS_TONO: Record<
  Tono,
  {
    icono: React.ReactNode;
    chip: string;
    boton: string;
  }
> = {
  danger: {
    icono: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    chip: "bg-rose-100 text-rose-700",
    boton: "bg-rose-600 hover:bg-rose-700 text-white",
  },
  warning: {
    icono: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
    chip: "bg-amber-100 text-amber-700",
    boton: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  info: {
    icono: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
    chip: "bg-indigo-100 text-indigo-700",
    boton: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
};

export default function ConfirmDialog({
  open,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  tono = "danger",
  confirmacionEscrita,
  soloAceptar = false,
  onConfirmar,
  onCancelar,
}: Props) {
  const [pendiente, setPendiente] = useState(false);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (open) setTexto("");
  }, [open]);

  // Bloquea el scroll del fondo mientras el diálogo está abierto.
  useEffect(() => {
    if (!open) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [open]);

  if (!open) return null;

  const requiereTexto = Boolean(confirmacionEscrita);
  const textoCoincide =
    !requiereTexto || texto.trim() === confirmacionEscrita?.trim();
  const puedeConfirmar = !pendiente && textoCoincide;

  const estilo = ESTILOS_TONO[tono];

  async function handleConfirm() {
    if (!puedeConfirmar) return;
    setPendiente(true);
    try {
      await onConfirmar();
    } finally {
      setPendiente(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onCancelar}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-7 pt-10 shadow-2xl ring-1 ring-slate-200"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* X de cerrar en esquina superior derecha */}
        <button
          type="button"
          onClick={onCancelar}
          disabled={pendiente}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${estilo.chip}`}
            aria-hidden
          >
            {estilo.icono}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              {titulo}
            </h3>
            {mensaje ? (
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {mensaje}
              </p>
            ) : null}
          </div>
        </div>

        {requiereTexto ? (
          <div className="mt-5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Escribe{" "}
              <span className="font-mono text-rose-600">
                {confirmacionEscrita}
              </span>{" "}
              para continuar
            </label>
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-slate-900"
              autoFocus
            />
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          {!soloAceptar && (
            <button
              type="button"
              onClick={onCancelar}
              disabled={pendiente}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              {textoCancelar}
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!puedeConfirmar}
            className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-50 ${estilo.boton}`}
          >
            {pendiente ? "Procesando…" : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

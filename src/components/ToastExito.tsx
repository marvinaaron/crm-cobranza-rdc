"use client";

import { useEffect, useState } from "react";

type Props = {
  visible: boolean;
  mensaje?: string;
  /** ms antes de auto-cerrar. Default 2000. */
  duracion?: number;
  onClose?: () => void;
};

/**
 * Toast flotante con animación de palomita verde para feedback de éxito.
 * Se auto-cierra después de `duracion` ms.
 */
export default function ToastExito({
  visible,
  mensaje = "Hecho",
  duracion = 2000,
  onClose,
}: Props) {
  const [mostrar, setMostrar] = useState(false);
  const [dibujado, setDibujado] = useState(false);

  useEffect(() => {
    if (!visible) {
      setMostrar(false);
      setDibujado(false);
      return;
    }
    const t1 = requestAnimationFrame(() => setMostrar(true));
    const t2 = setTimeout(() => setDibujado(true), 120);
    const t3 = setTimeout(() => {
      setMostrar(false);
      setTimeout(() => onClose?.(), 220);
    }, duracion);

    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible, duracion, onClose]);

  if (!visible) return null;

  return (
    <div
      aria-live="polite"
      className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
    >
      <div
        className={`pointer-events-auto flex flex-col items-center gap-3 rounded-3xl bg-white px-10 py-7 shadow-2xl ring-1 ring-emerald-100 transition-all duration-200 ${
          mostrar ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M5 12l5 5 9-11"
              style={{
                strokeDasharray: 30,
                strokeDashoffset: dibujado ? 0 : 30,
                transition: "stroke-dashoffset 360ms cubic-bezier(0.5, 0, 0.2, 1)",
              }}
            />
          </svg>
        </div>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-700">
          {mensaje}
        </p>
      </div>
    </div>
  );
}

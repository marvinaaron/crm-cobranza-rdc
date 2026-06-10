"use client";

import { useEffect, useRef, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import { esMismoPeriodo, periodoLabel } from "@/lib/clientes";
import PeriodoSelector from "@/components/PeriodoSelector";

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

type Props = {
  /** En cumplimiento usamos periodo fiscal (mes vencido). */
  modoFiscal?: boolean;
  /** Color del punto indicador y acento. Admin: violet · Portal: blue. */
  acento?: "violet" | "blue";
};

/**
 * Botón de calendario para el header móvil. Al pulsarlo despliega un panel
 * animado (mismo lenguaje que el menú "+" de la barra inferior) con el
 * selector de mes/año. Solo se usa en móvil; en escritorio el selector vive
 * en el sidebar.
 */
export default function PeriodoSelectorMovil({
  modoFiscal = false,
  acento = "violet",
}: Props) {
  const { periodo, periodoHoy, periodoFiscalVigente } = useClientes();

  const colorPunto = acento === "blue" ? "bg-blue-500" : "bg-violet-500";

  const [abierto, setAbierto] = useState(false);
  const [visible, setVisible] = useState(false);
  const cerrarTimer = useRef<number | null>(null);

  const referencia = modoFiscal ? periodoFiscalVigente : periodoHoy;
  const enReferencia = esMismoPeriodo(periodo, referencia);

  const abrir = () => {
    if (cerrarTimer.current) window.clearTimeout(cerrarTimer.current);
    setAbierto(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const cerrar = () => {
    setVisible(false);
    cerrarTimer.current = window.setTimeout(() => setAbierto(false), 180);
  };

  const toggle = () => (abierto ? cerrar() : abrir());

  // Limpieza del timer al desmontar.
  useEffect(() => {
    return () => {
      if (cerrarTimer.current) window.clearTimeout(cerrarTimer.current);
    };
  }, []);

  // Bloquea el scroll del body mientras el panel está abierto.
  useEffect(() => {
    if (!abierto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label="Cambiar periodo"
        aria-expanded={abierto}
        className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-50 active:scale-95 transition dark:text-slate-300 dark:hover:bg-white/5"
      >
        <CalendarIcon />
        {!enReferencia && (
          <span
            className={`absolute top-1 right-1 w-2 h-2 rounded-full ${colorPunto} ring-2 ring-white dark:ring-slate-900`}
          />
        )}
      </button>

      {abierto && (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={cerrar}
            className={`absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-200 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            className="absolute left-3 right-3 origin-top"
            style={{
              top: "calc(env(safe-area-inset-top) + 60px)",
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translateY(0) scale(1)"
                : "translateY(-10px) scale(0.96)",
              transition:
                "transform 240ms cubic-bezier(0.2,0.9,0.3,1.2), opacity 180ms ease",
            }}
          >
            <div className="mx-auto w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl shadow-slate-900/20 overflow-hidden pt-3">
              <PeriodoSelector modoFiscal={modoFiscal} />
              <button
                type="button"
                onClick={cerrar}
                className="w-full py-3 text-[12px] font-bold text-slate-500 dark:text-slate-300 border-t border-slate-100 dark:border-white/10 active:bg-slate-50 dark:active:bg-white/5 transition-colors"
              >
                Listo · {periodoLabel(periodo)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

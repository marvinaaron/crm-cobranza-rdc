"use client";

import { useState } from "react";

export type OpcionExportar = {
  id: string;
  label: string;
  onClick: () => void;
};

type Props = {
  opciones: OpcionExportar[];
  exportando?: boolean;
  disabled?: boolean;
  /** admin = pastilla Inicio; portal = navy del cliente. */
  tono?: "admin" | "portal";
  /** icono = solo símbolo + > (abre menú). */
  variante?: "texto" | "icono";
  className?: string;
};

function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform ${abierto ? "rotate-180" : ""}`}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function ChevronRight({ abierto }: { abierto: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-slate-400 transition-transform ${
        abierto ? "rotate-90" : ""
      }`}
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function BotonExportarMenu({
  opciones,
  exportando = false,
  disabled = false,
  tono = "admin",
  variante = "texto",
  className = "",
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const menu = opciones.length > 1;
  const icono = variante === "icono";
  const boton = icono
    ? "inline-flex items-center justify-center gap-0.5 h-10 pl-2.5 pr-2 rounded-full bg-white ring-1 ring-black/[0.06] text-slate-700 hover:bg-slate-50 disabled:opacity-50 shrink-0"
    : tono === "portal"
      ? "inline-flex items-center gap-1.5 h-11 px-4 rounded-xl text-[13px] font-semibold bg-[var(--portal-navy)] text-white hover:bg-[var(--portal-navy-hover)] disabled:opacity-40 whitespace-nowrap"
      : "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold bg-white ring-1 ring-black/[0.06] text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0";

  return (
    <div className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (!menu) {
            opciones[0]?.onClick();
            return;
          }
          setAbierto((v) => !v);
        }}
        disabled={exportando || disabled || opciones.length === 0}
        aria-label={exportando ? "Exportando" : "Exportar"}
        title="Exportar"
        aria-expanded={menu ? abierto : undefined}
        aria-haspopup={menu ? "menu" : undefined}
        className={boton}
      >
        {icono ? (
          <>
            <ShareIcon />
            {menu ? <ChevronRight abierto={abierto} /> : null}
          </>
        ) : (
          <>
            {exportando ? "Exportando…" : "Exportar"}
            {menu ? <Chevron abierto={abierto} /> : null}
          </>
        )}
      </button>
      {menu && abierto ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-20 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 z-30 w-44 rounded-2xl bg-white shadow-lg ring-1 ring-black/[0.06] overflow-hidden"
          >
            {opciones.map((op, i) => (
              <button
                key={op.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setAbierto(false);
                  op.onClick();
                }}
                className={`w-full px-4 py-3 text-left text-[15px] text-slate-800 hover:bg-slate-50 ${
                  i > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

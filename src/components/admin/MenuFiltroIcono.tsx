"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { adminBtnIcono } from "@/components/admin/AdminPageHeading";

export type FiltroOpcion = {
  id: string;
  label: string;
  count?: number;
  dotClass?: string;
};

export type FiltroGrupo = {
  titulo?: string;
  modo: "single" | "multiple";
  opciones: FiltroOpcion[];
  seleccion: string[];
  onChange: (ids: string[]) => void;
  /** En single, el valor que no cuenta como “filtro activo”. */
  valorPorDefecto?: string;
};

type Props = {
  grupos: FiltroGrupo[];
  ariaLabel?: string;
};

const MENU_W = 224;

function Check({ on }: { on: boolean }) {
  return (
    <span
      className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
        on ? "bg-indigo-600 text-white" : "border-[1.5px] border-slate-300 bg-white"
      }`}
      aria-hidden
    >
      {on ? (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : null}
    </span>
  );
}

export default function MenuFiltroIcono({
  grupos,
  ariaLabel = "Filtrar",
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const recalcular = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const left = Math.min(
      Math.max(8, r.right - MENU_W),
      window.innerWidth - MENU_W - 8
    );
    const maxH = Math.min(320, window.innerHeight - 24);
    let top = r.bottom + 8;
    if (top + 160 > window.innerHeight - 8) {
      top = Math.max(8, r.top - maxH - 8);
    }
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (abierto) recalcular();
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = () => setAbierto(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    const onScroll = (e: Event) => {
      const t = e.target;
      if (t instanceof Node && menuRef.current?.contains(t)) return;
      cerrar();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", cerrar);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", cerrar);
      document.removeEventListener("keydown", onKey);
    };
  }, [abierto]);

  const resumenActivos: string[] = [];
  let tieneFiltro = false;
  for (const g of grupos) {
    if (g.modo === "single") {
      const actual = g.seleccion[0];
      if (actual && actual !== (g.valorPorDefecto ?? "")) {
        tieneFiltro = true;
        const op = g.opciones.find((o) => o.id === actual);
        if (op) resumenActivos.push(op.label);
      }
    } else if (g.seleccion.length > 0) {
      tieneFiltro = true;
      for (const id of g.seleccion) {
        const op = g.opciones.find((o) => o.id === id);
        if (op) resumenActivos.push(op.label);
      }
    }
  }

  return (
    <div className="relative flex items-center gap-1.5 min-w-0">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label={ariaLabel}
        title="Filtrar"
        className={adminBtnIcono}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="10" y1="17" x2="14" y2="17" />
        </svg>
        {tieneFiltro ? (
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-600" />
        ) : null}
      </button>
      {tieneFiltro && resumenActivos.length > 0 ? (
        <p className="hidden lg:block min-w-0 max-w-[12rem] truncate text-[12px] font-semibold text-slate-500">
          {resumenActivos.join(" · ")}
        </p>
      ) : null}

      {abierto &&
        pos &&
        createPortal(
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-[90] cursor-default"
              onClick={() => setAbierto(false)}
            />
            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[95] w-56 max-h-[min(20rem,calc(100dvh-1.5rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
              style={{ top: pos.top, left: pos.left }}
            >
              {grupos.map((g, gi) => (
                <div
                  key={g.titulo ?? String(gi)}
                  className={gi > 0 ? "mt-1.5 border-t border-slate-100 pt-1.5" : ""}
                >
                  {g.titulo ? (
                    <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {g.titulo}
                    </p>
                  ) : null}
                  {g.opciones.map((op) => {
                    const on = g.seleccion.includes(op.id);
                    return (
                      <button
                        key={op.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          if (g.modo === "single") {
                            g.onChange([op.id]);
                            setAbierto(false);
                            return;
                          }
                          const next = on
                            ? g.seleccion.filter((id) => id !== op.id)
                            : [...g.seleccion, op.id];
                          g.onChange(next);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left hover:bg-slate-50"
                      >
                        <Check on={on} />
                        {op.dotClass ? (
                          <span className={`w-1.5 h-1.5 rounded-full ${op.dotClass}`} />
                        ) : null}
                        <span className="flex-1 text-[13px] font-medium text-slate-800 truncate">
                          {op.label}
                        </span>
                        {op.count != null ? (
                          <span className="text-[12px] tabular-nums text-slate-400">
                            {op.count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

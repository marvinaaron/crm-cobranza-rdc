"use client";

import { useRef, useState } from "react";
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
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({
    top: 0,
    right: 0,
  });

  const abrir = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      setMenuPos({
        top: r.bottom + 8,
        right: Math.max(8, window.innerWidth - r.right),
      });
    }
    setAbierto((v) => !v);
  };

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
        onClick={abrir}
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

      {abierto ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setAbierto(false)}
          />
          <div
            className="fixed z-[80] w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
            style={{ top: menuPos.top, right: menuPos.right }}
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
        </>
      ) : null}
    </div>
  );
}

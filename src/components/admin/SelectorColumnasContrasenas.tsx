"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CATEGORIAS_HEADER,
  COLUMNAS_TOGGLEABLES,
  contarColumnasContrasenasVisibles,
  columnasContrasenasPorDefecto,
  type CategoriaAcceso,
  type ColumnaContrasenasKey,
} from "@/lib/accesos/contrasenas";

type Props = {
  visibles: Record<ColumnaContrasenasKey, boolean>;
  onChange: (next: Record<ColumnaContrasenasKey, boolean>) => void;
};

export default function SelectorColumnasContrasenas({ visibles, onChange }: Props) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { activas, total } = contarColumnasContrasenasVisibles(visibles);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, [abierto]);

  const toggle = useCallback(
    (key: ColumnaContrasenasKey) => {
      onChange({ ...visibles, [key]: !visibles[key] });
    },
    [onChange, visibles]
  );

  const toggleCategoria = useCallback(
    (cat: CategoriaAcceso, mostrar: boolean) => {
      const next = { ...visibles };
      for (const col of COLUMNAS_TOGGLEABLES) {
        if (col.categoria === cat) next[col.key] = mostrar;
      }
      onChange(next);
    },
    [onChange, visibles]
  );

  const mostrarTodas = useCallback(() => {
    onChange(columnasContrasenasPorDefecto());
  }, [onChange]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full ring-1 text-[13px] font-semibold transition-colors ${
          abierto
            ? "ring-slate-300 bg-slate-50 text-slate-800"
            : "ring-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="3" width="7" height="18" rx="1" />
          <rect x="14" y="3" width="7" height="10" rx="1" />
        </svg>
        Columnas ({activas}/{total})
      </button>

      {abierto && (
        <div className="absolute left-0 top-full mt-2 z-50 w-[min(100vw-2rem,20rem)] rounded-[1.25rem] bg-white shadow-xl ring-1 ring-black/[0.06] p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-slate-400">
              Mostrar columnas
            </p>
            <button
              type="button"
              onClick={mostrarTodas}
              className="text-[13px] font-semibold text-slate-600 hover:text-slate-900"
            >
              Todas
            </button>
          </div>

          {CATEGORIAS_HEADER.map((cat) => {
            const cols = COLUMNAS_TOGGLEABLES.filter((c) => c.categoria === cat.id);
            if (cols.length === 0) return null;
            const todasOn = cols.every((c) => visibles[c.key]);
            const ningunaOn = cols.every((c) => !visibles[c.key]);

            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => toggleCategoria(cat.id, !todasOn)}
                    className="text-[13px] font-semibold text-slate-800 hover:text-slate-950"
                  >
                    {cat.label}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCategoria(cat.id, true)}
                      disabled={todasOn}
                      className="text-[12px] font-semibold text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCategoria(cat.id, false)}
                      disabled={ningunaOn}
                      className="text-[12px] font-semibold text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      −
                    </button>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {cols.map((col) => (
                    <li key={col.key}>
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={visibles[col.key]}
                          onChange={() => toggle(col.key)}
                          className="rounded border-slate-300 text-slate-800 focus:ring-slate-200"
                        />
                        <span className="text-[13px] text-slate-700 group-hover:text-slate-900">
                          {col.label}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <p className="text-[12px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
            Régimen y Cliente siempre visibles. Tu selección se guarda en este navegador.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { type Cliente, type Periodo } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import {
  type CategoriaId,
  CATEGORIA_META,
  type RegistroCumplimiento,
  formatMontoImpuesto,
  formatFechaLimiteImpuestoCorta,
  getSubtotalCategoria,
} from "@/lib/cumplimiento";
import {
  categoriasConPagoEnPreview,
  categoriaPreviewValidadaPorCliente,
  getFechaLimiteCategoria,
} from "@/lib/config-cumplimiento-cliente";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  registro: RegistroCumplimiento;
};

export default function PrevioValidacionCategorias({
  cliente,
  periodo,
  registro,
}: Props) {
  const { confirmarPreviewCliente, confirmarPreviewCategoria } = useClientes();
  const [confirmando, setConfirmando] = useState<CategoriaId | "todos" | null>(null);
  const [mensajeOk, setMensajeOk] = useState(false);

  const categorias = categoriasConPagoEnPreview(cliente, registro);
  const todasValidadas = categorias.every((cat) =>
    categoriaPreviewValidadaPorCliente(registro, cat)
  );

  const onValidarCategoria = (cat: CategoriaId) => {
    setConfirmando(cat);
    confirmarPreviewCategoria(cliente.id, periodo, cat);
    setConfirmando(null);
  };

  const onValidarTodos = () => {
    setConfirmando("todos");
    confirmarPreviewCliente(cliente.id, periodo);
    setConfirmando(null);
    setMensajeOk(true);
    setTimeout(() => setMensajeOk(false), 4000);
  };

  return (
    <div className="space-y-5">
      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
        Revise cada concepto y confírmelo por separado, o valide todos con un solo clic.
      </p>

      <div
        className={`grid gap-3 ${
          categorias.length === 1
            ? "grid-cols-1 max-w-sm"
            : categorias.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {categorias.map((cat) => {
          const meta = CATEGORIA_META[cat];
          const monto = getSubtotalCategoria(registro, cat);
          const fechaLim = getFechaLimiteCategoria(registro, cat);
          const validada = categoriaPreviewValidadaPorCliente(registro, cat);
          const cargando = confirmando === cat;

          return (
            <div
              key={cat}
              className={`flex flex-col rounded-xl border p-3.5 sm:p-4 min-h-[200px] transition-all ${meta.border} ${meta.bg} ${
                validada ? "ring-2 ring-emerald-400/50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p
                  className={`text-[9px] font-black uppercase tracking-wide leading-tight ${meta.accent}`}
                >
                  {meta.label}
                </p>
                {validada && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[7px] font-black uppercase">
                    OK
                  </span>
                )}
              </div>

              <p className={`text-2xl sm:text-3xl font-black tabular-nums leading-none my-2 ${meta.accent}`}>
                {formatMontoImpuesto(monto)}
              </p>

              {fechaLim && (
                <p className="text-[9px] font-bold text-slate-500 mb-3 leading-snug">
                  Vence {formatFechaLimiteImpuestoCorta(fechaLim)}
                </p>
              )}

              <button
                type="button"
                disabled={validada || cargando || confirmando === "todos"}
                onClick={() => onValidarCategoria(cat)}
                className={`mt-auto w-full py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                  validada
                    ? "bg-emerald-100 text-emerald-800 cursor-default"
                    : "bg-white/90 border border-slate-200/80 text-slate-800 hover:bg-white"
                }`}
              >
                {cargando
                  ? "…"
                  : validada
                    ? "Confirmado"
                    : "Confirmo"}
              </button>
            </div>
          );
        })}
      </div>

      {!todasValidadas && (
        <button
          type="button"
          disabled={confirmando !== null}
          onClick={onValidarTodos}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50"
        >
          {confirmando === "todos"
            ? "Guardando…"
            : "Confirmar todos los importes"}
        </button>
      )}

      {(mensajeOk || todasValidadas) && (
        <p className="text-[11px] font-bold text-emerald-600 text-center">
          Gracias. El despacho ya puede publicar su documentación fiscal.
        </p>
      )}
    </div>
  );
}

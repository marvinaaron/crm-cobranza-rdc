"use client";

import { useState } from "react";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
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
  getFechaLimiteCategoria,
} from "@/lib/config-cumplimiento-cliente";
import { useClientes } from "@/context/ClientesContext";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  registro: RegistroCumplimiento;
  /** Ya se registró que el cliente vio el previo (paso completado). */
  visto?: boolean;
  /** Solo el bloque de duda (sin repetir tarjetas de monto). */
  soloDuda?: boolean;
};

/**
 * Resumen de importes del previo. El paso se completa al ver el banner;
 * aquí el cliente puede, si duda, avisar al despacho o confirmar un concepto.
 */
export default function PrevioValidacionCategorias({
  cliente,
  periodo,
  registro,
  visto = false,
  soloDuda = false,
}: Props) {
  const { confirmarPreviewCategoria, agregarNotificacion } = useClientes();
  const [mostrarDuda, setMostrarDuda] = useState(soloDuda);
  const [avisoEnviado, setAvisoEnviado] = useState(false);
  const [confirmando, setConfirmando] = useState<CategoriaId | null>(null);

  const categorias = categoriasConPagoEnPreview(cliente, registro);

  const avisarDuda = () => {
    agregarNotificacion({
      tipo: "cliente_duda_previo",
      destinatario: "admin",
      clienteId: cliente.id,
      periodo,
      titulo: `❓ ${cliente.razonSocial} tiene duda del previo · ${periodoLabel(periodo)}`,
      detalle:
        "El cliente revisó los importes y pidió validar/explicar el monto. Contáctalo.",
      href: "/cumplimiento",
    });
    setAvisoEnviado(true);
  };

  const confirmarCategoria = (cat: CategoriaId) => {
    setConfirmando(cat);
    confirmarPreviewCategoria(cliente.id, periodo, cat);
    setConfirmando(null);
  };

  const bloqueDuda = (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-3">
      <button
        type="button"
        onClick={() => setMostrarDuda((v) => !v)}
        className="w-full text-left text-[11px] font-black text-slate-700 uppercase tracking-widest"
      >
        {mostrarDuda && !soloDuda ? "Ocultar opciones · " : ""}¿Duda del importe?
      </button>
      {mostrarDuda && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
            {soloDuda
              ? "Si un monto no te cuadra, avisa a tu contador para que te lo explique."
              : "Puedes confirmar concepto por concepto arriba, o avisar a tu contador para que te explique el monto."}
          </p>
          {avisoEnviado ? (
            <p className="text-[11px] font-bold text-emerald-600 text-center">
              Aviso enviado. Tu contador te contactará.
            </p>
          ) : (
            <button
              type="button"
              onClick={avisarDuda}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-amber-600"
            >
              Avisar duda a mi contador
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (soloDuda) {
    return bloqueDuda;
  }

  return (
    <div className="space-y-5">
      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
        {visto
          ? "Ya registramos que viste estos importes. Si algo no te cuadra, puedes pedir aclaración."
          : "Estos son los importes de tu periodo."}
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
        {categorias.map((cat: CategoriaId) => {
          const meta = CATEGORIA_META[cat];
          const monto = getSubtotalCategoria(registro, cat);
          const fechaLim = getFechaLimiteCategoria(registro, cat);

          return (
            <div
              key={cat}
              className={`flex flex-col rounded-xl border p-3.5 sm:p-4 min-h-[140px] transition-all ${meta.border} ${meta.bg} ${
                visto ? "ring-2 ring-emerald-400/40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p
                  className={`text-[9px] font-black uppercase tracking-wide leading-tight ${meta.accent}`}
                >
                  {meta.label}
                </p>
                {visto && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[7px] font-black uppercase">
                    Visto
                  </span>
                )}
              </div>

              <p
                className={`text-2xl sm:text-3xl font-black tabular-nums leading-none my-2 ${meta.accent}`}
              >
                {formatMontoImpuesto(monto)}
              </p>

              {fechaLim && (
                <p className="text-[9px] font-bold text-slate-500 leading-snug">
                  Vence {formatFechaLimiteImpuestoCorta(fechaLim)}
                </p>
              )}

              {mostrarDuda && (
                <button
                  type="button"
                  disabled={confirmando === cat}
                  onClick={() => confirmarCategoria(cat)}
                  className="mt-auto pt-3 w-full py-2 rounded-lg bg-white/90 border border-slate-200/80 text-[8px] font-black uppercase tracking-widest text-slate-700 hover:bg-white disabled:opacity-50"
                >
                  {confirmando === cat ? "…" : "Confirmo este importe"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {bloqueDuda}
    </div>
  );
}

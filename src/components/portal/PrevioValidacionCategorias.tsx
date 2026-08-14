"use client";

import { useMemo, useState } from "react";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import {
  type CategoriaId,
  CATEGORIA_META,
  type RegistroCumplimiento,
  formatMontoImpuesto,
  formatFechaLimiteImpuestoCorta,
  getSubtotalCategoria,
  clientePidioLineaCaptura,
  previoPausadoPorDuda,
} from "@/lib/cumplimiento";
import {
  categoriasConPagoEnPreview,
  getFechaLimiteCategoria,
} from "@/lib/config-cumplimiento-cliente";
import { useClientes } from "@/context/ClientesContext";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import { usePortalContadorAsignado } from "@/components/portal/usePortalContadorAsignado";
import { mensajeWhatsAppPortal, waLinkPortal } from "@/lib/portal/whatsapp";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  registro: RegistroCumplimiento;
  /** Ya se registró que el cliente vio el previo (paso completado). */
  visto?: boolean;
  /** Solo los botones de acción (sin repetir tarjetas de monto). */
  soloDuda?: boolean;
};

export default function PrevioValidacionCategorias({
  cliente,
  periodo,
  registro,
  visto = false,
  soloDuda = false,
}: Props) {
  const { pedirLineaCapturaCliente, marcarDudaPrevioCliente, agregarNotificacion } =
    useClientes();
  const { cliente: sesion } = usePortalAuth();
  const { perfil } = usePortalPerfil();
  const { contador } = usePortalContadorAsignado();
  const [avisoDuda, setAvisoDuda] = useState(false);
  const [pidiendoLinea, setPidiendoLinea] = useState(false);

  const pidioLinea = clientePidioLineaCaptura(registro);
  const pausadoPorDuda = previoPausadoPorDuda(registro);
  const categorias = categoriasConPagoEnPreview(cliente, registro);
  const labelPeriodo = periodoLabel(periodo);

  const nombreCliente =
    perfil?.perfil.nombre?.trim() ||
    sesion?.razonSocial?.split(/[ ,]/)[0] ||
    cliente.razonSocial.split(/[ ,]/)[0] ||
    undefined;

  const urlDudaWhatsApp = useMemo(() => {
    const msg = mensajeWhatsAppPortal("duda_impuestos", {
      nombre: nombreCliente,
      periodo: labelPeriodo,
    });
    return waLinkPortal(contador?.telefono, msg);
  }, [nombreCliente, labelPeriodo, contador?.telefono]);

  const pedirLinea = () => {
    if (pidioLinea || pidiendoLinea) return;
    setPidiendoLinea(true);
    pedirLineaCapturaCliente(cliente.id, periodo);
    setPidiendoLinea(false);
  };

  const avisarDuda = () => {
    marcarDudaPrevioCliente(cliente.id, periodo);
    if (!avisoDuda) {
      agregarNotificacion({
        tipo: "cliente_duda_previo",
        destinatario: "admin",
        clienteId: cliente.id,
        periodo,
        titulo: `❓ ${cliente.razonSocial} tiene duda del importe · ${labelPeriodo}`,
        detalle:
          "Declaración en pausa. El cliente te escribe por WhatsApp. Márcalo para continuar si quieres saltar la espera.",
        href: "/cumplimiento",
      });
      setAvisoDuda(true);
    }
  };

  const acciones = (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {pidioLinea && !pausadoPorDuda ? (
        <p className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-center text-[12px] font-bold text-emerald-800 leading-snug">
          Pediste tu línea de captura. Tu contador está preparando declaración y
          documentos.
        </p>
      ) : (
        <button
          type="button"
          disabled={pidiendoLinea}
          onClick={pedirLinea}
          className="w-full py-3.5 rounded-xl bg-[var(--portal-navy)] text-white text-[11px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
        >
          Quiero mi línea de captura
        </button>
      )}
      <a
        href={urlDudaWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={avisarDuda}
        className={`flex items-center justify-center w-full py-3.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest ${
          pausadoPorDuda || avisoDuda
            ? "border-amber-500 bg-amber-100 text-amber-950"
            : "border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100"
        } ${pidioLinea ? "sm:col-span-2" : ""}`}
      >
        {pausadoPorDuda || avisoDuda
          ? "Duda enviada · WhatsApp"
          : "Duda del importe"}
      </a>
    </div>
  );

  if (soloDuda) {
    return acciones;
  }

  return (
    <div className="space-y-5">
      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
        {visto
          ? "Ya registramos que viste estos importes. Pide tu línea de captura o escríbenos si algo no te cuadra."
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
            </div>
          );
        })}
      </div>

      {acciones}
    </div>
  );
}

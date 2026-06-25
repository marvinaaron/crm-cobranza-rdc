"use client";

import { useMemo } from "react";
import { type Periodo, periodoLabel } from "@/lib/clientes";
import {
  type CategoriaId,
  type FlujoCumplimiento,
  type RegistroCumplimiento,
  getFlujoCumplimiento,
  esSinPagoImpuestos,
  previewPublicado,
  clienteConfirmoPreview,
  todosPagosValidados,
} from "@/lib/cumplimiento";
import { categoriasVencidasSinPago } from "@/lib/cumplimiento-categorias";
import Fiscalino from "@/components/Fiscalino";

type Props = {
  periodo: Periodo;
  registro: RegistroCumplimiento | undefined;
  catsCliente: CategoriaId[];
  hayExtemporaneo: boolean;
};

type BannerConfig = {
  titulo: string;
  detalle: string;
  cta?: string;
  anchor?: string;
  tono: "ok" | "warn" | "neutral";
  icono: "doc" | "upload" | "clock" | "check";
};

const ICONOS: Record<BannerConfig["icono"], React.ReactNode> = {
  doc: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15l2 2 4-4" /></svg>
  ),
  upload: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
  ),
};

function configDesdeFlujo(
  flujo: FlujoCumplimiento,
  periodo: Periodo,
  registro: RegistroCumplimiento | undefined,
  hayExtemporaneo: boolean
): BannerConfig | null {
  const label = periodoLabel(periodo);

  if (hayExtemporaneo) {
    return {
      titulo: "Pago extemporáneo disponible",
      detalle:
        "El plazo ordinario venció. Revisa la nueva línea de captura y sube tu comprobante cuando pagues.",
      cta: "Ver extemporáneo",
      anchor: "pago-extemporaneo",
      tono: "warn",
      icono: "upload",
    };
  }

  const impuestosVencidos =
    registro != null && categoriasVencidasSinPago(registro).length > 0;

  switch (flujo) {
    case "preliminar":
      return {
        titulo: "Tu preliminar de impuestos está listo",
        detalle: `Revísalo y apruébalo para que preparemos tus declaraciones de ${label}.`,
        cta: "Revisar ahora",
        anchor: "previo-validacion",
        tono: "warn",
        icono: "doc",
      };
    case "declaraciones":
      return {
        titulo: "Sube tu comprobante de pago",
        detalle: impuestosVencidos
          ? "La fecha límite ya pasó. Carga tu comprobante o escríbenos para regularizarte."
          : "Tus declaraciones ya están listas. Solo falta confirmar el pago.",
        cta: "Confirmar mi pago",
        anchor: "documentos-periodo",
        tono: impuestosVencidos ? "warn" : "warn",
        icono: "upload",
      };
    case "pago":
      return {
        titulo: "Estamos validando tu comprobante",
        detalle: "Recibimos tu pago. Tu contador lo revisará y te avisará cuando quede confirmado.",
        cta: "Ver documentos",
        anchor: "documentos-periodo",
        tono: "neutral",
        icono: "clock",
      };
    case "aceptacion":
      return {
        titulo: "Preliminar aprobado",
        detalle: `Aceptaste los importes de ${label}. Estamos preparando tus declaraciones.`,
        tono: "neutral",
        icono: "clock",
      };
    case "completado":
      if (esSinPagoImpuestos(registro)) {
        return {
          titulo: `Periodo ${label} sin impuestos a pagar`,
          detalle: "No hubo obligación fiscal este mes. Tu contador ya cerró el periodo.",
          tono: "ok",
          icono: "check",
        };
      }
      return null;
    case "iniciando_contabilidad":
      return {
        titulo: `Preparando el cierre de ${label}`,
        detalle: "Tu contador está trabajando en tu contabilidad. Te avisaremos cuando el preliminar esté listo.",
        tono: "neutral",
        icono: "clock",
      };
  }

  if (!previewPublicado(registro)) {
    return {
      titulo: `Preparando el cierre de ${label}`,
      detalle: "Tu contador aún no ha publicado el previo de impuestos. Te notificaremos cuando esté listo.",
      tono: "neutral",
      icono: "clock",
    };
  }

  return {
    titulo: `Cierre de ${label} en curso`,
    detalle: "Tu contador está avanzando con los documentos del periodo.",
    tono: "neutral",
    icono: "clock",
  };
}

function scrollToAnchor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function PortalCumplimientoBanner({
  periodo,
  registro,
  catsCliente,
  hayExtemporaneo,
}: Props) {
  const flujo = useMemo(() => getFlujoCumplimiento(registro), [registro]);

  const alCorriente = useMemo(
    () =>
      registro != null &&
      clienteConfirmoPreview(registro) &&
      todosPagosValidados(registro, catsCliente),
    [registro, catsCliente]
  );

  const config = useMemo(() => {
    if (alCorriente) return null;
    return configDesdeFlujo(flujo, periodo, registro, hayExtemporaneo);
  }, [alCorriente, flujo, periodo, registro, hayExtemporaneo]);

  if (!config) return null;

  const { titulo, detalle, cta, anchor, tono, icono } = config;
  const urgente = tono === "warn" && flujo === "declaraciones" && categoriasVencidasSinPago(registro ?? undefined).length > 0;

  if (tono === "ok") {
    return (
      <div className="flex items-center gap-4 rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-5 py-4 sm:px-6 sm:py-5">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          {ICONOS.check}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
            {titulo}
          </p>
          <p className="text-sm font-bold text-emerald-600 leading-snug mt-0.5">
            {detalle}
          </p>
        </div>
        <Fiscalino mood="confident" size={64} className="shrink-0 -my-2 hidden sm:block" />
      </div>
    );
  }

  const fondo =
    tono === "warn"
      ? urgente
        ? "rdc-glass-alert-red border-red-100 bg-red-50/70"
        : "rdc-glass-alert-orange border-amber-100 bg-amber-50/70"
      : "border-slate-100 bg-slate-50/80";
  const iconBg =
    tono === "warn" ? (urgente ? "bg-red-500" : "bg-amber-500") : "bg-[var(--portal-navy)]";
  const btnCls =
    tono === "warn"
      ? urgente
        ? "bg-red-600 hover:bg-red-700"
        : "bg-amber-500 hover:bg-amber-600"
      : "bg-[var(--portal-navy)] hover:bg-[var(--portal-navy-hover)]";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 rounded-[1.25rem] border px-4 py-3 sm:px-5 sm:py-3.5 ${fondo}`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${iconBg}`}>
          {ICONOS[icono]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-black text-slate-800 leading-snug">{titulo}</p>
          <p
            className={`text-[11px] font-bold leading-snug mt-1 ${
              urgente ? "text-red-600" : "text-slate-500"
            }`}
          >
            {detalle}
          </p>
        </div>
      </div>
      {cta && anchor && (
        <button
          type="button"
          onClick={() => scrollToAnchor(anchor)}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-white text-[11px] font-black uppercase tracking-widest transition-colors shrink-0 ${btnCls}`}
        >
          {cta}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
        </button>
      )}
    </div>
  );
}

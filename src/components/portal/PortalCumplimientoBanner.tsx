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
import { useMarcarPrevioVistoAlVerBanner } from "@/hooks/useMarcarPrevioVistoAlVerBanner";

type Props = {
  periodo: Periodo;
  registro: RegistroCumplimiento | undefined;
  catsCliente: CategoriaId[];
  hayExtemporaneo: boolean;
  /** Si se pasa, ver este banner con preliminar marca el paso como visto. */
  clienteId?: number;
};

export type BannerAccionPortal = {
  titulo: string;
  detalle: string;
  cta?: string;
  anchor?: string;
  tono: "ok" | "warn" | "neutral";
  icono: "doc" | "upload" | "clock" | "check";
  urgente: boolean;
};

const ICONOS: Record<BannerAccionPortal["icono"], React.ReactNode> = {
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

/** Acción única del periodo (misma lógica que el banner). */
export function getAccionCumplimientoPortal(
  flujo: FlujoCumplimiento,
  periodo: Periodo,
  registro: RegistroCumplimiento | undefined,
  hayExtemporaneo: boolean
): Omit<BannerAccionPortal, "urgente"> | null {
  const label = periodoLabel(periodo);
  const impuestosVencidos =
    registro != null && categoriasVencidasSinPago(registro).length > 0;

  if (hayExtemporaneo) {
    return {
      titulo: "Pago extemporáneo disponible",
      detalle: "Nueva línea de captura lista. Paga y sube tu comprobante.",
      cta: "Ver extemporáneo",
      anchor: "pago-extemporaneo",
      tono: "warn",
      icono: "upload",
    };
  }

  switch (flujo) {
    case "preliminar":
      return {
        titulo: "Tu preliminar está listo",
        detalle: `Importes de ${label}. Al verlos queda registrado.`,
        cta: "Ver importes",
        anchor: "previo-validacion",
        tono: "warn",
        icono: "doc",
      };
    case "aceptacion":
      return {
        titulo: "Preliminar revisado",
        detalle: "Estamos preparando tus declaraciones. No necesitas hacer nada por ahora.",
        cta: "Ver resumen",
        anchor: "previo-validacion",
        tono: "neutral",
        icono: "clock",
      };
    case "declaraciones":
      return {
        titulo: impuestosVencidos
          ? "Falta tu comprobante de pago"
          : "Tu siguiente paso",
        detalle: impuestosVencidos
          ? "El plazo ya pasó. Sube tu comprobante o escríbenos."
          : "Declaraciones listas. Solo falta subir el comprobante del pago al SAT.",
        cta: "Subir comprobante",
        anchor: "documentos-periodo",
        tono: "warn",
        icono: "upload",
      };
    case "pago":
      return {
        titulo: "Estamos validando tu pago",
        detalle: "Recibimos tu comprobante. Te avisamos cuando quede confirmado.",
        cta: "Ver documentos",
        anchor: "documentos-periodo",
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
    case "por_trabajar":
      return {
        titulo: `Preparando el cierre de ${label}`,
        detalle: "Tu contador está en ello. Te avisamos cuando el preliminar esté listo.",
        tono: "neutral",
        icono: "clock",
      };
  }

  if (!previewPublicado(registro)) {
    return {
      titulo: `Preparando el cierre de ${label}`,
      detalle: "Aún no hay previo publicado. Te notificaremos cuando esté listo.",
      tono: "neutral",
      icono: "clock",
    };
  }

  return {
    titulo: `Cierre de ${label} en curso`,
    detalle: "Tu contador avanza con los documentos del periodo.",
    tono: "neutral",
    icono: "clock",
  };
}

export function scrollToAnchorCumplimiento(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function btnClasses(tono: BannerAccionPortal["tono"], urgente: boolean) {
  if (tono === "warn") {
    return urgente
      ? "bg-red-600 hover:bg-red-700"
      : "bg-amber-500 hover:bg-amber-600";
  }
  return "bg-[var(--portal-navy)] hover:bg-[var(--portal-navy-hover)]";
}

/** CTA fija al pie en móvil: repite la única acción del banner. */
export function PortalCtaFijaCumplimiento({
  cta,
  anchor,
  tono,
  urgente,
}: {
  cta: string;
  anchor: string;
  tono: BannerAccionPortal["tono"];
  urgente: boolean;
}) {
  return (
    <div className="lg:hidden sticky bottom-0 z-30 -mx-4 px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white to-white/80">
      <button
        type="button"
        onClick={() => scrollToAnchorCumplimiento(anchor)}
        className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 ${btnClasses(tono, urgente)}`}
      >
        {cta}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

export default function PortalCumplimientoBanner({
  periodo,
  registro,
  catsCliente,
  hayExtemporaneo,
  clienteId,
}: Props) {
  const flujo = useMemo(() => getFlujoCumplimiento(registro), [registro]);

  const alCorriente = useMemo(
    () =>
      registro != null &&
      clienteConfirmoPreview(registro) &&
      todosPagosValidados(registro, catsCliente),
    [registro, catsCliente]
  );

  const base = useMemo(() => {
    if (alCorriente) return null;
    return getAccionCumplimientoPortal(flujo, periodo, registro, hayExtemporaneo);
  }, [alCorriente, flujo, periodo, registro, hayExtemporaneo]);

  const urgente =
    !!base &&
    base.tono === "warn" &&
    flujo === "declaraciones" &&
    categoriasVencidasSinPago(registro ?? undefined).length > 0;

  const bannerPreliminarVisible =
    !!clienteId &&
    !!base &&
    (flujo === "preliminar" ||
      (previewPublicado(registro) && !clienteConfirmoPreview(registro)));

  useMarcarPrevioVistoAlVerBanner(
    clienteId ?? 0,
    periodo,
    registro,
    bannerPreliminarVisible
  );

  if (!base) return null;

  const { titulo, detalle, cta, anchor, tono, icono } = base;

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
        ? "rdc-glass-alert-red border-red-100 bg-red-50/80"
        : "rdc-glass-alert-orange border-amber-100 bg-amber-50/80"
      : "border-slate-100 bg-white/95";

  const iconBg =
    tono === "warn" ? (urgente ? "bg-red-500" : "bg-amber-500") : "bg-[var(--portal-navy)]";

  return (
    <div
      className={`sticky top-0 z-20 -mx-1 px-1 sm:static sm:mx-0 sm:px-0 sm:z-auto`}
    >
      <div
        className={`flex flex-col gap-3 rounded-[1.25rem] border px-4 py-3.5 sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:py-3.5 shadow-sm shadow-slate-900/5 backdrop-blur-md ${fondo}`}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${iconBg}`}
          >
            {ICONOS[icono]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              Tu siguiente paso
            </p>
            <p className="text-[14px] font-black text-slate-800 leading-snug">
              {titulo}
            </p>
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
            onClick={() => scrollToAnchorCumplimiento(anchor)}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2 rounded-xl text-white text-[11px] font-black uppercase tracking-widest transition-colors shrink-0 ${btnClasses(tono, urgente)}`}
          >
            {cta}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

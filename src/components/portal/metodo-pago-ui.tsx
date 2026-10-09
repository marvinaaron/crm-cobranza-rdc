"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { fmtMxn } from "@/components/portal/portal-ui";

export type MetodoPago = "transferencia" | "tarjeta";

export function MetodoCard({
  onSelect,
  titulo,
  subtitulo,
  etiquetaMarca,
  monto,
  tono,
  icono,
  badge,
}: {
  onSelect: () => void;
  titulo: string;
  subtitulo: string;
  etiquetaMarca?: string;
  monto: string;
  tono: "bbva" | "stripe";
  icono: ReactNode;
  badge?: string;
}) {
  const colorMarca =
    tono === "bbva" ? "text-[var(--bbva-brand)]" : "text-[var(--stripe-brand)]";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex flex-col items-center rounded-2xl border p-2.5 sm:p-3 pt-6 sm:pt-7 transition-all hover:shadow-md active:scale-[0.99] ${
        tono === "bbva"
          ? "border-[var(--bbva-brand-border)] bg-[var(--bbva-brand-soft)] hover:border-[var(--bbva-brand)] hover:shadow-[var(--bbva-brand)]/15"
          : "border-[var(--stripe-brand-border)] bg-[var(--stripe-brand-soft)] hover:border-[var(--stripe-brand)] hover:shadow-[var(--stripe-brand)]/20"
      }`}
    >
      {badge ? (
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--bbva-brand)] text-white whitespace-nowrap">
          {badge}
        </span>
      ) : (
        <span className="absolute top-2 left-1/2 -translate-x-1/2 h-[18px]" aria-hidden />
      )}

      <div className="flex w-full flex-col items-center gap-1.5 text-center">
        <span
          className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
            tono === "bbva"
              ? "bg-white/85 text-[var(--bbva-brand)] group-hover:bg-white ring-1 ring-[var(--bbva-brand-border)]"
              : "bg-white/80 text-[var(--stripe-brand)] group-hover:bg-white ring-1 ring-[var(--stripe-brand-border)]"
          }`}
        >
          {icono}
        </span>

        <div className="flex w-full flex-col justify-start gap-0.5">
          <p className="text-[10px] sm:text-[11px] font-black text-slate-800 leading-tight">
            {titulo}
          </p>
          <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 leading-snug line-clamp-2">
            {subtitulo}
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-0.5 pb-1">
          <p
            className={`text-lg sm:text-xl font-black tabular-nums leading-none tracking-tight ${colorMarca}`}
          >
            {monto}
          </p>
          {etiquetaMarca && (
            <p
              className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.14em] ${colorMarca}`}
            >
              {etiquetaMarca}
            </p>
          )}
        </div>
      </div>

      <ChevronSiguiente
        className={
          tono === "bbva"
            ? "text-[var(--bbva-brand)] group-hover:text-[var(--bbva-brand-hover)]"
            : "text-[var(--stripe-brand)] group-hover:text-[var(--stripe-brand-hover)]"
        }
      />
    </button>
  );
}

export function GridMetodosPago({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 sm:gap-3">{children}</div>;
}

export function ModalPagoSheet({
  metodo,
  titulo,
  subtituloAccion,
  montoDisplay,
  detalleTarjeta,
  onClose,
  children,
}: {
  metodo: MetodoPago;
  titulo: string;
  subtituloAccion: string;
  montoDisplay: number;
  detalleTarjeta?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const esTransferencia = metodo === "transferencia";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const modal = (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pago-titulo"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
      />

      <div className="rdc-glass-sheet rdc-sheet-anim relative w-full sm:max-w-lg max-h-[min(92vh,720px)] flex flex-col rounded-t-[2rem] sm:rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="rdc-sheet-handle mt-2.5 mb-0 sm:hidden shrink-0" aria-hidden />

        <div
          className={`shrink-0 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 border-b ${
            esTransferencia
              ? "bg-[var(--bbva-brand-soft)] border-[var(--bbva-brand-border)] text-[var(--bbva-brand)]"
              : "border-transparent bg-gradient-to-br from-[var(--stripe-brand)] to-[var(--stripe-brand-hover)] text-white"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                  esTransferencia ? "text-[var(--bbva-brand)]/70" : "text-white/70"
                }`}
              >
                {esTransferencia ? "Pago por transferencia" : "Pago con tarjeta"}
              </p>
              <h2 id="modal-pago-titulo" className="text-lg font-black leading-tight mt-1">
                {titulo}
              </h2>
              <p
                className={`text-[11px] font-bold mt-1 ${
                  esTransferencia ? "text-[var(--bbva-brand)]/85" : "text-white/80"
                }`}
              >
                {subtituloAccion}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                esTransferencia
                  ? "bg-[var(--bbva-brand)]/10 hover:bg-[var(--bbva-brand)]/15 text-[var(--bbva-brand)]"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
              aria-label="Cerrar ventana de pago"
            >
              <CloseIcon />
            </button>
          </div>
          <p className="mt-4 text-3xl font-black tabular-nums tracking-tight">
            {fmtMxn(montoDisplay, 2)}
          </p>
          {!esTransferencia && detalleTarjeta && (
            <p className="text-[10px] font-bold text-white/70 mt-1">{detalleTarjeta}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6 space-y-4">
          {children}
        </div>

        <div className="shrink-0 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 border-t border-slate-100 dark:border-white/10 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            ← Elegir otro método
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}

function ChevronSiguiente({ className }: { className?: string }) {
  return (
    <span
      className={`absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center transition-colors ${className ?? ""}`}
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M10 7l5 5-5 5"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function SpeiIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 9-5 9 5" />
      <path d="M9 22V9" />
    </svg>
  );
}

export function CardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

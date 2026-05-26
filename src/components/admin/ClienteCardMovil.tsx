"use client";

import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  esIngresoGeneralCliente,
  estadoCumpleanos,
} from "@/lib/clientes";
import EstadoBadge from "@/components/EstadoBadge";
import { useSwipeReveal } from "@/hooks/useSwipeReveal";

export type ClienteCardMovilProps = {
  cliente: Cliente;
  periodo: Periodo;
  onSelect: (cli: Cliente) => void;
  onEditar: (cli: Cliente, e: React.MouseEvent) => void;
  onAccesoPortal: (cli: Cliente, e: React.MouseEvent) => void;
  onEliminar: (cli: Cliente, e: React.MouseEvent) => void;
  onFelicitarCumple?: (cli: Cliente, e: React.MouseEvent) => void;
  enviandoCumple?: boolean;
  /** Controla swipe externamente para que solo una card esté abierta a la vez. */
  swipeAbierto?: boolean;
  onSwipeAbrir?: () => void;
  onSwipeCerrar?: () => void;
};

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

const CakeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <path d="M2 21h20" />
    <path d="M7 8v2" />
    <path d="M12 8v2" />
    <path d="M17 8v2" />
    <path d="M7 4v2" />
    <path d="M12 4v2" />
    <path d="M17 4v2" />
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** Ancho del panel de acciones revelado al deslizar (depende de cuántas acciones tenga). */
const ANCHO_TRES_ACCIONES = 156;
const ANCHO_UNA_ACCION = 56;

export default function ClienteCardMovil({
  cliente,
  periodo,
  onSelect,
  onEditar,
  onAccesoPortal,
  onEliminar,
  onFelicitarCumple,
  enviandoCumple,
  swipeAbierto,
  onSwipeAbrir,
  onSwipeCerrar,
}: ClienteCardMovilProps) {
  const esIngreso = esIngresoGeneralCliente(cliente);
  const estadoCumple = esIngreso ? "sin_fecha" : estadoCumpleanos(cliente);
  const mostrarCumple = estadoCumple !== "sin_fecha" && estadoCumple !== "otro_mes";
  const anchoAcciones = esIngreso
    ? ANCHO_UNA_ACCION
    : mostrarCumple
      ? ANCHO_TRES_ACCIONES + 46
      : ANCHO_TRES_ACCIONES;

  const { estiloFrontal, bindings, abierto, cerrar, esArrastreActivo } =
    useSwipeReveal({
      anchoAcciones,
      abiertoExterno: swipeAbierto,
      onAbrir: onSwipeAbrir,
      onCerrar: onSwipeCerrar,
    });

  const handleCardClick = () => {
    if (esArrastreActivo()) return;
    if (abierto) {
      cerrar();
      return;
    }
    onSelect(cliente);
  };

  const ejecutarAccion = (
    e: React.MouseEvent,
    fn: (cli: Cliente, ev: React.MouseEvent) => void
  ) => {
    e.stopPropagation();
    cerrar();
    fn(cliente, e);
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl">
      {/* Capa de acciones (queda atrás, se revela al deslizar). */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end gap-2.5 pl-3 pr-3"
        style={{ width: anchoAcciones }}
        aria-hidden={!abierto}
      >
        {mostrarCumple && onFelicitarCumple && (
          <button
            type="button"
            aria-label="Felicitar cumpleaños"
            disabled={estadoCumple !== "hoy" || enviandoCumple}
            onClick={(e) => ejecutarAccion(e, onFelicitarCumple)}
            className={`h-9 w-9 flex items-center justify-center rounded-full ring-1 active:scale-90 transition-transform ${
              estadoCumple === "ya_notificado"
                ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                : estadoCumple === "hoy"
                  ? "bg-violet-100 text-violet-700 ring-violet-200 animate-pulse"
                  : "bg-violet-50 text-violet-500 ring-violet-100 opacity-70"
            } disabled:cursor-not-allowed`}
          >
            {estadoCumple === "ya_notificado" ? <CheckIcon /> : <CakeIcon />}
          </button>
        )}
        {!esIngreso && (
          <button
            type="button"
            aria-label="Acceso al portal"
            onClick={(e) => ejecutarAccion(e, onAccesoPortal)}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 active:scale-90 transition-transform"
          >
            <KeyIcon />
          </button>
        )}
        <button
          type="button"
          aria-label="Editar cliente"
          onClick={(e) => ejecutarAccion(e, onEditar)}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 active:scale-90 transition-transform"
        >
          <EditIcon />
        </button>
        {!esIngreso && (
          <button
            type="button"
            aria-label="Eliminar cliente"
            onClick={(e) => ejecutarAccion(e, onEliminar)}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-100 active:scale-90 transition-transform"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {/* Capa frontal (la tarjeta visible). */}
      <button
        type="button"
        onClick={handleCardClick}
        {...bindings}
        style={estiloFrontal}
        className="relative w-full max-w-full text-left rounded-2xl bg-white ring-1 ring-slate-100 hover:ring-indigo-300 transition-shadow shadow-sm p-3 active:scale-[0.995] overflow-hidden touch-pan-y"
      >
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight truncate">
              {cliente.razonSocial}
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-widest truncate">
              {cliente.rfc}
            </p>
          </div>
          <div className="shrink-0">
            <EstadoBadge cliente={cliente} periodo={periodo} />
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center min-w-0">
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Honorarios
            </p>
            <p className="text-sm font-black text-slate-800 mt-0.5 tabular-nums truncate">
              {esIngreso
                ? <span className="text-violet-600 text-[10px] uppercase tracking-widest">Variable</span>
                : `$${cliente.honorarios.toLocaleString()}`}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Inicia
            </p>
            <p className="text-xs font-bold text-slate-600 italic mt-0.5 truncate">
              {MESES_NOM[cliente.inicioMes]} {cliente.inicioAnio}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Día pago
            </p>
            <p className="text-sm font-black text-slate-800 mt-0.5 truncate">
              {cliente.fechaPago}
            </p>
          </div>
        </div>

        {/* Pista visual sutil en el borde derecho para indicar que se puede deslizar. */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-slate-200 text-[10px] font-black tracking-tighter select-none"
        >
          ‹
        </span>
      </button>
    </div>
  );
}

"use client";

import { useSwipeReveal } from "@/hooks/useSwipeReveal";

const ANCHO_ACCIONES = 88;

type Props = {
  labelMes: string;
  activo: boolean;
  esPeriodoActual: boolean;
  esGeneral: boolean;
  previoInicio: boolean;
  pagado: boolean;
  parcial: boolean;
  atrasado: boolean;
  montoDeEsteMes: number;
  notaMes?: string | null;
  /** Texto a mostrar como badge de descuento (ej. "-$500 (Promo referido)"). */
  descuentoLabel?: string | null;
  hayPagoEnMes: boolean;
  facturaCargada: boolean;
  facturaMonto?: number | null;
  onTap: () => void;
  onEliminarPago: () => void;
  onAbrirFactura: () => void;
  swipeAbierto: boolean;
  onSwipeAbrir: () => void;
  onSwipeCerrar: () => void;
};

const FacturaIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 13h6M9 17h4" />
  </svg>
);
const AlertIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

/**
 * Fila de un mes en el historial del año del panel cliente.
 *
 * Swipe-to-reveal a la izquierda en móvil cuando el mes tiene pago,
 * para exponer un botón rojo de "Eliminar pago" estilo iOS Mail.
 */
export default function MesPagoFila({
  labelMes,
  activo,
  esPeriodoActual,
  esGeneral,
  previoInicio,
  pagado,
  parcial,
  atrasado,
  montoDeEsteMes,
  notaMes,
  descuentoLabel,
  hayPagoEnMes,
  facturaCargada,
  facturaMonto,
  onTap,
  onEliminarPago,
  onAbrirFactura,
  swipeAbierto,
  onSwipeAbrir,
  onSwipeCerrar,
}: Props) {
  // Solo permitimos swipe si hay un pago aplicado y no es ingreso general.
  const swipeHabilitado = activo && hayPagoEnMes && !esGeneral;

  const { estiloFrontal, bindings, esArrastreActivo } = useSwipeReveal({
    anchoAcciones: ANCHO_ACCIONES,
    abiertoExterno: swipeHabilitado ? swipeAbierto : false,
    onAbrir: onSwipeAbrir,
    onCerrar: onSwipeCerrar,
  });

  if (!swipeHabilitado) {
    // Render simple sin swipe.
    return (
      <div
        onClick={(e) => {
          if (!activo) return;
          e.stopPropagation();
          onTap();
        }}
        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
          activo
            ? "bg-white border-slate-100 shadow-sm hover:border-emerald-200 cursor-pointer"
            : "bg-slate-50/50 opacity-30 pointer-events-none border-transparent"
        } ${esPeriodoActual ? "ring-2 ring-emerald-200" : ""}`}
      >
        <Contenido
          labelMes={labelMes}
          pagado={pagado}
          atrasado={atrasado}
          parcial={parcial}
          previoInicio={previoInicio}
          esGeneral={esGeneral}
          montoDeEsteMes={montoDeEsteMes}
          notaMes={notaMes}
          descuentoLabel={descuentoLabel}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${
        esPeriodoActual ? "ring-2 ring-emerald-200" : ""
      }`}
      style={{ touchAction: "pan-y" }}
    >
      {/* Capa trasera (acción "Eliminar pago") */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-2"
        style={{ width: ANCHO_ACCIONES + 8 }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEliminarPago();
          }}
          className="h-10 w-10 rounded-full bg-red-50 ring-1 ring-red-100 text-red-600 flex items-center justify-center active:scale-95 transition-transform"
          aria-label={`Eliminar pago de ${labelMes}`}
          title="Eliminar pago"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Capa frontal (fila visible) */}
      <div
        {...bindings}
        onClick={(e) => {
          if (esArrastreActivo()) return;
          if (swipeAbierto) {
            onSwipeCerrar();
            return;
          }
          e.stopPropagation();
          onTap();
        }}
        style={estiloFrontal}
        className="relative flex items-center justify-between px-4 py-3.5 rounded-2xl border bg-white border-slate-100 shadow-sm cursor-pointer"
      >
        <Contenido
          labelMes={labelMes}
          pagado={pagado}
          atrasado={atrasado}
          parcial={parcial}
          previoInicio={previoInicio}
          esGeneral={esGeneral}
          montoDeEsteMes={montoDeEsteMes}
          notaMes={notaMes}
          descuentoLabel={descuentoLabel}
          accion={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAbrirFactura();
              }}
              title={
                facturaCargada
                  ? `Factura PDF cargada${facturaMonto ? ` · $${facturaMonto.toLocaleString()}` : ""} · clic para ver o reemplazar`
                  : "Pago recibido sin factura · clic para subir"
              }
              className={`p-1.5 rounded-lg border transition-all ${
                facturaCargada
                  ? "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100"
                  : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 animate-pulse"
              }`}
            >
              {facturaCargada ? <FacturaIcon /> : <AlertIcon />}
            </button>
          }
        />
      </div>
    </div>
  );
}

function Contenido({
  labelMes,
  pagado,
  atrasado,
  parcial,
  previoInicio,
  esGeneral,
  montoDeEsteMes,
  notaMes,
  descuentoLabel,
  accion,
}: {
  labelMes: string;
  pagado: boolean;
  atrasado: boolean;
  parcial: boolean;
  previoInicio: boolean;
  esGeneral: boolean;
  montoDeEsteMes: number;
  notaMes?: string | null;
  descuentoLabel?: string | null;
  accion?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-2 h-2 shrink-0 rounded-full ${
            pagado
              ? "bg-green-500"
              : atrasado
                ? "bg-red-500 animate-pulse"
                : parcial
                  ? "bg-amber-500"
                  : "bg-slate-200"
          }`}
        />
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-700 uppercase tracking-tight truncate">
            {labelMes}
          </p>
          {descuentoLabel && (
            <p
              className="text-[8px] font-black text-rose-600 uppercase tracking-widest mt-0.5 truncate max-w-[180px]"
              title={descuentoLabel}
            >
              {descuentoLabel}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <div className="text-right">
          <p className="text-base font-black text-slate-600">
            {previoInicio
              ? "-"
              : esGeneral && montoDeEsteMes === 0
                ? "—"
                : `$${montoDeEsteMes.toLocaleString()}`}
          </p>
          {notaMes && (
            <p
              className="text-[8px] font-bold text-violet-600 mt-0.5 max-w-[140px] truncate"
              title={notaMes}
            >
              {notaMes}
            </p>
          )}
          {pagado && !esGeneral && (
            <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">
              Pagado
            </p>
          )}
          {esGeneral && montoDeEsteMes > 0 && (
            <p className="text-[8px] font-black text-violet-600 uppercase tracking-widest">
              Ingreso
            </p>
          )}
          {parcial && (
            <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">
              Pagado parcialmente
            </p>
          )}
          {atrasado && (
            <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">
              Pendiente de pago
            </p>
          )}
        </div>
        {accion}
      </div>
    </>
  );
}

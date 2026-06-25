"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
import { periodoLabel, periodoKey } from "@/lib/clientes";
import { calcularCobroHonorarios } from "@/lib/stripe-honorarios";
import type { PagoHonorarioStripe } from "@/lib/stripe-checkout-types";
import { fmtMxn } from "@/components/portal/portal-ui";
import { DATOS_BANCARIOS_PORTAL } from "@/lib/datos-bancarios";
import PortalSection from "@/components/portal/PortalSection";
import DatosTransferenciaPortal from "@/components/portal/DatosTransferenciaPortal";
import SubirComprobante from "@/components/SubirComprobante";
import PagoStripeHonorarios from "@/components/portal/PagoStripeHonorarios";
import {
  CardIcon,
  GridMetodosPago,
  MetodoCard,
  ModalPagoSheet,
  SpeiIcon,
  type MetodoPago,
} from "@/components/portal/metodo-pago-ui";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  montoHonorarios: number;
  pagos?: PagoHonorarioStripe[];
};

function clavePeriodo(p: Periodo): string {
  return String(periodoKey(p));
}

export default function MetodoPagoHonorarios({
  cliente,
  periodo,
  montoHonorarios,
  pagos: pagosProp,
}: Props) {
  const [modalAbierto, setModalAbierto] = useState<MetodoPago | null>(null);

  const todosPagos = useMemo((): PagoHonorarioStripe[] => {
    if (pagosProp && pagosProp.length > 0) return pagosProp;
    if (montoHonorarios > 0) return [{ periodo, montoHonorarios }];
    return [];
  }, [pagosProp, periodo, montoHonorarios]);

  const clavesTodos = useMemo(
    () => todosPagos.map((p) => clavePeriodo(p.periodo)),
    [todosPagos]
  );
  const clavesTodosKey = clavesTodos.join(",");

  const [seleccionados, setSeleccionados] = useState<Set<string>>(
    () => new Set(clavesTodos)
  );

  useEffect(() => {
    setSeleccionados(new Set(clavesTodos));
  }, [clavesTodosKey]);

  const variosMeses = todosPagos.length > 1;

  const pagos = useMemo(
    () => todosPagos.filter((p) => seleccionados.has(clavePeriodo(p.periodo))),
    [todosPagos, seleccionados]
  );

  const montoActivo = useMemo(
    () => pagos.reduce((s, p) => s + p.montoHonorarios, 0),
    [pagos]
  );

  const totalTarjeta = calcularCobroHonorarios(montoActivo).total;
  const desglose = calcularCobroHonorarios(montoActivo);
  const periodoComprobante = pagos[pagos.length - 1]?.periodo ?? periodo;
  const puedePagar = montoActivo > 0 && pagos.length > 0;

  const cerrarModal = useCallback(() => setModalAbierto(null), []);

  const toggleMes = useCallback((clave: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(clave)) next.delete(clave);
      else next.add(clave);
      return next;
    });
  }, []);

  const seleccionarTodos = useCallback(() => {
    setSeleccionados(new Set(todosPagos.map((p) => clavePeriodo(p.periodo))));
  }, [todosPagos]);

  const tituloModal =
    pagos.length > 1
      ? `${pagos.length} meses seleccionados`
      : periodoLabel(periodoComprobante);

  const abrirModal = (metodo: MetodoPago) => {
    if (!puedePagar) return;
    setModalAbierto(metodo);
  };

  return (
    <>
      <PortalSection title="Pagar honorarios">
        <p className="text-[11px] font-bold text-slate-500 mb-3 leading-relaxed">
          {variosMeses ? (
            <>
              Todos los meses vienen <span className="font-black text-slate-700">marcados por defecto</span>.
              Si no quieres pagar alguno ahora, tócalo para desmarcarlo. Total seleccionado:{" "}
              <span className="font-black text-slate-800 tabular-nums">
                {fmtMxn(montoActivo, 2)}
              </span>
              .
            </>
          ) : (
            <>
              Elige cómo quieres pagar{" "}
              <span className="font-black text-slate-800 tabular-nums">
                {fmtMxn(montoActivo, 2)}
              </span>{" "}
              de {periodoLabel(periodoComprobante)}.
            </>
          )}
        </p>

        {variosMeses && (
          <div className="mb-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Meses a pagar · toca para desmarcar
              </p>
              {pagos.length < todosPagos.length && (
                <button
                  type="button"
                  onClick={seleccionarTodos}
                  className="text-[10px] font-bold text-[var(--portal-navy)] hover:underline"
                >
                  Seleccionar todos
                </button>
              )}
            </div>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/80 overflow-hidden">
              {todosPagos.map((p) => {
                const clave = clavePeriodo(p.periodo);
                const activo = seleccionados.has(clave);
                return (
                  <li key={clave}>
                    <button
                      type="button"
                      onClick={() => toggleMes(clave)}
                      aria-pressed={activo}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                        activo
                          ? "bg-white hover:bg-slate-50"
                          : "bg-slate-50/50 hover:bg-slate-100/80 opacity-75"
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                            activo
                              ? "bg-[var(--portal-navy)] border-[var(--portal-navy)] text-white"
                              : "border-slate-300 bg-white"
                          }`}
                          aria-hidden
                        >
                          {activo && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {periodoLabel(p.periodo)}
                        </span>
                      </span>
                      <span
                        className={`text-sm font-black tabular-nums shrink-0 ${
                          activo ? "text-slate-800" : "text-slate-400 line-through"
                        }`}
                      >
                        {fmtMxn(p.montoHonorarios, 2)}
                      </span>
                    </button>
                  </li>
                );
              })}
              <li className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Total seleccionado
                </span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  {fmtMxn(montoActivo, 2)}
                </span>
              </li>
            </ul>
          </div>
        )}

        {!puedePagar && (
          <p className="text-[11px] font-bold text-amber-700 mb-3">
            Selecciona al menos un mes para continuar.
          </p>
        )}

        <div className={!puedePagar ? "opacity-45 pointer-events-none" : undefined}>
        <GridMetodosPago>
          <MetodoCard
            onSelect={() => abrirModal("transferencia")}
            titulo="Transferencia SPEI"
            subtitulo={
              variosMeses && pagos.length > 1
                ? "Una transferencia por lo seleccionado"
                : "Recomendado · sin costo extra"
            }
            etiquetaMarca={DATOS_BANCARIOS_PORTAL.banco}
            monto={fmtMxn(montoActivo, 2)}
            tono="bbva"
            icono={<SpeiIcon />}
            badge="Recomendado"
          />
          <MetodoCard
            onSelect={() => abrirModal("tarjeta")}
            titulo={variosMeses && pagos.length > 1 ? "Tarjeta · selección" : "Tarjeta"}
            subtitulo="Visa, MC, Amex"
            etiquetaMarca="Stripe"
            monto={fmtMxn(totalTarjeta, 2)}
            tono="stripe"
            icono={<CardIcon />}
          />
        </GridMetodosPago>
        </div>
      </PortalSection>

      {modalAbierto && puedePagar && (
        <ModalPagoSheet
          metodo={modalAbierto}
          titulo={tituloModal}
          subtituloAccion={
            modalAbierto === "transferencia"
              ? pagos.length > 1
                ? "Transfiere el total seleccionado y sube tu comprobante"
                : "Transfiere y sube tu comprobante"
              : pagos.length > 1
                ? "Pago seguro de los meses seleccionados"
                : "Pago seguro con Stripe"
          }
          montoDisplay={modalAbierto === "transferencia" ? montoActivo : desglose.total}
          detalleTarjeta={`Honorarios ${fmtMxn(montoActivo, 2)} + costo de procesamiento`}
          onClose={cerrarModal}
        >
          {modalAbierto === "transferencia" ? (
            <>
              <DatosTransferenciaPortal montoReferencia={montoActivo} embedded />
              {pagos.length > 1 && (
                <ul className="text-[10px] font-bold text-slate-500 space-y-1">
                  {pagos.map((p) => (
                    <li key={clavePeriodo(p.periodo)}>
                      {periodoLabel(p.periodo)} · {fmtMxn(p.montoHonorarios, 2)}
                    </li>
                  ))}
                </ul>
              )}
              {pagos.length > 1 && (
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                  Si cubres varios meses en una sola transferencia, sube el comprobante
                  del mes más reciente o escríbele a tu contador para aplicarlo correctamente.
                </p>
              )}
              <SubirComprobante
                clienteId={cliente.id}
                periodo={periodoComprobante}
                className="min-w-0 flex flex-col"
              />
            </>
          ) : (
            <PagoStripeHonorarios
              cliente={cliente}
              montoHonorarios={montoActivo}
              pagos={pagos}
              embedded
            />
          )}
        </ModalPagoSheet>
      )}
    </>
  );
}

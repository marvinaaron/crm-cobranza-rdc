"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
import { periodoLabel, periodoKey } from "@/lib/clientes";
import type {
  PagoHonorarioStripe,
  PagoExtraStripe,
} from "@/lib/stripe-checkout-types";
import { fmtMxn } from "@/components/portal/portal-ui";
import PortalSection from "@/components/portal/PortalSection";
import DatosTransferenciaPortal from "@/components/portal/DatosTransferenciaPortal";
import SubirComprobante from "@/components/SubirComprobante";
import PagoStripeHonorarios from "@/components/portal/PagoStripeHonorarios";
import PortalPagoMetodo from "@/components/portal/PortalPagoMetodo";
import { ModalPagoSheet } from "@/components/portal/metodo-pago-ui";

export type LineaExtraCuenta = {
  id: string;
  concepto: string;
  saldo: number;
  mes: number;
  anio: number;
};

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  montoHonorarios: number;
  pagos?: PagoHonorarioStripe[];
  extras?: LineaExtraCuenta[];
  extrasSeleccionados?: Set<string>;
  onToggleExtra?: (id: string) => void;
};

function clavePeriodo(p: Periodo): string {
  return String(periodoKey(p));
}

export default function MetodoPagoHonorarios({
  cliente,
  periodo,
  montoHonorarios,
  pagos: pagosProp,
  extras = [],
  extrasSeleccionados,
  onToggleExtra,
}: Props) {
  const [sheetAbierta, setSheetAbierta] = useState(false);
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

  const extrasActivos = useMemo(
    () =>
      extras.filter((e) =>
        extrasSeleccionados ? extrasSeleccionados.has(e.id) : true
      ),
    [extras, extrasSeleccionados]
  );

  const montoExtras = useMemo(
    () => extrasActivos.reduce((s, e) => s + e.saldo, 0),
    [extrasActivos]
  );

  const montoActivo = useMemo(
    () => pagos.reduce((s, p) => s + p.montoHonorarios, 0) + montoExtras,
    [pagos, montoExtras]
  );

  const extrasStripe = useMemo(
    (): PagoExtraStripe[] =>
      extrasActivos.map((e) => ({
        extraEsperadoId: e.id,
        concepto: e.concepto,
        monto: e.saldo,
        mes: e.mes,
        anio: e.anio,
      })),
    [extrasActivos]
  );

  const periodoComprobante = pagos[pagos.length - 1]?.periodo ?? periodo;
  const puedePagar = montoActivo > 0;
  const mostrarLineas = variosMeses || extras.length > 0;

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

  const abrirSheet = useCallback(() => {
    if (!puedePagar) return;
    setSheetAbierta(true);
  }, [puedePagar]);

  const cerrarSheet = useCallback(() => setSheetAbierta(false), []);

  useEffect(() => {
    if (!puedePagar) return;
    const hash = window.location.hash;
    if (hash === "#pago" || hash === "#comprobante") setSheetAbierta(true);
  }, [puedePagar]);

  return (
    <>
      <PortalSection title="Tu cuenta">
        <p className="text-[15px] text-slate-500 mb-3 leading-relaxed">
          {mostrarLineas
            ? "Marca lo que quieres pagar ahora. Puedes dejar el trabajo adicional o pagarlo aparte."
            : "Elige cómo pagar el saldo de esta cuenta."}
        </p>

        {mostrarLineas ? (
          <div className="mb-4">
            <ul className="divide-y divide-slate-200/70 rounded-xl bg-slate-50 overflow-hidden">
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
                        <CheckCuadro activo={activo} />
                        <span className="min-w-0">
                          <span className="block text-[15px] font-semibold text-slate-800">
                            Honorarios
                          </span>
                          <span className="block text-[13px] text-slate-500">
                            {periodoLabel(p.periodo)}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`text-[15px] font-semibold tabular-nums shrink-0 ${
                          activo ? "text-slate-900" : "text-slate-400 line-through"
                        }`}
                      >
                        {fmtMxn(p.montoHonorarios, 2)}
                      </span>
                    </button>
                  </li>
                );
              })}
              {extras.map((e) => {
                const activo = extrasSeleccionados
                  ? extrasSeleccionados.has(e.id)
                  : true;
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => onToggleExtra?.(e.id)}
                      aria-pressed={activo}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                        activo
                          ? "bg-white hover:bg-slate-50"
                          : "bg-slate-50/50 hover:bg-slate-100/80 opacity-75"
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <CheckCuadro activo={activo} />
                        <span className="min-w-0">
                          <span className="block text-[15px] font-semibold text-slate-800">
                            {e.concepto}
                          </span>
                          <span className="block text-[13px] text-slate-500">
                            Trabajo adicional
                          </span>
                        </span>
                      </span>
                      <span
                        className={`text-[15px] font-semibold tabular-nums shrink-0 ${
                          activo ? "text-slate-900" : "text-slate-400 line-through"
                        }`}
                      >
                        {fmtMxn(e.saldo, 2)}
                      </span>
                    </button>
                  </li>
                );
              })}
              <li className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-100">
                <span className="text-[13px] text-slate-500">Total a pagar</span>
                <span className="text-[17px] font-semibold text-slate-900 tabular-nums">
                  {fmtMxn(montoActivo, 2)}
                </span>
              </li>
            </ul>
            {variosMeses && pagos.length < todosPagos.length ? (
              <button
                type="button"
                onClick={seleccionarTodos}
                className="mt-2 text-[13px] font-semibold text-[#1a164d]"
              >
                Marcar todos los meses
              </button>
            ) : null}
          </div>
        ) : null}

        {!puedePagar ? (
          <p className="text-[13px] text-amber-800 mb-3">
            Marca al menos una línea para continuar.
          </p>
        ) : null}

        <button
          type="button"
          onClick={abrirSheet}
          disabled={!puedePagar}
          className="w-full h-12 rounded-xl bg-[var(--portal-navy)] text-white text-[17px] font-semibold disabled:opacity-45"
        >
          Pagar {fmtMxn(montoActivo, 2)}
        </button>
        <p className="mt-2 text-center text-[13px] text-slate-500">
          Transferencia SPEI o tarjeta
        </p>
      </PortalSection>

      {sheetAbierta && puedePagar ? (
        <ModalPagoSheet titulo="Pagar" onClose={cerrarSheet}>
          <PortalPagoMetodo
            transferencia={
              <div className="space-y-4">
                <DatosTransferenciaPortal montoReferencia={montoActivo} embedded />
                {pagos.length > 1 || extrasActivos.length > 0 ? (
                  <p className="text-[13px] text-slate-500 leading-snug">
                    {extrasActivos.length > 0
                      ? "Este total puede incluir honorarios y trabajo adicional. Sube el comprobante y tu contador lo aplica a tu cuenta."
                      : "Si cubres varios meses en una sola transferencia, sube el comprobante del mes más reciente."}
                  </p>
                ) : null}
                <SubirComprobante
                  clienteId={cliente.id}
                  periodo={periodoComprobante}
                  esAncla
                  className="min-w-0 flex flex-col"
                />
              </div>
            }
            tarjeta={
              <PagoStripeHonorarios
                cliente={cliente}
                montoHonorarios={montoActivo}
                pagos={pagos}
                extras={extrasStripe}
                embedded
              />
            }
          />
        </ModalPagoSheet>
      ) : null}
    </>
  );
}

function CheckCuadro({ activo }: { activo: boolean }) {
  return (
    <span
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        activo
          ? "rdc-check-on bg-[var(--portal-navy)] border-[var(--portal-navy)] text-white"
          : "border-slate-300 bg-white"
      }`}
      aria-hidden
    >
      {activo ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : null}
    </span>
  );
}

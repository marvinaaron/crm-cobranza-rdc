"use client";

import { useMemo, useRef, useState } from "react";
import { calcularCobroHonorarios } from "@/lib/stripe-honorarios";
import type { Cliente, ExtraEsperado, Periodo } from "@/lib/clientes";
import { fmtMxn } from "@/components/portal/portal-ui";
import DatosTransferenciaPortal from "@/components/portal/DatosTransferenciaPortal";
import PortalPagoMetodo from "@/components/portal/PortalPagoMetodo";
import { ModalPagoSheet } from "@/components/portal/metodo-pago-ui";
import { useClientes } from "@/context/ClientesContext";
import {
  formatFechaComprobante,
} from "@/lib/comprobantes";
import { ACCEPT_COMPROBANTE, prepararArchivoComprobante } from "@/lib/archivos";

const stripeHabilitado = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

type Props = {
  cliente: Cliente;
  extra: ExtraEsperado;
  saldo: number;
  periodoAbono: Periodo;
};

export default function PagoExtraPortal({
  cliente,
  extra,
  saldo,
  periodoAbono,
}: Props) {
  const [montoInput, setMontoInput] = useState<string>(String(saldo));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetAbierta, setSheetAbierta] = useState(false);

  const monto = useMemo(() => {
    const n = Number(montoInput);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.min(saldo, Math.round(n * 100) / 100);
  }, [montoInput, saldo]);

  const desglose = calcularCobroHonorarios(monto);

  if (saldo <= 0) return null;

  const iniciarPagoTarjeta = async () => {
    if (monto <= 0) {
      setError("Captura un monto válido.");
      return;
    }
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: cliente.id,
          razonSocial: cliente.razonSocial,
          extra: {
            extraEsperadoId: extra.id,
            concepto: extra.concepto,
            monto,
            mes: periodoAbono.mes,
            anio: periodoAbono.anio,
          },
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo iniciar el pago.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => {
          setMontoInput(String(saldo));
          setSheetAbierta(true);
        }}
        className="w-full h-12 rounded-xl bg-[#1a164d] text-white text-[17px] font-semibold"
      >
        Pagar {fmtMxn(saldo)}
      </button>

      {sheetAbierta && monto > 0 ? (
        <ModalPagoSheet
          titulo={extra.concepto}
          onClose={() => setSheetAbierta(false)}
        >
          <div className="mb-4">
            <p className="text-[13px] text-slate-500">Monto a pagar</p>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={montoInput}
                onChange={(e) => setMontoInput(e.target.value)}
                max={saldo}
                className="flex-1 h-11 px-3 rounded-xl border border-slate-200 outline-none text-[17px] font-semibold tabular-nums text-slate-900"
              />
              <button
                type="button"
                onClick={() => setMontoInput(String(saldo))}
                className="h-11 px-3 rounded-xl bg-slate-100 text-slate-800 text-[15px] font-semibold whitespace-nowrap"
              >
                Todo
              </button>
            </div>
            {monto > 0 && monto < saldo ? (
              <p className="mt-1 text-[13px] text-slate-500">
                Abono parcial. Quedarían {fmtMxn(saldo - monto)}.
              </p>
            ) : null}
          </div>
          <PortalPagoMetodo
            transferencia={
              <ComprobanteExtraTransferencia
                clienteId={cliente.id}
                extraId={extra.id}
                periodoAbono={periodoAbono}
                monto={monto}
                montoReferencia={monto}
              />
            }
            tarjeta={
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] text-slate-500">Total con tarjeta</p>
                    <p className="mt-0.5 text-[28px] font-bold text-slate-900 tabular-nums leading-none">
                      {fmtMxn(desglose.total, 2)}
                    </p>
                    <p className="mt-1 text-[13px] text-slate-500">
                      {fmtMxn(desglose.montoHonorarios, 2)} + comisión Stripe
                    </p>
                  </div>
                  <span className="shrink-0 mt-1 w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </span>
                </div>
                {!stripeHabilitado ? (
                  <p className="text-[15px] text-amber-800 leading-relaxed rounded-xl bg-amber-50 px-4 py-3">
                    El pago con tarjeta no está disponible. Usa transferencia.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => void iniciarPagoTarjeta()}
                    disabled={cargando || monto <= 0}
                    className="w-full h-12 rounded-xl bg-[#1a164d] text-white text-[17px] font-semibold disabled:opacity-60 flex items-center justify-between px-5"
                  >
                    {cargando ? (
                      <span className="w-full text-center">Redirigiendo a Stripe…</span>
                    ) : (
                      <>
                        <span className="w-5" aria-hidden />
                        <span>Pagar con tarjeta</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
                {error ? (
                  <p className="text-[13px] text-red-600 text-center">{error}</p>
                ) : null}
              </div>
            }
          />
        </ModalPagoSheet>
      ) : null}
    </div>
  );
}

function ComprobanteExtraTransferencia({
  clienteId,
  extraId,
  periodoAbono,
  monto,
  montoReferencia,
}: {
  clienteId: number;
  extraId: string;
  periodoAbono: Periodo;
  monto: number;
  montoReferencia: number;
}) {
  const { subirComprobanteExtra, getComprobantesExtra } = useClientes();
  const fileRef = useRef<HTMLInputElement>(null);
  const [subiendoComp, setSubiendoComp] = useState(false);
  const [compError, setCompError] = useState<string | null>(null);
  const [compOk, setCompOk] = useState(false);

  const comprobantes = getComprobantesExtra(clienteId, extraId);

  const onElegirComprobante = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCompError(null);
    setCompOk(false);
    if (monto <= 0) {
      setCompError("Captura el monto que transferiste.");
      return;
    }
    setSubiendoComp(true);
    try {
      const preparado = await prepararArchivoComprobante(file);
      if (!preparado.ok) {
        setCompError(preparado.error);
        return;
      }
      subirComprobanteExtra(clienteId, extraId, periodoAbono, monto, {
        nombreArchivo: preparado.nombreArchivo,
        tipoMime: preparado.tipoMime,
        dataUrl: preparado.dataUrl,
      });
      setCompOk(true);
      setTimeout(() => setCompOk(false), 6000);
    } catch {
      setCompError("No se pudo cargar el archivo. Intenta de nuevo.");
    } finally {
      setSubiendoComp(false);
    }
  };

  return (
    <>
      <DatosTransferenciaPortal montoReferencia={montoReferencia} embedded />
      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2">
        <p className="text-[13px] font-semibold text-slate-500">
          ¿Ya transferiste? Sube tu comprobante
        </p>
        {comprobantes.length > 0 && (
          <div className="space-y-1.5">
            {comprobantes.map((cmp) => {
              const aceptado = cmp.estado === "aceptado";
              return (
                <div
                  key={cmp.id}
                  className={`rounded-xl px-3 py-2 ${
                    aceptado ? "bg-emerald-50" : "bg-slate-50"
                  }`}
                >
                  <p
                    className={`text-[13px] font-semibold ${
                      aceptado ? "text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    {aceptado ? "Abono validado" : "En validación"}
                    {cmp.montoDeclarado ? ` · ${fmtMxn(cmp.montoDeclarado)}` : ""}
                  </p>
                  <p className="text-[11px] font-bold text-slate-600 truncate">
                    {cmp.nombreArchivo}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Enviado {formatFechaComprobante(cmp.subidoEn)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT_COMPROBANTE}
          className="hidden"
          onChange={onElegirComprobante}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={subiendoComp || monto <= 0}
          className="w-full h-11 rounded-xl bg-[#1a164d] text-white text-[15px] font-semibold disabled:opacity-60"
        >
          {subiendoComp
            ? "Enviando…"
            : comprobantes.length > 0
              ? "Subir otro comprobante"
              : "Subir comprobante"}
        </button>
        <p className="text-[9px] font-bold text-slate-400 leading-relaxed">
          PDF o imagen · máx. 3 MB. Tu contador valida el monto y lo aplica a tu saldo.
        </p>
        {compError && <p className="text-[10px] font-bold text-red-600">{compError}</p>}
        {compOk && (
          <p className="text-[10px] font-bold text-emerald-600">
            ¡Comprobante recibido! Quedó en validación.
          </p>
        )}
      </div>
    </>
  );
}

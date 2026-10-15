"use client";

import { useMemo, useRef, useState } from "react";
import { calcularCobroHonorarios } from "@/lib/stripe-honorarios";
import type { Cliente, ExtraEsperado, Periodo } from "@/lib/clientes";
import { fmtMxn } from "@/components/portal/portal-ui";
import DesglosePagoTarjeta from "@/components/portal/DesglosePagoTarjeta";
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
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div>
        <label className="text-[13px] font-semibold text-slate-500">
          Monto a abonar
        </label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={montoInput}
            onChange={(e) => setMontoInput(e.target.value)}
            max={saldo}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none text-[15px] font-semibold tabular-nums text-slate-800 focus:border-[var(--portal-navy-border)] focus:ring-2 focus:ring-[var(--portal-navy-soft)]"
          />
          <button
            type="button"
            onClick={() => setMontoInput(String(saldo))}
            className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-[13px] font-semibold hover:bg-slate-200 whitespace-nowrap"
          >
            Todo · {fmtMxn(saldo)}
          </button>
        </div>
        {monto > 0 && monto < saldo && (
          <p className="text-[10px] font-bold text-amber-700 mt-1">
            Abono parcial. Te quedarían {fmtMxn(saldo - monto)} por pagar.
          </p>
        )}
      </div>

      {monto > 0 ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setSheetAbierta(true)}
            className="w-full h-11 rounded-xl bg-[var(--portal-navy)] text-white text-[15px] font-semibold"
          >
            Pagar {fmtMxn(monto, 2)}
          </button>
          <p className="mt-2 text-center text-[13px] text-slate-500">
            Transferencia SPEI o tarjeta
          </p>
        </div>
      ) : null}

      {sheetAbierta && monto > 0 ? (
        <ModalPagoSheet
          titulo={extra.concepto}
          onClose={() => setSheetAbierta(false)}
        >
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
              <div className="space-y-3">
                <div className="space-y-2 text-[15px]">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Abono</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {fmtMxn(desglose.montoHonorarios, 2)}
                    </span>
                  </div>
                  <DesglosePagoTarjeta
                    desglose={desglose}
                    totalClassName="text-[17px]"
                    compararSpei={false}
                  />
                </div>
                {!stripeHabilitado ? (
                  <p className="text-[13px] text-amber-800 leading-relaxed rounded-xl bg-amber-50 px-4 py-3">
                    El pago con tarjeta no está disponible por ahora. Usa
                    transferencia.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => void iniciarPagoTarjeta()}
                    disabled={cargando}
                    className="w-full h-11 rounded-xl bg-[var(--portal-navy)] text-white text-[15px] font-semibold hover:bg-[var(--portal-navy-hover)] disabled:opacity-60"
                  >
                    {cargando ? "Redirigiendo a Stripe…" : "Pagar con tarjeta"}
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
          className="w-full h-11 rounded-xl bg-[var(--portal-navy)] text-white text-[15px] font-semibold hover:bg-[var(--portal-navy-hover)] disabled:opacity-60"
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

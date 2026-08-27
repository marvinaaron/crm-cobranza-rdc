"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { calcularCobroHonorarios } from "@/lib/stripe-honorarios";
import type { Cliente, ExtraEsperado, Periodo } from "@/lib/clientes";
import { fmtMxn } from "@/components/portal/portal-ui";
import DesglosePagoTarjeta from "@/components/portal/DesglosePagoTarjeta";
import { DATOS_BANCARIOS_PORTAL } from "@/lib/datos-bancarios";
import DatosTransferenciaPortal from "@/components/portal/DatosTransferenciaPortal";
import {
  CardIcon,
  GridMetodosPago,
  MetodoCard,
  ModalPagoSheet,
  SpeiIcon,
  type MetodoPago,
} from "@/components/portal/metodo-pago-ui";
import { useClientes } from "@/context/ClientesContext";
import {
  MAX_COMPROBANTE_BYTES,
  formatFechaComprobante,
} from "@/lib/comprobantes";
import { mimeComprobantePermitido } from "@/lib/archivos";

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
  const { subirComprobanteExtra, getComprobantesExtra } = useClientes();
  const [modalAbierto, setModalAbierto] = useState<MetodoPago | null>(null);
  const [montoInput, setMontoInput] = useState<string>(String(saldo));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monto = useMemo(() => {
    const n = Number(montoInput);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.min(saldo, Math.round(n * 100) / 100);
  }, [montoInput, saldo]);

  const desglose = calcularCobroHonorarios(monto);
  const cerrarModal = useCallback(() => {
    setModalAbierto(null);
    setError(null);
  }, []);

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
    <div className="mt-3 pt-3 border-t border-amber-100">
      <div>
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Monto a abonar
        </label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={montoInput}
            onChange={(e) => setMontoInput(e.target.value)}
            max={saldo}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none text-sm font-black tabular-nums text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
          <button
            type="button"
            onClick={() => setMontoInput(String(saldo))}
            className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 whitespace-nowrap"
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

      {monto > 0 && (
        <div className="mt-3">
          <GridMetodosPago>
            <MetodoCard
              onSelect={() => setModalAbierto("transferencia")}
              titulo="Transferencia SPEI"
              subtitulo="Recomendado · sin costo extra"
              etiquetaMarca={DATOS_BANCARIOS_PORTAL.banco}
              monto={fmtMxn(monto, 2)}
              tono="bbva"
              icono={<SpeiIcon />}
              badge="Recomendado"
            />
            <MetodoCard
              onSelect={() => setModalAbierto("tarjeta")}
              titulo="Tarjeta"
              subtitulo="Visa, MC, Amex"
              etiquetaMarca="Stripe"
              monto={fmtMxn(desglose.total, 2)}
              tono="stripe"
              icono={<CardIcon />}
            />
          </GridMetodosPago>
        </div>
      )}

      {modalAbierto && monto > 0 && (
        <ModalPagoSheet
          metodo={modalAbierto}
          titulo={extra.concepto}
          subtituloAccion={
            modalAbierto === "transferencia"
              ? "Transfiere y sube tu comprobante"
              : "Pago seguro con Stripe"
          }
          montoDisplay={modalAbierto === "transferencia" ? monto : desglose.total}
          detalleTarjeta={`Abono ${fmtMxn(monto, 2)} + costo de procesamiento`}
          onClose={cerrarModal}
        >
          {modalAbierto === "transferencia" ? (
            <ComprobanteExtraTransferencia
              clienteId={cliente.id}
              extraId={extra.id}
              periodoAbono={periodoAbono}
              monto={monto}
              montoReferencia={monto}
            />
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-slate-600">Abono</span>
                  <span className="font-black text-slate-800 tabular-nums">
                    {fmtMxn(desglose.montoHonorarios, 2)}
                  </span>
                </div>
                <DesglosePagoTarjeta desglose={desglose} totalClassName="text-base" />
              </div>
              {!stripeHabilitado ? (
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  El pago con tarjeta no está disponible por ahora. Usa transferencia.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={iniciarPagoTarjeta}
                  disabled={cargando}
                  className="w-full py-3 rounded-xl bg-[var(--stripe-brand)] text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-[var(--stripe-brand)]/25 hover:bg-[var(--stripe-brand-hover)] disabled:opacity-60"
                >
                  {cargando ? "Redirigiendo a Stripe…" : "Pagar con tarjeta"}
                </button>
              )}
              {error && (
                <p className="text-[11px] font-bold text-red-600 text-center">{error}</p>
              )}
            </div>
          )}
        </ModalPagoSheet>
      )}
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
    if (file.size > MAX_COMPROBANTE_BYTES) {
      setCompError("El archivo no debe superar 3 MB.");
      return;
    }
    const mimeCheck = mimeComprobantePermitido(file);
    if (!mimeCheck.ok) {
      setCompError(mimeCheck.error);
      return;
    }
    if (monto <= 0) {
      setCompError("Captura el monto que transferiste.");
      return;
    }
    setSubiendoComp(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      subirComprobanteExtra(clienteId, extraId, periodoAbono, monto, {
        nombreArchivo: file.name,
        tipoMime: mimeCheck.mime,
        dataUrl,
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
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          ¿Ya transferiste? Sube tu comprobante
        </p>
        {comprobantes.length > 0 && (
          <div className="space-y-1.5">
            {comprobantes.map((cmp) => {
              const aceptado = cmp.estado === "aceptado";
              return (
                <div
                  key={cmp.id}
                  className={`rounded-xl px-3 py-2 border ${
                    aceptado
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-[var(--bbva-brand-soft)] border-[var(--bbva-brand-border)]"
                  }`}
                >
                  <p
                    className={`text-[9px] font-black uppercase tracking-widest ${
                      aceptado ? "text-emerald-700" : "text-[var(--bbva-brand)]"
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
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={onElegirComprobante}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={subiendoComp || monto <= 0}
          className="w-full py-2.5 rounded-xl bg-[var(--bbva-brand)] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[var(--bbva-brand-hover)] disabled:opacity-60"
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

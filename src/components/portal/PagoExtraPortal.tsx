"use client";

import { useMemo, useRef, useState } from "react";
import {
  calcularCobroHonorarios,
  COMISION_PLATAFORMA_PCT,
} from "@/lib/stripe-honorarios";
import type { Cliente, ExtraEsperado, Periodo } from "@/lib/clientes";
import { fmtMxn } from "@/components/portal/portal-ui";
import { DATOS_BANCARIOS_PORTAL } from "@/lib/datos-bancarios";
import { useClientes } from "@/context/ClientesContext";
import {
  MAX_COMPROBANTE_BYTES,
  formatFechaComprobante,
} from "@/lib/comprobantes";

const stripeHabilitado = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

type Props = {
  cliente: Cliente;
  extra: ExtraEsperado;
  saldo: number;
  /** Periodo al que se atribuye el abono (normalmente el mes en curso). */
  periodoAbono: Periodo;
};

/**
 * Opciones de pago para un trabajo adicional (extra por cobrar) en el portal.
 * Permite abonar el saldo (total o parcial) con tarjeta vía Stripe, o ver los
 * datos para transferencia. El abono se atribuye al mes en curso.
 */
export default function PagoExtraPortal({
  cliente,
  extra,
  saldo,
  periodoAbono,
}: Props) {
  const { subirComprobanteExtra, getComprobantesExtra } = useClientes();
  const [metodo, setMetodo] = useState<null | "tarjeta" | "transferencia">(null);
  const [montoInput, setMontoInput] = useState<string>(String(saldo));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [subiendoComp, setSubiendoComp] = useState(false);
  const [compError, setCompError] = useState<string | null>(null);
  const [compOk, setCompOk] = useState(false);

  const comprobantes = getComprobantesExtra(cliente.id, extra.id);

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
    const permitidos = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!permitidos.includes(file.type)) {
      setCompError("Usa imagen (JPG, PNG) o PDF.");
      return;
    }
    if (monto <= 0) {
      setCompError("Captura el monto que transferiste.");
      return;
    }
    setSubiendoComp(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      subirComprobanteExtra(cliente.id, extra.id, periodoAbono, monto, {
        nombreArchivo: file.name,
        tipoMime: file.type,
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

  const copiarClabe = async () => {
    try {
      await navigator.clipboard.writeText(DATOS_BANCARIOS_PORTAL.clabe);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-amber-100">
      {metodo === null ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMetodo("tarjeta")}
            className="flex-1 min-w-[8rem] py-2.5 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700"
          >
            Pagar con tarjeta
          </button>
          <button
            type="button"
            onClick={() => setMetodo("transferencia")}
            className="flex-1 min-w-[8rem] py-2.5 rounded-xl bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-800"
          >
            Pagar por transferencia
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              {metodo === "tarjeta" ? "Pago con tarjeta" : "Pago por transferencia"}
            </p>
            <button
              type="button"
              onClick={() => {
                setMetodo(null);
                setError(null);
              }}
              className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
            >
              ← Otras opciones
            </button>
          </div>

          {/* Monto a abonar (permite pago parcial). */}
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
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-black tabular-nums text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
              <button
                type="button"
                onClick={() => setMontoInput(String(saldo))}
                className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 whitespace-nowrap"
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

          {metodo === "tarjeta" ? (
            <>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-slate-600">Abono</span>
                  <span className="font-black text-slate-800 tabular-nums">
                    {fmtMxn(desglose.montoHonorarios, 2)}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-slate-500">
                    Comisión plataforma ({(COMISION_PLATAFORMA_PCT * 100).toFixed(0)}%)
                  </span>
                  <span className="font-black text-slate-600 tabular-nums">
                    {fmtMxn(desglose.comision, 2)}
                  </span>
                </div>
                <div className="flex justify-between gap-2 pt-2 border-t border-slate-200">
                  <span className="font-black text-slate-800">Total a pagar</span>
                  <span className="font-black text-indigo-700 text-base tabular-nums">
                    {fmtMxn(desglose.total, 2)}
                  </span>
                </div>
              </div>
              {!stripeHabilitado ? (
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  El pago con tarjeta no está disponible por ahora. Usa
                  transferencia.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={iniciarPagoTarjeta}
                  disabled={cargando || monto <= 0}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-600/25 hover:bg-emerald-700 disabled:opacity-60"
                >
                  {cargando ? "Redirigiendo a Stripe…" : "Pagar con tarjeta"}
                </button>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-3 text-sm">
              <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                Transfiere por <span className="font-black">SPEI</span> sin
                comisión. Después de transferir, avísale a tu contador para que
                registre tu abono.
              </p>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  Banco
                </p>
                <p className="font-black text-slate-800">
                  {DATOS_BANCARIOS_PORTAL.banco}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  Titular
                </p>
                <p className="font-black text-slate-800">
                  {DATOS_BANCARIOS_PORTAL.titular}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  CLABE interbancaria
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-slate-900 text-base tracking-wide tabular-nums">
                    {DATOS_BANCARIOS_PORTAL.clabeDisplay}
                  </span>
                  <button
                    type="button"
                    onClick={copiarClabe}
                    className="px-3 py-1.5 rounded-lg bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-800"
                  >
                    {copiado ? "Copiada" : "Copiar CLABE"}
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  Monto a transferir
                </p>
                <p className="text-2xl font-black text-emerald-700 tabular-nums">
                  {fmtMxn(monto, 2)}
                </p>
              </div>

              {/* Comprobante del abono extra */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
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
                              : "bg-indigo-50 border-indigo-100"
                          }`}
                        >
                          <p
                            className={`text-[9px] font-black uppercase tracking-widest ${
                              aceptado ? "text-emerald-700" : "text-indigo-700"
                            }`}
                          >
                            {aceptado ? "Abono validado" : "En validación"}
                            {cmp.montoDeclarado
                              ? ` · ${fmtMxn(cmp.montoDeclarado)}`
                              : ""}
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
                  className="w-full py-2.5 rounded-xl bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-800 disabled:opacity-60"
                >
                  {subiendoComp
                    ? "Enviando…"
                    : comprobantes.length > 0
                      ? "Subir otro comprobante"
                      : "Subir comprobante"}
                </button>
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed">
                  PDF o imagen · máx. 3 MB. Tu contador valida el monto y lo
                  aplica a tu saldo.
                </p>
                {compError && (
                  <p className="text-[10px] font-bold text-red-600">{compError}</p>
                )}
                {compOk && (
                  <p className="text-[10px] font-bold text-emerald-600">
                    ¡Comprobante recibido! Quedó en validación.
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="text-[11px] font-bold text-red-600 text-center">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
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

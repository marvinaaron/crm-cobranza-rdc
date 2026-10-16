"use client";

import Link from "next/link";
import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  esIngresoGeneralCliente,
  estaPagado,
  tienePagoParcial,
  getMontoMes,
  getCompromisoMes,
  getSaldoMes,
  periodoKey,
  clienteActivoEnPeriodo,
  getTotalHonorariosCliente,
  getTotalAdicionalesAnio,
  getTotalPendiente,
} from "@/lib/clientes";
import { etiquetaRegimenCliente } from "@/lib/regimenes-fiscales";
import { etiquetaEstadoAvisoPrivacidad } from "@/lib/aviso-privacidad";
import { mesesContabilidadPendientes } from "@/lib/cobranza-workflow";
import { normalizarDiaContabilidad } from "@/lib/admin/dia-contabilidad";
import { waLinkTelefono } from "@/lib/telefono";
import PedirCapturaPortal from "@/components/admin/PedirCapturaPortal";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  getCumplimientoPeriodo: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined;
  onClose: () => void;
  onEditar: () => void;
  onPortal: () => void;
  onEliminar: () => void;
};

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function fechaCorta(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export default function FichaClienteCartera({
  cliente,
  periodo,
  getCumplimientoPeriodo,
  onClose,
  onEditar,
  onPortal,
  onEliminar,
}: Props) {
  const esIngreso = esIngresoGeneralCliente(cliente);
  const regimen = etiquetaRegimenCliente(cliente.regimenFiscalClave);
  const aviso = etiquetaEstadoAvisoPrivacidad(cliente.avisoPrivacidad);
  const avisoFecha = fechaCorta(cliente.avisoPrivacidad?.aceptadoEn);
  const diaConta = normalizarDiaContabilidad(cliente.diaContabilidad);
  const contaPend = mesesContabilidadPendientes(cliente, periodo, getCumplimientoPeriodo);
  const historialCuota = (cliente.historialHonorarios?.length
    ? [...cliente.historialHonorarios]
    : [{ mes: cliente.inicioMes, monto: cliente.honorarios }]
  ).sort((a, b) => a.mes - b.mes);

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar detalle"
        className="fixed inset-x-0 top-14 bottom-[104px] lg:inset-0 z-40 bg-slate-900/50 cursor-default"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 top-14 bottom-[104px] lg:inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
        <div
          className="relative z-50 bg-white w-full max-w-[440px] lg:max-w-[56rem] h-full max-h-full lg:max-h-[min(90vh,860px)] shadow-[0_24px_80px_rgba(0,0,0,0.18)] rounded-[1.5rem] lg:rounded-[2rem] flex flex-col pointer-events-auto border border-slate-100 animate-in zoom-in-95 duration-300 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-5 shrink-0 border-b border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <button
                type="button"
                onClick={onClose}
                className="text-[12px] font-semibold text-slate-400 hover:text-violet-600"
              >
                ← Regresar
              </button>
              <button type="button" onClick={onClose} className="p-2 text-slate-300 hover:text-red-500">
                <CloseIcon />
              </button>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug line-clamp-2">
              {cliente.razonSocial}
            </h2>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wide mt-0.5">
              {cliente.rfc}
              <span className="mx-1.5 text-slate-300">·</span>
              {cliente.esPersonaMoral ? "Persona moral" : "Persona física"}
              <span className="mx-1.5 text-slate-300">·</span>
              {regimen}
            </p>
            <p className="text-[12px] text-slate-500 mt-1">
              Relación desde {MESES_NOM[cliente.inicioMes]} {cliente.inicioAnio}
            </p>
            {cliente.email ? (
              <p className="text-[13px] text-violet-600 mt-1 truncate">{cliente.email}</p>
            ) : null}
            {cliente.whatsapp
              ? (() => {
                  const wa = waLinkTelefono(cliente.whatsapp);
                  return wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[13px] text-emerald-600 mt-0.5 block truncate hover:underline"
                    >
                      WhatsApp {cliente.whatsapp}
                    </a>
                  ) : (
                    <p className="text-[13px] text-emerald-600 mt-0.5 truncate">{cliente.whatsapp}</p>
                  );
                })()
              : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onEditar}
                className="inline-flex items-center h-9 px-3 rounded-full text-[13px] font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
              >
                Editar
              </button>
              {!esIngreso ? (
                <button
                  type="button"
                  onClick={onPortal}
                  className="inline-flex items-center h-9 px-3 rounded-full text-[13px] font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
                >
                  Portal
                </button>
              ) : null}
              <Link
                href={`/cobranza?cliente=${cliente.id}&accion=pago`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center h-9 px-3 rounded-full text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Cobrar
              </Link>
              {!esIngreso ? (
                <button
                  type="button"
                  onClick={onEliminar}
                  className="inline-flex items-center h-9 px-3 rounded-full text-[13px] font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Eliminar
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden lg:grid lg:grid-cols-5">
            <div className="lg:col-span-2 lg:overflow-y-auto px-4 sm:px-6 py-4 space-y-3 border-b lg:border-b-0 lg:border-r border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <Dato
                  etiqueta="Honorarios"
                  valor={
                    esIngreso ? "Variable" : `$${cliente.honorarios.toLocaleString()}`
                  }
                />
                <Dato etiqueta="Se cobra" valor={`Día ${cliente.fechaPago}`} />
                <Dato etiqueta="Régimen" valor={regimen} />
                <Dato
                  etiqueta="Aviso de privacidad"
                  valor={
                    aviso.tono === "ok" && avisoFecha
                      ? `Aceptado · ${avisoFecha}`
                      : aviso.label
                  }
                  tono={aviso.tono === "ok" ? "ok" : aviso.tono === "pendiente" ? "warn" : "muted"}
                />
                <Dato
                  etiqueta="Contabilidad"
                  valor={diaConta ? `Se trabaja el día ${diaConta}` : "Sin día asignado"}
                />
                <Dato
                  etiqueta="Meses pendientes"
                  valor={
                    esIngreso
                      ? "—"
                      : contaPend.cantidad === 0
                        ? "Al corriente"
                        : `${contaPend.cantidad} mes${contaPend.cantidad === 1 ? "" : "es"}`
                  }
                  tono={contaPend.cantidad > 0 ? "warn" : "ok"}
                />
              </div>

              {contaPend.cantidad > 0 ? (
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  {contaPend.etiquetas.slice(0, 8).join(", ")}
                  {contaPend.etiquetas.length > 8 ? "…" : ""}.{" "}
                  <Link
                    href={`/cumplimiento?cliente=${cliente.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-violet-600 hover:underline"
                  >
                    Cumplimiento
                  </Link>
                </p>
              ) : null}

              {!esIngreso ? (
                <div className="rounded-[1.25rem] bg-slate-50 px-3.5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Cómo se cobra
                  </p>
                  <p className="text-[13px] text-slate-800">
                    Mensual ${cliente.honorarios.toLocaleString()} · cada día {cliente.fechaPago}
                  </p>
                  {historialCuota.length > 1 ? (
                    <ul className="mt-2 space-y-1 text-[12px] text-slate-600">
                      {historialCuota.map((h) => (
                        <li key={`${h.mes}-${h.monto}`}>
                          Desde {MESES_NOM[h.mes]}: ${h.monto.toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              {!esIngreso ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Pedir captura
                  </p>
                  <PedirCapturaPortal cliente={cliente} tipo="impuestos" variante="compacto" />
                  <PedirCapturaPortal cliente={cliente} tipo="honorarios" variante="compacto" />
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-3 flex flex-col min-h-0">
              <p className="px-4 sm:px-6 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
                Historial de pago · {periodo.anio}
              </p>
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-1 space-y-1.5 scrollbar-hide min-h-0">
                {MESES_NOM.map((m, i) => {
                  const p: Periodo = { mes: i, anio: periodo.anio };
                  const previoInicio = !clienteActivoEnPeriodo(cliente, p);
                  const esFuturo = periodoKey(p) > periodoKey(periodo);
                  const enVista = !previoInicio && !esFuturo;
                  const pagado = estaPagado(cliente, p);
                  const parcial = tienePagoParcial(cliente, p);
                  const sinPagar = enVista && !pagado && !parcial;
                  const esPasado = enVista && periodoKey(p) < periodoKey(periodo);
                  const vencido = sinPagar && esPasado;
                  const pendiente = sinPagar && !esPasado;
                  const saldo = getSaldoMes(cliente, p);
                  const montoDeEsteMes =
                    pagado || parcial
                      ? getMontoMes(cliente, p)
                      : getCompromisoMes(cliente, p);

                  return (
                    <div
                      key={m}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${
                        enVista
                          ? "bg-white border-slate-100"
                          : "bg-slate-50/50 opacity-30 border-transparent"
                      } ${i === periodo.mes ? "ring-1 ring-violet-200" : ""}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-2 h-2 shrink-0 rounded-full ${
                            pagado
                              ? "bg-emerald-500"
                              : vencido
                                ? "bg-red-500"
                                : parcial
                                  ? "bg-amber-500"
                                  : pendiente
                                    ? "bg-orange-400"
                                    : "bg-slate-200"
                          }`}
                        />
                        <p className="text-sm font-semibold text-slate-800 truncate">{m}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-[15px] font-semibold tabular-nums text-slate-700">
                          {previoInicio ? "—" : `$${montoDeEsteMes.toLocaleString()}`}
                        </p>
                        {pagado ? (
                          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Pagado</p>
                        ) : null}
                        {parcial ? (
                          <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
                            Parcial · ${saldo.toLocaleString()}
                          </p>
                        ) : null}
                        {vencido ? (
                          <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wide">Atrasado</p>
                        ) : null}
                        {pendiente ? (
                          <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide">Pendiente</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 sm:p-4 bg-[#0F172A] text-white shrink-0">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Honorarios</p>
                    <p className="text-sm sm:text-base font-bold text-emerald-400 tabular-nums">
                      ${getTotalHonorariosCliente(cliente).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Adicionales {periodo.anio}</p>
                    <p className="text-sm sm:text-base font-bold text-violet-400 tabular-nums">
                      ${getTotalAdicionalesAnio(cliente, periodo.anio).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Pendiente</p>
                    <p className="text-sm sm:text-base font-bold text-indigo-300 tabular-nums">
                      ${getTotalPendiente(cliente, periodo).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Dato({
  etiqueta,
  valor,
  tono = "default",
}: {
  etiqueta: string;
  valor: string;
  tono?: "default" | "ok" | "warn" | "muted";
}) {
  const color =
    tono === "ok"
      ? "text-emerald-700"
      : tono === "warn"
        ? "text-orange-700"
        : tono === "muted"
          ? "text-slate-500"
          : "text-slate-900";
  return (
    <div className="rounded-[1.25rem] bg-slate-50 px-3 py-2.5 min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
        {etiqueta}
      </p>
      <p className={`mt-0.5 text-[13px] font-semibold leading-tight ${color}`}>{valor}</p>
    </div>
  );
}

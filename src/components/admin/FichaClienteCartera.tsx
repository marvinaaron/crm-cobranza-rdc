"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  esIngresoGeneralCliente,
  estadoCumpleanos,
  fechaNacimientoDeRFC,
  formatearFechaNacimientoCorta,
  alertasFichaCliente,
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
import AvatarCliente from "@/components/admin/AvatarCliente";
import CropAvatarModal from "@/components/admin/CropAvatarModal";
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
  onFotoCambio?: (foto: {
    fotoPerfilUrl?: string;
    fotoPerfilPath?: string;
  }) => void;
  onFelicitarCumple?: () => void;
  enviandoCumple?: boolean;
};

function fechaCorta(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

const Ico = {
  close: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  edit: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  ),
  lock: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  cobro: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  mail: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  cash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="8" /><path d="M12 8v8M9.5 10.5c.5-1 1.5-1.5 2.5-1.5s2 .6 2 1.7c0 2.3-5 1.2-5 3.6 0 1 .9 1.7 2.2 1.7 1.1 0 2-.5 2.4-1.3" />
    </svg>
  ),
  shield: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  folder: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  alert: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  camera: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  cake: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <path d="M2 21h20" />
      <path d="M7 8v2M12 8v2M17 8v2M7 4v2M12 4v2M17 4v2" />
    </svg>
  ),
};

export default function FichaClienteCartera({
  cliente,
  periodo,
  getCumplimientoPeriodo,
  onClose,
  onEditar,
  onPortal,
  onEliminar,
  onFotoCambio,
  onFelicitarCumple,
  enviandoCumple,
}: Props) {
  const esIngreso = esIngresoGeneralCliente(cliente);
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [guardandoFoto, setGuardandoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const regimen = etiquetaRegimenCliente(cliente.regimenFiscalClave);
  const aviso = etiquetaEstadoAvisoPrivacidad(cliente.avisoPrivacidad);
  const avisoFecha = fechaCorta(cliente.avisoPrivacidad?.aceptadoEn);
  const diaConta = normalizarDiaContabilidad(cliente.diaContabilidad);
  const contaPend = mesesContabilidadPendientes(cliente, periodo, getCumplimientoPeriodo);
  const faltantes = alertasFichaCliente(cliente);
  const historialCuota = (cliente.historialHonorarios?.length
    ? [...cliente.historialHonorarios]
    : [{ mes: cliente.inicioMes, monto: cliente.honorarios }]
  ).sort((a, b) => a.mes - b.mes);
  const wa = cliente.whatsapp ? waLinkTelefono(cliente.whatsapp) : null;
  const estadoCumple = esIngreso ? "sin_fecha" : estadoCumpleanos(cliente);
  const mostrarCumple =
    estadoCumple === "hoy" ||
    estadoCumple === "mes_actual" ||
    estadoCumple === "ya_notificado";
  const fechaNac = fechaNacimientoDeRFC(cliente.rfc, cliente.esPersonaMoral);
  const fechaTexto = fechaNac ? formatearFechaNacimientoCorta(fechaNac) : "";

  async function confirmarFoto(blob: Blob) {
    setGuardandoFoto(true);
    setErrorFoto(null);
    try {
      const fd = new FormData();
      fd.append("clienteId", String(cliente.id));
      fd.append("file", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      const r = await fetch("/api/admin/clientes/foto", { method: "POST", body: fd });
      const data = (await r.json()) as {
        fotoPerfilUrl?: string;
        fotoPerfilPath?: string;
        error?: string;
      };
      if (!r.ok) throw new Error(data.error || "No se pudo guardar la foto.");
      onFotoCambio?.({
        fotoPerfilUrl: data.fotoPerfilUrl,
        fotoPerfilPath: data.fotoPerfilPath,
      });
      setCropFile(null);
    } catch (e) {
      setErrorFoto(e instanceof Error ? e.message : "No se pudo guardar la foto.");
    } finally {
      setGuardandoFoto(false);
    }
  }

  async function quitarFoto() {
    setGuardandoFoto(true);
    setErrorFoto(null);
    try {
      const r = await fetch(`/api/admin/clientes/foto?clienteId=${cliente.id}`, {
        method: "DELETE",
      });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(data.error || "No se pudo quitar la foto.");
      onFotoCambio?.({});
    } catch (e) {
      setErrorFoto(e instanceof Error ? e.message : "No se pudo quitar la foto.");
    } finally {
      setGuardandoFoto(false);
    }
  }

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
          className="relative z-50 bg-white w-full max-w-[440px] lg:max-w-[50rem] h-full max-h-full lg:h-auto lg:max-h-[min(90vh,840px)] shadow-[0_24px_80px_rgba(0,0,0,0.18)] rounded-[1.5rem] lg:rounded-[2rem] flex flex-col pointer-events-auto border border-slate-100 animate-in zoom-in-95 duration-300 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pt-3 pb-3 sm:px-6 shrink-0 border-b border-slate-100">
            <div className="flex items-start gap-3">
              {!esIngreso ? (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => inputFotoRef.current?.click()}
                    disabled={guardandoFoto}
                    className="relative rounded-full ring-2 ring-white shadow-sm disabled:opacity-60"
                    aria-label={cliente.fotoPerfilUrl ? "Cambiar foto de perfil" : "Agregar foto de perfil"}
                    title={cliente.fotoPerfilUrl ? "Cambiar foto" : "Agregar foto"}
                  >
                    <AvatarCliente cliente={cliente} size="lg" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-violet-600 text-white inline-flex items-center justify-center shadow ring-2 ring-white">
                      {Ico.camera}
                    </span>
                  </button>
                  <input
                    ref={inputFotoRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) setCropFile(f);
                    }}
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug line-clamp-2">
                  {cliente.razonSocial}
                </h2>
                <p className="text-[12px] font-mono text-slate-500 uppercase tracking-wide mt-0.5">
                  {cliente.rfc}
                </p>
                {!esIngreso ? (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <button
                      type="button"
                      onClick={() => inputFotoRef.current?.click()}
                      disabled={guardandoFoto}
                      className="text-[12px] font-semibold text-violet-700 hover:text-violet-900 disabled:opacity-50"
                    >
                      {cliente.fotoPerfilUrl ? "Cambiar foto" : "Agregar foto"}
                    </button>
                    {cliente.fotoPerfilUrl ? (
                      <button
                        type="button"
                        onClick={() => void quitarFoto()}
                        disabled={guardandoFoto}
                        className="text-[12px] font-semibold text-slate-400 hover:text-rose-600 disabled:opacity-50"
                      >
                        Quitar
                      </button>
                    ) : null}
                    {errorFoto ? (
                      <span className="text-[11px] font-medium text-rose-600">{errorFoto}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {mostrarCumple && onFelicitarCumple ? (
                <button
                  type="button"
                  disabled={estadoCumple !== "hoy" || enviandoCumple}
                  onClick={onFelicitarCumple}
                  title={
                    estadoCumple === "ya_notificado"
                      ? "Felicitación ya enviada este año"
                      : estadoCumple === "hoy"
                        ? `Enviar felicitación a ${cliente.razonSocial}`
                        : `Cumpleaños este mes (${fechaTexto})`
                  }
                  aria-label="Felicitación de cumpleaños"
                  className={`h-9 w-9 inline-flex items-center justify-center rounded-full shrink-0 ${
                    estadoCumple === "ya_notificado"
                      ? "text-emerald-500 hover:bg-emerald-50"
                      : estadoCumple === "hoy"
                        ? "text-violet-600 bg-violet-50 ring-1 ring-violet-200 hover:bg-violet-100"
                        : "text-violet-500 hover:bg-violet-50"
                  } disabled:cursor-not-allowed`}
                >
                  {estadoCumple === "ya_notificado" ? Ico.check : Ico.cake}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
              >
                {Ico.close}
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-600">
              {cliente.email ? (
                <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
                  <span className="text-violet-500">{Ico.mail}</span>
                  <span className="truncate">{cliente.email}</span>
                </span>
              ) : null}
              {cliente.whatsapp ? (
                wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-emerald-600 hover:underline"
                  >
                    {Ico.phone}
                    {cliente.whatsapp}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    {Ico.phone}
                    {cliente.whatsapp}
                  </span>
                )
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                {Ico.calendar}
                Desde {MESES_NOM[cliente.inicioMes].slice(0, 3)} {cliente.inicioAnio}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onEditar}
                title="Editar"
                aria-label="Editar cliente"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
              >
                {Ico.edit}
                Editar
              </button>
              {!esIngreso ? (
                <button
                  type="button"
                  onClick={onPortal}
                  title="Acceso al portal"
                  aria-label="Acceso al portal"
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
                >
                  {Ico.lock}
                  Portal
                </button>
              ) : null}
              <Link
                href={`/cobranza?cliente=${cliente.id}&accion=pago`}
                onClick={(e) => e.stopPropagation()}
                title="Registrar cobro"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {Ico.cobro}
                Cobrar
              </Link>
              {!esIngreso ? (
                <button
                  type="button"
                  onClick={onEliminar}
                  title="Eliminar cliente"
                  aria-label="Eliminar cliente"
                  className="ml-auto h-9 w-9 inline-flex items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  {Ico.trash}
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-visible lg:grid lg:grid-cols-[minmax(0,1fr)_23rem]">
            <div className="px-4 sm:px-5 py-4 space-y-3 border-b lg:border-b-0 lg:border-r border-slate-100">
              {faltantes.length > 0 ? (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-[1.1rem] bg-orange-50 px-3 py-2.5 text-[13px] text-orange-900"
                >
                  <span className="shrink-0 mt-0.5 text-orange-500">{Ico.alert}</span>
                  <p>
                    Falta {faltantes.join(", ")}. Complétalo con Editar antes de contactar o facturar.
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                <Dato
                  icono={Ico.cash}
                  etiqueta="Honorarios"
                  valor={esIngreso ? "Variable" : `$${cliente.honorarios.toLocaleString()}`}
                />
                <Dato icono={Ico.calendar} etiqueta="Se cobra" valor={`Día ${cliente.fechaPago}`} />
                <Dato icono={Ico.folder} etiqueta="Régimen" valor={regimen} />
                <Dato
                  icono={Ico.shield}
                  etiqueta="Aviso"
                  valor={
                    aviso.tono === "ok" && avisoFecha
                      ? `Aceptado · ${avisoFecha}`
                      : aviso.label
                  }
                  tono={aviso.tono === "ok" ? "ok" : aviso.tono === "pendiente" ? "warn" : "muted"}
                />
                <Dato
                  icono={Ico.folder}
                  etiqueta="Contabilidad"
                  valor={diaConta ? `Día ${diaConta}` : "Sin día"}
                />
                <Dato
                  icono={Ico.alert}
                  etiqueta="Pendientes SAT"
                  valor={
                    esIngreso
                      ? "—"
                      : contaPend.cantidad === 0
                        ? "Al corriente"
                        : `${contaPend.cantidad}`
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

              {historialCuota.length > 1 ? (
                <div className="rounded-[1.25rem] bg-slate-50 px-3.5 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Cambios de cuota
                  </p>
                  <ul className="space-y-0.5 text-[12px] text-slate-600">
                    {historialCuota.map((h) => (
                      <li key={`${h.mes}-${h.monto}`}>
                        Desde {MESES_NOM[h.mes].slice(0, 3)}: ${h.monto.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {!esIngreso ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Captura de pago
                  </p>
                  <p className="text-[12px] text-slate-500 leading-snug">
                    WhatsApp o liga para que suba la captura al portal.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <PedirCapturaPortal cliente={cliente} tipo="impuestos" variante="compacto" />
                    <PedirCapturaPortal cliente={cliente} tipo="honorarios" variante="compacto" />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col min-h-0">
              <p className="px-4 sm:px-5 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
                Pagos {periodo.anio}
              </p>
              <div className="px-3 sm:px-4 pb-2">
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
                      className={`flex items-center gap-2 h-8 px-2 rounded-lg ${
                        i === periodo.mes ? "bg-violet-50" : ""
                      } ${!enVista ? "opacity-30" : ""}`}
                    >
                      <span className="w-8 shrink-0 text-[11px] font-semibold uppercase text-slate-500">
                        {m.slice(0, 3)}
                      </span>
                      <span className="flex-1 text-[13px] font-semibold tabular-nums text-slate-800">
                        {previoInicio ? "—" : `$${montoDeEsteMes.toLocaleString()}`}
                      </span>
                      {pagado ? (
                        <span className="text-emerald-500" title="Pagado">{Ico.check}</span>
                      ) : vencido ? (
                        <span className="text-red-500" title="Atrasado">{Ico.alert}</span>
                      ) : parcial ? (
                        <span className="text-[10px] font-semibold text-amber-600" title={`Parcial · $${saldo.toLocaleString()}`}>
                          ½
                        </span>
                      ) : pendiente ? (
                        <span className="h-2 w-2 rounded-full bg-orange-400" title="Pendiente" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-200" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-auto p-3 bg-[#0F172A] text-white shrink-0">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Honorarios</p>
                    <p className="text-sm font-bold text-emerald-400 tabular-nums">
                      ${getTotalHonorariosCliente(cliente).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Adicionales</p>
                    <p className="text-sm font-bold text-violet-400 tabular-nums">
                      ${getTotalAdicionalesAnio(cliente, periodo.anio).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Pendiente</p>
                    <p className="text-sm font-bold text-indigo-300 tabular-nums">
                      ${getTotalPendiente(cliente, periodo).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CropAvatarModal
        open={!!cropFile}
        file={cropFile}
        onConfirmar={confirmarFoto}
        onCancelar={() => setCropFile(null)}
      />
    </>
  );
}

function Dato({
  icono,
  etiqueta,
  valor,
  tono = "default",
}: {
  icono: ReactNode;
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
    <div className="rounded-[1.1rem] bg-slate-50 px-3 py-2 min-w-0">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
        <span className="shrink-0 opacity-70">{icono}</span>
        {etiqueta}
      </p>
      <p className={`mt-0.5 text-[13px] font-semibold leading-tight truncate ${color}`}>{valor}</p>
    </div>
  );
}

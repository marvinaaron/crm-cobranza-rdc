"use client";

import { useMemo, useState } from "react";
import {
  type Cliente,
  type Periodo,
  getSaldoMes,
  getCompromisoMes,
  getTotalPendiente,
  periodoLabel,
} from "@/lib/clientes";
import {
  CORREO_TIPOS,
  abrirCorreoCobranza,
  enviarCorreosMasivo,
  enviarCorreoCobranzaResend,
  DESPACHO_EMAIL,
  type TipoCorreoCobranza,
} from "@/lib/correo";
import EstadoBadge from "@/components/EstadoBadge";
import { useConfirm, useNotify } from "@/components/ConfirmProvider";

type Props = {
  tipo: TipoCorreoCobranza;
  clientes: Cliente[];
  periodo: Periodo;
  programadosHoy?: number;
  onClose: () => void;
};

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export default function ModalCampanaCorreo({
  tipo,
  clientes,
  periodo,
  programadosHoy = 0,
  onClose,
}: Props) {
  const meta = CORREO_TIPOS[tipo];
  const confirm = useConfirm();
  const notify = useNotify();
  const [excluidos, setExcluidos] = useState<Set<number>>(new Set());
  const [enviando, setEnviando] = useState(false);
  const [progreso, setProgreso] = useState<{ hechos: number; total: number; ok: number; fallos: number } | null>(null);

  const aEnviar = useMemo(
    () => clientes.filter((c) => !excluidos.has(c.id)),
    [clientes, excluidos]
  );

  const toggleExcluido = (id: number) => {
    setExcluidos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enviarPorGmail = async () => {
    if (aEnviar.length === 0) return;
    const ok = await confirm({
      titulo: "Abrir borradores en Gmail",
      mensaje: `Se abrirán ${aEnviar.length} borrador(es) en Gmail (${DESPACHO_EMAIL}), uno por cliente. Revisa y pulsa Enviar en cada pestaña.`,
      textoConfirmar: "Abrir borradores",
      tono: "info",
    });
    if (!ok) return;
    enviarCorreosMasivo(aEnviar, periodo, tipo);
    onClose();
  };

  const enviarPorResend = async () => {
    if (aEnviar.length === 0) return;
    const sinCorreo = aEnviar.filter((c) => !c.email?.trim()).length;
    const total = aEnviar.length - sinCorreo;
    if (total === 0) {
      await notify({
        titulo: "Sin destinatarios",
        mensaje: "Ningún cliente de la lista tiene correo registrado.",
        tono: "warning",
      });
      return;
    }
    const ok = await confirm({
      titulo: "Enviar ahora desde el dominio del despacho",
      mensaje:
        `Se enviarán ${total} correo(s) con la plantilla HTML directamente desde Resend (no abre Gmail). ` +
        (sinCorreo > 0
          ? `${sinCorreo} cliente(s) sin correo se omitirán.`
          : "Cada cliente recibirá el correo formateado al instante."),
      textoConfirmar: `Enviar ${total} ahora`,
      tono: "info",
    });
    if (!ok) return;
    setEnviando(true);
    setProgreso({ hechos: 0, total, ok: 0, fallos: 0 });
    let okCount = 0;
    let fallos = 0;
    for (const cliente of aEnviar) {
      if (!cliente.email?.trim()) continue;
      const resultado = await enviarCorreoCobranzaResend(cliente, periodo, tipo);
      if (resultado.ok) okCount += 1;
      else fallos += 1;
      setProgreso((prev) =>
        prev
          ? { ...prev, hechos: prev.hechos + 1, ok: okCount, fallos }
          : null
      );
      await new Promise((r) => setTimeout(r, 120));
    }
    setEnviando(false);
    await notify({
      titulo:
        fallos === 0
          ? "Campaña enviada"
          : okCount === 0
            ? "No se pudo enviar"
            : "Campaña enviada con incidencias",
      mensaje:
        fallos === 0
          ? `Se enviaron ${okCount} correo(s) con la plantilla HTML del despacho.`
          : okCount === 0
            ? "Ningún correo se envió. Revisa la configuración de Resend (RESEND_API_KEY y dominio verificado)."
            : `Se enviaron ${okCount} correo(s). ${fallos} fallaron — revisa que el dominio esté verificado en Resend.`,
      tono: fallos === 0 ? "info" : fallos === okCount + fallos ? "danger" : "warning",
    });
    if (okCount > 0) onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[85vh] rounded-[2rem] border border-slate-100 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-50 flex-none">
          <div className="flex justify-between items-start gap-3 mb-3">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Revisión de campaña · {periodoLabel(periodo)}
              </p>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                {meta.label}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mt-1">{meta.descripcion}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 text-slate-300 hover:text-red-500">
              <CloseIcon />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
              {aEnviar.length} de {clientes.length} a enviar
            </span>
            {programadosHoy > 0 && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest">
                Día programado hoy
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">
              {meta.momento}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] leading-snug">
            <div className="rounded-xl bg-violet-50/70 border border-violet-100 px-3 py-2">
              <p className="font-black uppercase tracking-widest text-[9px] text-violet-700 mb-1">
                Opción A · Enviar ahora
              </p>
              <p className="text-slate-600">
                Sale automático desde Resend con la plantilla HTML del despacho.
                El cliente lo recibe formateado al instante.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
              <p className="font-black uppercase tracking-widest text-[9px] text-slate-600 mb-1">
                Opción B · Abrir en Gmail
              </p>
              <p className="text-slate-600">
                Abre borradores en {DESPACHO_EMAIL} con texto plano para que tú los revises y envíes.
              </p>
            </div>
          </div>
          {progreso && (
            <div className="mt-3 rounded-xl bg-slate-900 text-white px-3 py-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] uppercase font-black tracking-widest text-white/70">
                  {enviando ? "Enviando…" : "Listo"}
                </p>
                <p className="text-[13px] font-black tabular-nums">
                  {progreso.hechos} / {progreso.total} · ✓ {progreso.ok}
                  {progreso.fallos > 0 ? ` · ✗ ${progreso.fallos}` : ""}
                </p>
              </div>
              <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-200"
                  style={{
                    width:
                      progreso.total > 0
                        ? `${(progreso.hechos / progreso.total) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
          {clientes.length === 0 ? (
            <p className="text-center py-12 text-slate-400 text-sm font-bold">
              No hay clientes pendientes para este correo en {periodoLabel(periodo)}.
            </p>
          ) : (
            clientes.map((c) => {
              const saldo = getSaldoMes(c, periodo) || getCompromisoMes(c, periodo);
              const excluido = excluidos.has(c.id);
              return (
                <div
                  key={c.id}
                  className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                    excluido
                      ? "border-slate-100 bg-slate-50/80 opacity-60"
                      : "border-slate-100 bg-white shadow-sm"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!excluido}
                    onChange={() => toggleExcluido(c.id)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{c.razonSocial}</p>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                      {c.rfc} · Día {c.fechaPago}
                    </p>
                    {c.email && (
                      <p className="text-[10px] text-indigo-500 font-bold truncate">{c.email}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-black text-amber-600">
                        ${saldo.toLocaleString()} pendiente
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Total: ${getTotalPendiente(c, periodo).toLocaleString()}
                      </span>
                      <EstadoBadge cliente={c} periodo={periodo} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirCorreoCobranza(c, periodo, tipo)}
                    className="shrink-0 text-[8px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 px-2 py-1"
                  >
                    Vista previa
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-50 flex flex-col sm:flex-row gap-2 flex-none bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={enviando}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void enviarPorGmail()}
            disabled={aEnviar.length === 0 || enviando}
            className="flex-1 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Abre un borrador en tu correo personal por cada cliente"
          >
            Abrir Gmail ({aEnviar.length})
          </button>
          <button
            type="button"
            onClick={() => void enviarPorResend()}
            disabled={aEnviar.length === 0 || enviando}
            className="flex-[2] py-3 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-300/40"
          >
            {enviando ? "Enviando…" : `Enviar ahora (${aEnviar.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

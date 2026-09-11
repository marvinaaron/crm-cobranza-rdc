"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SiteLead } from "@/lib/site-leads-db";
import {
  formatearCfdiLead,
  formatearFacturacionLead,
  leadTieneVolumen,
  volumenDesdeLeadRow,
} from "@/lib/lead-volumen";
import {
  ESTATUS_LEAD,
  ESTATUS_LEAD_CLASE,
  ESTATUS_LEAD_LABEL,
  MOTIVO_RECHAZO_MAX,
  MOTIVO_RECHAZO_MIN,
  type EstatusLead,
  validarMotivoRechazo,
} from "@/lib/lead-estatus";
import {
  etiquetaSemaforoLead,
  semaforoLead,
  type SemaforoLead,
} from "@/lib/lead-seguimiento";
import { EVENTO_LEAD_LABEL } from "@/lib/lead-bitacora";
import { partirMensajeLead } from "@/lib/lead-mensaje";
import { waLinkTelefono } from "@/lib/telefono";

type FiltroVolumen = "todos" | "con-info" | "sin-info";
type FiltroEstatus = "todos" | EstatusLead;
type FiltroSemaforo = "todos" | SemaforoLead;

function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function aDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function enHoras(h: number): string {
  return new Date(Date.now() + h * 3600_000).toISOString();
}

function mananaALas(hora: number): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hora, 0, 0, 0);
  return d.toISOString();
}

const PUNTO: Record<SemaforoLead, string> = {
  ok: "bg-emerald-500",
  atencion: "bg-amber-400",
  urgente: "bg-rose-500",
};

export default function ProspectosAdmin() {
  const [leads, setLeads] = useState<SiteLead[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroVolumen>("todos");
  const [filtroEstatus, setFiltroEstatus] = useState<FiltroEstatus>("todos");
  const [filtroSemaforo, setFiltroSemaforo] = useState<FiltroSemaforo>("todos");
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const [rechazo, setRechazo] = useState<{
    lead: SiteLead;
    motivo: string;
    error: string | null;
  } | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site-leads");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "No pudimos cargar los prospectos.");
        return;
      }
      if (Array.isArray(data?.leads)) {
        setLeads(data.leads as SiteLead[]);
      }
    } catch {
      setError("No pudimos cargar los prospectos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
    const recargar = () => void cargar();
    window.addEventListener("rdc:prospectos-actualizar", recargar);
    return () => window.removeEventListener("rdc:prospectos-actualizar", recargar);
  }, []);

  const porEstatus = useMemo(() => {
    const n: Record<EstatusLead, number> = {
      nuevo: 0,
      contactado: 0,
      aceptado: 0,
      rechazado: 0,
    };
    for (const l of leads) n[l.estatus] += 1;
    return n;
  }, [leads]);

  const urgentes = useMemo(
    () => leads.filter((l) => semaforoLead(l) === "urgente").length,
    [leads]
  );
  const atencion = useMemo(
    () => leads.filter((l) => semaforoLead(l) === "atencion").length,
    [leads]
  );

  const visibles = useMemo(() => {
    return leads.filter((l) => {
      if (filtroEstatus !== "todos" && l.estatus !== filtroEstatus) return false;
      if (filtroSemaforo !== "todos" && semaforoLead(l) !== filtroSemaforo) {
        return false;
      }
      if (filtro === "con-info") return leadTieneVolumen(volumenDesdeLeadRow(l));
      if (filtro === "sin-info") return !leadTieneVolumen(volumenDesdeLeadRow(l));
      return true;
    });
  }, [leads, filtro, filtroEstatus, filtroSemaforo]);

  async function patchLead(id: string, body: Record<string, unknown>) {
    setGuardandoId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/site-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "No se pudo actualizar.");
        return false;
      }
      if (data?.lead) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? (data.lead as SiteLead) : l))
        );
      }
      return true;
    } catch {
      setError("No se pudo actualizar.");
      return false;
    } finally {
      setGuardandoId(null);
    }
  }

  function onCambioEstatus(lead: SiteLead, estatus: EstatusLead) {
    if (estatus === lead.estatus) return;
    if (estatus === "rechazado") {
      setRechazo({ lead, motivo: lead.motivo_rechazo ?? "", error: null });
      return;
    }
    void patchLead(lead.id, { estatus });
  }

  async function confirmarRechazo() {
    if (!rechazo) return;
    const v = validarMotivoRechazo(rechazo.motivo);
    if (!v.ok) {
      setRechazo({ ...rechazo, error: v.error });
      return;
    }
    const ok = await patchLead(rechazo.lead.id, {
      estatus: "rechazado",
      motivoRechazo: v.motivo,
    });
    if (ok) setRechazo(null);
  }

  async function onWhatsApp(lead: SiteLead, wa: string) {
    void patchLead(lead.id, { evento: { tipo: "whatsapp" } });
    window.open(wa, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Prospectos web
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            El mensaje libre va primero. WhatsApp marca Contactado. Agenda el
            siguiente paso para que no se enfríen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void cargar()}
          disabled={cargando}
          className="self-start sm:self-auto h-9 px-3 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50"
        >
          Actualizar
        </button>
      </div>

      {(urgentes > 0 || atencion > 0) && (
        <div className="flex flex-wrap gap-2">
          {urgentes > 0 && (
            <button
              type="button"
              onClick={() => setFiltroSemaforo("urgente")}
              className="h-8 px-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold"
            >
              {urgentes} urgente{urgentes === 1 ? "" : "s"}
            </button>
          )}
          {atencion > 0 && (
            <button
              type="button"
              onClick={() => setFiltroSemaforo("atencion")}
              className="h-8 px-3 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold"
            >
              {atencion} por dar seguimiento
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ESTATUS_LEAD.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() =>
              setFiltroEstatus((prev) => (prev === id ? "todos" : id))
            }
            className={`rounded-xl border p-4 text-left transition ${
              filtroEstatus === id
                ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-white/5"
                : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {ESTATUS_LEAD_LABEL[id]}
            </p>
            <p className="mt-1 text-2xl font-black tabular-nums">
              {porEstatus[id]}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["todos", "Todos", leads.length],
            [
              "con-info",
              "Con info",
              leads.filter((l) => leadTieneVolumen(volumenDesdeLeadRow(l)))
                .length,
            ],
            ["sin-info", "Sin info", leads.filter((l) => !leadTieneVolumen(volumenDesdeLeadRow(l))).length],
          ] as [FiltroVolumen, string, number][]
        ).map(([id, label, n]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFiltro(id)}
            className={`h-8 px-3 rounded-lg text-xs font-semibold ${
              filtro === id
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "border border-slate-200 dark:border-white/10"
            }`}
          >
            {label} · {n}
          </button>
        ))}
        {filtroSemaforo !== "todos" && (
          <button
            type="button"
            onClick={() => setFiltroSemaforo("todos")}
            className="h-8 px-3 rounded-lg text-xs font-semibold border border-slate-200"
          >
            Quitar semáforo
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</p>
      )}

      {cargando ? (
        <p className="text-sm text-slate-500">Cargando prospectos…</p>
      ) : visibles.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
          {leads.length === 0
            ? "Cuando alguien envíe /empezar aparecerá aquí."
            : "Nadie en este filtro."}
        </div>
      ) : (
        <ul className="space-y-4">
          {visibles.map((lead) => {
            const sem = semaforoLead(lead);
            const partido = partirMensajeLead(lead.mensaje);
            const volumen = volumenDesdeLeadRow(lead);
            const facturacion = formatearFacturacionLead(volumen);
            const cfdi = formatearCfdiLead(volumen);
            const wa = waLinkTelefono(lead.telefono);
            const expandido = abiertoId === lead.id;
            const libre = partido.libre || lead.mensaje || "";
            return (
              <li
                key={lead.id}
                className={`rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden ${
                  sem === "urgente"
                    ? "border-rose-200 dark:border-rose-500/30"
                    : "border-slate-200 dark:border-white/10"
                }`}
              >
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full shrink-0 ${PUNTO[sem]}`}
                          title={etiquetaSemaforoLead(lead)}
                        />
                        <h2 className="text-base font-black text-slate-900 dark:text-white truncate">
                          {lead.nombre}
                        </h2>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {fechaCorta(lead.created_at)} · {etiquetaSemaforoLead(lead)}
                      </p>
                    </div>
                    <select
                      value={lead.estatus}
                      disabled={guardandoId === lead.id}
                      onChange={(e) =>
                        onCambioEstatus(lead, e.target.value as EstatusLead)
                      }
                      className={`h-8 rounded-lg px-2 text-[11px] font-semibold border-0 ${ESTATUS_LEAD_CLASE[lead.estatus]}`}
                    >
                      {ESTATUS_LEAD.map((id) => (
                        <option key={id} value={id}>
                          {ESTATUS_LEAD_LABEL[id]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {libre && (
                    <blockquote className="rounded-xl bg-violet-50 dark:bg-violet-500/10 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                      <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 mb-1">
                        En sus palabras
                      </p>
                      {libre}
                    </blockquote>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {facturacion && (
                      <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold">
                        {facturacion}
                      </span>
                    )}
                    {cfdi && (
                      <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold">
                        {cfdi}
                      </span>
                    )}
                    {partido.servicios.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-indigo-50 dark:bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-800 dark:text-indigo-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <a href={`mailto:${lead.email}`} className="text-violet-600 hover:underline">
                      {lead.email}
                    </a>
                    {lead.telefono && (
                      <span className="text-slate-500">{lead.telefono}</span>
                    )}
                    {wa && (
                      <button
                        type="button"
                        onClick={() => void onWhatsApp(lead, wa)}
                        className="font-bold text-emerald-600 hover:underline"
                      >
                        WhatsApp
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        void patchLead(lead.id, {
                          evento: { tipo: "cotizacion" },
                        })
                      }
                      className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-semibold"
                    >
                      Mandé cotización
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void patchLead(lead.id, { evento: { tipo: "llamada" } })
                      }
                      className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-semibold"
                    >
                      Tuve llamada
                    </button>
                    {lead.estatus !== "rechazado" && !lead.cliente_id && (
                      <Link
                        href={`/clientes?preLead=${lead.id}`}
                        className="h-8 px-2.5 rounded-lg bg-violet-600 text-white text-[11px] font-bold inline-flex items-center"
                      >
                        Alta en cartera
                      </Link>
                    )}
                    {lead.cliente_id && (
                      <Link
                        href={`/clientes?destacar=${lead.cliente_id}`}
                        className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-emerald-700"
                      >
                        Ya en cartera →
                      </Link>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-100 dark:border-white/10 p-3 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Siguiente paso
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          void patchLead(lead.id, {
                            siguientePasoEn: enHoras(2),
                            siguientePasoNota: "Seguimiento en 2 h",
                          })
                        }
                        className="h-7 px-2 rounded-md bg-slate-50 dark:bg-white/5 text-[10px] font-bold"
                      >
                        En 2 h
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void patchLead(lead.id, {
                            siguientePasoEn: mananaALas(10),
                            siguientePasoNota: "WhatsApp mañana 10:00",
                          })
                        }
                        className="h-7 px-2 rounded-md bg-slate-50 dark:bg-white/5 text-[10px] font-bold"
                      >
                        Mañana 10:00
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void patchLead(lead.id, {
                            siguientePasoEn: enHoras(72),
                            siguientePasoNota: "Revisar en 3 días",
                          })
                        }
                        className="h-7 px-2 rounded-md bg-slate-50 dark:bg-white/5 text-[10px] font-bold"
                      >
                        En 3 días
                      </button>
                      {lead.siguiente_paso_en && (
                        <button
                          type="button"
                          onClick={() =>
                            void patchLead(lead.id, { siguientePasoEn: null })
                          }
                          className="h-7 px-2 rounded-md text-[10px] font-bold text-slate-400"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                    <input
                      type="datetime-local"
                      value={
                        lead.siguiente_paso_en
                          ? aDatetimeLocal(lead.siguiente_paso_en)
                          : ""
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        void patchLead(lead.id, {
                          siguientePasoEn: v ? new Date(v).toISOString() : null,
                        });
                      }}
                      className="h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent px-2 text-xs"
                    />
                    {lead.siguiente_paso_nota && (
                      <p className="text-xs text-slate-500">
                        {lead.siguiente_paso_nota}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setAbiertoId(expandido ? null : lead.id)
                    }
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                  >
                    {expandido ? "Ocultar bitácora" : "Ver bitácora y detalle"}
                  </button>

                  {expandido && (
                    <div className="space-y-3 pt-1">
                      {partido.perfil.length > 0 && (
                        <p className="text-xs text-slate-500">
                          {partido.perfil.join(" · ")}
                        </p>
                      )}
                      {lead.estatus === "rechazado" && lead.motivo_rechazo && (
                        <p className="text-xs text-rose-700 whitespace-pre-wrap">
                          Rechazo: {lead.motivo_rechazo}
                        </p>
                      )}
                      {lead.bitacora.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          Aún no hay movimientos.
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {lead.bitacora.map((ev) => (
                            <li
                              key={ev.id}
                              className="text-xs text-slate-600 dark:text-slate-300"
                            >
                              <span className="font-semibold">
                                {EVENTO_LEAD_LABEL[ev.tipo] ?? ev.tipo}
                              </span>
                              {" · "}
                              {fechaCorta(ev.en)}
                              {ev.detalle ? ` · ${ev.detalle}` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {rechazo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-5 ring-1 ring-slate-200 dark:ring-white/10">
            <p className="text-base font-black">Motivo de rechazo</p>
            <p className="mt-1 text-sm text-slate-500">
              Obligatorio. Después la IA podrá leer por qué no cierran.
            </p>
            <textarea
              autoFocus
              value={rechazo.motivo}
              maxLength={MOTIVO_RECHAZO_MAX}
              onChange={(e) =>
                setRechazo({ ...rechazo, motivo: e.target.value, error: null })
              }
              rows={6}
              className="mt-3 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
            />
            <div className="mt-1 text-[11px] text-slate-400">
              Mínimo {MOTIVO_RECHAZO_MIN} · {rechazo.motivo.trim().length}/
              {MOTIVO_RECHAZO_MAX}
            </div>
            {rechazo.error && (
              <p className="mt-2 text-sm text-rose-600">{rechazo.error}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRechazo(null)}
                className="h-9 px-3 rounded-lg border text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmarRechazo()}
                className="h-9 px-3 rounded-lg bg-rose-600 text-white text-xs font-semibold"
              >
                Guardar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

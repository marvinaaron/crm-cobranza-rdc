"use client";

import { useEffect, useMemo, useState } from "react";
import type { SiteLead } from "@/lib/site-leads-db";

function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function telWhatsApp(tel: string | null): string | null {
  if (!tel) return null;
  const digits = tel.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.startsWith("52") ? digits : `52${digits}`;
}

export default function ProspectosAdmin() {
  const [leads, setLeads] = useState<SiteLead[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  const hoy = useMemo(() => {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  }, []);

  const nuevosHoy = useMemo(
    () => leads.filter((l) => new Date(l.created_at) >= hoy).length,
    [leads, hoy]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Prospectos web
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Leads desde <span className="font-semibold">/empezar</span> y formularios del sitio.
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {leads.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Hoy
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-600 tabular-nums">
            {nuevosHoy}
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</p>
      )}

      {cargando ? (
        <p className="text-sm text-slate-500">Cargando prospectos…</p>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Aún no hay prospectos
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Cuando alguien envíe el formulario en /empezar aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/10 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Fuente</th>
                <th className="px-4 py-3">Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const wa = telWhatsApp(lead.telefono);
                return (
                  <tr
                    key={lead.id}
                    className="border-b border-slate-50 dark:border-white/5 last:border-0"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                      {fechaCorta(lead.created_at)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {lead.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-xs">
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-violet-600 hover:underline"
                        >
                          {lead.email}
                        </a>
                        {lead.telefono && (
                          <span className="text-slate-600 dark:text-slate-300">
                            {lead.telefono}
                            {wa && (
                              <>
                                {" · "}
                                <a
                                  href={`https://wa.me/${wa}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:underline"
                                >
                                  WhatsApp
                                </a>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {lead.fuente}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs text-xs text-slate-600 dark:text-slate-300">
                      {lead.mensaje || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

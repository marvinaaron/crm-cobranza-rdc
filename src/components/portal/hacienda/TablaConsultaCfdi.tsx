"use client";

import { useCallback, useEffect, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import { periodoLabel } from "@/lib/clientes";
import { fmtMxn, portalCard, portalCardTitle } from "@/components/portal/portal-ui";
import type { LineaConsultaCfdi } from "@/lib/cfdi/consulta";

type Vista = "clientes" | "proveedores";

type Props = {
  vista: Vista;
  titulo: string;
  subtitulo?: string;
};

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TablaConsultaCfdi({ vista, titulo, subtitulo }: Props) {
  const { periodo } = useClientes();
  const labelPeriodo = periodoLabel(periodo);
  const [busqueda, setBusqueda] = useState("");
  const [debounced, setDebounced] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lineas, setLineas] = useState<LineaConsultaCfdi[]>([]);
  const [totalMes, setTotalMes] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(busqueda.trim()), 300);
    return () => window.clearTimeout(t);
  }, [busqueda]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        vista,
        mes: String(periodo.mes),
        anio: String(periodo.anio),
      });
      if (debounced) params.set("q", debounced);
      const res = await fetch(`/api/portal/hacienda/consulta?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar.");
      setLineas(data.lineas ?? []);
      setTotalMes(data.totalMes ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error.");
      setLineas([]);
      setTotalMes(0);
    } finally {
      setCargando(false);
    }
  }, [vista, periodo.mes, periodo.anio, debounced]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">
          Hacienda · {vista === "clientes" ? "Emitidos" : "Recibidos"}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{titulo}</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          {subtitulo ?? labelPeriodo} · Total vigente:{" "}
          <span className="text-[var(--portal-navy)] font-bold">{fmtMxn(totalMes, 2)}</span>
        </p>
      </header>

      <label className="block">
        <span className="sr-only">Buscar</span>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="RFC, razón social…"
          className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium"
        />
      </label>

      {error && (
        <p className="text-sm font-bold text-red-600 text-center py-4">{error}</p>
      )}

      {cargando && (
        <p className="text-sm font-bold text-slate-400 text-center py-12">Cargando…</p>
      )}

      {!cargando && !error && lineas.length === 0 && (
        <div className={`${portalCard} text-center py-12`}>
          <p className="text-sm font-bold text-slate-600">
            Sin comprobantes en {labelPeriodo.toLowerCase()}.
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            La consulta se actualiza cuando sincronizamos tu periodo con el SAT. Solo ves números;
            aquí no se descargan XML.
          </p>
        </div>
      )}

      {!cargando && lineas.length > 0 && (
        <>
          {/* Móvil: tarjetas */}
          <ul className="space-y-2 lg:hidden">
            {lineas.map((l) => (
              <li
                key={l.id}
                className={`${portalCard} py-4 ${
                  l.estatus === "cancelado"
                    ? "border-red-200 bg-red-50/50 line-through decoration-red-400"
                    : ""
                }`}
              >
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {l.serieFolio} · {fmtFecha(l.fecha)}
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                      {l.razonSocial}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{l.rfc}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {l.metodoPago} · {l.formaPago}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-black ${
                        l.esNotaCredito ? "text-amber-700" : "text-[var(--portal-navy)]"
                      }`}
                    >
                      {fmtMxn(l.total, 2)}
                    </p>
                    <EstadoBadge estatus={l.estatus} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Escritorio: tabla */}
          <div className={`${portalCard} hidden lg:block overflow-x-auto p-0`}>
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    "Fecha",
                    "Serie-Folio",
                    "RFC",
                    "Razón social",
                    "Total",
                    "Método",
                    "Forma",
                    "Estatus",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineas.map((l) => (
                  <tr
                    key={l.id}
                    className={`border-b border-slate-50 last:border-0 ${
                      l.estatus === "cancelado"
                        ? "bg-red-50/60 line-through decoration-red-400 text-red-800/80"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      {fmtFecha(l.fecha)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{l.serieFolio}</td>
                    <td className="px-4 py-3 font-mono text-xs">{l.rfc}</td>
                    <td className="px-4 py-3 font-semibold max-w-[200px] truncate">
                      {l.razonSocial}
                    </td>
                    <td
                      className={`px-4 py-3 font-black whitespace-nowrap ${
                        l.esNotaCredito ? "text-amber-700" : ""
                      }`}
                    >
                      {fmtMxn(l.total, 2)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{l.metodoPago}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{l.formaPago}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estatus={l.estatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function EstadoBadge({ estatus }: { estatus: LineaConsultaCfdi["estatus"] }) {
  if (estatus === "cancelado") {
    return (
      <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
        Cancelado
      </span>
    );
  }
  return (
    <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
      Vigente
    </span>
  );
}

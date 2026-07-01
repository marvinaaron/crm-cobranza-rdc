"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useClientes } from "@/context/ClientesContext";
import { periodoLabel } from "@/lib/clientes";
import PillDeslizable from "@/components/ui/PillDeslizable";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import { portalPage, portalCardTitle, fmtMxn } from "@/components/portal/portal-ui";
import { ETIQUETA_TIPO_COMPROBANTE } from "@/lib/cfdi/parser";
import type { TipoCfdi } from "@/lib/cfdi/types";

type FiltroTipo = TipoCfdi | "todos";

type Comprobante = {
  id: string;
  uuid: string;
  tipo: TipoCfdi;
  tipoComprobante: string;
  fecha: string;
  contraparte: { rfc: string; nombre: string | null };
  concepto: string | null;
  total: number;
  moneda: string;
  metadata: {
    serie?: string;
    folio?: string;
  };
};

type Resumen = {
  cantidadEmitidos: number;
  cantidadRecibidos: number;
  totalEmitidos: number;
  totalRecibidos: number;
};

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PortalCfdiVisor() {
  const { periodo } = useClientes();
  const labelPeriodo = periodoLabel(periodo);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [seleccionado, setSeleccionado] = useState<Comprobante | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setBusquedaDebounced(busqueda.trim()), 300);
    return () => window.clearTimeout(t);
  }, [busqueda]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        mes: String(periodo.mes),
        anio: String(periodo.anio),
        tipo: filtroTipo,
      });
      if (busquedaDebounced) params.set("q", busquedaDebounced);
      const res = await fetch(`/api/portal/cfdi?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo cargar.");
      setComprobantes(data.comprobantes ?? []);
      setResumen(data.resumen ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error.");
      setComprobantes([]);
      setResumen(null);
    } finally {
      setCargando(false);
    }
  }, [periodo.mes, periodo.anio, filtroTipo, busquedaDebounced]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const totalVisible = useMemo(() => {
    if (!resumen) return 0;
    if (filtroTipo === "emitido") return resumen.totalEmitidos;
    if (filtroTipo === "recibido") return resumen.totalRecibidos;
    return resumen.totalEmitidos + resumen.totalRecibidos;
  }, [resumen, filtroTipo]);

  const cantidadVisible = useMemo(() => {
    if (!resumen) return comprobantes.length;
    if (filtroTipo === "emitido") return resumen.cantidadEmitidos;
    if (filtroTipo === "recibido") return resumen.cantidadRecibidos;
    return resumen.cantidadEmitidos + resumen.cantidadRecibidos;
  }, [resumen, filtroTipo, comprobantes.length]);

  return (
    <div className={portalPage}>
      <PortalPageHeader
        eyebrow="Mi Cuenta · SAT"
        title="Comprobantes CFDI"
        subtitle={labelPeriodo}
        actions={
          <Link
            href="/portal/sat"
            className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-navy)] hover:text-[var(--portal-navy-hover)]"
          >
            ← Situación fiscal
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <PillDeslizable<FiltroTipo>
          opciones={[
            { value: "todos", label: "Todos" },
            { value: "emitido", label: "Emitidos" },
            { value: "recibido", label: "Recibidos" },
          ]}
          value={filtroTipo}
          onChange={setFiltroTipo}
          acento="portal"
          className="w-full sm:w-auto"
        />
        <label className="flex-1 min-w-0">
          <span className="sr-only">Buscar por RFC o concepto</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar RFC, nombre o concepto…"
            className="w-full h-11 px-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--portal-navy-border)]"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ResumenCard
          etiqueta="Comprobantes"
          valor={String(cantidadVisible)}
          cargando={cargando}
        />
        <ResumenCard
          etiqueta="Total del periodo"
          valor={fmtMxn(totalVisible, 2)}
          cargando={cargando}
        />
        <ResumenCard
          etiqueta="Emitidos / Recibidos"
          valor={
            resumen
              ? `${resumen.cantidadEmitidos} / ${resumen.cantidadRecibidos}`
              : "—"
          }
          cargando={cargando}
        />
      </div>

      <PortalSection title="Listado">
        {error && (
          <p className="text-sm font-bold text-red-600 text-center py-6">{error}</p>
        )}
        {cargando && !error && (
          <p className="text-sm font-bold text-slate-400 text-center py-10">
            Cargando comprobantes…
          </p>
        )}
        {!cargando && !error && comprobantes.length === 0 && (
          <div className="text-center py-10 px-4">
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              No hay comprobantes para {labelPeriodo.toLowerCase()}.
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-md mx-auto">
              Cuando conectemos tu e.firma, sincronizaremos automáticamente tus CFDI
              del SAT. Mientras tanto, tu contador puede cargarlos desde el despacho.
            </p>
          </div>
        )}
        {!cargando && comprobantes.length > 0 && (
          <ul className="divide-y divide-slate-100 -mx-2">
            {comprobantes.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSeleccionado(c)}
                  className="w-full text-left px-3 py-4 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {c.tipo === "emitido" ? "Emitido" : "Recibido"} ·{" "}
                        {ETIQUETA_TIPO_COMPROBANTE[
                          c.tipoComprobante as keyof typeof ETIQUETA_TIPO_COMPROBANTE
                        ] ?? c.tipoComprobante}
                      </p>
                      <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                        {c.contraparte.nombre ?? c.contraparte.rfc}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {c.contraparte.rfc} · {fmtFecha(c.fecha)}
                      </p>
                      {c.concepto && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {c.concepto}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-black text-[var(--portal-navy)] shrink-0">
                      {fmtMxn(c.total, 2)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PortalSection>

      {seleccionado && (
        <DetalleCfdi
          comprobante={seleccionado}
          onCerrar={() => setSeleccionado(null)}
        />
      )}
    </div>
  );
}

function ResumenCard({
  etiqueta,
  valor,
  cargando,
}: {
  etiqueta: string;
  valor: string;
  cargando: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-5 py-4">
      <p className={portalCardTitle}>{etiqueta}</p>
      <p className="text-xl font-black text-slate-900 mt-1">
        {cargando ? "…" : valor}
      </p>
    </div>
  );
}

function DetalleCfdi({
  comprobante,
  onCerrar,
}: {
  comprobante: Comprobante;
  onCerrar: () => void;
}) {
  const xmlUrl = `/api/portal/cfdi/xml?uuid=${encodeURIComponent(comprobante.uuid)}`;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Detalle del comprobante"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className={portalCardTitle}>
              {comprobante.tipo === "emitido" ? "CFDI emitido" : "CFDI recibido"}
            </p>
            <p className="text-lg font-black text-slate-900 mt-1">
              {fmtMxn(comprobante.total, 2)}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none px-2"
            aria-label="Cerrar detalle"
          >
            ×
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <DetalleFila label="Fecha" valor={fmtFecha(comprobante.fecha)} />
          <DetalleFila
            label="Contraparte"
            valor={
              comprobante.contraparte.nombre
                ? `${comprobante.contraparte.nombre} (${comprobante.contraparte.rfc})`
                : comprobante.contraparte.rfc
            }
          />
          {comprobante.concepto && (
            <DetalleFila label="Concepto" valor={comprobante.concepto} />
          )}
          {(comprobante.metadata.serie || comprobante.metadata.folio) && (
            <DetalleFila
              label="Serie / Folio"
              valor={[comprobante.metadata.serie, comprobante.metadata.folio]
                .filter(Boolean)
                .join(" · ")}
            />
          )}
          <DetalleFila
            label="UUID"
            valor={comprobante.uuid}
            mono
          />
        </dl>

        <a
          href={xmlUrl}
          download
          className="mt-6 flex w-full items-center justify-center py-3.5 rounded-2xl bg-[var(--portal-navy)] text-white text-sm font-bold hover:bg-[var(--portal-navy-hover)] transition-colors"
        >
          Descargar XML
        </a>
      </div>
    </div>
  );
}

function DetalleFila({
  label,
  valor,
  mono,
}: {
  label: string;
  valor: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </dt>
      <dd
        className={`font-semibold text-slate-800 mt-0.5 break-all ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {valor}
      </dd>
    </div>
  );
}

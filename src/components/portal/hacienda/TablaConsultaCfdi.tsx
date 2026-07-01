"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import { periodoLabel } from "@/lib/clientes";
import { fmtMxn, portalCard } from "@/components/portal/portal-ui";
import type { LineaConsultaCfdi, ResumenConsultaCfdi } from "@/lib/cfdi/consulta";
import { fmtFechaCfdiCorta, metodoPagoCorto } from "@/lib/cfdi/formato";
import {
  construirExportCfdiConsulta,
  exportarCfdiConsultaExcel,
  exportarCfdiConsultaPdf,
} from "@/lib/cfdi/cfdi-export";

type Vista = "clientes" | "proveedores";

type SortKey =
  | "fecha"
  | "serieFolio"
  | "rfc"
  | "razonSocial"
  | "total"
  | "metodoPago"
  | "formaPago"
  | "estatus";

type SortDir = "asc" | "desc";

const COLUMNAS: Array<{ key: SortKey; label: string; align?: "center" }> = [
  { key: "fecha", label: "Fecha" },
  { key: "serieFolio", label: "Folio" },
  { key: "rfc", label: "RFC" },
  { key: "razonSocial", label: "Razón social" },
  { key: "total", label: "Total", align: "center" },
  { key: "metodoPago", label: "Mét.", align: "center" },
  { key: "formaPago", label: "Forma" },
  { key: "estatus", label: "Estatus", align: "center" },
];

function valorOrden(l: LineaConsultaCfdi, key: SortKey): string | number {
  switch (key) {
    case "fecha":
      return new Date(l.fecha).getTime();
    case "serieFolio":
      return l.serieFolio;
    case "rfc":
      return l.rfc;
    case "razonSocial":
      return l.razonSocial;
    case "total":
      return l.total;
    case "metodoPago":
      return metodoPagoCorto(l);
    case "formaPago":
      return l.formaPago;
    case "estatus":
      return l.estatus;
  }
}

function compararLineas(a: LineaConsultaCfdi, b: LineaConsultaCfdi, key: SortKey, dir: SortDir) {
  const va = valorOrden(a, key);
  const vb = valorOrden(b, key);
  let cmp = 0;
  if (typeof va === "number" && typeof vb === "number") {
    cmp = va - vb;
  } else {
    cmp = String(va).localeCompare(String(vb), "es", { sensitivity: "base" });
  }
  return dir === "asc" ? cmp : -cmp;
}

type Props = {
  vista: Vista;
  titulo: string;
  subtitulo?: string;
  modo?: "portal" | "admin";
  clienteId?: number | null;
  recargarSeñal?: number;
  clienteLabel?: string;
};

const TH =
  "px-2 py-1 text-[8px] font-black uppercase tracking-wider text-slate-400";
const TD = "px-2 py-1.5 align-middle";

export default function TablaConsultaCfdi({
  vista,
  titulo,
  subtitulo,
  modo = "portal",
  clienteId = null,
  recargarSeñal = 0,
  clienteLabel,
}: Props) {
  const { periodo } = useClientes();
  const labelPeriodo = periodoLabel(periodo);
  const [busqueda, setBusqueda] = useState("");
  const [debounced, setDebounced] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lineas, setLineas] = useState<LineaConsultaCfdi[]>([]);
  const [totalMes, setTotalMes] = useState(0);
  const [cantidad, setCantidad] = useState(0);
  const [resumenPeriodo, setResumenPeriodo] = useState<ResumenConsultaCfdi>({
    cantidad: 0,
    totalMes: 0,
  });
  const [exportando, setExportando] = useState(false);
  const [menuExportAbierto, setMenuExportAbierto] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [detalleLinea, setDetalleLinea] = useState<LineaConsultaCfdi | null>(null);
  const [descargandoUuid, setDescargandoUuid] = useState<string | null>(null);
  const [eliminandoUuid, setEliminandoUuid] = useState<string | null>(null);
  const [eliminandoMes, setEliminandoMes] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(busqueda.trim()), 300);
    return () => window.clearTimeout(t);
  }, [busqueda]);

  const cargar = useCallback(async () => {
    if (modo === "admin" && clienteId == null) {
      setLineas([]);
      setTotalMes(0);
      setCantidad(0);
      setResumenPeriodo({ cantidad: 0, totalMes: 0 });
      setCargando(false);
      setError(null);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        vista,
        mes: String(periodo.mes),
        anio: String(periodo.anio),
      });
      if (debounced) params.set("q", debounced);
      const url =
        modo === "admin" && clienteId != null
          ? `/api/admin/cfdi/consulta?clienteId=${clienteId}&${params}`
          : `/api/portal/hacienda/consulta?${params}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar.");
      setLineas(data.lineas ?? []);
      setTotalMes(data.totalMes ?? 0);
      setCantidad(data.cantidad ?? data.lineas?.length ?? 0);
      setResumenPeriodo(
        data.resumenPeriodo ?? {
          cantidad: data.cantidad ?? data.lineas?.length ?? 0,
          totalMes: data.totalMes ?? 0,
        }
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error.");
      setLineas([]);
      setTotalMes(0);
      setCantidad(0);
      setResumenPeriodo({ cantidad: 0, totalMes: 0 });
    } finally {
      setCargando(false);
    }
  }, [vista, periodo.mes, periodo.anio, debounced, modo, clienteId, recargarSeñal]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const lineasOrdenadas = useMemo(
    () => [...lineas].sort((a, b) => compararLineas(a, b, sortKey, sortDir)),
    [lineas, sortKey, sortDir]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "fecha" || key === "total" ? "desc" : "asc");
    }
  };

  const datosExport = construirExportCfdiConsulta({
    lineas: lineasOrdenadas,
    periodo,
    titulo,
    clienteLabel: modo === "admin" ? clienteLabel : undefined,
    totalMes,
  });

  const exportarExcel = async () => {
    if (lineas.length === 0) return;
    setExportando(true);
    setMenuExportAbierto(false);
    try {
      await exportarCfdiConsultaExcel(datosExport, periodo, titulo);
    } finally {
      setExportando(false);
    }
  };

  const exportarPdf = async () => {
    if (lineas.length === 0) return;
    setExportando(true);
    setMenuExportAbierto(false);
    try {
      await exportarCfdiConsultaPdf(datosExport, periodo, titulo);
    } finally {
      setExportando(false);
    }
  };

  const hayFiltroBusqueda = debounced.length > 0;
  const muestraResumenDoble =
    hayFiltroBusqueda &&
    (cantidad !== resumenPeriodo.cantidad || totalMes !== resumenPeriodo.totalMes);

  const urlDescargaXml = (uuid: string) => {
    if (modo === "admin" && clienteId != null) {
      return `/api/admin/cfdi/xml?clienteId=${clienteId}&uuid=${encodeURIComponent(uuid)}`;
    }
    return `/api/portal/cfdi/xml?uuid=${encodeURIComponent(uuid)}`;
  };

  const descargarXml = async (linea: LineaConsultaCfdi) => {
    setDescargandoUuid(linea.uuid);
    try {
      const res = await fetch(urlDescargaXml(linea.uuid));
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo descargar el XML.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${linea.serieFolio !== "—" ? linea.serieFolio : linea.uuid.slice(0, 8)}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al descargar.");
    } finally {
      setDescargandoUuid(null);
    }
  };

  const eliminarCfdi = async (uuid: string) => {
    if (modo !== "admin" || clienteId == null) return;
    if (
      !confirm(
        "¿Eliminar este CFDI? Se borrará el XML y la metadata. Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    setEliminandoUuid(uuid);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/cfdi?clienteId=${clienteId}&uuid=${encodeURIComponent(uuid)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo eliminar.");
      if (detalleLinea?.uuid === uuid) setDetalleLinea(null);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar.");
    } finally {
      setEliminandoUuid(null);
    }
  };

  const eliminarMes = async () => {
    if (modo !== "admin" || clienteId == null || lineas.length === 0) return;
    const etiquetaVista = vista === "clientes" ? "emitidos (clientes)" : "recibidos (proveedores)";
    if (
      !confirm(
        `¿Eliminar todos los CFDI ${etiquetaVista} de ${labelPeriodo}? Se borran XML y registros (${cantidad} comprobante${cantidad === 1 ? "" : "s"}).`
      )
    ) {
      return;
    }
    setEliminandoMes(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        clienteId: String(clienteId),
        mes: String(periodo.mes),
        anio: String(periodo.anio),
        vista,
      });
      const res = await fetch(`/api/admin/cfdi?${params}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo eliminar el periodo.");
      setDetalleLinea(null);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar.");
    } finally {
      setEliminandoMes(false);
    }
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-5 w-full">
        <header className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">
            Hacienda · {vista === "clientes" ? "Emitidos" : "Recibidos"}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{titulo}</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {modo === "admin" && clienteLabel ? (
              <>
                <span className="font-bold text-violet-700">{clienteLabel}</span>
                {" · "}
              </>
            ) : null}
            {subtitulo ?? labelPeriodo}
          </p>
          {modo === "admin" && (
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Vista previa — igual que el portal del cliente
            </p>
          )}
        </header>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full lg:w-auto lg:min-w-[min(100%,20rem)] lg:max-w-md lg:pt-1">
          {modo === "admin" && clienteId != null && lineas.length > 0 && (
            <button
              type="button"
              onClick={() => void eliminarMes()}
              disabled={eliminandoMes || cargando}
              className="h-11 px-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-widest hover:bg-red-100 disabled:opacity-40 whitespace-nowrap"
            >
              {eliminandoMes ? "Eliminando…" : "Eliminar mes"}
            </button>
          )}
          <label className="relative block flex-1 min-w-0 sm:min-w-[12rem]">
            <span className="sr-only">Buscar</span>
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <MisClientesIcon />
            </span>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="RFC, razón social…"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium bg-white"
            />
          </label>
          <BarraExportar
            exportando={exportando}
            deshabilitado={lineas.length === 0 || cargando}
            menuAbierto={menuExportAbierto}
            onToggleMenu={() => setMenuExportAbierto((v) => !v)}
            onCerrarMenu={() => setMenuExportAbierto(false)}
            onExcel={() => void exportarExcel()}
            onPdf={() => void exportarPdf()}
          />
        </div>
      </div>

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
            {modo === "admin"
              ? "Carga XML manual en la pestaña Carga o espera la sincronización automática con el SAT (desde julio 2026)."
              : "Tu visor se actualiza cuando sincronizamos tu periodo con el SAT. Desde julio 2026 la descarga será automática cada noche."}
          </p>
        </div>
      )}

      {!cargando && lineas.length > 0 && (
        <>
          {/* Móvil: tarjetas */}
          <ul className="space-y-2 lg:hidden">
            {lineasOrdenadas.map((l) => (
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
                      {l.serieFolio} · {fmtFechaCfdiCorta(l.fecha)}
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                      {l.razonSocial}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{l.rfc}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {metodoPagoCorto(l)} · {l.formaPago}
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
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDetalleLinea(l)}
                    className="flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700"
                  >
                    Detalle
                  </button>
                  <button
                    type="button"
                    onClick={() => void descargarXml(l)}
                    disabled={descargandoUuid === l.uuid}
                    className="flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-800 disabled:opacity-50"
                  >
                    {descargandoUuid === l.uuid ? "…" : "XML"}
                  </button>
                  {modo === "admin" && (
                    <button
                      type="button"
                      onClick={() => void eliminarCfdi(l.uuid)}
                      disabled={eliminandoUuid === l.uuid}
                      className="flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 disabled:opacity-50"
                    >
                      {eliminandoUuid === l.uuid ? "…" : "Borrar"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <BarraResumenCfdi
            cantidad={cantidad}
            totalMes={totalMes}
            resumenPeriodo={resumenPeriodo}
            muestraDoble={muestraResumenDoble}
            className="lg:hidden"
          />

          {/* Escritorio: tabla */}
          <div className={`${portalCard} hidden lg:block overflow-x-auto p-0`}>
            <table className="w-full text-sm table-fixed text-left">
              <colgroup>
                <col className="w-[4.75rem]" />
                <col className="w-14" />
                <col className="w-[6.75rem]" />
                <col />
                <col className="w-[5.5rem]" />
                <col className="w-11" />
                <col className="w-[5.5rem]" />
                <col className="w-[5.25rem]" />
                <col className="w-[4.5rem]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100">
                  {COLUMNAS.map((col) => (
                    <th
                      key={col.key}
                      className={`${TH} ${col.align === "center" ? "text-center" : "text-left"}`}
                      aria-sort={
                        sortKey === col.key
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={`inline-flex items-center gap-0.5 w-full hover:text-violet-700 transition-colors ${
                          col.align === "center" ? "justify-center" : "justify-start"
                        } ${sortKey === col.key ? "text-violet-700" : ""}`}
                      >
                        {col.label}
                        <SortIcon activo={sortKey === col.key} dir={sortDir} />
                      </button>
                    </th>
                  ))}
                  <th className={`${TH} text-center`}>Acc.</th>
                </tr>
              </thead>
              <tbody>
                {lineasOrdenadas.map((l) => (
                  <tr
                    key={l.id}
                    className={`border-b border-slate-50 last:border-0 ${
                      l.estatus === "cancelado"
                        ? "bg-red-50/60 line-through decoration-red-400 text-red-800/80"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className={`${TD} text-xs whitespace-nowrap tabular-nums`}>
                      {fmtFechaCfdiCorta(l.fecha)}
                    </td>
                    <td className={`${TD} font-mono text-xs truncate`}>{l.serieFolio}</td>
                    <td className={`${TD} font-mono text-[11px] truncate`}>{l.rfc}</td>
                    <td className={`${TD} font-semibold text-xs truncate`} title={l.razonSocial}>
                      {l.razonSocial}
                    </td>
                    <td
                      className={`${TD} text-center font-black text-xs whitespace-nowrap tabular-nums ${
                        l.esNotaCredito ? "text-amber-700" : ""
                      }`}
                    >
                      {fmtMxn(l.total, 2)}
                    </td>
                    <td className={`${TD} text-center text-[11px] font-bold text-slate-600`}>
                      {metodoPagoCorto(l)}
                    </td>
                    <td className={`${TD} text-xs text-slate-600 truncate`} title={l.formaPago}>
                      {l.formaPago}
                    </td>
                    <td className={`${TD} text-center`}>
                      <EstadoBadge estatus={l.estatus} />
                    </td>
                    <td className={`${TD} text-center`}>
                      <div className="inline-flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setDetalleLinea(l)}
                          className="p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-violet-700"
                          aria-label="Ver detalle"
                          title="Detalle"
                        >
                          <IconoDetalle />
                        </button>
                        <button
                          type="button"
                          onClick={() => void descargarXml(l)}
                          disabled={descargandoUuid === l.uuid}
                          className="p-1 rounded-md text-slate-500 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-40"
                          aria-label="Descargar XML"
                          title="Descargar XML"
                        >
                          <IconoDescarga cargando={descargandoUuid === l.uuid} />
                        </button>
                        {modo === "admin" && (
                          <button
                            type="button"
                            onClick={() => void eliminarCfdi(l.uuid)}
                            disabled={eliminandoUuid === l.uuid}
                            className="p-1 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                            aria-label="Eliminar CFDI"
                            title="Eliminar"
                          >
                            <IconoEliminar cargando={eliminandoUuid === l.uuid} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <BarraResumenCfdi
              cantidad={cantidad}
              totalMes={totalMes}
              resumenPeriodo={resumenPeriodo}
              muestraDoble={muestraResumenDoble}
            />
          </div>
        </>
      )}

      {detalleLinea && (
        <ModalDetalleCfdi
          linea={detalleLinea}
          periodoLabel={labelPeriodo}
          onCerrar={() => setDetalleLinea(null)}
          onDescargar={() => void descargarXml(detalleLinea)}
          descargando={descargandoUuid === detalleLinea.uuid}
        />
      )}
    </div>
  );
}

function BarraResumenCfdi({
  cantidad,
  totalMes,
  resumenPeriodo,
  muestraDoble,
  className = "",
}: {
  cantidad: number;
  totalMes: number;
  resumenPeriodo: ResumenConsultaCfdi;
  muestraDoble: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2 border-t border-slate-100 bg-slate-50/95 text-[11px] ${className}`}
    >
      <p className="font-bold text-slate-600 tabular-nums">
        {cantidad} CFDI
        {muestraDoble ? (
          <span className="font-medium text-slate-400">
            {" "}
            de {resumenPeriodo.cantidad}
          </span>
        ) : null}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 ml-auto">
        {muestraDoble ? (
          <p className="text-slate-500">
            Filtrado:{" "}
            <span className="font-black text-violet-700 tabular-nums">
              {fmtMxn(totalMes, 2)}
            </span>
          </p>
        ) : null}
        <p className="text-slate-500">
          {muestraDoble ? "Periodo" : "Total vigente"}:{" "}
          <span className="font-black text-[var(--portal-navy)] tabular-nums">
            {fmtMxn(muestraDoble ? resumenPeriodo.totalMes : totalMes, 2)}
          </span>
        </p>
      </div>
    </div>
  );
}

function MisClientesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SortIcon({ activo, dir }: { activo: boolean; dir: SortDir }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${activo ? "opacity-100" : "opacity-30"}`}
      aria-hidden
    >
      {activo && dir === "desc" ? (
        <polyline points="6 9 12 15 18 9" />
      ) : (
        <polyline points="18 15 12 9 6 15" />
      )}
    </svg>
  );
}

function BarraExportar({
  exportando,
  deshabilitado,
  menuAbierto,
  onToggleMenu,
  onCerrarMenu,
  onExcel,
  onPdf,
}: {
  exportando: boolean;
  deshabilitado: boolean;
  menuAbierto: boolean;
  onToggleMenu: () => void;
  onCerrarMenu: () => void;
  onExcel: () => void;
  onPdf: () => void;
}) {
  return (
    <div className="relative shrink-0 flex self-start sm:self-auto">
      <button
        type="button"
        onClick={onExcel}
        disabled={exportando || deshabilitado}
        className="pl-4 pr-3 h-11 rounded-l-xl text-[9px] font-black uppercase tracking-widest bg-violet-700 text-white hover:bg-violet-800 disabled:opacity-40 shadow-sm whitespace-nowrap"
      >
        {exportando ? "Exportando…" : "Exportar"}
      </button>
      <button
        type="button"
        onClick={onToggleMenu}
        disabled={exportando || deshabilitado}
        aria-label="Más formatos de exportación"
        aria-expanded={menuAbierto}
        className="px-3 h-11 rounded-r-xl bg-violet-700 text-white hover:bg-violet-800 disabled:opacity-40 shadow-sm border-l border-violet-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${menuAbierto ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {menuAbierto && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={onCerrarMenu}
            className="fixed inset-0 z-20 cursor-default"
          />
          <div className="absolute right-0 top-full mt-2 z-30 w-44 rounded-xl bg-white shadow-xl ring-1 ring-slate-100 overflow-hidden">
            <button
              type="button"
              onClick={onExcel}
              className="w-full px-4 py-3 text-left hover:bg-emerald-50/70 text-[10px] font-black uppercase tracking-widest text-slate-700"
            >
              Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={onPdf}
              className="w-full px-4 py-3 text-left hover:bg-violet-50/70 text-[10px] font-black uppercase tracking-widest text-slate-700 border-t border-slate-50"
            >
              PDF listado
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function EstadoBadge({ estatus }: { estatus: LineaConsultaCfdi["estatus"] }) {
  if (estatus === "cancelado") {
    return (
      <span className="inline-block text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
        Cancelado
      </span>
    );
  }
  return (
    <span className="inline-block text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
      Vigente
    </span>
  );
}

function IconoDetalle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function IconoDescarga({ cargando }: { cargando: boolean }) {
  if (cargando) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" aria-hidden>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconoEliminar({ cargando }: { cargando: boolean }) {
  if (cargando) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" aria-hidden>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ModalDetalleCfdi({
  linea,
  periodoLabel,
  onCerrar,
  onDescargar,
  descargando,
}: {
  linea: LineaConsultaCfdi;
  periodoLabel: string;
  onCerrar: () => void;
  onDescargar: () => void;
  descargando: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-100 p-5 sm:p-6 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-violet-600">
              Comprobante · {periodoLabel}
            </p>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">{linea.serieFolio}</h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-50"
            aria-label="Cerrar detalle"
          >
            ✕
          </button>
        </div>
        <dl className="space-y-3 text-sm">
          <DetalleRow label="RFC contraparte" value={linea.rfc} mono />
          <DetalleRow label="Razón social" value={linea.razonSocial} />
          <DetalleRow label="Fecha" value={fmtFechaCfdiCorta(linea.fecha)} />
          <DetalleRow label="Total" value={fmtMxn(linea.total, 2)} />
          <DetalleRow label="Método / Forma" value={`${metodoPagoCorto(linea)} · ${linea.formaPago}`} />
          <DetalleRow label="Estatus" value={linea.estatus === "cancelado" ? "Cancelado" : "Vigente"} />
          {linea.concepto ? <DetalleRow label="Concepto" value={linea.concepto} /> : null}
          <DetalleRow label="UUID" value={linea.uuid} mono small />
        </dl>
        <button
          type="button"
          onClick={onDescargar}
          disabled={descargando}
          className="mt-6 w-full py-3 rounded-xl bg-violet-700 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-800 disabled:opacity-50"
        >
          {descargando ? "Descargando…" : "Descargar XML"}
        </button>
      </div>
    </div>
  );
}

function DetalleRow({
  label,
  value,
  mono,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <dt className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</dt>
      <dd
        className={`font-semibold text-slate-800 mt-0.5 break-all ${
          mono ? "font-mono" : ""
        } ${small ? "text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

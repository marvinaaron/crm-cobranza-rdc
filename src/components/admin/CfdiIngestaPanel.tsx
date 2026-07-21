"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MESES_NOM } from "@/lib/clientes";
import {
  esArchivoMetadataSat,
  esArchivoXmlCfdi,
} from "@/lib/cfdi/parse-metadata-sat";

type ClienteMin = {
  id: number;
  rfc: string;
  razonSocial: string;
};

type ItemCfdi = {
  id: string;
  uuid: string;
  tipo: "emitido" | "recibido";
  total: number;
  moneda: string;
  fecha: string;
  mes: number;
  anio: number;
  concepto: string | null;
  nombreArchivo: string | null;
  categoriaVisor: string | null;
  estatus?: "vigente" | "cancelado";
};

type EstadoInfra = {
  listo: boolean;
  tabla: boolean;
  bucket: boolean;
  detalle?: { tablaError?: string; bucketError?: string };
};

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

function etiquetaPeriodo(mes: number, anio: number): string {
  const nombre = MESES_NOM[mes] ?? `Mes ${mes + 1}`;
  return `${nombre} ${anio}`;
}

function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function leerEntradasDir(
  reader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> {
  const all: FileSystemEntry[] = [];
  for (;;) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });
    if (batch.length === 0) break;
    all.push(...batch);
  }
  return all;
}

async function recorrerEntry(entry: FileSystemEntry, out: File[]): Promise<void> {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) => {
      (entry as FileSystemFileEntry).file(resolve, reject);
    });
    out.push(file);
    return;
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const children = await leerEntradasDir(reader);
    for (const child of children) {
      await recorrerEntry(child, out);
    }
  }
}

/** Recoge archivos de un FileList o de carpetas soltadas (drag & drop). */
async function recolectarArchivos(
  fileList: FileList | null,
  dataTransfer?: DataTransfer | null
): Promise<File[]> {
  const out: File[] = [];

  if (dataTransfer?.items?.length) {
    const entries: FileSystemEntry[] = [];
    for (const item of Array.from(dataTransfer.items)) {
      const entry = item.webkitGetAsEntry?.();
      if (entry) entries.push(entry);
    }
    if (entries.length > 0) {
      for (const entry of entries) {
        await recorrerEntry(entry, out);
      }
      return out;
    }
  }

  if (fileList?.length) {
    return Array.from(fileList);
  }
  return out;
}

type Props = {
  cliente: ClienteMin;
  onIngestaOk?: () => void;
  variant?: "compact" | "page";
};

export default function CfdiIngestaPanel({
  cliente,
  onIngestaOk,
  variant = "compact",
}: Props) {
  const inputXmlRef = useRef<HTMLInputElement>(null);
  const inputFolderRef = useRef<HTMLInputElement>(null);
  const [infra, setInfra] = useState<EstadoInfra | null>(null);
  const [items, setItems] = useState<ItemCfdi[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState<{
    actual: number;
    total: number;
    fase: string;
  } | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tono: "ok" | "error";
    texto: string;
  } | null>(null);
  const [resultadosLote, setResultadosLote] = useState<
    Array<{ nombre: string; ok: boolean; detalle: string }>
  >([]);
  const [eliminandoUuid, setEliminandoUuid] = useState<string | null>(null);

  const cargarLista = useCallback(async () => {
    setCargandoLista(true);
    try {
      const res = await fetch(`/api/admin/cfdi?clienteId=${cliente.id}&limit=12`);
      const data = await res.json();
      if (res.ok && data.items) {
        setItems(data.items);
      }
    } finally {
      setCargandoLista(false);
    }
  }, [cliente.id]);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/cfdi/estado");
        const data = await res.json();
        if (!cancel && res.ok) {
          setInfra({
            listo: data.listo,
            tabla: data.tabla,
            bucket: data.bucket,
            detalle: data.detalle,
          });
        }
      } catch {
        if (!cancel) {
          setInfra({ listo: false, tabla: false, bucket: false });
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    void cargarLista();
  }, [cargarLista]);

  const subirXml = async (
    file: File
  ): Promise<{ ok: boolean; detalle: string }> => {
    if (!esArchivoXmlCfdi(file.name)) {
      return { ok: false, detalle: "Debe ser .xml" };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, detalle: "Supera 5 MB" };
    }

    try {
      const fd = new FormData();
      fd.append("clienteId", String(cliente.id));
      fd.append("file", file);
      const res = await fetch("/api/admin/cfdi/ingestar", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, detalle: data.error ?? "Error al ingestar." };
      }
      const reg = data.registro;
      return {
        ok: true,
        detalle: `${reg.tipo} · $${Number(reg.total).toLocaleString("es-MX")}`,
      };
    } catch {
      return { ok: false, detalle: "Error de red" };
    }
  };

  const aplicarMetadata = async (
    files: File[]
  ): Promise<{ ok: boolean; detalle: string }> => {
    if (files.length === 0) {
      return { ok: true, detalle: "Sin metadata" };
    }
    try {
      const fd = new FormData();
      fd.append("clienteId", String(cliente.id));
      for (const f of files) fd.append("file", f);
      const res = await fetch("/api/admin/cfdi/aplicar-metadata", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, detalle: data.error ?? "Error en metadata." };
      }
      return {
        ok: true,
        detalle: `${data.cancelados ?? 0} cancelados · ${data.actualizados ?? 0} actualizados (${data.leidos ?? 0} en archivo)`,
      };
    } catch {
      return { ok: false, detalle: "Error de red (metadata)" };
    }
  };

  const procesarArchivos = async (todos: File[]) => {
    const xmls = todos.filter((f) => esArchivoXmlCfdi(f.name));
    const metas = todos.filter((f) => esArchivoMetadataSat(f.name));

    if (xmls.length === 0 && metas.length === 0) {
      setMensaje({
        tono: "error",
        texto: "No hay XML ni metadata (.txt/.csv) en la selección.",
      });
      return;
    }

    setSubiendo(true);
    setMensaje(null);
    setResultadosLote([]);

    const resultados: Array<{ nombre: string; ok: boolean; detalle: string }> =
      [];
    let exitos = 0;
    const totalPasos = xmls.length + (metas.length > 0 ? 1 : 0);
    let paso = 0;

    for (const file of xmls) {
      paso += 1;
      setProgresoSubida({
        actual: paso,
        total: totalPasos,
        fase: "XML",
      });
      const r = await subirXml(file);
      const nombre =
        file.webkitRelativePath || file.name;
      resultados.push({ nombre, ...r });
      if (r.ok) exitos += 1;
    }

    let metaDetalle = "";
    if (metas.length > 0) {
      paso += 1;
      setProgresoSubida({
        actual: paso,
        total: totalPasos,
        fase: "Metadata cancelados",
      });
      const rMeta = await aplicarMetadata(metas);
      resultados.push({
        nombre: metas.map((m) => m.name).join(", "),
        ...rMeta,
      });
      metaDetalle = rMeta.detalle;
      if (!rMeta.ok && xmls.length === 0) {
        setMensaje({ tono: "error", texto: rMeta.detalle });
        setResultadosLote(resultados);
        setProgresoSubida(null);
        setSubiendo(false);
        return;
      }
    }

    setResultadosLote(resultados);
    setProgresoSubida(null);
    setSubiendo(false);
    if (inputXmlRef.current) inputXmlRef.current.value = "";
    if (inputFolderRef.current) inputFolderRef.current.value = "";

    const partes: string[] = [];
    if (xmls.length > 0) {
      partes.push(
        exitos === xmls.length
          ? `${exitos} XML cargados`
          : `${exitos} de ${xmls.length} XML cargados`
      );
    }
    if (metaDetalle) partes.push(`Metadata: ${metaDetalle}`);

    if (xmls.length > 0 && exitos === 0) {
      setMensaje({
        tono: "error",
        texto: "Ningún XML se cargó. Verifica RFC emisor/receptor.",
      });
    } else if (xmls.length > 0 && exitos < xmls.length) {
      setMensaje({
        tono: "error",
        texto: partes.join(" · "),
      });
    } else {
      setMensaje({
        tono: "ok",
        texto: partes.join(" · ") || "Listo.",
      });
    }

    if (exitos > 0 || (metas.length > 0 && exitos === xmls.length)) {
      await cargarLista();
      onIngestaOk?.();
    }
  };

  const onDropOSelect = async (
    fileList: FileList | null,
    dataTransfer?: DataTransfer | null
  ) => {
    const files = await recolectarArchivos(fileList, dataTransfer);
    if (files.length) void procesarArchivos(files);
  };

  const eliminarCfdi = async (uuid: string) => {
    if (!confirm("¿Eliminar este CFDI y su XML?")) return;
    setEliminandoUuid(uuid);
    try {
      const res = await fetch(
        `/api/admin/cfdi?clienteId=${cliente.id}&uuid=${encodeURIComponent(uuid)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        setMensaje({
          tono: "error",
          texto: data.error ?? "No se pudo eliminar.",
        });
        return;
      }
      setMensaje({ tono: "ok", texto: "CFDI eliminado." });
      await cargarLista();
      onIngestaOk?.();
    } catch {
      setMensaje({ tono: "error", texto: "Error de red al eliminar." });
    } finally {
      setEliminandoUuid(null);
    }
  };

  const infraListo = infra?.listo ?? false;
  const esPagina = variant === "page";

  return (
    <section
      className={
        esPagina
          ? "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm"
          : "mb-4 rounded-xl border border-violet-100 bg-violet-50/40 p-3 space-y-3"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black text-violet-600 uppercase tracking-[0.2em]">
            {esPagina ? "Carga XML · Carpetas" : "CFDI · Hacienda"}
          </p>
          <p
            className={`font-medium text-slate-500 mt-0.5 leading-snug ${
              esPagina ? "text-sm" : "text-[10px]"
            }`}
          >
            {esPagina ? (
              <>
                Carpeta o archivos para{" "}
                <span className="font-bold text-violet-700">
                  {cliente.razonSocial}
                </span>
                {" · RFC "}
                <span className="font-mono font-bold text-slate-700">
                  {cliente.rfc}
                </span>
              </>
            ) : (
              <>
                Ingesta manual. RFC:{" "}
                <span className="font-mono font-bold text-slate-700">
                  {cliente.rfc}
                </span>
              </>
            )}
          </p>
        </div>
        {infra && (
          <span
            className={`shrink-0 text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
              infraListo
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {infraListo ? "Listo" : "Revisar infra"}
          </span>
        )}
      </div>

      {!infraListo && infra && (
        <div className="text-[10px] font-medium text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2 leading-snug">
          {!infra.tabla && (
            <p>
              Ejecuta{" "}
              <code className="text-[9px] bg-white px-1 rounded">
                scripts/setup-cliente-cfdi.sql
              </code>{" "}
              en Supabase.
            </p>
          )}
          {!infra.bucket && (
            <p className={!infra.tabla ? "mt-1" : ""}>
              Crea el bucket:{" "}
              <code className="text-[9px] bg-white px-1 rounded">
                node scripts/setup-storage.mjs
              </code>
            </p>
          )}
        </div>
      )}

      <div
        className={
          esPagina ? "grid gap-6 lg:grid-cols-2 lg:items-start" : "space-y-3"
        }
      >
        <div className={esPagina ? "space-y-4" : "contents"}>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                inputFolderRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (infraListo && !subiendo) setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              if (infraListo && !subiendo) {
                void onDropOSelect(e.dataTransfer.files, e.dataTransfer);
              }
            }}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
              esPagina ? "py-14 px-6" : "py-4 px-3 gap-1.5"
            } ${
              !infraListo || subiendo
                ? "opacity-50 cursor-not-allowed border-slate-200 bg-white/50"
                : arrastrando
                  ? "border-violet-400 bg-violet-100/60"
                  : "border-violet-200 bg-white"
            }`}
          >
            <span
              className={esPagina ? "text-violet-500 scale-125" : "text-violet-500"}
            >
              <UploadIcon />
            </span>
            <p
              className={`font-black text-violet-700 uppercase tracking-wider text-center ${
                esPagina ? "text-sm" : "text-[10px]"
              }`}
            >
              {subiendo && progresoSubida
                ? `${progresoSubida.fase} ${progresoSubida.actual}/${progresoSubida.total}`
                : "Arrastra carpeta o archivos"}
            </p>
            <p
              className={`font-medium text-slate-400 text-center ${
                esPagina ? "text-xs" : "text-[9px]"
              }`}
            >
              XML + metadata SAT (.txt/.csv) para marcar cancelados · máx. 5 MB
              por XML
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button
                type="button"
                disabled={!infraListo || subiendo}
                onClick={(e) => {
                  e.stopPropagation();
                  inputFolderRef.current?.click();
                }}
                className="h-9 px-3 rounded-lg bg-violet-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-violet-700 disabled:opacity-40"
              >
                Elegir carpeta
              </button>
              <button
                type="button"
                disabled={!infraListo || subiendo}
                onClick={(e) => {
                  e.stopPropagation();
                  inputXmlRef.current?.click();
                }}
                className="h-9 px-3 rounded-lg border border-violet-200 bg-white text-violet-700 text-[10px] font-black uppercase tracking-wider hover:bg-violet-50 disabled:opacity-40"
              >
                Solo archivos
              </button>
            </div>
            <input
              ref={(el) => {
                inputFolderRef.current = el;
                if (el) {
                  el.setAttribute("webkitdirectory", "");
                  el.setAttribute("directory", "");
                }
              }}
              type="file"
              multiple
              className="hidden"
              disabled={!infraListo || subiendo}
              onChange={(e) => void onDropOSelect(e.target.files)}
            />
            <input
              ref={inputXmlRef}
              type="file"
              accept=".xml,.txt,.csv,application/xml,text/xml,text/csv,text/plain"
              multiple
              className="hidden"
              disabled={!infraListo || subiendo}
              onChange={(e) => void onDropOSelect(e.target.files)}
            />
          </div>

          {mensaje && (
            <p
              className={`font-bold px-3 py-2.5 rounded-lg ${
                esPagina ? "text-sm" : "text-[10px]"
              } ${
                mensaje.tono === "ok"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {mensaje.texto}
            </p>
          )}

          {resultadosLote.length > 1 && (
            <ul
              className={`space-y-1 max-h-48 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 ${
                esPagina ? "text-xs" : "text-[10px]"
              }`}
            >
              {resultadosLote.map((r, i) => (
                <li key={`${r.nombre}-${i}`} className="flex justify-between gap-2">
                  <span className="truncate font-medium text-slate-700">
                    {r.nombre}
                  </span>
                  <span
                    className={`shrink-0 font-bold ${
                      r.ok ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {r.detalle}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p
            className={`font-black text-slate-400 uppercase tracking-widest mb-2 ${
              esPagina ? "text-[10px]" : "text-[8px] mb-1.5"
            }`}
          >
            Últimos comprobantes
          </p>
          {cargandoLista ? (
            <p className={`text-slate-400 ${esPagina ? "text-sm" : "text-[10px]"}`}>
              Cargando…
            </p>
          ) : items.length === 0 ? (
            <p
              className={`text-slate-400 leading-snug ${
                esPagina ? "text-sm" : "text-[10px]"
              }`}
            >
              Aún no hay CFDI. Sube la carpeta del SAT (XML + metadata de
              cancelados).
            </p>
          ) : (
            <ul
              className={`space-y-2 overflow-y-auto scrollbar-hide ${
                esPagina ? "max-h-[28rem]" : "max-h-36 space-y-1.5"
              }`}
            >
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-start justify-between gap-3 rounded-xl border ${
                    item.estatus === "cancelado"
                      ? "bg-red-50/60 border-red-100"
                      : "bg-slate-50 border-slate-100"
                  } ${esPagina ? "px-4 py-3 text-sm" : "px-2.5 py-2 text-[10px]"}`}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-700 truncate">
                      {item.concepto ?? item.nombreArchivo ?? "Sin descripción"}
                    </p>
                    <p className="text-slate-400 font-mono truncate mt-0.5 text-xs">
                      {item.uuid}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {etiquetaPeriodo(item.mes, item.anio)} ·{" "}
                      {formatearFecha(item.fecha)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-block font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          esPagina ? "text-[9px]" : "text-[8px] px-1.5"
                        } ${
                          item.tipo === "emitido"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.tipo}
                      </span>
                      <span
                        className={`inline-block font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          esPagina ? "text-[9px]" : "text-[8px] px-1.5"
                        } ${
                          item.estatus === "cancelado"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {item.estatus === "cancelado" ? "Cancelado" : "Vigente"}
                      </span>
                    </div>
                    <p
                      className={`font-black text-slate-800 ${
                        item.estatus === "cancelado" ? "line-through opacity-70" : ""
                      } ${esPagina ? "text-base" : ""}`}
                    >
                      ${item.total.toLocaleString("es-MX")}
                    </p>
                    <button
                      type="button"
                      onClick={() => void eliminarCfdi(item.uuid)}
                      disabled={eliminandoUuid === item.uuid}
                      className={`mt-0.5 font-black uppercase tracking-wider text-red-600 hover:text-red-700 disabled:opacity-40 ${
                        esPagina ? "text-[10px]" : "text-[8px]"
                      }`}
                    >
                      {eliminandoUuid === item.uuid ? "…" : "Eliminar"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

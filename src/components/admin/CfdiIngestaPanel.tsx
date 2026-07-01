"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MESES_NOM } from "@/lib/clientes";

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
};

type EstadoInfra = {
  listo: boolean;
  tabla: boolean;
  bucket: boolean;
  detalle?: { tablaError?: string; bucketError?: string };
};

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

type Props = {
  cliente: ClienteMin;
  /** Llamado tras ingesta exitosa (p. ej. refrescar visor). */
  onIngestaOk?: () => void;
  /** compact = sidebar; page = pestaña Carga XML a ancho completo. */
  variant?: "compact" | "page";
};

export default function CfdiIngestaPanel({
  cliente,
  onIngestaOk,
  variant = "compact",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [infra, setInfra] = useState<EstadoInfra | null>(null);
  const [items, setItems] = useState<ItemCfdi[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tono: "ok" | "error"; texto: string } | null>(null);

  const cargarLista = useCallback(async () => {
    setCargandoLista(true);
    try {
      const res = await fetch(`/api/admin/cfdi?clienteId=${cliente.id}&limit=8`);
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

  const subirArchivo = async (file: File) => {
    const nombre = file.name.toLowerCase();
    if (!nombre.endsWith(".xml")) {
      setMensaje({ tono: "error", texto: "El archivo debe ser .xml" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMensaje({ tono: "error", texto: "El XML no debe superar 5 MB." });
      return;
    }

    setSubiendo(true);
    setMensaje(null);
    try {
      const fd = new FormData();
      fd.append("clienteId", String(cliente.id));
      fd.append("file", file);
      const res = await fetch("/api/admin/cfdi/ingestar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMensaje({ tono: "error", texto: data.error ?? "No se pudo ingestar el XML." });
        return;
      }
      const reg = data.registro;
      setMensaje({
        tono: "ok",
        texto: `CFDI ${reg.tipo} · $${Number(reg.total).toLocaleString("es-MX")} · ${reg.uuid?.slice(0, 8)}…`,
      });
      await cargarLista();
      onIngestaOk?.();
    } catch {
      setMensaje({ tono: "error", texto: "Error de red al subir el XML." });
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onArchivo = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (file) void subirArchivo(file);
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
            {esPagina ? "Carga XML · Hacienda" : "CFDI · Hacienda"}
          </p>
          <p
            className={`font-medium text-slate-500 mt-0.5 leading-snug ${
              esPagina ? "text-sm" : "text-[10px]"
            }`}
          >
            {esPagina ? (
              <>
                Ingesta manual para{" "}
                <span className="font-bold text-violet-700">{cliente.razonSocial}</span>
                {" · RFC "}
                <span className="font-mono font-bold text-slate-700">{cliente.rfc}</span>
              </>
            ) : (
              <>
                Ingesta manual para el visor del portal. RFC cliente:{" "}
                <span className="font-mono font-bold text-slate-700">{cliente.rfc}</span>
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
            title={
              !infraListo
                ? [infra.detalle?.tablaError, infra.detalle?.bucketError].filter(Boolean).join(" · ")
                : undefined
            }
          >
            {infraListo ? "Listo" : "Revisar infra"}
          </span>
        )}
      </div>

      {!infraListo && infra && (
        <div className="text-[10px] font-medium text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2 leading-snug">
          {!infra.tabla && (
            <p>Ejecuta <code className="text-[9px] bg-white px-1 rounded">scripts/setup-cliente-cfdi.sql</code> en Supabase.</p>
          )}
          {!infra.bucket && (
            <p className={!infra.tabla ? "mt-1" : ""}>Crea el bucket: <code className="text-[9px] bg-white px-1 rounded">node scripts/setup-storage.mjs</code></p>
          )}
        </div>
      )}

      <div className={esPagina ? "grid gap-6 lg:grid-cols-2 lg:items-start" : "space-y-3"}>
        <div className={esPagina ? "space-y-4" : "contents"}>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (infraListo && !subiendo) setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              if (infraListo && !subiendo) onArchivo(e.dataTransfer.files);
            }}
            onClick={() => {
              if (infraListo && !subiendo) inputRef.current?.click();
            }}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
              esPagina ? "py-16 px-6" : "py-4 px-3 gap-1.5"
            } ${
              !infraListo || subiendo
                ? "opacity-50 cursor-not-allowed border-slate-200 bg-white/50"
                : arrastrando
                  ? "border-violet-400 bg-violet-100/60"
                  : "border-violet-200 bg-white hover:border-violet-300 hover:bg-violet-50/80"
            }`}
          >
            <span className={esPagina ? "text-violet-500 scale-125" : "text-violet-500"}>
              <UploadIcon />
            </span>
            <p
              className={`font-black text-violet-700 uppercase tracking-wider text-center ${
                esPagina ? "text-sm" : "text-[10px]"
              }`}
            >
              {subiendo ? "Procesando XML…" : "Subir 1 XML"}
            </p>
            <p
              className={`font-medium text-slate-400 text-center ${
                esPagina ? "text-xs" : "text-[9px]"
              }`}
            >
              Arrastra o toca · máx. 5 MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".xml,application/xml,text/xml"
              className="hidden"
              disabled={!infraListo || subiendo}
              onChange={(e) => onArchivo(e.target.files)}
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
            <p className={`text-slate-400 ${esPagina ? "text-sm" : "text-[10px]"}`}>Cargando…</p>
          ) : items.length === 0 ? (
            <p
              className={`text-slate-400 leading-snug ${
                esPagina ? "text-sm" : "text-[10px]"
              }`}
            >
              Aún no hay CFDI para este cliente. El RFC del XML debe coincidir como emisor o
              receptor.
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
                  className={`flex items-start justify-between gap-3 rounded-xl bg-slate-50 border border-slate-100 ${
                    esPagina ? "px-4 py-3 text-sm" : "px-2.5 py-2 text-[10px]"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-700 truncate">
                      {item.concepto ?? item.nombreArchivo ?? "Sin descripción"}
                    </p>
                    <p className="text-slate-400 font-mono truncate mt-0.5 text-xs">{item.uuid}</p>
                    <p className="text-slate-500 mt-0.5">
                      {etiquetaPeriodo(item.mes, item.anio)} · {formatearFecha(item.fecha)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
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
                    <p className={`font-black text-slate-800 mt-1 ${esPagina ? "text-base" : ""}`}>
                      ${item.total.toLocaleString("es-MX")}
                    </p>
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

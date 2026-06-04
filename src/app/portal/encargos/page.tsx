"use client";

import { useMemo, useState } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { useClientes } from "@/context/ClientesContext";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import {
  TIPOS_ENCARGO,
  TIPO_ENCARGO_META,
  ESTADO_ENCARGO_META,
  progresoEncargo,
  formatRelativoEncargo,
  validarAdjuntoEncargo,
  MAX_FACTURAS_POR_ENCARGO,
  type TipoEncargo,
  type ArchivoEncargo,
} from "@/lib/encargos";
import { readFileAsDataUrl } from "@/lib/archivos";

export default function PortalEncargosPage() {
  const { cliente } = usePortalAuth();
  const { getEncargosCliente, crearEncargo } = useClientes();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoEncargo>("documento");
  const [nota, setNota] = useState("");
  const [cantidadFacturas, setCantidadFacturas] = useState(1);
  /** Archivos por slot (índice). Para facturas hay `cantidadFacturas` slots; otros tipos comparten un solo bloque. */
  const [archivos, setArchivos] = useState<(File | null)[]>([null]);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  const lista = useMemo(
    () => (cliente ? getEncargosCliente(cliente.id) : []),
    [cliente, getEncargosCliente]
  );

  const waUrl = CONTACTO_PUBLICO.whatsapp.buildUrl(
    "Hola, soy cliente del portal de RDC Contadores y tengo un encargo o duda: "
  );

  /** Número de campos de carga según el tipo/cantidad. */
  const slots = tipo === "factura" ? cantidadFacturas : 1;

  function setArchivoSlot(idx: number, file: File | null) {
    if (file) {
      const err = validarAdjuntoEncargo(file);
      if (err) {
        setErrorArchivo(err);
        return;
      }
    }
    setErrorArchivo(null);
    setArchivos((prev) => {
      const next = [...prev];
      while (next.length <= idx) next.push(null);
      next[idx] = file;
      return next;
    });
  }

  function cambiarCantidad(n: number) {
    const c = Math.max(1, Math.min(MAX_FACTURAS_POR_ENCARGO, n));
    setCantidadFacturas(c);
    setArchivos((prev) => {
      const next = [...prev];
      next.length = c;
      return Array.from({ length: c }, (_, i) => next[i] ?? null);
    });
  }

  function resetModal() {
    setTitulo("");
    setNota("");
    setTipo("documento");
    setCantidadFacturas(1);
    setArchivos([null]);
    setErrorArchivo(null);
    setOk(false);
  }

  async function handlePedir(e: React.FormEvent) {
    e.preventDefault();
    if (!cliente || !titulo.trim()) return;
    setEnviando(true);
    try {
      const usados = archivos.slice(0, slots).filter((f): f is File => !!f);
      const adjuntos: ArchivoEncargo[] = [];
      for (const f of usados) {
        const dataUrl = await readFileAsDataUrl(f);
        adjuntos.push({
          nombreArchivo: f.name,
          tipoMime: f.type || "application/octet-stream",
          dataUrl,
          subidoEn: new Date().toISOString(),
        });
      }
      crearEncargo({
        clienteId: cliente.id,
        titulo: titulo.trim(),
        tipo,
        nota: nota.trim() || undefined,
        cantidadFacturas: tipo === "factura" ? cantidadFacturas : undefined,
        adjuntosCliente: adjuntos,
        creadoPor: "cliente",
      });
      setOk(true);
      setTimeout(() => {
        setModalAbierto(false);
        resetModal();
      }, 1300);
    } finally {
      setEnviando(false);
    }
  }

  function descargar(dataUrl: string, nombre: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = nombre;
    a.click();
  }

  if (!cliente) {
    return (
      <div className="py-12 text-center text-slate-400 font-bold text-sm">
        Cargando…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <PortalPageHeader
        eyebrow="Mi cuenta"
        title="Mis encargos"
        subtitle="Lo que le pediste a tu contador — facturas, documentos y trámites."
      />

      {lista.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-slate-600 font-semibold text-sm">
            Aún no tienes encargos registrados.
          </p>
          <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
            Puedes pedirnos algo desde aquí o escribirnos por WhatsApp como siempre.
            Lo registramos y ves el avance en esta pantalla.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {lista.map((enc) => {
            const prog = progresoEncargo(enc.estado);
            const meta = ESTADO_ENCARGO_META[enc.estado];
            return (
              <article
                key={enc.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {TIPO_ENCARGO_META[enc.tipo].label}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {meta.label}
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-800">
                  {enc.titulo}
                  {enc.tipo === "factura" && enc.cantidadFacturas
                    ? ` · ${enc.cantidadFacturas} factura${enc.cantidadFacturas === 1 ? "" : "s"}`
                    : ""}
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {meta.detalleCliente}
                </p>

                {enc.adjuntosCliente && enc.adjuntosCliente.length > 0 && (
                  <p className="text-[11px] font-bold text-slate-400 mt-2">
                    {enc.adjuntosCliente.length} archivo
                    {enc.adjuntosCliente.length === 1 ? "" : "s"} que enviaste
                  </p>
                )}

                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <span>
                      {prog.paso} de {prog.total} pasos
                    </span>
                    <span>{prog.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-700 transition-all duration-500"
                      style={{ width: `${prog.pct}%` }}
                    />
                  </div>
                </div>

                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                  {formatRelativoEncargo(enc.creadoEn)}
                </p>

                {enc.estado === "listo" && enc.archivo && (
                  <button
                    type="button"
                    onClick={() =>
                      descargar(enc.archivo!.dataUrl, enc.archivo!.nombreArchivo)
                    }
                    className="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition"
                  >
                    Descargar
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      <div className="flex flex-col items-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            resetModal();
            setModalAbierto(true);
          }}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-700 text-sm font-black hover:bg-slate-50 transition"
        >
          + Agregar un pendiente
        </button>
        <p className="text-xs text-slate-400 text-center max-w-md leading-relaxed">
          También puedes escribirnos por{" "}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 font-bold underline underline-offset-2"
          >
            WhatsApp
          </a>{" "}
          o redes — lo registramos aquí para que veas el estatus.
        </p>
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            {ok ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <p className="text-xl font-black text-slate-800">
                  Agregado a tu lista
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Tu contador ya lo tiene. Te avisamos cuando avance.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePedir} className="space-y-5">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">
                    Agregar un pendiente
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mt-1">
                    Anota lo que necesitas y adjunta tu CSF o una foto de lo que
                    hay que facturar. Lo dejamos en tu lista y lo resolvemos.
                  </p>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    ¿Qué necesitas?
                  </span>
                  <input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej. Factura del mes, carta de no adeudo…"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-semibold"
                  />
                </label>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Tipo
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TIPOS_ENCARGO.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipo(t)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                          tipo === t
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {TIPO_ENCARGO_META[t].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cantidad de facturas (solo tipo factura) */}
                {tipo === "factura" && (
                  <div className="space-y-2 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      ¿Cuántas facturas necesitas?
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(cantidadFacturas - 1)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 text-lg font-black hover:bg-slate-50"
                        aria-label="Menos"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-2xl font-black text-slate-800">
                        {cantidadFacturas}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(cantidadFacturas + 1)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 text-lg font-black hover:bg-slate-50"
                        aria-label="Más"
                      >
                        +
                      </button>
                      <span className="text-xs font-bold text-slate-400 ml-1">
                        Se abrirá un espacio por cada factura
                      </span>
                    </div>
                  </div>
                )}

                {/* Campos de carga dinámicos */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {tipo === "factura"
                      ? "Sube tu CSF o la foto de lo que facturar"
                      : "Adjunta tu CSF, documento o foto (opcional)"}
                  </span>
                  <div className="space-y-2.5">
                    {Array.from({ length: slots }).map((_, idx) => {
                      const file = archivos[idx] ?? null;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-3.5 py-3"
                        >
                          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            {tipo === "factura" && (
                              <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                Factura {idx + 1}
                              </p>
                            )}
                            <label className="block">
                              <span className="sr-only">Subir archivo</span>
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) =>
                                  setArchivoSlot(idx, e.target.files?.[0] ?? null)
                                }
                                className="text-xs text-slate-600 file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-white file:px-3 file:py-1.5 file:text-slate-700 file:text-xs file:font-bold file:cursor-pointer"
                              />
                            </label>
                            {file && (
                              <p className="text-[11px] font-bold text-slate-600 mt-1 truncate">
                                {file.name}
                              </p>
                            )}
                          </div>
                          {file && (
                            <button
                              type="button"
                              onClick={() => setArchivoSlot(idx, null)}
                              className="text-xs font-bold text-slate-400 hover:text-red-500 shrink-0"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {errorArchivo && (
                    <p className="text-xs font-bold text-red-500">{errorArchivo}</p>
                  )}
                  <p className="text-[10px] text-slate-400 font-medium">
                    PDF o imagen, hasta 8 MB cada archivo.
                  </p>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Detalle (opcional)
                  </span>
                  <textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    rows={3}
                    placeholder="Cualquier contexto que ayude — montos, conceptos, a quién facturar…"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm resize-none"
                  />
                </label>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="flex-1 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando || !titulo.trim()}
                    className="flex-[2] py-3.5 rounded-xl bg-slate-900 text-white text-sm font-black disabled:opacity-50 hover:bg-slate-800 transition"
                  >
                    {enviando ? "Agregando…" : "Agregar a mi lista"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { useClientes } from "@/context/ClientesContext";
import { useConfirm } from "@/components/ConfirmProvider";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import Fiscalino from "@/components/Fiscalino";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import {
  TIPOS_ENCARGO,
  TIPO_ENCARGO_META,
  ESTADO_ENCARGO_META,
  progresoEncargo,
  formatRelativoEncargo,
  validarAdjuntoEncargo,
  solicitudClientePorGrupo,
  urlArchivoEncargo,
  MAX_FACTURAS_POR_ENCARGO,
  type TipoEncargo,
  type ArchivoEncargo,
} from "@/lib/encargos";
import {
  subirAdjuntoCliente,
  borrarArchivosCliente,
  pathsDeEncargo,
} from "@/lib/encargos-upload";

type FilaArchivo = { id: string; file: File | null; nota: string };
type GrupoArchivos = FilaArchivo[];

function nuevaFila(): FilaArchivo {
  return {
    id: `fa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    file: null,
    nota: "",
  };
}

export default function PortalEncargosPage() {
  const { cliente } = usePortalAuth();
  const { getEncargosCliente, crearEncargo, eliminarEncargo } = useClientes();
  const confirm = useConfirm();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoEncargo>("documento");
  const [nota, setNota] = useState("");
  const [cantidadFacturas, setCantidadFacturas] = useState(1);
  /** Un grupo por factura (tipo factura) o un único grupo (otros tipos). */
  const [grupos, setGrupos] = useState<GrupoArchivos[]>([[nuevaFila()]]);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  const lista = useMemo(
    () => (cliente ? getEncargosCliente(cliente.id) : []),
    [cliente, getEncargosCliente]
  );

  // Apertura con texto prellenado vía query (?nueva=opinion-32d), p. ej. desde
  // la sección de opinión SAT. Se lee de window para evitar Suspense de
  // useSearchParams en una página estática.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const nueva = params.get("nueva");
    if (!nueva) return;
    if (nueva === "opinion-32d") {
      resetModal();
      setTitulo(
        "Necesito activar mi opinión de cumplimiento 32-D para consulta pública en el SAT."
      );
    } else {
      resetModal();
    }
    setModalAbierto(true);
    // Limpia el query para que no se reabra al navegar de vuelta.
    window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bloquea el scroll del fondo mientras el modal está abierto.
  useEffect(() => {
    if (!modalAbierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [modalAbierto]);

  const waUrl = CONTACTO_PUBLICO.whatsapp.buildUrl(
    "Hola, soy cliente del portal de RDC Contadores y tengo una solicitud o duda: "
  );

  const numGrupos = tipo === "factura" ? cantidadFacturas : 1;

  function setArchivoEnFila(g: number, filaId: string, file: File | null) {
    if (file) {
      const err = validarAdjuntoEncargo(file);
      if (err) {
        setErrorArchivo(err);
        return;
      }
    }
    setErrorArchivo(null);
    setGrupos((prev) =>
      prev.map((grupo, gi) =>
        gi === g
          ? grupo.map((f) => (f.id === filaId ? { ...f, file } : f))
          : grupo
      )
    );
  }

  function setNotaEnFila(g: number, filaId: string, valor: string) {
    setGrupos((prev) =>
      prev.map((grupo, gi) =>
        gi === g
          ? grupo.map((f) => (f.id === filaId ? { ...f, nota: valor } : f))
          : grupo
      )
    );
  }

  function agregarFila(g: number) {
    setGrupos((prev) =>
      prev.map((grupo, gi) => (gi === g ? [...grupo, nuevaFila()] : grupo))
    );
  }

  function quitarFila(g: number, filaId: string) {
    setGrupos((prev) =>
      prev.map((grupo, gi) => {
        if (gi !== g) return grupo;
        const restante = grupo.filter((f) => f.id !== filaId);
        return restante.length ? restante : [nuevaFila()];
      })
    );
  }

  function cambiarCantidad(n: number) {
    const c = Math.max(1, Math.min(MAX_FACTURAS_POR_ENCARGO, n));
    setCantidadFacturas(c);
    setGrupos((prev) =>
      Array.from({ length: c }, (_, i) => prev[i] ?? [nuevaFila()])
    );
  }

  function cambiarTipo(t: TipoEncargo) {
    setTipo(t);
    if (t === "factura") {
      setGrupos((prev) =>
        Array.from(
          { length: cantidadFacturas },
          (_, i) => prev[i] ?? [nuevaFila()]
        )
      );
    } else {
      setGrupos((prev) => [prev[0] ?? [nuevaFila()]]);
    }
  }

  function resetModal() {
    setTitulo("");
    setNota("");
    setTipo("documento");
    setCantidadFacturas(1);
    setGrupos([[nuevaFila()]]);
    setErrorArchivo(null);
    setOk(false);
  }

  async function handlePedir(e: React.FormEvent) {
    e.preventDefault();
    if (!cliente || !titulo.trim()) return;
    setEnviando(true);
    setErrorArchivo(null);
    try {
      const adjuntos: ArchivoEncargo[] = [];
      const notas: { grupo?: number; texto: string }[] = [];
      for (let g = 0; g < numGrupos; g++) {
        const grupo = grupos[g] ?? [];
        const grupoNum = tipo === "factura" ? g + 1 : undefined;
        for (const fila of grupo) {
          const textoNota = fila.nota.trim();
          if (fila.file) {
            // Sube el archivo a Storage; solo guardamos la ruta, no el archivo.
            const adj = await subirAdjuntoCliente(fila.file, {
              nota: textoNota || undefined,
              grupo: grupoNum,
            });
            adjuntos.push(adj);
          } else if (textoNota) {
            // Indicación sin archivo: qué debe llevar la factura.
            notas.push({ grupo: grupoNum, texto: textoNota });
          }
        }
      }
      crearEncargo({
        clienteId: cliente.id,
        titulo: titulo.trim(),
        tipo,
        nota: nota.trim() || undefined,
        cantidadFacturas: tipo === "factura" ? cantidadFacturas : undefined,
        adjuntosCliente: adjuntos,
        notasCliente: notas,
        creadoPor: "cliente",
      });
      setOk(true);
      setTimeout(() => {
        setModalAbierto(false);
        resetModal();
      }, 1300);
    } catch (err) {
      setErrorArchivo(
        err instanceof Error
          ? `No se pudo subir un archivo: ${err.message}`
          : "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo."
      );
    } finally {
      setEnviando(false);
    }
  }

  async function handleEliminar(id: string, titulo: string) {
    const ok = await confirm({
      titulo: "Eliminar pendiente",
      mensaje: `¿Quitar "${titulo}" de tu lista? No se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    const enc = lista.find((e) => e.id === id);
    if (enc) void borrarArchivosCliente(pathsDeEncargo(enc));
    eliminarEncargo(id);
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
        title="Solicitudes"
        subtitle="Un canal directo a tu contador para facturas, documentos y trámites."
      />

      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-4 sm:p-5">
        <p className="text-sm text-slate-600 leading-relaxed">
          Este es uno de los medios{" "}
          <span className="font-bold text-indigo-700">más eficaces</span> para
          pedirnos algo — incluso fuera del horario laboral. Tu solicitud llega{" "}
          <span className="font-bold text-indigo-700">directo a nuestra agenda</span>
          , no se pierde entre mensajes de WhatsApp, y aquí mismo ves en qué
          estatus va.
        </p>
      </div>

      {lista.length === 0 ? (
        <div className="rdc-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-8 text-center shadow-sm">
          <Fiscalino mood="sleeping" size={120} className="mx-auto mb-3" />
          <p className="text-slate-600 font-semibold text-sm">
            Sin solicitudes por el momento.
          </p>
          <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
            Puedes pedirnos algo desde aquí o escribirnos por WhatsApp como
            siempre. Lo registramos y ves el avance en esta pantalla.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {lista.map((enc) => {
            const prog = progresoEncargo(enc.estado);
            const meta = ESTADO_ENCARGO_META[enc.estado];
            const solicitud = solicitudClientePorGrupo(enc);
            return (
              <article
                key={enc.id}
                className="rdc-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${TIPO_ENCARGO_META[enc.tipo].chip}`}
                  >
                    {TIPO_ENCARGO_META[enc.tipo].label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.chip}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleEliminar(enc.id, enc.titulo)}
                      aria-label="Eliminar pendiente"
                      title="Eliminar"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 transition"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
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

                {solicitud.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {solicitud.map(({ grupo, notas, archivos }) => (
                      <div
                        key={grupo}
                        className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5"
                      >
                        {enc.tipo === "factura" && grupo > 0 && (
                          <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-1.5">
                            Factura {grupo}
                          </p>
                        )}
                        <ul className="space-y-1">
                          {notas.map((texto, i) => (
                            <li
                              key={`n${i}`}
                              className="text-[11px] font-semibold text-slate-600 flex items-start gap-1.5"
                            >
                              <span className="text-slate-400 mt-0.5 shrink-0">✏️</span>
                              <span className="min-w-0 break-words whitespace-pre-wrap">
                                {texto}
                              </span>
                            </li>
                          ))}
                          {archivos.map((adj, i) => (
                            <li
                              key={`a${i}`}
                              className="text-[11px] font-semibold text-slate-600 flex items-start gap-1.5"
                            >
                              <span className="text-slate-400 mt-0.5">📎</span>
                              <span className="min-w-0">
                                <span className="truncate block">
                                  {adj.nombreArchivo}
                                </span>
                                {adj.nota && (
                                  <span className="text-slate-400 font-medium">
                                    {adj.nota}
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
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
                      className={`h-full rounded-full transition-all duration-500 ${meta.barra}`}
                      style={{ width: `${prog.pct}%` }}
                    />
                  </div>
                </div>

                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                  {formatRelativoEncargo(enc.creadoEn)}
                </p>

                {enc.estado === "listo" && (
                  <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">
                    <p className="text-xs font-bold text-emerald-700">
                      ✓ Listo. Te lo enviamos por correo.
                    </p>
                    {enc.entregas && enc.entregas.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {enc.entregas.map((ent) => (
                          <li
                            key={ent.id}
                            className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5"
                          >
                            <span>•</span>
                            <span>{ent.folio}</span>
                            {ent.archivos?.map((a, i) => {
                              const href = urlArchivoEncargo(a);
                              if (!href) return null;
                              return (
                                <a
                                  key={i}
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 underline underline-offset-2 ml-1"
                                >
                                  {a.nombreArchivo.toLowerCase().endsWith(".xml")
                                    ? "XML"
                                    : "PDF"}
                                </a>
                              );
                            })}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
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
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-black shadow-lg shadow-indigo-200 hover:opacity-90 transition"
        >
          + Nueva solicitud
        </button>
        <p className="text-xs text-slate-400 text-center max-w-md leading-relaxed">
          También puedes escribirnos por{" "}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 font-bold underline underline-offset-2"
          >
            WhatsApp
          </a>{" "}
          o redes — lo registramos aquí para que veas el estatus.
        </p>
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="rdc-glass-sheet rdc-sheet-anim bg-white dark:bg-slate-900 rounded-t-3xl lg:rounded-2xl w-full lg:max-w-2xl max-h-[92vh] lg:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rdc-sheet-handle mt-2.5 lg:hidden" aria-hidden />
            <div className="flex justify-end px-4 pt-4 shrink-0">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                aria-label="Cerrar"
                className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div
              className="overflow-y-auto overflow-x-hidden px-6 sm:px-8 pb-6 sm:pb-8"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
            {ok ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <p className="text-xl font-black text-slate-800">
                  ¡Enviado a tu contador!
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Ya está en su lista. Te avisamos cuando avance.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePedir} className="space-y-5">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">
                    Nueva solicitud
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mt-1">
                    Anota lo que necesitas y adjunta tu CSF o fotos de lo que hay
                    que facturar. Lo dejamos en tu lista y lo resolvemos.
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
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-semibold focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
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
                        onClick={() => cambiarTipo(t)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                          tipo === t
                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
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
                  <div className="space-y-2 rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                      ¿Cuántas facturas necesitas?
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(cantidadFacturas - 1)}
                        className="w-10 h-10 rounded-xl bg-white border border-indigo-200 text-indigo-600 text-lg font-black hover:bg-indigo-100"
                        aria-label="Menos"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-2xl font-black text-indigo-700">
                        {cantidadFacturas}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(cantidadFacturas + 1)}
                        className="w-10 h-10 rounded-xl bg-white border border-indigo-200 text-indigo-600 text-lg font-black hover:bg-indigo-100"
                        aria-label="Más"
                      >
                        +
                      </button>
                      <span className="text-xs font-bold text-indigo-400 ml-1">
                        Un bloque por cada factura
                      </span>
                    </div>
                  </div>
                )}

                {/* Grupos de carga dinámicos (uno por factura o uno general) */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {tipo === "factura"
                      ? "Sube los documentos o fotos de cada factura"
                      : "Adjunta tu CSF, documento o fotos (opcional)"}
                  </span>

                  {Array.from({ length: numGrupos }).map((_, g) => {
                    const grupo = grupos[g] ?? [nuevaFila()];
                    return (
                      <div
                        key={g}
                        className="rounded-2xl border border-slate-200 p-3.5 space-y-2.5"
                      >
                        {tipo === "factura" && (
                          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-600">
                            Factura {g + 1}
                          </p>
                        )}
                        {grupo.map((fila) => (
                          <div
                            key={fila.id}
                            className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3 space-y-2"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <label className="inline-flex items-center cursor-pointer">
                                  <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition">
                                    {fila.file ? "Cambiar archivo" : "Seleccionar archivo"}
                                  </span>
                                  <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={(e) =>
                                      setArchivoEnFila(
                                        g,
                                        fila.id,
                                        e.target.files?.[0] ?? null
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                                {fila.file && (
                                  <p className="text-[11px] font-bold text-indigo-600 mt-1 break-all">
                                    {fila.file.name}
                                  </p>
                                )}
                              </div>
                              {grupo.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => quitarFila(g, fila.id)}
                                  className="text-xs font-bold text-slate-400 hover:text-red-500 shrink-0"
                                >
                                  Quitar
                                </button>
                              )}
                            </div>
                            <input
                              value={fila.nota}
                              onChange={(e) =>
                                setNotaEnFila(g, fila.id, e.target.value)
                              }
                              placeholder={
                                tipo === "factura"
                                  ? "Dinos qué debe llevar tu factura…"
                                  : "¿Qué es este archivo? (opcional)"
                              }
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-indigo-400 outline-none"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => agregarFila(g)}
                          className="text-xs font-black text-indigo-600 hover:text-indigo-700"
                        >
                          + Agregar otro documento o foto
                        </button>
                      </div>
                    );
                  })}

                  {errorArchivo && (
                    <p className="text-xs font-bold text-red-500">{errorArchivo}</p>
                  )}
                  <p className="text-[10px] text-slate-400 font-medium">
                    PDF o imagen. Las fotos se optimizan automáticamente.
                  </p>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Detalle general (opcional)
                  </span>
                  <textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    rows={3}
                    placeholder="Cualquier contexto que ayude — montos, conceptos, a quién facturar…"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
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
                    className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-black disabled:opacity-50 hover:opacity-90 transition shadow-lg shadow-indigo-200"
                  >
                    {enviando ? "Enviando…" : "Enviar solicitud"}
                  </button>
                </div>
              </form>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

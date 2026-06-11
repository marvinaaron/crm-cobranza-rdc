"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { useClientes } from "@/context/ClientesContext";
import { useConfirm } from "@/components/ConfirmProvider";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import Fiscalino from "@/components/Fiscalino";
import { useScrollLock } from "@/hooks/useScrollLock";
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
  type Encargo,
} from "@/lib/encargos";
import {
  subirAdjuntoCliente,
  borrarArchivosCliente,
  pathsDeEncargo,
} from "@/lib/encargos-upload";

type FilaArchivo = {
  id: string;
  /** Archivo nuevo a subir. */
  file: File | null;
  /** Archivo ya subido (modo edición); se conserva tal cual. */
  existente?: ArchivoEncargo;
  nota: string;
};
type GrupoArchivos = FilaArchivo[];

function nuevaFila(): FilaArchivo {
  return {
    id: `fa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    file: null,
    nota: "",
  };
}

/** El título de la solicitud se deriva del tipo; "Otro" lo escribe el cliente. */
function tituloPorTipo(t: TipoEncargo): string {
  return t === "otro" ? "" : TIPO_ENCARGO_META[t].label;
}

/** Reconstruye los grupos de carga a partir de un encargo (para editar). */
function gruposDesdeEncargo(enc: Encargo): GrupoArchivos[] {
  const solicitud = solicitudClientePorGrupo(enc);
  const filasDeGrupo = (grupo: number): FilaArchivo[] => {
    const s = solicitud.find((x) => x.grupo === grupo);
    const filas: FilaArchivo[] = [];
    s?.notas.forEach((texto) => filas.push({ ...nuevaFila(), nota: texto }));
    s?.archivos.forEach((adj) =>
      filas.push({ ...nuevaFila(), existente: adj, nota: adj.nota ?? "" })
    );
    return filas.length ? filas : [nuevaFila()];
  };

  if (enc.tipo === "factura") {
    const cant = enc.cantidadFacturas ?? 1;
    return Array.from({ length: cant }, (_, i) => filasDeGrupo(i + 1));
  }
  // Tipos sin facturas: un único grupo con todo (grupo 0).
  const filas: FilaArchivo[] = [];
  solicitud.forEach((s) => {
    s.notas.forEach((texto) => filas.push({ ...nuevaFila(), nota: texto }));
    s.archivos.forEach((adj) =>
      filas.push({ ...nuevaFila(), existente: adj, nota: adj.nota ?? "" })
    );
  });
  return [filas.length ? filas : [nuevaFila()]];
}

export default function PortalEncargosPage() {
  const { cliente } = usePortalAuth();
  const { getEncargosCliente, crearEncargo, editarEncargo, eliminarEncargo } =
    useClientes();
  const confirm = useConfirm();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoEncargo>("factura");
  const [nota, setNota] = useState("");
  const [cantidadFacturas, setCantidadFacturas] = useState(1);
  /** Un grupo por factura (tipo factura) o un único grupo (otros tipos). */
  const [grupos, setGrupos] = useState<GrupoArchivos[]>([[nuevaFila()]]);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [detalle, setDetalle] = useState<Encargo | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);

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
    resetModal();
    if (nueva === "opinion-32d") {
      setTipo("otro");
      setTitulo(
        "Necesito activar mi opinión de cumplimiento 32-D para consulta pública en el SAT."
      );
    }
    setModalAbierto(true);
    // Limpia el query para que no se reabra al navegar de vuelta.
    window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useScrollLock(modalAbierto || !!detalle);

  // Mantiene el detalle sincronizado si el encargo cambia (p. ej. tras actualizar).
  const detalleVivo = useMemo(
    () => (detalle ? lista.find((e) => e.id === detalle.id) ?? detalle : null),
    [detalle, lista]
  );

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
          ? grupo.map((f) =>
              f.id === filaId ? { ...f, file, existente: undefined } : f
            )
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
    // El título se deriva del tipo; "Otro" lo escribe el cliente.
    setTitulo(tituloPorTipo(t));
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
    setEditandoId(null);
    setTitulo(tituloPorTipo("factura"));
    setNota("");
    setTipo("factura");
    setCantidadFacturas(1);
    setGrupos([[nuevaFila()]]);
    setErrorArchivo(null);
    setOk(false);
  }

  function abrirNueva() {
    resetModal();
    setModalAbierto(true);
  }

  function abrirEdicion(enc: Encargo) {
    setEditandoId(enc.id);
    setTitulo(enc.titulo);
    setTipo(enc.tipo);
    setNota(enc.nota ?? "");
    setCantidadFacturas(enc.cantidadFacturas ?? 1);
    setGrupos(gruposDesdeEncargo(enc));
    setErrorArchivo(null);
    setOk(false);
    setDetalle(null);
    setModalAbierto(true);
  }

  /** Construye adjuntos (existentes + nuevos) y notas a partir de los grupos. */
  async function construirSolicitud(): Promise<{
    adjuntos: ArchivoEncargo[];
    notas: { grupo?: number; texto: string }[];
  }> {
    const adjuntos: ArchivoEncargo[] = [];
    const notas: { grupo?: number; texto: string }[] = [];
    for (let g = 0; g < numGrupos; g++) {
      const grupo = grupos[g] ?? [];
      const grupoNum = tipo === "factura" ? g + 1 : undefined;
      for (const fila of grupo) {
        const textoNota = fila.nota.trim();
        if (fila.existente) {
          adjuntos.push({
            ...fila.existente,
            nota: textoNota || undefined,
            grupo: grupoNum,
          });
        } else if (fila.file) {
          const adj = await subirAdjuntoCliente(fila.file, {
            nota: textoNota || undefined,
            grupo: grupoNum,
          });
          adjuntos.push(adj);
        } else if (textoNota) {
          notas.push({ grupo: grupoNum, texto: textoNota });
        }
      }
    }
    return { adjuntos, notas };
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!cliente || !titulo.trim()) return;
    setEnviando(true);
    setErrorArchivo(null);
    try {
      const { adjuntos, notas } = await construirSolicitud();

      if (editandoId) {
        // Borra de Storage los archivos que el cliente quitó al editar.
        const original = lista.find((x) => x.id === editandoId);
        const pathsAntes = (original?.adjuntosCliente ?? [])
          .map((a) => a.path)
          .filter((p): p is string => !!p);
        const pathsDespues = new Set(
          adjuntos.map((a) => a.path).filter((p): p is string => !!p)
        );
        const removidos = pathsAntes.filter((p) => !pathsDespues.has(p));
        if (removidos.length) void borrarArchivosCliente(removidos);

        editarEncargo(editandoId, {
          titulo: titulo.trim(),
          tipo,
          nota: nota.trim() || undefined,
          cantidadFacturas: tipo === "factura" ? cantidadFacturas : undefined,
          adjuntosCliente: adjuntos,
          notasCliente: notas,
          editadoPor: "cliente",
        });
      } else {
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
      }
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

  const editando = !!editandoId;

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
        <div className="space-y-3">
          {lista.map((enc) => {
            const prog = progresoEncargo(enc.estado);
            const meta = ESTADO_ENCARGO_META[enc.estado];
            return (
              <article
                key={enc.id}
                onClick={() => setDetalle(enc)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDetalle(enc);
                  }
                }}
                className="rdc-card group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3.5 shadow-sm text-left w-full cursor-pointer transition hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full ${meta.dot}`}
                    aria-hidden
                  />
                  <h2 className="flex-1 min-w-0 text-sm font-black text-slate-800 dark:text-white truncate">
                    {enc.titulo}
                    {enc.tipo === "factura" && enc.cantidadFacturas
                      ? ` · ${enc.cantidadFacturas} factura${enc.cantidadFacturas === 1 ? "" : "s"}`
                      : ""}
                  </h2>
                  <span
                    className={`inline-flex shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.chip}`}
                  >
                    {meta.label}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-slate-300 group-hover:text-indigo-400 transition-colors"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                {/* Barra de progreso delgada al fondo */}
                <div className="absolute left-0 bottom-0 h-1 w-full bg-slate-100 dark:bg-white/10">
                  <div
                    className={`h-full ${meta.barra} transition-all duration-500`}
                    style={{ width: `${prog.pct}%` }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex flex-col items-center gap-3 pt-4">
        <button
          type="button"
          onClick={abrirNueva}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-black shadow-md shadow-indigo-600/25 hover:opacity-90 transition"
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

      {montado &&
        modalAbierto &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setModalAbierto(false)}
          >
            <div
              className="rdc-glass-sheet rdc-sheet-anim bg-white dark:bg-slate-900 rounded-t-3xl lg:rounded-2xl w-full lg:max-w-2xl h-[92dvh] lg:h-auto lg:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rdc-sheet-handle mt-2.5 lg:hidden shrink-0" aria-hidden />
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
              {ok ? (
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 pb-6 sm:pb-8 text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <p className="text-xl font-black text-slate-800">
                    {editando ? "¡Cambios guardados!" : "¡Enviado a tu contador!"}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    {editando
                      ? "Avisamos a tu contador de la actualización."
                      : "Ya está en su lista. Te avisamos cuando avance."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleGuardar} className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 pb-4 space-y-5">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">
                        {editando ? "Editar solicitud" : "Nueva solicitud"}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed mt-1">
                        {editando
                          ? "Corrige lo que necesites. Tu contador verá la solicitud actualizada."
                          : "Elige qué necesitas y adjunta tu CSF o fotos de lo que hay que facturar. Lo dejamos en tu lista y lo resolvemos."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        ¿Qué necesitas?
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

                    {/* Campo libre solo para "Otro" */}
                    {tipo === "otro" && (
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Cuéntanos qué necesitas
                        </span>
                        <input
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          placeholder="Ej. Carta de no adeudo, constancia, etc."
                          required
                          autoFocus
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-semibold focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        />
                      </label>
                    )}

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
                                        {fila.file || fila.existente
                                          ? "Cambiar archivo"
                                          : "Seleccionar archivo"}
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
                                    {fila.file ? (
                                      <p className="text-[11px] font-bold text-indigo-600 mt-1 break-all">
                                        {fila.file.name}
                                      </p>
                                    ) : fila.existente ? (
                                      <p className="text-[11px] font-bold text-emerald-600 mt-1 break-all">
                                        ✓ {fila.existente.nombreArchivo}
                                      </p>
                                    ) : null}
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
                  </div>

                  <div
                    className="shrink-0 border-t border-slate-100 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-6 sm:px-8 pt-3 pb-4 flex gap-3"
                    style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
                  >
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
                      className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-black disabled:opacity-50 hover:opacity-90 transition shadow-md shadow-indigo-600/25"
                    >
                      {enviando
                        ? "Guardando…"
                        : editando
                          ? "Guardar cambios"
                          : "Enviar solicitud"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}

      {montado &&
        detalleVivo &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDetalle(null)}
          >
            <div
              className="rdc-glass-sheet rdc-sheet-anim bg-white dark:bg-slate-900 rounded-t-3xl lg:rounded-2xl w-full lg:max-w-2xl h-[92dvh] lg:h-auto lg:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rdc-sheet-handle mt-2.5 lg:hidden shrink-0" aria-hidden />
              <div className="flex items-center justify-between gap-2 px-5 pt-4 shrink-0">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${TIPO_ENCARGO_META[detalleVivo.tipo].chip}`}
                >
                  {TIPO_ENCARGO_META[detalleVivo.tipo].label}
                </span>
                <button
                  type="button"
                  onClick={() => setDetalle(null)}
                  aria-label="Cerrar"
                  className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-6 sm:px-8 pt-2 pb-6 sm:pb-8 space-y-5"
                style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
              >
                {(() => {
                  const meta = ESTADO_ENCARGO_META[detalleVivo.estado];
                  const prog = progresoEncargo(detalleVivo.estado);
                  const solicitud = solicitudClientePorGrupo(detalleVivo);
                  const editable = detalleVivo.estado !== "listo";
                  return (
                    <>
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.chip}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-3 break-words">
                          {detalleVivo.titulo}
                          {detalleVivo.tipo === "factura" &&
                          detalleVivo.cantidadFacturas
                            ? ` · ${detalleVivo.cantidadFacturas} factura${detalleVivo.cantidadFacturas === 1 ? "" : "s"}`
                            : ""}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          {meta.detalleCliente}
                        </p>
                      </div>

                      <div>
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

                      {detalleVivo.nota && (
                        <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                            Detalle que escribiste
                          </p>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
                            {detalleVivo.nota}
                          </p>
                        </div>
                      )}

                      {solicitud.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Lo que enviaste
                          </p>
                          {solicitud.map(({ grupo, notas, archivos }) => (
                            <div
                              key={grupo}
                              className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3"
                            >
                              {detalleVivo.tipo === "factura" && grupo > 0 && (
                                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-2">
                                  Factura {grupo}
                                </p>
                              )}
                              <ul className="space-y-2.5">
                                {notas.map((texto, i) => (
                                  <li
                                    key={`n${i}`}
                                    className="text-sm font-medium text-slate-700 flex items-start gap-2"
                                  >
                                    <span className="text-slate-400 mt-0.5 shrink-0">✏️</span>
                                    <span className="min-w-0 break-words whitespace-pre-wrap leading-relaxed">
                                      {texto}
                                    </span>
                                  </li>
                                ))}
                                {archivos.map((adj, i) => {
                                  const href = urlArchivoEncargo(adj);
                                  return (
                                    <li
                                      key={`a${i}`}
                                      className="text-sm font-medium text-slate-700 flex items-start gap-2"
                                    >
                                      <span className="text-slate-400 mt-0.5 shrink-0">📎</span>
                                      <span className="min-w-0">
                                        {href ? (
                                          <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block break-all text-indigo-600 font-semibold underline underline-offset-2"
                                          >
                                            {adj.nombreArchivo}
                                          </a>
                                        ) : (
                                          <span className="block break-all">
                                            {adj.nombreArchivo}
                                          </span>
                                        )}
                                        {adj.nota && (
                                          <span className="block text-slate-400 font-medium break-words whitespace-pre-wrap mt-0.5">
                                            {adj.nota}
                                          </span>
                                        )}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      {detalleVivo.estado === "listo" &&
                        detalleVivo.entregas &&
                        detalleVivo.entregas.length > 0 && (
                          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                            <p className="text-xs font-black text-emerald-700 mb-2">
                              ✓ Listo. Te lo enviamos por correo.
                            </p>
                            <ul className="space-y-1.5">
                              {detalleVivo.entregas.map((ent) => (
                                <li
                                  key={ent.id}
                                  className="text-sm font-semibold text-emerald-800 flex items-center gap-1.5 flex-wrap"
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
                          </div>
                        )}

                      {editable && (
                        <button
                          type="button"
                          onClick={() => abrirEdicion(detalleVivo)}
                          className="w-full py-3 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-black hover:bg-indigo-50 transition inline-flex items-center justify-center gap-2"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                          Editar solicitud
                        </button>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-3">
                          {detalleVivo.editadoEn
                            ? `Editada ${formatRelativoEncargo(detalleVivo.editadoEn)}`
                            : formatRelativoEncargo(detalleVivo.creadoEn)}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const id = detalleVivo.id;
                            const tit = detalleVivo.titulo;
                            setDetalle(null);
                            void handleEliminar(id, tit);
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          Eliminar
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

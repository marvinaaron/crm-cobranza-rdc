"use client";

import { useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import { useNotify, useConfirm } from "@/components/ConfirmProvider";
import { readFileAsDataUrl } from "@/lib/archivos";
import {
  TIPOS_ENCARGO,
  ESTADOS_ENCARGO,
  TIPO_ENCARGO_META,
  ESTADO_ENCARGO_META,
  formatFechaEncargo,
  formatRelativoEncargo,
  claveMesEncargo,
  labelMesEncargo,
  solicitudClientePorGrupo,
  nuevoIdEntrega,
  type TipoEncargo,
  type EstadoEncargo,
  type Encargo,
  type EntregaEncargo,
  type ArchivoEncargo,
} from "@/lib/encargos";

type Filtro = "todos" | "abiertos" | "listos";

type EntregaDraft = {
  id: string;
  folio: string;
  existentes: ArchivoEncargo[];
  nuevos: File[];
};

function draftDesdeEncargo(enc: Encargo): EntregaDraft[] {
  const base =
    enc.entregas && enc.entregas.length
      ? enc.entregas.map((e) => ({
          id: e.id,
          folio: e.folio,
          existentes: e.archivos ?? [],
          nuevos: [] as File[],
        }))
      : [];
  if (base.length === 0) {
    return [{ id: nuevoIdEntrega(), folio: "", existentes: [], nuevos: [] }];
  }
  return base;
}

function claveMesActual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function EncargosAdminPage() {
  const notify = useNotify();
  const confirm = useConfirm();
  const {
    listaClientes,
    encargos,
    crearEncargo,
    actualizarEstadoEncargo,
    guardarEntregasEncargo,
    liberarArchivosMes,
    eliminarEncargo,
  } = useClientes();

  const [filtro, setFiltro] = useState<Filtro>("abiertos");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoEncargo>("factura");
  const [nota, setNota] = useState("");
  const [fechaCompromiso, setFechaCompromiso] = useState("");
  /** Encargo cuyo panel de respuesta está abierto. */
  const [respuestaAbierta, setRespuestaAbierta] = useState<string | null>(null);
  /** Encargo cuyo detalle de solicitud está expandido. */
  const [detalleAbierto, setDetalleAbierto] = useState<string | null>(null);
  const [draft, setDraft] = useState<EntregaDraft[]>([]);
  const [guardandoEntrega, setGuardandoEntrega] = useState(false);

  const clientesActivos = useMemo(
    () =>
      [...listaClientes]
        .filter((c) => c.activo)
        .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial, "es")),
    [listaClientes]
  );

  const nombreCliente = (id: number) =>
    listaClientes.find((c) => c.id === id)?.razonSocial ?? `Cliente #${id}`;

  const lista = useMemo(() => {
    const sorted = [...encargos].sort((a, b) =>
      b.creadoEn.localeCompare(a.creadoEn)
    );
    if (filtro === "abiertos") return sorted.filter((e) => e.estado !== "listo");
    if (filtro === "listos") return sorted.filter((e) => e.estado === "listo");
    return sorted;
  }, [encargos, filtro]);

  // Agrupa por mes (clave 'YYYY-MM') para tener un histórico mensual de
  // extras hechos — útil para cobrar al cierre del mes.
  const grupos = useMemo(() => {
    const map = new Map<string, Encargo[]>();
    for (const e of lista) {
      const k = claveMesEncargo(e);
      const arr = map.get(k) ?? [];
      arr.push(e);
      map.set(k, arr);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [lista]);

  const mesActual = claveMesActual();
  const abiertos = encargos.filter((e) => e.estado !== "listo").length;

  function resetFormulario() {
    setTitulo("");
    setNota("");
    setFechaCompromiso("");
    setTipo("factura");
  }

  function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    if (clienteId === "" || !titulo.trim()) {
      void notify({ titulo: "Faltan datos", mensaje: "Elige un cliente y escribe un título.", tono: "warning" });
      return;
    }
    crearEncargo({
      clienteId: Number(clienteId),
      titulo: titulo.trim(),
      tipo,
      nota: nota.trim() || undefined,
      fechaCompromiso: fechaCompromiso || undefined,
      creadoPor: "admin",
    });
    resetFormulario();
    void notify({
      titulo: "Encargo registrado",
      mensaje: "El cliente lo verá en su portal.",
    });
  }

  function cambiarEstado(enc: Encargo, estado: EstadoEncargo) {
    actualizarEstadoEncargo(enc.id, estado);
    void notify({
      titulo: "Estado actualizado",
      mensaje: ESTADO_ENCARGO_META[estado].label,
    });
  }

  async function handleEliminar(enc: Encargo) {
    const ok = await confirm({
      titulo: "Eliminar encargo",
      mensaje: `¿Eliminar "${enc.titulo}"? Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    eliminarEncargo(enc.id);
  }

  function abrirRespuesta(enc: Encargo) {
    if (respuestaAbierta === enc.id) {
      setRespuestaAbierta(null);
      return;
    }
    setDraft(draftDesdeEncargo(enc));
    setRespuestaAbierta(enc.id);
  }

  function setFolio(id: string, folio: string) {
    setDraft((prev) => prev.map((d) => (d.id === id ? { ...d, folio } : d)));
  }

  function setArchivosEntrega(id: string, files: FileList | null) {
    const arr = files ? Array.from(files) : [];
    setDraft((prev) =>
      prev.map((d) => (d.id === id ? { ...d, nuevos: [...d.nuevos, ...arr] } : d))
    );
  }

  function agregarEntrega() {
    setDraft((prev) => [
      ...prev,
      { id: nuevoIdEntrega(), folio: "", existentes: [], nuevos: [] },
    ]);
  }

  function quitarEntrega(id: string) {
    setDraft((prev) => {
      const next = prev.filter((d) => d.id !== id);
      return next.length
        ? next
        : [{ id: nuevoIdEntrega(), folio: "", existentes: [], nuevos: [] }];
    });
  }

  async function buildEntregas(): Promise<EntregaEncargo[]> {
    const out: EntregaEncargo[] = [];
    for (const d of draft) {
      if (!d.folio.trim()) continue;
      const archivos: ArchivoEncargo[] = [...d.existentes];
      for (const f of d.nuevos) {
        const dataUrl = await readFileAsDataUrl(f);
        archivos.push({
          nombreArchivo: f.name,
          tipoMime: f.type || "application/octet-stream",
          dataUrl,
          subidoEn: new Date().toISOString(),
        });
      }
      out.push({
        id: d.id,
        folio: d.folio.trim(),
        archivos: archivos.length ? archivos : undefined,
      });
    }
    return out;
  }

  async function guardarRespuesta(enc: Encargo, marcarListo: boolean) {
    setGuardandoEntrega(true);
    try {
      const entregas = await buildEntregas();
      guardarEntregasEncargo(enc.id, entregas, { marcarListo });
      setRespuestaAbierta(null);
      void notify({
        titulo: marcarListo ? "Encargo listo" : "Respuesta guardada",
        mensaje: marcarListo
          ? "El cliente ya puede verlo en su portal."
          : "Se guardaron las facturas.",
      });
    } finally {
      setGuardandoEntrega(false);
    }
  }

  async function handleLiberarMes(clave: string) {
    const ok = await confirm({
      titulo: "Liberar archivos del mes",
      mensaje:
        "Se borrarán los PDFs, XML y fotos cargados de este mes. Solo quedará el texto (folios y notas) como histórico. Esto no se puede deshacer.",
      textoConfirmar: "Liberar archivos",
      tono: "warning",
    });
    if (!ok) return;
    const n = liberarArchivosMes(clave);
    void notify({
      titulo: "Archivos liberados",
      mensaje: `Se liberó el espacio de ${n} encargo${n === 1 ? "" : "s"}.`,
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header>
        <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.3em] mb-1">
          Solicitudes personalizadas
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Encargos
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-2 max-w-xl">
              Registra lo que te pidieron por WhatsApp o redes. El cliente ve el
              avance en su portal — sin formularios complicados.
            </p>
          </div>
          {abiertos > 0 && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold ring-1 ring-amber-200">
              {abiertos} pendiente{abiertos === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </header>

      {/* Crear encargo rápido */}
      <form
        onSubmit={handleCrear}
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
      >
        <p className="text-sm font-black text-slate-800">Nuevo encargo</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Cliente
            </span>
            <select
              value={clienteId === "" ? "" : String(clienteId)}
              onChange={(e) =>
                setClienteId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800 bg-white"
            >
              <option value="">Seleccionar…</option>
              {clientesActivos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razonSocial}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Título
            </span>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Factura de marzo"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800"
            />
          </label>
        </div>

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
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  tipo === t
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {TIPO_ENCARGO_META[t].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Nota interna (opcional)
            </span>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              placeholder="Contexto de WhatsApp, urgencia, etc."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 resize-none"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Fecha compromiso (opcional)
            </span>
            <input
              type="date"
              value={fechaCompromiso}
              onChange={(e) => setFechaCompromiso(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800"
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 text-white text-sm font-black hover:bg-violet-700 transition shadow-md shadow-violet-200"
        >
          Crear encargo
        </button>
      </form>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["abiertos", "Abiertos"],
            ["todos", "Todos"],
            ["listos", "Listos"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFiltro(id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition ${
              filtro === id
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista agrupada por mes (histórico para cobrar extras) */}
      <div className="space-y-8">
        {lista.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
            <p className="text-slate-500 font-semibold text-sm">
              {filtro === "abiertos"
                ? "No hay encargos pendientes. Cuando te pidan algo por WhatsApp, regístralo arriba."
                : "No hay encargos en esta vista."}
            </p>
          </div>
        ) : (
          grupos.map(([clave, items]) => {
            const completados = items.filter((e) => e.estado === "listo").length;
            const esMesActual = clave === mesActual;
            return (
              <section key={clave} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      {labelMesEncargo(clave)}
                    </h2>
                    {esMesActual && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                        Mes en curso
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-500">
                      {items.length} extra{items.length === 1 ? "" : "s"} ·{" "}
                      {completados} completado{completados === 1 ? "" : "s"}
                      {!esMesActual && completados > 0 ? " · cobrable" : ""}
                    </span>
                    {items.some(
                      (e) =>
                        (e.adjuntosCliente?.length ?? 0) > 0 ||
                        e.entregas?.some((x) => (x.archivos?.length ?? 0) > 0)
                    ) && (
                      <button
                        type="button"
                        onClick={() => void handleLiberarMes(clave)}
                        className="text-[11px] font-bold text-slate-400 hover:text-red-500 underline underline-offset-2"
                        title="Borra los archivos cargados, conserva el texto"
                      >
                        Liberar archivos
                      </button>
                    )}
                  </div>
                </div>

                {!esMesActual && (
                  <p className="px-1 text-[11px] text-slate-400 font-medium -mt-1">
                    Histórico del mes — úsalo para cobrar los extras realizados.
                  </p>
                )}

                {items.map((enc) => (
            <article
              key={enc.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${TIPO_ENCARGO_META[enc.tipo].chip}`}
                    >
                      {TIPO_ENCARGO_META[enc.tipo].label}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ESTADO_ENCARGO_META[enc.estado].chip}`}
                    >
                      {ESTADO_ENCARGO_META[enc.estado].label}
                    </span>
                    {enc.creadoPor === "cliente" && (
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">
                        · Desde portal
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-black text-slate-900">{enc.titulo}</h2>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">
                    {nombreCliente(enc.clienteId)}
                    {enc.tipo === "factura" && enc.cantidadFacturas
                      ? ` · ${enc.cantidadFacturas} factura${enc.cantidadFacturas === 1 ? "" : "s"}`
                      : ""}
                  </p>
                  {enc.nota && (
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {enc.nota}
                    </p>
                  )}
                  {enc.archivosLiberados && (
                    <p className="mt-2 text-[11px] font-bold text-slate-400 italic">
                      Archivos liberados — solo queda el texto.
                    </p>
                  )}
                  {(() => {
                    const solicitud = solicitudClientePorGrupo(enc);
                    if (solicitud.length === 0) return null;
                    const abierto = detalleAbierto === enc.id;
                    if (!abierto) {
                      return (
                        <button
                          type="button"
                          onClick={() => setDetalleAbierto(enc.id)}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-700"
                        >
                          Ver lo que pide el cliente
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                      );
                    }
                    return (
                      <div className="mt-3 space-y-2">
                        <button
                          type="button"
                          onClick={() => setDetalleAbierto(null)}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600"
                        >
                          Lo que pide el cliente
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                        </button>
                        {solicitud.map(({ grupo, notas, archivos }) => (
                          <div
                            key={grupo}
                            className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-2"
                          >
                            {enc.tipo === "factura" && grupo > 0 && (
                              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-1">
                                Factura {grupo}
                              </p>
                            )}
                            {notas.map((texto, i) => (
                              <p
                                key={`n${i}`}
                                className="text-xs font-semibold text-slate-700 flex items-start gap-1.5"
                              >
                                <span className="text-slate-400 shrink-0">✏️</span>
                                <span className="min-w-0 break-words whitespace-pre-wrap">
                                  {texto}
                                </span>
                              </p>
                            ))}
                            {archivos.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {archivos.map((adj, i) => (
                                  <a
                                    key={i}
                                    href={adj.dataUrl}
                                    download={adj.nombreArchivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={adj.nota || adj.nombreArchivo}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-100 transition"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    {adj.nota
                                      ? adj.nota.length > 24
                                        ? adj.nota.slice(0, 22) + "…"
                                        : adj.nota
                                      : adj.nombreArchivo.length > 22
                                        ? adj.nombreArchivo.slice(0, 20) + "…"
                                        : adj.nombreArchivo}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                    {formatRelativoEncargo(enc.creadoEn)}
                    {enc.fechaCompromiso
                      ? ` · Vence ${formatFechaEncargo(enc.fechaCompromiso)}`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <select
                    value={enc.estado}
                    onChange={(e) =>
                      cambiarEstado(enc, e.target.value as EstadoEncargo)
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-white"
                  >
                    {ESTADOS_ENCARGO.map((st) => (
                      <option key={st} value={st}>
                        {ESTADO_ENCARGO_META[st].label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void handleEliminar(enc)}
                    aria-label="Eliminar encargo"
                    title="Eliminar"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>

              {/* Resumen de entregas guardadas */}
              {enc.entregas && enc.entregas.length > 0 && (
                <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-1.5">
                    {enc.entregas.length === 1 ? "Factura hecha" : "Facturas hechas"}
                  </p>
                  <ul className="space-y-1">
                    {enc.entregas.map((ent) => (
                      <li
                        key={ent.id}
                        className="text-xs font-bold text-emerald-800 flex items-center gap-2 flex-wrap"
                      >
                        <span>• {ent.folio}</span>
                        {ent.archivos?.map((a, i) => (
                          <a
                            key={i}
                            href={a.dataUrl}
                            download={a.nombreArchivo}
                            className="text-emerald-600 underline underline-offset-2 font-bold"
                          >
                            {a.nombreArchivo.toLowerCase().endsWith(".xml")
                              ? "XML"
                              : "PDF"}
                          </a>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Toggle panel de respuesta */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => abrirRespuesta(enc)}
                  className="text-xs font-black text-violet-600 hover:text-violet-700"
                >
                  {respuestaAbierta === enc.id
                    ? "Cerrar"
                    : enc.entregas?.length
                      ? "Editar respuesta"
                      : "Responder · marcar facturas hechas"}
                </button>
              </div>

              {respuestaAbierta === enc.id && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                    Anota el folio de cada factura (ej.{" "}
                    <span className="font-black text-slate-700">HG-10209</span>).
                    Opcionalmente adjunta el PDF/XML — recuerda que puedes liberar
                    esos archivos al cierre de mes.
                  </p>
                  {draft.map((d, idx) => (
                    <div
                      key={d.id}
                      className="flex flex-wrap items-center gap-2 bg-white rounded-lg border border-slate-200 p-2.5"
                    >
                      <span className="text-xs font-black text-slate-400 w-5 text-center">
                        {idx + 1}
                      </span>
                      <input
                        value={d.folio}
                        onChange={(e) => setFolio(d.id, e.target.value)}
                        placeholder="Folio de la factura"
                        className="flex-1 min-w-[140px] rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 uppercase"
                      />
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold cursor-pointer hover:bg-slate-200 shrink-0">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        PDF/XML
                        <input
                          type="file"
                          accept=".pdf,.xml,application/pdf,text/xml,application/xml"
                          multiple
                          onChange={(e) => setArchivosEntrega(d.id, e.target.files)}
                          className="hidden"
                        />
                      </label>
                      {(d.existentes.length > 0 || d.nuevos.length > 0) && (
                        <span className="text-[11px] font-bold text-emerald-600">
                          {d.existentes.length + d.nuevos.length} arch.
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => quitarEntrega(d.id)}
                        className="text-xs font-bold text-slate-400 hover:text-red-500 shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={agregarEntrega}
                    className="text-xs font-black text-violet-600 hover:text-violet-700"
                  >
                    + Agregar otra factura
                  </button>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={guardandoEntrega}
                      onClick={() => void guardarRespuesta(enc, false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      disabled={guardandoEntrega}
                      onClick={() => void guardarRespuesta(enc, true)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {guardandoEntrega ? "Guardando…" : "Guardar y marcar Listo"}
                    </button>
                  </div>
                </div>
              )}
            </article>
                ))}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

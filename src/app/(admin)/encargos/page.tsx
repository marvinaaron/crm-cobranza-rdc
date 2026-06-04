"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useClientes } from "@/context/ClientesContext";
import { useNotify, useConfirm } from "@/components/ConfirmProvider";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useSwipeReveal } from "@/hooks/useSwipeReveal";
import {
  subirArchivoAdmin,
  borrarArchivosEncargosAdmin,
} from "@/lib/encargos-upload";
import {
  TIPOS_ENCARGO,
  ESTADOS_ENCARGO,
  TIPO_ENCARGO_META,
  ESTADO_ENCARGO_META,
  formatFechaEncargo,
  formatRelativoEncargo,
  progresoEncargo,
  claveMesEncargo,
  labelMesEncargo,
  solicitudClientePorGrupo,
  urlArchivoEncargo,
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

/** Siguiente estado en el ciclo (avance rápido desde el swipe). */
function siguienteEstado(e: EstadoEncargo): EstadoEncargo {
  const i = ESTADOS_ENCARGO.indexOf(e);
  return ESTADOS_ENCARGO[(i + 1) % ESTADOS_ENCARGO.length];
}

/** Color del anillo de progreso según el estado del encargo. */
const ANILLO_STROKE: Record<EstadoEncargo, string> = {
  recibido: "#94a3b8", // slate-400
  en_proceso: "#f59e0b", // amber-500
  esperando_cliente: "#f59e0b",
  listo: "#10b981", // emerald-500
};

/** Anillo de progreso circular con el número de paso al centro. */
function AnilloProgreso({
  estado,
  paso,
  pct,
}: {
  estado: EstadoEncargo;
  paso: number;
  pct: number;
}) {
  const R = 15.5;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative w-11 h-11 shrink-0">
      <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
        <circle cx="18" cy="18" r={R} fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={R}
          fill="none"
          stroke={ANILLO_STROKE[estado]}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct / 100)}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-700">
        {paso}
      </span>
    </div>
  );
}

/* ───────────────────────── Fila (swipe-to-reveal) ───────────────────────── */

const ANCHO_ACCIONES_FILA = 124;

function FilaEncargo({
  enc,
  nombreCliente,
  swipeAbierto,
  onSwipeAbrir,
  onSwipeCerrar,
  onAbrir,
  onEliminar,
  onAvanzarEstado,
}: {
  enc: Encargo;
  nombreCliente: string;
  swipeAbierto: boolean;
  onSwipeAbrir: () => void;
  onSwipeCerrar: () => void;
  onAbrir: () => void;
  onEliminar: () => void;
  onAvanzarEstado: () => void;
}) {
  const meta = ESTADO_ENCARGO_META[enc.estado];
  const prog = progresoEncargo(enc.estado);
  const { estiloFrontal, bindings, abierto, cerrar, esArrastreActivo } =
    useSwipeReveal({
      anchoAcciones: ANCHO_ACCIONES_FILA,
      abiertoExterno: swipeAbierto,
      onAbrir: onSwipeAbrir,
      onCerrar: onSwipeCerrar,
    });

  const handleClick = () => {
    if (esArrastreActivo()) return;
    if (abierto) {
      cerrar();
      return;
    }
    onAbrir();
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl">
      {/* Acciones reveladas al deslizar a la izquierda */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end gap-2.5 pr-3"
        style={{ width: ANCHO_ACCIONES_FILA }}
        aria-hidden={!abierto}
      >
        <button
          type="button"
          aria-label="Avanzar estado"
          title={`Avanzar a "${ESTADO_ENCARGO_META[siguienteEstado(enc.estado)].label}"`}
          onClick={(e) => {
            e.stopPropagation();
            cerrar();
            onAvanzarEstado();
          }}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 active:scale-90 transition-transform"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
        </button>
        <button
          type="button"
          aria-label="Eliminar encargo"
          onClick={(e) => {
            e.stopPropagation();
            cerrar();
            onEliminar();
          }}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-100 active:scale-90 transition-transform"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>

      {/* Capa frontal: lo fundamental (tipo + cliente) y el anillo de avance */}
      <button
        type="button"
        onClick={handleClick}
        {...bindings}
        style={estiloFrontal}
        className="relative w-full max-w-full text-left bg-white border border-slate-200 rounded-2xl pl-3 pr-3.5 py-3 shadow-sm transition-shadow hover:shadow-md touch-pan-y"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${TIPO_ENCARGO_META[enc.tipo].chip}`}
              >
                {TIPO_ENCARGO_META[enc.tipo].label}
                {enc.tipo === "factura" && enc.cantidadFacturas
                  ? ` ×${enc.cantidadFacturas}`
                  : ""}
              </span>
              {enc.editadoEn && (
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-700">
                  · Editado
                </span>
              )}
            </div>
            <p className="text-[15px] font-black text-slate-900 truncate mt-1">
              {nombreCliente}
            </p>
          </div>

          {/* Anillo de avance con el número de paso */}
          <AnilloProgreso estado={enc.estado} paso={prog.paso} pct={prog.pct} />
        </div>

        {/* Punto de estado discreto (color del semáforo) */}
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full ${meta.barra}`}
          aria-hidden
        />
      </button>
    </div>
  );
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
  /** Formulario "Nuevo encargo" visible. */
  const [formAbierto, setFormAbierto] = useState(false);
  /** Encargo cuyo panel de detalle (la "tarea") está abierto. */
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  /** Fila con el swipe de acciones revelado (solo una a la vez). */
  const [swipeAbiertoId, setSwipeAbiertoId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EntregaDraft[]>([]);
  const [guardandoEntrega, setGuardandoEntrega] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);

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

  /** Encargo activo en el panel de detalle (siempre fresco desde el estado). */
  const encDetalle = useMemo(
    () => (abiertoId ? encargos.find((e) => e.id === abiertoId) ?? null : null),
    [abiertoId, encargos]
  );

  useScrollLock(!!abiertoId);

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
    void borrarArchivosEncargosAdmin([enc]);
    eliminarEncargo(enc.id);
    setAbiertoId(null);
  }

  function abrirDetalle(enc: Encargo) {
    setDraft(draftDesdeEncargo(enc));
    setAbiertoId(enc.id);
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
        const adj = await subirArchivoAdmin(f);
        archivos.push(adj);
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
      void notify({
        titulo: marcarListo ? "Encargo listo" : "Respuesta guardada",
        mensaje: marcarListo
          ? "El cliente ya puede verlo en su portal."
          : "Se guardaron las facturas.",
      });
      if (marcarListo) setAbiertoId(null);
    } catch (err) {
      void notify({
        titulo: "No se pudo guardar",
        mensaje:
          err instanceof Error
            ? err.message
            : "Revisa los archivos e inténtalo de nuevo.",
        tono: "warning",
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
    // Borra primero los archivos de Storage de los encargos de ese mes.
    const delMes = encargos.filter((e) => claveMesEncargo(e) === clave);
    void borrarArchivosEncargosAdmin(delMes);
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

      {/* Crear encargo rápido (colapsable) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setFormAbierto((v) => !v)}
          className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left"
        >
          <span className="text-sm font-black text-slate-800 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600"><path d="M12 5v14M5 12h14"/></svg>
            Nuevo encargo
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-slate-400 transition-transform ${formAbierto ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {formAbierto && (
          <form
            onSubmit={handleCrear}
            className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4 border-t border-slate-100 pt-4"
          >
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
        )}
      </div>

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
            // Recuento por tipo del mes (para cobrar al cierre).
            const conteoTipos = items.reduce<Record<string, number>>((acc, e) => {
              acc[e.tipo] = (acc[e.tipo] ?? 0) + 1;
              return acc;
            }, {});
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

                {/* Recuento por tipo del mes (recuento para cobrar) */}
                <div className="flex flex-wrap gap-1.5 px-1">
                  {TIPOS_ENCARGO.filter((t) => conteoTipos[t]).map((t) => (
                    <span
                      key={t}
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${TIPO_ENCARGO_META[t].chip}`}
                    >
                      {conteoTipos[t]} {TIPO_ENCARGO_META[t].label}
                      {conteoTipos[t] === 1 ? "" : "s"}
                    </span>
                  ))}
                </div>

                {/* Filas: desliza para revelar acciones (cambiar estado / eliminar) */}
                <div className="space-y-2">
                  {items.map((enc) => (
                    <FilaEncargo
                      key={enc.id}
                      enc={enc}
                      nombreCliente={nombreCliente(enc.clienteId)}
                      swipeAbierto={swipeAbiertoId === enc.id}
                      onSwipeAbrir={() => setSwipeAbiertoId(enc.id)}
                      onSwipeCerrar={() =>
                        setSwipeAbiertoId((id) => (id === enc.id ? null : id))
                      }
                      onAbrir={() => abrirDetalle(enc)}
                      onEliminar={() => void handleEliminar(enc)}
                      onAvanzarEstado={() =>
                        cambiarEstado(enc, siguienteEstado(enc.estado))
                      }
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Panel de detalle (la "tarea") */}
      {montado &&
        encDetalle &&
        createPortal(
          <DetalleEncargo
            enc={encDetalle}
            nombreCliente={nombreCliente(encDetalle.clienteId)}
            draft={draft}
            guardando={guardandoEntrega}
            onCerrar={() => setAbiertoId(null)}
            onCambiarEstado={(st) => cambiarEstado(encDetalle, st)}
            onSetFolio={setFolio}
            onArchivos={setArchivosEntrega}
            onAgregar={agregarEntrega}
            onQuitar={quitarEntrega}
            onGuardar={(listo) => void guardarRespuesta(encDetalle, listo)}
            onEliminar={() => void handleEliminar(encDetalle)}
          />,
          document.body
        )}
    </div>
  );
}

/* ─────────────────────────── Detalle (sheet) ─────────────────────────── */

function DetalleEncargo({
  enc,
  nombreCliente,
  draft,
  guardando,
  onCerrar,
  onCambiarEstado,
  onSetFolio,
  onArchivos,
  onAgregar,
  onQuitar,
  onGuardar,
  onEliminar,
}: {
  enc: Encargo;
  nombreCliente: string;
  draft: EntregaDraft[];
  guardando: boolean;
  onCerrar: () => void;
  onCambiarEstado: (estado: EstadoEncargo) => void;
  onSetFolio: (id: string, folio: string) => void;
  onArchivos: (id: string, files: FileList | null) => void;
  onAgregar: () => void;
  onQuitar: (id: string) => void;
  onGuardar: (marcarListo: boolean) => void;
  onEliminar: () => void;
}) {
  const meta = ESTADO_ENCARGO_META[enc.estado];
  const prog = progresoEncargo(enc.estado);
  const solicitud = solicitudClientePorGrupo(enc);
  const hayPedido = solicitud.length > 0 || !!enc.nota;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6 bg-slate-900/50 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-t-3xl lg:rounded-2xl w-full lg:max-w-2xl h-[92dvh] lg:h-auto lg:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2.5 lg:hidden w-9 h-1 rounded-full bg-slate-300 shrink-0" aria-hidden />
        <div className="flex items-center justify-between gap-2 px-5 pt-4 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${TIPO_ENCARGO_META[enc.tipo].chip}`}
            >
              {TIPO_ENCARGO_META[enc.tipo].label}
            </span>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-5 sm:px-7 pt-2 pb-6 space-y-5">
          {/* Encabezado de la tarea */}
          <div>
            <h3 className="text-2xl font-black text-slate-900 break-words">
              {enc.titulo}
              {enc.tipo === "factura" && enc.cantidadFacturas
                ? ` · ${enc.cantidadFacturas} factura${enc.cantidadFacturas === 1 ? "" : "s"}`
                : ""}
            </h3>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">
              {nombreCliente}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              {enc.editadoEn
                ? `Editado ${formatRelativoEncargo(enc.editadoEn)}`
                : formatRelativoEncargo(enc.creadoEn)}
              {enc.fechaCompromiso
                ? ` · Vence ${formatFechaEncargo(enc.fechaCompromiso)}`
                : ""}
              {" · "}
              {enc.creadoPor === "cliente"
                ? "La pidió el cliente en su portal"
                : "Registrada por el equipo"}
            </p>
          </div>

          {/* Estado de la tarea */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              <span>Estado</span>
              <span>{prog.pct}%</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ESTADOS_ENCARGO.map((st) => {
                const m = ESTADO_ENCARGO_META[st];
                const activo = st === enc.estado;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onCambiarEstado(st)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-black transition ring-1 ring-inset ${
                      activo
                        ? `${m.chip} ring-transparent`
                        : "bg-white text-slate-500 ring-slate-200 hover:ring-slate-300"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
            <div className="h-1.5 mt-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full ${meta.barra} transition-all duration-500`}
                style={{ width: `${prog.pct}%` }}
              />
            </div>
          </div>

          {/* Lo que pide el cliente (estilo conversación por factura) */}
          {hayPedido && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Lo que pide el cliente
              </p>

              {enc.nota && (
                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    {enc.creadoPor === "cliente" ? "Detalle del cliente" : "Nota interna"}
                  </p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
                    {enc.nota}
                  </p>
                </div>
              )}

              {enc.archivosLiberados && (
                <p className="text-[11px] font-bold text-slate-400 italic">
                  Archivos liberados — solo queda el texto.
                </p>
              )}

              {solicitud.map(({ grupo, notas, archivos }) => {
                const label =
                  enc.tipo === "factura" && grupo > 0
                    ? `Factura ${grupo}`
                    : "Solicitud";
                return (
                  <div
                    key={grupo}
                    className="rounded-2xl border border-slate-200 overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">
                        {label}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {notas.length + archivos.length}{" "}
                        {notas.length + archivos.length === 1 ? "dato" : "datos"}
                      </span>
                    </div>
                    <div className="p-3 space-y-2">
                      {notas.length === 0 && archivos.length === 0 && (
                        <p className="text-xs font-medium text-slate-400 italic">
                          Sin indicaciones.
                        </p>
                      )}
                      {/* Mensajes (texto del cliente) */}
                      {notas.map((texto, i) => (
                        <div
                          key={`n${i}`}
                          className="flex items-start gap-2 rounded-xl bg-indigo-50/60 px-3 py-2"
                        >
                          <span className="text-slate-400 mt-0.5 shrink-0">💬</span>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed break-words whitespace-pre-wrap min-w-0">
                            {texto}
                          </p>
                        </div>
                      ))}
                      {/* Archivos adjuntos: el texto del cliente se lee completo,
                          el archivo queda como clip descargable debajo. */}
                      {archivos.map((adj, i) => {
                        const href = urlArchivoEncargo(adj);
                        const clip = (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                            <span className="truncate max-w-[200px]">
                              {adj.nombreArchivo}
                            </span>
                          </>
                        );
                        return (
                          <div
                            key={`a${i}`}
                            className="rounded-xl bg-indigo-50/60 px-3 py-2 space-y-1.5"
                          >
                            {adj.nota && (
                              <div className="flex items-start gap-2">
                                <span className="text-slate-400 mt-0.5 shrink-0">💬</span>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed break-words whitespace-pre-wrap min-w-0">
                                  {adj.nota}
                                </p>
                              </div>
                            )}
                            {href ? (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={adj.nombreArchivo}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-100 transition"
                              >
                                {clip}
                              </a>
                            ) : (
                              <span
                                title={adj.nombreArchivo}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold"
                              >
                                {clip}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tu respuesta — entrega de facturas (la finalización) */}
        <div
          className="shrink-0 border-t border-slate-200 bg-slate-50 px-5 sm:px-7 pt-3 pb-4 space-y-2.5"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Tu respuesta · facturas entregadas
            </p>
            <button
              type="button"
              onClick={onEliminar}
              className="text-[11px] font-bold text-slate-400 hover:text-red-500 inline-flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              Eliminar
            </button>
          </div>

          <div className="max-h-[28vh] overflow-y-auto space-y-2 pr-0.5">
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
                  onChange={(e) => onSetFolio(d.id, e.target.value)}
                  placeholder="Folio de la factura"
                  className="flex-1 min-w-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 uppercase"
                />
                <label className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold cursor-pointer hover:bg-slate-200 shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  PDF/XML
                  <input
                    type="file"
                    accept=".pdf,.xml,application/pdf,text/xml,application/xml"
                    multiple
                    onChange={(e) => onArchivos(d.id, e.target.files)}
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
                  onClick={() => onQuitar(d.id)}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onAgregar}
            className="text-xs font-black text-violet-600 hover:text-violet-700"
          >
            + Agregar otra factura
          </button>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={guardando}
              onClick={() => onGuardar(false)}
              className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              type="button"
              disabled={guardando}
              onClick={() => onGuardar(true)}
              className="flex-[2] py-3 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Guardar y marcar listo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

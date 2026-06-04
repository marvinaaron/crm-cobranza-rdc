"use client";

import { useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import { useNotify } from "@/components/ConfirmProvider";
import {
  TIPOS_ENCARGO,
  ESTADOS_ENCARGO,
  TIPO_ENCARGO_META,
  ESTADO_ENCARGO_META,
  formatFechaEncargo,
  formatRelativoEncargo,
  type TipoEncargo,
  type EstadoEncargo,
  type Encargo,
} from "@/lib/encargos";
import { readFileAsDataUrl } from "@/lib/archivos";

type Filtro = "todos" | "abiertos" | "listos";

export default function EncargosAdminPage() {
  const notify = useNotify();
  const {
    listaClientes,
    encargos,
    crearEncargo,
    actualizarEstadoEncargo,
    eliminarEncargo,
  } = useClientes();

  const [filtro, setFiltro] = useState<Filtro>("abiertos");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoEncargo>("factura");
  const [nota, setNota] = useState("");
  const [fechaCompromiso, setFechaCompromiso] = useState("");
  const [archivoPorId, setArchivoPorId] = useState<Record<string, File | null>>(
    {}
  );

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

  async function cambiarEstado(enc: Encargo, estado: EstadoEncargo) {
    let archivoPayload: { nombreArchivo: string; tipoMime: string; dataUrl: string } | undefined;
    const file = archivoPorId[enc.id];
    if (estado === "listo" && file) {
      const dataUrl = await readFileAsDataUrl(file);
      archivoPayload = {
        nombreArchivo: file.name,
        tipoMime: file.type || "application/octet-stream",
        dataUrl,
      };
    }
    actualizarEstadoEncargo(enc.id, estado, {
      archivo: archivoPayload,
    });
    setArchivoPorId((prev) => ({ ...prev, [enc.id]: null }));
    void notify({
      titulo: "Estado actualizado",
      mensaje: ESTADO_ENCARGO_META[estado].label,
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

      {/* Lista */}
      <div className="space-y-3">
        {lista.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
            <p className="text-slate-500 font-semibold text-sm">
              {filtro === "abiertos"
                ? "No hay encargos pendientes. Cuando te pidan algo por WhatsApp, regístralo arriba."
                : "No hay encargos en esta vista."}
            </p>
          </div>
        ) : (
          lista.map((enc) => (
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
                  </p>
                  {enc.nota && (
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {enc.nota}
                    </p>
                  )}
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
                      void cambiarEstado(enc, e.target.value as EstadoEncargo)
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
                    onClick={() => eliminarEncargo(enc.id)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {enc.estado === "listo" && !enc.archivo && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Adjuntar archivo para el cliente (opcional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) =>
                      setArchivoPorId((prev) => ({
                        ...prev,
                        [enc.id]: e.target.files?.[0] ?? null,
                      }))
                    }
                    className="text-xs text-slate-600"
                  />
                  {archivoPorId[enc.id] && (
                    <button
                      type="button"
                      onClick={() =>
                        void cambiarEstado(enc, "listo")
                      }
                      className="mt-2 text-xs font-bold text-violet-600 hover:underline"
                    >
                      Subir archivo al encargo
                    </button>
                  )}
                </div>
              )}

              {enc.archivo && (
                <p className="mt-3 text-xs font-bold text-emerald-600">
                  Archivo: {enc.archivo.nombreArchivo}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

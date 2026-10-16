"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useClientes } from "@/context/ClientesContext";
import { useNotify, useConfirm } from "@/components/ConfirmProvider";
import TimelinePendiente from "@/components/admin/TimelinePendiente";
import { esIngresoGeneralCliente } from "@/lib/clientes";
import { exportarPendientesExcel } from "@/lib/pendientes-export";
import AdminPageHeading from "@/components/admin/AdminPageHeading";
import BotonExportarMenu from "@/components/admin/BotonExportarMenu";
import MenuFiltroIcono from "@/components/admin/MenuFiltroIcono";
import {
  ESTADO_PENDIENTE_META,
  ESTADOS_PENDIENTE,
  fechaMasDias,
  isoHoy,
  pendienteDeEncargo,
  type EstadoPendiente,
  type Pendiente,
} from "@/lib/pendientes";

type Filtro = "abiertos" | "todos" | "hecho";

export default function PendientesAdminPage() {
  const notify = useNotify();
  const confirm = useConfirm();
  const {
    listaClientes,
    pendientes,
    encargos,
    crearPendiente,
    crearPendienteDesdeEncargo,
    actualizarPendiente,
    eliminarPendiente,
  } = useClientes();

  const [filtro, setFiltro] = useState<Filtro>("abiertos");
  const [formAbierto, setFormAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [inicio, setInicio] = useState(isoHoy);
  const [fin, setFin] = useState(() => fechaMasDias(isoHoy(), 3));
  const [deadlineInterno, setDeadlineInterno] = useState("");
  const [exportando, setExportando] = useState(false);

  const clientesActivos = useMemo(
    () =>
      [...listaClientes]
        .filter((c) => c.activo && !esIngresoGeneralCliente(c))
        .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial, "es")),
    [listaClientes]
  );

  const lista = useMemo(() => {
    const filtrados = pendientes.filter((p) => {
      if (filtro === "abiertos") return p.estado !== "hecho";
      if (filtro === "hecho") return p.estado === "hecho";
      return true;
    });
    return [...filtrados].sort((a, b) => {
      if (a.estado === "hecho" && b.estado !== "hecho") return 1;
      if (a.estado !== "hecho" && b.estado === "hecho") return -1;
      return a.inicio.localeCompare(b.inicio);
    });
  }, [pendientes, filtro]);

  const abiertos = pendientes.filter((p) => p.estado !== "hecho").length;

  const encargosPorJalar = useMemo(
    () =>
      encargos.filter(
        (e) => e.estado !== "listo" && !pendienteDeEncargo(pendientes, e.id)
      ),
    [encargos, pendientes]
  );

  function resetForm() {
    setTitulo("");
    setClienteId("");
    setInicio(isoHoy());
    setFin(fechaMasDias(isoHoy(), 3));
    setDeadlineInterno("");
  }

  function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    crearPendiente({
      titulo: titulo.trim(),
      clienteId: clienteId === "" ? null : clienteId,
      inicio,
      fin,
      deadlineInterno: deadlineInterno || undefined,
    });
    resetForm();
    setFormAbierto(false);
    void notify({
      titulo: "Pendiente agregado",
      mensaje: "También aparece en el Cronograma si cae en el mes.",
    });
  }

  function handleJalarEncargo(encargoId: string) {
    const creado = crearPendienteDesdeEncargo(encargoId);
    if (!creado) return;
    void notify({
      titulo: "Jalado a Pendientes",
      mensaje: "El encargo del cliente sigue en Encargos; esto es tu to-do.",
    });
  }

  async function handleEliminar(p: Pendiente) {
    const ok = await confirm({
      titulo: "Eliminar pendiente",
      mensaje: `¿Eliminar "${p.titulo}"?`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    eliminarPendiente(p.id);
  }

  async function handleExcel() {
    setExportando(true);
    try {
      await exportarPendientesExcel(pendientes, listaClientes);
    } finally {
      setExportando(false);
    }
  }

  function toggleHecho(p: Pendiente, checked: boolean) {
    actualizarPendiente(p.id, {
      estado: checked ? "hecho" : "por_hacer",
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <AdminPageHeading
        titulo="Pendientes"
        subtitulo="To-dos con fechas. El cronograma del Inicio los agrupa por cliente."
        acciones={
          <>
            <MenuFiltroIcono
              grupos={[
                {
                  modo: "single",
                  valorPorDefecto: "abiertos",
                  opciones: [
                    { id: "abiertos", label: "Abiertos", count: abiertos },
                    { id: "todos", label: "Todos" },
                    { id: "hecho", label: "Hecho" },
                  ],
                  seleccion: [filtro],
                  onChange: (ids) => setFiltro((ids[0] as Filtro) ?? "abiertos"),
                },
              ]}
            />
            <BotonExportarMenu
              exportando={exportando}
              disabled={pendientes.length === 0}
              opciones={[{ id: "excel", label: "Excel", onClick: () => void handleExcel() }]}
            />
          </>
        }
      />

      <div className="bg-white border border-slate-200 rounded-[1.25rem] shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setFormAbierto((v) => !v)}
          className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left"
        >
          <span className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Plus size={16} className="text-violet-600" />
            Agregar pendiente
          </span>
        </button>
        {formAbierto && (
          <form
            onSubmit={handleCrear}
            className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4 border-t border-slate-100 pt-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Título
                </span>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  placeholder="Timbrar 3 facturas"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800"
                />
              </label>
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
                  <option value="">Despacho (sin cliente)</option>
                  {clientesActivos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.razonSocial}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Tu deadline
                </span>
                <input
                  type="date"
                  value={deadlineInterno}
                  onChange={(e) => setDeadlineInterno(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Inicio
                </span>
                <input
                  type="date"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Fin
                </span>
                <input
                  type="date"
                  value={fin}
                  onChange={(e) => setFin(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                />
              </label>
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-full bg-violet-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-violet-700"
            >
              Guardar
            </button>
          </form>
        )}
      </div>

      {encargosPorJalar.length > 0 && (
        <div className="bg-violet-50 border border-violet-100 rounded-2xl px-5 py-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">
            Encargos abiertos · {encargosPorJalar.length}
          </p>
          <ul className="space-y-2">
            {encargosPorJalar.slice(0, 8).map((enc) => (
              <li
                key={enc.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-800">
                    {enc.titulo}
                  </span>
                  <span className="block truncate text-[11px] font-bold text-slate-500">
                    {listaClientes.find((c) => c.id === enc.clienteId)
                      ?.razonSocial ?? `Cliente #${enc.clienteId}`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleJalarEncargo(enc.id)}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-white text-violet-700 text-[10px] font-black uppercase tracking-widest ring-1 ring-violet-200 hover:bg-violet-100"
                >
                  Jalar
                </button>
              </li>
            ))}
          </ul>
          {encargosPorJalar.length > 8 && (
            <Link
              href="/encargos"
              className="inline-block text-[11px] font-black uppercase tracking-widest text-violet-700"
            >
              Ver todos en Encargos
            </Link>
          )}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-[1.25rem] shadow-sm overflow-hidden">
        {lista.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm font-bold text-slate-400">
            No hay pendientes en este filtro.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-4 py-3 w-10" />
                  <th className="px-2 py-3">Pendiente</th>
                  <th className="px-2 py-3">Cliente</th>
                  <th className="px-2 py-3">Estado</th>
                  <th className="px-2 py-3 w-48">Timeline</th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-slate-50 last:border-0 ${
                      p.estado === "hecho" ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="checkbox"
                        checked={p.estado === "hecho"}
                        onChange={(e) => toggleHecho(p, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600"
                        aria-label="Marcar hecho"
                      />
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <input
                        value={p.titulo}
                        onChange={(e) =>
                          actualizarPendiente(p.id, { titulo: e.target.value })
                        }
                        className={`w-full bg-transparent text-sm font-bold text-slate-800 outline-none ${
                          p.estado === "hecho" ? "line-through" : ""
                        }`}
                      />
                      {p.encargoId && (
                        <Link
                          href={`/encargos?encargo=${p.encargoId}`}
                          className="inline-block mt-0.5 text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800"
                        >
                          Encargo
                        </Link>
                      )}
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <select
                        value={p.clienteId ?? ""}
                        onChange={(e) =>
                          actualizarPendiente(p.id, {
                            clienteId: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="max-w-[12rem] bg-transparent text-[12px] font-bold text-slate-600"
                      >
                        <option value="">Despacho</option>
                        {clientesActivos.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.razonSocial}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <select
                        value={p.estado}
                        onChange={(e) =>
                          actualizarPendiente(p.id, {
                            estado: e.target.value as EstadoPendiente,
                          })
                        }
                        className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
                          ESTADO_PENDIENTE_META[p.estado].badge
                        }`}
                      >
                        {ESTADOS_PENDIENTE.map((est) => (
                          <option key={est} value={est}>
                            {ESTADO_PENDIENTE_META[est].label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <TimelinePendiente
                        pendiente={p}
                        onCambiarFechas={(patch) =>
                          actualizarPendiente(p.id, patch)
                        }
                      />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <button
                        type="button"
                        onClick={() => void handleEliminar(p)}
                        className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

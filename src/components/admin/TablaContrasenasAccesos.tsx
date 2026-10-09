"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import {
  camposContrasenasVisibles,
  cargarVisibilidadColumnasContrasenas,
  categoriasContrasenasVisibles,
  enriquecerFilasContrasenas,
  filaContrasenasVacia,
  guardarVisibilidadColumnasContrasenas,
  type ColumnaContrasenasKey,
  type FilaContrasenas,
  type FilaContrasenasDisplay,
  valorCampo,
} from "@/lib/accesos/contrasenas";
import ModalEditarContrasenaAcceso from "@/components/admin/ModalEditarContrasenaAcceso";
import SelectorColumnasContrasenas from "@/components/admin/SelectorColumnasContrasenas";
import EncabezadoOrdenable from "@/components/admin/EncabezadoOrdenable";
import {
  alternarOrdenTabla,
  compararCeldasTabla,
  type OrdenTablaDir,
} from "@/lib/tabla-orden";

type SortKeyContrasenas =
  | "regimen"
  | "cliente"
  | keyof Omit<FilaContrasenas, "id" | "homologarConCrm">;

function valorOrdenContrasena(
  fila: FilaContrasenasDisplay,
  key: SortKeyContrasenas
): string | number {
  if (key === "regimen") return fila.regimenDisplay || fila.regimen;
  if (key === "cliente") return fila.clienteDisplay || fila.cliente;
  return valorCampo(fila, key);
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CeldaCopiable({
  valor,
  label,
}: {
  valor: string;
  label: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const tieneValor = valor.length > 0;

  const copiar = useCallback(async () => {
    if (!tieneValor) return;
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1400);
    } catch {
      /* ignorar */
    }
  }, [tieneValor, valor]);

  if (!tieneValor) {
    return (
      <div
        className="h-9 min-w-[5.5rem] rounded-lg bg-slate-900"
        title={`Sin ${label}`}
        aria-label={`Sin ${label}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => void copiar()}
      title={`Copiar ${label}`}
      className="group relative h-9 min-w-[5.5rem] max-w-[11rem] w-full px-2 rounded-lg bg-white ring-1 ring-slate-200 hover:ring-violet-300 hover:bg-violet-50/40 text-left transition-colors"
    >
      <span className="block text-[11px] font-bold text-slate-800 truncate pr-6">
        {valor}
      </span>
      <span
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
          copiado
            ? "text-emerald-600 bg-emerald-50"
            : "text-slate-400 group-hover:text-violet-600"
        }`}
      >
        {copiado ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <CopyIcon />
        )}
      </span>
    </button>
  );
}

function CeldaRfc({ fila }: { fila: FilaContrasenasDisplay }) {
  const rfc = valorCampo(fila, "rfc");
  if (!rfc) {
    return (
      <div
        className="h-9 min-w-[6.5rem] rounded-lg bg-slate-900"
        title="Sin RFC"
        aria-label="Sin RFC"
      />
    );
  }

  return (
    <div className="flex items-center gap-1.5 min-w-[6.5rem]">
      <CeldaCopiable valor={rfc} label="RFC" />
      {fila.vinculadoCrm ? (
        <span
          className="shrink-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100"
          title="RFC vinculado al catálogo de clientes"
        />
      ) : (
        <span
          className="shrink-0 w-2 h-2 rounded-full bg-slate-300"
          title="RFC sin coincidencia en el catálogo"
        />
      )}
    </div>
  );
}

export default function TablaContrasenasAccesos() {
  const { listaClientes } = useClientes();
  const [filas, setFilas] = useState<FilaContrasenas[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<FilaContrasenas | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKeyContrasenas>("cliente");
  const [sortDir, setSortDir] = useState<OrdenTablaDir>("asc");
  const [columnasVisibles, setColumnasVisibles] = useState<
    Record<ColumnaContrasenasKey, boolean>
  >(() => cargarVisibilidadColumnasContrasenas());

  useEffect(() => {
    guardarVisibilidadColumnasContrasenas(columnasVisibles);
  }, [columnasVisibles]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/accesos/contrasenas", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudieron cargar las contraseñas.");
      setFilas(data.filas ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const enriquecidas = useMemo(
    () => enriquecerFilasContrasenas(filas, listaClientes),
    [filas, listaClientes]
  );

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtradas = !q
      ? enriquecidas
      : enriquecidas.filter(
          (f) =>
            f.clienteDisplay.toLowerCase().includes(q) ||
            f.cliente.toLowerCase().includes(q) ||
            f.rfc.toLowerCase().includes(q) ||
            f.regimenDisplay.toLowerCase().includes(q) ||
            f.regimen.toLowerCase().includes(q)
        );
    return [...filtradas].sort((a, b) =>
      compararCeldasTabla(
        valorOrdenContrasena(a, sortKey),
        valorOrdenContrasena(b, sortKey),
        sortDir
      )
    );
  }, [enriquecidas, busqueda, sortKey, sortDir]);

  const toggleSort = useCallback((key: SortKeyContrasenas) => {
    setSortKey((prevKey) => {
      setSortDir((prevDir) => alternarOrdenTabla(prevKey, key, prevDir, "asc"));
      return key;
    });
  }, []);

  const camposTabla = useMemo(
    () => camposContrasenasVisibles(columnasVisibles),
    [columnasVisibles]
  );

  const categoriasTabla = useMemo(
    () => categoriasContrasenasVisibles(camposTabla),
    [camposTabla]
  );

  const camposPorCategoria = useMemo(() => {
    const map = new Map<string, typeof camposTabla>();
    for (const c of camposTabla) {
      const list = map.get(c.categoria) ?? [];
      list.push(c);
      map.set(c.categoria, list);
    }
    return map;
  }, [camposTabla]);

  const vinculados = useMemo(
    () => enriquecidas.filter((f) => f.vinculadoCrm).length,
    [enriquecidas]
  );

  const filaSeleccionada = useMemo(
    () => filas.find((f) => f.id === seleccionadaId) ?? null,
    [filas, seleccionadaId]
  );

  const abrirEdicion = useCallback(() => {
    if (filaSeleccionada) setEditando(filaSeleccionada);
  }, [filaSeleccionada]);

  const abrirNueva = useCallback(() => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `nueva-${Date.now()}`;
    setSeleccionadaId(null);
    setEditando(filaContrasenasVacia(id));
  }, []);

  const guardarFila = useCallback(
    async (actualizada: FilaContrasenas) => {
      setGuardando(true);
      setError(null);
      try {
        const existe = filas.some((f) => f.id === actualizada.id);
        const nuevas = existe
          ? filas.map((f) => (f.id === actualizada.id ? actualizada : f))
          : [actualizada, ...filas];
        const res = await fetch("/api/admin/accesos/contrasenas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filas: nuevas }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "No se pudo guardar.");
        setFilas(nuevas);
        setSeleccionadaId(actualizada.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar.");
        throw e;
      } finally {
        setGuardando(false);
      }
    },
    [filas]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="search"
          placeholder="Buscar cliente, RFC o régimen…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-2xl border border-slate-100 bg-white text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
        <button
          type="button"
          onClick={abrirNueva}
          disabled={guardando}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-violet-700 ring-1 ring-violet-200 text-[10px] font-black uppercase tracking-widest hover:bg-violet-50 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Agregar
        </button>
        <button
          type="button"
          onClick={abrirEdicion}
          disabled={!filaSeleccionada || guardando}
          title={
            filaSeleccionada
              ? `Editar ${filaSeleccionada.cliente || filaSeleccionada.rfc}`
              : "Selecciona una fila de la tabla"
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 20h9" strokeLinecap="round" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Editar
        </button>
        <SelectorColumnasContrasenas
          visibles={columnasVisibles}
          onChange={setColumnasVisibles}
        />
        <p className="text-[10px] font-bold text-slate-400 shrink-0 sm:ml-auto">
          {vinculados} de {enriquecidas.length} vinculados al catálogo por RFC
        </p>
      </div>

      {error && (
        <p className="text-sm font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="text-center py-12 text-slate-400 font-bold text-sm">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200 bg-white shadow-sm">
          <table className="min-w-max w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th
                  rowSpan={2}
                  className="sticky left-0 z-20 bg-slate-50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 border-r border-slate-200 min-w-[4.5rem]"
                >
                  <EncabezadoOrdenable
                    label="Régimen"
                    activo={sortKey === "regimen"}
                    dir={sortDir}
                    onClick={() => toggleSort("regimen")}
                  />
                </th>
                <th
                  rowSpan={2}
                  className="sticky left-[4.5rem] z-20 bg-slate-50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 border-r border-slate-200 min-w-[10rem]"
                >
                  <EncabezadoOrdenable
                    label="Cliente"
                    activo={sortKey === "cliente"}
                    dir={sortDir}
                    onClick={() => toggleSort("cliente")}
                  />
                </th>
                {categoriasTabla.map((cat) => (
                  <th
                    key={cat.id}
                    colSpan={cat.colspan}
                    className="px-2 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-violet-700 border-r border-slate-200 last:border-r-0"
                  >
                    {cat.label}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {categoriasTabla.flatMap((cat) =>
                  (camposPorCategoria.get(cat.id) ?? []).map((campo) => (
                    <th
                      key={campo.key}
                      className="px-2 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 border-r border-slate-100 last:border-r-0 whitespace-nowrap"
                    >
                      <EncabezadoOrdenable
                        label={campo.label}
                        activo={sortKey === campo.key}
                        dir={sortDir}
                        onClick={() => toggleSort(campo.key as SortKeyContrasenas)}
                      />
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {camposTabla.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(2, camposTabla.length + 2)}
                    className="px-6 py-12 text-center text-sm font-bold text-slate-400"
                  >
                    No hay columnas visibles. Abre <strong className="text-violet-600">Columnas</strong> arriba
                    para elegir qué mostrar.
                  </td>
                </tr>
              ) : (
                visibles.map((fila) => (
                <tr
                  key={fila.id}
                  onClick={() => setSeleccionadaId(fila.id)}
                  className={`border-b border-slate-100 cursor-pointer transition-colors ${
                    seleccionadaId === fila.id
                      ? "bg-violet-50/80 ring-1 ring-inset ring-violet-200"
                      : "hover:bg-slate-50/60"
                  }`}
                >
                  <td className={`sticky left-0 z-10 px-3 py-2 text-[10px] font-bold text-slate-500 border-r border-slate-100 align-middle ${
                    seleccionadaId === fila.id ? "bg-violet-50/80" : "bg-white"
                  }`}>
                    <span title={fila.vinculadoCrm ? "Régimen del catálogo CRM" : "Régimen del Excel"}>
                      {fila.regimenDisplay || "—"}
                    </span>
                  </td>
                  <td className={`sticky left-[4.5rem] z-10 px-3 py-2 border-r border-slate-100 align-middle min-w-[10rem] ${
                    seleccionadaId === fila.id ? "bg-violet-50/80" : "bg-white"
                  }`}>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-tight">
                      {fila.clienteDisplay}
                    </p>
                    {fila.vinculadoCrm && fila.cliente !== fila.clienteDisplay && (
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[12rem]" title={fila.cliente}>
                        Excel: {fila.cliente}
                      </p>
                    )}
                  </td>
                  {categoriasTabla.flatMap((cat) =>
                    (camposPorCategoria.get(cat.id) ?? []).map((campo) => (
                      <td
                        key={campo.key}
                        className="px-2 py-2 align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {campo.key === "rfc" ? (
                          <CeldaRfc fila={fila} />
                        ) : (
                          <CeldaCopiable
                            valor={valorCampo(fila, campo.key)}
                            label={campo.label}
                          />
                        )}
                      </td>
                    ))
                  )}
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[10px] text-slate-400 leading-relaxed max-w-3xl">
        Usa <span className="font-bold text-slate-500">Agregar</span> para una fila nueva.
        Punto verde en RFC = vinculado al catálogo (nombre y régimen homologados).
        Sin coincidencia se conserva el régimen capturado. Cuadro negro = sin dato. Clic para copiar.
        Selecciona una fila y usa Editar. Usa Columnas para mostrar u ocultar credenciales.
        Clic en encabezados para ordenar. Tu vista se guarda en este navegador.
      </p>

      {editando && (
        <ModalEditarContrasenaAcceso
          fila={editando}
          abierto
          onCerrar={() => setEditando(null)}
          onGuardar={guardarFila}
        />
      )}
    </div>
  );
}

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
import { TONO_IMSS, TONO_SAT } from "@/lib/cumplimiento-categorias";
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
      <span
        className="inline-block min-w-[4rem] text-[13px] text-slate-300"
        title={`Sin ${label}`}
        aria-label={`Sin ${label}`}
      >
        —
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void copiar()}
      title={`Copiar ${label}`}
      className="group inline-flex items-center gap-1.5 max-w-[11rem] text-left"
    >
      <span className="text-[13px] text-slate-800 truncate">{valor}</span>
      <span
        className={`shrink-0 ${
          copiado ? "text-emerald-600" : "text-slate-300 sm:opacity-0 sm:group-hover:opacity-100"
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

function PuntoClienteActivo({ activo }: { activo: boolean }) {
  return (
    <span
      className={`w-2 h-2 shrink-0 rounded-full ${
        activo ? "bg-slate-800" : "bg-slate-300"
      }`}
      title={activo ? "Cliente activo en el catálogo" : "No está activo en el catálogo"}
      aria-label={activo ? "Cliente activo" : "Cliente inactivo"}
    />
  );
}

function CeldaRfc({ fila }: { fila: FilaContrasenasDisplay }) {
  const rfc = valorCampo(fila, "rfc");
  if (!rfc) {
    return (
      <span className="text-[13px] text-slate-300" title="Sin RFC" aria-label="Sin RFC">
        —
      </span>
    );
  }
  return <CeldaCopiable valor={rfc} label="RFC" />;
}

function claseEncabezadoCategoria(id: string): string {
  if (id === "SAT") return `${TONO_SAT.header} border-r border-white/20 last:border-r-0`;
  if (id === "IMSS") return `${TONO_IMSS.header} border-r border-white/20 last:border-r-0`;
  return "text-slate-500 border-r border-slate-100 last:border-r-0";
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
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Buscar cliente, RFC o régimen…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="h-10 w-full max-w-md px-4 rounded-full bg-white ring-1 ring-black/[0.06] text-[13px] font-medium outline-none"
        />
        <button
          type="button"
          onClick={abrirNueva}
          disabled={guardando}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full bg-white ring-1 ring-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          Editar
        </button>
        <SelectorColumnasContrasenas
          visibles={columnasVisibles}
          onChange={setColumnasVisibles}
        />
        <p className="text-[13px] text-slate-400 shrink-0 sm:ml-auto">
          {vinculados} de {enriquecidas.length} con RFC del catálogo
        </p>
      </div>

      {error && (
        <p className="text-[13px] font-semibold text-rose-700 bg-rose-50 rounded-[1.25rem] px-4 py-3">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="text-center py-12 text-slate-400 text-[13px] font-semibold">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-[1.25rem] bg-white">
          <table className="min-w-max w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th
                  rowSpan={2}
                  className="sticky left-0 z-20 bg-white px-4 py-2 text-[11px] font-semibold text-slate-400 border-r border-slate-100 min-w-[4.5rem]"
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
                  className="sticky left-[4.5rem] z-20 bg-white px-4 py-2 text-[11px] font-semibold text-slate-400 border-r border-slate-100 min-w-[10rem]"
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
                    className={`px-2 py-2 text-center text-[11px] font-semibold ${claseEncabezadoCategoria(cat.id)}`}
                  >
                    {cat.label}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-slate-100">
                {categoriasTabla.flatMap((cat) =>
                  (camposPorCategoria.get(cat.id) ?? []).map((campo) => (
                    <th
                      key={campo.key}
                      className={`px-2 py-2 text-[11px] font-semibold whitespace-nowrap border-r last:border-r-0 ${
                        cat.id === "SAT"
                          ? "bg-[#1D4ED8]/10 text-[#1D4ED8] border-[#1D4ED8]/15"
                          : cat.id === "IMSS"
                            ? "bg-[#006847]/10 text-[#006847] border-[#006847]/15"
                            : "text-slate-400 border-slate-50"
                      }`}
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
            <tbody className="divide-y divide-slate-50">
              {camposTabla.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(2, camposTabla.length + 2)}
                    className="px-6 py-12 text-center text-[13px] text-slate-400"
                  >
                    No hay columnas visibles. Abre Columnas para elegir qué mostrar.
                  </td>
                </tr>
              ) : (
                visibles.map((fila) => (
                <tr
                  key={fila.id}
                  onClick={() => setSeleccionadaId(fila.id)}
                  className={`cursor-pointer transition-colors ${
                    seleccionadaId === fila.id
                      ? "bg-slate-50"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className={`sticky left-0 z-10 px-4 py-2.5 text-[13px] text-slate-500 border-r border-slate-50 align-middle ${
                    seleccionadaId === fila.id ? "bg-slate-50" : "bg-white"
                  }`}>
                    <span title={fila.vinculadoCrm ? "Régimen del catálogo CRM" : "Régimen del Excel"}>
                      {fila.regimenDisplay || "—"}
                    </span>
                  </td>
                  <td className={`sticky left-[4.5rem] z-10 px-4 py-2.5 border-r border-slate-50 align-middle min-w-[10rem] ${
                    seleccionadaId === fila.id ? "bg-slate-50" : "bg-white"
                  }`}>
                    <div className="flex items-center gap-2">
                      <PuntoClienteActivo activo={fila.clienteActivo} />
                      <p className="text-[13px] font-semibold text-slate-900 leading-tight min-w-0 truncate">
                        {fila.clienteDisplay}
                      </p>
                    </div>
                    {fila.vinculadoCrm && fila.cliente !== fila.clienteDisplay && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[12rem]" title={fila.cliente}>
                        Excel: {fila.cliente}
                      </p>
                    )}
                  </td>
                  {categoriasTabla.flatMap((cat) =>
                    (camposPorCategoria.get(cat.id) ?? []).map((campo) => (
                      <td
                        key={campo.key}
                        className="px-2 py-2.5 align-middle"
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

      <p className="text-[12px] text-slate-400 leading-relaxed max-w-3xl">
        Clic en un dato para copiarlo. El punto a la izquierda del nombre es
        cliente activo en el catálogo. Selecciona una fila y usa Editar.
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

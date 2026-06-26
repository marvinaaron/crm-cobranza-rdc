"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useClientes } from "@/context/ClientesContext";
import {
  type Cliente,
  type Periodo,
  calcularEstado,
  getTotalPendiente,
  periodoLabel,
  clienteActivoEnPeriodo,
  esIngresoGeneralCliente,
} from "@/lib/clientes";
import {
  getCorreoIndividualCliente,
  copiarCorreoLibreHtml,
  CORREO_TIPOS,
  type TipoCorreoCobranza,
} from "@/lib/correo";
import {
  getUltimaMarca,
  periodoKeyStr,
  formatFechaContacto,
  VIA_CONTACTO_LABEL,
} from "@/lib/recordatorios";
import EstadoBadge from "@/components/EstadoBadge";
import BotonCorreoCliente from "@/components/admin/BotonCorreoCliente";
import { useNotify, useConfirm } from "@/components/ConfirmProvider";
import ToastExito from "@/components/ToastExito";
import PanelEscalamientosFiscales from "@/components/admin/PanelEscalamientosFiscales";
import { listarEscalamientosFiscalesAdmin } from "@/lib/admin/escalamientos-fiscales";

function fmt(n: number): string {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

type Tab = "contactar" | "fiscales" | "scripts";
type FiltroTipo = "todos" | TipoCorreoCobranza;
type FiltroKpi = "todos" | "por_contactar" | "atrasados" | "contactados";

export default function RecordatoriosPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-400">Cargando…</p>}>
      <RecordatoriosPageInner />
    </Suspense>
  );
}

function RecordatoriosPageInner() {
  const searchParams = useSearchParams();
  const tabInicial = searchParams.get("tab");

  const {
    listaClientes,
    periodo,
    cumplimiento,
    recordatorioLog,
    marcarRecordatorio,
    quitarMarcaRecordatorioMes,
    scriptsCorreo,
    agregarScriptCorreo,
    editarScriptCorreo,
    eliminarScriptCorreo,
  } = useClientes();
  const notify = useNotify();
  const confirm = useConfirm();

  const [tab, setTab] = useState<Tab>(
    tabInicial === "fiscales" ? "fiscales" : tabInicial === "scripts" ? "scripts" : "contactar"
  );

  useEffect(() => {
    if (tabInicial === "fiscales") setTab("fiscales");
    if (tabInicial === "scripts") setTab("scripts");
    if (tabInicial === "contactar") setTab("contactar");
  }, [tabInicial]);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [filtroKpi, setFiltroKpi] = useState<FiltroKpi>("todos");
  const [ocultarContactados, setOcultarContactados] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const hoy = useMemo(() => new Date(), []);
  const pk = periodoKeyStr(periodo);

  const filas = useMemo(() => {
    const out = listaClientes
      .filter(
        (c) =>
          c.activo &&
          !esIngresoGeneralCliente(c) &&
          clienteActivoEnPeriodo(c, periodo)
      )
      .map((c) => {
        const correo = getCorreoIndividualCliente(c, periodo, hoy);
        const estado = calcularEstado(c, periodo);
        const ultima = getUltimaMarca(recordatorioLog, c.id, pk);
        return { cliente: c, correo, estado, ultima };
      })
      .filter((x) => x.correo.habilitado);

    const orden: Record<string, number> = {
      ATRASADO: 0,
      PENDIENTE: 1,
      "AL CORRIENTE": 2,
    };
    return out.sort((a, b) => {
      const e = (orden[a.estado] ?? 3) - (orden[b.estado] ?? 3);
      if (e !== 0) return e;
      return a.cliente.razonSocial.localeCompare(b.cliente.razonSocial);
    });
  }, [listaClientes, periodo, hoy, recordatorioLog, pk]);

  const filasVisibles = useMemo(() => {
    return filas.filter((f) => {
      if (!f.correo.habilitado) return false;
      if (filtroTipo !== "todos" && f.correo.tipo !== filtroTipo) return false;
      if (filtroKpi === "por_contactar" && f.ultima) return false;
      if (filtroKpi === "atrasados" && f.estado !== "ATRASADO") return false;
      if (filtroKpi === "contactados" && !f.ultima) return false;
      if (filtroKpi === "todos" && ocultarContactados && f.ultima) return false;
      return true;
    });
  }, [filas, filtroTipo, filtroKpi, ocultarContactados]);

  const stats = useMemo(() => {
    const total = filas.length;
    const atrasados = filas.filter((f) => f.estado === "ATRASADO").length;
    const contactados = filas.filter((f) => f.ultima).length;
    return { total, atrasados, contactados, porContactar: total - contactados };
  }, [filas]);

  const lineasFiscales = useMemo(
    () =>
      listarEscalamientosFiscalesAdmin({
        clientes: listaClientes,
        cumplimiento,
        limite: 60,
      }),
    [listaClientes, cumplimiento]
  );

  const pendientesFiscalesHoy = useMemo(
    () => lineasFiscales.filter((l) => l.estado === "pendiente_hoy").length,
    [lineasFiscales]
  );

  const dispararToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  const onContactado = (cliente: Cliente, tipo: TipoCorreoCobranza) => {
    return (via: "enviado" | "copiado" | "borrador") => {
      marcarRecordatorio(cliente.id, periodo, tipo, via);
    };
  };

  const marcarManual = (cliente: Cliente, tipo: TipoCorreoCobranza) => {
    marcarRecordatorio(cliente.id, periodo, tipo, "manual");
    dispararToast(`Marcado: ${cliente.razonSocial}`);
  };

  const desmarcar = (cliente: Cliente) => {
    quitarMarcaRecordatorioMes(cliente.id, pk);
    dispararToast(`Desmarcado: ${cliente.razonSocial}`);
  };

  const filtros: Array<{ key: FiltroTipo; label: string }> = [
    { key: "todos", label: "Todos" },
    { key: "recordatorio", label: CORREO_TIPOS.recordatorio.labelCorto },
    { key: "vencido", label: CORREO_TIPOS.vencido.labelCorto },
    { key: "cierre_mes", label: CORREO_TIPOS.cierre_mes.labelCorto },
  ];

  return (
    <div className="relative font-sans text-slate-800 dark:text-slate-100 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">
            Operación mensual
          </p>
          <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter leading-none text-slate-800 dark:text-white">
            Recordatorios de cobranza
          </h1>
          <p className="font-black mt-2 text-sm text-blue-600">
            {periodoLabel(periodo)}
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-200">Cobro manual:</strong>{" "}
            correos y seguimiento de honorarios que tú disparas desde aquí.{" "}
            <strong className="text-slate-700 dark:text-slate-200">Fiscales automáticos:</strong>{" "}
            escalamientos SAT e impuestos que el sistema envía solo al cliente (y al despacho en
            casos críticos).{" "}
            <Link
              href="/dashboard"
              className="text-violet-600 font-bold hover:underline dark:text-violet-400"
            >
              Ver bandeja en Dashboard →
            </Link>
          </p>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab("contactar")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === "contactar"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-100 dark:shadow-violet-900/40"
                : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-white/10 hover:text-slate-700"
            }`}
          >
            Cobro manual{stats.porContactar > 0 ? ` · ${stats.porContactar}` : ""}
          </button>
          <button
            type="button"
            onClick={() => setTab("fiscales")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === "fiscales"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-indigo-900/40"
                : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-white/10 hover:text-slate-700"
            }`}
          >
            Fiscales automáticos
            {pendientesFiscalesHoy > 0 ? ` · ${pendientesFiscalesHoy} hoy` : ""}
          </button>
          <button
            type="button"
            onClick={() => setTab("scripts")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === "scripts"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-100 dark:shadow-violet-900/40"
                : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-white/10 hover:text-slate-700"
            }`}
          >
            Mis scripts{scriptsCorreo.length > 0 ? ` · ${scriptsCorreo.length}` : ""}
          </button>
        </div>

        {tab === "contactar" ? (
          <ContactarTab
            filas={filasVisibles}
            stats={stats}
            filtros={filtros}
            filtroTipo={filtroTipo}
            setFiltroTipo={setFiltroTipo}
            filtroKpi={filtroKpi}
            setFiltroKpi={setFiltroKpi}
            ocultarContactados={ocultarContactados}
            setOcultarContactados={setOcultarContactados}
            periodo={periodo}
            notify={notify}
            onContactado={onContactado}
            marcarManual={marcarManual}
            desmarcar={desmarcar}
          />
        ) : tab === "fiscales" ? (
          <PanelEscalamientosFiscales lineas={lineasFiscales} />
        ) : (
          <ScriptsTab
            scripts={scriptsCorreo}
            agregar={agregarScriptCorreo}
            editar={editarScriptCorreo}
            eliminar={eliminarScriptCorreo}
            confirm={confirm}
            dispararToast={dispararToast}
          />
        )}
      </div>

      <ToastExito visible={!!toast} mensaje={toast ?? ""} />
    </div>
  );
}

// ---------------------------------------------------------------------------

type FilaContacto = {
  cliente: Cliente;
  correo: ReturnType<typeof getCorreoIndividualCliente>;
  estado: ReturnType<typeof calcularEstado>;
  ultima: ReturnType<typeof getUltimaMarca>;
};

function ContactarTab({
  filas,
  stats,
  filtros,
  filtroTipo,
  setFiltroTipo,
  filtroKpi,
  setFiltroKpi,
  ocultarContactados,
  setOcultarContactados,
  periodo,
  notify,
  onContactado,
  marcarManual,
  desmarcar,
}: {
  filas: FilaContacto[];
  stats: { total: number; atrasados: number; contactados: number; porContactar: number };
  filtros: Array<{ key: FiltroTipo; label: string }>;
  filtroTipo: FiltroTipo;
  setFiltroTipo: (f: FiltroTipo) => void;
  filtroKpi: FiltroKpi;
  setFiltroKpi: (f: FiltroKpi) => void;
  ocultarContactados: boolean;
  setOcultarContactados: (v: boolean) => void;
  periodo: Periodo;
  notify: (opts: { titulo: string; mensaje?: string; tono?: "info" | "warning" | "danger" }) => void;
  onContactado: (
    c: Cliente,
    tipo: TipoCorreoCobranza
  ) => (via: "enviado" | "copiado" | "borrador") => void;
  marcarManual: (c: Cliente, tipo: TipoCorreoCobranza) => void;
  desmarcar: (c: Cliente) => void;
}) {
  const kpis: Array<{
    key: FiltroKpi;
    label: string;
    value: number;
    color: string;
    activo: string;
  }> = [
    {
      key: "por_contactar",
      label: "Por contactar",
      value: stats.porContactar,
      color: "text-amber-600",
      activo: "border-amber-400 bg-amber-50 ring-2 ring-amber-200 dark:bg-amber-500/15 dark:ring-amber-500/30",
    },
    {
      key: "atrasados",
      label: "Atrasados",
      value: stats.atrasados,
      color: "text-red-600",
      activo: "border-red-400 bg-red-50 ring-2 ring-red-200 dark:bg-red-500/15 dark:ring-red-500/30",
    },
    {
      key: "contactados",
      label: "Ya contactados",
      value: stats.contactados,
      color: "text-emerald-600",
      activo: "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200 dark:bg-emerald-500/15 dark:ring-emerald-500/30",
    },
  ];

  const toggleKpi = (key: FiltroKpi) => {
    setFiltroKpi((prev) => (prev === key ? "todos" : key));
    if (key !== "todos") setOcultarContactados(false);
  };

  return (
    <>
      {/* KPIs — al tocar filtran la lista; otro toque en el mismo quita el filtro */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {kpis.map((k) => {
          const seleccionado = filtroKpi === k.key;
          return (
            <button
              key={k.key}
              type="button"
              onClick={() => toggleKpi(k.key)}
              aria-pressed={seleccionado}
              className={`p-4 rounded-2xl border text-left transition-all shadow-sm hover:shadow-md active:scale-[0.98] ${
                seleccionado
                  ? k.activo
                  : "border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 hover:border-slate-200"
              }`}
            >
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">
                {k.label}
              </p>
              <p className={`text-2xl lg:text-3xl font-black tabular-nums ${k.color}`}>
                {k.value}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {filtros.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFiltroTipo(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
              filtroTipo === f.key
                ? "border-violet-400 bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/40"
                : "border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600"
            }`}
          >
            {f.label}
          </button>
        ))}
        <label className="ml-auto inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={ocultarContactados}
            onChange={(e) => {
              setOcultarContactados(e.target.checked);
              if (e.target.checked) setFiltroKpi("todos");
            }}
            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 accent-violet-600"
          />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
            Ocultar ya contactados
          </span>
        </label>
      </div>

      {filas.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-emerald-600">
            ¡Todo al corriente!
          </p>
          <p className="text-[11px] font-bold text-slate-400 mt-1">
            No hay clientes por contactar con este filtro.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filas.map(({ cliente, correo, ultima }) => {
            if (!correo.habilitado) return null;
            const pend = getTotalPendiente(cliente, periodo);
            return (
              <div
                key={cliente.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-slate-800 dark:text-white truncate">
                      {cliente.razonSocial}
                    </p>
                    <EstadoBadge cliente={cliente} periodo={periodo} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-300 tabular-nums">
                      Debe {fmt(pend)}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-300">
                      · {correo.labelCorto}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold mt-1">
                    {ultima ? (
                      <span className="text-emerald-600">
                        Contactado {formatFechaContacto(ultima.contactadoEn)} ·{" "}
                        {VIA_CONTACTO_LABEL[ultima.via]}
                      </span>
                    ) : (
                      <span className="text-slate-400">Sin contactar este mes</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ultima ? (
                    <button
                      type="button"
                      onClick={() => desmarcar(cliente)}
                      className="px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:bg-slate-200"
                    >
                      Desmarcar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => marcarManual(cliente, correo.tipo)}
                      className="px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30"
                    >
                      Marcar
                    </button>
                  )}
                  <BotonCorreoCliente
                    cliente={cliente}
                    periodo={periodo}
                    tipo={correo.tipo}
                    habilitado
                    titulo={correo.titulo}
                    descripcion={correo.descripcion}
                    notify={notify}
                    onContactado={onContactado(cliente, correo.tipo)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------

function ScriptsTab({
  scripts,
  agregar,
  editar,
  eliminar,
  confirm,
  dispararToast,
}: {
  scripts: ReturnType<typeof useClientes>["scriptsCorreo"];
  agregar: ReturnType<typeof useClientes>["agregarScriptCorreo"];
  editar: ReturnType<typeof useClientes>["editarScriptCorreo"];
  eliminar: ReturnType<typeof useClientes>["eliminarScriptCorreo"];
  confirm: ReturnType<typeof useConfirm>;
  dispararToast: (m: string) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const guardar = () => {
    if (!titulo.trim() || !cuerpo.trim()) return;
    if (editId) {
      editar(editId, titulo, cuerpo);
      dispararToast("Script actualizado");
    } else {
      agregar(titulo, cuerpo);
      dispararToast("Script guardado");
    }
    setTitulo("");
    setCuerpo("");
    setEditId(null);
  };

  const empezarEdicion = (id: string, t: string, c: string) => {
    setEditId(id);
    setTitulo(t);
    setCuerpo(c);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copiar = async (texto: string) => {
    try {
      await copiarCorreoLibreHtml(texto);
      dispararToast("Copiado con formato");
    } catch {
      dispararToast("No se pudo copiar");
    }
  };

  const borrar = async (id: string, t: string) => {
    const ok = await confirm({
      titulo: "Eliminar script",
      mensaje: `Vas a eliminar "${t}". Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    eliminar(id);
    if (editId === id) {
      setEditId(null);
      setTitulo("");
      setCuerpo("");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm p-5 h-fit">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-3">
          {editId ? "Editar script" : "Nuevo script"}
        </p>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título (ej. Recordatorio amable)"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-white/5 outline-none text-sm font-bold focus:border-violet-400 focus:ring-2 focus:ring-violet-100 mb-3"
        />
        <textarea
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          placeholder="Escribe aquí el texto reutilizable que copiarás y pegarás en tus correos…"
          rows={8}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-white/5 outline-none text-sm font-medium leading-relaxed resize-y focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed">
          Al copiar, tu texto se envuelve en la plantilla de marca del despacho
          (encabezado y firma). Pégalo en Gmail o Apple Mail con Cmd/Ctrl + V y
          conserva el diseño.
        </p>
        <div className="flex gap-2 mt-3">
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setTitulo("");
                setCuerpo("");
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={guardar}
            disabled={!titulo.trim() || !cuerpo.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 disabled:opacity-50"
          >
            {editId ? "Guardar cambios" : "Guardar script"}
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {scripts.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <p className="text-[11px] font-bold text-slate-400">
              Aún no tienes scripts. Crea uno para reutilizarlo en tus correos.
            </p>
          </div>
        ) : (
          scripts.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-black text-slate-800 dark:text-white">{s.titulo}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => copiar(s.cuerpo)}
                    title="Copia con el diseño de marca; pégalo en Gmail o Apple Mail"
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700"
                  >
                    Copiar con formato
                  </button>
                  <button
                    type="button"
                    onClick={() => empezarEdicion(s.id, s.titulo, s.cuerpo)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[8px] font-black uppercase tracking-widest hover:bg-slate-200"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => borrar(s.id, s.titulo)}
                    aria-label="Eliminar script"
                    className="grid place-items-center h-7 w-7 rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-100"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed line-clamp-6">
                {s.cuerpo}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

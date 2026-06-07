"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useClientes } from "@/context/ClientesContext";
import Fiscalino from "@/components/Fiscalino";
import { useConfirm, useNotify } from "@/components/ConfirmProvider";
import { useScrollLock } from "@/hooks/useScrollLock";
import PresupuestoWizard from "@/components/admin/presupuestos/PresupuestoWizard";
import PresupuestoDocumento, {
  imprimirPresupuesto,
} from "@/components/admin/presupuestos/PresupuestoDocumento";
import {
  type Presupuesto,
  type EstadoPresupuesto,
  ESTADO_PRESUPUESTO_META,
  catalogoEfectivo,
  montoMensualPresupuesto,
  fmtMoneda,
  fmtFechaLarga,
} from "@/lib/presupuestos";

type Tab = "lista" | "catalogo";

const ESTADOS: EstadoPresupuesto[] = [
  "borrador",
  "enviado",
  "aceptado",
  "rechazado",
];

export default function PresupuestosPage() {
  const {
    presupuestos,
    eliminarPresupuesto,
    cambiarEstadoPresupuesto,
  } = useClientes();
  const router = useRouter();
  const confirm = useConfirm();
  const notify = useNotify();

  const [tab, setTab] = useState<Tab>("lista");
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [editando, setEditando] = useState<Presupuesto | null>(null);
  const [detalleId, setDetalleId] = useState<string | null>(null);

  const detalle = presupuestos.find((p) => p.id === detalleId) ?? null;

  const ordenados = useMemo(
    () =>
      [...presupuestos].sort((a, b) =>
        (b.creadoEn || "").localeCompare(a.creadoEn || "")
      ),
    [presupuestos]
  );

  const stats = useMemo(() => {
    const aceptados = presupuestos.filter((p) => p.estado === "aceptado");
    const mensualAceptado = aceptados.reduce(
      (s, p) => s + montoMensualPresupuesto(p),
      0
    );
    return {
      total: presupuestos.length,
      enviados: presupuestos.filter((p) => p.estado === "enviado").length,
      aceptados: aceptados.length,
      mensualAceptado,
    };
  }, [presupuestos]);

  const abrirNuevo = () => {
    setEditando(null);
    setWizardAbierto(true);
  };

  const abrirEditar = (p: Presupuesto) => {
    setEditando(p);
    setWizardAbierto(true);
    setDetalleId(null);
  };

  const eliminar = async (p: Presupuesto) => {
    const ok = await confirm({
      titulo: "Eliminar presupuesto",
      mensaje: `¿Eliminar el presupuesto ${p.folio} de ${p.cliente.razonSocial}? Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    eliminarPresupuesto(p.id);
    setDetalleId(null);
    notify({ titulo: "Presupuesto eliminado" });
  };

  const convertirEnCliente = (p: Presupuesto) => {
    router.push(`/clientes?prePresupuesto=${encodeURIComponent(p.id)}`);
  };

  return (
    <div className="relative font-sans text-slate-800 dark:text-slate-100 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.3em] mb-1">
              Ventas
            </p>
            <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter leading-none text-slate-800 dark:text-white">
              Presupuestos
            </h1>
          </div>
          <button
            onClick={abrirNuevo}
            className="bg-violet-600 hover:bg-violet-700 text-white h-12 px-6 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-violet-100 dark:shadow-violet-900/30 transition active:scale-95 flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Nuevo presupuesto
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["lista", "catalogo"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                tab === t
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-100 dark:shadow-violet-900/40"
                  : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-white/10"
              }`}
            >
              {t === "lista" ? "Mis presupuestos" : "Catálogo de servicios"}
            </button>
          ))}
        </div>

        {tab === "lista" && (
          <>
            {presupuestos.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard label="Total" valor={String(stats.total)} />
                <StatCard label="Enviados" valor={String(stats.enviados)} tono="blue" />
                <StatCard label="Aceptados" valor={String(stats.aceptados)} tono="emerald" />
                <StatCard
                  label="Mensual aceptado"
                  valor={fmtMoneda(stats.mensualAceptado)}
                  tono="violet"
                />
              </div>
            )}

            {ordenados.length === 0 ? (
              <EmptyState onNuevo={abrirNuevo} />
            ) : (
              <div className="space-y-2">
                {ordenados.map((p) => (
                  <PresupuestoRow
                    key={p.id}
                    presupuesto={p}
                    onAbrir={() => setDetalleId(p.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "catalogo" && <CatalogoServicios />}
      </div>

      {wizardAbierto && (
        <PresupuestoWizard
          abierto={wizardAbierto}
          presupuestoExistente={editando}
          onClose={() => setWizardAbierto(false)}
          onSaved={() => {
            setWizardAbierto(false);
            notify({ titulo: "Presupuesto guardado" });
          }}
        />
      )}

      {detalle && (
        <DetallePresupuesto
          presupuesto={detalle}
          onClose={() => setDetalleId(null)}
          onEditar={() => abrirEditar(detalle)}
          onEliminar={() => eliminar(detalle)}
          onEstado={(e) => cambiarEstadoPresupuesto(detalle.id, e)}
          onConvertir={() => convertirEnCliente(detalle)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  valor,
  tono = "slate",
}: {
  label: string;
  valor: string;
  tono?: "slate" | "blue" | "emerald" | "violet";
}) {
  const colores: Record<string, string> = {
    slate: "text-slate-800 dark:text-white",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    violet: "text-violet-600",
  };
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className={`text-xl font-black mt-1 ${colores[tono]}`}>{valor}</p>
    </div>
  );
}

function EstadoChip({ estado }: { estado: EstadoPresupuesto }) {
  const m = ESTADO_PRESUPUESTO_META[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${m.chip}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function PresupuestoRow({
  presupuesto: p,
  onAbrir,
}: {
  presupuesto: Presupuesto;
  onAbrir: () => void;
}) {
  return (
    <button
      onClick={onAbrir}
      className="w-full text-left bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-4 hover:border-violet-200 dark:hover:border-violet-500/30 hover:shadow-sm transition group"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-bold text-slate-400 tabular-nums">
            {p.folio}
          </span>
          <EstadoChip estado={p.estado} />
        </div>
        <p className="font-black text-slate-800 dark:text-white truncate">
          {p.cliente.razonSocial}
        </p>
        <p className="text-[11px] text-slate-400">{fmtFechaLarga(p.fecha)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-black text-violet-700 dark:text-violet-300 tabular-nums">
          {fmtMoneda(montoMensualPresupuesto(p))}
        </p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
          / mes
        </p>
      </div>
      <svg
        className="text-slate-300 group-hover:text-violet-400 transition shrink-0"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

function EmptyState({ onNuevo }: { onNuevo: () => void }) {
  return (
    <div className="text-center py-16 px-6 bg-white dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
      <Fiscalino mood="confident" size={140} className="mx-auto" />
      <h3 className="text-xl font-black text-slate-800 dark:text-white mt-4">
        Aún no tienes presupuestos
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
        Crea tu primer presupuesto profesional en menos de un minuto. Fiscalino
        te ayuda a cerrar el trato.
      </p>
      <button
        onClick={onNuevo}
        className="mt-6 bg-violet-600 hover:bg-violet-700 text-white h-12 px-7 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-violet-100 dark:shadow-violet-900/30 transition active:scale-95 inline-flex items-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Crear primer presupuesto
      </button>
    </div>
  );
}

function DetallePresupuesto({
  presupuesto: p,
  onClose,
  onEditar,
  onEliminar,
  onEstado,
  onConvertir,
}: {
  presupuesto: Presupuesto;
  onClose: () => void;
  onEditar: () => void;
  onEliminar: () => void;
  onEstado: (e: EstadoPresupuesto) => void;
  onConvertir: () => void;
}) {
  useScrollLock(true);
  return (
    <div className="fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center sm:p-6 no-print">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-3xl bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] overflow-hidden border border-slate-100 dark:border-white/10">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <EstadoChip estado={p.estado} />
            <span className="text-sm font-bold text-slate-500 truncate">
              {p.folio}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-500 transition"
            aria-label="Cerrar"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Estado switcher */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">
            Estado:
          </span>
          {ESTADOS.map((e) => {
            const activo = p.estado === e;
            const m = ESTADO_PRESUPUESTO_META[e];
            return (
              <button
                key={e}
                onClick={() => onEstado(e)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                  activo
                    ? m.chip + " ring-2 ring-offset-1 ring-violet-300 dark:ring-offset-slate-900"
                    : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-black/30 px-4 py-6 sm:px-6">
          <PresupuestoDocumento presupuesto={p} />
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900">
          <button
            onClick={onEliminar}
            className="text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition inline-flex items-center gap-1.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            Eliminar
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={imprimirPresupuesto}
              className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-200 text-[11px] font-bold uppercase tracking-widest hover:border-violet-300 transition"
            >
              Descargar PDF
            </button>
            <button
              onClick={onEditar}
              className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-200 text-[11px] font-bold uppercase tracking-widest hover:border-violet-300 transition"
            >
              Editar
            </button>
            {p.estado === "aceptado" && (
              <button
                onClick={onConvertir}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest transition active:scale-95"
              >
                Convertir en cliente →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogoServicios() {
  const {
    catalogoServicios,
    agregarServicioCatalogo,
    editarServicioCatalogo,
    eliminarServicioCatalogo,
  } = useClientes();
  const confirm = useConfirm();

  const catalogo = catalogoEfectivo(catalogoServicios);

  const inputCls =
    "w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-violet-400 transition";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Servicios reutilizables que puedes agregar a cualquier presupuesto.
        </p>
        <button
          onClick={() =>
            agregarServicioCatalogo({
              servicio: "Nuevo servicio",
              descripcion: "",
              precioSugerido: 0,
              activo: true,
            })
          }
          className="px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-widest transition active:scale-95"
        >
          + Servicio
        </button>
      </div>

      <div className="space-y-2">
        {catalogo.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-3.5"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  className={inputCls}
                  value={s.servicio}
                  onChange={(e) =>
                    editarServicioCatalogo(s.id, { servicio: e.target.value })
                  }
                />
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  value={s.descripcion}
                  onChange={(e) =>
                    editarServicioCatalogo(s.id, { descripcion: e.target.value })
                  }
                  placeholder="Descripción"
                />
              </div>
              <div className="w-28 shrink-0 space-y-2">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={s.precioSugerido}
                  onChange={(e) =>
                    editarServicioCatalogo(s.id, {
                      precioSugerido: Number(e.target.value) || 0,
                    })
                  }
                />
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={s.activo}
                    onChange={(e) =>
                      editarServicioCatalogo(s.id, { activo: e.target.checked })
                    }
                  />
                  Activo
                </label>
                <button
                  onClick={async () => {
                    const ok = await confirm({
                      titulo: "Eliminar servicio",
                      mensaje: `¿Eliminar "${s.servicio}" del catálogo?`,
                      textoConfirmar: "Eliminar",
                      tono: "danger",
                    });
                    if (ok) eliminarServicioCatalogo(s.id);
                  }}
                  className="w-full text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

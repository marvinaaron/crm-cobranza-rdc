"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  descargarRespaldoJson,
  estadoDesdeRespaldo,
  estadoVacio,
  reiniciarTodo,
  respaldoDesdeEstado,
  resumenDesdeEstado,
  type RdcStorageKey,
} from "@/lib/data-reset";
import { useClientes } from "@/context/ClientesContext";
import { useConfirm, useNotify } from "@/components/ConfirmProvider";
import EquipoPanel from "@/components/admin/EquipoPanel";

type BackupInfo = {
  nombre: string;
  tipo: "manual" | "cierre" | "auto";
  generadoEn: string;
  bytes: number;
  url?: string;
};

const TIPO_BACKUP_LABEL: Record<BackupInfo["tipo"], string> = {
  manual: "Manual",
  cierre: "Cierre de mes",
  auto: "Automático",
};

function formatFechaLarga(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ETIQUETAS: Record<RdcStorageKey, string> = {
  "rdc-clientes-v1": "Clientes y pagos realizados",
  "rdc-cumplimiento-v2": "Cumplimiento fiscal (preliminares, declaraciones, etc.)",
  "rdc-cumplimiento-v1": "Cumplimiento (versión anterior)",
  "rdc-comprobantes-v1": "Comprobantes de pago de honorarios",
  "rdc-facturas-v1": "Facturas PDF",
  "rdc-historial-impuestos-v1": "Historial anual de impuestos",
  "rdc-notificaciones-v1": "Notificaciones",
  "rdc-repse-v1": "Declaraciones REPSE (ICSOE y SISUB)",
  "rdc-encargos-v1": "Encargos personalizados",
  "rdc-portal-credenciales-v2": "Credenciales del portal del cliente",
  "rdc-portal-credenciales-v1": "Credenciales (versión anterior)",
  "rdc-stripe-sesiones-procesadas-v1": "Sesiones de Stripe procesadas",
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

type Tab = "datos" | "equipo";

export default function ConfiguracionPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const notify = useNotify();
  const {
    listaClientes,
    comprobantes,
    facturas,
    cumplimiento,
    historialImpuestos,
    notificaciones,
    registrosRepse,
    encargos,
    recargarDesdeNube,
  } = useClientes();
  const [tab, setTab] = useState<Tab>("equipo");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(
    null
  );
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [cargandoBackups, setCargandoBackups] = useState(false);
  const [creandoBackup, setCreandoBackup] = useState(false);
  const [accionBackup, setAccionBackup] = useState<string | null>(null);
  const [optimizando, setOptimizando] = useState(false);

  const estadoActual = {
    clientes: listaClientes,
    comprobantes,
    facturas,
    cumplimiento,
    historialImpuestos,
    notificaciones,
    repse: registrosRepse,
    encargos,
  };
  const resumen = resumenDesdeEstado(estadoActual);

  const totalBytes = resumen.reduce((acc, r) => acc + r.bytes, 0);
  const totalRegistros = resumen.reduce((acc, r) => acc + r.registros, 0);

  const guardarEnNube = async (payload: typeof estadoActual) => {
    const res = await fetch("/api/admin/crm-estado", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "No se pudo guardar en la nube.");
    }
  };

  const handleExportar = () => {
    descargarRespaldoJson(respaldoDesdeEstado(estadoActual));
    setMensaje({ tipo: "ok", texto: "Respaldo descargado correctamente." });
  };

  const handleImportar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const texto = await file.text();
      const json = JSON.parse(texto);
      const payload = estadoDesdeRespaldo(json);
      await guardarEnNube(payload);
      await recargarDesdeNube();
      setMensaje({
        tipo: "ok",
        texto: "Respaldo restaurado en la nube. Los datos ya están sincronizados.",
      });
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto:
          err instanceof Error
            ? err.message
            : "No se pudo leer el archivo. Verifique el formato.",
      });
    }
  };

  const handleReiniciar = async () => {
    if (confirmacion !== "BORRAR TODO") {
      setMensaje({
        tipo: "error",
        texto: 'Escriba exactamente "BORRAR TODO" para confirmar.',
      });
      return;
    }
    try {
      reiniciarTodo();
      await guardarEnNube(estadoVacio());
      setConfirmacion("");
      setMensaje({
        tipo: "ok",
        texto: "CRM reiniciado en la nube. Redirigiendo al dashboard…",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto:
          err instanceof Error ? err.message : "No se pudo reiniciar el CRM.",
      });
    }
  };

  const cargarBackups = useCallback(async () => {
    setCargandoBackups(true);
    try {
      const res = await fetch("/api/admin/backups", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setBackups(data.backups ?? []);
    } catch {
      /* silencioso */
    } finally {
      setCargandoBackups(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "datos") void cargarBackups();
  }, [tab, cargarBackups]);

  const handleCrearBackup = async () => {
    setCreandoBackup(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "cierre" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear el respaldo.");
      setMensaje({
        tipo: "ok",
        texto: "Respaldo guardado en la nube. Quedó disponible para restaurar.",
      });
      await cargarBackups();
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err instanceof Error ? err.message : "No se pudo crear el respaldo.",
      });
    } finally {
      setCreandoBackup(false);
    }
  };

  const handleRestaurarBackup = async (b: BackupInfo) => {
    const ok = await confirm({
      titulo: "Restaurar este respaldo",
      mensaje:
        `Se reemplazarán TODOS los datos actuales del CRM por los del respaldo del ${formatFechaLarga(b.generadoEn)}. ` +
        "Antes de restaurar guardamos automáticamente el estado actual, por si necesitas regresar.",
      textoConfirmar: "Restaurar",
      tono: "danger",
    });
    if (!ok) return;
    setAccionBackup(b.nombre);
    setMensaje(null);
    try {
      const res = await fetch("/api/admin/backups/restaurar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: b.nombre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo restaurar.");
      await recargarDesdeNube();
      await cargarBackups();
      setMensaje({ tipo: "ok", texto: "Respaldo restaurado. Datos actualizados." });
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err instanceof Error ? err.message : "No se pudo restaurar.",
      });
    } finally {
      setAccionBackup(null);
    }
  };

  const handleBorrarBackup = async (b: BackupInfo) => {
    const ok = await confirm({
      titulo: "Eliminar respaldo",
      mensaje: `¿Eliminar el respaldo del ${formatFechaLarga(b.generadoEn)}? No se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    setAccionBackup(b.nombre);
    try {
      const res = await fetch(
        `/api/admin/backups?nombre=${encodeURIComponent(b.nombre)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "No se pudo eliminar.");
      }
      await cargarBackups();
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err instanceof Error ? err.message : "No se pudo eliminar.",
      });
    } finally {
      setAccionBackup(null);
    }
  };

  const handleOptimizar = async () => {
    const ok = await confirm({
      titulo: "Liberar espacio de meses antiguos",
      mensaje:
        "Se quitarán los PDFs y archivos embebidos de cumplimiento de más de 12 meses (se conserva todo el texto: montos, fechas y estatus). " +
        "Antes de hacerlo guardamos un respaldo completo, así que nada se pierde de forma definitiva.",
      textoConfirmar: "Liberar espacio",
      tono: "warning",
    });
    if (!ok) return;
    setOptimizando(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/admin/mantenimiento/aligerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesesConservar: 12 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo optimizar.");
      await recargarDesdeNube();
      await cargarBackups();
      const liberadoMb = (data.liberados / 1024 / 1024).toFixed(2);
      await notify({
        titulo: "Espacio liberado",
        mensaje: `Se aligeraron ${data.aligerados} registro(s) y se liberaron ${liberadoMb} MB. Se guardó un respaldo antes de optimizar.`,
      });
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err instanceof Error ? err.message : "No se pudo optimizar.",
      });
    } finally {
      setOptimizando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <header>
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">
          Configuración del CRM
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-800">
          {tab === "equipo" ? "Equipo y permisos" : "Datos y respaldo"}
        </h1>
        <p className="text-slate-400 font-bold mt-2 text-sm max-w-2xl leading-relaxed">
          {tab === "equipo"
            ? "Gestiona los administradores del despacho y qué módulos puede usar cada uno."
            : "Los datos del CRM se guardan en la nube (Supabase) y se sincronizan entre sus dispositivos. Use respaldos .json como copia de seguridad adicional."}
        </p>
      </header>

      <div className="flex gap-1 border-b border-slate-200">
        {(
          [
            { id: "equipo", label: "Equipo" },
            { id: "datos", label: "Datos y respaldo" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-[11px] font-black uppercase tracking-widest border-b-2 transition-colors ${
              tab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "equipo" ? <EquipoPanel /> : null}

      {tab === "datos" ? (
      <>

      {mensaje && (
        <div
          className={`rounded-2xl border px-5 py-3 ${
            mensaje.tipo === "ok"
              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
              : "bg-red-50 border-red-100 text-red-700"
          }`}
        >
          <p className="text-sm font-bold">{mensaje.texto}</p>
        </div>
      )}

      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7">
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Estado actual
            </p>
            <h2 className="text-lg font-black text-slate-800">Almacenamiento</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total
            </p>
            <p className="text-xl font-black text-slate-800 tabular-nums">
              {formatBytes(totalBytes)}
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              {totalRegistros} registros
            </p>
          </div>
        </div>
        <ul className="divide-y divide-slate-50">
          {resumen.map(({ key, registros, bytes }) => (
            <li
              key={key}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">
                  {ETIQUETAS[key] ?? key}
                </p>
                <p className="text-[10px] font-mono text-slate-300 mt-0.5">{key}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-slate-700 tabular-nums">
                  {registros}
                </p>
                <p className="text-[10px] font-bold text-slate-400">
                  {formatBytes(bytes)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Respaldos en la nube (Supabase Storage) */}
      <section className="bg-white rounded-[2rem] border border-indigo-100 shadow-sm p-7">
        <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">
              Cierre de mes · copia de seguridad
            </p>
            <h2 className="text-lg font-black text-slate-800">
              Respaldos en la nube
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCrearBackup}
            disabled={creandoBackup}
            className="px-5 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
          >
            {creandoBackup ? "Guardando…" : "Guardar respaldo ahora"}
          </button>
        </div>
        <p className="text-xs font-bold text-slate-500 leading-relaxed mb-5 max-w-2xl">
          Cada vez que cierres el mes, pulsa{" "}
          <span className="text-indigo-600">Guardar respaldo</span>: se guarda una
          copia completa del CRM en tu Supabase. Si algo sale mal, restauras y
          todo vuelve a como estaba. Conservamos los últimos 60 respaldos.
        </p>

        {cargandoBackups ? (
          <p className="text-xs font-bold text-slate-400 py-4">Cargando respaldos…</p>
        ) : backups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-xs font-bold text-slate-400">
              Aún no hay respaldos en la nube. Crea el primero con el botón de arriba.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {backups.map((b) => (
              <li
                key={b.nombre}
                className="flex items-center justify-between gap-3 py-3 flex-wrap"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-slate-700">
                      {formatFechaLarga(b.generadoEn)}
                    </p>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        b.tipo === "cierre"
                          ? "bg-indigo-50 text-indigo-600"
                          : b.tipo === "auto"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {TIPO_BACKUP_LABEL[b.tipo]}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {b.bytes > 0 ? formatBytes(b.bytes) : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleRestaurarBackup(b)}
                    disabled={accionBackup === b.nombre}
                    className="px-3 py-2 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 disabled:opacity-50"
                  >
                    {accionBackup === b.nombre ? "…" : "Restaurar"}
                  </button>
                  {b.url && (
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                    >
                      Descargar
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleBorrarBackup(b)}
                    disabled={accionBackup === b.nombre}
                    aria-label="Eliminar respaldo"
                    title="Eliminar"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Optimizar espacio */}
      <section className="bg-white rounded-[2rem] border border-amber-100 shadow-sm p-7">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">
          Optimizar espacio
        </p>
        <h3 className="text-lg font-black text-slate-800 mb-2">
          Liberar archivos de meses antiguos
        </h3>
        <p className="text-xs font-bold text-slate-500 leading-relaxed mb-5 max-w-2xl">
          Quita los PDFs pesados de cumplimiento con más de 12 meses, conservando
          montos, fechas y estatus. Se guarda un respaldo completo antes de
          hacerlo, así que siempre puedes restaurarlos.
        </p>
        <button
          type="button"
          onClick={handleOptimizar}
          disabled={optimizando}
          className="px-5 py-3 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 disabled:opacity-50"
        >
          {optimizando ? "Optimizando…" : "Liberar PDFs de más de 12 meses"}
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white rounded-[2rem] border border-emerald-100 shadow-sm p-7 flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">
            Paso 1 · Respaldar (copia local)
          </p>
          <h3 className="text-lg font-black text-slate-800 mb-2">
            Descargar respaldo .json
          </h3>
          <p className="text-xs font-bold text-slate-500 leading-relaxed mb-5 flex-1">
            Genera un archivo con todos los datos actuales. Guárdelo en su nube
            (Drive, iCloud) antes de reiniciar o cambiar de equipo.
          </p>
          <button
            type="button"
            onClick={handleExportar}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700"
          >
            Descargar respaldo
          </button>
        </section>

        <section className="bg-white rounded-[2rem] border border-blue-100 shadow-sm p-7 flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">
            Paso 2 · Restaurar
          </p>
          <h3 className="text-lg font-black text-slate-800 mb-2">
            Importar respaldo .json
          </h3>
          <p className="text-xs font-bold text-slate-500 leading-relaxed mb-5 flex-1">
            Reemplaza los datos actuales por el respaldo seleccionado. Use solo
            archivos generados por este CRM. La página se recargará automáticamente.
          </p>
          <label className="w-full py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 text-center cursor-pointer">
            Elegir archivo y restaurar
            <input
              type="file"
              accept="application/json,.json"
              onChange={handleImportar}
              className="hidden"
            />
          </label>
        </section>
      </div>

      <section className="bg-white rounded-[2rem] border border-red-100 shadow-sm p-7">
        <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">
          Zona delicada · acción irreversible
        </p>
        <h3 className="text-lg font-black text-slate-800 mb-2">
          Reiniciar todo el CRM
        </h3>
        <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4 max-w-2xl">
          Borra clientes, pagos, comprobantes, facturas, cumplimiento, historial,
          notificaciones y credenciales de portal. No se puede deshacer. Le
          recomendamos descargar primero un respaldo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            placeholder="Escriba BORRAR TODO para habilitar"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value.toUpperCase())}
            className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 font-mono text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-200"
          />
          <button
            type="button"
            onClick={handleReiniciar}
            disabled={confirmacion !== "BORRAR TODO"}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reiniciar CRM
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
      >
        ← Volver al dashboard
      </button>
      </>
      ) : null}
    </div>
  );
}

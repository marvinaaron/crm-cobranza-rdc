"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  descargarRespaldo,
  reiniciarTodo,
  restaurarRespaldo,
  resumenAlmacenamiento,
  type RdcStorageKey,
} from "@/lib/data-reset";
import EquipoPanel from "@/components/admin/EquipoPanel";

const ETIQUETAS: Record<RdcStorageKey, string> = {
  "rdc-clientes-v1": "Clientes y pagos realizados",
  "rdc-cumplimiento-v2": "Cumplimiento fiscal (preliminares, declaraciones, etc.)",
  "rdc-cumplimiento-v1": "Cumplimiento (versión anterior)",
  "rdc-comprobantes-v1": "Comprobantes de pago de honorarios",
  "rdc-facturas-v1": "Facturas PDF",
  "rdc-historial-impuestos-v1": "Historial anual de impuestos",
  "rdc-notificaciones-v1": "Notificaciones",
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
  const [tab, setTab] = useState<Tab>("equipo");
  const [resumen, setResumen] = useState<ReturnType<typeof resumenAlmacenamiento>>([]);
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(
    null
  );

  const refrescar = () => setResumen(resumenAlmacenamiento());

  useEffect(() => {
    refrescar();
  }, []);

  const totalBytes = resumen.reduce((acc, r) => acc + r.bytes, 0);
  const totalRegistros = resumen.reduce((acc, r) => acc + r.registros, 0);

  const handleExportar = () => {
    descargarRespaldo();
    setMensaje({ tipo: "ok", texto: "Respaldo descargado correctamente." });
  };

  const handleImportar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const texto = await file.text();
      const json = JSON.parse(texto);
      restaurarRespaldo(json);
      refrescar();
      setMensaje({
        tipo: "ok",
        texto: "Respaldo restaurado. La página se recargará para aplicar los cambios.",
      });
      setTimeout(() => window.location.reload(), 1500);
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

  const handleReiniciar = () => {
    if (confirmacion !== "BORRAR TODO") {
      setMensaje({
        tipo: "error",
        texto: 'Escriba exactamente "BORRAR TODO" para confirmar.',
      });
      return;
    }
    reiniciarTodo();
    setConfirmacion("");
    setMensaje({
      tipo: "ok",
      texto: "CRM reiniciado. Redirigiendo al dashboard…",
    });
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1200);
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
            : "Los datos del CRM viven en este navegador. Use respaldos para conservar la información antes de cambiar de equipo o reiniciar el sistema."}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white rounded-[2rem] border border-emerald-100 shadow-sm p-7 flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">
            Paso 1 · Respaldar
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

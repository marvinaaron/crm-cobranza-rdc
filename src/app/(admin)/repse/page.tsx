"use client";

import { useCallback, useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import type { Cliente } from "@/lib/clientes";
import {
  CUATRIMESTRE_META,
  REPSE_META,
  TIPOS_REPSE,
  type Cuatrimestre,
  type PeriodoRepse,
  type TipoDocumentoRepse,
  getCuatrimestreActual,
  periodoRepseLabelLargo,
  progresoRepse,
} from "@/lib/repse";
import { readFileAsDataUrl, validarArchivoPdf } from "@/lib/archivos";

const ICONS = {
  upload: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  ),
  trash: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6"></path>
      <path d="M14 11v6"></path>
    </svg>
  ),
  download: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  ),
};

function bgPorTipo(tipo: TipoDocumentoRepse, completo: boolean): string {
  if (!completo) return "bg-slate-50 border-slate-100";
  if (tipo === "icsoe") return "bg-emerald-50/70 border-emerald-100";
  return "bg-indigo-50/70 border-indigo-100";
}

function badgeColor(tipo: TipoDocumentoRepse): string {
  if (tipo === "icsoe")
    return "bg-emerald-100 text-emerald-700";
  return "bg-indigo-100 text-indigo-700";
}

function aniosOpciones(): number[] {
  const actual = new Date().getFullYear();
  return [actual - 1, actual, actual + 1];
}

export default function RepsePage() {
  const {
    listaClientes,
    registrosRepse,
    subirDocumentoRepse,
    eliminarDocumentoRepse,
  } = useClientes();

  const cuatriActual = useMemo(() => getCuatrimestreActual(), []);
  const [periodo, setPeriodo] = useState<PeriodoRepse>(cuatriActual);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: "ok" | "error";
    texto: string;
  } | null>(null);

  const clientesRepse = useMemo(
    () =>
      listaClientes
        .filter((c) => c.configRepse?.habilitado && c.activo)
        .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial)),
    [listaClientes]
  );

  const subir = useCallback(
    async (
      cliente: Cliente,
      tipo: TipoDocumentoRepse,
      file: File | undefined
    ) => {
      if (!file) return;
      const err = validarArchivoPdf(file);
      if (err) {
        setMensaje({ tipo: "error", texto: err });
        return;
      }
      const slotId = `${cliente.id}-${tipo}`;
      setSubiendo(slotId);
      try {
        const dataUrl = await readFileAsDataUrl(file);
        subirDocumentoRepse(cliente.id, periodo, tipo, {
          nombreArchivo: file.name,
          tipoMime: file.type || "application/pdf",
          dataUrl,
        });
        setMensaje({
          tipo: "ok",
          texto: `${REPSE_META[tipo].label} cargado para ${cliente.razonSocial}.`,
        });
        setTimeout(() => setMensaje(null), 3500);
      } catch (e) {
        setMensaje({
          tipo: "error",
          texto:
            e instanceof Error
              ? e.message
              : "No se pudo cargar el documento.",
        });
      } finally {
        setSubiendo(null);
      }
    },
    [periodo, subirDocumentoRepse]
  );

  const descargar = (nombre: string, dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-12 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-10">
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
              Declaraciones cuatrimestrales
            </p>
            <h1 className="text-2xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-slate-800">
              REPSE
            </h1>
            <p className="text-xs lg:text-sm font-bold text-slate-400 mt-3 max-w-xl">
              ICSOE (IMSS) y SISUB (INFONAVIT). Sin pagos: solo subir, validar
              y compartir con el cliente. Vence el 17 del mes siguiente al
              cierre del cuatrimestre.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 px-5 py-4 shadow-sm flex flex-col gap-3 min-w-[280px]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Cuatrimestre activo
            </p>
            <div className="flex items-center gap-2">
              <select
                value={periodo.cuatrimestre}
                onChange={(e) =>
                  setPeriodo({
                    ...periodo,
                    cuatrimestre: Number(e.target.value) as Cuatrimestre,
                  })
                }
                className="bg-slate-50 rounded-2xl px-4 py-2.5 text-sm font-black text-slate-700 outline-none flex-1"
              >
                {([1, 2, 3] as Cuatrimestre[]).map((c) => (
                  <option key={c} value={c}>
                    {CUATRIMESTRE_META[c].label}
                  </option>
                ))}
              </select>
              <select
                value={periodo.anio}
                onChange={(e) =>
                  setPeriodo({ ...periodo, anio: Number(e.target.value) })
                }
                className="bg-slate-50 rounded-2xl px-4 py-2.5 text-sm font-black text-slate-700 outline-none w-24"
              >
                {aniosOpciones().map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] font-bold text-slate-400">
              {periodoRepseLabelLargo(periodo)} —{" "}
              {CUATRIMESTRE_META[periodo.cuatrimestre].rango}
            </p>
          </div>
        </header>

        {mensaje && (
          <div
            className={`mb-6 px-5 py-3 rounded-2xl text-[12px] font-bold border ${
              mensaje.tipo === "ok"
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : "bg-rose-50 border-rose-100 text-rose-700"
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        {clientesRepse.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-100 p-12 text-center">
            <p className="text-sm font-bold text-slate-500">
              Aún no tienes clientes marcados como REPSE.
            </p>
            <p className="text-[11px] font-bold text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              En la sección de clientes, activa la casilla &ldquo;REPSE&rdquo;
              en el cliente que esté inscrito en el registro. Aparecerá aquí
              automáticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {clientesRepse.map((cli) => {
              const reg = registrosRepse.find(
                (r) =>
                  r.clienteId === cli.id &&
                  r.cuatrimestre === periodo.cuatrimestre &&
                  r.anio === periodo.anio
              );
              const progreso = progresoRepse(reg);

              return (
                <article
                  key={cli.id}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
                >
                  <header className="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        {cli.razonSocial}
                      </h2>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">
                        {cli.rfc}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                        progreso.completo
                          ? "bg-emerald-100 text-emerald-700"
                          : progreso.icsoe || progreso.sisub
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {progreso.completo
                        ? "Completo"
                        : progreso.icsoe || progreso.sisub
                        ? "En proceso"
                        : "Sin documentos"}
                    </span>
                  </header>

                  <div className="grid md:grid-cols-2 gap-3">
                    {TIPOS_REPSE.map((tipo) => {
                      const meta = REPSE_META[tipo];
                      const doc = reg?.[tipo];
                      const tiene = !!doc;
                      const slotId = `${cli.id}-${tipo}`;
                      return (
                        <div
                          key={tipo}
                          className={`rounded-2xl border p-4 transition-colors ${bgPorTipo(
                            tipo,
                            tiene
                          )}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${badgeColor(
                                  tipo
                                )}`}
                              >
                                {meta.label}
                              </span>
                              <p className="text-[10px] font-bold text-slate-500 mt-2 leading-tight">
                                {meta.descripcion}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                                Autoridad: {meta.autoridad}
                              </p>
                            </div>
                          </div>

                          {tiene && doc ? (
                            <div className="flex items-center justify-between gap-2 mt-2">
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-700 truncate">
                                  {doc.nombreArchivo}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400">
                                  Subido el{" "}
                                  {new Date(doc.subidoEn).toLocaleString(
                                    "es-MX",
                                    {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    }
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    descargar(doc.nombreArchivo, doc.dataUrl)
                                  }
                                  title="Descargar"
                                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white"
                                >
                                  {ICONS.download}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Eliminar el ${meta.label} de ${cli.razonSocial}? Esta acción no se puede deshacer.`
                                      )
                                    ) {
                                      eliminarDocumentoRepse(
                                        cli.id,
                                        periodo,
                                        tipo
                                      );
                                    }
                                  }}
                                  title="Eliminar"
                                  className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                >
                                  {ICONS.trash}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label
                              htmlFor={slotId}
                              className="mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-slate-200 cursor-pointer text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors bg-white/40"
                            >
                              <span className="text-slate-400">
                                {ICONS.upload}
                              </span>
                              {subiendo === slotId
                                ? "Subiendo…"
                                : `Subir ${meta.label} (PDF)`}
                              <input
                                id={slotId}
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => {
                                  void subir(cli, tipo, e.target.files?.[0]);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import { usePortalAuth } from "@/context/PortalAuthContext";
import {
  CUATRIMESTRE_META,
  REPSE_META,
  TIPOS_REPSE,
  type Cuatrimestre,
  type PeriodoRepse,
  getCuatrimestreActual,
  periodoRepseLabelLargo,
} from "@/lib/repse";

function aniosOpciones(): number[] {
  const actual = new Date().getFullYear();
  return [actual - 1, actual, actual + 1];
}

export default function PortalRepsePage() {
  const { cliente } = usePortalAuth();
  const { registrosRepse } = useClientes();
  const cuatriActual = useMemo(() => getCuatrimestreActual(), []);
  const [periodo, setPeriodo] = useState<PeriodoRepse>(cuatriActual);

  if (!cliente) return null;

  const habilitado = cliente.configRepse?.habilitado === true;

  const registro = registrosRepse.find(
    (r) =>
      r.clienteId === cliente.id &&
      r.cuatrimestre === periodo.cuatrimestre &&
      r.anio === periodo.anio
  );

  const descargar = (nombre: string, dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (!habilitado) {
    return (
      <main className="flex-1 p-4 sm:p-6 lg:p-12 bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-600">
            Tu cuenta no está registrada en REPSE.
          </p>
          <p className="text-[12px] font-bold text-slate-400 mt-2">
            Si crees que debería estarlo, escríbenos al despacho para
            actualizar la configuración.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-10">
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
              Declaraciones cuatrimestrales
            </p>
            <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter leading-none text-slate-800">
              REPSE
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-3 max-w-xl">
              Aquí encuentras tus declaraciones ICSOE (IMSS) y SISUB
              (INFONAVIT) por cuatrimestre. Te avisamos en cuanto las
              dejamos listas.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 px-5 py-4 shadow-sm flex flex-col gap-3 min-w-[260px]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Cuatrimestre
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
                className="bg-slate-50 rounded-2xl px-3 py-2 text-sm font-black text-slate-700 outline-none flex-1"
              >
                {([1, 2, 3] as Cuatrimestre[]).map((c) => (
                  <option key={c} value={c}>
                    {CUATRIMESTRE_META[c].rangoCorto}
                  </option>
                ))}
              </select>
              <select
                value={periodo.anio}
                onChange={(e) =>
                  setPeriodo({ ...periodo, anio: Number(e.target.value) })
                }
                className="bg-slate-50 rounded-2xl px-3 py-2 text-sm font-black text-slate-700 outline-none w-20"
              >
                {aniosOpciones().map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] font-bold text-slate-400">
              {periodoRepseLabelLargo(periodo)}
            </p>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-4">
          {TIPOS_REPSE.map((tipo) => {
            const meta = REPSE_META[tipo];
            const doc = registro?.[tipo];
            return (
              <article
                key={tipo}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p
                      className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                        tipo === "icsoe"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {meta.label}
                    </p>
                    <p className="text-[11px] font-bold text-slate-500 mt-2 leading-tight">
                      {meta.descripcion}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">
                      Autoridad: {meta.autoridad}
                    </p>
                  </div>
                </div>

                {doc ? (
                  <>
                    <div className="mb-4 p-3 rounded-xl bg-slate-50">
                      <p className="text-[11px] font-bold text-slate-700 truncate">
                        {doc.nombreArchivo}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                        Disponible desde{" "}
                        {new Date(doc.subidoEn).toLocaleString("es-MX", {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => descargar(doc.nombreArchivo, doc.dataUrl)}
                      className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-widest"
                    >
                      Descargar PDF
                    </button>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-[12px] font-bold text-slate-500">
                      Aún no está cargado.
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed">
                      Te avisamos en cuanto subamos el {meta.label} de este
                      cuatrimestre.
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-amber-200 bg-amber-50/60 p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">
            ¿Por qué REPSE?
          </p>
          <p className="text-[11px] font-bold text-amber-900/80 leading-relaxed">
            ICSOE y SISUB son obligaciones informativas cuatrimestrales para
            empresas inscritas en el padrón de servicios especializados.
            Vencen el día 17 del mes siguiente al cierre del cuatrimestre.
            Aunque no implican un pago, sí son importantes para mantener
            vigente tu registro ante STPS, IMSS e INFONAVIT.
          </p>
        </div>
      </div>
    </main>
  );
}

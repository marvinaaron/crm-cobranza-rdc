"use client";

import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { MESES_NOM, type Cliente } from "@/lib/clientes";
import {
  procesarMatrizCrudos,
  parsearTexto,
  plantillaCSV,
  type FilaProcesada,
} from "@/lib/clientes-importar";

type Props = {
  abierto: boolean;
  clientesExistentes: Cliente[];
  onCerrar: () => void;
  onImportar: (filas: FilaProcesada[]) => void;
};

type Modo = "archivo" | "pegar";

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function ModalImportarClientes({
  abierto,
  clientesExistentes,
  onCerrar,
  onImportar,
}: Props) {
  const [modo, setModo] = useState<Modo>("archivo");
  const [texto, setTexto] = useState("");
  const [procesado, setProcesado] = useState<FilaProcesada[] | null>(null);
  const [encabezadoDetectado, setEncabezadoDetectado] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const importables = useMemo(
    () => procesado?.filter((f) => f.errores.length === 0) ?? [],
    [procesado]
  );
  const conErrores = useMemo(
    () => procesado?.filter((f) => f.errores.length > 0) ?? [],
    [procesado]
  );

  if (!abierto) return null;

  async function manejarArchivo(file: File) {
    setErrorCarga(null);
    setNombreArchivo(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      if (!sheet) {
        setErrorCarga("El archivo no tiene hojas.");
        setProcesado(null);
        return;
      }
      const matriz = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        blankrows: false,
        raw: false,
      });
      const resultado = procesarMatrizCrudos(matriz, clientesExistentes);
      setEncabezadoDetectado(resultado.encabezadoDetectado);
      setProcesado(resultado.filas);
    } catch (err) {
      setErrorCarga(
        err instanceof Error
          ? `No se pudo leer el archivo: ${err.message}`
          : "No se pudo leer el archivo."
      );
      setProcesado(null);
    }
  }

  function manejarTexto() {
    setErrorCarga(null);
    if (!texto.trim()) {
      setProcesado(null);
      return;
    }
    const matriz = parsearTexto(texto);
    const resultado = procesarMatrizCrudos(matriz, clientesExistentes);
    setEncabezadoDetectado(resultado.encabezadoDetectado);
    setProcesado(resultado.filas);
  }

  function reiniciar() {
    setProcesado(null);
    setTexto("");
    setNombreArchivo(null);
    setErrorCarga(null);
    if (inputFileRef.current) inputFileRef.current.value = "";
  }

  function cerrar() {
    reiniciar();
    onCerrar();
  }

  function descargarPlantilla() {
    const blob = new Blob([plantillaCSV()], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-clientes-rdc.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function confirmar() {
    if (!procesado) return;
    const aImportar = procesado.filter((f) => f.errores.length === 0);
    if (aImportar.length === 0) return;
    onImportar(aImportar);
    reiniciar();
    onCerrar();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={cerrar}
        aria-label="Cerrar"
      />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <header className="px-8 py-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
              Importar clientes
            </p>
            <h2 className="text-xl font-black text-slate-800 leading-tight">
              Sube un Excel o pega filas desde tu hoja de cálculo
            </h2>
            <p className="text-[11px] font-bold text-slate-400 mt-1 max-w-xl">
              Te dejamos validar todo antes de crear los clientes. Los que
              tengan errores no se importarán.
            </p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="px-8 pt-4 pb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setModo("archivo");
              reiniciar();
            }}
            className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors ${
              modo === "archivo"
                ? "bg-indigo-600 text-white shadow"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            Subir archivo .xlsx / .csv
          </button>
          <button
            type="button"
            onClick={() => {
              setModo("pegar");
              reiniciar();
            }}
            className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors ${
              modo === "pegar"
                ? "bg-indigo-600 text-white shadow"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            Pegar desde Excel
          </button>
          <button
            type="button"
            onClick={descargarPlantilla}
            className="ml-auto text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800"
          >
            Descargar plantilla
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-8 pt-2 pb-4">
          {modo === "archivo" && (
            <label
              htmlFor="archivo-clientes"
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-3xl py-12 cursor-pointer transition-colors bg-slate-50/40"
            >
              <span className="text-indigo-600">
                <UploadIcon />
              </span>
              <p className="text-sm font-black text-slate-700">
                {nombreArchivo ?? "Selecciona un archivo .xlsx o .csv"}
              </p>
              <p className="text-[11px] font-bold text-slate-400">
                Acepta encabezados en español. Si no, se asume el orden de
                columnas de la plantilla.
              </p>
              <input
                id="archivo-clientes"
                ref={inputFileRef}
                type="file"
                accept=".xlsx,.xls,.csv,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void manejarArchivo(file);
                }}
              />
            </label>
          )}

          {modo === "pegar" && (
            <div className="space-y-3">
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onBlur={manejarTexto}
                rows={6}
                placeholder={"Pega aquí filas desde Excel.\nCada celda separada por tab. Una fila por cliente."}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={manejarTexto}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest"
              >
                Procesar texto pegado
              </button>
            </div>
          )}

          {errorCarga && (
            <p className="mt-4 px-4 py-3 rounded-2xl bg-rose-50 text-rose-700 text-[11px] font-bold">
              {errorCarga}
            </p>
          )}

          {procesado && procesado.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                  {importables.length} listos para importar
                </span>
                {conErrores.length > 0 && (
                  <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-widest">
                    {conErrores.length} con errores (se omiten)
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-400 ml-1">
                  {encabezadoDetectado
                    ? "Encabezado detectado automáticamente."
                    : "Sin encabezado: leemos columnas en el orden de la plantilla."}
                </span>
              </div>

              <div className="overflow-auto max-h-[40vh] rounded-2xl border border-slate-100">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Razón social</th>
                      <th className="px-3 py-2">RFC</th>
                      <th className="px-3 py-2">Honorarios</th>
                      <th className="px-3 py-2">Inicia</th>
                      <th className="px-3 py-2">Día</th>
                      <th className="px-3 py-2">Categorías</th>
                      <th className="px-3 py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {procesado.slice(0, 200).map((f) => {
                      const tieneErrores = f.errores.length > 0;
                      return (
                        <tr
                          key={f.numero}
                          className={
                            tieneErrores ? "bg-rose-50/40" : "hover:bg-slate-50/50"
                          }
                        >
                          <td className="px-3 py-2 text-slate-400 font-bold">
                            {f.numero}
                          </td>
                          <td className="px-3 py-2 font-bold text-slate-700">
                            {f.fila.razonSocial || (
                              <span className="text-rose-500">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-600">
                            {f.fila.rfc || <span className="text-rose-500">—</span>}
                          </td>
                          <td className="px-3 py-2 text-slate-700">
                            ${f.fila.honorarios.toLocaleString("es-MX")}
                          </td>
                          <td className="px-3 py-2 text-slate-500 text-[11px]">
                            {MESES_NOM[f.fila.inicioMes]} {f.fila.inicioAnio}
                          </td>
                          <td className="px-3 py-2 text-slate-500 text-[11px]">
                            {f.fila.diaPago}
                          </td>
                          <td className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {[
                              f.fila.federales && "FED",
                              f.fila.imss && "IMSS",
                              f.fila.estatales && "EST",
                              f.fila.repse && "REPSE",
                            ]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </td>
                          <td className="px-3 py-2">
                            {tieneErrores ? (
                              <div className="space-y-0.5">
                                {f.errores.map((e, i) => (
                                  <p
                                    key={i}
                                    className="text-[10px] font-bold text-rose-600 leading-tight"
                                  >
                                    {e.mensaje}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {procesado.length > 200 && (
                  <div className="px-4 py-3 text-[10px] font-bold text-slate-400 text-center">
                    Solo se muestran las primeras 200 filas. Las {procesado.length - 200} restantes también se procesarán.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40">
          <p className="text-[11px] font-bold text-slate-400">
            {procesado
              ? `${importables.length} de ${procesado.length} filas se crearán como nuevos clientes.`
              : "Las filas con RFC repetido o datos inválidos no se importan."}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={cerrar}
              className="px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={!procesado || importables.length === 0}
              className="px-6 py-2.5 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              Importar {importables.length > 0 ? importables.length : ""}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

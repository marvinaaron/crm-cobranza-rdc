"use client";

import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { type Cliente } from "@/lib/clientes";
import {
  aplicarContactosImportados,
  plantillaContactosCSV,
  procesarContactosCrudos,
  type FilaContactoProcesada,
} from "@/lib/clientes-contacto-importar";

type Props = {
  abierto: boolean;
  clientesExistentes: Cliente[];
  onCerrar: () => void;
  onAplicar: (clientes: Cliente[]) => void;
};

type Modo = "archivo" | "pegar";

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

function parsearTexto(texto: string): unknown[][] {
  const lineas = texto.replace(/\r\n?/g, "\n").split("\n");
  return lineas.map((linea) => {
    if (linea.includes("\t")) return linea.split("\t");
    return linea.split(",").map((c) => c.trim());
  });
}

export default function ModalImportarContactos({
  abierto,
  clientesExistentes,
  onCerrar,
  onAplicar,
}: Props) {
  const [modo, setModo] = useState<Modo>("archivo");
  const [texto, setTexto] = useState("");
  const [procesado, setProcesado] = useState<FilaContactoProcesada[] | null>(
    null
  );
  const [encabezadoDetectado, setEncabezadoDetectado] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const aplicables = useMemo(
    () =>
      procesado?.filter(
        (f) =>
          f.errores.length === 0 &&
          (f.actualizaraEmail || f.actualizaraWhatsapp)
      ) ?? [],
    [procesado]
  );
  const sinCambios = useMemo(
    () =>
      procesado?.filter(
        (f) =>
          f.errores.length === 0 &&
          !f.actualizaraEmail &&
          !f.actualizaraWhatsapp
      ) ?? [],
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
      const resultado = procesarContactosCrudos(matriz, clientesExistentes);
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
    const resultado = procesarContactosCrudos(matriz, clientesExistentes);
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
    const blob = new Blob([plantillaContactosCSV()], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-contactos-clientes-rdc.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function confirmar() {
    if (!procesado) return;
    const validas = procesado.filter((f) => f.errores.length === 0);
    if (validas.length === 0) return;
    const next = aplicarContactosImportados(clientesExistentes, validas);
    onAplicar(next);
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
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
              Actualizar contactos
            </p>
            <h2 className="text-xl font-black text-slate-800 leading-tight">
              Importa WhatsApp y correo por RFC
            </h2>
            <p className="text-[11px] font-bold text-slate-400 mt-1 max-w-xl">
              No crea clientes nuevos: solo actualiza los que ya existen en el
              CRM según su RFC.
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

        <div className="px-8 pt-4 pb-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setModo("archivo");
              reiniciar();
            }}
            className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors ${
              modo === "archivo"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Archivo Excel
          </button>
          <button
            type="button"
            onClick={() => {
              setModo("pegar");
              reiniciar();
            }}
            className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors ${
              modo === "pegar"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Pegar filas
          </button>
          <button
            type="button"
            onClick={descargarPlantilla}
            className="ml-auto text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
          >
            Descargar plantilla
          </button>
        </div>

        <div className="px-8 py-4 flex-1 overflow-y-auto">
          {modo === "archivo" ? (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
              <input
                ref={inputFileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void manejarArchivo(f);
                }}
              />
              <button
                type="button"
                onClick={() => inputFileRef.current?.click()}
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-colors"
              >
                Elegir archivo
              </button>
              {nombreArchivo && (
                <p className="mt-4 text-sm font-bold text-slate-500">
                  {nombreArchivo}
                </p>
              )}
            </div>
          ) : (
            <div>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={8}
                placeholder="Pega aquí las filas con RFC, correo y WhatsApp…"
                className="w-full rounded-2xl border border-slate-200 p-4 font-mono text-sm"
              />
              <button
                type="button"
                onClick={manejarTexto}
                className="mt-3 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest"
              >
                Analizar
              </button>
            </div>
          )}

          {errorCarga && (
            <p className="mt-4 text-sm font-bold text-red-600">{errorCarga}</p>
          )}

          {procesado && (
            <div className="mt-6 space-y-4">
              <p className="text-[11px] font-bold text-slate-400">
                {encabezadoDetectado
                  ? "Encabezados detectados."
                  : "Sin encabezados — se usó el orden: Cliente, RFC, Email, WhatsApp."}
              </p>
              {aplicables.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">
                    {aplicables.length} cliente(s) a actualizar
                  </p>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {aplicables.map((f) => (
                      <li
                        key={f.numero}
                        className="text-xs font-bold text-slate-600 bg-emerald-50 rounded-xl px-4 py-2"
                      >
                        {f.clienteNombre ?? f.fila.razonSocial}{" "}
                        <span className="font-mono text-slate-400">
                          {f.fila.rfc}
                        </span>
                        {f.actualizaraWhatsapp && (
                          <span className="block text-emerald-700">
                            WhatsApp → {f.fila.whatsapp}
                          </span>
                        )}
                        {f.actualizaraEmail && (
                          <span className="block text-indigo-600">
                            Email → {f.fila.email}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {sinCambios.length > 0 && (
                <p className="text-[11px] font-bold text-slate-400">
                  {sinCambios.length} fila(s) ya coinciden con el CRM (sin
                  cambios).
                </p>
              )}
              {conErrores.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">
                    {conErrores.length} con error
                  </p>
                  <ul className="space-y-2 max-h-32 overflow-y-auto">
                    {conErrores.map((f) => (
                      <li
                        key={f.numero}
                        className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2"
                      >
                        Fila {f.numero}: {f.errores.map((e) => e.mensaje).join(" ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={cerrar}
            className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={aplicables.length === 0}
            onClick={confirmar}
            className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-emerald-600 text-white disabled:opacity-40"
          >
            Actualizar {aplicables.length > 0 ? aplicables.length : ""}{" "}
            contacto(s)
          </button>
        </footer>
      </div>
    </div>
  );
}

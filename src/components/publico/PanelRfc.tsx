"use client";

import { useMemo, useState } from "react";
import { calcularRfcPersonaFisica } from "@/lib/fiscal/rfc";

/**
 * Panel de calculadora de RFC para persona física con homoclave.
 *
 * Diseño:
 *   - Form a la izquierda (nombres, apellidos, fecha)
 *   - Resultado a la derecha (RFC grande, desglose, botón "Copiar")
 *   - Disclaimer obligatorio: el RFC oficial lo asigna el SAT.
 */

const MESES = [
  { v: 1, label: "Enero" },
  { v: 2, label: "Febrero" },
  { v: 3, label: "Marzo" },
  { v: 4, label: "Abril" },
  { v: 5, label: "Mayo" },
  { v: 6, label: "Junio" },
  { v: 7, label: "Julio" },
  { v: 8, label: "Agosto" },
  { v: 9, label: "Septiembre" },
  { v: 10, label: "Octubre" },
  { v: 11, label: "Noviembre" },
  { v: 12, label: "Diciembre" },
];

const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: ANIO_ACTUAL - 1899 }, (_, i) => ANIO_ACTUAL - i);

export default function PanelRfc() {
  const [nombres, setNombres] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [anio, setAnio] = useState<number | "">("");
  const [mes, setMes] = useState<number | "">("");
  const [dia, setDia] = useState<number | "">("");
  const [copiado, setCopiado] = useState(false);

  const resultado = useMemo(() => {
    if (
      !nombres.trim() ||
      !primerApellido.trim() ||
      typeof anio !== "number" ||
      typeof mes !== "number" ||
      typeof dia !== "number"
    ) {
      return null;
    }
    return calcularRfcPersonaFisica({
      nombres,
      primerApellido,
      segundoApellido,
      anio,
      mes,
      dia,
    });
  }, [nombres, primerApellido, segundoApellido, anio, mes, dia]);

  const tieneRfc = resultado && !("error" in resultado);
  const erroresValidacion =
    resultado && "error" in resultado ? resultado.error : [];

  const copiar = async () => {
    if (!tieneRfc || !resultado || "error" in resultado) return;
    try {
      await navigator.clipboard.writeText(resultado.rfc);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin clipboard API: silencioso.
    }
  };

  const limpiar = () => {
    setNombres("");
    setPrimerApellido("");
    setSegundoApellido("");
    setAnio("");
    setMes("");
    setDia("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Nombre(s)
            </label>
            <input
              type="text"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              placeholder="Ej. Pedro o María Fernanda"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoComplete="given-name"
              spellCheck={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Primer apellido
              </label>
              <input
                type="text"
                value={primerApellido}
                onChange={(e) => setPrimerApellido(e.target.value)}
                placeholder="Paterno"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoComplete="family-name"
                spellCheck={false}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Segundo apellido
              </label>
              <input
                type="text"
                value={segundoApellido}
                onChange={(e) => setSegundoApellido(e.target.value)}
                placeholder="Materno (opcional)"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoComplete="additional-name"
                spellCheck={false}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Fecha de nacimiento
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={dia}
                onChange={(e) =>
                  setDia(e.target.value ? Number(e.target.value) : "")
                }
                className="px-2 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Día"
              >
                <option value="">Día</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={mes}
                onChange={(e) =>
                  setMes(e.target.value ? Number(e.target.value) : "")
                }
                className="px-2 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Mes"
              >
                <option value="">Mes</option>
                {MESES.map((m) => (
                  <option key={m.v} value={m.v}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={anio}
                onChange={(e) =>
                  setAnio(e.target.value ? Number(e.target.value) : "")
                }
                className="px-2 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Año"
              >
                <option value="">Año</option>
                {ANIOS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={limpiar}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Resultado */}
        <div className="lg:border-l lg:pl-6 lg:border-slate-200">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-600 mb-2">
            Resultado
          </p>

          {tieneRfc && resultado && !("error" in resultado) ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-200 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 mb-1">
                  RFC con homoclave
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-2xl sm:text-3xl font-black tabular-nums text-slate-900 select-all break-all">
                    {resultado.rfc}
                  </p>
                  <button
                    type="button"
                    onClick={copiar}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      copiado
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-indigo-500"
                    }`}
                  >
                    {copiado ? "✓ Copiado" : "Copiar"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <Bloque etiqueta="Letras" valor={resultado.letras} />
                <Bloque etiqueta="Fecha" valor={resultado.fecha} />
                <Bloque etiqueta="Homoclave" valor={resultado.homoclave} />
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-6 text-center">
              <p className="text-3xl mb-2" aria-hidden="true">
                📝
              </p>
              <p className="text-sm font-semibold text-slate-500">
                Captura los datos para calcular el RFC
              </p>
              {erroresValidacion.length > 0 && (
                <ul className="mt-3 text-xs text-amber-700 space-y-1">
                  {erroresValidacion.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nota técnica al pie del form. El banner de privacidad y el
          mensaje formal ya viven en la página contenedora; aquí
          mantenemos solo la advertencia funcional sobre el SAT. */}
      <p className="text-[11px] text-slate-500 leading-relaxed text-center sm:text-left">
        <span className="font-bold text-slate-700">Aviso técnico:</span> el RFC
        oficial es el que asigna el SAT. En casos excepcionales (homonimias,
        registros previos) la homoclave puede diferir. Para constancia oficial
        consulta tu Constancia de Situación Fiscal en{" "}
        <a
          href="https://www.sat.gob.mx/aplicacion/login/53027/genera-tu-constancia-de-situacion-fiscal"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold hover:text-slate-700"
        >
          sat.gob.mx
        </a>
        .
      </p>
    </div>
  );
}

function Bloque({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-lg bg-white ring-1 ring-slate-200 px-2 py-2">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
        {etiqueta}
      </p>
      <p className="text-sm font-black tabular-nums text-slate-900 break-all">
        {valor}
      </p>
    </div>
  );
}

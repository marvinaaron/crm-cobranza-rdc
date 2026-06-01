"use client";

import { useEffect, useState } from "react";
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

/**
 * Altura fija `h-11` (44 px) + padding uniforme para que <input> y
 * <select> queden visualmente idénticos. Sin esto los <select> nativos
 * de Safari/Chrome se ven más bajos que los <input>.
 */
const INPUT_BASE =
  "w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm font-bold tracking-wide text-slate-900 focus:outline-none focus:ring-2 focus:ring-marca-navy focus:border-marca-navy transition-all";

/**
 * Quita el chevron nativo del <select> y dibuja uno propio en SVG
 * (data-URI) para que la altura no varíe entre navegadores y el caret
 * se vea consistente con el resto del form.
 */
const SELECT_CHEVRON =
  "appearance-none bg-no-repeat bg-[length:16px_16px] bg-[right_0.6rem_center] pr-8 cursor-pointer " +
  "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')]";

type Resultado = ReturnType<typeof calcularRfcPersonaFisica> | null;

export default function PanelRfc() {
  const [nombres, setNombres] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [anio, setAnio] = useState<number | "">("");
  const [mes, setMes] = useState<number | "">("");
  const [dia, setDia] = useState<number | "">("");
  const [copiado, setCopiado] = useState(false);
  // Resultado AHORA es estado manual (no useMemo): solo se calcula al
  // dar click en "Consultar RFC". Da sensación de control al usuario.
  const [resultado, setResultado] = useState<Resultado>(null);

  // Si el usuario edita cualquier campo después de consultar, limpiamos
  // el resultado para evitar mostrar un RFC desactualizado.
  useEffect(() => {
    setResultado(null);
  }, [nombres, primerApellido, segundoApellido, anio, mes, dia]);

  const formularioCompleto =
    !!nombres.trim() &&
    !!primerApellido.trim() &&
    typeof anio === "number" &&
    typeof mes === "number" &&
    typeof dia === "number";

  const tieneRfc = resultado && !("error" in resultado);
  const erroresValidacion =
    resultado && "error" in resultado ? resultado.error : [];

  const consultar = () => {
    if (!formularioCompleto) return;
    if (
      typeof anio !== "number" ||
      typeof mes !== "number" ||
      typeof dia !== "number"
    ) {
      return;
    }
    setResultado(
      calcularRfcPersonaFisica({
        nombres,
        primerApellido,
        segundoApellido,
        anio,
        mes,
        dia,
      })
    );
  };

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
    setResultado(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
        {/* Form: todos los campos usan la MISMA clase `INPUT_BASE` para que
            <input> y <select> tengan exactamente la misma altura visual.
            Los valores se muestran en MAYÚSCULAS (estándar del SAT), con
            placeholder en normal-case para no gritar al usuario vacío. */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Nombre(s)
            </label>
            <input
              type="text"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") consultar();
              }}
              placeholder="Ej. Pedro o María Fernanda"
              className={`${INPUT_BASE} uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400`}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") consultar();
                }}
                placeholder="Paterno"
                className={`${INPUT_BASE} uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400`}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") consultar();
                }}
                placeholder="Materno (opcional)"
                className={`${INPUT_BASE} uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400`}
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
                className={`${INPUT_BASE} ${SELECT_CHEVRON} uppercase`}
                aria-label="Día"
              >
                <option value="">DÍA</option>
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
                className={`${INPUT_BASE} ${SELECT_CHEVRON} uppercase`}
                aria-label="Mes"
              >
                <option value="">MES</option>
                {MESES.map((m) => (
                  <option key={m.v} value={m.v}>
                    {m.label.toUpperCase()}
                  </option>
                ))}
              </select>
              <select
                value={anio}
                onChange={(e) =>
                  setAnio(e.target.value ? Number(e.target.value) : "")
                }
                className={`${INPUT_BASE} ${SELECT_CHEVRON} uppercase`}
                aria-label="Año"
              >
                <option value="">AÑO</option>
                {ANIOS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CTA principal: gradiente brand al estilo botón Hub. El
              botón se "apaga" cuando el formulario no está completo
              para guiar al usuario sin tener que mostrar errores. */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch gap-2 pt-2">
            <button
              type="button"
              onClick={limpiar}
              className="sm:flex-shrink-0 px-4 h-12 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={consultar}
              disabled={!formularioCompleto}
              className={`group flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
                formularioCompleto
                  ? "bg-marca-navy text-white shadow-lg shadow-marca-navy/30 hover:bg-marca-navy-deep hover:-translate-y-0.5 hover:shadow-xl"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  formularioCompleto
                    ? "transition-transform group-hover:rotate-12"
                    : ""
                }
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
              {formularioCompleto ? "Consultar RFC" : "Completa los campos"}
              {formularioCompleto && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Resultado */}
        <div className="lg:border-l lg:pl-6 lg:border-slate-200">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-marca-navy mb-2">
            Resultado
          </p>

          {tieneRfc && resultado && !("error" in resultado) ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-marca-navy/5 ring-1 ring-marca-navy/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-marca-navy mb-1">
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
                        : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-marca-navy hover:text-marca-navy"
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
            <div className="rounded-xl bg-slate-50 ring-1 ring-dashed ring-slate-300 p-6 text-center">
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white ring-1 ring-slate-200 text-marca-navy mb-3"
                aria-hidden="true"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </svg>
              </span>
              <p className="text-sm font-bold text-slate-700">
                {formularioCompleto
                  ? 'Listo. Da click en "Consultar RFC"'
                  : "Captura los datos y consulta tu RFC"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tu resultado aparecerá aquí al instante.
              </p>
              {erroresValidacion.length > 0 && (
                <ul className="mt-3 text-xs text-amber-700 space-y-1 text-left">
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

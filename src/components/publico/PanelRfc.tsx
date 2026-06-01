"use client";

import { useEffect, useState } from "react";
import {
  calcularRfcPersonaFisica,
  type ResultadoRfc,
} from "@/lib/fiscal/rfc";

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

      {/* Desglose interactivo (full width debajo del form/resultado).
          Solo aparece cuando hay un RFC válido para no estorbar el
          empty state. */}
      {tieneRfc && resultado && !("error" in resultado) && (
        <RfcDesgloseInteractivo resultado={resultado} />
      )}

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

/**
 * Definición de los 4 segmentos visuales del RFC con sus paletas
 * Tailwind hard-codeadas (necesario para que JIT no las purge). Cada
 * segmento tiene chips inactivos, chips activos al hover y un panel
 * informativo con su propio color.
 */
type IdSegmento = "letras" | "fecha" | "homoclave" | "verif";

const SEGMENTOS: Record<
  IdSegmento,
  {
    etiqueta: string;
    titulo: string;
    descripcion: string;
    colorChip: string;
    colorChipActivo: string;
    colorInfoFondo: string;
    colorInfoBorde: string;
    colorEyebrow: string;
  }
> = {
  letras: {
    etiqueta: "4 letras del nombre",
    titulo: "Letras de tus apellidos y nombre",
    descripcion:
      "1ª letra + 1ª vocal interna del primer apellido, 1ª letra del segundo apellido, 1ª letra del nombre.",
    colorChip: "bg-indigo-100 text-indigo-700 ring-indigo-200",
    colorChipActivo:
      "bg-indigo-600 text-white ring-indigo-400 shadow-lg shadow-indigo-300/40 -translate-y-1 scale-110",
    colorInfoFondo: "bg-indigo-50",
    colorInfoBorde: "ring-indigo-200",
    colorEyebrow: "text-indigo-600",
  },
  fecha: {
    etiqueta: "6 dígitos AAMMDD",
    titulo: "Tu fecha de nacimiento",
    descripcion:
      "Año (últimos 2 dígitos), mes y día con ceros a la izquierda. Total: 6 dígitos.",
    colorChip: "bg-sky-100 text-sky-700 ring-sky-200",
    colorChipActivo:
      "bg-sky-600 text-white ring-sky-400 shadow-lg shadow-sky-300/40 -translate-y-1 scale-110",
    colorInfoFondo: "bg-sky-50",
    colorInfoBorde: "ring-sky-200",
    colorEyebrow: "text-sky-600",
  },
  homoclave: {
    etiqueta: "2 caracteres SAT",
    titulo: "Homoclave del SAT",
    descripcion:
      "Calculados con tabla del SAT a partir del nombre completo original (apellidos + nombres en orden).",
    colorChip: "bg-amber-100 text-amber-700 ring-amber-200",
    colorChipActivo:
      "bg-amber-500 text-white ring-amber-400 shadow-lg shadow-amber-300/40 -translate-y-1 scale-110",
    colorInfoFondo: "bg-amber-50",
    colorInfoBorde: "ring-amber-200",
    colorEyebrow: "text-amber-600",
  },
  verif: {
    etiqueta: "1 dígito verificador",
    titulo: "Dígito verificador",
    descripcion:
      "Suma ponderada de los 12 primeros caracteres módulo 11. Sirve para validar que el RFC no tenga errores de captura.",
    colorChip: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    colorChipActivo:
      "bg-emerald-600 text-white ring-emerald-400 shadow-lg shadow-emerald-300/40 -translate-y-1 scale-110",
    colorInfoFondo: "bg-emerald-50",
    colorInfoBorde: "ring-emerald-200",
    colorEyebrow: "text-emerald-600",
  },
};

type Posicion = {
  char: string;
  segmento: IdSegmento;
  explicacion: string;
};

function construirPosiciones(resultado: ResultadoRfc): Posicion[] {
  const homoclaveSAT = resultado.homoclave.slice(0, 2);
  return [
    // 4 letras
    {
      char: resultado.letras[0] ?? "",
      segmento: "letras",
      explicacion: "1ª letra de tu PRIMER apellido",
    },
    {
      char: resultado.letras[1] ?? "",
      segmento: "letras",
      explicacion: "1ª VOCAL INTERNA de tu primer apellido",
    },
    {
      char: resultado.letras[2] ?? "",
      segmento: "letras",
      explicacion: "1ª letra de tu SEGUNDO apellido",
    },
    {
      char: resultado.letras[3] ?? "",
      segmento: "letras",
      explicacion: "1ª letra de tu NOMBRE",
    },
    // 6 fecha
    { char: resultado.fecha[0] ?? "", segmento: "fecha", explicacion: "Año (decena)" },
    { char: resultado.fecha[1] ?? "", segmento: "fecha", explicacion: "Año (unidad)" },
    { char: resultado.fecha[2] ?? "", segmento: "fecha", explicacion: "Mes (decena)" },
    { char: resultado.fecha[3] ?? "", segmento: "fecha", explicacion: "Mes (unidad)" },
    { char: resultado.fecha[4] ?? "", segmento: "fecha", explicacion: "Día (decena)" },
    { char: resultado.fecha[5] ?? "", segmento: "fecha", explicacion: "Día (unidad)" },
    // 2 homoclave SAT
    {
      char: homoclaveSAT[0] ?? "",
      segmento: "homoclave",
      explicacion: "1er carácter de homoclave (tabla SAT)",
    },
    {
      char: homoclaveSAT[1] ?? "",
      segmento: "homoclave",
      explicacion: "2do carácter de homoclave (tabla SAT)",
    },
    // 1 verificador
    {
      char: resultado.digitoVerificador,
      segmento: "verif",
      explicacion: "Dígito verificador (validación)",
    },
  ];
}

function RfcDesgloseInteractivo({ resultado }: { resultado: ResultadoRfc }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const posiciones = construirPosiciones(resultado);
  const segActivo: IdSegmento | null =
    hoverIdx !== null ? posiciones[hoverIdx].segmento : null;
  const seg = segActivo ? SEGMENTOS[segActivo] : null;

  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-marca-navy">
          Cómo se compone tu RFC
        </p>
        <p className="text-[11px] text-slate-500">
          Pasa el mouse o tap sobre cualquier letra
        </p>
      </div>

      {/* 13 chips con flecha conectora entre segmentos */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-4">
        {posiciones.map((pos, idx) => {
          const segDef = SEGMENTOS[pos.segmento];
          const activo = segActivo === pos.segmento;
          const cambioSegmento =
            idx > 0 && posiciones[idx - 1].segmento !== pos.segmento;
          return (
            <span key={idx} className="inline-flex items-center gap-1 sm:gap-1.5">
              {cambioSegmento && (
                <span
                  aria-hidden="true"
                  className="text-slate-300 px-0.5"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              )}
              <button
                type="button"
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                onFocus={() => setHoverIdx(idx)}
                onBlur={() => setHoverIdx(null)}
                onClick={() =>
                  setHoverIdx((prev) => (prev === idx ? null : idx))
                }
                aria-label={pos.explicacion}
                className={`relative w-9 h-12 sm:w-11 sm:h-14 rounded-lg ring-1 font-black text-xl sm:text-2xl tabular-nums transition-all duration-200 ${
                  activo ? segDef.colorChipActivo : segDef.colorChip
                } hover:-translate-y-1`}
              >
                {pos.char}
              </button>
            </span>
          );
        })}
      </div>

      {/* Panel informativo que cambia de color + contenido al hover */}
      <div
        className={`rounded-xl p-4 ring-1 transition-all min-h-[110px] ${
          seg
            ? `${seg.colorInfoFondo} ${seg.colorInfoBorde}`
            : "bg-slate-50 ring-slate-200"
        }`}
      >
        {seg && hoverIdx !== null ? (
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <p
                className={`text-[10px] font-black uppercase tracking-widest ${seg.colorEyebrow}`}
              >
                {seg.etiqueta}
              </p>
              <span
                className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-white ring-1 ${seg.colorInfoBorde} text-sm font-black tabular-nums text-slate-900`}
              >
                {posiciones[hoverIdx].char}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1">
              {seg.titulo}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed mb-2">
              {seg.descripcion}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">Este carácter:</span>{" "}
              {posiciones[hoverIdx].explicacion}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-3">
            <p className="text-sm text-slate-500 text-center">
              <span className="font-semibold text-slate-700">Tip:</span> pasa el
              mouse sobre cualquier letra para descubrir qué significa.
            </p>
            <div className="mt-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-slate-600">Letras</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-slate-600">Fecha</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-600">Homoclave</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Verificador</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

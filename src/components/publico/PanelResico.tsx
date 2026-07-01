"use client";

import { useEffect, useState } from "react";
import CtaConversionHerramienta from "@/components/ui/cta-conversion-herramienta";
import {
  calcularIsrResico,
  fmtMxn,
  fmtTasa,
  LIMITE_MENSUAL_RESICO,
  TARIFA_RESICO,
  type ResultadoResico,
} from "@/lib/fiscal/resico";

/**
 * Calculadora de ISR para RESICO (persona física).
 *
 * Diseño paralelo a `PanelRfc`:
 *   - Captura de ingreso del mes a la izquierda + botón "Calcular ISR".
 *   - Resultado grande a la derecha (ISR del mes, tasa, rango).
 *   - Tabla de tasas debajo, resaltando el tramo aplicado.
 *
 * El cálculo corre 100 % en el navegador. Es informativo.
 */

const INPUT_BASE =
  "w-full h-14 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-2xl font-black tabular-nums tracking-tight text-slate-900 focus:outline-none focus:ring-2 focus:ring-marca-navy focus:border-marca-navy transition-all";

type Resultado = ResultadoResico | null;

/** Quita todo lo que no sea dígito o punto y lo convierte a número. */
function parseMonto(valor: string): number {
  const limpio = valor.replace(/[^0-9.]/g, "");
  // Si hay más de un punto, conserva solo el primero.
  const partes = limpio.split(".");
  const normalizado =
    partes.length > 2 ? `${partes[0]}.${partes.slice(1).join("")}` : limpio;
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : NaN;
}

export default function PanelResico() {
  const [ingresoTexto, setIngresoTexto] = useState("");
  const [resultado, setResultado] = useState<Resultado>(null);
  const [copiado, setCopiado] = useState(false);

  // Si el usuario edita el monto después de calcular, limpiamos el
  // resultado para no mostrar un ISR desactualizado.
  useEffect(() => {
    setResultado(null);
  }, [ingresoTexto]);

  const ingresoNum = parseMonto(ingresoTexto);
  const formularioCompleto = Number.isFinite(ingresoNum) && ingresoNum > 0;

  const exito = resultado && resultado.ok ? resultado : null;
  const errorMsg = resultado && !resultado.ok ? resultado.error : null;

  const calcular = () => {
    if (!formularioCompleto) return;
    setResultado(calcularIsrResico(ingresoNum));
  };

  const limpiar = () => {
    setIngresoTexto("");
    setResultado(null);
  };

  const copiar = async () => {
    if (!exito) return;
    try {
      await navigator.clipboard.writeText(fmtMxn(exito.isr));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin clipboard API: silencioso.
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
        {/* Captura del ingreso */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Ingreso del mes (facturado)
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400"
                aria-hidden="true"
              >
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={ingresoTexto}
                onChange={(e) => setIngresoTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") calcular();
                }}
                placeholder="45,000"
                className={`${INPUT_BASE} placeholder:font-bold placeholder:text-slate-300`}
                autoComplete="off"
                spellCheck={false}
                aria-label="Ingreso mensual en pesos"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Escribe el total de tus ingresos del mes amparados por CFDI.
            </p>
          </div>

          {/* Chips de montos rápidos para probar */}
          <div className="flex flex-wrap gap-1.5">
            {[15000, 30000, 45000, 80000, 120000].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setIngresoTexto(m.toLocaleString("es-MX"))}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-600 bg-slate-100 ring-1 ring-slate-200 hover:bg-marca-navy/10 hover:text-marca-navy hover:ring-marca-navy/30 transition-colors"
              >
                ${m.toLocaleString("es-MX")}
              </button>
            ))}
          </div>

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
              onClick={calcular}
              disabled={!formularioCompleto}
              className={`group relative flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-sm font-black uppercase tracking-wider transition-all overflow-hidden ${
                formularioCompleto
                  ? "bg-gradient-to-r from-marca-navy via-violet-700 to-marca-navy bg-[length:200%_100%] bg-left text-white shadow-lg shadow-violet-900/30 hover:bg-right hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-700/40"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
              style={
                formularioCompleto
                  ? {
                      transition:
                        "background-position 0.6s ease, transform 0.2s ease, box-shadow 0.2s ease",
                    }
                  : undefined
              }
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
                aria-hidden="true"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="8" y2="10" />
                <line x1="12" y1="10" x2="12" y2="10" />
                <line x1="16" y1="10" x2="16" y2="10" />
                <line x1="8" y1="14" x2="8" y2="14" />
                <line x1="12" y1="14" x2="12" y2="14" />
                <line x1="16" y1="14" x2="16" y2="18" />
                <line x1="8" y1="18" x2="12" y2="18" />
              </svg>
              {formularioCompleto ? "Calcular ISR" : "Captura tu ingreso"}
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

          {exito ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-marca-navy/5 ring-1 ring-marca-navy/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-marca-navy mb-1">
                  ISR del mes
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-3xl sm:text-4xl font-black tabular-nums text-slate-900 select-all">
                    {fmtMxn(exito.isr)}
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

              {/* Desglose del cálculo */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Ingreso
                  </p>
                  <p className="text-base font-black tabular-nums text-slate-900">
                    {fmtMxn(exito.ingreso)}
                  </p>
                </div>
                <div className="rounded-xl bg-violet-50 ring-1 ring-violet-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">
                    Tasa aplicada
                  </p>
                  <p className="text-base font-black tabular-nums text-violet-700">
                    {fmtTasa(exito.tasa)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Cómo se calcula:</span>{" "}
                {fmtMxn(exito.ingreso)} × {fmtTasa(exito.tasa)} ={" "}
                <span className="font-bold text-slate-900">
                  {fmtMxn(exito.isr)}
                </span>
                . En RESICO la tasa se aplica directo al ingreso, sin
                deducciones ni cuota fija.
              </p>

              {exito.excedeLimiteMensual && (
                <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3 flex items-start gap-2.5">
                  <span className="shrink-0 mt-0.5 text-amber-600" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </span>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Este mes superas{" "}
                    <strong>{fmtMxn(LIMITE_MENSUAL_RESICO)}</strong> (el
                    promedio mensual del límite anual). No sales del régimen de
                    inmediato; lo que importa es tu acumulado del año
                    (máx. $3,500,000).
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 ring-1 ring-dashed ring-slate-300 p-6 text-center">
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white ring-1 ring-slate-200 text-marca-navy mb-3"
                aria-hidden="true"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
              <p className="text-sm font-bold text-slate-700">
                {formularioCompleto
                  ? 'Listo. Da click en "Calcular ISR"'
                  : "Captura tu ingreso del mes"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tu ISR estimado aparecerá aquí al instante.
              </p>
              {errorMsg && (
                <p className="mt-3 text-xs text-amber-700 font-semibold">
                  {errorMsg}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabla de tasas, resaltando el tramo aplicado */}
      <div className="pt-5 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-marca-navy">
            Tabla de tasas RESICO 2026
          </p>
          <p className="text-[11px] text-slate-500">Art. 113-E LISR</p>
        </div>
        <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="text-left font-bold uppercase tracking-wider text-[10px] px-4 py-2.5">
                  Ingreso mensual
                </th>
                <th className="text-right font-bold uppercase tracking-wider text-[10px] px-4 py-2.5">
                  Tasa de ISR
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TARIFA_RESICO.map((t, i) => {
                const activo = exito?.indiceTramo === i;
                const rango =
                  t.limiteSuperior === null
                    ? `Más de ${fmtMxn(TARIFA_RESICO[i - 1]?.limiteSuperior ?? 0)}`
                    : i === 0
                      ? `Hasta ${fmtMxn(t.limiteSuperior)}`
                      : `${fmtMxn(t.limiteInferior)} – ${fmtMxn(t.limiteSuperior)}`;
                return (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      activo
                        ? "bg-marca-navy/[0.07]"
                        : "bg-white hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        {activo && (
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full bg-marca-navy"
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className={`tabular-nums ${
                            activo
                              ? "font-black text-slate-900"
                              : "font-medium text-slate-700"
                          }`}
                        >
                          {rango}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md tabular-nums text-xs font-black ${
                          activo
                            ? "bg-marca-navy text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {fmtTasa(t.tasa)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed text-center sm:text-left">
        <span className="font-bold text-slate-700">Aviso:</span> cálculo de
        referencia conforme al artículo 113-E de la LISR. El RESICO no permite
        deducciones y tiene un límite de ingresos anuales de $3,500,000. El
        impuesto definitivo depende del cumplimiento de requisitos del régimen.
        Para tu caso particular consulta con tu contador.
      </p>

      <CtaConversionHerramienta
        titulo="¿Quieres que declaremos tu RESICO cada mes?"
        subtitulo="Portal de cliente, declaraciones y asesoría en Guadalajara. Cotización sin compromiso."
      />
    </div>
  );
}

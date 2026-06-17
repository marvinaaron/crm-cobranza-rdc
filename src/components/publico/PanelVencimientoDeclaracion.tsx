"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MESES_NOM, type Periodo } from "@/lib/clientes";
import {
  TABLA_SEXTO_DIGITO_SAT,
  diasHabilesPorSextoDigito,
  desgloseVencimientoSAT,
  formatearDiaMesCorto,
  formatearFechaVencimiento,
  sextoDigitoRFC,
} from "@/lib/portal/fechas-fiscales";

type Props = {
  /** `pagina` = herramienta dedicada; `blog` = embed más compacto en artículo. */
  variante?: "pagina" | "blog";
};

const ANIOS = [2024, 2025, 2026, 2027];

/** Periodo fiscal que normalmente se declara hoy: mes anterior al calendario. */
function periodoDeclaracionPorDefecto(ahora = new Date()): Periodo {
  const mesActual = ahora.getMonth();
  if (mesActual === 0) return { mes: 11, anio: ahora.getFullYear() - 1 };
  return { mes: mesActual - 1, anio: ahora.getFullYear() };
}

const SELECT_PERIODO =
  "mt-2 w-full h-11 rounded-xl border border-white/15 bg-slate-950/60 px-3 text-sm font-bold text-white outline-none focus:border-amber-400/50 appearance-none lg:h-[3.25rem] lg:text-base";

function resaltarSextoDigito(rfc: string): React.ReactNode {
  const limpio = rfc.toUpperCase().trim();
  const digitos = limpio.match(/\d/g);
  if (!digitos || digitos.length < 6) {
    return <span className="font-mono tracking-wider">{limpio || "—"}</span>;
  }

  let vistos = 0;
  const partes: React.ReactNode[] = [];
  for (let i = 0; i < limpio.length; i += 1) {
    const ch = limpio[i]!;
    if (/\d/.test(ch)) {
      vistos += 1;
      if (vistos === 6) {
        partes.push(
          <span
            key={i}
            className="relative inline-flex items-center justify-center min-w-[1.1em] rounded-md bg-amber-400 text-slate-900 font-black px-0.5 shadow-[0_0_12px_rgba(251,191,36,0.65)] animate-pulse"
            title="6º dígito numérico · define tus días extra"
          >
            {ch}
          </span>
        );
      } else {
        partes.push(
          <span key={i} className="text-slate-300">
            {ch}
          </span>
        );
      }
    } else {
      partes.push(
        <span key={i} className="text-slate-500">
          {ch}
        </span>
      );
    }
  }
  return <span className="font-mono tracking-wider text-lg">{partes}</span>;
}

export default function PanelVencimientoDeclaracion({
  variante = "pagina",
}: Props) {
  const periodoInicial = periodoDeclaracionPorDefecto();
  const [rfc, setRfc] = useState("");
  const [mes, setMes] = useState(periodoInicial.mes);
  const [anio, setAnio] = useState(periodoInicial.anio);
  const [calculado, setCalculado] = useState(false);

  const periodo: Periodo = { mes, anio };
  const sexto = sextoDigitoRFC(rfc);

  const resultado = useMemo(() => {
    if (!calculado || !rfc.trim()) return null;
    const r = desgloseVencimientoSAT(rfc, periodo);
    return "error" in r ? r : r;
  }, [calculado, rfc, mes, anio, periodo]);

  const error = resultado && "error" in resultado ? resultado.error : null;
  const ok = resultado && !("error" in resultado) ? resultado : null;

  function calcular() {
    setCalculado(true);
  }

  const esBlog = variante === "blog";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-200/80 bg-[#0d1724] text-white shadow-[0_40px_80px_-24px_rgba(15,29,46,0.55)] ${
        esBlog ? "my-2" : ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-24 w-28 sm:h-28 sm:w-32"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(251,191,36,0.24) 0%, transparent 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-20 w-24 sm:h-24 sm:w-28"
        style={{
          background:
            "radial-gradient(circle at 0% 100%, rgba(56,189,248,0.10) 0%, transparent 72%)",
        }}
      />

      <div className={`relative ${esBlog ? "p-5 sm:p-6" : "p-6 sm:p-8 lg:p-10"}`}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-300">
              Calculadora en vivo
            </p>
            <h2
              className={`mt-1 font-black tracking-tight ${
                esBlog ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
              }`}
            >
              ¿Cuándo vence tu declaración?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300 leading-relaxed">
              Captura tu RFC, elige el mes que vas a declarar y te decimos la
              fecha exacta según las reglas del SAT.
            </p>
          </div>
          <div className="shrink-0 justify-self-end rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center min-w-[6.5rem] lg:px-5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Base SAT
            </p>
            <span
              className="block text-3xl font-black text-amber-300 leading-none my-1 tabular-nums"
              aria-hidden
            >
              17
            </span>
            <p className="text-[10px] text-slate-400">+ días por RFC</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Formulario */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Tu RFC
              </span>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={rfc}
                  onChange={(e) => {
                    setRfc(e.target.value.toUpperCase());
                    setCalculado(false);
                  }}
                  placeholder="Ej. LOMA900315AB1"
                  maxLength={13}
                  className="w-full rounded-xl border border-white/15 bg-slate-950/60 py-3.5 pl-4 pr-11 text-lg font-mono tracking-wider text-white placeholder:text-slate-600 outline-none ring-amber-400/0 transition focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/30"
                />
                {rfc.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setRfc("");
                      setCalculado(false);
                    }}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                    aria-label="Borrar RFC"
                  >
                    <svg
                      width="14"
                      height="14"
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
                  </button>
                )}
              </div>
            </label>

            <Link
              href="/herramientas/rfc"
              className="flex items-center gap-3 rounded-xl border border-indigo-400/40 bg-gradient-to-r from-indigo-500/20 to-violet-500/15 px-4 py-3 transition hover:border-indigo-300/60 hover:from-indigo-500/30"
            >
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/30 text-indigo-100 ring-1 ring-indigo-300/30"
                aria-hidden
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="9" cy="11" r="2" />
                  <path d="M6 17c.7-1.5 2-2.5 3-2.5s2.3 1 3 2.5" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-200">
                  ¿No sabes tu RFC?
                </span>
                <span className="mt-0.5 block text-xs font-bold text-white leading-snug">
                  Consúltalo gratis con la{" "}
                  <span className="text-indigo-200 underline decoration-indigo-300/60 underline-offset-2">
                    Calculadora de RFC
                  </span>
                </span>
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-indigo-200"
                aria-hidden
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>

            {rfc.trim().length >= 8 && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200">
                  Tu 6º dígito numérico
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {resaltarSextoDigito(rfc)}
                  {sexto != null && (
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-900">
                      +{diasHabilesPorSextoDigito(sexto)} día
                      {diasHabilesPorSextoDigito(sexto) === 1 ? "" : "s"} hábil
                      {diasHabilesPorSextoDigito(sexto) === 1 ? "" : "es"}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 items-end">
              <label className="block min-w-0">
                <span className="block min-h-[2rem] text-[10px] font-black uppercase tracking-widest text-slate-400 leading-snug">
                  Mes a declarar
                </span>
                <select
                  value={mes}
                  onChange={(e) => {
                    setMes(Number(e.target.value));
                    setCalculado(false);
                  }}
                  className={SELECT_PERIODO}
                >
                  {MESES_NOM.map((nombre, i) => (
                    <option key={nombre} value={i} className="bg-slate-900">
                      {nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="block min-h-[2rem] text-[10px] font-black uppercase tracking-widest text-slate-400 leading-snug">
                  Año del periodo
                </span>
                <select
                  value={anio}
                  onChange={(e) => {
                    setAnio(Number(e.target.value));
                    setCalculado(false);
                  }}
                  className={SELECT_PERIODO}
                >
                  {ANIOS.map((a) => (
                    <option key={a} value={a} className="bg-slate-900">
                      {a}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={calcular}
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 px-5 py-3.5 text-sm font-black uppercase tracking-widest text-slate-900 shadow-md shadow-amber-500/15 transition hover:brightness-105 active:scale-[0.99]"
            >
              Calcular mi vencimiento
            </button>
          </div>

          {/* Resultado */}
          <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5 min-h-[280px]">
            {!calculado && (
              <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                  📅
                </div>
                <p className="text-sm font-bold text-slate-300">
                  Tu fecha aparecerá aquí
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Declaración de {MESES_NOM[mes]} {anio} → vence en{" "}
                  {MESES_NOM[(mes + 1) % 12]}
                </p>
              </div>
            )}

            {calculado && error && (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-rose-300 text-sm font-bold">{error}</p>
              </div>
            )}

            {ok && (
              <div className="transition-all duration-500">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">
                  Tu fecha límite SAT
                </p>
                <p className="mt-2 text-4xl sm:text-5xl font-black leading-none text-white">
                  {formatearDiaMesCorto(ok.fechaFinal)}
                </p>
                <p className="mt-2 text-lg font-bold text-amber-200 capitalize">
                  {formatearFechaVencimiento(ok.fechaFinal)}
                </p>
                <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                  Declaración de{" "}
                  <strong className="text-slate-200">
                    {ok.nombreMesPeriodo} {anio}
                  </strong>{" "}
                  (ISR/IVA mensual) · vence en{" "}
                  <strong className="text-slate-200">
                    {ok.nombreMesVencimiento} {ok.anioVencimiento}
                  </strong>
                </p>

                <ol className="mt-5 space-y-2 text-left text-[11px] text-slate-300">
                  <li className="flex gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <span className="font-black text-amber-300">1</span>
                    <span>
                      Partimos del <strong>17 de {ok.nombreMesVencimiento}</strong>
                    </span>
                  </li>
                  <li className="flex gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <span className="font-black text-amber-300">2</span>
                    <span>
                      Tu RFC termina en <strong>{ok.sextoDigito}</strong> (rango{" "}
                      {ok.rangoSextoDigito}) → sumamos{" "}
                      <strong>
                        {ok.diasHabilesExtra} día
                        {ok.diasHabilesExtra === 1 ? "" : "s"} hábil
                        {ok.diasHabilesExtra === 1 ? "" : "es"}
                      </strong>
                    </span>
                  </li>
                  {ok.huboRecorridoFinDeSemana && (
                    <li className="flex gap-2 rounded-lg bg-amber-400/15 px-3 py-2 text-amber-100">
                      <span className="font-black text-amber-300">3</span>
                      <span>
                        Cayó en fin de semana → el SAT recorre al{" "}
                        <strong>siguiente día hábil</strong>
                      </span>
                    </li>
                  )}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Tabla referencia */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <div className="bg-white/5 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Tabla oficial · 6º dígito del RFC
            </p>
          </div>
          <div className="grid grid-cols-5 divide-x divide-white/10 text-center text-[11px] sm:text-xs">
            {TABLA_SEXTO_DIGITO_SAT.map((fila) => (
              <div key={fila.rango} className="px-2 py-3 sm:px-3">
                <p className="font-bold text-slate-300">{fila.rango}</p>
                <p className="mt-1 text-lg font-black text-amber-300">
                  +{fila.dias}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">
                  día{fila.dias === 1 ? "" : "s"} hábil{fila.dias === 1 ? "" : "es"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[10px] text-slate-500 leading-relaxed">
          Por defecto seleccionamos el <strong className="text-slate-400">mes anterior</strong>{" "}
          al calendario: en junio se declara mayo, en julio junio, y así sucesivamente. Herramienta
          informativa con las reglas de vencimiento mensual del SAT. No sustituye avisos oficiales.
          El cálculo se hace en tu navegador; no guardamos tu RFC.
        </p>
      </div>
    </div>
  );
}

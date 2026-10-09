"use client";

import { useState } from "react";
import Link from "next/link";

const DIAS_VACACIONES: Record<string, number> = {
  "1": 12,
  "2": 14,
  "3": 16,
  "4": 18,
  "5": 20,
  "6-10": 22,
  "11-15": 24,
  "16-20": 26,
  "21-25": 28,
  "26-30": 30,
  "31-35": 32,
};

const OPCIONES_ANTIGUEDAD = [
  { valor: "1", etiqueta: "1 año" },
  { valor: "2", etiqueta: "2 años" },
  { valor: "3", etiqueta: "3 años" },
  { valor: "4", etiqueta: "4 años" },
  { valor: "5", etiqueta: "5 años" },
  { valor: "6-10", etiqueta: "6 a 10 años" },
  { valor: "11-15", etiqueta: "11 a 15 años" },
  { valor: "16-20", etiqueta: "16 a 20 años" },
  { valor: "21-25", etiqueta: "21 a 25 años" },
  { valor: "26-30", etiqueta: "26 a 30 años" },
  { valor: "31-35", etiqueta: "31 a 35 años" },
];

const OPCIONES_PRIMA = [
  { valor: 0.25, etiqueta: "25% (mínimo de ley)" },
  { valor: 0.5, etiqueta: "50%" },
  { valor: 1.0, etiqueta: "100%" },
];

const TABLA_FACTOR = [
  { antiguedad: "1 año", dias: 12, factor25: 1.0493, factor50: 1.0575, factor100: 1.0740 },
  { antiguedad: "2 años", dias: 14, factor25: 1.0507, factor50: 1.0603, factor100: 1.0795 },
  { antiguedad: "3 años", dias: 16, factor25: 1.0521, factor50: 1.0630, factor100: 1.0849 },
  { antiguedad: "4 años", dias: 18, factor25: 1.0534, factor50: 1.0658, factor100: 1.0904 },
  { antiguedad: "5 años", dias: 20, factor25: 1.0548, factor50: 1.0685, factor100: 1.0959 },
  { antiguedad: "6-10 años", dias: 22, factor25: 1.0562, factor50: 1.0712, factor100: 1.1014 },
  { antiguedad: "11-15 años", dias: 24, factor25: 1.0575, factor50: 1.0740, factor100: 1.1068 },
  { antiguedad: "16-20 años", dias: 26, factor25: 1.0589, factor50: 1.0767, factor100: 1.1123 },
  { antiguedad: "21-25 años", dias: 28, factor25: 1.0603, factor50: 1.0795, factor100: 1.1178 },
  { antiguedad: "26-30 años", dias: 30, factor25: 1.0616, factor50: 1.0822, factor100: 1.1233 },
  { antiguedad: "31-35 años", dias: 32, factor25: 1.0630, factor50: 1.0849, factor100: 1.1288 },
];

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("es-MX", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtMoneda(n: number): string {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export default function CalculadoraSdi() {
  const [modo, setModo] = useState<"mensual" | "diario">("mensual");
  const [salario, setSalario] = useState("");
  const [antiguedad, setAntiguedad] = useState("1");
  const [primaVacacional, setPrimaVacacional] = useState(0.25);
  const [infoAbierta, setInfoAbierta] = useState(false);

  const salarioNum = parseFloat(salario.replace(/,/g, "")) || 0;
  const salarioDiario = modo === "mensual" ? salarioNum / 30 : salarioNum;
  const diasVacaciones = DIAS_VACACIONES[antiguedad] ?? 12;
  const diasAguinaldo = 15;

  const factor = (365 + diasAguinaldo + diasVacaciones * primaVacacional) / 365;
  const sdi = salarioDiario * factor;

  const hayResultado = salarioNum > 0;

  return (
    <div className="space-y-6">
      {/* Calculadora */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tipo de salario
            </label>
            <div className="flex rounded-lg overflow-hidden ring-1 ring-slate-200">
              <button
                type="button"
                onClick={() => setModo("mensual")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  modo === "mensual"
                    ? "bg-sky-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setModo("diario")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  modo === "diario"
                    ? "bg-sky-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Diario
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="salario" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Salario {modo === "mensual" ? "mensual bruto" : "diario"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                id="salario"
                type="text"
                inputMode="decimal"
                placeholder={modo === "mensual" ? "15,000" : "500"}
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
                className="w-full pl-7 pr-4 py-2.5 rounded-lg ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm tabular-nums"
              />
            </div>
          </div>

          <div>
            <label htmlFor="antiguedad" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Antigüedad laboral
            </label>
            <select
              id="antiguedad"
              value={antiguedad}
              onChange={(e) => setAntiguedad(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm bg-white"
            >
              {OPCIONES_ANTIGUEDAD.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="prima" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Prima vacacional
            </label>
            <select
              id="prima"
              value={primaVacacional}
              onChange={(e) => setPrimaVacacional(parseFloat(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm bg-white"
            >
              {OPCIONES_PRIMA.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 space-y-1">
            <p><span className="font-medium">Días de aguinaldo:</span> {diasAguinaldo} (mínimo de ley)</p>
            <p><span className="font-medium">Días de vacaciones:</span> {diasVacaciones} (según antigüedad, LFT 2026)</p>
          </div>
        </div>

        {/* Resultado */}
        <div className="flex flex-col">
          {hayResultado ? (
            <div className="rounded-xl bg-gradient-to-br from-sky-600 to-sky-800 text-white p-6 shadow-lg flex-1 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-200">
                Salario Diario Integrado
              </p>
              <p className="mt-2 text-4xl font-black tabular-nums">
                {fmtMoneda(sdi)}
              </p>
              <p className="text-sky-200 text-sm mt-1">por día</p>

              <div className="mt-5 pt-4 border-t border-sky-500/40 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-sky-200">Salario diario</span>
                  <span className="font-semibold tabular-nums">{fmtMoneda(salarioDiario)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-200">Factor de integración</span>
                  <span className="font-semibold tabular-nums">{fmt(factor, 4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-200">Días vacaciones</span>
                  <span className="font-semibold">{diasVacaciones}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-200">Prima vacacional</span>
                  <span className="font-semibold">{(primaVacacional * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-500/40">
                <p className="text-xs text-sky-200">
                  Fórmula: (365 + {diasAguinaldo} + {diasVacaciones} × {(primaVacacional * 100).toFixed(0)}%) ÷ 365 = {fmt(factor, 4)}
                </p>
                <p className="text-xs text-sky-200 mt-0.5">
                  SDI = {fmtMoneda(salarioDiario)} × {fmt(factor, 4)} = {fmtMoneda(sdi)}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-6 flex-1 flex items-center justify-center">
              <p className="text-sm text-slate-500 text-center">
                Ingresa tu salario para calcular el SDI
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desplegable de consejos */}
      <div className="rounded-xl ring-1 ring-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setInfoAbierta(!infoAbierta)}
          className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
        >
          <span className="text-sm font-bold text-slate-900">
            Consejos para verificar tu SDI
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-slate-400 transition-transform ${infoAbierta ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {infoAbierta && (
          <div className="px-5 pb-5 space-y-3 text-sm text-slate-600 bg-white border-t border-slate-100">
            <p>
              <span className="font-semibold text-slate-800">Revisa tu contrato laboral</span> para conocer
              tus prestaciones exactas. Algunas empresas otorgan más de 15 días de aguinaldo o prima vacacional
              superior al 25%.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Pregunta en RRHH</span> sobre tu porcentaje de
              prima vacacional y si tienes prestaciones adicionales que integren al salario (vales, bonos fijos, etc.).
            </p>
            <p>
              <span className="font-semibold text-slate-800">El factor mínimo de integración para 2026 es 1.0493</span>{" "}
              (1 año de antigüedad, 15 días de aguinaldo, 12 días de vacaciones con 25% de prima).
            </p>
            <p>
              <span className="font-semibold text-slate-800">El SDI se reporta al IMSS</span> y es la base para
              calcular cuotas obrero-patronales, incapacidades, pensiones y liquidaciones.
            </p>
          </div>
        )}
      </div>

      {/* Tabla de factores de integración */}
      <div className="overflow-hidden rounded-xl ring-1 ring-slate-200 bg-white">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Tabla de factores de integración 2026
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Prestaciones mínimas de ley: 15 días aguinaldo
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Antigüedad</th>
                <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Días vac.</th>
                <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Factor 25%</th>
                <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Factor 50%</th>
                <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Factor 100%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TABLA_FACTOR.map((row) => (
                <tr key={row.antiguedad} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-700 font-medium">{row.antiguedad}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-700">{row.dias}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-900 font-semibold">{row.factor25.toFixed(4)}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-900 font-semibold">{row.factor50.toFixed(4)}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-900 font-semibold">{row.factor100.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referencia al blog */}
      <div className="rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 ring-1 ring-sky-200/60 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">
            ¿Quieres entender a fondo cómo funciona el SDI?
          </p>
          <p className="text-sm text-slate-600 mt-0.5">
            Lee nuestro artículo completo con ejemplos prácticos, tablas de referencia y todo lo que necesitas saber sobre el Salario Diario Integrado en 2026.
          </p>
        </div>
        <Link
          href="/blog/que-es-el-salario-diario-integrado-sdi-2026"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors shadow-sm"
        >
          Leer artículo
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Referencia a prima vacacional */}
      <div className="rounded-xl ring-1 ring-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M12 12h.01" />
            <path d="M17 12h.01" />
            <path d="M7 12h.01" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">
            ¿Necesitas calcular la prima vacacional por separado?
          </p>
          <p className="text-sm text-slate-600 mt-0.5">
            Usa nuestra calculadora de prima vacacional para obtener el monto exacto que te corresponde según la LFT 2026.
          </p>
        </div>
        <Link
          href="/herramientas/prima-vacacional"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Calcular prima
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

const TABLA_VACACIONES = [
  { rango: "1 año", dias: 12 },
  { rango: "2 años", dias: 14 },
  { rango: "3 años", dias: 16 },
  { rango: "4 años", dias: 18 },
  { rango: "5 años", dias: 20 },
  { rango: "6 a 10 años", dias: 22 },
  { rango: "11 a 15 años", dias: 24 },
  { rango: "16 a 20 años", dias: 26 },
  { rango: "21 a 25 años", dias: 28 },
  { rango: "26 a 30 años", dias: 30 },
  { rango: "31 a 35 años", dias: 32 },
];

const OPCIONES_ANTIGUEDAD = [
  { valor: 12, etiqueta: "1 año (12 días)" },
  { valor: 14, etiqueta: "2 años (14 días)" },
  { valor: 16, etiqueta: "3 años (16 días)" },
  { valor: 18, etiqueta: "4 años (18 días)" },
  { valor: 20, etiqueta: "5 años (20 días)" },
  { valor: 22, etiqueta: "6 a 10 años (22 días)" },
  { valor: 24, etiqueta: "11 a 15 años (24 días)" },
  { valor: 26, etiqueta: "16 a 20 años (26 días)" },
  { valor: 28, etiqueta: "21 a 25 años (28 días)" },
  { valor: 30, etiqueta: "26 a 30 años (30 días)" },
  { valor: 32, etiqueta: "31 a 35 años (32 días)" },
];

const OPCIONES_PRIMA = [
  { valor: 25, etiqueta: "25% (mínimo de ley)" },
  { valor: 50, etiqueta: "50%" },
  { valor: 100, etiqueta: "100%" },
];

function fmtMoneda(n: number): string {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("es-MX", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export default function CalculadoraPrimaVacacional() {
  const [salarioMensual, setSalarioMensual] = useState("");
  const [diasVacaciones, setDiasVacaciones] = useState(12);
  const [porcentaje, setPorcentaje] = useState(25);
  const [infoAbierta, setInfoAbierta] = useState(false);

  const salarioNum = parseFloat(salarioMensual.replace(/,/g, "")) || 0;
  const salarioDiario = salarioNum / 30;
  const primaVacacional = salarioDiario * diasVacaciones * (porcentaje / 100);

  const hayResultado = salarioNum > 0;

  return (
    <div className="space-y-6">
      {/* Calculadora */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label htmlFor="salarioMensual" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Salario mensual bruto
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                id="salarioMensual"
                type="text"
                inputMode="decimal"
                placeholder="15,000"
                value={salarioMensual}
                onChange={(e) => setSalarioMensual(e.target.value)}
                className="w-full pl-7 pr-4 py-2.5 rounded-lg ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm tabular-nums"
              />
            </div>
          </div>

          <div>
            <label htmlFor="diasVac" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Días de vacaciones (según antigüedad)
            </label>
            <select
              id="diasVac"
              value={diasVacaciones}
              onChange={(e) => setDiasVacaciones(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
            >
              {OPCIONES_ANTIGUEDAD.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="porcentajePrima" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Porcentaje de prima vacacional
            </label>
            <select
              id="porcentajePrima"
              value={porcentaje}
              onChange={(e) => setPorcentaje(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
            >
              {OPCIONES_PRIMA.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </div>

          {hayResultado && (
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 space-y-1">
              <p><span className="font-medium">Salario diario:</span> {fmtMoneda(salarioDiario)}</p>
              <p><span className="font-medium">Días de vacaciones:</span> {diasVacaciones}</p>
              <p><span className="font-medium">Porcentaje prima:</span> {porcentaje}%</p>
            </div>
          )}
        </div>

        {/* Resultado */}
        <div className="flex flex-col">
          {hayResultado ? (
            <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 shadow-lg flex-1 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                Prima Vacacional
              </p>
              <p className="mt-2 text-4xl font-black tabular-nums">
                {fmtMoneda(primaVacacional)}
              </p>
              <p className="text-emerald-200 text-sm mt-1">monto a recibir</p>

              <div className="mt-5 pt-4 border-t border-emerald-500/40 space-y-3 text-sm">
                <div>
                  <p className="text-emerald-200 text-xs font-medium mb-1">Paso 1: Salario diario</p>
                  <p className="font-semibold tabular-nums">
                    {fmtMoneda(salarioNum)} ÷ 30 = {fmtMoneda(salarioDiario)}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-200 text-xs font-medium mb-1">Paso 2: Salario por días de vacaciones</p>
                  <p className="font-semibold tabular-nums">
                    {fmtMoneda(salarioDiario)} × {diasVacaciones} días = {fmtMoneda(salarioDiario * diasVacaciones)}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-200 text-xs font-medium mb-1">Paso 3: Aplicar porcentaje de prima</p>
                  <p className="font-semibold tabular-nums">
                    {fmtMoneda(salarioDiario * diasVacaciones)} × {porcentaje}% = {fmtMoneda(primaVacacional)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-6 flex-1 flex items-center justify-center">
              <p className="text-sm text-slate-500 text-center">
                Ingresa tu salario mensual para calcular la prima vacacional
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desplegable de información */}
      <div className="rounded-xl ring-1 ring-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setInfoAbierta(!infoAbierta)}
          className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
        >
          <span className="text-sm font-bold text-slate-900">
            ¿Cuándo y cómo se paga la prima vacacional?
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
              <span className="font-semibold text-slate-800">¿Quién tiene derecho?</span> Todo trabajador
              que haya cumplido al menos un año de servicios. Se genera proporcionalmente si no se ha
              completado el año al momento de la separación.
            </p>
            <p>
              <span className="font-semibold text-slate-800">¿Cuándo se paga?</span> Debe pagarse antes de
              que el trabajador inicie su periodo vacacional. Algunas empresas la pagan en la quincena
              correspondiente o junto con el aguinaldo (no es obligatorio así).
            </p>
            <p>
              <span className="font-semibold text-slate-800">¿Es obligatoria?</span> Sí. El artículo 80
              de la LFT establece que los trabajadores tendrán derecho a una prima no menor al 25% sobre
              los salarios que les correspondan durante el periodo de vacaciones.
            </p>
            <p>
              <span className="font-semibold text-slate-800">¿Causa ISR?</span> Sí, pero tiene una exención
              de hasta 15 UMAs diarias. El excedente se grava como ingreso ordinario en la nómina.
            </p>
          </div>
        )}
      </div>

      {/* Tabla de días de vacaciones LFT */}
      <div className="overflow-hidden rounded-xl ring-1 ring-slate-200 bg-white">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Tabla de días de vacaciones por antigüedad
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ley Federal del Trabajo 2026 (Art. 76 reformado)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Años trabajados</th>
                <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Días de vacaciones</th>
                <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Prima 25%</th>
                <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Prima 50%</th>
                <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Prima 100%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TABLA_VACACIONES.map((row) => (
                <tr key={row.rango} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-700 font-medium">{row.rango}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-900 font-semibold">{row.dias}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-700">
                    {fmt(row.dias * 0.25)} días
                  </td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-700">
                    {fmt(row.dias * 0.5)} días
                  </td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-700">
                    {fmt(row.dias * 1.0)} días
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            La columna &quot;Prima&quot; muestra la equivalencia en días de salario que se pagan como prima vacacional según el porcentaje de tu empresa.
          </p>
        </div>
      </div>

      {/* Referencia al blog del SDI */}
      <div className="rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 ring-1 ring-sky-200/60 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">
            ¿Sabías que la prima vacacional impacta tu Salario Diario Integrado?
          </p>
          <p className="text-sm text-slate-600 mt-0.5">
            Descubre qué es el SDI, cómo se calcula y por qué es importante para tus prestaciones del IMSS, pensiones e incapacidades.
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

      {/* Referencia a calculadora SDI */}
      <div className="rounded-xl ring-1 ring-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" x2="16" y1="6" y2="6" />
            <line x1="16" x2="16" y1="14" y2="18" />
            <path d="M16 10h.01" />
            <path d="M12 10h.01" />
            <path d="M8 10h.01" />
            <path d="M12 14h.01" />
            <path d="M8 14h.01" />
            <path d="M12 18h.01" />
            <path d="M8 18h.01" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">
            Calcula tu Salario Diario Integrado completo
          </p>
          <p className="text-sm text-slate-600 mt-0.5">
            Incluye aguinaldo, vacaciones y prima vacacional para obtener tu SDI exacto con el factor de integración 2026.
          </p>
        </div>
        <Link
          href="/herramientas/salario-diario-integrado"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          Calcular SDI
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

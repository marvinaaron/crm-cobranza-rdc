"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImporteConZoom from "@/components/ImporteConZoom";
import CalculadoraUsoEnvoltorio from "@/components/publico/CalculadoraUsoEnvoltorio";
import { useCalculadoraUso } from "@/context/CalculadoraUsoContext";
import { parseMontoInput } from "@/lib/monto-input";
import "@/components/publico/herramienta-tabla.css";

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
  { antiguedad: "1 año", dias: 12, factor25: 1.0493, factor50: 1.0575, factor100: 1.074 },
  { antiguedad: "2 años", dias: 14, factor25: 1.0507, factor50: 1.0603, factor100: 1.0795 },
  { antiguedad: "3 años", dias: 16, factor25: 1.0521, factor50: 1.063, factor100: 1.0849 },
  { antiguedad: "4 años", dias: 18, factor25: 1.0534, factor50: 1.0658, factor100: 1.0904 },
  { antiguedad: "5 años", dias: 20, factor25: 1.0548, factor50: 1.0685, factor100: 1.0959 },
  { antiguedad: "6-10 años", dias: 22, factor25: 1.0562, factor50: 1.0712, factor100: 1.1014 },
  { antiguedad: "11-15 años", dias: 24, factor25: 1.0575, factor50: 1.074, factor100: 1.1068 },
  { antiguedad: "16-20 años", dias: 26, factor25: 1.0589, factor50: 1.0767, factor100: 1.1123 },
  { antiguedad: "21-25 años", dias: 28, factor25: 1.0603, factor50: 1.0795, factor100: 1.1178 },
  { antiguedad: "26-30 años", dias: 30, factor25: 1.0616, factor50: 1.0822, factor100: 1.1233 },
  { antiguedad: "31-35 años", dias: 32, factor25: 1.063, factor50: 1.0849, factor100: 1.1288 },
];

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtMoneda(n: number): string {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

type Resultado = {
  salarioDiario: number;
  factor: number;
  sdi: number;
  diasVacaciones: number;
  diasAguinaldo: number;
  primaVacacional: number;
};

export default function CalculadoraSdi() {
  return (
    <CalculadoraUsoEnvoltorio herramienta="sdi">
      <CalculadoraSdiPanel />
    </CalculadoraUsoEnvoltorio>
  );
}

function CalculadoraSdiPanel() {
  const [modo, setModo] = useState<"mensual" | "diario">("mensual");
  const [salarioTexto, setSalarioTexto] = useState("");
  const [antiguedad, setAntiguedad] = useState("1");
  const [primaVacacional, setPrimaVacacional] = useState(0.25);
  const [infoAbierta, setInfoAbierta] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [copiado, setCopiado] = useState(false);
  const { consumirIntento, abrirPaywall } = useCalculadoraUso();

  useEffect(() => {
    setResultado(null);
  }, [modo, salarioTexto, antiguedad, primaVacacional]);

  const salarioNum = parseMontoInput(salarioTexto);
  const formularioCompleto = Number.isFinite(salarioNum) && salarioNum > 0;
  const diasVacaciones = DIAS_VACACIONES[antiguedad] ?? 12;
  const diasAguinaldo = 15;

  const calcular = async () => {
    if (!formularioCompleto) return;
    const { ok } = await consumirIntento();
    if (!ok) {
      abrirPaywall();
      return;
    }
    const salarioDiario = modo === "mensual" ? salarioNum / 30 : salarioNum;
    const factor =
      (365 + diasAguinaldo + diasVacaciones * primaVacacional) / 365;
    setResultado({
      salarioDiario,
      factor,
      sdi: salarioDiario * factor,
      diasVacaciones,
      diasAguinaldo,
      primaVacacional,
    });
  };

  const limpiar = () => {
    setSalarioTexto("");
    setAntiguedad("1");
    setPrimaVacacional(0.25);
    setModo("mensual");
    setResultado(null);
  };

  const copiar = async () => {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(resultado.sdi.toFixed(2));
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sin clipboard */
    }
  };

  return (
    <div className="space-y-6">
      <div className="hz-cols">
        <div className="hz-col">
          <div>
            <p className="hz-label">Tipo de salario</p>
            <div className="hz-chips" role="group" aria-label="Tipo de salario">
              <button
                type="button"
                className="hz-chip"
                data-on={modo === "mensual" ? "" : undefined}
                onClick={() => setModo("mensual")}
              >
                Mensual
              </button>
              <button
                type="button"
                className="hz-chip"
                data-on={modo === "diario" ? "" : undefined}
                onClick={() => setModo("diario")}
              >
                Diario
              </button>
            </div>
          </div>

          <div>
            <label className="hz-label" htmlFor="sdi-salario">
              Salario {modo === "mensual" ? "mensual bruto" : "diario"}
            </label>
            <ImporteConZoom
              id="sdi-salario"
              value={salarioTexto}
              onChange={setSalarioTexto}
              onEnter={() => void calcular()}
              ariaLabel={
                modo === "mensual"
                  ? "Salario mensual bruto en pesos"
                  : "Salario diario en pesos"
              }
            />
            <p className="hz-ayuda">
              {modo === "mensual"
                ? "Se convierte a diario ÷ 30 para el factor."
                : "Monto diario antes de integrar prestaciones."}
            </p>
          </div>

          <div>
            <label className="hz-label" htmlFor="sdi-antiguedad">
              Antigüedad laboral
            </label>
            <div className="hz-campo-ico">
              <IcoCalendario />
              <select
                id="sdi-antiguedad"
                value={antiguedad}
                onChange={(e) => setAntiguedad(e.target.value)}
                className="hz-control"
              >
                {OPCIONES_ANTIGUEDAD.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="hz-label" htmlFor="sdi-prima">
              Prima vacacional
            </label>
            <div className="hz-campo-ico">
              <IcoPorcentaje />
              <select
                id="sdi-prima"
                value={primaVacacional}
                onChange={(e) => setPrimaVacacional(parseFloat(e.target.value))}
                className="hz-control"
              >
                {OPCIONES_PRIMA.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hz-caja">
            <p className="hz-ayuda" style={{ margin: 0 }}>
              <strong>Días de aguinaldo:</strong> {diasAguinaldo} (mínimo de
              ley)
            </p>
            <p className="hz-ayuda">
              <strong>Días de vacaciones:</strong> {diasVacaciones} (según
              antigüedad, LFT 2026)
            </p>
          </div>

          <div className="hz-acciones">
            <button
              type="button"
              onClick={limpiar}
              className="hz-btn"
              data-ghost=""
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => void calcular()}
              disabled={!formularioCompleto}
              className="hz-btn"
              data-calcular=""
            >
              <IcoCalc size={18} />
              {formularioCompleto ? "Calcular SDI" : "Captura tu salario"}
            </button>
          </div>
        </div>

        <div className="hz-col">
          {resultado ? (
            <div className="hz-resultado space-y-3">
              <p className="hz-label">Salario Diario Integrado</p>
              <div className="hz-caja" data-chispa="">
                <div className="flex items-center gap-1.5">
                  <p className="hz-monto">{fmtMoneda(resultado.sdi)}</p>
                  <button
                    type="button"
                    onClick={() => void copiar()}
                    className="hz-copiar"
                    aria-label={
                      copiado ? "SDI copiado" : "Copiar SDI al portapapeles"
                    }
                    title={copiado ? "Copiado" : "Copiar"}
                  >
                    {copiado ? <CheckCopiar /> : <IconoCopiar />}
                  </button>
                </div>
                <p className="hz-ayuda">por día</p>
              </div>

              <div className="hz-caja">
                <div className="hz-fila" data-2="">
                  <div>
                    <p className="hz-label">Salario diario</p>
                    <p className="hz-monto" style={{ fontSize: "1.15rem" }}>
                      {fmtMoneda(resultado.salarioDiario)}
                    </p>
                  </div>
                  <div>
                    <p className="hz-label">Factor</p>
                    <p className="hz-monto" style={{ fontSize: "1.15rem" }}>
                      {fmt(resultado.factor, 4)}
                    </p>
                  </div>
                </div>
                <p className="hz-ayuda">
                  (365 + {resultado.diasAguinaldo} + {resultado.diasVacaciones}{" "}
                  × {(resultado.primaVacacional * 100).toFixed(0)}%) ÷ 365 ={" "}
                  {fmt(resultado.factor, 4)}
                </p>
                <p className="hz-ayuda">
                  SDI = {fmtMoneda(resultado.salarioDiario)} ×{" "}
                  {fmt(resultado.factor, 4)}
                </p>
              </div>
            </div>
          ) : (
            <div className="hz-vacio">
              <p>Ingresa tu salario y pulsa Calcular SDI</p>
            </div>
          )}
        </div>
      </div>

      <div className="hz-caja" style={{ padding: 0, overflow: "hidden" }}>
        <button
          type="button"
          onClick={() => setInfoAbierta(!infoAbierta)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left"
        >
          <span className="text-sm font-extrabold tracking-tight text-[var(--hz-campo)]">
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
            className={`text-[var(--hz-mute)] transition-transform ${infoAbierta ? "rotate-180" : ""}`}
            aria-hidden
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {infoAbierta ? (
          <div className="px-4 pb-4 space-y-2.5 text-sm text-[var(--hz-mute)] border-t border-[color-mix(in_srgb,var(--hz-campo)_10%,transparent)]">
            <p>
              <strong className="text-[var(--hz-campo)]">
                Revisa tu contrato laboral
              </strong>{" "}
              para conocer tus prestaciones exactas. Algunas empresas otorgan
              más de 15 días de aguinaldo o prima superior al 25%.
            </p>
            <p>
              <strong className="text-[var(--hz-campo)]">Pregunta en RRHH</strong>{" "}
              sobre tu porcentaje de prima y si tienes prestaciones adicionales
              que integren al salario.
            </p>
            <p>
              <strong className="text-[var(--hz-campo)]">
                El factor mínimo 2026 es 1.0493
              </strong>{" "}
              (1 año, 15 días de aguinaldo, 12 de vacaciones con 25% de prima).
            </p>
            <p>
              <strong className="text-[var(--hz-campo)]">
                El SDI se reporta al IMSS
              </strong>{" "}
              y es la base de cuotas, incapacidades, pensiones y liquidaciones.
            </p>
          </div>
        ) : null}
      </div>

      <div className="tb-grupo">
        <div className="tb-grupo-head">
          <b>Tabla de factores de integración 2026</b>
          <span>Prestaciones mínimas de ley: 15 días de aguinaldo</span>
        </div>
        <div className="tb-hoja">
          <table>
            <thead>
              <tr>
                <th>Antigüedad</th>
                <th>Días vac.</th>
                <th>Factor 25%</th>
                <th>Factor 50%</th>
                <th>Factor 100%</th>
              </tr>
            </thead>
            <tbody>
              {TABLA_FACTOR.map((row) => (
                <tr key={row.antiguedad}>
                  <td>{row.antiguedad}</td>
                  <td>{row.dias}</td>
                  <td data-pct="">{row.factor25.toFixed(4)}</td>
                  <td data-pct="">{row.factor50.toFixed(4)}</td>
                  <td data-pct="">{row.factor100.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hz-caja flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-[var(--hz-campo)]">
            ¿Quieres entender a fondo cómo funciona el SDI?
          </p>
          <p className="hz-ayuda" style={{ marginTop: "0.25rem" }}>
            Artículo con ejemplos, tablas y todo lo que necesitas saber del SDI
            2026.
          </p>
        </div>
        <Link href="/blog/que-es-el-salario-diario-integrado-sdi-2026" className="hz-btn">
          Leer artículo
        </Link>
      </div>

      <div className="hz-caja flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-[var(--hz-campo)]">
            ¿Necesitas calcular la prima vacacional por separado?
          </p>
          <p className="hz-ayuda" style={{ marginTop: "0.25rem" }}>
            Calculadora de prima vacacional según la LFT 2026.
          </p>
        </div>
        <Link href="/herramientas/prima-vacacional" className="hz-btn" data-ghost="">
          Calcular prima
        </Link>
      </div>
    </div>
  );
}

function IcoCalendario() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 2v4M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function IcoPorcentaje() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function IcoCalc({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h8" />
    </svg>
  );
}

function IconoCopiar() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="7" y="3" width="10" height="12" rx="2" />
      <path d="M13 17H5a2 2 0 0 1-2-2V7" />
    </svg>
  );
}

function CheckCopiar() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 10l3 3 7-7" />
    </svg>
  );
}

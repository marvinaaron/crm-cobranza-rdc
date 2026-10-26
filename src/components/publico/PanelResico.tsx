"use client";

import { useEffect, useState } from "react";
import ImporteConZoom from "@/components/ImporteConZoom";
import IconoCalcResico from "@/components/publico/IconoCalcResico";
import { useCalculadoraUso } from "@/context/CalculadoraUsoContext";
import { RET_ISR_RESICO } from "@/lib/fiscal/facturacion-tablas";
import {
  calcularIsrResico,
  fmtMxn,
  fmtTasa,
  LIMITE_MENSUAL_RESICO,
  TARIFA_RESICO,
  tramoResico,
  type ResultadoResico,
} from "@/lib/fiscal/resico";
import { formatMontoDesdeNumero, parseMontoInput } from "@/lib/monto-input";

function fmtRango(n: number): string {
  return n.toLocaleString("es-MX", { maximumFractionDigits: 0 });
}

function etiquetaTramo(i: number): string {
  const t = TARIFA_RESICO[i];
  if (t.limiteSuperior === null) {
    return `Más de $${fmtRango(TARIFA_RESICO[i - 1]?.limiteSuperior ?? 0)}`;
  }
  if (i === 0) return `Hasta $${fmtRango(t.limiteSuperior)}`;
  return `$${fmtRango(t.limiteInferior)} – $${fmtRango(t.limiteSuperior)}`;
}

const MUESTRA_TRAMO = [15_000, 40_000, 65_000, 120_000, 250_000];

type Resultado = ResultadoResico | null;

export default function PanelResico() {
  const [ingresoTexto, setIngresoTexto] = useState("");
  const [resultado, setResultado] = useState<Resultado>(null);
  const [copiado, setCopiado] = useState(false);
  const { consumirIntento, abrirPaywall } = useCalculadoraUso();

  useEffect(() => {
    setResultado(null);
  }, [ingresoTexto]);

  const ingresoNum = parseMontoInput(ingresoTexto);
  const formularioCompleto = Number.isFinite(ingresoNum) && ingresoNum > 0;

  const exito = resultado && resultado.ok ? resultado : null;
  const errorMsg = resultado && !resultado.ok ? resultado.error : null;
  const indiceActivo = formularioCompleto
    ? tramoResico(ingresoNum).indice
    : exito?.indiceTramo;

  const calcular = async () => {
    if (!formularioCompleto) return;
    const { ok } = await consumirIntento();
    if (!ok) {
      abrirPaywall();
      return;
    }
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

  const retencion = exito
    ? Math.round(exito.ingreso * RET_ISR_RESICO * 100) / 100
    : 0;
  const aPagar = exito ? Math.round((exito.isr - retencion) * 100) / 100 : 0;

  return (
    <div className="space-y-6">
      <div className="hz-cols">
        <div className="hz-col">
          <div>
            <label className="hz-label" htmlFor="ingreso-resico">
              Ingreso del mes (facturado)
            </label>
            <ImporteConZoom
              id="ingreso-resico"
              value={ingresoTexto}
              onChange={setIngresoTexto}
              onEnter={calcular}
              ariaLabel="Ingreso mensual en pesos"
            />
            <p className="hz-ayuda">
              Total de ingresos del mes amparados por CFDI.
            </p>
          </div>

          <div className="hz-acciones">
            <button type="button" onClick={limpiar} className="hz-btn" data-ghost="">
              Limpiar
            </button>
            <button
              type="button"
              onClick={calcular}
              disabled={!formularioCompleto}
              className="hz-btn"
              data-calcular=""
            >
              <IconoCalcResico size={18} />
              {formularioCompleto ? "Calcular ISR" : "Captura tu ingreso"}
            </button>
          </div>

          {exito ? (
            <div className="hz-retencion">
              <p className="hz-label">Retenciones</p>
              <p>
                Hay actividades que retienen el <strong>1.25%</strong> del
                subtotal:
              </p>
              <p className="hz-formula">
                {fmtMxn(exito.ingreso)} × 1.25% = {fmtMxn(retencion)} retenido
              </p>
              <p className="hz-formula">
                {fmtMxn(exito.isr)} − {fmtMxn(retencion)} ={" "}
                {fmtMxn(aPagar)}
              </p>
              <p>
                {aPagar > 0 ? (
                  <>
                    Ese <strong>{fmtMxn(aPagar)}</strong> es lo que pagarías al SAT
                    este mes, ya descontada la retención.
                  </>
                ) : aPagar === 0 ? (
                  <>
                    La retención cubre el ISR. Este mes no tendrías que pagar.
                  </>
                ) : (
                  <>
                    La retención ya cubrió el ISR. Queda un saldo a favor de{" "}
                    <strong>{fmtMxn(Math.abs(aPagar))}</strong>.
                  </>
                )}
              </p>
            </div>
          ) : null}
        </div>

        <div className="hz-col">
          {exito ? (
            <div className="hz-resultado space-y-3">
              <p className="hz-label">ISR del mes</p>
              <div className="hz-caja">
                <div className="flex items-center gap-1.5">
                  <p className="hz-monto">{fmtMxn(exito.isr)}</p>
                  <button
                    type="button"
                    onClick={copiar}
                    className="hz-copiar"
                    aria-label={copiado ? "ISR copiado" : "Copiar ISR al portapapeles"}
                    title={copiado ? "Copiado" : "Copiar"}
                  >
                    {copiado ? <CheckCopiar /> : <IconoCopiar />}
                  </button>
                </div>
                <p className="hz-ayuda">
                  {fmtMxn(exito.ingreso)} × {fmtTasa(exito.tasa)}
                </p>
              </div>
              {exito.excedeLimiteMensual && (
                <div className="hz-alerta">
                  <p>
                    Este mes superas{" "}
                    <strong>{fmtMxn(LIMITE_MENSUAL_RESICO)}</strong>. Cuenta el
                    acumulado del año (máx. $3,500,000).
                  </p>
                </div>
              )}
            </div>
          ) : errorMsg ? (
            <p className="hz-ayuda">{errorMsg}</p>
          ) : null}

          <div>
            <p className="hz-label">Tasas 2026 · Art. 113-E</p>
            <div className="hz-tramos" role="list">
              {TARIFA_RESICO.map((t, i) => (
                <button
                  key={t.tasa}
                  type="button"
                  className="hz-tramo"
                  data-on={indiceActivo === i ? "" : undefined}
                  onClick={() =>
                    setIngresoTexto(formatMontoDesdeNumero(MUESTRA_TRAMO[i]))
                  }
                >
                  <b>{fmtTasa(t.tasa)}</b>
                  <span>{etiquetaTramo(i)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="hz-ayuda">
        Cálculo de referencia conforme al artículo 113-E de la LISR. El RESICO no
        permite deducciones y tiene un límite anual de $3,500,000.
      </p>
    </div>
  );
}

function IconoCopiar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckCopiar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

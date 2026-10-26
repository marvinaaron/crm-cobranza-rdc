"use client";

import { useEffect, useMemo, useState } from "react";
import ImporteConZoom from "@/components/ImporteConZoom";
import IconoRecargosNav from "@/components/publico/IconoRecargosNav";
import {
  TASA_MORA_2018_2025,
  TASA_MORA_2026,
  buscarInpc,
  calcularAdeudoSat,
  etiquetaMesAnio,
  mesAnterior,
  type PeriodoMes,
  type ResultadoAdeudoSat,
} from "@/lib/fiscal/adeudo-sat";
import { INPC_FALLBACK, type RegistroInpc } from "@/lib/fiscal/inpc";
import { parseMontoInput } from "@/lib/monto-input";

const MESES = [
  { valor: 1, etiqueta: "Enero" },
  { valor: 2, etiqueta: "Febrero" },
  { valor: 3, etiqueta: "Marzo" },
  { valor: 4, etiqueta: "Abril" },
  { valor: 5, etiqueta: "Mayo" },
  { valor: 6, etiqueta: "Junio" },
  { valor: 7, etiqueta: "Julio" },
  { valor: 8, etiqueta: "Agosto" },
  { valor: 9, etiqueta: "Septiembre" },
  { valor: 10, etiqueta: "Octubre" },
  { valor: 11, etiqueta: "Noviembre" },
  { valor: 12, etiqueta: "Diciembre" },
];

function hoyMexico(): PeriodoMes {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const num = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { anio: num("year"), mes: num("month") };
}

function fmtMoneda(n: number): string {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function fmtPct(n: number, decimales = 2): string {
  return `${(n * 100).toLocaleString("es-MX", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })}%`;
}

function fmtInpc(n: number): string {
  return n.toLocaleString("es-MX", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}

export default function CalculadoraSat() {
  const hoy = useMemo(() => hoyMexico(), []);
  const anios = useMemo(() => {
    const list: number[] = [];
    for (let a = 2016; a <= hoy.anio + 1; a += 1) list.push(a);
    return list;
  }, [hoy.anio]);

  const [monto, setMonto] = useState("");
  const [vencimiento, setVencimiento] = useState<PeriodoMes>({
    anio: hoy.anio - 1,
    mes: 5,
  });
  const [pago, setPago] = useState<PeriodoMes>(hoy);
  const [serie, setSerie] = useState<RegistroInpc[]>(INPC_FALLBACK);
  const [inpcListo, setInpcListo] = useState(false);
  const [errorInpc, setErrorInpc] = useState<string | null>(null);
  const [errorCalc, setErrorCalc] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoAdeudoSat | null>(null);

  useEffect(() => {
    let activo = true;
    fetch("/api/fiscal/inpc")
      .then((r) => {
        if (!r.ok) throw new Error("INPC no disponible");
        return r.json();
      })
      .then((data: { serie?: RegistroInpc[] }) => {
        if (!activo) return;
        if (data?.serie?.length) setSerie(data.serie);
        setErrorInpc(null);
      })
      .catch(() => {
        if (!activo) return;
        setErrorInpc(
          "No se pudo consultar INEGI. Usamos el INPC de respaldo; el estimado puede desfasarse.",
        );
      })
      .finally(() => {
        if (activo) setInpcListo(true);
      });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    setResultado(null);
    setErrorCalc(null);
  }, [monto, vencimiento, pago]);

  function etiquetaInpc(periodo: PeriodoMes): { etiqueta: string; valor: string } {
    const ref = mesAnterior(periodo.anio, periodo.mes);
    const found = buscarInpc(serie, ref.anio, ref.mes);
    if (!found) {
      return { etiqueta: etiquetaMesAnio(ref.anio, ref.mes), valor: "no disponible" };
    }
    return {
      etiqueta: etiquetaMesAnio(found.anio, found.mes),
      valor: `${fmtInpc(found.valor)}${found.aproximado ? " (último disponible)" : ""}`,
    };
  }

  const netoNum = parseMontoInput(monto);
  const formularioCompleto = Number.isFinite(netoNum) && netoNum > 0 && inpcListo;

  function calcular() {
    if (!formularioCompleto) return;
    setErrorCalc(null);
    const out = calcularAdeudoSat({
      impuestoHistorico: netoNum,
      vencimiento,
      pago,
      serieInpc: serie,
    });
    if ("error" in out) {
      setResultado(null);
      setErrorCalc(out.error);
    } else {
      setResultado(out);
    }
  }

  const inpcVenc = etiquetaInpc(vencimiento);
  const inpcPago = etiquetaInpc(pago);

  return (
    <div className="space-y-6">
      <div className="hz-cols">
        <div className="hz-col">
          <div>
            <label className="hz-label" htmlFor="monto-omitido">
              Impuesto omitido
            </label>
            <ImporteConZoom
              id="monto-omitido"
              value={monto}
              onChange={setMonto}
              onEnter={calcular}
              ariaLabel="Monto del impuesto omitido"
            />
          </div>

          <SelectorPeriodo
            id="vencimiento"
            label="Debió pagarse"
            valor={vencimiento}
            anios={anios}
            inpc={inpcVenc}
            onChange={setVencimiento}
          />
          <SelectorPeriodo
            id="pago"
            label="Pago proyectado"
            valor={pago}
            anios={anios}
            inpc={inpcPago}
            onChange={setPago}
          />

          <div className="hz-acciones">
            <button
              type="button"
              onClick={() => {
                setMonto("");
                setResultado(null);
                setErrorCalc(null);
              }}
              className="hz-btn"
              data-ghost=""
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={calcular}
              disabled={!formularioCompleto}
              className="hz-btn"
              data-calcular=""
            >
              <IconoRecargosNav size={18} />
              {formularioCompleto ? "Calcular adeudo" : "Captura el monto"}
            </button>
          </div>
          {errorInpc ? <p className="hz-ayuda">{errorInpc}</p> : null}
          {errorCalc ? <p className="hz-ayuda">{errorCalc}</p> : null}
        </div>

        <div className="hz-col">
          <p className="hz-label">Total estimado</p>
          {resultado ? (
            <div className="hz-resultado space-y-3">
              <div className="hz-caja" data-cinta="">
                <p className="hz-monto">{fmtMoneda(resultado.total)}</p>
                <p className="hz-ayuda">
                  {fmtMoneda(resultado.impuestoHistorico)} + actualización + recargos.
                  Sin multas.
                </p>
              </div>
            </div>
          ) : (
            <div className="hz-vacio">
              <p>
                {formularioCompleto
                  ? "Listo. Calcula el adeudo."
                  : "Captura el monto y calcula."}
              </p>
              <span>Arts. 17-A y 21 del CFF · mes calendario, no el día.</span>
            </div>
          )}
        </div>
      </div>

      <div className="hz-cfdi">
        <div className="hz-cfdi-top">
          <p>Cómo se arma el adeudo</p>
        </div>
        <div className="hz-vence-flujo" aria-label="Pasos del adeudo SAT">
          <div className="hz-vence-paso" data-on="">
            <b>Impuesto</b>
            <strong>
              {resultado ? fmtMoneda(resultado.impuestoHistorico) : "—"}
            </strong>
            <span>histórico omitido</span>
          </div>
          <span className="hz-vence-flecha" aria-hidden>
            →
          </span>
          <div className="hz-vence-paso" data-on={resultado ? "" : undefined}>
            <b>Actualización</b>
            <strong>
              {resultado ? fmtMoneda(resultado.actualizacion) : "+?"}
            </strong>
            <span>INPC art. 17-A</span>
          </div>
          <span className="hz-vence-flecha" aria-hidden>
            →
          </span>
          <div className="hz-vence-paso" data-on={resultado ? "" : undefined}>
            <b>Recargos</b>
            <strong>
              {resultado ? fmtMoneda(resultado.recargos) : "+?"}
            </strong>
            <span>
              {resultado
                ? `${resultado.mesesRecargo} mes${resultado.mesesRecargo === 1 ? "" : "es"} · art. 21`
                : "mora por mes"}
            </span>
          </div>
        </div>

        <div className="hz-cfdi-filas" style={{ marginTop: "0.85rem" }}>
          <Fila
            etiqueta="Monto"
            valor={resultado ? fmtMoneda(resultado.impuestoHistorico) : "$ —"}
            vacio={!resultado}
          />
          <Fila
            etiqueta="Actualización"
            valor={resultado ? fmtMoneda(resultado.actualizacion) : "$ —"}
            vacio={!resultado}
          />
          <Fila
            etiqueta="Impuesto actualizado"
            valor={resultado ? fmtMoneda(resultado.impuestoActualizado) : "$ —"}
            vacio={!resultado}
          />
          <Fila
            etiqueta="Recargos"
            valor={resultado ? fmtMoneda(resultado.recargos) : "$ —"}
            vacio={!resultado}
          />
          <Fila
            etiqueta="Total a pagar"
            valor={resultado ? fmtMoneda(resultado.total) : "$ —"}
            vacio={!resultado}
            neto
          />
        </div>
        <p className="hz-cfdi-nota">
          {resultado && !resultado.mismoMes ? (
            <>
              FA <strong>{resultado.factorActualizacion.toFixed(4)}</strong> = INPC{" "}
              {etiquetaMesAnio(resultado.inpcPago.anio, resultado.inpcPago.mes)} ÷ INPC{" "}
              {etiquetaMesAnio(
                resultado.inpcVencimiento.anio,
                resultado.inpcVencimiento.mes,
              )}
              . Recargos por mes calendario, no por el día.
            </>
          ) : (
            <>
              Primero se actualiza con el <strong>INPC</strong> y luego se suman
              recargos por cada mes de atraso. En 2026 la mora es{" "}
              <strong>{fmtPct(TASA_MORA_2026)}</strong> al mes.
            </>
          )}
        </p>
      </div>

      <div className="hz-vence">
        <div className="hz-vence-top">
          <p>Tasa de mora mensual</p>
        </div>
        <div className="hz-vence-tabla" data-2="">
          <div className="hz-vence-celda">
            <b>2018–2025</b>
            <strong>{fmtPct(TASA_MORA_2018_2025)}</strong>
            <span>LIF + art. 21 CFF</span>
          </div>
          <div className="hz-vence-celda" data-on="">
            <b>2026</b>
            <strong>{fmtPct(TASA_MORA_2026)}</strong>
            <span>1.38% × 1.50 · RMF 2.1.20</span>
          </div>
        </div>
        <p className="hz-vence-nota">
          Del mes siguiente al vencimiento hasta el mes de pago. El día 1, 15 o 30
          da el mismo recargo; si te pasas al mes siguiente, se suma otro mes.
        </p>
      </div>

      <p className="hz-ayuda">
        Estimado informativo. No sustituye la línea de captura del SAT ni incluye
        multas ni gastos de ejecución.
      </p>
    </div>
  );
}

function SelectorPeriodo({
  id,
  label,
  valor,
  anios,
  inpc,
  onChange,
}: {
  id: string;
  label: string;
  valor: PeriodoMes;
  anios: number[];
  inpc: { etiqueta: string; valor: string };
  onChange: (v: PeriodoMes) => void;
}) {
  return (
    <div>
      <p className="hz-label">{label}</p>
      <div className="hz-fila" data-2="">
        <div className="hz-campo-ico">
          <IcoCalendario />
          <select
            id={`${id}-mes`}
            className="hz-control"
            value={valor.mes}
            onChange={(e) => onChange({ ...valor, mes: Number(e.target.value) })}
            aria-label={`${label}, mes`}
          >
            {MESES.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.etiqueta}
              </option>
            ))}
          </select>
        </div>
        <div className="hz-campo-ico">
          <IcoCalendario />
          <select
            id={`${id}-anio`}
            className="hz-control"
            value={valor.anio}
            onChange={(e) => onChange({ ...valor, anio: Number(e.target.value) })}
            aria-label={`${label}, año`}
          >
            {anios.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="hz-ayuda">
        INPC de {inpc.etiqueta}: {inpc.valor}
      </p>
    </div>
  );
}

function Fila({
  etiqueta,
  valor,
  vacio,
  neto,
}: {
  etiqueta: string;
  valor: string;
  vacio?: boolean;
  neto?: boolean;
}) {
  return (
    <div
      className="hz-cfdi-fila"
      data-mute={vacio ? "" : undefined}
      data-neto={neto ? "" : undefined}
    >
      <span>{etiqueta}</span>
      <b>{valor}</b>
    </div>
  );
}

function IcoCalendario() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="5.5" width="16" height="14" rx="2.2" />
      <path d="M8 3.8v3.2M16 3.8v3.2M4 10h16" />
    </svg>
  );
}

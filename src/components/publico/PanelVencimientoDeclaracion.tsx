"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import IconoRfcNav from "@/components/publico/IconoRfcNav";
import IconoVencimientoNav from "@/components/publico/IconoVencimientoNav";
import { useCalculadoraUso } from "@/context/CalculadoraUsoContext";
import { tonoHerramienta } from "@/lib/herramienta-tonos";
import { MESES_NOM, type Periodo } from "@/lib/clientes";
import {
  TABLA_SEXTO_DIGITO_SAT,
  diasHabilesPorSextoDigito,
  desgloseVencimientoSAT,
  formatearDiaMesCorto,
  formatearFechaVencimiento,
  sextoDigitoRFC,
  type DesgloseVencimientoSAT,
} from "@/lib/portal/fechas-fiscales";
import "@/components/publico/herramienta-cine.css";

type Props = {
  /** `pagina` = herramienta dedicada; `blog` = embed más compacto en artículo. */
  variante?: "pagina" | "blog";
};

const ANIOS = [2024, 2025, 2026, 2027];

function tipoRfc(rfc: string): "moral" | "fisica" | null {
  const limpio = rfc.toUpperCase().replace(/[^A-ZÑ&0-9]/g, "");
  if (limpio.length === 12) return "moral";
  if (limpio.length === 13) return "fisica";
  return null;
}

function periodoDeclaracionPorDefecto(ahora = new Date()): Periodo {
  const mesActual = ahora.getMonth();
  if (mesActual === 0) return { mes: 11, anio: ahora.getFullYear() - 1 };
  return { mes: mesActual - 1, anio: ahora.getFullYear() };
}

export default function PanelVencimientoDeclaracion({
  variante = "pagina",
}: Props) {
  const periodoInicial = periodoDeclaracionPorDefecto();
  const [rfc, setRfc] = useState("");
  const [mes, setMes] = useState(periodoInicial.mes);
  const [anio, setAnio] = useState(periodoInicial.anio);
  const [resultado, setResultado] = useState<
    DesgloseVencimientoSAT | { error: string } | null
  >(null);
  const { consumirIntento, abrirPaywall, uso } = useCalculadoraUso();
  const sinConsultas = Boolean(uso && !uso.puedeCalcular && !uso.esPro);
  const esBlog = variante === "blog";

  const periodo: Periodo = { mes, anio };
  const sexto = sextoDigitoRFC(rfc);
  const formularioCompleto = rfc.trim().length >= 10;

  useEffect(() => {
    setResultado(null);
  }, [rfc, mes, anio]);

  const error = resultado && "error" in resultado ? resultado.error : null;
  const ok = resultado && !("error" in resultado) ? resultado : null;

  async function calcular() {
    if (!formularioCompleto) return;
    if (sinConsultas) {
      abrirPaywall();
      return;
    }
    const { ok: permitido } = await consumirIntento();
    if (!permitido) {
      abrirPaywall();
      return;
    }
    setResultado(desgloseVencimientoSAT(rfc, periodo));
  }

  const t = tonoHerramienta("vencimiento");
  const vars = {
    "--hz-campo": t.campo,
    "--hz-campo-deep": t.campoDeep,
    "--hz-chispa": t.chispa,
    "--hz-chispa-clara": t.chispaClara,
  } as CSSProperties;

  const cuerpo = (
    <div className="space-y-6">
      <div className="hz-cols">
        <div className="hz-col">
          <div>
            <label className="hz-label" htmlFor="vence-rfc">
              Tu RFC
            </label>
            <div className="hz-campo-ico" data-clear={rfc.length > 0 ? "" : undefined}>
              <IconoRfcNav size={16} />
              <input
                id="vence-rfc"
                type="text"
                value={rfc}
                onChange={(e) => setRfc(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void calcular();
                }}
                placeholder="Ej. LOMA900315AB1"
                maxLength={13}
                className="hz-control"
                data-caps=""
                autoComplete="off"
                spellCheck={false}
              />
              {rfc.length > 0 ? (
                <button
                  type="button"
                  className="hz-campo-clear"
                  onClick={() => setRfc("")}
                  aria-label="Borrar RFC"
                >
                  <IcoCerrar />
                </button>
              ) : null}
            </div>
            <p className="hz-ayuda">
              ¿No lo tienes?{" "}
              <Link href="/herramientas/rfc">Consúltalo con la calculadora de RFC</Link>
              .
            </p>
            {sexto != null ? (
              <div className="hz-digito-vivo">
                <p>Tu 6º dígito</p>
                <code>{resaltarSextoDigito(rfc)}</code>
                <em>
                  +{diasHabilesPorSextoDigito(sexto)} día
                  {diasHabilesPorSextoDigito(sexto) === 1 ? "" : "s"} hábil
                  {diasHabilesPorSextoDigito(sexto) === 1 ? "" : "es"}
                </em>
              </div>
            ) : null}
          </div>

          <div className="hz-fila" data-2="">
            <div>
              <label className="hz-label" htmlFor="vence-mes">
                Mes a declarar
              </label>
              <div className="hz-campo-ico">
                <IcoCalendario />
                <select
                  id="vence-mes"
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="hz-control"
                >
                  {MESES_NOM.map((nombre, i) => (
                    <option key={nombre} value={i}>
                      {nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="hz-label" htmlFor="vence-anio">
                Año del periodo
              </label>
              <div className="hz-campo-ico">
                <IcoCalendario />
                <select
                  id="vence-anio"
                  value={anio}
                  onChange={(e) => setAnio(Number(e.target.value))}
                  className="hz-control"
                >
                  {ANIOS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="hz-acciones">
            <button
              type="button"
              onClick={() => {
                setRfc("");
                setResultado(null);
              }}
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
              <IconoVencimientoNav size={18} />
              {sinConsultas
                ? "Desbloquear con Cliente Pro"
                : formularioCompleto
                  ? "Calcular vencimiento"
                  : "Captura tu RFC"}
            </button>
          </div>
        </div>

        <div className="hz-col">
          <p className="hz-label">Fecha límite SAT</p>
          {ok ? (
            <div className="hz-resultado space-y-3">
              <div className="hz-caja" data-cinta="">
                <p className="hz-monto">{formatearDiaMesCorto(ok.fechaFinal)}</p>
                <p className="hz-ayuda">
                  {formatearFechaVencimiento(ok.fechaFinal)}
                </p>
                <p className="hz-ayuda">
                  Declaración de {ok.nombreMesPeriodo} {anio} · vence en{" "}
                  {ok.nombreMesVencimiento} {ok.anioVencimiento}.
                </p>
              </div>
              {tipoRfc(rfc) ? (
                <div className="hz-caja">
                  <p className="hz-label">
                    {tipoRfc(rfc) === "moral"
                      ? "Anual de persona moral"
                      : "Anual de persona física"}
                  </p>
                  <p className="hz-formula">
                    {tipoRfc(rfc) === "moral"
                      ? `31 de marzo de ${anio + 1}`
                      : `30 de abril de ${anio + 1}`}
                  </p>
                  <p className="hz-ayuda">
                    Ejercicio {anio}. La anual no usa el 6º dígito.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hz-vacio">
              <p>
                {error
                  ? error
                  : formularioCompleto
                    ? "Listo. Calcula tu vencimiento."
                    : "Captura el RFC y calcula tu fecha."}
              </p>
              <span>
                Declaración de {MESES_NOM[mes]} {anio} → vence en{" "}
                {MESES_NOM[(mes + 1) % 12]}
              </span>
            </div>
          )}
        </div>
      </div>

      {!esBlog ? (
        <VenceDesgloseInteractivo
          sexto={sexto}
          ok={ok}
          mesVencimiento={ok?.nombreMesVencimiento}
        />
      ) : null}

      <p className="hz-ayuda">
        Por defecto va el mes anterior al calendario. El cálculo es en tu
        navegador; no guardamos tu RFC.
      </p>
    </div>
  );

  if (!esBlog) return cuerpo;

  return (
    <div className="hz-page" data-hz="vencimiento" style={vars}>
      <div className="hz-panel" style={{ display: "block", paddingBottom: "1.15rem" }}>
        {cuerpo}
      </div>
    </div>
  );
}

function resaltarSextoDigito(rfc: string) {
  const limpio = rfc.toUpperCase().trim();
  const digitos = limpio.match(/\d/g);
  if (!digitos || digitos.length < 6) return limpio;
  let vistos = 0;
  const partes: React.ReactNode[] = [];
  for (let i = 0; i < limpio.length; i += 1) {
    const ch = limpio[i]!;
    if (/\d/.test(ch)) {
      vistos += 1;
      if (vistos === 6) {
        partes.push(
          <span key={i} className="hz-rfc-mark" title="6º dígito numérico">
            {ch}
          </span>,
        );
        continue;
      }
    }
    partes.push(<span key={i}>{ch}</span>);
  }
  return partes;
}

function VenceDesgloseInteractivo({
  sexto,
  ok,
  mesVencimiento,
}: {
  sexto: number | null;
  ok: DesgloseVencimientoSAT | null;
  mesVencimiento?: string;
}) {
  const extras =
    sexto != null ? diasHabilesPorSextoDigito(sexto) : null;
  const mesBase =
    mesVencimiento ??
    (ok ? ok.nombreMesVencimiento : "mes siguiente");

  return (
    <div className="hz-vence">
      <div className="hz-vence-top">
        <p>Cómo se arma tu fecha</p>
      </div>

      <div className="hz-vence-flujo" aria-label="Pasos del vencimiento SAT">
        <div className="hz-vence-paso" data-on="">
          <b>Día base SAT</b>
          <strong>17</strong>
          <span>de {mesBase}</span>
        </div>
        <span className="hz-vence-flecha" aria-hidden>
          →
        </span>
        <div className="hz-vence-paso" data-on={extras != null ? "" : undefined}>
          <b>6º dígito del RFC</b>
          <strong>{extras != null ? `+${extras}` : "+?"}</strong>
          <span>
            {sexto != null
              ? `dígito ${sexto} · días hábiles`
              : "días hábiles extra"}
          </span>
        </div>
        <span className="hz-vence-flecha" aria-hidden>
          →
        </span>
        <div className="hz-vence-paso" data-on={ok ? "" : undefined}>
          <b>Fecha límite</b>
          <strong>
            {ok ? formatearDiaMesCorto(ok.fechaFinal) : "—"}
          </strong>
          <span>
            {ok
              ? ok.huboRecorridoFinDeSemana
                ? "recorrido al siguiente hábil"
                : "sin recorrido"
              : "si cae inhábil, al lunes"}
          </span>
        </div>
      </div>

      <div className="hz-vence-tabla" role="list">
        {TABLA_SEXTO_DIGITO_SAT.map((fila) => {
          const on = extras === fila.dias;
          return (
            <div
              key={fila.rango}
              className="hz-vence-celda"
              data-on={on ? "" : undefined}
              role="listitem"
            >
              <b>{fila.rango}</b>
              <strong>+{fila.dias}</strong>
              <span>
                día{fila.dias === 1 ? "" : "s"} hábil
                {fila.dias === 1 ? "" : "es"}
              </span>
            </div>
          );
        })}
      </div>

      <p className="hz-vence-nota">
        {sexto != null && extras != null ? (
          <>
            El SAT parte del <strong>17</strong> y suma{" "}
            <strong>
              {extras} día{extras === 1 ? "" : "s"} hábil
              {extras === 1 ? "" : "es"}
            </strong>{" "}
            porque tu 6º dígito es <strong>{sexto}</strong>
            {ok?.huboRecorridoFinDeSemana
              ? "; como cayó inhábil, recorre al siguiente hábil."
              : "."}
          </>
        ) : (
          <>
            El SAT parte del día <strong>17</strong> del mes siguiente y suma 1
            a 5 días hábiles según el 6º dígito numérico de tu RFC. Si cae en
            sábado, domingo o festivo, pasa al siguiente hábil.
          </>
        )}
      </p>
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

function IcoCerrar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

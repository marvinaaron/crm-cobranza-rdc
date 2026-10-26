"use client";

import { useEffect, useMemo, useState } from "react";
import {
  INPC_FALLBACK,
  calcularVariacionAnual,
  type RegistroInpc,
} from "@/lib/fiscal/inpc";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

type Rango = "1A" | "2A" | "5A" | "todo";
const PREF = "rdc-inpc-rango";
const RANGOS: Array<{ id: Rango; label: string }> = [
  { id: "1A", label: "1 año" },
  { id: "2A", label: "2 años" },
  { id: "5A", label: "5 años" },
  { id: "todo", label: "Todo" },
];

function curvaSuave(puntos: Array<{ x: number; y: number }>): string {
  if (puntos.length === 0) return "";
  if (puntos.length === 1) return `M ${puntos[0].x} ${puntos[0].y}`;
  let d = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i - 1] ?? puntos[i];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function PanelInpcTabla({
  inicial,
}: {
  inicial?: {
    serie: RegistroInpc[];
    fuente: "INEGI" | "Banxico" | "fallback";
    actualizadoEn: string;
  };
}) {
  const [serie, setSerie] = useState<RegistroInpc[]>(
    inicial?.serie?.length ? inicial.serie : INPC_FALLBACK,
  );
  const [fuente, setFuente] = useState<"INEGI" | "Banxico" | "fallback">(
    inicial?.fuente ?? "fallback",
  );
  const [actualizadoEn, setActualizadoEn] = useState(
    inicial?.actualizadoEn ?? "Datos locales",
  );
  const [cargando, setCargando] = useState(!inicial?.serie?.length);
  const [rango, setRango] = useState<Rango>("5A");

  useEffect(() => {
    try {
      const v = localStorage.getItem(PREF);
      if (v === "1A" || v === "2A" || v === "5A" || v === "todo") setRango(v);
    } catch {
      /* sin storage */
    }
  }, []);

  const cambiarRango = (r: Rango) => {
    setRango(r);
    try {
      localStorage.setItem(PREF, r);
    } catch {
      /* sin storage */
    }
  };

  useEffect(() => {
    let activo = true;
    fetch("/api/fiscal/inpc")
      .then((r) => r.json())
      .then(
        (data: {
          serie: RegistroInpc[];
          fuente: "INEGI" | "Banxico" | "fallback";
          actualizadoEn: string;
        }) => {
          if (!activo) return;
          if (data?.serie?.length) setSerie(data.serie);
          if (data?.fuente) setFuente(data.fuente);
          if (data?.actualizadoEn) setActualizadoEn(data.actualizadoEn);
        },
      )
      .catch(() => {})
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const conVariacion = useMemo(() => calcularVariacionAnual(serie), [serie]);
  const ultimo = conVariacion[conVariacion.length - 1];
  const valoresGrafica = useMemo(() => {
    if (rango === "1A") return conVariacion.slice(-12);
    if (rango === "2A") return conVariacion.slice(-24);
    if (rango === "5A") return conVariacion.slice(-60);
    return conVariacion;
  }, [conVariacion, rango]);

  const variacionMensual = useMemo(() => {
    const idx = conVariacion.length - 1;
    const prev = conVariacion[idx - 1];
    if (!prev || !ultimo) return null;
    return ((ultimo.valor - prev.valor) / prev.valor) * 100;
  }, [conVariacion, ultimo]);

  const porAnio = useMemo(() => {
    const map = new Map<number, Array<number | null>>();
    for (const r of serie) {
      if (!map.has(r.anio)) map.set(r.anio, Array(12).fill(null));
      map.get(r.anio)![r.mes - 1] = r.valor;
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [serie]);

  const fuenteTxt =
    fuente === "INEGI"
      ? "INEGI en vivo"
      : fuente === "Banxico"
        ? "Banxico en vivo"
        : "Datos locales";

  return (
    <>
      <div className="tb-grupo">
        <div className="tb-grupo-head">
          <b>INPC histórico 2016–{ultimo?.anio ?? "2026"}</b>
          <span>Tabla mes por mes. El último cierre va marcado.</span>
        </div>
        <div className="tb-matriz">
          <table>
            <thead>
              <tr>
                <th>Año</th>
                {MESES.map((m) => (
                  <th key={m}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {porAnio.map(([anio, meses]) => (
                <tr key={anio}>
                  <td>{anio}</td>
                  {meses.map((v, i) => {
                    const on = ultimo && ultimo.anio === anio && ultimo.mes === i + 1;
                    return (
                      <td key={i} data-on={on ? "" : undefined}>
                        {v == null ? "—" : v.toFixed(3)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="tb-indice" role="tablist" aria-label="Rango de la gráfica">
        {RANGOS.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={rango === r.id}
            data-on={rango === r.id ? "" : undefined}
            onClick={() => cambiarRango(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="tb-grupo">
        <div className="tb-grupo-head">
          <b>INPC · Índice Nacional de Precios al Consumidor</b>
          <span>Serie oficial INEGI · base 100 = 2.ª quincena julio 2018</span>
        </div>
        <div className="tb-panel-inpc">
          {valoresGrafica.length > 0 ? (
            <Grafica datos={valoresGrafica} />
          ) : (
            <p className="tb-leyenda">Sin serie para graficar.</p>
          )}
          {ultimo ? (
            <div className="tb-cierre">
              <Variacion
                etiqueta="Var. anual"
                valor={ultimo.variacion}
                detalle="vs. mismo mes año previo"
              />
              <Variacion
                etiqueta="Var. mes"
                valor={variacionMensual}
                detalle="vs. mes previo"
              />
              <p className="tb-pie">
                {cargando ? "Consultando INEGI…" : `${fuenteTxt} · ${actualizadoEn}`}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function Variacion({
  etiqueta,
  valor,
  detalle,
}: {
  etiqueta: string;
  valor: number | null | undefined;
  detalle: string;
}) {
  const signo = valor == null ? undefined : valor >= 0 ? "up" : "down";
  return (
    <div className="tb-var" data-up={signo === "up" ? "" : undefined} data-down={signo === "down" ? "" : undefined}>
      <p>{etiqueta}</p>
      <strong>
        {valor == null ? "—" : `${valor >= 0 ? "+" : ""}${valor.toFixed(2)}%`}
      </strong>
      <span>{detalle}</span>
    </div>
  );
}

function Grafica({
  datos,
}: {
  datos: Array<{ anio: number; mes: number; valor: number }>;
}) {
  const W = 720;
  const H = 236;
  const PAD = { top: 14, right: 12, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const yBase = PAD.top + innerH;
  const valores = datos.map((r) => r.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const yPad = rango * 0.1;
  const puntos = datos.map((r, i) => {
    const x = PAD.left + (innerW * i) / Math.max(datos.length - 1, 1);
    const y = yBase - ((r.valor - (min - yPad)) / (rango + yPad * 2)) * innerH;
    return { x, y };
  });
  const linea = curvaSuave(puntos);
  const area = `${linea} L ${puntos[puntos.length - 1]?.x ?? PAD.left} ${yBase} L ${puntos[0]?.x ?? PAD.left} ${yBase} Z`;
  const indicesEtiqueta = new Set<number>();
  datos.forEach((r, i) => {
    if (r.mes === 1) indicesEtiqueta.add(i);
  });
  indicesEtiqueta.add(datos.length - 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="tb-spark"
      role="img"
      aria-label="Evolución del INPC"
    >
      <defs>
        <linearGradient id="tb-inpc-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.18} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.top + innerH * (1 - t);
        return (
          <line
            key={t}
            x1={PAD.left}
            y1={y}
            x2={W - PAD.right}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        );
      })}
      <path d={area} fill="url(#tb-inpc-area)" />
      <path
        d={linea}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      {puntos.length > 0 ? (
        <circle
          cx={puntos[puntos.length - 1].x}
          cy={puntos[puntos.length - 1].y}
          r={5}
          fill="var(--hz-acento)"
          stroke="var(--hz-paper)"
          strokeWidth={2}
        />
      ) : null}
      {datos.map((r, i) => {
        if (!indicesEtiqueta.has(i)) return null;
        const p = puntos[i];
        return (
          <text key={i} x={p.x} y={H - 8} textAnchor="middle">
            {r.mes === 1 ? r.anio : `${MESES[r.mes - 1]} ${String(r.anio).slice(2)}`}
          </text>
        );
      })}
      <text x={4} y={PAD.top + 6}>
        {max.toFixed(1)}
      </text>
      <text x={4} y={yBase + 2}>
        {min.toFixed(1)}
      </text>
    </svg>
  );
}

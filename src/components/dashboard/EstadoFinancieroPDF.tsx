"use client";

import type {
  EstadoFinancieroData,
  ResumenAnioFinanciero,
} from "@/lib/dashboard-metrics";
import type { MesResumenAnual } from "@/lib/dashboard-metrics";

/**
 * Documento "Estado Financiero" pensado para exportar a PDF con formato,
 * color y diseño compacto (grid) en 2 páginas tamaño carta.
 *
 * Se renderiza fuera de pantalla (ver contenedor en el dashboard) y se
 * captura con html2canvas-pro. La gráfica es un SVG ESTÁTICO propio (no el
 * componente animado del dashboard) para que se capture siempre lleno, sin
 * depender del IntersectionObserver.
 */

const NAVY = "#0F172A";
const VIOLET = "#7c3aed";
const VIOLET_SOFT = "#a855f7";

// Carta a 96 dpi.
export const PDF_PAGE_W = 816;
export const PDF_PAGE_H = 1056;

function fmt(n: number) {
  return `$${Math.round(n).toLocaleString("es-MX")}`;
}

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
}

const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

/* --------------------------- Gráfica estática --------------------------- */

function curvaSuave(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function GraficaEstatica({
  mesesActual,
  mesesAnterior,
}: {
  mesesActual: MesResumenAnual[];
  mesesAnterior: MesResumenAnual[];
}) {
  const W = 720;
  const H = 260;
  const PAD = { top: 20, right: 16, bottom: 26, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const yBase = PAD.top + innerH;

  const todos = [
    ...mesesActual.map((m) => Math.max(m.compromiso, m.cobrado)),
    ...mesesAnterior.map((m) => Math.max(m.compromiso, m.cobrado)),
  ];
  const maxValor = Math.max(...todos, 1);

  const toPt = (mes: number, valor: number) => ({
    x: PAD.left + (innerW * mes) / 11,
    y: yBase - (valor / maxValor) * innerH,
  });

  const enCurso = mesesActual.filter((m) => m.enCurso);
  const cobradoPts = enCurso.map((m) => ({
    ...toPt(m.mes, m.cobrado),
    mes: m.mes,
  }));
  const esperadoPts = enCurso.map((m) => toPt(m.mes, m.compromiso));
  const anteriorPts = mesesAnterior.map((m) => toPt(m.mes, m.cobrado));

  const lineaCobrado = curvaSuave(cobradoPts);
  const lineaEsperado = curvaSuave(esperadoPts);
  const lineaAnterior = curvaSuave(anteriorPts);
  const area =
    cobradoPts.length > 0
      ? `${lineaCobrado} L ${cobradoPts[cobradoPts.length - 1].x} ${yBase} L ${cobradoPts[0].x} ${yBase} Z`
      : "";

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: PAD.top + innerH * (1 - t),
    label: fmtCompact(maxValor * t),
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block" }}
      role="img"
    >
      <defs>
        <linearGradient id="ef-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={VIOLET_SOFT} stopOpacity={0.55} />
          <stop offset="60%" stopColor={VIOLET} stopOpacity={0.28} />
          <stop offset="100%" stopColor={VIOLET_SOFT} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {yTicks.map((t) => (
        <g key={t.label}>
          <line
            x1={PAD.left}
            y1={t.y}
            x2={W - PAD.right}
            y2={t.y}
            stroke="#eef2f7"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 10}
            y={t.y + 4}
            textAnchor="end"
            fontSize={11}
            fontWeight={700}
            fill="#94a3b8"
          >
            {t.label}
          </text>
        </g>
      ))}

      {/* Año anterior */}
      <path
        d={lineaAnterior}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* Área + línea cobrado */}
      {area && <path d={area} fill="url(#ef-grad)" />}
      <path
        d={lineaEsperado}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d={lineaCobrado}
        fill="none"
        stroke={VIOLET}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Puntos */}
      {cobradoPts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill={VIOLET_SOFT}
          stroke="#fff"
          strokeWidth={1.5}
        />
      ))}

      {/* Etiquetas mes */}
      {mesesActual.map((m) => {
        const x = PAD.left + (innerW * m.mes) / 11;
        return (
          <text
            key={m.mes}
            x={x}
            y={H - 8}
            textAnchor="middle"
            fontSize={10}
            fontWeight={800}
            fill={m.enCurso ? "#64748b" : "#cbd5e1"}
          >
            {MESES_CORTOS[m.mes]}
          </text>
        );
      })}
    </svg>
  );
}

/* ------------------------------ Sub-bloques ------------------------------ */

function KpiCard({
  label,
  valor,
  sub,
  color = NAVY,
  bg = "#ffffff",
  ring = "#e2e8f0",
}: {
  label: string;
  valor: string;
  sub?: string;
  color?: string;
  bg?: string;
  ring?: string;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${ring}`,
        borderRadius: 16,
        padding: "14px 16px",
      }}
    >
      <p
        style={{
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#94a3b8",
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 24,
          fontWeight: 900,
          color,
          margin: "6px 0 0",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {valor}
      </p>
      {sub ? (
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#64748b",
            margin: "2px 0 0",
          }}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function BarraComposicion({ a }: { a: ResumenAnioFinanciero }) {
  const total = a.honorarios + a.adicionales + a.extras || 1;
  const segs = [
    { label: "Honorarios", val: a.honorarios, color: VIOLET },
    { label: "Adicionales", val: a.adicionales, color: VIOLET_SOFT },
    { label: "Extras", val: a.extras, color: "#f59e0b" },
  ];
  return (
    <div>
      <div
        style={{
          display: "flex",
          height: 18,
          borderRadius: 9,
          overflow: "hidden",
          background: "#f1f5f9",
        }}
      >
        {segs.map((s) => (
          <div
            key={s.label}
            style={{
              width: `${(s.val / total) * 100}%`,
              background: s.color,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
        {segs.map((s) => (
          <div
            key={s.label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: s.color,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
              {s.label}: <b style={{ color: NAVY }}>{fmt(s.val)}</b>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pagina({
  children,
  numero,
}: {
  children: React.ReactNode;
  numero: number;
}) {
  return (
    <div
      data-ef-pagina
      style={{
        width: PDF_PAGE_W,
        height: PDF_PAGE_H,
        background: "#ffffff",
        color: NAVY,
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          left: 40,
          right: 40,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 9,
          fontWeight: 700,
          color: "#94a3b8",
          borderTop: "1px solid #e2e8f0",
          paddingTop: 8,
        }}
      >
        <span>RDC Contadores · Estado Financiero</span>
        <span>Página {numero} de 2</span>
      </div>
    </div>
  );
}

/* ------------------------------ Documento ------------------------------ */

export default function EstadoFinancieroPDF({
  data,
}: {
  data: EstadoFinancieroData;
}) {
  const { anioActual, totalActual, totalAnterior, porAnio, topClientes } = data;
  const fechaTxt = new Date(data.generadoEn).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const crecimiento = totalActual?.crecimiento ?? null;
  const maxCobradoAnio = Math.max(...porAnio.map((p) => p.cobrado), 1);
  const maxTopCliente = Math.max(...topClientes.map((c) => c.anioActual), 1);

  return (
    <div id="estado-financiero-pdf">
      {/* ============================ PÁGINA 1 ============================ */}
      <Pagina numero={1}>
        {/* Encabezado */}
        <div
          style={{
            background: `linear-gradient(135deg, ${NAVY}, #1e1b4b)`,
            color: "#fff",
            padding: "26px 40px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#a5b4fc",
                  margin: 0,
                }}
              >
                RDC Contadores
              </p>
              <h1
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  margin: "4px 0 0",
                  letterSpacing: "-0.01em",
                }}
              >
                Estado Financiero
              </h1>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#c7d2fe",
                  margin: "4px 0 0",
                }}
              >
                Ejercicio {anioActual} · Ingresos de la cartera
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#a5b4fc",
                  margin: 0,
                }}
              >
                Generado
              </p>
              <p style={{ fontSize: 13, fontWeight: 800, margin: "4px 0 0" }}>
                {fechaTxt}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: "22px 40px 0", flex: 1 }}>
          {/* KPIs principales */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            <KpiCard
              label={`Cobrado ${anioActual}`}
              valor={fmt(totalActual?.cobrado ?? 0)}
              sub={`${totalActual?.tasa ?? 0}% del esperado`}
              color={VIOLET}
              bg="#faf5ff"
              ring="#e9d5ff"
            />
            <KpiCard
              label={`Esperado ${anioActual}`}
              valor={fmt(totalActual?.esperado ?? 0)}
              sub="Compromiso anual"
            />
            <KpiCard
              label="Clientes que pagaron"
              valor={String(totalActual?.clientesQuePagaron ?? 0)}
              sub="En el ejercicio"
            />
            <KpiCard
              label={`Crecimiento vs ${anioActual - 1}`}
              valor={crecimiento === null ? "—" : `${crecimiento >= 0 ? "+" : ""}${crecimiento}%`}
              sub={
                totalAnterior
                  ? `${fmt(totalAnterior.cobrado)} en ${anioActual - 1}`
                  : "Sin año previo"
              }
              color={
                crecimiento === null
                  ? NAVY
                  : crecimiento >= 0
                    ? "#059669"
                    : "#dc2626"
              }
              bg={
                crecimiento === null
                  ? "#ffffff"
                  : crecimiento >= 0
                    ? "#ecfdf5"
                    : "#fef2f2"
              }
              ring={
                crecimiento === null
                  ? "#e2e8f0"
                  : crecimiento >= 0
                    ? "#a7f3d0"
                    : "#fecaca"
              }
            />
          </div>

          {/* Gráfica */}
          <div
            style={{
              marginTop: 20,
              border: "1px solid #e2e8f0",
              borderRadius: 18,
              padding: "16px 18px 8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: NAVY,
                  margin: 0,
                }}
              >
                Ingresos cobrados por mes · {anioActual}
              </p>
              <div style={{ display: "flex", gap: 14 }}>
                <Leyenda color={VIOLET} texto={String(anioActual)} />
                <Leyenda color="#cbd5e1" texto={String(anioActual - 1)} />
                <Leyenda color="#94a3b8" texto="Esperado" />
              </div>
            </div>
            <GraficaEstatica
              mesesActual={data.mesesActual}
              mesesAnterior={data.mesesAnterior}
            />
          </div>

          {/* Composición del ingreso */}
          <div
            style={{
              marginTop: 18,
              border: "1px solid #e2e8f0",
              borderRadius: 18,
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: NAVY,
                margin: "0 0 12px",
              }}
            >
              Composición del ingreso · {anioActual}
            </p>
            {totalActual ? (
              <BarraComposicion a={totalActual} />
            ) : (
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Sin datos.</p>
            )}
          </div>
        </div>
      </Pagina>

      {/* ============================ PÁGINA 2 ============================ */}
      <Pagina numero={2}>
        <div style={{ padding: "34px 40px 0", flex: 1 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: VIOLET,
              margin: 0,
            }}
          >
            Detalle comparativo
          </p>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: NAVY,
              margin: "4px 0 18px",
            }}
          >
            Resumen por año
          </h2>

          {/* Tabla resumen por año */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr style={{ background: NAVY, color: "#fff" }}>
                <Th>Año</Th>
                <Th right>Esperado</Th>
                <Th right>Cobrado</Th>
                <Th right>Tasa</Th>
                <Th right>Honorarios</Th>
                <Th right>Adicionales</Th>
                <Th right>Extras</Th>
                <Th right>Crec.</Th>
              </tr>
            </thead>
            <tbody>
              {porAnio.map((p, i) => (
                <tr
                  key={p.anio}
                  style={{ background: i % 2 === 0 ? "#f8fafc" : "#ffffff" }}
                >
                  <Td>
                    <b>{p.anio}</b>
                  </Td>
                  <Td right>{fmt(p.esperado)}</Td>
                  <Td right>
                    <b style={{ color: VIOLET }}>{fmt(p.cobrado)}</b>
                  </Td>
                  <Td right>{p.tasa}%</Td>
                  <Td right>{fmt(p.honorarios)}</Td>
                  <Td right>{fmt(p.adicionales)}</Td>
                  <Td right>{fmt(p.extras)}</Td>
                  <Td right>
                    {p.crecimiento === null ? (
                      "—"
                    ) : (
                      <span
                        style={{
                          color: p.crecimiento >= 0 ? "#059669" : "#dc2626",
                          fontWeight: 800,
                        }}
                      >
                        {p.crecimiento >= 0 ? "+" : ""}
                        {p.crecimiento}%
                      </span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mini barras cobrado por año */}
          <div style={{ marginTop: 16 }}>
            {porAnio.map((p) => (
              <div
                key={p.anio}
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}
              >
                <span
                  style={{
                    width: 38,
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#475569",
                  }}
                >
                  {p.anio}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 12,
                    background: "#f1f5f9",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(p.cobrado / maxCobradoAnio) * 100}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${NAVY}, ${VIOLET})`,
                    }}
                  />
                </div>
                <span
                  style={{
                    width: 90,
                    textAlign: "right",
                    fontSize: 11,
                    fontWeight: 800,
                    color: NAVY,
                  }}
                >
                  {fmt(p.cobrado)}
                </span>
              </div>
            ))}
          </div>

          {/* Top clientes del año actual */}
          <h2
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: NAVY,
              margin: "26px 0 14px",
            }}
          >
            Top clientes · {anioActual}
          </h2>
          <div>
            {topClientes.length === 0 ? (
              <p style={{ fontSize: 12, color: "#94a3b8" }}>
                Sin clientes con pagos en el ejercicio.
              </p>
            ) : (
              topClientes.map((c, i) => (
                <div
                  key={`${c.rfc}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      fontSize: 11,
                      fontWeight: 900,
                      color: "#94a3b8",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      width: 230,
                      fontSize: 11,
                      fontWeight: 700,
                      color: NAVY,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.nombre}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 10,
                      background: "#f1f5f9",
                      borderRadius: 5,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(c.anioActual / maxTopCliente) * 100}%`,
                        height: "100%",
                        background: VIOLET,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      width: 90,
                      textAlign: "right",
                      fontSize: 11,
                      fontWeight: 800,
                      color: NAVY,
                    }}
                  >
                    {fmt(c.anioActual)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Pagina>
    </div>
  );
}

/**
 * Captura las dos páginas del estado financiero y arma un PDF tamaño carta.
 * Cada `.ef-pagina` se captura por separado para garantizar páginas limpias.
 */
export async function descargarEstadoFinancieroPDF(anio: number) {
  if (typeof document === "undefined") return;
  const cont = document.getElementById("estado-financiero-pdf");
  if (!cont) return;
  const paginas = Array.from(
    cont.querySelectorAll<HTMLElement>("[data-ef-pagina]")
  );
  if (paginas.length === 0) return;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  // Carta en puntos: 612 x 792.
  const pdf = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < paginas.length; i++) {
    const canvas = await html2canvas(paginas[i], {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    const img = canvas.toDataURL("image/png");
    if (i > 0) pdf.addPage("letter", "portrait");
    pdf.addImage(img, "PNG", 0, 0, pw, ph);
  }

  pdf.save(`estado-financiero-RDC-${anio}.pdf`);
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          background: color,
          display: "inline-block",
        }}
      />
      <span style={{ fontSize: 9, fontWeight: 800, color: "#64748b" }}>
        {texto}
      </span>
    </span>
  );
}

function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      style={{
        textAlign: right ? "right" : "left",
        padding: "8px 10px",
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <td
      style={{
        textAlign: right ? "right" : "left",
        padding: "7px 10px",
        borderBottom: "1px solid #e2e8f0",
        fontVariantNumeric: "tabular-nums",
        color: "#334155",
      }}
    >
      {children}
    </td>
  );
}

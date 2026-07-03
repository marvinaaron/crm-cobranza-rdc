import Link from "next/link";
import type { GuiaEnriquecida } from "@/lib/regimenes-fiscales-types";

const SECTION = "py-8 sm:py-10";
const CONTAINER = "max-w-3xl mx-auto px-4 sm:px-6";
const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-marca-navy";
const H2 = "mt-1.5 text-xl sm:text-2xl font-black text-slate-900";

function AclaracionBox({
  titulo,
  texto,
  tipo = "tip",
}: {
  titulo: string;
  texto: string;
  tipo?: "alerta" | "tip";
}) {
  const esAlerta = tipo === "alerta";
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        esAlerta
          ? "border-amber-200 bg-amber-50/80"
          : "border-sky-200 bg-sky-50/80"
      }`}
    >
      <p className={`text-sm font-bold ${esAlerta ? "text-amber-900" : "text-sky-900"}`}>
        {esAlerta ? "Importante: " : ""}
        {titulo}
      </p>
      <p className="mt-1 text-sm text-slate-700 leading-relaxed">{texto}</p>
    </div>
  );
}

export default function RegimenGuiaEnriquecida({ guia }: { guia: GuiaEnriquecida }) {
  const { calculoIsr, topes, comparativa, articulos, herramientasRelacionadas } = guia;

  return (
    <>
      {/* Topes */}
      <section className={`${SECTION} bg-slate-50 border-y border-slate-100`}>
        <div className={CONTAINER}>
          <p className={EYEBROW}>Límites y topes</p>
          <h2 className={H2}>Números que debes conocer</h2>
          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topes.map((t) => (
              <div key={t.label} className="rounded-lg bg-white ring-1 ring-slate-200 px-4 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t.label}
                </dt>
                <dd className="mt-0.5 text-base font-black text-slate-900">{t.valor}</dd>
                {t.detalle ? (
                  <dd className="mt-1 text-xs text-slate-600 leading-relaxed">{t.detalle}</dd>
                ) : null}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Cálculo ISR */}
      <section className={`${SECTION} bg-white`}>
        <div className={CONTAINER}>
          <p className={EYEBROW}>Capacitación fiscal</p>
          <h2 className={H2}>{calculoIsr.titulo}</h2>
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">{calculoIsr.resumen}</p>

          <div className="mt-5 rounded-lg bg-slate-900 px-4 py-3 sm:px-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Fórmula de referencia
            </p>
            <pre className="text-sm text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
              {calculoIsr.formula}
            </pre>
          </div>

          <ol className="mt-5 space-y-2 list-decimal list-inside text-sm text-slate-700 leading-relaxed">
            {calculoIsr.pasos.map((paso) => (
              <li key={paso} className="pl-1">
                {paso}
              </li>
            ))}
          </ol>

          {calculoIsr.aclaraciones.length > 0 ? (
            <div className="mt-5 space-y-3">
              {calculoIsr.aclaraciones.map((a) => (
                <AclaracionBox key={a.titulo} {...a} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Comparativa */}
      {comparativa ? (
        <section className={`${SECTION} bg-slate-50`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <p className={EYEBROW}>Comparativa</p>
            <h2 className={H2}>{comparativa.titulo}</h2>
            <div className="mt-5 overflow-x-auto rounded-lg ring-1 ring-slate-200 bg-white">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700">Aspecto</th>
                    {comparativa.columnas.map((col) => (
                      <th key={col} className="px-4 py-2.5 text-left font-bold text-marca-navy">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparativa.filas.map((fila, i) => (
                    <tr
                      key={fila.aspecto}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                    >
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{fila.aspecto}</td>
                      {fila.valores.map((v, j) => (
                        <td key={j} className="px-4 py-2.5 text-slate-600 leading-snug">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {/* Artículos extendidos */}
      {articulos && articulos.length > 0 ? (
        <section className={`${SECTION} bg-white`}>
          <div className={CONTAINER}>
            {articulos.map((art) => (
              <article key={art.titulo} className="mb-6 last:mb-0">
                <h3 className="text-lg font-black text-slate-900">{art.titulo}</h3>
                {art.parrafos.map((p) => (
                  <p key={p.slice(0, 40)} className="mt-2 text-sm text-slate-700 leading-relaxed">
                    {p}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Herramientas */}
      {herramientasRelacionadas && herramientasRelacionadas.length > 0 ? (
        <section className={`${SECTION} bg-indigo-50/50 border-y border-indigo-100`}>
          <div className={CONTAINER}>
            <p className={EYEBROW}>Herramientas RDC</p>
            <h2 className={H2}>Pruébalo antes de contratar</h2>
            <div className="mt-4 space-y-3">
              {herramientasRelacionadas.map((h) => (
                <div
                  key={h.href}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg bg-white ring-1 ring-indigo-100 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 leading-relaxed">{h.texto}</p>
                  </div>
                  <Link
                    href={h.href}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg bg-marca-navy px-4 py-2 text-sm font-bold text-white hover:bg-marca-navy-soft transition"
                  >
                    {h.label} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
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
  return n.toLocaleString("es-MX", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

const selectClass =
  "w-full px-3 py-2.5 rounded-lg ring-1 ring-slate-200 focus:ring-2 focus:ring-rose-500 outline-none text-sm bg-white";

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
    <fieldset>
      <legend className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <label className="sr-only" htmlFor={`${id}-mes`}>
          Mes
        </label>
        <select
          id={`${id}-mes`}
          className={selectClass}
          value={valor.mes}
          onChange={(e) => onChange({ ...valor, mes: Number(e.target.value) })}
        >
          {MESES.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.etiqueta}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${id}-anio`}>
          Año
        </label>
        <select
          id={`${id}-anio`}
          className={selectClass}
          value={valor.anio}
          onChange={(e) => onChange({ ...valor, anio: Number(e.target.value) })}
        >
          {anios.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        INPC de {inpc.etiqueta}: <span className="tabular-nums font-medium text-slate-700">{inpc.valor}</span>
      </p>
    </fieldset>
  );
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
  const [detalleAbierto, setDetalleAbierto] = useState(false);

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
          "No se pudo consultar INEGI. Usamos el INPC de respaldo del despacho; el estimado puede desfasarse del último índice publicado."
        );
      })
      .finally(() => {
        if (activo) setInpcListo(true);
      });
    return () => {
      activo = false;
    };
  }, []);

  function etiquetaInpc(periodo: PeriodoMes): { etiqueta: string; valor: string } {
    const ref = mesAnterior(periodo.anio, periodo.mes);
    const found = buscarInpc(serie, ref.anio, ref.mes);
    if (!found) return { etiqueta: etiquetaMesAnio(ref.anio, ref.mes), valor: "no disponible" };
    return {
      etiqueta: etiquetaMesAnio(found.anio, found.mes),
      valor: `${fmtInpc(found.valor)}${found.aproximado ? " (último disponible)" : ""}`,
    };
  }

  function calcular() {
    setErrorCalc(null);
    const historico = parseFloat(monto.replace(/,/g, "").replace(/\$/g, "").trim());
    const out = calcularAdeudoSat({
      impuestoHistorico: Number.isFinite(historico) ? historico : 0,
      vencimiento,
      pago,
      serieInpc: serie,
    });
    if ("error" in out) {
      setResultado(null);
      setErrorCalc(out.error);
    } else {
      setResultado(out);
      setDetalleAbierto(out.detalleMeses.length <= 18);
    }
  }

  const waUrl = resultado
    ? CONTACTO_PUBLICO.whatsapp.buildUrl(
        `Hola, usé la calculadora de recargos SAT. El recargo estimado es ${fmtMoneda(resultado.recargos)} (total ${fmtMoneda(resultado.total)}) y quiero un diagnóstico de regularización.`
      )
    : CONTACTO_PUBLICO.whatsapp.url;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="monto-omitido" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Monto del impuesto omitido
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                id="monto-omitido"
                type="text"
                inputMode="decimal"
                placeholder="10,000.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full pl-7 pr-4 py-2.5 rounded-lg ring-1 ring-slate-200 focus:ring-2 focus:ring-rose-500 outline-none text-sm tabular-nums"
              />
            </div>
          </div>

          <SelectorPeriodo
            id="vencimiento"
            label="Fecha en que debió pagarse"
            valor={vencimiento}
            anios={anios}
            inpc={etiquetaInpc(vencimiento)}
            onChange={setVencimiento}
          />

          <SelectorPeriodo
            id="pago"
            label="Fecha de pago proyectada"
            valor={pago}
            anios={anios}
            inpc={etiquetaInpc(pago)}
            onChange={setPago}
          />

          <button
            type="button"
            onClick={calcular}
            disabled={!inpcListo}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            🧮 Calcular adeudo estimado
          </button>

          {errorInpc ? (
            <p className="text-xs text-amber-800 bg-amber-50 ring-1 ring-amber-200 rounded-lg px-3 py-2">
              {errorInpc}
            </p>
          ) : null}
          {errorCalc ? (
            <p className="text-xs text-rose-800 bg-rose-50 ring-1 ring-rose-200 rounded-lg px-3 py-2" role="alert">
              {errorCalc}
            </p>
          ) : null}
        </div>

        <div>
          {resultado ? (
            <div className="rounded-2xl ring-1 ring-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">Resultado del cálculo</h3>
                <p className="text-xs text-slate-500 mt-0.5">Arts. 17-A y 21 del CFF · sin multas</p>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-5 py-3 text-slate-600">Monto</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-slate-900">
                      {fmtMoneda(resultado.impuestoHistorico)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 text-slate-600">más: Actualización</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-slate-900">
                      {fmtMoneda(resultado.actualizacion)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/80">
                    <td className="px-5 py-3 text-slate-700 font-medium">Igual: Impuesto actualizado</td>
                    <td className="px-5 py-3 text-right tabular-nums font-bold text-slate-900">
                      {fmtMoneda(resultado.impuestoActualizado)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 text-slate-600">
                      más: Recargos
                      <span className="block text-[11px] font-normal text-slate-500">
                        {resultado.mesesRecargo} {resultado.mesesRecargo === 1 ? "mes" : "meses"} ·{" "}
                        {fmtPct(resultado.tasaAcumulada, 2)} acumulado
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-bold text-rose-700">
                      {fmtMoneda(resultado.recargos)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="px-5 py-4 bg-rose-50 border-t border-rose-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">
                  Total a pagar estimado
                </p>
                <p className="mt-1 text-3xl font-black tabular-nums text-rose-950 tracking-tight">
                  {fmtMoneda(resultado.total)}
                </p>
              </div>

              {!resultado.mismoMes ? (
                <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                  FA {resultado.factorActualizacion.toFixed(4)} = INPC{" "}
                  {etiquetaMesAnio(resultado.inpcPago.anio, resultado.inpcPago.mes)} (
                  {fmtInpc(resultado.inpcPago.valor)})
                  {resultado.inpcPago.aproximado ? " · último disponible" : ""} ÷ INPC{" "}
                  {etiquetaMesAnio(resultado.inpcVencimiento.anio, resultado.inpcVencimiento.mes)} (
                  {fmtInpc(resultado.inpcVencimiento.valor)})
                  {resultado.inpcVencimiento.aproximado ? " · último disponible" : ""}
                  {resultado.desgloseTasas.length > 1
                    ? ` · Recargos: ${resultado.desgloseTasas
                        .map((d) => `${d.meses} mes${d.meses === 1 ? "" : "es"} ${d.anio} a ${fmtPct(d.tasaMensual, 2)}`)
                        .join("; ")}`
                    : ""}
                  {resultado.mesesRecargoCapped
                    ? " · Tope de 5 años (60 meses, art. 21 CFF) aplicado en este estimado."
                    : ""}
                </div>
              ) : (
                <p className="px-5 py-3 border-t border-slate-100 text-xs text-emerald-800 bg-emerald-50">
                  El mes de pago no es posterior al vencimiento: no hay recargos. Si el factor de actualización es
                  1.0000, el impuesto no se infla.
                </p>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[220px] rounded-2xl ring-1 ring-dashed ring-slate-200 bg-slate-50/80 flex items-center justify-center px-6 text-center">
              <p className="text-sm text-slate-500">
                Completa el monto y los periodos, luego pulsa calcular para ver el desglose.
              </p>
            </div>
          )}
        </div>
      </div>

      <section
        aria-labelledby="fundamento-recargos"
        className="rounded-2xl ring-1 ring-slate-200 bg-white overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">
            Anotación 2026
          </p>
          <h3 id="fundamento-recargos" className="mt-1 text-base font-bold text-slate-900">
            Por qué subió la tasa y cómo se calcula
          </h3>
        </div>
        <div className="p-5 sm:p-6 space-y-5 text-sm text-slate-600 leading-relaxed">
          <div>
            <p className="font-semibold text-slate-900">El aumento de recargos en 2026</p>
            <p className="mt-1.5">
              De 2018 a 2025 la mora se quedó en {fmtPct(TASA_MORA_2018_2025, 2)} mensual. Para 2026 el Congreso
              fijó en la <span className="font-medium text-slate-800">Ley de Ingresos de la Federación</span>{" "}
              (art. 11, fracc. I, DOF 7 de noviembre de 2025) una tasa base de 1.38% mensual. El{" "}
              <span className="font-medium text-slate-800">artículo 21 del CFF</span> ordena incrementar esa tasa
              en 50% cuando hay mora sin convenio: 1.38% × 1.50 ={" "}
              <span className="font-semibold text-rose-800">{fmtPct(TASA_MORA_2026, 2)} mensual</span>. La
              Resolución Miscelánea Fiscal 2026 (regla 2.1.20) confirma esa tasa de mora. Es un alza de unos
              41% respecto de 2025: el adeudo crece más rápido si dejas pasar los meses.
            </p>
            <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-slate-200">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Ejercicio</th>
                    <th className="px-3 py-2 text-right font-semibold">Tasa de mora mensual</th>
                    <th className="px-3 py-2 text-left font-semibold hidden sm:table-cell">Sustento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-3 py-2 text-slate-700">2018–2025</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-slate-900">
                      {fmtPct(TASA_MORA_2018_2025, 2)}
                    </td>
                    <td className="px-3 py-2 text-slate-500 hidden sm:table-cell">LIF de esos años + art. 21 CFF</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-700">2026</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-rose-700">
                      {fmtPct(TASA_MORA_2026, 2)}
                    </td>
                    <td className="px-3 py-2 text-slate-500 hidden sm:table-cell">
                      LIF 2026 art. 11-I (1.38%) × 1.50 = 2.07% · RMF regla 2.1.20
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-900">Por qué se cuenta por mes calendario (no por el día 17)</p>
            <p className="mt-1.5">
              El <span className="font-medium text-slate-800">artículo 21 del CFF</span> dice que los recargos se
              causan <span className="font-medium text-slate-800">por cada mes o fracción</span> desde que debió
              hacerse el pago hasta que se efectúe, y que se aplica la tasa de cada mes del periodo. En la
              práctica de las calculadoras fiscales (y de esta herramienta) eso se traduce así: se suma la tasa
              de <span className="font-medium text-slate-800">cada mes calendario desde el mes siguiente al
              vencimiento hasta el mes de pago</span>, inclusive. Por eso pagar el día 1, el 15 o el 30 del mismo
              mes da el mismo recargo; si te pasas al mes siguiente, se agrega otro mes completo. Si el atraso
              cruza 2025 y 2026, cada mes lleva la tasa de su año y luego se acumulan.
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-900">Actualización (inflación) vs recargos</p>
            <p className="mt-1.5">
              El <span className="font-medium text-slate-800">artículo 17-A del CFF</span> manda actualizar el
              impuesto con el INPC: factor = INPC del mes anterior al pago ÷ INPC del mes anterior al
              vencimiento, a cuatro decimales. Si hay deflación (factor menor a 1), se usa 1.0000. Los recargos
              del art. 21 se calculan <span className="font-medium text-slate-800">sobre el impuesto ya
              actualizado</span>, no sobre el histórico. Esta calculadora no incluye multas ni gastos de
              ejecución; el tope de recargos es de cinco años (60 meses), salvo los casos del art. 67 del CFF.
            </p>
          </div>
        </div>
      </section>

      {resultado && resultado.detalleMeses.length > 0 ? (
        <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setDetalleAbierto((v) => !v)}
            className="w-full px-5 py-3 flex items-center justify-between text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Detalle de recargos por mes
            <span className="text-xs font-medium text-slate-500">{detalleAbierto ? "Ocultar" : "Ver"}</span>
          </button>
          {detalleAbierto ? (
            <div className="overflow-x-auto border-t border-slate-100 max-h-72 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">N°</th>
                    <th className="px-4 py-2 text-left font-semibold">Mes</th>
                    <th className="px-4 py-2 text-right font-semibold">Tasa</th>
                    <th className="px-4 py-2 text-right font-semibold">Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultado.detalleMeses.map((m, i) => (
                    <tr key={`${m.anio}-${m.mes}`} className="hover:bg-slate-50">
                      <td className="px-4 py-1.5 text-slate-500 tabular-nums">{i + 1}</td>
                      <td className="px-4 py-1.5 text-slate-700">{etiquetaMesAnio(m.anio, m.mes)}</td>
                      <td className="px-4 py-1.5 text-right tabular-nums text-slate-700">
                        {fmtPct(m.tasaMensual, 2)}
                      </td>
                      <td className="px-4 py-1.5 text-right tabular-nums font-medium text-slate-900">
                        {fmtPct(m.acumulado, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      {resultado && !resultado.mismoMes ? (
        <>
          <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 ring-1 ring-slate-200 rounded-xl px-4 py-3 leading-relaxed">
            💡 <span className="font-semibold text-slate-800">Nota:</span> los recargos del SAT se computan por mes
            calendario completo (del mes siguiente al vencimiento hasta el mes de pago). El total es el mismo si pagas
            el día 1, 15 o 30 de este mes. Si te pasas al mes siguiente, se suma otro {fmtPct(TASA_MORA_2026, 2)} en
            2026.
          </p>

          {resultado.recargos > 0 ? (
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 ring-1 ring-rose-200 p-5 sm:p-6">
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                🔥 ¿El monto de recargos ({fmtMoneda(resultado.recargos)}) te parece muy alto? En{" "}
                <span className="font-bold">RD Contadores</span> evaluamos si tus deudas de años pasados califican
                para una reducción de hasta el 100% de recargos y multas.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
                >
                  📲 Agendar diagnóstico de regularización
                </a>
                <Link
                  href="/blog/eliminar-multas-recargos-sat-anos-anteriores"
                  className="inline-flex h-11 items-center justify-center px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cómo funciona la reducción
                </Link>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Estimado informativo. No sustituye la línea de captura del SAT. Factor de actualización: INPC del mes anterior
        al pago ÷ INPC del mes anterior al vencimiento (4 decimales; piso 1.0000). Recargos sobre el impuesto ya
        actualizado. No incluye multas ni gastos de ejecución.
      </p>
    </div>
  );
}

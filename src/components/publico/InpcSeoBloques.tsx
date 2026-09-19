import Link from "next/link";
import BotonCopiar from "@/components/publico/BotonCopiar";
import {
  nombreMesInpc,
  registrosInpcAnio,
  ultimoRegistroInpc,
  type RegistroInpc,
} from "@/lib/fiscal/inpc";
import { recargosDelAnio } from "@/lib/fiscal/recargos";

const SLUG_SUA = "/blog/sua-imss-como-actualizar-inpc-y-recargos";

function IconoSua({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h6M7 16h4" />
    </svg>
  );
}

function IconoGuia({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h5" />
    </svg>
  );
}

function IconoUsoFiscal({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </svg>
  );
}

function valorDe(
  serie: RegistroInpc[],
  anio: number,
  mes: number
): number | null {
  return serie.find((r) => r.anio === anio && r.mes === mes)?.valor ?? null;
}

function pct(valor: number | null): string {
  if (valor == null) return "—";
  return `${valor >= 0 ? "+" : ""}${valor.toFixed(2)}%`;
}

/**
 * Texto indexable debajo de la gráfica: recuadros de uso + definición.
 */
export default function InpcSeoBloques({ serie }: { serie: RegistroInpc[] }) {
  const ultimo = ultimoRegistroInpc(serie);
  const recargos = recargosDelAnio(ultimo.anio);
  const valor = ultimo.valor.toFixed(3);
  const mes = nombreMesInpc(ultimo.mes);
  const mora = recargos.mora.toFixed(2);
  const anio = ultimo.anio;
  const previo = anio - 1;
  const mesesAnio = registrosInpcAnio(anio, serie);

  const mismoMesPrev = valorDe(serie, previo, ultimo.mes);
  const varAnual =
    mismoMesPrev != null && mismoMesPrev !== 0
      ? ((ultimo.valor - mismoMesPrev) / mismoMesPrev) * 100
      : null;
  const mesAnterior = serie[serie.length - 2];
  const varMes =
    mesAnterior && mesAnterior.valor !== 0
      ? ((ultimo.valor - mesAnterior.valor) / mesAnterior.valor) * 100
      : null;
  const desde2018 = ultimo.valor - 100;

  return (
    <section className="mt-8 space-y-8 text-slate-600">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          ¿Qué es el INPC {anio}?
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          El INPC {anio} es el valor actualizado del Índice Nacional de
          Precios al Consumidor para el año {anio} en México. El INPC es
          publicado quincenalmente por el INEGI y{" "}
          <strong className="text-slate-800 font-semibold">
            mide la inflación
          </strong>{" "}
          mediante el seguimiento de los precios de una canasta de bienes y
          servicios representativa del consumo de los hogares mexicanos. El
          valor del Índice Nacional de Precios al Consumidor (INPC) en{" "}
          {mes.toLowerCase()} de {anio} es de{" "}
          <strong className="text-slate-800 font-semibold tabular-nums">
            {valor} puntos
          </strong>
          , de acuerdo con las cifras oficiales del INEGI.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <article className="relative overflow-hidden rounded-2xl bg-marca-navy text-white ring-2 ring-marca-acento px-5 py-7 text-center shadow-lg shadow-indigo-200/50">
          <div
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-400 via-marca-acento to-violet-300"
            aria-hidden
          />
          <div className="mx-auto w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center">
            <IconoSua />
          </div>
          <h3 className="mt-4 text-base font-black tracking-tight">
            Para el SUA este mes
          </h3>
          <p className="mt-3 text-sm font-semibold text-white/70">
            {mes} {anio}
          </p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <p className="text-2xl font-black tabular-nums leading-none">
              {valor}
            </p>
            <BotonCopiar valor={valor} etiqueta="INPC" variante="claro" />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <p className="text-sm font-bold">Recargos {mora}%</p>
            <BotonCopiar valor={mora} etiqueta="recargos" variante="claro" />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-white/55">
            Utilerías → Actualizar INPC y Recargos
          </p>
        </article>

        <Link
          href={SLUG_SUA}
          className="relative overflow-hidden rounded-2xl bg-white ring-2 ring-marca-navy/20 px-5 py-7 text-center hover:ring-marca-acento/50 hover:shadow-sm transition"
        >
          <div
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-marca-navy to-marca-acento"
            aria-hidden
          />
          <div className="mx-auto w-12 h-12 rounded-xl bg-marca-navy/5 text-marca-navy flex items-center justify-center">
            <IconoGuia />
          </div>
          <h3 className="mt-4 text-base font-black text-slate-900 tracking-tight">
            Cómo se captura en el SUA
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Guía con pantalla del programa: dónde pegar el INPC y la tasa de
            recargos, y qué hacer si ya se te pasó el 17 (SIPARE).
          </p>
        </Link>

        <Link
          href="/herramientas/recargos-federales"
          className="relative overflow-hidden rounded-2xl bg-white ring-2 ring-marca-navy/20 px-5 py-7 text-center hover:ring-marca-acento/50 hover:shadow-sm transition"
        >
          <div
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-marca-acento to-marca-navy"
            aria-hidden
          />
          <div className="mx-auto w-12 h-12 rounded-xl bg-marca-navy/5 text-marca-navy flex items-center justify-center">
            <IconoUsoFiscal />
          </div>
          <h3 className="mt-4 text-base font-black text-slate-900 tracking-tight">
            Uso fiscal del INPC
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Actualización de créditos, contratos y tasas de recargos {anio}.
            Mora {mora}% lista para copiar al SUA.
          </p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-stretch">
        <div className="relative overflow-hidden rounded-2xl bg-white ring-2 ring-marca-navy/20">
          <div
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-marca-navy via-marca-acento to-marca-navy"
            aria-hidden
          />
          <div className="px-4 sm:px-5 pt-5 pb-2">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              INPC {anio} vs {previo}
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Misma canasta, mismo mes. La última columna es la inflación
              interanual de ese mes.
            </p>
          </div>
          <table className="w-full text-xs sm:text-[13px]">
            <caption className="sr-only">
              Comparativo del INPC {anio} contra {previo} y variación anual
            </caption>
            <thead>
              <tr className="text-slate-500 border-y border-slate-100">
                <th className="text-left font-bold uppercase tracking-wider text-[10px] px-4 py-2">
                  Mes
                </th>
                <th className="text-right font-bold uppercase tracking-wider text-[10px] px-3 py-2">
                  {anio}
                </th>
                <th className="text-right font-bold uppercase tracking-wider text-[10px] px-3 py-2">
                  {previo}
                </th>
                <th className="text-right font-bold uppercase tracking-wider text-[10px] px-4 py-2">
                  Inflación
                </th>
              </tr>
            </thead>
            <tbody>
              {mesesAnio.map((r) => {
                const anterior = valorDe(serie, previo, r.mes);
                const inflacion =
                  anterior != null && anterior !== 0
                    ? ((r.valor - anterior) / anterior) * 100
                    : null;
                const esUltimo = r.mes === ultimo.mes;
                return (
                  <tr
                    key={r.mes}
                    className={esUltimo ? "bg-indigo-50" : "bg-white"}
                  >
                    <td className="px-4 py-1.5 font-semibold text-slate-800">
                      {nombreMesInpc(r.mes)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums font-bold text-marca-navy">
                      {r.valor.toFixed(3)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-slate-500">
                      {anterior == null ? "—" : anterior.toFixed(3)}
                    </td>
                    <td
                      className={`px-4 py-1.5 text-right tabular-nums font-bold ${
                        inflacion == null
                          ? "text-slate-300"
                          : inflacion >= 0
                            ? "text-emerald-700"
                            : "text-rose-700"
                      }`}
                    >
                      {pct(inflacion)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="px-4 py-2.5 text-[10px] text-slate-400">
            Fuente: INEGI. Base 100 = 2.ª quincena de julio de 2018.
          </p>
        </div>

        <aside className="relative overflow-hidden rounded-2xl bg-white ring-2 ring-marca-acento/40 p-5 sm:p-6 flex flex-col">
          <div
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-marca-acento to-marca-navy"
            aria-hidden
          />
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Qué dice la inflación en {mes.toLowerCase()}
          </h2>
          <p className="mt-2 text-sm leading-relaxed">
            Cada porcentaje de la tabla de al lado es el alza de precios de ese
            mes contra el mismo mes de {previo}. En {mes.toLowerCase()} {anio}{" "}
            el INPC quedó en {valor}: la canasta del INEGI cuesta eso, en
            puntos, con base 100 en julio de 2018.
          </p>

          <dl className="mt-5 grid grid-cols-1 gap-3">
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-4 py-3">
              <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Inflación anual
              </dt>
              <dd
                className={`mt-1 text-2xl font-black tabular-nums leading-none ${
                  varAnual == null
                    ? "text-slate-400"
                    : varAnual >= 0
                      ? "text-emerald-700"
                      : "text-rose-700"
                }`}
              >
                {pct(varAnual)}
              </dd>
              <p className="mt-1 text-xs text-slate-500">
                vs. {mes.toLowerCase()} {previo}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-4 py-3">
              <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Inflación del mes
              </dt>
              <dd
                className={`mt-1 text-2xl font-black tabular-nums leading-none ${
                  varMes == null
                    ? "text-slate-400"
                    : varMes >= 0
                      ? "text-emerald-700"
                      : "text-rose-700"
                }`}
              >
                {pct(varMes)}
              </dd>
              <p className="mt-1 text-xs text-slate-500">vs. el mes previo</p>
            </div>
            <div className="rounded-xl bg-marca-navy text-white px-4 py-3">
              <dt className="text-[10px] font-black uppercase tracking-widest text-white/55">
                Acumulada desde julio 2018
              </dt>
              <dd className="mt-1 text-2xl font-black tabular-nums leading-none">
                +{desde2018.toFixed(1)}%
              </dd>
              <p className="mt-1 text-xs text-white/65">
                El 100 de la serie es la 2.ª quincena de julio de 2018.
              </p>
            </div>
          </dl>
        </aside>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          ¿Para qué sirve el INPC en {anio}?
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          El INPC se utiliza para{" "}
          <strong className="text-slate-800 font-semibold">
            medir la inflación
          </strong>{" "}
          en México. El INPC {anio} también entra en cálculos fiscales y de
          contratos:
        </p>
        <ul className="mt-3 space-y-2 text-sm sm:text-base">
          <li className="flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-marca-navy shrink-0" />
            <span>
              Indicador oficial para{" "}
              <strong className="text-slate-800 font-semibold">
                medir la inflación
              </strong>{" "}
              (canasta de bienes y servicios de los hogares, INEGI).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-marca-navy shrink-0" />
            <span>
              Factor de actualización de créditos fiscales y recargos del SAT
              (INPC reciente ÷ INPC del mes original).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-marca-navy shrink-0" />
            <span>
              Actualizar rentas, honorarios, contratos y montos en pesos.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-marca-navy shrink-0" />
            <span>
              Captura mensual en el SUA del IMSS y recálculo del SIPARE fuera
              de plazo.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-marca-navy shrink-0" />
            <span>
              Referente de UMA, UDI, salarios y prestaciones indexadas.
            </span>
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Relación entre INPC e inflación en México
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          La inflación es el aumento generalizado y sostenido de los precios.
          El indicador oficial para{" "}
          <strong className="text-slate-800 font-semibold">
            medir la inflación
          </strong>{" "}
          en México es el INPC. El INPC {anio} refleja ese comportamiento en el
          año en curso; compararlo con el histórico (base 100 = segunda
          quincena de julio de 2018) da la inflación acumulada desde entonces.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          ¿Cómo interpretar el INPC histórico?
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          La base de referencia es la segunda quincena de julio de 2018, cuando
          el índice vale 100. Un INPC de {valor} en {mes.toLowerCase()} de{" "}
          {anio} significa que la canasta del INEGI cuesta, en promedio,{" "}
          {desde2018.toFixed(1)}% más que en esa quincena de 2018.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          ¿Cuál es la periodicidad de cálculo del INPC?
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          El INEGI publica el INPC dos veces al mes: a más tardar el día 10 el
          cierre del mes anterior (y la segunda quincena), y a más tardar el día
          25 la primera quincena del mes en curso. También sale en el Diario
          Oficial de la Federación. El dato de esta página es el cierre mensual.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          ¿Qué es la canasta del INPC?
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          Es el conjunto de bienes y servicios cuyo precio sigue el INEGI para
          medir la inflación. Representa el consumo de los hogares urbanos y
          rurales en México. No es lo mismo que la canasta básica ni que un
          índice del costo de la vida: el INPC mide precios de esa canasta, no
          el gasto mínimo para mantener un nivel de vida.
        </p>
      </div>
    </section>
  );
}

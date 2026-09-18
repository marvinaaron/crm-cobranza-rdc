import Link from "next/link";
import BotonCopiarTexto from "@/components/publico/BotonCopiarTexto";
import {
  nombreMesInpc,
  registrosInpcAnio,
  ultimoRegistroInpc,
  type RegistroInpc,
} from "@/lib/fiscal/inpc";
import { recargosDelAnio } from "@/lib/fiscal/recargos";

const SLUG_SUA = "/blog/sua-imss-como-actualizar-inpc-y-recargos";

/**
 * Tabla mes × valor del año en curso. Google extrae este formato
 * (no la matriz año×mes del widget) para el recuadro de valores recientes.
 */
export function InpcSeoPrologo({ serie }: { serie: RegistroInpc[] }) {
  const ultimo = ultimoRegistroInpc(serie);
  const meses = registrosInpcAnio(ultimo.anio, serie);

  return (
    <section className="mb-8 space-y-6 text-slate-600">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          ¿Qué es el INPC {ultimo.anio}?
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          El INPC {ultimo.anio} es el valor actualizado del Índice Nacional de
          Precios al Consumidor para este año en México. El INEGI lo publica
          cada quincena y{" "}
          <strong className="text-slate-800 font-semibold">
            mide la inflación
          </strong>{" "}
          mediante el seguimiento de los precios de una canasta de bienes y
          servicios representativa del consumo de los hogares. El último cierre
          es{" "}
          <strong className="text-slate-800 font-semibold tabular-nums">
            {ultimo.valor.toFixed(3)}
          </strong>{" "}
          ({nombreMesInpc(ultimo.mes).toLowerCase()} {ultimo.anio}), con base
          100 en la segunda quincena de julio de 2018.
        </p>
      </div>

      <figure>
        <h2 className="text-lg font-bold text-slate-900">
          Valores recientes del INPC {ultimo.anio} (base 2018 = 100)
        </h2>
        <p className="mt-2 mb-3 text-sm sm:text-base leading-relaxed">
          Cierre mensual en puntos del índice. Se actualiza cuando el INEGI
          publica el mes; no se escribe a mano.
        </p>
        <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200 bg-white">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Valores recientes del INPC {ultimo.anio} (base 2018 = 100)
            </caption>
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="text-left font-bold uppercase tracking-wider text-[10px] px-4 py-2.5">
                  Mes
                </th>
                <th className="text-right font-bold uppercase tracking-wider text-[10px] px-4 py-2.5">
                  Valor del INPC (puntos)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meses.map((r) => (
                <tr key={`${r.anio}-${r.mes}`} className="bg-white">
                  <td className="px-4 py-2.5 font-semibold text-slate-800">
                    {nombreMesInpc(r.mes)} {r.anio}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                    {r.valor.toFixed(3)}
                    {r.mes === ultimo.mes && r.anio === ultimo.anio ? (
                      <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-marca-navy">
                        último
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <figcaption className="mt-2 text-xs text-slate-400">
          Fuente: INEGI (o Banxico, misma serie). Base 100 = segunda quincena de
          julio de 2018.
        </figcaption>
      </figure>
    </section>
  );
}

/**
 * Texto indexable debajo de la gráfica: para qué sirve, inflación y SUA.
 */
export default function InpcSeoBloques({ serie }: { serie: RegistroInpc[] }) {
  const ultimo = ultimoRegistroInpc(serie);
  const recargos = recargosDelAnio(ultimo.anio);

  return (
    <section className="mt-8 space-y-8 text-slate-600">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          ¿Para qué sirve el INPC en {ultimo.anio}?
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          El INPC se utiliza para{" "}
          <strong className="text-slate-800 font-semibold">
            medir la inflación
          </strong>{" "}
          en México. El INPC {ultimo.anio} también entra en cálculos fiscales y
          de contratos:
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
          en México es el INPC. El INPC {ultimo.anio} refleja ese comportamiento
          en el año en curso; compararlo con el histórico (base 100 = segunda
          quincena de julio de 2018) da la inflación acumulada desde entonces.
        </p>
      </div>

      <div className="rounded-2xl bg-sky-50 ring-1 ring-sky-100 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0"
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M7 8h10M7 12h6" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">
              Cómo se usa este INPC en el SUA del IMSS
            </h2>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              El Sistema Único de Autodeterminación (SUA) pide cada mes el{" "}
              <strong className="text-slate-800 font-semibold">INPC</strong> y
              la{" "}
              <strong className="text-slate-800 font-semibold">
                tasa de recargos
              </strong>{" "}
              para actualizar cuotas. En el programa:{" "}
              <strong className="text-slate-800 font-semibold">
                Utilerías → Actualizar INPC y Recargos
              </strong>
              . Elige mes y año, pega el INPC de esa fila y en Recargos la tasa
              de mora del año ({recargos.mora.toFixed(2)}% en {ultimo.anio}).
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <BotonCopiarTexto
                valor={ultimo.valor.toFixed(3)}
                etiqueta={`Copiar INPC ${nombreMesInpc(ultimo.mes)}`}
              />
              <BotonCopiarTexto
                valor={recargos.mora.toFixed(2)}
                etiqueta={`Copiar recargos ${recargos.mora.toFixed(2)}`}
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              Paso a paso, con captura de pantalla, en{" "}
              <Link
                href={SLUG_SUA}
                className="font-semibold text-sky-800 underline decoration-sky-300 underline-offset-2 hover:text-sky-950"
              >
                qué es el SUA y dónde se coloca esta información
              </Link>
              . Si ya se te pasó el 17, el SIPARE nuevo se arma con esta misma
              tasa y la fecha de pago que elijas —ya con recargos. Las tasas
              anuales están en{" "}
              <Link
                href="/herramientas/recargos-federales"
                className="font-semibold text-sky-800 underline decoration-sky-300 underline-offset-2 hover:text-sky-950"
              >
                tasas de recargos {ultimo.anio}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

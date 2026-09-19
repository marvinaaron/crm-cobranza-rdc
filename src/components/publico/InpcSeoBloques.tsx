import Link from "next/link";
import BotonCopiar from "@/components/publico/BotonCopiar";
import {
  nombreMesInpc,
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

/**
 * Texto indexable debajo de la gráfica: recuadros de uso + definición.
 */
export default function InpcSeoBloques({ serie }: { serie: RegistroInpc[] }) {
  const ultimo = ultimoRegistroInpc(serie);
  const recargos = recargosDelAnio(ultimo.anio);
  const valor = ultimo.valor.toFixed(3);
  const mes = nombreMesInpc(ultimo.mes);
  const mora = recargos.mora.toFixed(2);

  return (
    <section className="mt-8 space-y-8 text-slate-600">
      <div className="grid sm:grid-cols-3 gap-4">
        <article className="rounded-2xl bg-white ring-1 ring-slate-200 px-5 py-7 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-marca-navy/5 text-marca-navy flex items-center justify-center">
            <IconoSua />
          </div>
          <h3 className="mt-4 text-base font-black text-slate-900 tracking-tight">
            Para el SUA este mes
          </h3>
          <p className="mt-3 text-sm font-semibold text-slate-500">{mes} {ultimo.anio}</p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <p className="text-2xl font-black tabular-nums text-marca-navy leading-none">
              {valor}
            </p>
            <BotonCopiar valor={valor} etiqueta="INPC" />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <p className="text-sm font-bold text-slate-800">
              Recargos {mora}%
            </p>
            <BotonCopiar valor={mora} etiqueta="recargos" />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Utilerías → Actualizar INPC y Recargos
          </p>
        </article>

        <Link
          href={SLUG_SUA}
          className="rounded-2xl bg-white ring-1 ring-slate-200 px-5 py-7 text-center hover:ring-marca-navy/30 hover:shadow-sm transition"
        >
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
          className="rounded-2xl bg-white ring-1 ring-slate-200 px-5 py-7 text-center hover:ring-marca-navy/30 hover:shadow-sm transition"
        >
          <div className="mx-auto w-12 h-12 rounded-xl bg-marca-navy/5 text-marca-navy flex items-center justify-center">
            <IconoUsoFiscal />
          </div>
          <h3 className="mt-4 text-base font-black text-slate-900 tracking-tight">
            Uso fiscal del INPC
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Actualización de créditos, contratos y tasas de recargos {ultimo.anio}.
            Mora {mora}% lista para copiar al SUA.
          </p>
        </Link>
      </div>

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

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          ¿Cómo interpretar el INPC histórico?
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          La base de referencia es la segunda quincena de julio de 2018, cuando
          el índice vale 100. Un INPC de {valor} en {mes.toLowerCase()} de{" "}
          {ultimo.anio} significa que la canasta del INEGI cuesta, en promedio,
          {(ultimo.valor - 100).toFixed(1)}% más que en esa quincena de 2018.
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

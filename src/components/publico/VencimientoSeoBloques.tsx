import Link from "next/link";
import { TABLA_SEXTO_DIGITO_SAT } from "@/lib/portal/fechas-fiscales";

const SLUG_BLOG = "/blog/cuando-vence-mi-declaracion-segun-rfc";

/**
 * Texto y tablas en HTML de servidor: es lo que Google cita para
 * “cómo saber cuándo vence mi declaración”, no un acordeón.
 */
export default function VencimientoSeoBloques() {
  return (
    <section className="mt-10 space-y-8 text-slate-600">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Cómo saber cuándo vence tu declaración ante el SAT
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          Para saber cuándo vence tu declaración ante el Servicio de
          Administración Tributaria (SAT), primero identifica si te corresponde
          una{" "}
          <strong className="text-slate-800 font-semibold">
            declaración anual
          </strong>{" "}
          o{" "}
          <strong className="text-slate-800 font-semibold">
            declaraciones mensuales
          </strong>
          . Abajo están los plazos oficiales. Para la mensual de ISR e IVA, esta
          calculadora te da la fecha exacta con tu RFC.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <article className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-violet-100 shadow-sm px-5 py-5">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
          />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Una vez al año
          </p>
          <h3 className="mt-1 text-base font-black text-slate-900">
            Declaración anual
          </h3>
          <p className="mt-2 text-sm leading-relaxed">
            Suma ingresos y gastos del año anterior. No usa el sexto dígito del
            RFC.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <strong className="text-slate-800">Personas físicas</strong>{" "}
              (empleados, profesionistas, arrendadores): fecha límite el{" "}
              <strong className="tabular-nums">30 de abril</strong> de cada año.
            </li>
            <li>
              <strong className="text-slate-800">Personas morales</strong>{" "}
              (empresas y sociedades): fecha límite el{" "}
              <strong className="tabular-nums">31 de marzo</strong> de cada año.
            </li>
          </ul>
        </article>

        <article className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-amber-100 shadow-sm px-5 py-5">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
          />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Mes con mes
          </p>
          <h3 className="mt-1 text-base font-black text-slate-900">
            Declaraciones mensuales o provisionales
          </h3>
          <p className="mt-2 text-sm leading-relaxed">
            Si tu régimen declara mes con mes (actividad empresarial, servicios
            profesionales o RESICO), el SAT parte del{" "}
            <strong className="text-slate-800">día 17 del mes siguiente</strong>{" "}
            al que estás declarando. Ejemplo: los impuestos de agosto se
            declaran a más tardar el 17 de septiembre, más los días extra de tu
            RFC.
          </p>
        </article>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-sky-100 shadow-sm">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600"
        />
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-slate-900">
            Días extra por RFC (facilidad del SAT)
          </h2>
          <p className="mt-2 text-sm sm:text-base leading-relaxed">
            El Portal del SAT otorga de 1 a 5 días hábiles adicionales después
            del 17, según el{" "}
            <strong className="text-slate-800 font-semibold">
              sexto dígito numérico
            </strong>{" "}
            de tu RFC (no la homoclave: el sexto número del RFC).
          </p>
        </div>
        <table className="w-full text-sm">
          <caption className="sr-only">
            Días hábiles extra de vencimiento según el sexto dígito del RFC
          </caption>
          <thead>
            <tr className="text-slate-500 border-y border-slate-100 bg-slate-50">
              <th className="text-left font-bold uppercase tracking-wider text-[10px] px-5 py-2.5">
                Si el 6º dígito termina en
              </th>
              <th className="text-right font-bold uppercase tracking-wider text-[10px] px-5 py-2.5">
                Días hábiles extra
              </th>
            </tr>
          </thead>
          <tbody>
            {TABLA_SEXTO_DIGITO_SAT.map((fila) => (
              <tr key={fila.rango} className="border-b border-slate-50">
                <td className="px-5 py-2.5 font-semibold text-slate-800">
                  {fila.rango}
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums font-black text-marca-navy">
                  + {fila.dias} {fila.dias === 1 ? "día hábil" : "días hábiles"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-5 py-3 text-xs text-slate-400">
          Fuente: facilidad de vencimiento del SAT para declaraciones mensuales
          federales (ISR e IVA).
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          ¿Qué pasa si el vencimiento cae en fin de semana o día festivo?
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          Si el día de tu vencimiento cae en sábado, domingo o día festivo
          oficial, el plazo se recorre automáticamente al siguiente día hábil.
          Los días extra del RFC tampoco cuentan sábados, domingos ni festivos:
          solo días hábiles.
        </p>
      </div>

      <p className="text-sm leading-relaxed">
        Paso a paso, con ejemplos, en{" "}
        <Link
          href={SLUG_BLOG}
          className="font-semibold text-amber-800 underline decoration-amber-300 underline-offset-2 hover:text-amber-950"
        >
          cuándo vence tu declaración según el RFC
        </Link>
        . La calculadora de arriba aplica esas mismas reglas a tu RFC, mes y
        año, en el navegador: no guardamos la clave.
      </p>
    </section>
  );
}

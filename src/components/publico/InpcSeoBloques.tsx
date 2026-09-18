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
 * Texto y lista de valores en HTML para que Google indexe el INPC
 * con una definición clara, los meses del año y el uso en el SUA.
 */
export default function InpcSeoBloques({ serie }: { serie: RegistroInpc[] }) {
  const ultimo = ultimoRegistroInpc(serie);
  const meses = registrosInpcAnio(ultimo.anio, serie);
  const recargos = recargosDelAnio(ultimo.anio);

  return (
    <section className="mt-8 space-y-8 text-slate-600">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          ¿Qué es el INPC {ultimo.anio}?
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          El INPC {ultimo.anio} es el valor actualizado del Índice Nacional de
          Precios al Consumidor para este año en México. El INEGI lo publica
          cada quincena y sirve para ver la inflación y para actualizar montos
          en pesos: rentas, contratos, honorarios y adeudos fiscales.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Valores del INPC en {ultimo.anio}
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          Cierre mensual. El último dato es{" "}
          <strong className="text-slate-800 font-semibold">
            {ultimo.valor.toFixed(3)}
          </strong>{" "}
          ({nombreMesInpc(ultimo.mes).toLowerCase()} {ultimo.anio}). Se
          actualiza cuando el INEGI publica el mes.
        </p>
        <ul className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-sm">
          {meses.map((r) => (
            <li key={`${r.anio}-${r.mes}`}>
              <span className="font-semibold text-slate-800">
                {nombreMesInpc(r.mes)}:
              </span>{" "}
              <span className="tabular-nums">{r.valor.toFixed(3)}</span>
            </li>
          ))}
        </ul>
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
              . Las tasas anuales están en{" "}
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

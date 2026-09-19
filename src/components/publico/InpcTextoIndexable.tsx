import {
  nombreMesInpc,
  ultimoRegistroInpc,
  type RegistroInpc,
} from "@/lib/fiscal/inpc";

function valorDe(
  serie: RegistroInpc[],
  anio: number,
  mes: number
): number | null {
  return serie.find((r) => r.anio === anio && r.mes === mes)?.valor ?? null;
}

/**
 * Texto y tabla mes a mes en HTML de servidor: es lo que Google cita
 * (definición + “valores del INPC en 2026 por mes”), no un recuadro.
 */
export default function InpcTextoIndexable({ serie }: { serie: RegistroInpc[] }) {
  const ultimo = ultimoRegistroInpc(serie);
  const anio = ultimo.anio;
  const previo = anio - 1;
  const valor = ultimo.valor.toFixed(3);
  const mes = nombreMesInpc(ultimo.mes);
  const mesMin = mes.toLowerCase();

  return (
    <section className="mb-8 space-y-6 text-slate-600">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          ¿Qué es el INPC {anio}?
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          El INPC {anio} es el valor actualizado del Índice Nacional de Precios
          al Consumidor para el año {anio} en México. El INPC es publicado
          quincenalmente por el INEGI y{" "}
          <strong className="text-slate-800 font-semibold">
            mide la inflación
          </strong>{" "}
          mediante el seguimiento de los precios de una canasta de bienes y
          servicios representativa del consumo de los hogares mexicanos. El
          valor del Índice Nacional de Precios al Consumidor (INPC) en {mesMin}{" "}
          de {anio} es de{" "}
          <strong className="text-slate-800 font-semibold tabular-nums">
            {valor} puntos
          </strong>
          , de acuerdo con las cifras oficiales del INEGI.
        </p>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Valores del INPC en {anio} por mes
        </h2>
        <p className="mt-2 mb-3 text-sm sm:text-base leading-relaxed">
          Tabla del INPC {anio} (base 2018 = 100) frente al mismo mes de {previo}.
          El último dato es{" "}
          <strong className="text-slate-800 font-semibold tabular-nums">
            {valor}
          </strong>{" "}
          ({mesMin} {anio}).
        </p>
        <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200 bg-white">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Valores del INPC en {anio} por mes, comparados con {previo}
            </caption>
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="text-left font-bold uppercase tracking-wider text-[10px] px-4 py-2.5">
                  Mes
                </th>
                <th className="text-right font-bold uppercase tracking-wider text-[10px] px-4 py-2.5">
                  INPC {anio}
                </th>
                <th className="text-right font-bold uppercase tracking-wider text-[10px] px-4 py-2.5">
                  INPC {previo}
                </th>
                <th className="text-right font-bold uppercase tracking-wider text-[10px] px-4 py-2.5">
                  Var. anual
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                const actual = valorDe(serie, anio, m);
                const anterior = valorDe(serie, previo, m);
                const varAnual =
                  actual != null && anterior != null && anterior !== 0
                    ? ((actual - anterior) / anterior) * 100
                    : null;
                const esUltimo = m === ultimo.mes;
                return (
                  <tr key={m} className={esUltimo ? "bg-indigo-50/70" : "bg-white"}>
                    <td className="px-4 py-2 font-semibold text-slate-800">
                      {nombreMesInpc(m)} {anio}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-slate-800">
                      {actual == null ? "—" : actual.toFixed(3)}
                      {esUltimo && actual != null ? (
                        <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-marca-navy">
                          último
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-slate-500">
                      {anterior == null ? "—" : anterior.toFixed(3)}
                    </td>
                    <td
                      className={`px-4 py-2 text-right tabular-nums font-semibold ${
                        varAnual == null
                          ? "text-slate-300"
                          : varAnual >= 0
                            ? "text-emerald-700"
                            : "text-rose-700"
                      }`}
                    >
                      {varAnual == null
                        ? "—"
                        : `${varAnual >= 0 ? "+" : ""}${varAnual.toFixed(2)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Fuente: INEGI. Base 100 = segunda quincena de julio de 2018.
        </p>
      </div>
    </section>
  );
}

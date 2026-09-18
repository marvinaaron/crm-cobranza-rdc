import {
  nombreMesInpc,
  registrosInpcAnio,
  ultimoRegistroInpc,
  type RegistroInpc,
} from "@/lib/fiscal/inpc";

/**
 * Texto y lista de valores en HTML para que Google indexe el INPC
 * con una definición clara y los meses del año vigente.
 */
export default function InpcSeoBloques({ serie }: { serie: RegistroInpc[] }) {
  const ultimo = ultimoRegistroInpc(serie);
  const meses = registrosInpcAnio(ultimo.anio, serie);

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
    </section>
  );
}

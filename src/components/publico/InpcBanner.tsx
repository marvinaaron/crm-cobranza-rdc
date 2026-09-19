import BotonCopiar from "@/components/publico/BotonCopiar";
import {
  nombreMesInpc,
  ultimoRegistroInpc,
  type RegistroInpc,
} from "@/lib/fiscal/inpc";

/**
 * Franja navy a todo lo ancho (estilo portal de indicadores):
 * título + definición a la izquierda, último INPC con copiar a la derecha.
 * El número sale de la misma serie que la tabla: se actualiza solo.
 */
export default function InpcBanner({
  serie,
  h1,
}: {
  serie: RegistroInpc[];
  h1: string;
}) {
  const ultimo = ultimoRegistroInpc(serie);
  const valor = ultimo.valor.toFixed(3);
  const mes = nombreMesInpc(ultimo.mes);

  return (
    <div className="bg-marca-navy text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 lg:gap-10">
          <div className="min-w-0 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[2.15rem] font-black tracking-tight leading-tight">
              {h1}
            </h1>
            <p className="mt-3 text-sm sm:text-[15px] text-white/80 leading-relaxed">
              El INPC es publicado quincenalmente por el INEGI y{" "}
              <strong className="font-semibold text-white">
                mide la inflación
              </strong>{" "}
              mediante el seguimiento de los precios de una canasta de bienes y
              servicios representativa del consumo de los hogares mexicanos.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-[17.5rem]">
            <div className="rounded-xl bg-white text-slate-900 ring-2 ring-marca-acento-soft px-5 py-4 shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-navy">
                INPC actual
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <p className="text-4xl font-black tabular-nums tracking-tight text-marca-navy leading-none">
                  {valor}
                </p>
                <BotonCopiar valor={valor} etiqueta="INPC" />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                {mes} {ultimo.anio}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

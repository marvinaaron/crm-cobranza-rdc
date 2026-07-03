import {
  bandera,
  ladoTexto,
  type FaseMundial,
  type PartidoMundial,
} from "@/lib/mundial/datos";

/**
 * Bracket sencillo y responsivo de la fase final (octavos → final, más el
 * partido por el tercer puesto). Se desplaza horizontal en pantallas chicas.
 * Mientras no se definan los cruces, cada lado muestra su etiqueta de origen
 * ("Ganador P74"); cuando hay selección y marcador, se reflejan con bandera.
 */

function Lado({
  nombre,
  etiqueta,
  marcador,
}: {
  nombre: string | null;
  etiqueta: string | undefined;
  marcador?: string;
}) {
  const flag = bandera(nombre);
  return (
    <div className="flex items-center gap-1.5">
      {flag ? (
        <span className="shrink-0 text-sm leading-none">{flag}</span>
      ) : (
        <span className="h-3 w-3 shrink-0 rounded-full bg-slate-200 dark:bg-white/10" />
      )}
      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
        {ladoTexto(nombre, etiqueta)}
      </span>
      {marcador && (
        <span className="shrink-0 text-[11px] font-black tabular-nums text-slate-900 dark:text-white">
          {marcador}
        </span>
      )}
    </div>
  );
}

function Tarjeta({ p }: { p: PartidoMundial }) {
  const [golLocal, golVisitante] = (p.marcador ?? "-").split("-");
  const esMexico = p.local === "México" || p.visitante === "México";
  return (
    <div
      className={`w-44 rounded-xl border px-2.5 py-2 shadow-sm ${
        esMexico
          ? "border-slate-400 bg-slate-100 dark:border-white/20 dark:bg-white/5"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
      }`}
    >
      <Lado
        nombre={p.local}
        etiqueta={p.etiquetaLocal}
        marcador={p.marcador ? golLocal : undefined}
      />
      <div className="my-1 border-t border-slate-100 dark:border-white/5" />
      <Lado
        nombre={p.visitante}
        etiqueta={p.etiquetaVisitante}
        marcador={p.marcador ? golVisitante : undefined}
      />
    </div>
  );
}

function Columna({
  titulo,
  partidos,
}: {
  titulo: string;
  partidos: PartidoMundial[];
}) {
  return (
    <div className="flex min-w-[11.5rem] flex-1 flex-col">
      <h3 className="mb-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
        {titulo}
      </h3>
      <div className="flex flex-1 flex-col justify-around gap-3">
        {partidos.map((p) => (
          <Tarjeta key={p.n} p={p} />
        ))}
      </div>
    </div>
  );
}

export default function BracketMundial({
  partidos,
}: {
  partidos: PartidoMundial[];
}) {
  const de = (fase: FaseMundial) =>
    partidos.filter((p) => p.fase === fase).sort((a, b) => a.n - b.n);

  const dieciseisavos = de("dieciseisavos");
  const octavos = de("octavos");
  const cuartos = de("cuartos");
  const semis = de("semifinal");
  const final = de("final");
  const tercero = de("tercer_puesto");

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-slate-900/40">
      <div className="flex min-w-[56rem] items-stretch gap-3">
        <Columna titulo="Dieciseisavos" partidos={dieciseisavos} />
        <Columna titulo="Octavos" partidos={octavos} />
        <Columna titulo="Cuartos" partidos={cuartos} />
        <Columna titulo="Semifinal" partidos={semis} />
        <div className="flex min-w-[11.5rem] flex-1 flex-col">
          <h3 className="mb-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Final
          </h3>
          <div className="flex flex-1 flex-col justify-center gap-4">
            <div className="relative">
              <span className="mb-1 flex justify-center" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </span>
              {final.map((p) => (
                <Tarjeta key={p.n} p={p} />
              ))}
            </div>
            {tercero.map((p) => (
              <div key={p.n}>
                <p className="mb-1 text-center text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  3.er lugar
                </p>
                <Tarjeta p={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

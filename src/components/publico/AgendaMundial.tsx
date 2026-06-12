import {
  FASE_LABEL,
  bandera,
  ladoTexto,
  type PartidoMundial,
} from "@/lib/mundial/datos";

/**
 * Agenda del Mundial agrupada por día (estilo marcador deportivo): cada día
 * es un encabezado pegajoso y cada partido una fila con banderas, marcador (o
 * hora) y selecciones. Va dentro de una tarjeta con scroll para no alargar la
 * página. Los días se etiquetan "Hoy"/"Mañana" según la fecha de México.
 */

const DIAS = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Fecha de hoy en México (UTC-6, sin horario de verano) como "YYYY-MM-DD". */
function hoyMexico(): string {
  return new Date(Date.now() - 6 * 3600 * 1000).toISOString().slice(0, 10);
}

function sumarDias(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const f = new Date(Date.UTC(y, m - 1, d + n, 12));
  return f.toISOString().slice(0, 10);
}

function etiquetaDia(iso: string, hoy: string): string {
  if (iso === hoy) return "Hoy";
  if (iso === sumarDias(hoy, 1)) return "Mañana";
  const [y, m, d] = iso.split("-").map(Number);
  const f = new Date(Date.UTC(y, m - 1, d, 12));
  return `${DIAS[f.getUTCDay()]} ${d} de ${MESES[m - 1]}`;
}

function Lado({
  nombre,
  etiqueta,
  alineacion,
}: {
  nombre: string | null;
  etiqueta: string | undefined;
  alineacion: "izq" | "der";
}) {
  const flag = bandera(nombre);
  const texto = ladoTexto(nombre, etiqueta);
  if (alineacion === "der") {
    return (
      <div className="flex min-w-0 items-center justify-end gap-2 text-right">
        <span className="truncate text-[13px] font-semibold text-slate-700 dark:text-slate-200">
          {texto}
        </span>
        {flag && <span className="shrink-0 text-lg leading-none">{flag}</span>}
      </div>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-2">
      {flag && <span className="shrink-0 text-lg leading-none">{flag}</span>}
      <span className="truncate text-[13px] font-semibold text-slate-700 dark:text-slate-200">
        {texto}
      </span>
    </div>
  );
}

function FilaPartido({ p }: { p: PartidoMundial }) {
  const esMexico = p.local === "México" || p.visitante === "México";
  return (
    <div
      className={`grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5 sm:gap-3 ${
        esMexico ? "bg-slate-100 dark:bg-white/5" : ""
      }`}
    >
      <Lado nombre={p.local} etiqueta={p.etiquetaLocal} alineacion="der" />

      <div className="flex w-16 shrink-0 flex-col items-center">
        {p.marcador ? (
          <span className="rounded-md bg-slate-900 px-2 py-0.5 text-xs font-black tabular-nums text-white dark:bg-white dark:text-slate-900">
            {p.marcador}
          </span>
        ) : (
          <span className="text-xs font-black tabular-nums text-slate-500 dark:text-slate-300">
            {p.horaMex}
          </span>
        )}
        <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-slate-400">
          {p.fase === "grupos" ? `Grupo ${p.grupo}` : FASE_LABEL[p.fase]}
        </span>
      </div>

      <Lado nombre={p.visitante} etiqueta={p.etiquetaVisitante} alineacion="izq" />
    </div>
  );
}

export default function AgendaMundial({
  partidos,
}: {
  partidos: PartidoMundial[];
}) {
  const hoy = hoyMexico();

  const mapa = new Map<string, PartidoMundial[]>();
  for (const p of partidos) {
    const lista = mapa.get(p.fecha) ?? [];
    lista.push(p);
    mapa.set(p.fecha, lista);
  }
  const dias = [...mapa.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, lista]) => ({
      fecha,
      lista: lista.sort((a, b) => a.horaMex.localeCompare(b.horaMex)),
    }));

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-slate-900">
      <div className="max-h-[30rem] overflow-y-auto">
        {dias.map(({ fecha, lista }) => (
          <div key={fecha}>
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-900 px-4 py-2 dark:border-white/10 dark:bg-white">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-white dark:text-slate-900">
                {etiquetaDia(fecha, hoy)}
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {lista.map((p) => (
                <FilaPartido key={p.n} p={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

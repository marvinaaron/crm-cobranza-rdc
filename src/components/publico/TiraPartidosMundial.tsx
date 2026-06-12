import { bandera, type PartidoMundial } from "@/lib/mundial/datos";

/**
 * Tira horizontal de partidos en miniatura que se desplaza sola (marquee CSS).
 * Muestra solo lo esencial: banderas, marcador (o "vs") y fecha. La magia
 * real es el botón de suscripción; esto es un vistazo decorativo.
 */

const MESES_CORTOS = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

function fechaCorta(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES_CORTOS[m - 1]}`;
}

function MiniPartido({ p }: { p: PartidoMundial }) {
  const esMexico = p.local === "México" || p.visitante === "México";
  return (
    <div
      className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl border px-4 py-2.5 ${
        esMexico
          ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/50"
      }`}
    >
      <div className="flex items-center gap-2 text-xl leading-none">
        <span aria-hidden>{bandera(p.local)}</span>
        {p.marcador ? (
          <span className="rounded-md bg-slate-900 px-1.5 py-0.5 text-xs font-black tabular-nums text-white dark:bg-white dark:text-slate-900">
            {p.marcador}
          </span>
        ) : (
          <span className="text-[11px] font-bold text-slate-400">vs</span>
        )}
        <span aria-hidden>{bandera(p.visitante)}</span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {fechaCorta(p.fecha)} · {p.horaMex}
      </span>
    </div>
  );
}

export default function TiraPartidosMundial({
  partidos,
}: {
  partidos: PartidoMundial[];
}) {
  // Solo los que tienen ambas selecciones definidas (fase de grupos) para que
  // la tira siempre muestre banderas.
  const conBanderas = partidos.filter((p) => p.local && p.visitante);
  // Duplicamos la lista para que el bucle del marquee sea continuo.
  const secuencia = [...conBanderas, ...conBanderas];

  return (
    <div className="relative overflow-hidden">
      {/* Difuminado en los bordes para que entre/salga suave. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent dark:from-slate-950" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent dark:from-slate-950" />

      <div className="mundial-marquee flex gap-3 py-1">
        {secuencia.map((p, i) => (
          <MiniPartido key={`${p.n}-${i}`} p={p} />
        ))}
      </div>
    </div>
  );
}

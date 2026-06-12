import Link from "next/link";
import TrofeoMundial from "@/components/publico/TrofeoMundial";

/**
 * Banner temporal de la home (mientras dura el Mundial): "RDC te acompaña en
 * el Mundial" con confeti pequeño y un trofeo dorado animado (CSS puro, sin
 * JS). Para retirarlo al terminar el torneo basta con quitar <BannerMundial />
 * de src/app/page.tsx.
 *
 * Las piezas de confeti son deterministas (derivadas del índice) para que el
 * render del servidor y del cliente coincidan y no haya hidratación rota.
 */

const COLORES = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#0ea5e9", // sky
];

const PIEZAS = Array.from({ length: 22 }, (_, i) => {
  const left = (i * 53 + 7) % 100; // distribución pseudo-uniforme
  const delay = (i % 6) * 0.65 + (i % 3) * 0.2;
  const duration = 3.6 + (i % 5) * 0.5;
  const color = COLORES[i % COLORES.length];
  const redondo = i % 4 === 0;
  return { left, delay, duration, color, redondo };
});

function TrofeoDorado() {
  return (
    <div className="relative flex h-36 w-28 items-center justify-center sm:h-44 sm:w-32">
      {/* Halo dorado pulsante */}
      <div
        className="mundial-trofeo-glow absolute inset-0 rounded-full bg-amber-300/40 blur-2xl"
        aria-hidden="true"
      />
      <TrofeoMundial className="relative h-36 sm:h-44" animado />
    </div>
  );
}

export default function BannerMundial() {
  return (
    <section className="px-4 pt-4 pb-6 sm:px-6 sm:pt-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-amber-50/70 px-6 py-8 shadow-[0_20px_60px_-30px_rgba(79,70,229,0.4)] sm:px-10 sm:py-10">
        {/* Brillo diagonal que cruza el banner */}
        <div
          className="mundial-brillo pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          aria-hidden="true"
        />

        {/* Confeti pequeño contenido */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {PIEZAS.map((p, i) => (
            <span
              key={i}
              className="mundial-confetti-piece"
              style={{
                left: `${p.left}%`,
                backgroundColor: p.color,
                borderRadius: p.redondo ? "9999px" : "2px",
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-8 sm:text-left">
          <TrofeoDorado />

          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-amber-700">
              ⚽ Edición Mundial 2026
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              RDC te acompaña en el{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Mundial 2026
              </span>
            </h2>
            <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-slate-500 sm:mx-0 sm:text-base">
              Llévate todos los partidos en tu calendario. Te regalamos el
              fixture completo con horarios de México que se actualiza solo.
            </p>
            <Link
              href="/mundial-2026"
              className="mundial-cta mt-6 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-black text-white shadow-xl shadow-indigo-500/30 transition hover:scale-[1.03] active:scale-95 [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]"
            >
              📲 Baja el calendario a tu celular
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

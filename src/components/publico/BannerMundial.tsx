import Link from "next/link";

/**
 * Banner festivo de la home: "RDC te acompaña en el Mundial" con confeti
 * pequeño (CSS puro, sin JS) y botón al calendario suscribible.
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

const PIEZAS = Array.from({ length: 18 }, (_, i) => {
  const left = (i * 53 + 7) % 100; // distribución pseudo-uniforme
  const delay = (i % 6) * 0.65 + (i % 3) * 0.2;
  const duration = 3.6 + (i % 5) * 0.5;
  const color = COLORES[i % COLORES.length];
  const redondo = i % 4 === 0;
  return { left, delay, duration, color, redondo };
});

export default function BannerMundial() {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 py-10 text-center shadow-[0_20px_60px_-30px_rgba(79,70,229,0.4)] sm:px-10 sm:py-12">
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

        <div className="relative">
          <span className="text-4xl sm:text-5xl" aria-hidden="true">
            🏆⚽
          </span>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            RDC te acompaña en el{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Mundial 2026
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
            Llévate todos los partidos en tu calendario. Te regalamos el fixture
            completo con horarios de México que se actualiza solo.
          </p>
          <Link
            href="/mundial-2026"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:opacity-90 active:scale-[0.98]"
          >
            Ver el calendario del Mundial →
          </Link>
        </div>
      </div>
    </section>
  );
}

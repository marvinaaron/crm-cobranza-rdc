import Link from "next/link";

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
    <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
      {/* Halo dorado pulsante */}
      <div
        className="mundial-trofeo-glow absolute inset-0 rounded-full bg-amber-300/40 blur-2xl"
        aria-hidden="true"
      />
      <svg
        className="mundial-trofeo relative drop-shadow-[0_10px_20px_rgba(180,120,0,0.35)]"
        width="120"
        height="120"
        viewBox="0 0 100 100"
        fill="none"
        role="img"
        aria-label="Trofeo dorado"
      >
        <defs>
          <linearGradient id="oro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="oroClaro" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        {/* Asas */}
        <path
          d="M26 26c-12 0-16 8-12 18 3 7 10 9 16 9"
          stroke="url(#oro)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M74 26c12 0 16 8 12 18-3 7-10 9-16 9"
          stroke="url(#oro)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Copa */}
        <path
          d="M28 18h44v14c0 14-9 26-22 26S28 46 28 32V18z"
          fill="url(#oro)"
        />
        <path d="M34 22h32v9c0 11-7 20-16 20S34 42 34 31v-9z" fill="url(#oroClaro)" opacity="0.55" />
        {/* Tallo y base */}
        <rect x="46" y="60" width="8" height="12" fill="url(#oro)" />
        <rect x="34" y="72" width="32" height="7" rx="2" fill="url(#oro)" />
        <rect x="30" y="79" width="40" height="8" rx="3" fill="url(#oro)" />
        {/* Estrella central */}
        <path
          d="M50 28l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L50 28z"
          fill="#fffbeb"
          opacity="0.9"
        />
      </svg>
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
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:opacity-90 active:scale-[0.98]"
            >
              Ver el calendario del Mundial →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

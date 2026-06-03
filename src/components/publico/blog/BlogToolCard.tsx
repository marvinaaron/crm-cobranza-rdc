import Link from "next/link";

export type HerramientaDestacada = {
  eyebrow?: string;
  titulo: string;
  descripcion: string;
  etiquetaBoton: string;
  href: string;
};

/**
 * Tarjeta-gancho que promociona una herramienta relacionada dentro de un
 * artículo (estilo "deja de adivinar, mejor calcúlalo"). Diseñada para
 * llamar la atención: bloque navy con gradiente radial, halo violeta,
 * patrón de puntos y un botón claro. Se usa en el sidebar (desktop) y de
 * forma inline en mobile.
 *
 * `compacto` reduce paddings para el sidebar.
 */
export default function BlogToolCard({
  herramienta,
  compacto = false,
}: {
  herramienta: HerramientaDestacada;
  compacto?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl text-white shadow-xl ring-1 ring-marca-navy/40 bg-[radial-gradient(circle_at_20%_15%,#1e3a5f_0%,#0f1d2e_50%,#0a1424_100%)] ${
        compacto ? "p-5" : "p-6 sm:p-7"
      }`}
    >
      {/* Halo violeta + patrón de puntos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-12 w-44 h-44 rounded-full bg-violet-500/25 blur-3xl transition-transform duration-500 group-hover:scale-125"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.6) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative">
        {/* Eyebrow con icono de calculadora */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 ring-1 ring-white/15 text-white"
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="16" y1="14" x2="16" y2="18" />
              <line x1="8" y1="18" x2="12" y2="18" />
              <line x1="8" y1="10" x2="8.01" y2="10" />
              <line x1="12" y1="10" x2="12.01" y2="10" />
              <line x1="8" y1="14" x2="8.01" y2="14" />
            </svg>
          </span>
          {herramienta.eyebrow && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-[10px] font-black uppercase tracking-widest shadow-sm">
              {herramienta.eyebrow}
            </span>
          )}
        </div>

        <p className={`font-black leading-tight ${compacto ? "text-lg" : "text-xl sm:text-2xl"}`}>
          {herramienta.titulo}
        </p>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">
          {herramienta.descripcion}
        </p>

        <Link
          href={herramienta.href}
          className="group/btn mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-marca-navy text-sm font-black hover:bg-slate-50 transition-all hover:-translate-y-0.5 shadow-lg"
        >
          {herramienta.etiquetaBoton}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover/btn:translate-x-1"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/45">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
            aria-hidden="true"
          />
          Gratis · sin registro · resultado al instante
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";

export type HerramientaDestacada = {
  eyebrow?: string;
  titulo: string;
  descripcion: string;
  etiquetaBoton: string;
  href: string;
};

const ICONO_CALCULADORA = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="16" y1="14" x2="16" y2="18" />
    <line x1="8" y1="18" x2="12" y2="18" />
    <line x1="8" y1="10" x2="8.01" y2="10" />
    <line x1="12" y1="10" x2="12.01" y2="10" />
    <line x1="8" y1="14" x2="8.01" y2="14" />
  </svg>
);

const ICONO_RFC = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="11" r="2" />
    <path d="M6 17c.7-1.5 2-2.5 3-2.5s2.3 1 3 2.5" />
    <line x1="14" y1="9" x2="18" y2="9" />
    <line x1="14" y1="13" x2="18" y2="13" />
  </svg>
);

/**
 * Tarjeta-gancho que promociona una herramienta relacionada dentro de un
 * artículo (estilo "deja de adivinar, mejor calcúlalo"). Diseñada para
 * llamar la atención: bloque navy con gradiente radial, halo violeta,
 * patrón de puntos y un botón claro. Se usa en el sidebar (desktop) y de
 * forma inline en mobile.
 *
 * `variante="complementaria"` usa tema índigo para herramientas previas
 * en el flujo (ej. calculadora de RFC antes del vencimiento).
 */
export default function BlogToolCard({
  herramienta,
  compacto = false,
  variante = "principal",
}: {
  herramienta: HerramientaDestacada;
  compacto?: boolean;
  variante?: "principal" | "complementaria";
}) {
  const esExterno = /^https?:\/\//.test(herramienta.href);
  const propsExternos = esExterno
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  const esComplementaria = variante === "complementaria";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl text-white shadow-xl ${
        esComplementaria
          ? "ring-2 ring-indigo-300/70 shadow-indigo-900/30 bg-[radial-gradient(circle_at_15%_10%,#4f46e5_0%,#312e81_45%,#1e1b4b_100%)]"
          : "ring-1 ring-marca-navy/40 bg-[radial-gradient(circle_at_20%_15%,#1e3a5f_0%,#0f1d2e_50%,#0a1424_100%)]"
      } ${compacto ? "p-5" : "p-6 sm:p-7"}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-16 -right-12 w-44 h-44 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-125 ${
          esComplementaria ? "bg-sky-400/30" : "bg-violet-500/25"
        }`}
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
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ring-1 text-white ${
              esComplementaria
                ? "bg-white/15 ring-white/25"
                : "bg-white/10 ring-white/15"
            }`}
            aria-hidden="true"
          >
            {esComplementaria ? ICONO_RFC : ICONO_CALCULADORA}
          </span>
          {herramienta.eyebrow && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                esComplementaria
                  ? "bg-white/20 text-white"
                  : "bg-gradient-to-r from-indigo-500 to-violet-500"
              }`}
            >
              {herramienta.eyebrow}
            </span>
          )}
        </div>

        <p
          className={`font-black leading-tight ${
            compacto ? "text-lg" : "text-xl sm:text-2xl"
          } ${esComplementaria ? "text-white" : ""}`}
        >
          {herramienta.titulo}
        </p>
        <p className="mt-2 text-sm text-white/75 leading-relaxed">
          {herramienta.descripcion}
        </p>

        <Link
          href={herramienta.href}
          {...propsExternos}
          className={`group/btn mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all hover:-translate-y-0.5 shadow-lg ${
            esComplementaria
              ? "bg-white text-indigo-700 hover:bg-indigo-50"
              : "bg-white text-marca-navy hover:bg-slate-50"
          }`}
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

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/50">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${
              esComplementaria ? "bg-sky-300" : "bg-emerald-400"
            }`}
            aria-hidden="true"
          />
          {esComplementaria
            ? "Gratis · 100% privado · con homoclave"
            : "Gratis · sin registro · resultado al instante"}
        </p>
      </div>
    </div>
  );
}

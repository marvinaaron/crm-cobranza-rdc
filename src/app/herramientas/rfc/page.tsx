import Link from "next/link";
import FaqAcordeon from "@/components/publico/FaqAcordeon";
import PanelRfc from "@/components/publico/PanelRfc";
import CalculadoraUsoEnvoltorio from "@/components/publico/CalculadoraUsoEnvoltorio";
import PublicShell from "@/components/publico/PublicShell";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const config = getHerramientaConfig("rfc");

export const metadata = buildHerramientaMetadata(config);

/**
 * Página dedicada del RFC. Diseño distinto a las demás herramientas
 * porque es una HERRAMIENTA INTERACTIVA (un formulario), no una página
 * de consulta:
 *
 *   1. Breadcrumb compacto
 *   2. Header con sellos de confianza (privacidad, instantáneo, gratis)
 *   3. PANEL DEL FORM como héroe (lo primero que llama la atención)
 *   4. Banner verde de privacidad reforzado debajo
 *   5. Sección "Cómo funciona" (intro educativa)
 *   6. FAQ
 *   7. Footer de contacto
 *
 * Las páginas de consulta (INPC, ISR, etc.) siguen usando el template
 * compartido `HerramientaFiscalPage` que pone la educación arriba.
 */
export default function RfcPage() {
  return (
    <PublicShell>
      <JsonLd data={buildHerramientaJsonLd(config)} />

      <article className="bg-slate-50">
        {/* HERO con decoraciones suaves: blobs de gradiente flotando
            en el fondo + grid pattern. Le dan profundidad sin estorbar
            al texto. */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-slate-100 pt-10 pb-6 sm:pt-14 sm:pb-8">
          {/* Blobs decorativos en tonos navy/sky para evitar morado */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-marca-navy/15 via-marca-navy/8 to-sky-200/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-sky-200/40 to-marca-navy/8 blur-3xl"
          />
          {/* Patrón de puntos navy sutil */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(15 29 46 / 0.5) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb minimalista */}
            <nav
              className="text-xs text-slate-500 mb-5"
              aria-label="Ruta de navegación"
            >
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-slate-900">
                    Inicio
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/herramientas" className="hover:text-slate-900">
                    Herramientas fiscales
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-slate-700 font-medium">{config.h1}</li>
              </ol>
            </nav>

            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                  aria-hidden="true"
                />
                Herramienta gratuita · RDC Contadores
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                  Calculadora de RFC
                </span>{" "}
                <span className="text-slate-800">con homoclave</span>
              </h1>
              <p className="mt-3 text-slate-600 sm:text-lg">
                {config.subtitulo}
              </p>

              {/* Chips de confianza: privacidad, velocidad, precio, fuente */}
              <ul className="mt-5 flex flex-wrap gap-2">
                <Chip
                  color="emerald"
                  icono={
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  }
                  label="100% privado"
                />
                <Chip
                  color="sky"
                  icono={
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  }
                  label="Instantáneo"
                />
                <Chip
                  color="amber"
                  icono={
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  }
                  label="Gratis · Sin registro"
                />
                <Chip
                  color="navy"
                  icono={
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  }
                  label="Algoritmo oficial SAT"
                />
              </ul>
            </div>
          </div>
        </section>

        {/* Strip compacta de "Cómo funciona". Va ARRIBA del form para
            que el usuario entienda el flujo en 2 segundos y se vaya
            directo a capturar. Reemplaza el bloque grande que estaba
            abajo y ocupaba toda una sección. */}
        <section className="pt-4 sm:pt-5 pb-2 sm:pb-3">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-marca-navy text-center mb-3">
              Así de simple
            </p>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
              {PASOS.map((paso, i) => (
                <li key={paso.numero} className="relative">
                  <div
                    className={`group relative h-full flex items-center gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-white ring-1 ${paso.ringBase} ${paso.ringHover} ${paso.hoverGradient} hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 transition-all cursor-default overflow-hidden`}
                  >
                    {/* Número GIGANTE estilo Netflix Top 10. Watermark al
                        fondo derecho. Reducido al achicar la card para que
                        siga "asomando" pero sin tapar el texto. */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none select-none absolute -right-2 sm:-right-3 -bottom-5 sm:-bottom-6 text-[88px] sm:text-[110px] leading-none font-black ${paso.numeroColor} transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:opacity-90`}
                      style={{
                        fontFamily:
                          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      {paso.numero}
                    </span>

                    {/* Icono saturado (gradiente sólido, no pastel). */}
                    <span
                      className={`relative z-10 shrink-0 inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg ${paso.iconoFondo} ${paso.iconoColor} transition-all group-hover:scale-110 group-hover:rotate-6 ${paso.iconoSombra}`}
                      aria-hidden="true"
                    >
                      {paso.icono}
                    </span>
                    <div className="relative z-10 min-w-0 flex-1">
                      <p
                        className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${paso.eyebrow} leading-none mb-1`}
                      >
                        Paso {paso.numero}
                      </p>
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        {paso.titulo}
                      </p>
                    </div>
                  </div>
                  {/* Flecha conectora entre cards (solo desktop) */}
                  {i < PASOS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden sm:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20 text-slate-400"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* PANEL DEL FORM — héroe */}
        <section className="pt-4 sm:pt-6 pb-10 sm:pb-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <CalculadoraUsoEnvoltorio herramienta="rfc">
              <div className="bg-white rounded-3xl ring-1 ring-slate-200 shadow-xl shadow-slate-200/50 p-5 sm:p-8 lg:p-10">
                <PanelRfc />
              </div>
            </CalculadoraUsoEnvoltorio>

            {/* Banner de privacidad amplificado, justo después del form
                para que el usuario vea: "ya calculaste? tranquilo, no
                guardamos nada". */}
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-50/50 ring-1 ring-emerald-200 p-5 flex items-start gap-4">
              <span
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm shadow-emerald-200"
                aria-hidden="true"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black text-emerald-900">
                  Tus datos NUNCA salen de tu navegador
                </p>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                  El cálculo del RFC corre <strong>100% en tu dispositivo</strong>{" "}
                  (no enviamos nombre, apellidos ni fecha de nacimiento a ningún
                  servidor). No guardamos historial, no usamos cookies de
                  tracking para esta herramienta. Es solo para consulta
                  informativa: puedes calcular tu RFC, el de tu familia, tus
                  empleados o tus clientes con total tranquilidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Detalle técnico del algoritmo SAT: queda como colapsable
            tipo "leer más" antes del FAQ. Mantiene el contenido SEO sin
            estorbar visualmente al usuario que solo quiere calcular. */}
        <section className="pb-2">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <details className="group rounded-2xl bg-white ring-1 ring-slate-200 hover:ring-slate-300 transition-all overflow-hidden">
              <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-slate-50 transition-colors">
                <span className="text-sm font-bold text-slate-700">
                  Detalle técnico del algoritmo SAT
                </span>
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 transition-transform group-open:rotate-180 group-open:bg-marca-navy/10 group-open:text-marca-navy"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 pt-4 border-t border-slate-200 space-y-3 text-sm text-slate-600 leading-relaxed">
                {config.intro.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </details>
          </div>
        </section>

        {/* FAQ */}
        {config.faq.length > 0 && (
          <section
            className="py-12 sm:py-14"
            aria-labelledby="faq-rfc"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                id="faq-rfc"
                className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-6"
              >
                Preguntas frecuentes
              </h2>
              <FaqAcordeon items={config.faq} labelledBy="faq-rfc" />
            </div>
          </section>
        )}

        {/* CTA final estilo /preguntas-frecuentes: gradiente oscuro,
            invita a contactar al despacho cuando el usuario tenga dudas
            que la calculadora no resuelve (homonimias, RFC moral, etc.). */}
        <section className="pb-16 sm:pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Misma receta visual que la card "$812 RESICO" de la home:
                radial-gradient navy + decoración sutil + ring marca-navy. */}
            <div className="relative overflow-hidden bg-[radial-gradient(circle_at_15%_15%,#1e3a5f_0%,#0f1d2e_45%,#0a1424_100%)] text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl ring-1 ring-marca-navy/40">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-sky-400/15 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-marca-navy-soft/40 blur-3xl"
              />

              <div className="relative">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/20">
                  ¿Necesitas más?
                </span>
                <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black">
                  ¿Necesitas ayuda para generar tu{" "}
                  <span className="text-white">Constancia de Situación Fiscal</span>?
                </h2>
                <p className="mt-3 text-white/80 max-w-xl mx-auto sm:text-base leading-relaxed">
                  Contáctanos y te ayudamos a obtenerla rápido, sin filas en el
                  SAT y con el respaldo de nuestro equipo de contadores.
                </p>
                <div className="mt-7 flex flex-wrap gap-3 justify-center">
                  <Link
                    href="/contacto"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-marca-navy text-sm font-bold hover:bg-slate-50 transition-all hover:-translate-y-0.5 shadow-lg"
                  >
                    Hablar con un asesor
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/herramientas"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 ring-1 ring-white/20 text-white text-sm font-bold hover:bg-white/15 backdrop-blur transition-colors"
                  >
                    Ver todas las herramientas
                  </Link>
                </div>
              </div>
            </div>

            <p className="mt-8 px-4 text-xs text-slate-500 text-center max-w-2xl mx-auto leading-relaxed">
              Información de referencia conforme al algoritmo público del SAT.
              Para trámites oficiales consulte con su contador.
            </p>
          </div>
        </section>
      </article>
    </PublicShell>
  );
}

/**
 * Pasos visuales de "cómo funciona". Tema cromático navy → navy
 * más saturado → emerald (completado) para sugerir progresión.
 */
const PASOS: Array<{
  numero: 1 | 2 | 3;
  titulo: string;
  descripcion: string;
  ringBase: string;
  ringHover: string;
  iconoFondo: string;
  iconoColor: string;
  iconoSombra: string;
  numeroColor: string;
  eyebrow: string;
  hoverGradient: string;
  icono: React.ReactNode;
}> = [
  {
    numero: 1,
    titulo: "Captura tus datos",
    descripcion:
      "Escribe nombre(s), apellidos y fecha de nacimiento. Funciona para mexicanos y extranjeros.",
    ringBase: "ring-indigo-200",
    ringHover: "hover:ring-indigo-500",
    iconoFondo: "bg-gradient-to-br from-indigo-500 to-indigo-700",
    iconoColor: "text-white",
    iconoSombra: "shadow-md shadow-indigo-300/50",
    numeroColor: "text-indigo-400/70",
    eyebrow: "text-indigo-600",
    hoverGradient: "hover:bg-gradient-to-br hover:from-indigo-50 hover:via-white hover:to-indigo-100/70",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
  {
    numero: 2,
    titulo: "Algoritmo del SAT",
    descripcion:
      "Calculamos las 4 letras del nombre, los 6 dígitos de la fecha y los 3 caracteres de homoclave (incluyendo dígito verificador).",
    ringBase: "ring-sky-200",
    ringHover: "hover:ring-sky-500",
    iconoFondo: "bg-gradient-to-br from-sky-500 to-sky-700",
    iconoColor: "text-white",
    iconoSombra: "shadow-md shadow-sky-300/50",
    numeroColor: "text-sky-400/70",
    eyebrow: "text-sky-600",
    hoverGradient: "hover:bg-gradient-to-br hover:from-sky-50 hover:via-white hover:to-sky-100/70",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.4 4.5 4.5 9.4l5 5 4.9-4.9-5-5Z" />
        <path d="m12 2 1.5 1.5" />
        <path d="m20 10 2 2" />
        <path d="m14 14 6 6" />
        <path d="M20.5 16.5 22 18" />
        <path d="m17 19 1 1" />
      </svg>
    ),
  },
  {
    numero: 3,
    titulo: "Recibe tu RFC al instante",
    descripcion:
      "Lo ves en pantalla con el desglose (letras + fecha + homoclave) y un botón para copiarlo. Sin guardar nada en ningún servidor.",
    ringBase: "ring-emerald-200",
    ringHover: "hover:ring-emerald-500",
    iconoFondo: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    iconoColor: "text-white",
    iconoSombra: "shadow-md shadow-emerald-300/50",
    numeroColor: "text-emerald-400/70",
    eyebrow: "text-emerald-600",
    hoverGradient: "hover:bg-gradient-to-br hover:from-emerald-50 hover:via-white hover:to-emerald-100/70",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

const COLORES_CHIP: Record<
  "emerald" | "sky" | "amber" | "navy",
  { fondo: string; texto: string; borde: string; iconoFondo: string; iconoColor: string }
> = {
  emerald: {
    fondo: "bg-gradient-to-br from-emerald-50 via-emerald-100/80 to-emerald-50",
    texto: "text-emerald-900",
    borde: "ring-emerald-300/70",
    iconoFondo: "bg-emerald-500",
    iconoColor: "text-white",
  },
  sky: {
    fondo: "bg-gradient-to-br from-sky-50 via-sky-100/80 to-sky-50",
    texto: "text-sky-900",
    borde: "ring-sky-300/70",
    iconoFondo: "bg-sky-500",
    iconoColor: "text-white",
  },
  amber: {
    fondo: "bg-gradient-to-br from-amber-50 via-amber-100/80 to-amber-50",
    texto: "text-amber-900",
    borde: "ring-amber-300/70",
    iconoFondo: "bg-amber-500",
    iconoColor: "text-white",
  },
  navy: {
    fondo: "bg-gradient-to-br from-marca-navy/5 via-marca-navy/12 to-marca-navy/5",
    texto: "text-marca-navy",
    borde: "ring-marca-navy/30",
    iconoFondo: "bg-marca-navy",
    iconoColor: "text-white",
  },
};

function Chip({
  color,
  icono,
  label,
}: {
  color: keyof typeof COLORES_CHIP;
  icono: React.ReactNode;
  label: string;
}) {
  const c = COLORES_CHIP[color];
  return (
    <li
      className={`inline-flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full text-[11px] font-bold ring-1 ${c.fondo} ${c.texto} ${c.borde}`}
    >
      <span
        className={`shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full ${c.iconoFondo} ${c.iconoColor}`}
        aria-hidden="true"
      >
        {icono}
      </span>
      {label}
    </li>
  );
}

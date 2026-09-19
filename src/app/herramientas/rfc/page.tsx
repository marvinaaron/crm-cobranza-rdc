import Link from "next/link";
import FaqSecciones from "@/components/publico/FaqSecciones";
import PanelRfc from "@/components/publico/PanelRfc";
import CalculadoraUsoEnvoltorio from "@/components/publico/CalculadoraUsoEnvoltorio";
import PublicShell from "@/components/publico/PublicShell";
import RfcSeoBloques from "@/components/publico/RfcSeoBloques";
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
              <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
                Calcula tu RFC con homoclave gratis: nombre, apellidos y fecha
                de nacimiento. Algoritmo público del SAT, en tu navegador.
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
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {PASOS.map((paso) => (
                <li key={paso.titulo}>
                  <div className="relative h-full overflow-hidden rounded-xl bg-white ring-1 ring-violet-100 shadow-sm shadow-violet-100/40 px-3.5 py-3 sm:px-4 sm:py-3.5">
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${paso.acento}`}
                    />
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${paso.iconBg}`}
                      >
                        {paso.icono}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          {paso.eyebrow}
                        </p>
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          {paso.titulo}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                          {paso.hint}
                        </p>
                      </div>
                    </div>
                  </div>
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

            <RfcSeoBloques />
          </div>
        </section>

        {config.faq.length > 0 && (
          <section className="pb-12 sm:pb-14" aria-labelledby="faq-rfc">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                id="faq-rfc"
                className="text-xl font-black tracking-tight text-slate-900 mb-4"
              >
                Preguntas frecuentes
              </h2>
              <FaqSecciones items={config.faq} labelledBy="faq-rfc" />
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

const ICONO_PASO = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

const PASOS = [
  {
    eyebrow: "Datos",
    titulo: "Captura tus datos",
    hint: "Nombre, apellidos y fecha",
    acento: "from-indigo-500 via-violet-500 to-fuchsia-500",
    iconBg: "bg-violet-100 text-violet-700",
    icono: (
      <svg {...ICONO_PASO}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
  {
    eyebrow: "Cálculo",
    titulo: "Algoritmo del SAT",
    hint: "Letras, fecha y homoclave",
    acento: "from-cyan-400 via-sky-500 to-blue-600",
    iconBg: "bg-sky-100 text-sky-700",
    icono: (
      <svg {...ICONO_PASO}>
        <path d="M9.4 4.5 4.5 9.4l5 5 4.9-4.9-5-5Z" />
        <path d="m12 2 1.5 1.5" />
        <path d="m20 10 2 2" />
        <path d="m14 14 6 6" />
      </svg>
    ),
  },
  {
    eyebrow: "Listo",
    titulo: "Recibe tu RFC",
    hint: "En pantalla, listo para copiar",
    acento: "from-emerald-400 via-teal-500 to-cyan-600",
    iconBg: "bg-emerald-100 text-emerald-700",
    icono: (
      <svg {...ICONO_PASO}>
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

import Link from "next/link";
import PanelRfc from "@/components/publico/PanelRfc";
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
        {/* HERO compacto con sellos de confianza */}
        <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-100 py-10 sm:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
                Herramienta gratuita · RDC Contadores
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                {config.h1}
              </h1>
              <p className="mt-3 text-slate-600 sm:text-lg">
                {config.subtitulo}
              </p>

              {/* Chips de confianza: privacidad, velocidad, precio, fuente */}
              <ul className="mt-5 flex flex-wrap gap-2">
                <Chip
                  color="emerald"
                  icono={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  }
                  label="100% privado"
                />
                <Chip
                  color="sky"
                  icono={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  }
                  label="Instantáneo"
                />
                <Chip
                  color="amber"
                  icono={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  }
                  label="Gratis · Sin registro"
                />
                <Chip
                  color="indigo"
                  icono={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

        {/* PANEL DEL FORM — héroe */}
        <section className="py-10 sm:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl ring-1 ring-slate-200 shadow-xl shadow-slate-200/50 p-5 sm:p-8 lg:p-10">
              <PanelRfc />
            </div>

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

        {/* Sección educativa: ¿qué es el RFC? — abajo del form porque la
            mayoría llega aquí buscando CALCULAR, no leer. Mantiene el
            texto indexable para SEO. */}
        <section className="py-12 sm:py-14 bg-white border-y border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              ¿Cómo funciona el cálculo del RFC?
            </h2>
            <div className="mt-5 space-y-4">
              {config.intro.map((p, i) => (
                <p
                  key={i}
                  className="text-sm sm:text-base text-slate-600 leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </div>
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
              <dl className="space-y-3">
                {config.faq.map((f) => (
                  <div
                    key={f.pregunta}
                    className="rounded-2xl ring-1 ring-slate-200 bg-white px-5 py-4"
                  >
                    <dt className="font-bold text-slate-900 text-sm sm:text-base">
                      {f.pregunta}
                    </dt>
                    <dd className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {f.respuesta}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        <p className="pb-10 px-4 text-xs text-slate-500 text-center max-w-2xl mx-auto leading-relaxed">
          Información de referencia conforme al algoritmo público del SAT. Para
          casos específicos o trámites oficiales consulte con su contador.{" "}
          <Link
            href="/contacto"
            className="text-marca-navy font-semibold hover:underline"
          >
            Contactar a RDC Contadores
          </Link>
        </p>
      </article>
    </PublicShell>
  );
}

const COLORES_CHIP: Record<
  "emerald" | "sky" | "amber" | "indigo",
  { fondo: string; texto: string; borde: string }
> = {
  emerald: {
    fondo: "bg-emerald-50",
    texto: "text-emerald-800",
    borde: "ring-emerald-200",
  },
  sky: { fondo: "bg-sky-50", texto: "text-sky-800", borde: "ring-sky-200" },
  amber: {
    fondo: "bg-amber-50",
    texto: "text-amber-800",
    borde: "ring-amber-200",
  },
  indigo: {
    fondo: "bg-indigo-50",
    texto: "text-indigo-800",
    borde: "ring-indigo-200",
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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ${c.fondo} ${c.texto} ${c.borde}`}
    >
      <span className="shrink-0" aria-hidden="true">
        {icono}
      </span>
      {label}
    </li>
  );
}

import Link from "next/link";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

/**
 * Comparativa visual "Despacho tradicional vs RDC Contadores".
 *
 * Diseño:
 *  - Hero con eyebrow + headline + subhead.
 *  - Tabla responsiva: en desktop son 3 columnas (Aspecto / Tradicional /
 *    RDC); en móvil cada fila se vuelve una tarjeta para mantener la
 *    legibilidad.
 *  - CTA fuerte al final hacia WhatsApp y al portal.
 */

type Fila = {
  aspecto: string;
  tradicional: string;
  rdc: string;
};

const FILAS: Fila[] = [
  {
    aspecto: "Cómo recibes información",
    tradicional: "WhatsApp suelto que se pierde entre mensajes",
    rdc: "Portal exclusivo con todo respaldado y ordenado",
  },
  {
    aspecto: "Saber si ya declaraste",
    tradicional: "Esperas un \u201Cya quedó\u201D y rezas que sea cierto",
    rdc: "Lo ves en tu calendario, con fecha, hora y acuse",
  },
  {
    aspecto: "Acuses del SAT",
    tradicional: "Tienes que pedirlos cada vez que los necesitas",
    rdc: "Disponibles 24/7 en tu portal, descargables al instante",
  },
  {
    aspecto: "Honorarios",
    tradicional: "Sorpresas a fin de año o por \u201Ctrabajo extra\u201D",
    rdc: "Tabla pública desde $812/mes. Cero letra chiquita",
  },
  {
    aspecto: "Tiempo de respuesta",
    tradicional: "Días. A veces semanas",
    rdc: "Horas, en horario hábil (Lun-Vie 9 a 17)",
  },
  {
    aspecto: "Recordatorios fiscales",
    tradicional: "Tú los persigues. Si los olvidas, multa",
    rdc: "RDC te avisa antes y lo deja agendado en tu calendario",
  },
  {
    aspecto: "Vigencia de tu e.firma",
    tradicional: "\u201CMándame la tuya cuando la necesite\u201D",
    rdc: "Vigencia visible en el portal. Aviso antes de vencer",
  },
  {
    aspecto: "Calendario fiscal",
    tradicional: "Tienes que memorizar fechas o usar Excel",
    rdc: "Sincroniza a iPhone, Google Calendar u Outlook",
  },
  {
    aspecto: "Quién te atiende",
    tradicional: "Un auxiliar diferente cada vez",
    rdc: "Aaron Rosales, contador titular. Trato directo",
  },
  {
    aspecto: "Si dejas de ser cliente",
    tradicional: "Te quedas sin papeles y sin histórico",
    rdc: "Te llevas todo el histórico exportado. Sin candados",
  },
];

const IconCheck = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconX = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function ComparativaSection() {
  return (
    <>
      {/* ----------------------------- HERO ----------------------------- */}
      <section className="pt-10 sm:pt-12 pb-6 sm:pb-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy">
              Tu mayor diferencia
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Despacho tradicional{" "}
              <span className="text-slate-400 font-light">vs</span>{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                RDC
              </span>
            </h1>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Esto es lo que cambia el día que decides cambiarte con nosotros.
              No vendemos contabilidad. Vendemos tranquilidad y orden.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------- TABLA --------------------------- */}
      <section className="pb-12 sm:pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de la tabla (solo desktop). */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-4 mb-2 border-b-2 border-slate-200">
            <div className="col-span-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Aspecto
            </div>
            <div className="col-span-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Despacho tradicional
            </div>
            <div className="col-span-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.15em] shadow-sm">
                RDC Contadores
              </span>
            </div>
          </div>

          {/* Filas. */}
          <div className="space-y-3 md:space-y-1">
            {FILAS.map((f, i) => (
              <div
                key={f.aspecto}
                className={`group rounded-2xl md:rounded-xl overflow-hidden ${
                  i % 2 === 0 ? "md:bg-slate-50/60" : "md:bg-transparent"
                } ring-1 ring-slate-200 md:ring-0 md:hover:bg-violet-50/40 transition-colors`}
              >
                {/* Móvil: tarjeta apilada. */}
                <div className="md:hidden p-5 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {f.aspecto}
                  </p>
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 inline-flex w-6 h-6 rounded-full bg-rose-100 text-rose-500 items-center justify-center">
                      <IconX />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Tradicional
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5 leading-snug">
                        {f.tradicional}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50/50 p-3 ring-1 ring-violet-100">
                    <span className="shrink-0 mt-0.5 inline-flex w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white items-center justify-center shadow-sm">
                      <IconCheck />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-marca-acento">
                        RDC
                      </p>
                      <p className="text-sm text-slate-900 font-semibold mt-0.5 leading-snug">
                        {f.rdc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop: fila tipo tabla. */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center px-6 py-5">
                  <div className="col-span-4">
                    <p className="text-sm font-bold text-slate-900">
                      {f.aspecto}
                    </p>
                  </div>
                  <div className="col-span-4">
                    <div className="flex items-start gap-2.5">
                      <span className="shrink-0 mt-0.5 inline-flex w-5 h-5 rounded-full bg-rose-100 text-rose-500 items-center justify-center">
                        <IconX />
                      </span>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {f.tradicional}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="flex items-start gap-2.5">
                      <span className="shrink-0 mt-0.5 inline-flex w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white items-center justify-center shadow-sm">
                        <IconCheck />
                      </span>
                      <p className="text-sm text-slate-900 font-semibold leading-relaxed">
                        {f.rdc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- CTA ---------------------------- */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-marca-navy-deep via-marca-navy to-marca-navy-soft text-white p-8 sm:p-12 shadow-2xl">
            {/* Halos. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-500/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/25 blur-3xl"
            />

            <div className="relative max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-violet-300">
                Cambiarse es más fácil de lo que crees
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                ¿Listo para una contabilidad{" "}
                <span className="bg-gradient-to-r from-violet-300 to-indigo-200 bg-clip-text text-transparent">
                  con orden
                </span>
                ?
              </h2>
              <p className="mt-4 text-slate-300 leading-relaxed">
                Habla directo con Aaron por WhatsApp. Sin secretarias, sin
                formularios largos. En la primera llamada te decimos qué
                necesitas y cuánto cuesta.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={CONTACTO_PUBLICO.whatsapp.buildUrl(
                    "Hola Aaron, vengo de la comparativa de tu sitio. Quiero saber qué necesito para cambiarme con ustedes."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-marca-navy text-sm font-bold hover:bg-slate-100 transition-colors shadow-lg"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Chatear con Aaron por WhatsApp
                </a>
                <Link
                  href="/servicios"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white text-sm font-bold ring-1 ring-white/20 hover:bg-white/20 transition-colors"
                >
                  Ver honorarios
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <p className="mt-5 text-xs text-slate-400">
                O llámanos: {CONTACTO_PUBLICO.telefono.display} · Lun-Vie 9:00
                a 17:00 (CST)
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

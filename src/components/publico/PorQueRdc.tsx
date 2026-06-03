/**
 * Sección "Por qué RDC": prueba de valor con datos concretos (stats) y un
 * bloque destacado del portal propio. Solo presentación; sin lógica.
 */

type Stat = {
  numero: string;
  /** Si el número va en gradiente indigo→violet (true) o en slate-900. */
  gradiente: boolean;
  borde: string;
  badge?: string;
  titulo: string;
  descripcion: string;
};

const STATS: Stat[] = [
  {
    numero: "0",
    gradiente: true,
    borde: "border-indigo-200",
    badge: "Garantía RDC",
    titulo: "Declaraciones brincadas",
    descripcion:
      "Presentamos cada obligación en tiempo y forma. Cero recargos por olvidos del despacho.",
  },
  {
    numero: "< 2h",
    gradiente: false,
    borde: "border-slate-200",
    titulo: "Tiempo de respuesta",
    descripcion:
      "Te contestamos en horas, no en días. Hablas directo con tu contador, no con un bot.",
  },
  {
    numero: "24/7",
    gradiente: true,
    borde: "border-slate-200",
    titulo: "Acceso a tu información",
    descripcion:
      "Tu SAT, IMSS y honorarios disponibles en el portal cuando los necesites, de día o de noche.",
  },
  {
    numero: "100%",
    gradiente: false,
    borde: "border-slate-200",
    titulo: "Digital",
    descripcion:
      "Documentos, pagos y avisos en línea. Sin filas, sin papeleo y sin perder tiempo.",
  },
];

const PORTAL_CHECKS = [
  "Opinión 32-D en tiempo real",
  "Calendario fiscal sincronizable",
  "Pago con tarjeta desde el portal",
  "Alerta de vencimiento de e.firma",
];

export default function PorQueRdc() {
  return (
    <section className="py-14 sm:py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-2">
            Por qué elegirnos
          </p>
          <h2 className="text-slate-900 text-2xl md:text-3xl font-black tracking-tight mb-3 leading-tight">
            No somos un call center.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Somos tu contador.
            </span>
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Datos reales de cómo trabajamos, no promesas genéricas.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {STATS.map((s) => (
            <div
              key={s.titulo}
              className={`bg-white border ${s.borde} rounded-2xl p-5`}
            >
              <p
                className={`text-4xl font-black mb-1 leading-none ${
                  s.gradiente
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"
                    : "text-slate-900"
                }`}
              >
                {s.numero}
              </p>
              {s.badge && (
                <span className="inline-block bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                  {s.badge}
                </span>
              )}
              <p className="text-slate-900 font-bold text-sm mb-1">
                {s.titulo}
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                {s.descripcion}
              </p>
            </div>
          ))}
        </div>

        {/* Card ancha: portal exclusivo — bloque navy destacado */}
        <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_15%_15%,#1e3a5f_0%,#0f1d2e_45%,#0a1424_100%)] text-white shadow-xl shadow-slate-900/30 p-8 sm:p-10">
          {/* Halos de acento */}
          <div
            className="absolute -top-16 -right-16 w-56 h-56 bg-violet-500/25 rounded-full blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"
            aria-hidden
          />
          {/* Trama sutil */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden
          />

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/15 text-[11px] font-bold uppercase tracking-widest text-indigo-200 mb-4">
                <span className="text-sm" aria-hidden="true">
                  🖥️
                </span>
                Tecnología propia
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Portal exclusivo{" "}
                <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                  para clientes
                </span>
              </h3>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-md">
                El único despacho en Guadalajara con portal propio desarrollado
                in-house. Tu SAT, IMSS y honorarios en un solo lugar, accesibles
                las 24 horas.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PORTAL_CHECKS.map((check) => (
                <li
                  key={check}
                  className="flex items-center gap-2.5 bg-white/5 ring-1 ring-white/10 rounded-xl px-3.5 py-3"
                >
                  <span
                    className="w-5 h-5 rounded-full bg-emerald-400/20 ring-1 ring-emerald-300/50 flex items-center justify-center text-emerald-300 text-xs shrink-0"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span className="text-slate-200 text-xs sm:text-[13px] leading-snug">
                    {check}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

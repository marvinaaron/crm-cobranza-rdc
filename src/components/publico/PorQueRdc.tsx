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

        {/* Card ancha: portal exclusivo (bloque permitido en slate-900) */}
        <div className="col-span-2 md:col-span-4 bg-slate-900 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-2xl mb-2" aria-hidden="true">
              🖥️
            </p>
            <p className="text-white font-bold text-base mb-1">
              Portal exclusivo para clientes
            </p>
            <p className="text-slate-400 text-sm">
              El único despacho en Guadalajara con portal propio desarrollado
              in-house. Tu SAT, IMSS y honorarios en un solo lugar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 shrink-0">
            {PORTAL_CHECKS.map((check) => (
              <div key={check} className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs shrink-0"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span className="text-slate-300 text-xs">{check}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

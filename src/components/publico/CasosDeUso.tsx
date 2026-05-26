/**
 * Sección "Trabajamos con": comunica los perfiles de clientes reales del
 * despacho. Ayuda a que el visitante se identifique rápido.
 */

const CASOS = [
  {
    titulo: "Profesionistas",
    descripcion:
      "Dentistas, médicos, abogados, arquitectos. RESICO PF o régimen de actividad profesional, declaración anual incluida.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    tono: "from-indigo-50 to-white text-indigo-600 ring-indigo-100",
  },
  {
    titulo: "Tiendas de autopartes",
    descripcion:
      "Comercio al detalle con alto volumen de facturación. Conciliación de proveedores y control de inventario fiscal.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3.09 14H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    tono: "from-amber-50 to-white text-amber-600 ring-amber-100",
  },
  {
    titulo: "Contratistas",
    descripcion:
      "Constructoras, instaladores y proveedores de servicios al sector privado y de gobierno. Cumplimiento ante SAT, IMSS y REPSE.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
      </svg>
    ),
    tono: "from-slate-50 to-white text-slate-700 ring-slate-200",
  },
  {
    titulo: "Sector automotriz",
    descripcion:
      "Agencias, talleres, distribuidores. Manejo fiscal de unidades nuevas y usadas, refacciones y servicios.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
        <circle cx="6.5" cy="16.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </svg>
    ),
    tono: "from-blue-50 to-white text-blue-600 ring-blue-100",
  },
  {
    titulo: "Personas físicas con honorarios",
    descripcion:
      "Freelancers, consultores y prestadores de servicios. Optimización de retenciones y declaración anual con saldo a favor.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    tono: "from-emerald-50 to-white text-emerald-600 ring-emerald-100",
  },
  {
    titulo: "Personas morales con nómina",
    descripcion:
      "Empresas con empleados. Cálculo y timbrado de nómina, IMSS, Infonavit, ISN estatal y obligaciones complementarias.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="12" y1="11" x2="12" y2="16" />
        <line x1="9.5" y1="13.5" x2="14.5" y2="13.5" />
      </svg>
    ),
    tono: "from-violet-50 to-white text-violet-600 ring-violet-100",
  },
];

export default function CasosDeUso() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
            Para quién trabajamos
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Llevamos la contabilidad de negocios como el tuyo
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Cada giro tiene sus particularidades fiscales. Estos son los perfiles de
            cliente que trabajamos día a día.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CASOS.map((c) => (
            <article
              key={c.titulo}
              className={`relative bg-gradient-to-br ${c.tono} rounded-2xl p-6 ring-1 hover:shadow-lg hover:-translate-y-0.5 transition-all`}
            >
              <span className="inline-flex w-11 h-11 rounded-xl bg-white shadow-sm items-center justify-center mb-4">
                {c.icono}
              </span>
              <h3 className="text-base font-black text-slate-900">{c.titulo}</h3>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                {c.descripcion}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          ¿No te ves en la lista? También trabajamos contigo —{" "}
          <a
            href="/contacto"
            className="font-bold text-slate-900 underline underline-offset-4 hover:text-indigo-600"
          >
            cuéntanos tu caso
          </a>
          .
        </p>
      </div>
    </section>
  );
}

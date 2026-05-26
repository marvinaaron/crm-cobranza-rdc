/**
 * Sección "Trabajamos con": comunica los perfiles de clientes reales del
 * despacho. Ayuda a que el visitante se identifique rápido.
 */

const CASOS = [
  {
    titulo: "Transportistas",
    descripcion:
      "Autotransporte de carga y de personal. Acreditamos el IEPS de tu diésel, controlamos comprobantes de combustible y casetas, y dejamos al día tus complementos Carta Porte.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 17h4V5H2v12h3" />
        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
    tono: "from-blue-50 to-white text-blue-600 ring-blue-100",
  },
  {
    titulo: "Dentistas",
    descripcion:
      "Consultorios y clínicas dentales. Facturación a pacientes con CFDI de servicios médicos, RESICO PF con honorarios y declaración anual con deducciones personales.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5.5c-1.5-1.5-3.5-2.5-5.5-2-1.5.3-2.5 1.7-2.5 3.4 0 1.4.5 2.7.9 4 .8 2.4 1.4 5.6 2.6 8 .5 1 1.6 1.1 2.2.1.7-1.2 1-3 2.3-3s1.6 1.8 2.3 3c.6 1 1.7.9 2.2-.1 1.2-2.4 1.8-5.6 2.6-8 .4-1.3.9-2.6.9-4 0-1.7-1-3.1-2.5-3.4-2-.5-4 .5-5.5 2z" />
      </svg>
    ),
    tono: "from-indigo-50 to-white text-indigo-600 ring-indigo-100",
  },
  {
    titulo: "Contratistas",
    descripcion:
      "Construcción y servicios especializados. Padrón REPSE vigente, retención de IVA al 6%, IMSS por obra y cumplimiento para contratos con gobierno y sector privado.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9v.01" />
        <path d="M9 12v.01" />
        <path d="M9 15v.01" />
        <path d="M9 18v.01" />
      </svg>
    ),
    tono: "from-slate-50 to-white text-slate-700 ring-slate-200",
  },
  {
    titulo: "Sector automotriz",
    descripcion:
      "Agencias, talleres y refaccionarias. Manejo fiscal de unidades nuevas y usadas, control de inventario, garantías y servicios con clientes flotilleros.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
        <circle cx="6.5" cy="16.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </svg>
    ),
    tono: "from-amber-50 to-white text-amber-600 ring-amber-100",
  },
  {
    titulo: "Personas físicas con honorarios",
    descripcion:
      "Freelancers, consultores y profesionistas independientes. Optimización de retenciones, RESICO PF cuando conviene y declaración anual con saldo a favor maximizado.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    tono: "from-emerald-50 to-white text-emerald-600 ring-emerald-100",
  },
  {
    titulo: "Escuelas y colegios",
    descripcion:
      "Personas morales con autorización SEP. CFDI de colegiaturas deducible para padres, nómina docente con prestaciones, IMSS, Infonavit e Impuesto Sobre Nómina.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
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

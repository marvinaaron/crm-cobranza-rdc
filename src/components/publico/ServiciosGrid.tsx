const SERVICIOS = [
  {
    titulo: "Cumplimiento fiscal mensual",
    descripcion:
      "Declaraciones provisionales, definitivas, DIOT y obligaciones informativas presentadas a tiempo.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Contabilidad electrónica",
    descripcion:
      "Registro contable conforme a NIF, generación de XML para SAT y conciliaciones bancarias.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-5" />
      </svg>
    ),
  },
  {
    titulo: "Nóminas y SUA / IMSS",
    descripcion:
      "Cálculo de nómina, timbrado, alta y baja de trabajadores y cumplimiento ante el IMSS e Infonavit.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    titulo: "Declaración anual",
    descripcion:
      "Personas físicas y morales: deducciones autorizadas, saldos a favor y devoluciones automáticas.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Asesoría fiscal y planeación",
    descripcion:
      "Optimización de carga fiscal con estrategias legales, simuladores y atención de requerimientos del SAT.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    titulo: "Constitución de empresas",
    descripcion:
      "Apoyo en la formación de personas morales y régimen fiscal óptimo según su giro y proyección.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="12" y1="11" x2="12" y2="16" />
        <line x1="9.5" y1="13.5" x2="14.5" y2="13.5" />
      </svg>
    ),
  },
];

export default function ServiciosGrid() {
  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
            Servicios
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Soluciones contables y fiscales integrales
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Todo lo que tu persona física o moral necesita, en un solo despacho.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICIOS.map((s) => (
            <div
              key={s.titulo}
              className="group bg-white rounded-2xl p-6 ring-1 ring-slate-200 hover:ring-slate-900 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <span className="inline-flex w-11 h-11 rounded-xl bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors items-center justify-center">
                {s.icono}
              </span>
              <h3 className="mt-4 text-base font-black text-slate-900">{s.titulo}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

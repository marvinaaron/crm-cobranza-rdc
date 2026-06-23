import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";

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
    acento: "from-indigo-500/20 to-violet-500/10",
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
    acento: "from-sky-500/20 to-cyan-500/10",
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
    acento: "from-emerald-500/20 to-teal-500/10",
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
    acento: "from-amber-500/20 to-orange-500/10",
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
    acento: "from-violet-500/20 to-fuchsia-500/10",
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
    acento: "from-rose-500/20 to-pink-500/10",
  },
];

export default function ServiciosGrid() {
  return (
    <section className="bg-slate-50">
      {/* Intro claro tras el bloque oscuro del portal */}
      <div className="border-b border-slate-200 bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <RevealOnScroll>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-indigo-600">
              Servicios
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Soluciones contables y fiscales{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                integrales
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Todo lo que tu persona física o moral necesita, en un solo despacho — respaldado por
              portal propio y procesos claros mes con mes.
            </p>
          </RevealOnScroll>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((s, i) => (
            <RevealOnScroll key={s.titulo} delay={i * 60}>
              <article className="group relative h-full overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-indigo-200">
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${s.acento} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
                  aria-hidden
                />
                <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white transition-transform duration-300 group-hover:scale-105">
                  {s.icono}
                </span>
                <h3 className="relative mt-4 text-base font-black text-slate-900">{s.titulo}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{s.descripcion}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

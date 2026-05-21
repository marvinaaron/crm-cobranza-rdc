export default function NosotrosSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600">
              Nosotros
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Un despacho que se siente como parte de tu equipo
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              En RDC Contadores combinamos la experiencia de un contador público
              certificado con tecnología propia para darte un servicio puntual, claro y
              cercano. Nuestro objetivo es que tu tiempo lo dediques a tu negocio mientras
              nosotros nos encargamos del SAT.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Contador público colegiado con cédula profesional vigente",
                "Cumplimiento del 100% de tus obligaciones con el SAT, IMSS e Infonavit",
                "Comunicación directa por WhatsApp, correo y portal del cliente",
                "Asesoría fiscal proactiva para optimizar tu carga tributaria",
              ].map((punto) => (
                <li key={punto} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="text-sm text-slate-700">{punto}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-900 text-white p-6">
                <p className="text-3xl font-black">+10</p>
                <p className="text-xs uppercase tracking-widest text-slate-300 mt-1">
                  Años en el sector
                </p>
              </div>
              <div className="rounded-2xl bg-blue-600 text-white p-6">
                <p className="text-3xl font-black">100%</p>
                <p className="text-xs uppercase tracking-widest text-blue-100 mt-1">
                  Cumplimiento puntual
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-600 text-white p-6 col-span-2">
                <p className="text-3xl font-black">PF y PM</p>
                <p className="text-xs uppercase tracking-widest text-emerald-100 mt-1">
                  Personas físicas y morales
                </p>
                <p className="mt-3 text-sm text-emerald-50">
                  Desde RESICO hasta régimen general de ley.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

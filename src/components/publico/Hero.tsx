import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50" />
      <div className="absolute top-0 right-0 -z-10 w-[28rem] h-[28rem] bg-indigo-200/40 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-[11px] font-bold uppercase tracking-widest text-slate-700 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Cumplimiento fiscal mensual y anual
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.05]">
              Tu contabilidad <span className="text-indigo-600">en buenas manos</span>.
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl">
              Acompañamos a personas físicas y morales en sus obligaciones ante el SAT, IMSS
              e Infonavit. Cumplimiento puntual, asesoría clara y un portal exclusivo para
              que veas tu información en todo momento.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Solicitar cotización
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/proceso"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-bold ring-1 ring-slate-200 hover:ring-slate-900 transition-colors"
              >
                Ver cómo trabajamos
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-xs text-slate-500">
              <div>
                <p className="text-2xl font-black text-slate-900">+10</p>
                <p>años de experiencia</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p>declaraciones a tiempo</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <p className="text-2xl font-black text-slate-900">24/7</p>
                <p>portal de clientes</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-indigo-200/40 ring-1 ring-slate-200 p-6 rotate-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Cumplimiento mensual
                  </p>
                  <p className="text-sm font-bold text-slate-900">Resumen del periodo</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-widest">
                  Al día
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { etiqueta: "ISR retenciones", estado: "Presentado" },
                  { etiqueta: "IVA mensual", estado: "Presentado" },
                  { etiqueta: "DIOT", estado: "Presentado" },
                  { etiqueta: "IMSS / Infonavit", estado: "Pagado" },
                ].map((item) => (
                  <div key={item.etiqueta} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{item.etiqueta}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">{item.estado}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-slate-900 text-white rounded-2xl px-5 py-4 shadow-xl -rotate-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                Portal del cliente
              </p>
              <p className="text-base font-black">Tu información, siempre lista</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

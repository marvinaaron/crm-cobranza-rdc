import Link from "next/link";

/**
 * Hero principal del sitio público.
 *
 * Está pensado para que en menos de 3 segundos el visitante:
 *  - Entienda qué hace el despacho (cumplimiento fiscal)
 *  - Vea pruebas concretas (cards con datos del portal real)
 *  - Sepa qué hacer (CTAs claros y prueba social)
 *
 * La columna derecha simula vistas reales del producto (card de
 * cumplimiento + mini-mockup de iPhone con el semáforo SAT) para
 * comunicar el diferenciador clave: tenemos portal propio.
 */

function MiniIphoneSemaforo() {
  return (
    <div className="w-[180px] bg-slate-900 rounded-[2rem] p-1.5 shadow-2xl ring-1 ring-black/30">
      <div className="relative">
        {/* Dynamic Island */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-1.5 z-20 w-[52px] h-[15px] bg-black rounded-full ring-1 ring-black/60"
          aria-hidden
        >
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-700/70" />
        </div>
        <div className="bg-white rounded-[1.65rem] overflow-hidden">
          {/* status bar */}
          <div className="flex items-center justify-between px-4 pt-5 pb-1">
            <span className="text-[8px] font-bold text-slate-700">9:41</span>
            <div className="flex items-center gap-0.5">
              <svg width="14" height="8" viewBox="0 0 22 14" fill="currentColor" className="text-slate-700">
                <rect x="0" y="9" width="3" height="5" rx="0.5" />
                <rect x="4" y="6" width="3" height="8" rx="0.5" />
                <rect x="8" y="3" width="3" height="11" rx="0.5" />
                <rect x="12" y="0" width="3" height="14" rx="0.5" />
              </svg>
              <svg width="12" height="8" viewBox="0 0 22 14" fill="none" className="text-slate-700 ml-1">
                <rect x="0.5" y="0.5" width="18" height="13" rx="2.5" stroke="currentColor" />
                <rect x="2" y="2" width="14" height="10" rx="1.5" fill="currentColor" />
                <rect x="20" y="4" width="1.5" height="6" rx="0.75" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* header */}
          <div className="px-3.5 pt-2 pb-2.5">
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
              Mi situación
            </p>
            <p className="text-sm font-black text-slate-900 leading-none">SAT</p>
          </div>

          {/* semáforo */}
          <div className="mx-3 mb-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-white ring-1 ring-emerald-200 p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-700 leading-none">
                  Opinión 32-D
                </p>
                <p className="text-[12px] font-black text-emerald-800 leading-tight mt-0.5">
                  Positiva
                </p>
              </div>
            </div>
          </div>

          {/* mini lista docs */}
          <div className="px-3 pb-3 space-y-1.5">
            {[
              { etiqueta: "Constancia fiscal", color: "indigo" },
              { etiqueta: "Opinión cumplimiento", color: "emerald" },
            ].map((d) => (
              <div
                key={d.etiqueta}
                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50"
              >
                <span
                  className={`w-4 h-4 rounded-md flex items-center justify-center ${
                    d.color === "indigo"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <span className="text-[8px] font-bold text-slate-700 truncate">
                  {d.etiqueta}
                </span>
              </div>
            ))}
          </div>

          {/* home bar */}
          <div className="flex justify-center pb-1.5">
            <span className="h-0.5 w-14 rounded-full bg-slate-900" />
          </div>
        </div>
      </div>
    </div>
  );
}

const AVATARES = [
  { ini: "JM", color: "bg-indigo-500" },
  { ini: "AR", color: "bg-emerald-500" },
  { ini: "LC", color: "bg-amber-500" },
  { ini: "DR", color: "bg-rose-500" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50" />
      <div className="absolute top-0 right-0 -z-10 w-[28rem] h-[28rem] bg-indigo-200/40 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 -z-10 w-[22rem] h-[22rem] bg-violet-200/40 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna izquierda: copy */}
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-[11px] font-bold uppercase tracking-widest text-slate-700 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Cumplimiento fiscal mensual y anual
            </span>

            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.05]">
              Tu contabilidad
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                en buenas manos
              </span>
              .
            </h1>

            <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl">
              Acompañamos a personas físicas y morales en sus obligaciones ante el
              SAT, IMSS, Infonavit, ISN y REPSE. Cumplimiento puntual, asesoría
              clara y un{" "}
              <span className="font-bold text-slate-900">portal exclusivo</span> para
              que veas tu información en todo momento.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-sm font-bold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-slate-900/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                Solicitar cotización gratis
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/proceso"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 text-sm font-bold ring-1 ring-slate-200 hover:ring-slate-900 transition-colors"
              >
                Ver cómo trabajamos
              </Link>
            </div>

            {/* Prueba social: avatares */}
            <div className="mt-7 flex items-center gap-3">
              <div className="flex -space-x-2">
                {AVATARES.map((a) => (
                  <span
                    key={a.ini}
                    className={`w-9 h-9 rounded-full ring-2 ring-white text-white text-[10px] font-black flex items-center justify-center ${a.color}`}
                    title="Cliente del despacho"
                  >
                    {a.ini}
                  </span>
                ))}
                <span className="w-9 h-9 rounded-full ring-2 ring-white bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                  +20
                </span>
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-slate-600 font-semibold">
                  Clientes activos confían en RDC
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 flex items-center gap-6 text-xs text-slate-500">
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

          {/* Columna derecha: mockups */}
          <div className="relative hidden lg:block">
            {/* Card principal: cumplimiento */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-indigo-200/40 ring-1 ring-slate-200 p-6 rotate-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Cumplimiento mensual
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    Resumen del periodo
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-widest">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
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
                  <div
                    key={item.etiqueta}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {item.etiqueta}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      {item.estado}
                    </span>
                  </div>
                ))}
              </div>

              {/* footer fecha actualización */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] text-slate-500 font-medium">
                  Actualizado hace 5 min
                </p>
                <span className="text-[10px] font-bold text-indigo-600">
                  rdcontadores.com
                </span>
              </div>
            </div>

            {/* Mini iPhone con semáforo SAT, flotando abajo-derecha */}
            <div className="absolute -bottom-10 -right-4 transform -rotate-6 hover:-rotate-3 transition-transform duration-300">
              <MiniIphoneSemaforo />
            </div>

            {/* Notificación flotante arriba-izquierda */}
            <div className="absolute -top-5 -left-5 bg-white rounded-xl ring-1 ring-slate-200 shadow-xl px-3 py-2.5 max-w-[170px] -rotate-6">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <p className="text-[10px] font-black text-slate-900 leading-tight">
                    Declaración enviada
                  </p>
                  <p className="text-[9px] text-slate-500">hace 5 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

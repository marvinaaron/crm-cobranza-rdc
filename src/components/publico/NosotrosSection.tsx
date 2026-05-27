/**
 * Sección "Nosotros" rediseñada:
 *  - Izquierda: tarjeta del titular con foto real + cita en primera persona.
 *  - Derecha: trayectoria (timeline) + formación continua + insignia de
 *    cumplimiento sin multas.
 *
 * Sustituye la versión anterior (3 stat cards sueltas + 4 bullets genéricos).
 */

import Image from "next/image";

const TIMELINE = [
  {
    label: "Inicio",
    titulo: "Práctica contable independiente",
    descripcion:
      "Comenzamos atendiendo personas físicas con honorarios y pequeños comercios.",
  },
  {
    label: "Crecimiento",
    titulo: "Cartera multi-régimen",
    descripcion:
      "Sumamos PM con nómina, contratistas REPSE, escuelas y profesionistas.",
  },
  {
    label: "Tecnología · 2026",
    titulo: "Lanzamos el portal del cliente",
    descripcion:
      "Construimos un CRM propio para que cada cliente vea su SAT, IMSS, REPSE y honorarios en un solo lugar.",
  },
  {
    label: "Hoy",
    titulo: "+20 clientes activos en 7 estados",
    descripcion:
      "Desde Chihuahua hasta Puebla, llevamos contabilidad 100% digital sin perder el trato cercano.",
  },
];

export default function NosotrosSection() {
  return (
    <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 bg-gradient-to-b from-white via-violet-50/30 to-white overflow-hidden">
      <div
        className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-violet-200/40 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-3xl mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-violet-600">
            El equipo detrás del portal
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Tu contador,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              no un call center
            </span>
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            En RDC Contadores combinamos atención personal con tecnología propia.
            Cuando contratas, sabes exactamente quién firma tu contabilidad — y
            tienes su WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* IZQUIERDA — Tarjeta del titular */}
          <div className="lg:col-span-2 flex">
            <div className="relative flex-1 rounded-3xl overflow-hidden bg-white ring-1 ring-violet-100 shadow-xl shadow-violet-100/50">
              {/* Banda de marca arriba */}
              <div className="relative h-24 bg-gradient-to-br from-indigo-600 via-violet-600 to-violet-700">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)",
                  }}
                  aria-hidden
                />
                <span className="absolute top-4 left-5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest ring-1 ring-white/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Contador titular
                </span>
              </div>

              {/* Avatar superpuesto */}
              <div className="relative px-6 pb-6 -mt-14">
                <div className="relative w-28 h-28 rounded-full ring-4 ring-white shadow-lg overflow-hidden bg-slate-100">
                  <Image
                    src="/equipo/aaron.jpg"
                    alt="Aaron Rosales, contador titular de RDC Contadores"
                    fill
                    sizes="112px"
                    className="object-cover object-top"
                    priority
                  />
                </div>

                <h3 className="mt-4 text-xl font-black text-slate-900 leading-tight">
                  Aaron Rosales
                </h3>
                <p className="text-sm font-bold text-violet-700 mt-0.5">
                  Contador Público Certificado
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Guadalajara, Jalisco · México
                </p>

                {/* Cita */}
                <blockquote className="mt-5 relative pl-4 border-l-4 border-violet-300">
                  <svg
                    className="absolute -left-1.5 -top-2 w-5 h-5 text-violet-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M7 7h4v4H7c0 2.21 1.79 4 4 4v2c-3.31 0-6-2.69-6-6V7zm10 0h4v4h-4c0 2.21 1.79 4 4 4v2c-3.31 0-6-2.69-6-6V7z" />
                  </svg>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    Caminamos juntos hacia el éxito de tu empresa — con
                    cumplimiento puntual, asesoría clara y la tecnología que
                    hace todo más simple.
                  </p>
                </blockquote>

                {/* Stats integrados */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-violet-50 ring-1 ring-violet-100 p-3">
                    <p className="text-2xl font-black tabular-nums text-violet-700 leading-none">
                      +10
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mt-1.5">
                      Años de práctica
                    </p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 ring-1 ring-indigo-100 p-3">
                    <p className="text-2xl font-black tabular-nums text-indigo-700 leading-none">
                      +20
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mt-1.5">
                      Clientes activos
                    </p>
                  </div>
                </div>

                {/* Contactos directos */}
                <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                    Correo
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.9-2.1-.2-.5-.5-.5-.6-.5h-.6c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.7 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
                    </svg>
                    WhatsApp
                  </span>
                  <span className="ml-auto text-[10px] text-slate-400 font-semibold">
                    Atención directa
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DERECHA — Trayectoria + formación + insignia */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Timeline */}
            <div className="relative flex-1 rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-6 sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-600 mb-1">
                Nuestra trayectoria
              </p>
              <h3 className="text-xl font-black text-slate-900">
                Una década evolucionando con cada cliente
              </h3>

              <ol className="mt-6 relative">
                {/* Línea vertical */}
                <span
                  className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-violet-400 via-indigo-400 to-violet-400/30"
                  aria-hidden
                />
                {TIMELINE.map((hito, idx) => (
                  <li key={hito.label} className="relative pl-7 pb-5 last:pb-0">
                    {/* Punto */}
                    <span
                      className={`absolute left-0 top-1.5 w-4 h-4 rounded-full ring-4 ring-white ${
                        idx === TIMELINE.length - 1
                          ? "bg-violet-600 shadow-md shadow-violet-300"
                          : "bg-indigo-500"
                      }`}
                      aria-hidden
                    >
                      {idx === TIMELINE.length - 1 && (
                        <span className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-60" />
                      )}
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
                      {hito.label}
                    </p>
                    <p className="mt-0.5 text-sm font-black text-slate-900">
                      {hito.titulo}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {hito.descripcion}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Grid: Formación + Insignia cumplimiento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Formación continua */}
              <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex w-9 h-9 rounded-xl bg-violet-100 text-violet-700 items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Formación continua
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      Siempre al día con los cambios fiscales
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-800">CEFOR</p>
                      <p className="text-[11px] text-slate-500">
                        Centro de Estudios Fiscales y Operativos
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-800">
                        Cámara de Comercio de Guadalajara
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Cursos vigentes en reformas fiscales y operación PYME
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Insignia cumplimiento */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-200 p-5">
                <div
                  className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                  aria-hidden
                />
                <div className="relative">
                  <span className="inline-flex w-9 h-9 rounded-xl bg-white/15 text-white items-center justify-center ring-1 ring-white/30">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4" />
                      <path d="M12 22c-5-3-8-7-8-13a8 8 0 0 1 16 0c0 6-3 10-8 13z" />
                    </svg>
                  </span>
                  <p className="mt-3 text-4xl font-black tabular-nums">100%</p>
                  <p className="text-sm font-bold mt-1">
                    Cumplimiento puntual
                  </p>
                  <p className="text-[11px] text-emerald-100/90 mt-2 leading-relaxed">
                    Cero multas para nuestros clientes activos. Llevamos PF
                    actividad empresarial, RESICO, asalariados y PM hasta
                    régimen general.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

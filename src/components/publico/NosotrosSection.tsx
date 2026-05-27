/**
 * Sección "Nosotros":
 *  - Izquierda: tarjeta del contador titular (escala cuando entren más socios).
 *  - Derecha: 3 principios de marca + formación continua + cumplimiento.
 */

import Image from "next/image";
import { Fragment } from "react";

const PRINCIPIOS = [
  {
    titulo: "Cercanía",
    descripcion:
      "Hablas con tu contador, no con un bot ni un buzón genérico. WhatsApp, correo y portal — siempre la misma persona de tu lado.",
    color: "bg-violet-100 text-violet-700 ring-violet-200/80",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    titulo: "Tecnología",
    descripcion:
      "Tu SAT, IMSS, REPSE y honorarios en un solo portal — no en un Excel que te mandan por correo cada mes.",
    color: "bg-indigo-100 text-indigo-700 ring-indigo-200/80",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    titulo: "Cumplimiento",
    descripcion:
      "Declaraciones a tiempo, calendario fiscal en tu celular y recordatorios antes del día 17. Cero multas para nuestros clientes activos.",
    color: "bg-emerald-100 text-emerald-700 ring-emerald-200/80",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <path d="M12 22c-5-3-8-7-8-13a8 8 0 0 1 16 0c0 6-3 10-8 13z" />
      </svg>
    ),
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
                    No vendo contabilidad. Vendo tranquilidad: que cuando
                    llegue el día 17, sepas que todo está en regla y al día.
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

          {/* DERECHA — Principios + formación + insignia */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-6 sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-600 mb-1">
                Lo que nos define
              </p>
              <h3 className="text-xl font-black text-slate-900">
                Tres principios, un solo despacho
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                No importa si eres tu primer cliente o el vigésimo: esto es lo
                que RDC promete a todos, hoy y cuando el equipo crezca.
              </p>

              <ul className="mt-6 space-y-4">
                {PRINCIPIOS.map((p) => (
                  <li
                    key={p.titulo}
                    className="flex gap-4 p-4 rounded-2xl bg-slate-50/80 ring-1 ring-slate-100 hover:ring-violet-200/60 transition-colors"
                  >
                    <span
                      className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ring-1 ${p.color}`}
                    >
                      {p.icono}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900">
                        {p.titulo}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {p.descripcion}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formación + cumplimiento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Formación continua */}
              <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-5 flex flex-col">
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

                <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                  Capacitación vigente en reformas fiscales, operación PYME y
                  herramientas de cumplimiento.
                </p>

                <div className="mt-auto pt-5 grid grid-cols-2 gap-3">
                  <a
                    href="https://cefor.mx"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="CEFOR — Centro de Formación Empresarial"
                    title="CEFOR"
                    className="group flex items-center justify-center h-14 px-2 rounded-xl bg-slate-50 ring-1 ring-slate-100 hover:ring-violet-200 transition-all"
                  >
                    <Image
                      src="/marcas/cefor.png"
                      alt="CEFOR"
                      width={120}
                      height={36}
                      className="max-h-9 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                    />
                  </a>
                  <a
                    href="https://www.camaradecomerciogdl.mx/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Cámara de Comercio de Guadalajara"
                    title="Cámara de Comercio de Guadalajara"
                    className="group flex items-center justify-center h-14 px-2 rounded-xl bg-slate-50 ring-1 ring-slate-100 hover:ring-violet-200 transition-all"
                  >
                    <Image
                      src="/marcas/camara-comercio-gdl.png"
                      alt="Cámara de Comercio de Guadalajara"
                      width={120}
                      height={44}
                      className="max-h-10 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                    />
                  </a>
                </div>
              </div>

              {/* Insignia cumplimiento */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-200 p-5 flex flex-col">
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

        {/* Stack tecnológico — software profesional CONTPAQi */}
        <div className="mt-10 sm:mt-14 rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-violet-600">
                Stack tecnológico
              </p>
              <h3 className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
                Llevamos tu contabilidad con software fiscal de gama alta
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
                Operamos sobre el ecosistema CONTPAQi, el estándar profesional
                de despachos serios en México — autorizado y certificado por el
                SAT.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest ring-1 ring-emerald-100 self-start sm:self-auto">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Certificado SAT
            </span>
          </div>

          {(() => {
            const productos = [
              {
                src: "/marcas/contpaqi-contabiliza.png",
                alt: "CONTPAQi Contabiliza",
                label: "CONTPAQi Contabiliza",
                descripcion:
                  "Contabilidad electrónica, pólizas, balanzas y reportes alineados a la normatividad del SAT.",
              },
              {
                src: "/marcas/contpaqi-personia.png",
                alt: "CONTPAQi Personia",
                label: "CONTPAQi Personia",
                descripcion:
                  "Cálculo y timbrado de nómina, recibos CFDI 4.0, IMSS, Infonavit e ISN.",
              },
              {
                src: "/marcas/contpaqi-vende.png",
                alt: "CONTPAQi Vende",
                label: "CONTPAQi Vende",
                descripcion:
                  "Facturación electrónica, control de ventas e inventarios para PF y PM.",
              },
            ];
            return (
              <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
                {productos.map((p, idx) => (
                  <Fragment key={p.label}>
                    <article className="relative flex-1 rounded-2xl bg-slate-50 ring-1 ring-slate-100 p-5 flex flex-col">
                      <div className="h-14 flex items-center justify-start">
                        <Image
                          src={p.src}
                          alt={p.alt}
                          width={240}
                          height={72}
                          className="max-h-14 w-auto object-contain"
                        />
                      </div>
                      <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                        {p.descripcion}
                      </p>
                    </article>
                    {idx < productos.length - 1 && (
                      <div
                        className="relative flex items-center justify-center py-4 sm:py-0 sm:w-12 shrink-0"
                        aria-hidden="true"
                      >
                        {/* Línea horizontal (desktop) */}
                        <span className="hidden sm:block absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-violet-200 via-violet-400 to-violet-200" />
                        {/* Línea vertical (mobile) */}
                        <span className="sm:hidden absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-violet-200 via-violet-400 to-violet-200" />
                        {/* Badge "+" */}
                        <span className="relative z-10 w-8 h-8 rounded-full bg-white ring-2 ring-violet-300 flex items-center justify-center shadow-sm">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="text-violet-600"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </span>
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            );
          })()}

          <p className="mt-5 text-[11px] text-slate-400 text-center sm:text-left">
            CONTPAQi® y los logotipos de sus productos son marcas registradas
            por Computación en Acción, S.A. de C.V.
          </p>
        </div>
      </div>
    </section>
  );
}

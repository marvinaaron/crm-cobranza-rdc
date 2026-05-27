/**
 * Sección "Nosotros":
 *  - Comparación despacho tradicional vs RDC (sin foto/nombre — ya están en PortalShowcase).
 *  - 3 principios de marca + formación + cumplimiento + stack CONTPAQi.
 */

import Image from "next/image";
import { Fragment } from "react";
import ChecklistAutocalificacion from "./ChecklistAutocalificacion";

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
    <section className="relative py-10 sm:py-14 bg-gradient-to-b from-white via-violet-50/30 to-white overflow-hidden">
      <div
        className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-violet-200/40 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bloque 2 columnas: voz de marca + checklist interactivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Izquierda — Voz de marca con cita del titular */}
          <div className="lg:sticky lg:top-24 self-start">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-violet-600">
              El equipo detrás del portal
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Tu contador,{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                no un call center
              </span>
            </h2>
            <p className="mt-5 text-slate-600 leading-relaxed">
              En RDC Contadores combinamos atención personal con tecnología
              propia. Cuando contratas, sabes exactamente quién firma tu
              contabilidad — y tienes su WhatsApp.
            </p>

            {/* Cita del titular */}
            <figure className="mt-7 relative rounded-2xl bg-white ring-1 ring-violet-100 shadow-lg shadow-violet-100/40 p-6">
              <span
                className="absolute -top-3 -left-3 inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md ring-4 ring-white"
                aria-hidden
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 7h4v4H7c0 2.21 1.79 4 4 4v2c-3.31 0-6-2.69-6-6V7zm10 0h4v4h-4c0 2.21 1.79 4 4 4v2c-3.31 0-6-2.69-6-6V7z" />
                </svg>
              </span>
              <blockquote className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium italic">
                No vendo contabilidad. Vendo tranquilidad: que cuando llegue el
                día 17, sepas que todo está en regla y al día.
              </blockquote>
              <figcaption className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                <span className="inline-flex w-2 h-2 rounded-full bg-violet-500" aria-hidden />
                <p className="text-xs font-bold text-slate-700 tracking-wide">
                  RDC Contadores
                  <span className="text-slate-400 font-medium ml-1.5">
                    · Guadalajara, Jalisco
                  </span>
                </p>
              </figcaption>
            </figure>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-violet-600">
              ¿Te identificas?
            </p>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              No vendemos a todos. Marca los puntos que te suenen familiares
              y descubre si RDC es para ti.
            </p>
          </div>

          {/* Derecha — Checklist interactivo */}
          <div>
            <ChecklistAutocalificacion />
          </div>
        </div>

        {/* 3 principios — ancho completo */}
        <div className="mt-8 sm:mt-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-600 mb-1">
            Lo que nos define
          </p>
          <h3 className="text-xl font-black text-slate-900">
            Tres principios, un solo despacho
          </h3>
          <ul className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRINCIPIOS.map((p) => (
              <li
                key={p.titulo}
                className="flex flex-col gap-3 p-5 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:ring-violet-200/60 transition-colors"
              >
                <span
                  className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ring-1 ${p.color}`}
                >
                  {p.icono}
                </span>
                <div>
                  <p className="text-sm font-black text-slate-900">{p.titulo}</p>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {p.descripcion}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Formación + cumplimiento */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                aria-label="CEFOR"
                title="CEFOR"
                className="flex items-center justify-center h-14 px-2 rounded-xl bg-white ring-1 ring-slate-200 hover:ring-violet-300 hover:shadow-sm transition-all"
              >
                <Image
                  src="/marcas/cefor.png"
                  alt="CEFOR"
                  width={120}
                  height={36}
                  className="max-h-9 w-auto object-contain"
                />
              </a>
              <a
                href="https://www.camaradecomerciogdl.mx/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cámara de Comercio de Guadalajara"
                title="Cámara de Comercio de Guadalajara"
                className="flex items-center justify-center h-14 px-2 rounded-xl bg-white ring-1 ring-slate-200 hover:ring-violet-300 hover:shadow-sm transition-all"
              >
                <Image
                  src="/marcas/camara-comercio-gdl.png"
                  alt="Cámara de Comercio de Guadalajara"
                  width={120}
                  height={44}
                  className="max-h-10 w-auto object-contain"
                />
              </a>
            </div>
          </div>

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
              <p className="text-sm font-bold mt-1">Cumplimiento puntual</p>
              <p className="text-[11px] text-emerald-100/90 mt-2 leading-relaxed">
                Cero multas para nuestros clientes activos. Llevamos PF
                actividad empresarial, RESICO, asalariados y PM hasta régimen
                general.
              </p>
            </div>
          </div>
        </div>

        {/* Stack CONTPAQi */}
        <div className="mt-8 sm:mt-10 rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-6 sm:p-8">
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
                descripcion:
                  "Contabilidad electrónica, pólizas, balanzas y reportes alineados a la normatividad del SAT.",
              },
              {
                src: "/marcas/contpaqi-personia.png",
                alt: "CONTPAQi Personia",
                descripcion:
                  "Cálculo y timbrado de nómina, recibos CFDI 4.0, IMSS, Infonavit e ISN.",
              },
              {
                src: "/marcas/contpaqi-vende.png",
                alt: "CONTPAQi Vende",
                descripcion:
                  "Facturación electrónica, control de ventas e inventarios para PF y PM.",
              },
            ];
            return (
              <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
                {productos.map((p, idx) => (
                  <Fragment key={p.alt}>
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
                        aria-hidden
                      >
                        <span className="hidden sm:block absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-violet-200 via-violet-400 to-violet-200" />
                        <span className="sm:hidden absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-violet-200 via-violet-400 to-violet-200" />
                        <span className="relative z-10 w-8 h-8 rounded-full bg-white ring-2 ring-violet-300 flex items-center justify-center shadow-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-violet-600">
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

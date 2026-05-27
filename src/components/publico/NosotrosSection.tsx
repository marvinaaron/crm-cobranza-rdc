/**
 * Sección "Nosotros":
 *  - Comparación despacho tradicional vs RDC (sin foto/nombre — ya están en PortalShowcase).
 *  - 3 principios de marca + formación + cumplimiento + stack CONTPAQi.
 */

import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";

const CHECKLIST = [
  "Ves tu contabilidad una vez al año, cuando toca declaración anual",
  "Has perdido facturas, constancias o RFCs entre WhatsApps y correos",
  "No sabes con certeza si estás al corriente o si tienes algún adeudo con el SAT",
  "Tu contador tarda días — o semanas — en contestarte",
  "Quieres pagar tus honorarios con tarjeta y olvidarte del comprobante",
  "Te gustaría ver tu situación fiscal cuando quieras, desde el celular",
];

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
        {/* Encabezado */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-violet-600">
            ¿Te identificas?
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            RDC es para ti{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              si te suena alguno de estos
            </span>
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            No vendemos a todos. Estamos hechos para profesionistas y dueños
            de negocio que ya están cansados de improvisar con su contabilidad
            cada mes.
          </p>
        </div>

        {/* Checklist de autocalificación */}
        <div className="relative rounded-3xl bg-white ring-1 ring-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600"
            aria-hidden
          />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex w-10 h-10 rounded-xl bg-violet-100 text-violet-700 items-center justify-center ring-1 ring-violet-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </span>
              <p className="text-sm sm:text-base font-black text-slate-900">
                Marca todo lo que te suene familiar
              </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CHECKLIST.map((item, idx) => (
                <li
                  key={item}
                  className="group flex items-start gap-3 p-4 rounded-2xl bg-slate-50/70 hover:bg-violet-50/60 ring-1 ring-slate-100 hover:ring-violet-200/80 transition-colors"
                >
                  <span
                    className="shrink-0 w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-sm shadow-violet-200 ring-1 ring-violet-300/40"
                    aria-hidden
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <p className="text-sm text-slate-700 leading-snug">
                    <span className="font-bold text-slate-400 mr-1.5">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </p>
                </li>
              ))}
            </ul>

            {/* Cierre del checklist con CTA */}
            <div className="mt-7 pt-6 border-t border-dashed border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 flex-1">
                <span
                  className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"
                  aria-hidden
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </span>
                <p className="text-sm text-slate-700 leading-snug">
                  Si marcaste{" "}
                  <span className="font-black text-slate-900">2 o más</span>,
                  hablemos. Cotización gratis en 24 hrs.
                </p>
              </div>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shrink-0"
              >
                Solicitar cotización
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
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

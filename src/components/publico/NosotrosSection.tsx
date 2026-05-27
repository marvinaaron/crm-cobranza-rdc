/**
 * Sección "Nosotros":
 *  - Comparación despacho tradicional vs RDC (sin foto/nombre — ya están en PortalShowcase).
 *  - 3 principios de marca + formación + cumplimiento + stack CONTPAQi.
 */

import Image from "next/image";
import { Fragment } from "react";
import ChecklistAutocalificacion from "./ChecklistAutocalificacion";
import LogoTiltCard from "./LogoTiltCard";

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
      "Calendario fiscal en tu celular, recordatorios anticipados antes del día 17 y aviso inmediato cuando el SAT emite un requerimiento.",
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
        {/* ─── Bloque 1 — Voz de marca: heading + cita + insignia + checklist ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Izquierda — Heading + cita (con insignia integrada) */}
          <div className="lg:col-span-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-violet-600">
              El equipo detrás del portal
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Tu contador,{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                no un call center
              </span>
            </h2>
            <p className="mt-5 text-slate-600 leading-relaxed max-w-xl">
              En RDC Contadores combinamos atención personal con tecnología
              propia. Cuando contratas, sabes exactamente quién firma tu
              contabilidad — y tienes su WhatsApp.
            </p>

            {/* Cita del titular con insignia inclinada al lado */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-5">
              <figure className="relative flex-1 rounded-3xl bg-white ring-1 ring-violet-100 shadow-lg shadow-violet-100/40 p-6 sm:p-7">
                <span
                  className="absolute -top-3 -left-3 inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md ring-4 ring-white"
                  aria-hidden
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 7h4v4H7c0 2.21 1.79 4 4 4v2c-3.31 0-6-2.69-6-6V7zm10 0h4v4h-4c0 2.21 1.79 4 4 4v2c-3.31 0-6-2.69-6-6V7z" />
                  </svg>
                </span>
                <blockquote className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium italic">
                  No vendo contabilidad. Vendo tranquilidad: que cuando llegue
                  el día 17, sepas que todo está en regla y al día.
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

              {/* Insignia mini inclinada — decorativa al lado de la cita */}
              <div className="hidden sm:flex flex-col items-center justify-center shrink-0">
                <LogoTiltCard />
                <p className="mt-2 text-[10px] text-slate-400 italic text-center max-w-[160px] leading-relaxed">
                  Pasa el cursor sobre la insignia
                </p>
              </div>
            </div>
          </div>

          {/* Derecha — Checklist interactivo */}
          <div className="lg:col-span-5">
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

          <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_15%_15%,#7c3aed_0%,#4338ca_45%,#1e1b4b_100%)] text-white shadow-xl shadow-violet-300/50 p-5 sm:p-6 flex flex-col">
            {/* Halos decorativos */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 bg-violet-400/30 rounded-full blur-3xl"
              aria-hidden
            />
            <div
              className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl"
              aria-hidden
            />
            {/* Trama de cuadrícula sutil */}
            <div
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
              aria-hidden
            />

            <div className="relative">
              {/* Número gigante */}
              <p className="text-6xl sm:text-7xl font-black leading-none tabular-nums bg-gradient-to-b from-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_4px_18px_rgba(167,139,250,0.45)]">
                100%
              </p>
              <p className="mt-3 text-lg sm:text-xl font-black leading-tight">
                Tus impuestos presentados.{" "}
                <span className="text-violet-200">Sin excepción.</span>
              </p>

              {/* Sello oro 24K — debajo de la frase */}
              <div className="mt-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.22em] text-amber-950 shadow-md shadow-amber-500/40 ring-1 ring-amber-200/70"
                  style={{
                    background:
                      "linear-gradient(135deg, #fef3c7 0%, #fcd34d 35%, #f59e0b 70%, #b45309 100%)",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M12 2l2.4 5 5.6.8-4 4 .9 5.7L12 14.8 7.1 17.5 8 11.8 4 7.8l5.6-.8z" />
                  </svg>
                  Garantía RDC · Oro 24K
                </span>
              </div>

              <p className="mt-3 text-[12px] sm:text-[13px] text-violet-100/85 leading-relaxed">
                Mensuales, provisionales y anuales. Cero declaraciones
                brincadas — el SAT recibe lo tuyo y tú recibes el acuse en
                tu portal.
              </p>

              {/* Bullets de respaldo */}
              <ul className="mt-4 space-y-1.5 text-[12px] text-violet-50/95 border-t border-white/10 pt-3.5">
                {[
                  "Acuse del SAT guardado en tu portal el mismo día",
                  "Reporte mensual de todo lo presentado",
                  "Si algo se brinca, lo regularizamos sin cobrarte aparte",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0 inline-flex w-4 h-4 rounded-full bg-emerald-400/20 ring-1 ring-emerald-300/60 items-center justify-center">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-emerald-300"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Footer: prueba social pequeña */}
              <div className="mt-4 flex items-center justify-between gap-3 text-[10px] text-violet-200/80">
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  +20 clientes activos
                </span>
                <span className="uppercase tracking-[0.2em] font-black text-violet-100/70">
                  Desde 2022
                </span>
              </div>
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

/**
 * Contacto: WhatsApp por tema, formulario a la vista y toques grandes
 * para llamar o escribir. Misma familia visual que el home, sin recuadro oscuro.
 */

import Link from "next/link";
import Fiscalino from "@/components/Fiscalino";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import {
  CONTACTO_PUBLICO,
  HORARIO_ATENCION,
  RAZONES_CONTACTO,
} from "@/lib/contacto-publico";
import ContactoQuickForm from "./ContactoQuickForm";
import EstadoDisponibilidad from "./EstadoDisponibilidad";
import MapaPresencia from "./MapaPresencia";

const ESTILO_RAZON = {
  spark: {
    eyebrow: "Soy nuevo",
    titulo: "Cotización",
    acento: "from-indigo-500 via-violet-500 to-fuchsia-500",
    iconBg: "bg-violet-100 text-violet-700",
  },
  swap: {
    eyebrow: "Cambio",
    titulo: "Otro contador",
    acento: "from-cyan-400 via-sky-500 to-blue-600",
    iconBg: "bg-sky-100 text-sky-700",
  },
  alert: {
    eyebrow: "SAT",
    titulo: "Multa o requerimiento",
    acento: "from-rose-400 via-orange-400 to-amber-400",
    iconBg: "bg-rose-100 text-rose-700",
  },
  chat: {
    eyebrow: "Cliente",
    titulo: "Duda rápida",
    acento: "from-emerald-400 via-teal-500 to-cyan-600",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
} as const;

const ICONO_SVG = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

const ICONOS_RAZON = {
  spark: (
    <svg {...ICONO_SVG}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  swap: (
    <svg {...ICONO_SVG}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  alert: (
    <svg {...ICONO_SVG}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  chat: (
    <svg {...ICONO_SVG}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
} as const;

const REDES = [
  {
    nombre: "WhatsApp",
    url: CONTACTO_PUBLICO.whatsapp.url,
    hoverColor: "hover:text-emerald-500",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    nombre: "Instagram",
    url: CONTACTO_PUBLICO.instagram.url,
    hoverColor: "hover:text-pink-500",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    nombre: "Facebook",
    url: CONTACTO_PUBLICO.facebook.url,
    hoverColor: "hover:text-blue-500",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    nombre: "YouTube",
    url: CONTACTO_PUBLICO.youtube.url,
    hoverColor: "hover:text-red-500",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function ContactoSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white py-10 sm:py-14">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-300/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 30%, black, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <RevealOnScroll>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-700 shadow-sm ring-1 ring-slate-200">
              Guadalajara · contacto
            </span>
            <EstadoDisponibilidad claro />
          </div>

          <h1 className="mt-4 max-w-2xl text-3xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-4xl">
            Escríbenos.{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
              Te contesta Fiscalino, nuestra IA.
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
            Fiscalino te conecta con nuestro equipo. Primera plática sin costo.
            Horario hábil, casi siempre en menos de 2 horas.
          </p>

          <p className="mt-3 text-[13px] font-medium text-slate-700">
            {HORARIO_ATENCION.ciudad} · {HORARIO_ATENCION.resumen}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:items-center">
            <a
              href={CONTACTO_PUBLICO.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-bold text-white shadow-md shadow-emerald-200/60 transition-colors hover:bg-[#1ebe57] sm:col-auto sm:h-11"
            >
              <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
                <path d="M16.001 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.26.6 4.46 1.74 6.4L3.2 28.8l6.56-1.72A12.78 12.78 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8S23.07 3.2 16 3.2z" />
              </svg>
              WhatsApp
            </a>
            <a
              href={CONTACTO_PUBLICO.telefono.hrefTel}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-marca-navy px-5 text-sm font-bold text-white hover:bg-marca-navy-deep sm:h-11"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Llamar
            </a>
            <a
              href={CONTACTO_PUBLICO.calendly.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-900 ring-1 ring-slate-200 transition-colors hover:ring-violet-400 sm:h-11"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Agendar 1:1
            </a>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            La primera plática es sin costo.
          </p>
        </RevealOnScroll>

          <RevealOnScroll delay={80} className="hidden lg:block">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-indigo-200/30 ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Fiscalino · IA del despacho
                  </p>
                  <p className="text-sm font-bold text-slate-900">Te conecta con el equipo</p>
                </div>
                <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-700">
                  En línea
                </span>
              </div>
              <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50/40 p-4 ring-1 ring-violet-100">
                <Fiscalino mood="happy" size={104} />
                <div>
                  <p className="text-[15px] font-black leading-snug text-slate-900">
                    Hola, soy Fiscalino.
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                    Tú eliges el tema. Yo armo el mensaje y el despacho te
                    atiende en horario hábil.
                  </p>
                </div>
              </div>
              <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                Primera plática sin costo · rdcontadores.com
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>

      <div className="relative mt-10 overflow-hidden border-y border-violet-100/80 bg-gradient-to-b from-white via-violet-50/50 to-white py-6 sm:py-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-violet-200/50 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-indigo-100/60 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
              WhatsApp directo
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {RAZONES_CONTACTO.map((r) => {
                const estilo = ESTILO_RAZON[r.icono];
                return (
                  <a
                    key={r.id}
                    href={CONTACTO_PUBLICO.whatsapp.buildUrl(r.mensaje)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${r.titulo} — abrir WhatsApp`}
                    className="group relative min-h-[88px] overflow-hidden rounded-xl bg-white px-3.5 py-3 shadow-sm shadow-violet-100/40 ring-1 ring-violet-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100/70 hover:ring-violet-300"
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${estilo.acento}`}
                    />
                    <span
                      aria-hidden
                      className={`absolute inset-y-0 right-0 w-[3px] bg-gradient-to-b ${estilo.acento} opacity-0 transition-opacity group-hover:opacity-100`}
                    />
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${estilo.iconBg}`}
                      >
                        {ICONOS_RAZON[r.icono]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          {estilo.eyebrow}
                        </p>
                        <p className="text-sm font-bold leading-snug text-slate-900">
                          {estilo.titulo}
                        </p>
                        <p className="mt-1 text-[11px] leading-snug text-slate-500">
                          {r.descripcion}
                        </p>
                      </div>
                      <span className="self-center text-sm font-bold text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-violet-600">
                        →
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </RevealOnScroll>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-violet-100 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
            O escribe tu caso
          </p>
          <h2 id="quickform-title" className="mt-1 text-base font-black text-slate-900 sm:text-lg">
            Lo armamos y lo mandas a WhatsApp de un clic
          </h2>
          <div className="mt-4">
            <ContactoQuickForm />
          </div>
          <p className="mt-4 text-[13px] text-slate-500">
            ¿Ya eres cliente?{" "}
            <Link href="/portal/login" className="font-semibold text-violet-600 hover:text-violet-800">
              Entra al portal
            </Link>
          </p>
        </div>
      </div>

      <MapaPresencia
        eyebrow="Únete a la familia"
        titulo="Únete a nuestra gran familia en"
        tituloAcento="7 estados de México"
        subtitulo="Trabajamos 100% digital, desde Chihuahua hasta Puebla. La materia fiscal es la misma en todo el país: la distancia nunca es problema."
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-2">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Síguenos
          </p>
          <div className="flex items-center gap-5">
            {REDES.map((r) => (
              <a
                key={r.nombre}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={r.nombre}
                className={`text-slate-500 transition-all hover:scale-110 ${r.hoverColor}`}
              >
                {r.icono}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

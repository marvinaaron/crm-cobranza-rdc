/**
 * Contacto: WhatsApp por tema, más un formulario a la vista para
 * armar el mensaje y mandarlo de un clic. Sin recuadros gigantes.
 */

import Link from "next/link";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import {
  CONTACTO_PUBLICO,
  HORARIO_ATENCION,
  RAZONES_CONTACTO,
} from "@/lib/contacto-publico";
import ContactoQuickForm from "./ContactoQuickForm";
import EstadoDisponibilidad from "./EstadoDisponibilidad";

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
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-700 shadow-sm ring-1 ring-slate-200">
              Guadalajara · contacto
            </span>
            <EstadoDisponibilidad claro />
          </div>

          <h1 className="mt-4 max-w-2xl text-3xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-4xl">
            Elige el tema y te abrimos el WhatsApp con el contexto.
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
            Te contestamos en horario hábil, casi siempre en menos de 2 horas.
            Sin formularios que se pierden en el correo.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500">
            <p>{HORARIO_ATENCION.resumen}</p>
            <span className="hidden sm:inline text-slate-300" aria-hidden>
              ·
            </span>
            <p>{HORARIO_ATENCION.ciudad}</p>
            <span className="hidden sm:inline text-slate-300" aria-hidden>
              ·
            </span>
            <a
              href={CONTACTO_PUBLICO.telefono.hrefTel}
              className="font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
            >
              {CONTACTO_PUBLICO.telefono.display}
            </a>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:items-center">
            <a
              href={CONTACTO_PUBLICO.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-bold text-white transition-colors hover:bg-[#1ebe57] sm:col-auto sm:h-11"
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
              className="inline-flex h-12 items-center justify-center px-5 rounded-xl bg-white text-sm font-bold text-slate-900 ring-1 ring-slate-200 transition-colors hover:ring-slate-900 sm:h-11"
            >
              Agendar 1:1
            </a>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            La asesoría 1:1 para prospectos tiene costo. Si ya eres cliente, va
            incluida en tu servicio.
          </p>
        </RevealOnScroll>

        <div className="mt-10">
          <RevealOnScroll>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
              <div className="shrink-0 lg:w-44">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
                  WhatsApp directo
                </p>
                <h2 className="mt-1 text-lg font-black leading-tight tracking-tight text-slate-900 sm:text-xl">
                  Elige el tema y{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    te abrimos el chat
                  </span>
                </h2>
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
                {RAZONES_CONTACTO.map((r) => {
                  const estilo = ESTILO_RAZON[r.icono];
                  return (
                    <a
                      key={r.id}
                      href={CONTACTO_PUBLICO.whatsapp.buildUrl(r.mensaje)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${r.titulo} — abrir WhatsApp`}
                      className="group relative min-h-[76px] overflow-hidden rounded-xl bg-white px-3 py-3 shadow-sm shadow-violet-100/40 ring-1 ring-violet-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100/70 hover:ring-violet-300 sm:min-h-0 sm:px-3.5 sm:py-3"
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
                        <div className="min-w-0">
                          <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            {estilo.eyebrow}
                          </p>
                          <p className="text-[13px] font-bold leading-none text-slate-900 sm:text-sm">
                            {estilo.titulo}
                          </p>
                          <p className="mt-1 line-clamp-1 text-[10px] leading-snug text-slate-500">
                            {r.descripcion}
                          </p>
                        </div>
                        <span className="ml-auto self-center text-sm font-bold text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-600">
                          →
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </RevealOnScroll>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            O escribe tu caso
          </p>
          <h2 id="quickform-title" className="mt-1 text-base font-black text-slate-900 sm:text-lg">
            Lo armamos y lo mandas a WhatsApp de un clic
          </h2>
          <div className="mt-4">
            <ContactoQuickForm />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white px-5 py-4 ring-1 ring-slate-200">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              ¿Ya eres cliente?
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              Entra al portal: declaraciones, acuses y calendario.
            </p>
          </div>
          <Link
            href="/portal/login"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-marca-navy px-4 text-sm font-bold text-white hover:bg-marca-navy-deep"
          >
            Acceder al portal
          </Link>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
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
                className={`text-slate-400 transition-all hover:scale-110 ${r.hoverColor}`}
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

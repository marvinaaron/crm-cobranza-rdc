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
} from "@/lib/contacto-publico";
import ContactoQuickForm from "./ContactoQuickForm";
import ContactoTemasCoverflow from "./ContactoTemasCoverflow";
import EstadoDisponibilidad from "./EstadoDisponibilidad";
import MapaPresencia from "./MapaPresencia";

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
            <div className="relative flex items-end justify-center gap-1 pr-2">
              <div
                aria-hidden
                className="pointer-events-none absolute left-6 top-10 h-52 w-52 rounded-full bg-violet-200/40 blur-3xl"
              />
              <Fiscalino
                mood="happy"
                size={220}
                className="relative z-10 -mb-3 -rotate-[8deg] drop-shadow-[0_18px_28px_rgba(15,29,46,0.16)]"
              />
              <div className="relative z-20 mb-24 -ml-3 max-w-[230px]">
                <p className="rounded-[1.6rem] rounded-bl-md bg-white px-5 py-4 text-[15px] font-black leading-snug text-slate-900 shadow-[0_16px_40px_-16px_rgba(15,29,46,0.22)]">
                  Hola, soy Fiscalino.
                  <span className="mt-1.5 block text-[13px] font-medium leading-relaxed text-slate-600">
                    Tú eliges el tema. Yo armo el mensaje y te conecto con el
                    equipo.
                  </span>
                </p>
                <span
                  aria-hidden
                  className="absolute -left-2 top-8 h-4 w-4 rotate-45 bg-white shadow-[-4px_4px_10px_-4px_rgba(15,29,46,0.12)]"
                />
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
              Elige un tema
            </p>
            <h2 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
              WhatsApp con contexto
            </h2>
            <p className="mt-1 max-w-sm text-[13px] text-slate-500">
              Pasa las opciones y toca la del centro: el mensaje va listo a WhatsApp.
            </p>
            <ContactoTemasCoverflow />
          </div>

          <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-violet-100 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
              O escribe tu caso
            </p>
            <h2 id="quickform-title" className="mt-1 text-base font-black text-slate-900 sm:text-lg">
              Lo armamos y lo mandas a WhatsApp de un clic
            </h2>
            <div className="mt-4 flex-1">
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
      </div>

      <MapaPresencia
        eyebrow="Únete a la familia"
        titulo="Únete a nuestra gran familia en"
        tituloAcento="7 estados de México"
        subtitulo="Trabajamos 100% digital, desde Chihuahua hasta Puebla. La materia fiscal es la misma en todo el país: la distancia nunca es problema."
        mostrarCta={false}
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

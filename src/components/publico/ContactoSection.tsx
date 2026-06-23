/**
 * Página de contacto rediseñada con foco en acción inmediata:
 *  - Hero con dos CTAs principales (WhatsApp + Agendar) y un indicador
 *    en vivo de disponibilidad.
 *  - 4 "atajos" con mensajes pre-cargados de WhatsApp para que el
 *    visitante salte directo al chat correcto en 1 click.
 *  - Formulario express que también dispara WhatsApp con el mensaje
 *    estructurado.
 *  - Tarjeta lateral con teléfono (click-to-call), horario en vivo,
 *    ciudad y atención clientes activos.
 *  - Redes sociales y portal del cliente como tira discreta abajo.
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

const ICONOS_RAZON = {
  spark: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  swap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  alert: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
} as const;

const ESTILO_RAZON: Record<string, string> = {
  spark: "from-violet-500/20 to-indigo-500/20 ring-violet-400/40 text-violet-100",
  swap: "from-sky-500/20 to-cyan-500/20 ring-sky-400/40 text-sky-100",
  alert: "from-rose-500/20 to-amber-500/20 ring-rose-400/40 text-rose-100",
  chat: "from-emerald-500/20 to-teal-500/20 ring-emerald-400/40 text-emerald-100",
};

const REDES_MINI = [
  {
    nombre: "Instagram",
    url: CONTACTO_PUBLICO.instagram.url,
    handle: CONTACTO_PUBLICO.instagram.usuario,
    icono: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    nombre: "Facebook",
    url: CONTACTO_PUBLICO.facebook.url,
    handle: CONTACTO_PUBLICO.facebook.nombre,
    icono: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

export default function ContactoSection() {
  return (
    <section className="relative bg-slate-50 py-10 sm:py-14">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
        <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_top_left,#1e3a5f_0%,#0f1d2e_45%,#0a1424_100%)] p-6 text-white shadow-2xl shadow-slate-900/30 ring-1 ring-marca-navy/40 sm:p-10">
          {/* Halos: violeta más vibrante como acento de marca */}
          <div
            className="absolute -top-20 -right-20 w-80 h-80 bg-violet-500/25 rounded-full blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-16 left-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl"
            aria-hidden
          />
          {/* Trama */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/25 text-[10px] font-black uppercase tracking-[0.22em] text-slate-100">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2l2.4 5 5.6.8-4 4 .9 5.7L12 14.8 7.1 17.5 8 11.8 4 7.8l5.6-.8z" />
                  </svg>
                  Contacto directo
                </span>
                <EstadoDisponibilidad />
              </div>

              <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05]">
                Hablamos por el canal{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-sky-200 bg-clip-text text-transparent">
                  que tú uses todos los días.
                </span>
              </h1>
              <p className="mt-4 text-slate-200/90 leading-relaxed max-w-xl">
                Sin formularios que se pierden en correos. Te contestamos en
                WhatsApp en horas hábiles — usualmente en menos de 2 horas.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                {/* CTA principal: WhatsApp */}
                <a
                  href={CONTACTO_PUBLICO.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm sm:text-base font-black transition-all shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.99]"
                >
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
                    <path d="M16.001 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.26.6 4.46 1.74 6.4L3.2 28.8l6.56-1.72A12.78 12.78 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8S23.07 3.2 16 3.2zm6.81 17.74c-.29.81-1.69 1.55-2.33 1.64-.62.09-1.41.13-2.28-.14-.52-.16-1.2-.39-2.06-.76-3.63-1.57-6-5.23-6.18-5.47-.18-.24-1.47-1.96-1.47-3.74 0-1.77.93-2.65 1.26-3.01.33-.36.72-.45.96-.45h.69c.22 0 .52-.08.81.62.29.7.99 2.41 1.08 2.59.09.18.15.39.03.62-.12.24-.18.39-.36.6-.18.21-.38.47-.54.63-.18.18-.37.38-.16.74.21.36.93 1.53 2 2.47 1.37 1.22 2.52 1.6 2.88 1.78.36.18.57.15.78-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.07.98 2.43 1.16.36.18.6.27.69.42.09.15.09.87-.2 1.68z" />
                  </svg>
                  <span>Chatear por WhatsApp</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
                {/* CTA secundario: Agendar */}
                <a
                  href={CONTACTO_PUBLICO.calendly.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 ring-1 ring-white/25 text-white text-sm sm:text-base font-bold transition-all backdrop-blur-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Agendar asesoría 1:1
                </a>
              </div>

              <p className="mt-4 inline-flex items-center gap-2 text-[11px] text-emerald-200">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Asesoría sin costo para clientes activos del despacho
              </p>
            </div>

            {/* Tarjeta lateral — datos clave */}
            <aside className="lg:col-span-5">
              <div className="rounded-2xl bg-white/[0.06] backdrop-blur-sm ring-1 ring-white/15 p-5 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/70">
                  Datos rápidos
                </p>

                <a
                  href={CONTACTO_PUBLICO.telefono.hrefTel}
                  className="mt-4 flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <span className="inline-flex w-10 h-10 rounded-xl bg-sky-500/15 ring-1 ring-sky-300/30 items-center justify-center text-sky-100 group-hover:bg-sky-500/25 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <span className="flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-300/70">Llamar</span>
                    <span className="block text-sm font-black text-white">
                      {CONTACTO_PUBLICO.telefono.display}
                    </span>
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300/60 group-hover:text-white transition-colors">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </a>

                <div className="mt-1 flex items-center gap-3 p-3 -mx-3">
                  <span className="inline-flex w-10 h-10 rounded-xl bg-sky-500/15 ring-1 ring-sky-300/30 items-center justify-center text-sky-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300/70">Horario</p>
                    <p className="text-[12px] text-white leading-snug">
                      {HORARIO_ATENCION.resumen}
                    </p>
                  </div>
                </div>

                <div className="mt-1 flex items-center gap-3 p-3 -mx-3">
                  <span className="inline-flex w-10 h-10 rounded-xl bg-sky-500/15 ring-1 ring-sky-300/30 items-center justify-center text-sky-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300/70">Ciudad</p>
                    <p className="text-[12px] text-white leading-snug">{HORARIO_ATENCION.ciudad}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
        </RevealOnScroll>

        {/* ─── Atajos: razones de contacto ─── */}
        <div className="mt-10">
          <RevealOnScroll>
          <div className="flex items-end justify-between flex-wrap gap-2 mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-marca-navy">
                Respuesta rápida
              </p>
              <h2 className="mt-1.5 text-xl sm:text-2xl font-black text-slate-900">
                Elige el tema y te abrimos el chat con el contexto correcto
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              1 click · sin formularios
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RAZONES_CONTACTO.map((r) => (
              <li key={r.id}>
                <a
                  href={CONTACTO_PUBLICO.whatsapp.buildUrl(r.mensaje)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${ESTILO_RAZON[r.icono]} ring-1 hover:scale-[1.01] transition-all shadow-sm hover:shadow-md`}
                  style={{ backgroundColor: "rgba(255,255,255,0.92)" }}
                >
                  <span className="shrink-0 inline-flex w-11 h-11 rounded-xl bg-white ring-1 ring-slate-200 items-center justify-center text-slate-700 group-hover:ring-violet-300 transition-colors">
                    {ICONOS_RAZON[r.icono]}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-black text-slate-900 leading-tight">
                      {r.titulo}
                    </span>
                    <span className="block mt-1 text-[12px] text-slate-600 leading-relaxed">
                      {r.descripcion}
                    </span>
                  </span>
                  <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" className="shrink-0 text-[#25D366] mt-1" aria-hidden>
                    <path d="M16.001 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.26.6 4.46 1.74 6.4L3.2 28.8l6.56-1.72A12.78 12.78 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8S23.07 3.2 16 3.2z" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          </RevealOnScroll>
        </div>

        {/* ─── Formulario express + recordatorios ─── */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="inline-flex w-9 h-9 rounded-xl bg-violet-100 text-violet-700 items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13" />
                  <path d="m22 2-7 20-4-9-9-4 20-7z" />
                </svg>
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
                  Formulario express
                </p>
                <h3 id="quickform-title" className="text-base sm:text-lg font-black text-slate-900">
                  Mándanos tu mensaje y lo abrimos en WhatsApp
                </h3>
              </div>
            </div>
            <div className="mt-5">
              <ContactoQuickForm />
            </div>
          </div>

          {/* Por qué WhatsApp + portal */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 shadow-lg shadow-emerald-200/50">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" aria-hidden />
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100/80">
                ¿Por qué WhatsApp?
              </p>
              <h3 className="mt-2 text-lg font-black leading-snug">
                Es el canal que tu contador realmente revisa.
              </h3>
              <ul className="mt-4 space-y-2 text-[12px] text-emerald-50/95">
                {[
                  "Sin correos perdidos entre spam",
                  "Respondemos en menos de 2 horas hábiles",
                  "Quedan registradas tus dudas y nuestras respuestas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-emerald-200">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                ¿Ya eres cliente?
              </p>
              <h3 className="mt-1.5 text-base font-black text-slate-900">
                Entra a tu portal del despacho
              </h3>
              <p className="mt-1.5 text-[12px] text-slate-500 leading-relaxed">
                Ve tus declaraciones, acuses, recordatorios fiscales y tu
                calendario sin esperar respuesta.
              </p>
              <Link
                href="/portal/login"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors w-full justify-center"
              >
                Acceder al portal
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Tira de redes sociales (discretas) ─── */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-slate-400">
            También nos encuentras en
          </p>
          <div className="flex items-center gap-3">
            {REDES_MINI.map((r) => (
              <a
                key={r.nombre}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 hover:ring-violet-300 hover:text-violet-600 text-slate-500 text-[12px] font-medium transition-colors"
                aria-label={`${r.nombre} ${r.handle}`}
              >
                {r.icono}
                <span>{r.handle}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

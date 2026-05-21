import Link from "next/link";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

const REDES = [
  {
    nombre: "WhatsApp",
    descripcion: CONTACTO_PUBLICO.whatsapp.numeroDisplay,
    detalle: "Respuesta directa",
    url: CONTACTO_PUBLICO.whatsapp.url,
    ringHover: "hover:ring-emerald-500",
    iconWrap: "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    nombre: "Instagram",
    descripcion: CONTACTO_PUBLICO.instagram.usuario,
    detalle: "Síguenos",
    url: CONTACTO_PUBLICO.instagram.url,
    ringHover: "hover:ring-pink-500",
    iconWrap: "bg-pink-100 text-pink-700 group-hover:bg-gradient-to-tr group-hover:from-yellow-400 group-hover:via-pink-500 group-hover:to-purple-600 group-hover:text-white",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    nombre: "Facebook",
    descripcion: CONTACTO_PUBLICO.facebook.nombre,
    detalle: "Página oficial",
    url: CONTACTO_PUBLICO.facebook.url,
    ringHover: "hover:ring-blue-500",
    iconWrap: "bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

export default function ContactoSection() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
            Contacto
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            ¿Hablamos sobre tu negocio?
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Cuéntanos qué necesitas. Respondemos en horas hábiles por el canal que prefieras.
          </p>
        </div>

        {/* TARJETA DESTACADA: AGENDAR ASESORÍA */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 mb-8 ring-1 ring-slate-800">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" aria-hidden />
          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/20 text-[10px] font-bold uppercase tracking-widest">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Asesoría con un contador
              </span>
              <h3 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight">
                Agenda una asesoría profesional
              </h3>
              <p className="mt-3 text-slate-300 leading-relaxed max-w-xl">
                Elige el día y la hora que mejor te acomode. Resolvemos tus dudas
                contables y fiscales en una sesión 1 a 1.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 ring-1 ring-emerald-500/30 rounded-full px-3 py-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Sin costo para clientes activos del despacho
              </p>
            </div>
            <div className="flex lg:justify-end">
              <a
                href={CONTACTO_PUBLICO.calendly.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 text-sm font-black hover:bg-slate-100 transition-colors shadow-lg w-full lg:w-auto justify-center"
              >
                Reservar mi horario
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* REDES SOCIALES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {REDES.map((r) => (
            <a
              key={r.nombre}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group bg-white rounded-2xl p-6 ring-1 ring-slate-200 hover:shadow-xl transition-all ${r.ringHover}`}
            >
              <span className={`inline-flex w-11 h-11 rounded-xl items-center justify-center transition-colors ${r.iconWrap}`}>
                {r.icono}
              </span>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {r.nombre}
              </p>
              <p className="text-sm font-bold text-slate-900 break-words">{r.descripcion}</p>
              <p className="mt-1 text-xs text-slate-500">{r.detalle}</p>
            </a>
          ))}
        </div>

        {/* ACCESO AL PORTAL — DISCRETO */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-600">
            ¿Ya eres cliente del despacho?{" "}
            <Link
              href="/portal/login"
              className="font-bold text-slate-900 underline underline-offset-4 hover:text-indigo-600 transition-colors"
            >
              Entra a tu portal
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

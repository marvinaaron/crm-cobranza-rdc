import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import Hero from "@/components/publico/Hero";
import Valores from "@/components/publico/Valores";

export const metadata = {
  title: "RDC Contadores · Despacho contable y fiscal",
  description:
    "Despacho contable RDC: cumplimiento fiscal, contabilidad para personas físicas y morales, herramientas fiscales (ISR, INPC, UMA) y portal seguro para clientes.",
};

const ACCESOS = [
  {
    titulo: "Servicios",
    descripcion:
      "Contabilidad, cumplimiento, nóminas, declaración anual y asesoría fiscal.",
    href: "/servicios",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Cómo trabajamos",
    descripcion:
      "Nuestro flujo de 7 pasos para cumplimiento fiscal y 5 para cobranza, sin sorpresas.",
    href: "/proceso",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    titulo: "Herramientas fiscales",
    descripcion:
      "Tablas vigentes de ISR, INPC, UMA, salario mínimo y recargos. INPC desde INEGI.",
    href: "/herramientas",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
      </svg>
    ),
  },
  {
    titulo: "Nosotros",
    descripcion:
      "Más de una década apoyando a personas físicas y morales con cercanía.",
    href: "/nosotros",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <PublicShell>
      <Hero />
      <Valores />

      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
              Conoce el despacho
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Explora lo que hacemos
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Cada sección está pensada para que veas cómo trabajamos y decidas si somos el
              despacho que tu negocio necesita.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ACCESOS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group bg-white rounded-2xl p-6 ring-1 ring-slate-200 hover:ring-slate-900 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <span className="inline-flex w-11 h-11 rounded-xl bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors items-center justify-center">
                  {a.icono}
                </span>
                <h3 className="mt-4 text-base font-black text-slate-900">{a.titulo}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{a.descripcion}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  Ver más
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA grande hacia contacto */}
      <section className="py-16 bg-gradient-to-t from-slate-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Listo para tener tu contabilidad en orden
          </h2>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
            Agenda una llamada sin compromiso. Te decimos qué necesitas, cuánto cuesta y
            cómo empezamos a trabajar contigo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm"
            >
              Contactar al despacho
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/portal/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white text-sm font-bold ring-1 ring-white/20 hover:bg-white/20 transition-colors"
            >
              Soy cliente, entrar al portal
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

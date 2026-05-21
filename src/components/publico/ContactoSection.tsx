import Link from "next/link";

export default function ContactoSection() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600">
            Contacto
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            ¿Hablamos sobre tu negocio?
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Cuéntanos qué necesitas y te respondemos en menos de 24 horas hábiles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <a
            href="mailto:cp.aaronr@rdcontadores.com"
            className="group bg-white rounded-2xl p-6 ring-1 ring-slate-200 hover:ring-slate-900 hover:shadow-xl transition-all"
          >
            <span className="inline-flex w-11 h-11 rounded-xl bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
            </span>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Correo
            </p>
            <p className="text-sm font-bold text-slate-900 break-all">cp.aaronr@rdcontadores.com</p>
            <p className="mt-1 text-xs text-slate-500">Respuesta en horas hábiles</p>
          </a>

          <a
            href="https://wa.me/521"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl p-6 ring-1 ring-slate-200 hover:ring-emerald-500 hover:shadow-xl transition-all"
          >
            <span className="inline-flex w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </span>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              WhatsApp
            </p>
            <p className="text-sm font-bold text-slate-900">Mensaje directo</p>
            <p className="mt-1 text-xs text-slate-500">Atención personalizada</p>
          </a>

          <Link
            href="/portal/login"
            className="group bg-slate-900 text-white rounded-2xl p-6 ring-1 ring-slate-900 hover:bg-slate-800 hover:shadow-xl transition-all"
          >
            <span className="inline-flex w-11 h-11 rounded-xl bg-white/10 text-white items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-300">
              Soy cliente
            </p>
            <p className="text-base font-black">Entrar al portal</p>
            <p className="mt-1 text-xs text-slate-300">Tu información 24/7</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

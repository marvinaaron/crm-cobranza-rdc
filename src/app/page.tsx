import Link from "next/link";
import PublicHeader from "@/components/publico/PublicHeader";
import PublicFooter from "@/components/publico/PublicFooter";
import HerramientasFiscales from "@/components/publico/HerramientasFiscales";
import ComoTrabajamos from "@/components/publico/ComoTrabajamos";
import PortalPreview from "@/components/publico/PortalPreview";

export const metadata = {
  title: "RDC Contadores · Despacho contable y fiscal",
  description:
    "Despacho contable RDC: cumplimiento fiscal, contabilidad para personas físicas y morales, herramientas fiscales (ISR, INPC, UMA) y portal seguro para clientes.",
};

const SERVICIOS = [
  {
    titulo: "Cumplimiento fiscal mensual",
    descripcion:
      "Declaraciones provisionales, definitivas, DIOT y obligaciones informativas presentadas a tiempo.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Contabilidad electrónica",
    descripcion:
      "Registro contable conforme a NIF, generación de XML para SAT y conciliaciones bancarias.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-5" />
      </svg>
    ),
  },
  {
    titulo: "Nóminas y SUA / IMSS",
    descripcion:
      "Cálculo de nómina, timbrado, alta y baja de trabajadores y cumplimiento ante el IMSS e Infonavit.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    titulo: "Declaración anual",
    descripcion:
      "Personas físicas y morales: deducciones autorizadas, saldos a favor y devoluciones automáticas.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Asesoría fiscal y planeación",
    descripcion:
      "Optimización de carga fiscal con estrategias legales, simuladores y atención de requerimientos del SAT.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    titulo: "Constitución de empresas",
    descripcion:
      "Apoyo en la formación de personas morales y régimen fiscal óptimo según su giro y proyección.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="12" y1="11" x2="12" y2="16" />
        <line x1="9.5" y1="13.5" x2="14.5" y2="13.5" />
      </svg>
    ),
  },
];

const VALORES = [
  {
    titulo: "Cumplimiento puntual",
    descripcion: "Tus impuestos presentados a tiempo. Sin sorpresas ni recargos.",
  },
  {
    titulo: "Atención cercana",
    descripcion: "Respondemos en horas, no en días. Hablamos claro y sin tecnicismos.",
  },
  {
    titulo: "Tecnología propia",
    descripcion: "Portal del cliente con tu información actualizada las 24 horas.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50" />
        <div className="absolute top-0 right-0 -z-10 w-[28rem] h-[28rem] bg-indigo-200/40 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-[11px] font-bold uppercase tracking-widest text-slate-700 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Cumplimiento fiscal mensual y anual
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.05]">
                Tu contabilidad <span className="text-indigo-600">en buenas manos</span>.
              </h1>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl">
                Acompañamos a personas físicas y morales en sus obligaciones ante el SAT, IMSS
                e Infonavit. Cumplimiento puntual, asesoría clara y un portal exclusivo para
                que veas tu información en todo momento.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#contacto"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Solicitar cotización
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="#herramientas"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-bold ring-1 ring-slate-200 hover:ring-slate-900 transition-colors"
                >
                  Ver herramientas fiscales
                </a>
              </div>

              <div className="mt-10 flex items-center gap-6 text-xs text-slate-500">
                <div>
                  <p className="text-2xl font-black text-slate-900">+10</p>
                  <p>años de experiencia</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div>
                  <p className="text-2xl font-black text-slate-900">100%</p>
                  <p>declaraciones a tiempo</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div>
                  <p className="text-2xl font-black text-slate-900">24/7</p>
                  <p>portal de clientes</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-indigo-200/40 ring-1 ring-slate-200 p-6 rotate-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Cumplimiento mensual
                    </p>
                    <p className="text-sm font-bold text-slate-900">Resumen del periodo</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-widest">
                    Al día
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { etiqueta: "ISR retenciones", estado: "Presentado" },
                    { etiqueta: "IVA mensual", estado: "Presentado" },
                    { etiqueta: "DIOT", estado: "Presentado" },
                    { etiqueta: "IMSS / Infonavit", estado: "Pagado" },
                  ].map((item) => (
                    <div key={item.etiqueta} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span className="text-sm font-semibold text-slate-800">{item.etiqueta}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">{item.estado}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-slate-900 text-white rounded-2xl px-5 py-4 shadow-xl -rotate-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  Portal del cliente
                </p>
                <p className="text-base font-black">Tu información, siempre lista</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="border-y border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {VALORES.map((v) => (
              <div key={v.titulo} className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-black text-slate-900">{v.titulo}</p>
                  <p className="text-sm text-slate-600">{v.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
              Servicios
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Soluciones contables y fiscales integrales
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Todo lo que tu persona física o moral necesita, en un solo despacho.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICIOS.map((s) => (
              <div
                key={s.titulo}
                className="group bg-white rounded-2xl p-6 ring-1 ring-slate-200 hover:ring-slate-900 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <span className="inline-flex w-11 h-11 rounded-xl bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors items-center justify-center">
                  {s.icono}
                </span>
                <h3 className="mt-4 text-base font-black text-slate-900">{s.titulo}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO TRABAJAMOS (workflow) */}
      <ComoTrabajamos />

      {/* PORTAL DEL CLIENTE (preview interactivo) */}
      <PortalPreview />

      {/* HERRAMIENTAS FISCALES (TABS) */}
      <HerramientasFiscales />

      {/* NOSOTROS */}
      <section id="nosotros" className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
                Nosotros
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Un despacho que se siente como parte de tu equipo
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                En RDC Contadores combinamos la experiencia de un contador público
                certificado con tecnología propia para darte un servicio puntual, claro y
                cercano. Nuestro objetivo es que tu tiempo lo dediques a tu negocio mientras
                nosotros nos encargamos del SAT.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Contador público colegiado con cédula profesional vigente",
                  "Cumplimiento del 100% de tus obligaciones con el SAT, IMSS e Infonavit",
                  "Comunicación directa por WhatsApp, correo y portal del cliente",
                  "Asesoría fiscal proactiva para optimizar tu carga tributaria",
                ].map((punto) => (
                  <li key={punto} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className="text-sm text-slate-700">{punto}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-900 text-white p-6">
                  <p className="text-3xl font-black">+10</p>
                  <p className="text-xs uppercase tracking-widest text-slate-300 mt-1">
                    Años en el sector
                  </p>
                </div>
                <div className="rounded-2xl bg-indigo-600 text-white p-6">
                  <p className="text-3xl font-black">100%</p>
                  <p className="text-xs uppercase tracking-widest text-indigo-100 mt-1">
                    Cumplimiento puntual
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-600 text-white p-6 col-span-2">
                  <p className="text-3xl font-black">PF y PM</p>
                  <p className="text-xs uppercase tracking-widest text-emerald-100 mt-1">
                    Personas físicas y morales
                  </p>
                  <p className="mt-3 text-sm text-emerald-50">
                    Desde RESICO hasta régimen general de ley.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
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

      <PublicFooter />
    </div>
  );
}

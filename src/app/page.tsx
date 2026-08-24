import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import Hero from "@/components/publico/Hero";
import Valores from "@/components/publico/Valores";
import CasosDeUso from "@/components/publico/CasosDeUso";
import PorQueRdc from "@/components/publico/PorQueRdc";
import PrecioVisible from "@/components/publico/PrecioVisible";
import Testimonios from "@/components/publico/Testimonios";
import LogosCredibilidad from "@/components/publico/LogosCredibilidad";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import {
  buildOrganizationSchema,
  buildLocalBusinessSchema,
  buildWebSiteSchema,
  buildSiteNavigationSchema,
  buildServicesSchema,
} from "@/lib/seo/jsonld";

export const metadata = buildPublicMetadata({
  title: "Tus impuestos en una app · RDC Contadores Guadalajara",
  description:
    "Despacho fiscal en Guadalajara con app propia. Herramientas contables gratis y portal 24/7 para tus obligaciones con el SAT.",
  path: "/",
  keywords: [
    "app contable México",
    "app impuestos SAT",
    "contador en Guadalajara",
    "herramientas fiscales gratis",
    "portal contador cliente",
    "RESICO Guadalajara",
    "despacho fiscal Jalisco",
  ],
});

const ACCESOS = [
  {
    eyebrow: "Qué hacemos",
    titulo: "Servicios",
    hint: "Contabilidad, nómina y fiscal",
    href: "/servicios",
    acento: "from-indigo-500 to-violet-500",
    iconBg: "bg-indigo-500/15 text-indigo-200",
    icon: "servicios" as const,
  },
  {
    eyebrow: "Proceso",
    titulo: "Cómo trabajamos",
    hint: "7 pasos claros, sin sorpresas",
    href: "/proceso",
    acento: "from-cyan-500 to-sky-500",
    iconBg: "bg-cyan-500/15 text-cyan-200",
    icon: "proceso" as const,
  },
  {
    eyebrow: "Gratis",
    titulo: "Herramientas",
    hint: "ISR, INPC, UMA y más",
    href: "/herramientas",
    acento: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-500/15 text-emerald-200",
    icon: "herramientas" as const,
  },
  {
    eyebrow: "Despacho",
    titulo: "Nosotros",
    hint: "+10 años de cercanía",
    href: "/nosotros",
    acento: "from-rose-500 to-orange-400",
    iconBg: "bg-rose-500/15 text-rose-200",
    icon: "nosotros" as const,
  },
];

function AccesoIcon({ kind }: { kind: (typeof ACCESOS)[number]["icon"] }) {
  const props = {
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
  switch (kind) {
    case "servicios":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      );
    case "proceso":
      return (
        <svg {...props}>
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      );
    case "herramientas":
      return (
        <svg {...props}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "nosotros":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
  }
}

export default function Home() {
  return (
    <PublicShell>
      <JsonLd
        data={[
          buildOrganizationSchema(),
          buildLocalBusinessSchema(),
          buildWebSiteSchema(),
          ...buildSiteNavigationSchema(),
          ...buildServicesSchema(),
        ]}
      />
      <Hero />

      {/* Mapa compacto al contenido profundo — llamativo, poca altura */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 py-5 sm:py-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 80% at 10% 50%, rgba(99,102,241,0.35), transparent), radial-gradient(ellipse 50% 70% at 90% 40%, rgba(139,92,246,0.25), transparent)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            <div className="shrink-0 lg:w-44">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-300/90">
                Conoce el despacho
              </p>
              <h2 className="mt-1 text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                Explora lo que{" "}
                <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                  hacemos
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 flex-1 min-w-0">
              {ACCESOS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group relative overflow-hidden rounded-xl bg-white/[0.06] ring-1 ring-white/10 px-3 py-2.5 sm:px-3.5 sm:py-3 hover:bg-white/[0.11] hover:ring-white/25 transition-all duration-200"
                >
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${a.acento} opacity-80 group-hover:opacity-100`}
                  />
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${a.iconBg}`}
                    >
                      <AccesoIcon kind={a.icon} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-white/45 mb-0.5">
                        {a.eyebrow}
                      </p>
                      <p className="text-[13px] sm:text-sm font-bold text-white leading-none group-hover:text-indigo-100 transition-colors">
                        {a.titulo}
                      </p>
                      <p className="mt-1 text-[10px] text-white/50 leading-snug line-clamp-1">
                        {a.hint}
                      </p>
                    </div>
                    <span className="ml-auto self-center text-white/30 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all text-sm font-bold">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Valores />
      <CasosDeUso />
      <PorQueRdc />
      <PrecioVisible />
      <Testimonios />
      <LogosCredibilidad />

      {/* SECCIÓN — CTA final (full-bleed; degradado vertical claro→oscuro que se funde con el footer) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 to-slate-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center">
        {/* Línea de acento superior */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/45 to-transparent"
        />

        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block bg-indigo-600/15 border border-indigo-500/25 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            Sin compromiso · Respuesta en 24 hrs
          </span>
          <h2 className="text-white text-2xl md:text-4xl font-black tracking-tight mb-3 leading-tight">
            Agenda una llamada
            <br />
            y empieza hoy.
          </h2>
          <p className="text-slate-400 text-sm md:text-base mb-8 max-w-xl mx-auto">
            Te decimos qué necesitas, cuánto cuesta y cómo empezamos. Sin
            contratos ni sorpresas.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/contacto"
              className="block text-center w-full max-w-xs bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-8 py-3.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-indigo-900/40"
            >
              Contactar al despacho →
            </Link>
            <Link
              href="/preguntas-frecuentes"
              className="block text-center w-full max-w-xs bg-white/8 border border-white/15 text-white/70 font-medium px-8 py-3 rounded-xl text-sm hover:bg-white/12 transition-all"
            >
              Ver preguntas frecuentes
            </Link>
            <Link
              href="/portal/login"
              className="text-slate-500 text-xs hover:text-slate-300 transition-colors mt-1"
            >
              Soy cliente, entrar al portal
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

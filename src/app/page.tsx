import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import Hero from "@/components/publico/Hero";
import Valores from "@/components/publico/Valores";
import CasosDeUso from "@/components/publico/CasosDeUso";
import PorQueRdc from "@/components/publico/PorQueRdc";
import PrecioVisible from "@/components/publico/PrecioVisible";
import Testimonios from "@/components/publico/Testimonios";
import CtaCineBand from "@/components/publico/CtaCineBand";
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
    iconBg: "bg-violet-100 text-violet-700",
    icon: "servicios" as const,
  },
  {
    eyebrow: "Proceso",
    titulo: "Cómo trabajamos",
    hint: "7 pasos claros, sin sorpresas",
    href: "/proceso",
    iconBg: "bg-sky-100 text-sky-700",
    icon: "proceso" as const,
  },
  {
    eyebrow: "Gratis",
    titulo: "Herramientas",
    hint: "ISR, INPC, UMA y más",
    href: "/herramientas",
    iconBg: "bg-emerald-100 text-emerald-700",
    icon: "herramientas" as const,
  },
  {
    eyebrow: "Despacho",
    titulo: "Nosotros",
    hint: "+10 años de cercanía",
    href: "/nosotros",
    iconBg: "bg-amber-100 text-amber-800",
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

      {/* Mapa compacto al contenido — lenguaje cinema */}
      <section className="relative overflow-hidden border-y border-black/5 bg-[#f6f6f6] py-5 sm:py-6">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="shrink-0 lg:w-44">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-marca-navy/45">
                Conoce el despacho
              </p>
              <h2 className="mt-1 text-lg font-black leading-tight tracking-tight text-marca-navy sm:text-xl">
                Explora lo que hacemos
              </h2>
            </div>

            <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
              {ACCESOS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group relative overflow-hidden rounded-xl bg-white px-3 py-2.5 shadow-[0_1px_0_rgba(15,29,46,0.08),0_10px_24px_rgba(15,29,46,0.04)] ring-1 ring-marca-navy/8 transition-all duration-200 hover:-translate-y-0.5 hover:ring-marca-navy/20 sm:px-3.5 sm:py-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${a.iconBg}`}
                    >
                      <AccesoIcon kind={a.icon} />
                    </span>
                    <div className="min-w-0">
                      <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-marca-navy/40">
                        {a.eyebrow}
                      </p>
                      <p className="text-[13px] font-bold leading-none text-marca-navy sm:text-sm">
                        {a.titulo}
                      </p>
                      <p className="mt-1 line-clamp-1 text-[10px] leading-snug text-marca-navy/55">
                        {a.hint}
                      </p>
                    </div>
                    <span className="ml-auto self-center text-sm font-bold text-marca-navy/25 transition-all group-hover:translate-x-0.5 group-hover:text-marca-navy">
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

      <CtaCineBand
        titulo={
          <>
            ¿Lo hacemos
            <br />
            por ti?
          </>
        }
        subtitulo="Cotiza tu paquete o escríbenos por WhatsApp. Contador en Guadalajara + portal. Primera llamada gratis."
        origenWa="Hola. Vi el inicio del sitio y quiero cotizar con RDC Contadores."
      />
    </PublicShell>
  );
}

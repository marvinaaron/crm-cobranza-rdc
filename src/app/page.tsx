import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import Hero from "@/components/publico/Hero";
import Valores from "@/components/publico/Valores";
import CasosDeUso from "@/components/publico/CasosDeUso";
import PorQueRdc from "@/components/publico/PorQueRdc";
import PrecioVisible from "@/components/publico/PrecioVisible";
import Testimonios from "@/components/publico/Testimonios";
import LogosCredibilidad from "@/components/publico/LogosCredibilidad";
import BannerMundial from "@/components/publico/BannerMundial";
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
  title:
    "RDC Contadores · Despacho contable en Guadalajara · RESICO desde $812/mes",
  description:
    "Despacho contable y fiscal en Guadalajara con portal exclusivo para clientes. RESICO desde $812/mes. Personas físicas, morales, nóminas, REPSE. Cero declaraciones brincadas.",
  path: "/",
  keywords: [
    "contador en Guadalajara",
    "despacho contable Guadalajara",
    "RESICO Guadalajara",
    "contador fiscal RESICO",
    "despacho fiscal Jalisco",
    "contabilidad PYME México",
    "portal de cliente contador",
    "REPSE ICSOE SISUB",
  ],
});

const ACCESOS = [
  {
    eyebrow: "Qué hacemos",
    titulo: "Servicios",
    descripcion:
      "Contabilidad, cumplimiento, nóminas, declaración anual y asesoría fiscal.",
    href: "/servicios",
    emoji: "⚙️",
  },
  {
    eyebrow: "Nuestro proceso",
    titulo: "Cómo trabajamos",
    descripcion:
      "Nuestro flujo de 7 pasos para cumplimiento fiscal y 5 para cobranza, sin sorpresas.",
    href: "/proceso",
    emoji: "📋",
  },
  {
    eyebrow: "Recursos gratis",
    titulo: "Herramientas fiscales",
    descripcion:
      "Tablas vigentes de ISR, INPC, UMA, salario mínimo y recargos. INPC desde INEGI.",
    href: "/herramientas",
    emoji: "🛠️",
  },
  {
    eyebrow: "El despacho",
    titulo: "Nosotros",
    descripcion:
      "Más de una década apoyando a personas físicas y morales con cercanía.",
    href: "/nosotros",
    emoji: "👤",
  },
];

/** Lienzo continuo estilo Apple: un solo gris cálido, sin cortes visibles. */
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

      <div className="bg-[#fbfbfd] text-slate-900">
        <Hero />
        <Valores />
        <BannerMundial />
        <CasosDeUso />
        <PorQueRdc />
        <PrecioVisible />
        <Testimonios />
        <LogosCredibilidad />

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">
                Conoce el despacho
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Explora lo que hacemos
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-base text-slate-500">
                Cada sección te muestra cómo trabajamos para que decidas con claridad.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ACCESOS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group rounded-2xl bg-white p-5 ring-1 ring-black/[0.04] transition hover:ring-black/[0.08]"
                >
                  <span className="mb-3 block text-2xl" aria-hidden="true">
                    {a.emoji}
                  </span>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    {a.eyebrow}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{a.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{a.descripcion}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-indigo-600 group-hover:underline">
                    Ver más
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Único bloque oscuro: cierre, sin puente SVG */}
      <section className="bg-[#1d1d1f] px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-medium text-slate-400">Sin compromiso · Respuesta en 24 h</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Agenda una llamada y empieza hoy.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-slate-400">
            Te decimos qué necesitas, cuánto cuesta y cómo empezamos.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/contacto"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Contactar al despacho
            </Link>
            <Link
              href="/preguntas-frecuentes"
              className="text-sm text-slate-500 transition hover:text-white"
            >
              Preguntas frecuentes
            </Link>
            <Link href="/portal/login" className="text-xs text-slate-600 hover:text-slate-400">
              Soy cliente · entrar al portal
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

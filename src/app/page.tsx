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
      <Valores />
      <BannerMundial />
      <CasosDeUso />
      <PorQueRdc />
      <PrecioVisible />
      <Testimonios />
      <LogosCredibilidad />

      {/* SECCIÓN 7 — Explora lo que hacemos */}
      <section className="py-14 sm:py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-2">
              Conoce el despacho
            </p>
            <h2 className="text-slate-900 text-2xl md:text-3xl font-black tracking-tight mb-3">
              Explora lo que{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                hacemos
              </span>
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Cada sección está pensada para que veas cómo trabajamos y decidas si somos el
              despacho que tu negocio necesita.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACCESOS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group relative overflow-hidden flex flex-col bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <span
                  className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg mb-3"
                  aria-hidden="true"
                >
                  {a.emoji}
                </span>
                <p className="text-indigo-500 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  {a.eyebrow}
                </p>
                <h3 className="text-slate-900 font-bold text-base mb-1.5 group-hover:text-indigo-700 transition-colors">
                  {a.titulo}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  {a.descripcion}
                </p>
                <span className="mt-auto text-indigo-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ver más →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 8 — CTA final (full-bleed; degradado vertical claro→oscuro que se funde con el footer) */}
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

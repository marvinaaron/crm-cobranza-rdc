import type { Metadata } from "next";
import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import HerramientasPricingExperience from "@/components/publico/HerramientasPricingExperience";
import { FilaMetodosPago } from "@/components/publico/PaymentMethodLogos";
import {
  ETIQUETAS_HERRAMIENTA,
  LIMITE_GRATIS_POR_HERRAMIENTA,
  formatPrecioMxn,
  PRECIO_BUNDLE_MENSUAL,
} from "@/lib/herramientas/pricing";
import { HERRAMIENTAS } from "@/lib/seo/herramientas-config";
import { SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Herramientas Pro+ · Planes y precios",
  description: `Desbloquea todas las herramientas fiscales RDC desde ${formatPrecioMxn(PRECIO_BUNDLE_MENSUAL)}/mes. 3 consultas gratis por herramienta.`,
  alternates: { canonical: `${SITE_URL}/herramientas/pro` },
};

const PASOS = [
  {
    n: "1",
    titulo: "Prueba gratis",
    texto: `${LIMITE_GRATIS_POR_HERRAMIENTA} consultas en cada herramienta, sin tarjeta.`,
  },
  {
    n: "2",
    titulo: "Elige tu plan",
    texto: "Una herramienta, el bundle mensual (favorito) o anual / lifetime.",
  },
  {
    n: "3",
    titulo: "Paga seguro",
    texto: "Checkout con Stripe. Recibes confirmación al instante.",
  },
  {
    n: "4",
    titulo: "Entra al portal",
    texto: "Inicia sesión con el mismo correo para verificar tu Pro+.",
  },
];

export default function HerramientasProPage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-950 via-indigo-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-400 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-violet-300">
            Pro+ · Experiencia completa
          </p>
          <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Todas las herramientas fiscales.
            <br />
            <span className="text-violet-300">Un solo acceso.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
            RFC, facturación, RESICO, ISR, INPC, UMA, salario mínimo, recargos y
            tipo de cambio — sin límites, siempre actualizadas por contadores reales.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#planes"
              className="inline-flex px-5 py-3 rounded-xl bg-white text-violet-950 text-sm font-black hover:bg-violet-50 transition"
            >
              Ver planes desde {formatPrecioMxn(PRECIO_BUNDLE_MENSUAL)}/mes
            </a>
            <Link
              href="/portal/login?next=/herramientas/pro"
              className="inline-flex px-5 py-3 rounded-xl border border-white/30 text-sm font-bold hover:bg-white/10 transition"
            >
              Ya soy cliente RDC
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PASOS.map((p) => (
              <div key={p.n} className="text-center">
                <div className="w-9 h-9 mx-auto rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-black">
                  {p.n}
                </div>
                <p className="mt-2 text-xs font-black text-slate-900">{p.titulo}</p>
                <p className="mt-1 text-[11px] text-slate-500 leading-snug">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-600">
            Pago seguro
          </p>
          <h2 className="mt-2 text-lg font-black text-slate-900">
            Checkout con Stripe
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            No guardamos datos de tu tarjeta. El cobro lo procesa Stripe con cifrado
            de nivel bancario. Confirmación al instante y acceso Pro+ en cuanto se
            valida el pago.
          </p>
          <FilaMetodosPago className="mt-5" incluirTarjetas />
        </div>
      </section>

      <section id="planes" className="py-14 sm:py-16 bg-slate-50/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <HerramientasPricingExperience />
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-black text-slate-900 text-center mb-6">
            Qué incluye el bundle
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {HERRAMIENTAS.map((h) => (
              <li
                key={h.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 text-sm text-slate-700"
              >
                <span className="text-emerald-500 font-bold">✓</span>
                <Link href={h.path} className="font-semibold hover:text-violet-700">
                  {ETIQUETAS_HERRAMIENTA[h.id]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-12 bg-marca-navy text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <p className="text-lg font-bold">¿Prefieres que lo hagamos por ti?</p>
          <p className="mt-2 text-sm text-white/80">
            Contador en Guadalajara + portal de cliente. Honorarios claros, cumplimiento al día.
          </p>
          <Link
            href="/cotizar"
            className="mt-5 inline-flex px-5 py-2.5 rounded-xl bg-white text-marca-navy text-sm font-black"
          >
            Cotizar honorarios
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

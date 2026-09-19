import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "./PublicShell";
import FaqSecciones from "./FaqSecciones";
import CtaConversionHerramienta from "@/components/ui/cta-conversion-herramienta";
import {
  buildHerramientaJsonLd,
  type HerramientaSeoConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const TickerDivisas = dynamic(() => import("./TickerDivisas"), {
  loading: () => <div className="h-9 border-b border-slate-200/80 bg-white/95" />,
});

type Props = {
  config: HerramientaSeoConfig;
  children: React.ReactNode;
  ctaTitulo?: string;
  ctaSubtitulo?: string;
  /** Si true, no muestra los párrafos de intro arriba: la herramienta queda primero. */
  sinIntro?: boolean;
  /** Foto editorial (miniatura de Google). Si existe, va arriba del H1. */
  hero?: { src: string; alt: string };
  /** Definición o tabla indexable justo debajo del intro, antes de la herramienta. */
  extraAntes?: React.ReactNode;
  /** Bloque extra (listas, definiciones) entre la herramienta y el CTA. */
  extra?: React.ReactNode;
  /** Sin caja blanca alrededor de la herramienta: la tabla queda como pieza central. */
  sinCaja?: boolean;
  /** Franja a todo el ancho (después del breadcrumb). Sustituye H1 e intro. */
  banner?: React.ReactNode;
};

/**
 * Plantilla server-side para páginas dedicadas de herramientas fiscales.
 * Incluye texto indexable, FAQ visible y JSON-LD para Google.
 */
export default function HerramientaFiscalPage({
  config,
  children,
  ctaTitulo,
  ctaSubtitulo,
  sinIntro = false,
  hero,
  extraAntes,
  extra,
  sinCaja = false,
  banner,
}: Props) {
  const cuerpo = (
    <>
      {hero ? (
        <figure className="mb-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-slate-200 shadow-sm bg-slate-100">
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1152px"
              className="object-cover"
            />
          </div>
        </figure>
      ) : null}

      {!banner ? (
        <header className={sinIntro ? "mb-5" : "mb-6"}>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy">
            Herramientas fiscales · RDC Contadores
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            {config.h1}
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">{config.subtitulo}</p>
        </header>
      ) : null}

      {!banner && !sinIntro ? (
        <div className="prose prose-slate max-w-none mb-8 space-y-3">
          {config.intro.map((p, i) => (
            <p key={i} className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      ) : null}

      {extraAntes}

      {sinCaja ? (
        children
      ) : (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 sm:p-6">
          {children}
        </div>
      )}

      {extra}

      {ctaTitulo ? (
        <div className="mt-6">
          <CtaConversionHerramienta titulo={ctaTitulo} subtitulo={ctaSubtitulo} />
        </div>
      ) : null}

      {config.faq.length > 0 ? (
        <section className="mt-10" aria-labelledby="faq-herramienta">
          <h2
            id="faq-herramienta"
            className="text-lg font-bold text-slate-900 mb-4"
          >
            Preguntas frecuentes
          </h2>
          <FaqSecciones items={config.faq} labelledBy="faq-herramienta" />
        </section>
      ) : null}

      <p className="mt-8 text-xs text-slate-500 text-center">
        Información de referencia. Para casos específicos consulte con su contador.{" "}
        <Link href="/contacto" className="text-marca-navy font-semibold hover:underline">
          Contactar a RDC Contadores
        </Link>
      </p>
    </>
  );

  const migas = (variante: "claro" | "navy") => (
    <nav
      className={`text-xs mb-0 ${variante === "navy" ? "text-white/55" : "text-slate-500"}`}
      aria-label="Ruta de navegación"
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            href="/"
            className={variante === "navy" ? "hover:text-white" : "hover:text-slate-900"}
          >
            Inicio
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link
            href="/herramientas"
            className={variante === "navy" ? "hover:text-white" : "hover:text-slate-900"}
          >
            Herramientas fiscales
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li className={variante === "navy" ? "text-white/90 font-medium" : "text-slate-700 font-medium"}>
          {config.h1}
        </li>
      </ol>
    </nav>
  );

  return (
    <PublicShell>
      <JsonLd data={buildHerramientaJsonLd(config)} />
      {config.ticker ? <TickerDivisas /> : null}

      {banner ? (
        <article className="bg-slate-50 pb-12 sm:pb-16">
          <div className="bg-marca-navy border-t-2 border-marca-acento">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5">
              {migas("navy")}
            </div>
            {banner}
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            {cuerpo}
          </div>
        </article>
      ) : (
        <article className="py-12 sm:py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">{migas("claro")}</div>
            {cuerpo}
          </div>
        </article>
      )}
    </PublicShell>
  );
}

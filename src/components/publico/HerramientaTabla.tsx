import type { CSSProperties, ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import SeguirEnSitio, {
  type DestinoSeguir,
} from "@/components/publico/SeguirEnSitio";
import { tonoHerramienta } from "@/lib/herramienta-tonos";
import type { HerramientaSeoConfig } from "@/lib/seo/herramientas-config";
import "./herramienta-cine.css";
import "./herramienta-tabla.css";

const TickerDivisas = dynamic(() => import("./TickerDivisas"), {
  loading: () => <div className="h-9 border-b border-slate-200/80 bg-white/95" />,
});

type Cta = {
  titulo: string;
  cuerpo: string;
  primario: { href: string; label: string };
  secundario?: { href: string; label: string };
};

type Destino = DestinoSeguir;

type Cabezal = {
  oficina: string;
  fuente: string;
};

/**
 * Shell del grupo Tablas: pliego de consulta, sin icono de app.
 * Calculadoras siguen en HerramientaCine.
 */
export default function HerramientaTabla({
  config,
  h1,
  lead,
  cabezal,
  children,
  hero,
  dato,
  despues,
  destinos,
  cta,
  jsonLd,
}: {
  config: HerramientaSeoConfig;
  h1: ReactNode;
  lead?: ReactNode;
  cabezal: Cabezal;
  children: ReactNode;
  hero?: { src: string; alt: string; pie?: string };
  dato?: ReactNode;
  despues?: ReactNode;
  destinos?: Destino[];
  cta: Cta;
  jsonLd?: ReactNode;
}) {
  const t = tonoHerramienta(config.id);
  const vars = {
    "--hz-campo": t.campo,
    "--hz-campo-deep": t.campoDeep,
    "--hz-chispa": t.chispa,
    "--hz-chispa-clara": t.chispaClara,
  } as CSSProperties;

  return (
    <PublicShell>
      {jsonLd}
      {config.ticker ? <TickerDivisas /> : null}
      <article
        className="hz-page tb-page"
        data-hz={config.id}
        data-tb={config.id}
        style={vars}
      >
        <nav className="hz-migas" aria-label="Ruta de navegación">
          <ol>
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li aria-hidden>&gt;</li>
            <li>
              <Link href="/herramientas">Herramientas fiscales</Link>
            </li>
            <li aria-hidden>&gt;</li>
            <li aria-current="page">{config.h1}</li>
          </ol>
        </nav>

        <header className={dato ? "hz-intro tb-intro" : "hz-intro"}>
          <h1>
            <span className="hz-h1-copy">{h1}</span>
          </h1>
          {dato}
          <p>{lead ?? config.subtitulo}</p>
        </header>

        <div className="hz-cuerpo">
          {hero ? (
            <figure className="tb-foto">
              <Image
                src={hero.src}
                alt={hero.alt}
                width={1600}
                height={900}
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 64rem"
              />
              {hero.pie ? <figcaption>{hero.pie}</figcaption> : null}
            </figure>
          ) : null}
          <div className="tb-cuerpo">
            {children}
            <p className="tb-fuente">
              {cabezal.oficina} · {cabezal.fuente}
            </p>
          </div>
          {despues}
        </div>

        {config.faq.length > 0 ? (
          <section className="hz-faq" aria-labelledby="faq-herramienta">
            <h2 id="faq-herramienta">Preguntas frecuentes</h2>
            <div className="hz-faq-lista">
              {config.faq.map((f) => (
                <article key={f.pregunta}>
                  <h3>{f.pregunta}</h3>
                  <p>{f.respuesta}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {destinos && destinos.length > 0 ? (
          <SeguirEnSitio destinos={destinos} />
        ) : null}

        <section className="hz-cta">
          <h2>{cta.titulo}</h2>
          <p>{cta.cuerpo}</p>
          <div className="hz-cta-acciones">
            <Link href={cta.primario.href} className="hz-btn" data-chispa="">
              {cta.primario.label}
            </Link>
            {cta.secundario ? (
              <Link href={cta.secundario.href} className="hz-btn" data-ghost="">
                {cta.secundario.label}
              </Link>
            ) : null}
          </div>
        </section>

        <p className="hz-nota">
          Información de referencia. Para trámites oficiales consulta con tu
          contador.
        </p>
      </article>
    </PublicShell>
  );
}

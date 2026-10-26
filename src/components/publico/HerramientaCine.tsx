import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import PublicShell from "@/components/publico/PublicShell";
import { tonoHerramienta } from "@/lib/herramienta-tonos";
import type { HerramientaSeoConfig } from "@/lib/seo/herramientas-config";
import "./herramienta-cine.css";

type Cta = {
  titulo: string;
  cuerpo: string;
  primario: { href: string; label: string };
  secundario?: { href: string; label: string };
};

type Destino = {
  href: string;
  label: string;
  detalle: string;
};

/** Lockup de app: solo calculadoras (no tablas ni tarifas). */
type Marca = {
  linea: string;
  sub: string;
};

export default function HerramientaCine({
  config,
  h1,
  icono,
  marca,
  lead,
  children,
  despues,
  destinos,
  cta,
  jsonLd,
}: {
  config: HerramientaSeoConfig;
  h1: ReactNode;
  icono?: ReactNode;
  marca?: Marca;
  lead?: string;
  children: ReactNode;
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
      <article className="hz-page" data-hz={config.id} style={vars}>
        <nav className="hz-migas" aria-label="Ruta de navegación">
          <ol>
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link href="/herramientas">Herramientas fiscales</Link>
            </li>
            <li aria-hidden>›</li>
            <li aria-current="page">{config.h1}</li>
          </ol>
        </nav>

        <header className="hz-intro">
          <h1>
            <span className="hz-h1-copy">{h1}</span>
          </h1>
          <p>{lead ?? config.subtitulo}</p>
        </header>

        <div className="hz-cuerpo">
          <div className="hz-panel">
            {icono && marca ? (
              <div className="hz-appbar">
                <div className="hz-marca">
                  <span className="hz-h1-icon" aria-hidden>
                    {icono}
                  </span>
                  <span className="hz-marca-copy">
                    <b>{marca.linea}</b>
                    <span>{marca.sub}</span>
                  </span>
                </div>
              </div>
            ) : null}
            {children}
          </div>
          {despues}
        </div>

        {destinos && destinos.length > 0 ? (
          <nav className="hz-seguir" aria-label="Profundizar">
            <h2>Seguir en el sitio</h2>
            {destinos.map((d) => (
              <Link key={d.href} href={d.href}>
                <strong>{d.label}</strong>
                <i aria-hidden>›</i>
                <span>{d.detalle}</span>
              </Link>
            ))}
          </nav>
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

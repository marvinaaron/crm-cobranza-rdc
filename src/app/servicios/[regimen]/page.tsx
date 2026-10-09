import { notFound, redirect } from "next/navigation";
import PublicShell from "@/components/publico/PublicShell";
import PaginaRegimenServicio from "@/components/publico/PaginaRegimenServicio";
import PaginaEspecialidadServicio from "@/components/publico/PaginaEspecialidadServicio";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";
import CtaConversionHerramienta from "@/components/ui/cta-conversion-herramienta";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import { buildBreadcrumbSchema } from "@/lib/seo/jsonld";
import {
  especialidadPorSlug,
  esSlugEspecialidadValido,
  SLUGS_ESPECIALIDAD,
} from "@/lib/servicios-especialidades";
import {
  REGIMEN_REDIRECTS,
  SLUGS_REGIMEN,
  regimenPorSlug,
} from "@/lib/servicios-regimenes";

type Props = {
  params: Promise<{ regimen: string }>;
};

export function generateStaticParams() {
  return [
    ...SLUGS_REGIMEN.map((regimen) => ({ regimen })),
    ...SLUGS_ESPECIALIDAD.map((regimen) => ({ regimen })),
  ];
}

export async function generateMetadata({ params }: Props) {
  const { regimen: slug } = await params;

  if (esSlugEspecialidadValido(slug)) {
    const esp = especialidadPorSlug(slug)!;
    return buildPublicMetadata({
      title: `${esp.titulo} — qué es, plazos y cumplimiento`,
      description: esp.metaDescription,
      path: `/servicios/${esp.slug}`,
      keywords: esp.keywords,
    });
  }

  const canonico = REGIMEN_REDIRECTS[slug] ?? slug;
  const regimen = regimenPorSlug(canonico);
  if (!regimen) return {};

  return buildPublicMetadata({
    title: `${regimen.titulo} — contabilidad y cumplimiento`,
    description: regimen.metaDescription,
    path: `/servicios/${regimen.slug}`,
    keywords: regimen.keywords,
  });
}

export default async function RegimenServicioPage({ params }: Props) {
  const { regimen: slug } = await params;

  if (esSlugEspecialidadValido(slug)) {
    const especialidad = especialidadPorSlug(slug);
    if (!especialidad) notFound();

    return (
      <PublicShell>
        <JsonLd
          data={buildBreadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Servicios", path: "/servicios" },
            { name: especialidad.titulo, path: `/servicios/${especialidad.slug}` },
          ])}
        />
        <PaginaEspecialidadServicio especialidad={especialidad} />
        <section className="py-12 sm:py-16 bg-slate-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <CtaConversionHerramienta
              titulo={`¿Necesitas ayuda con ${especialidad.titulo}?`}
              subtitulo="REPSE, ICSOE y SISUB en un solo despacho. Respuesta en 24 h."
            />
          </div>
        </section>
        <EnlacePaginasPortal desde="servicios" />
      </PublicShell>
    );
  }

  const destino = REGIMEN_REDIRECTS[slug];
  if (destino) redirect(`/servicios/${destino}`);
  const regimen = regimenPorSlug(slug);
  if (!regimen) notFound();

  return (
    <PublicShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Servicios", path: "/servicios" },
          { name: regimen.titulo, path: `/servicios/${regimen.slug}` },
        ])}
      />
      <PaginaRegimenServicio regimen={regimen} />
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <CtaConversionHerramienta
            titulo={`¿Listo para cotizar ${regimen.titulo}?`}
            subtitulo="Respuesta en 24 h · portal incluido · sin compromiso."
          />
        </div>
      </section>
      <EnlacePaginasPortal desde="servicios" />
    </PublicShell>
  );
}

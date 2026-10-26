import { notFound, redirect } from "next/navigation";
import PublicShell from "@/components/publico/PublicShell";
import PaginaRegimenServicio from "@/components/publico/PaginaRegimenServicio";
import PaginaResicoExpositor from "@/components/publico/PaginaResicoExpositor";
import PaginaPfaeExpositor from "@/components/publico/PaginaPfaeExpositor";
import PaginaPlataformasExpositor from "@/components/publico/PaginaPlataformasExpositor";
import PaginaArrendamientoExpositor from "@/components/publico/PaginaArrendamientoExpositor";
import PaginaSueldosExpositor from "@/components/publico/PaginaSueldosExpositor";
import PaginaRifExpositor from "@/components/publico/PaginaRifExpositor";
import PaginaRegimenGeneralExpositor from "@/components/publico/PaginaRegimenGeneralExpositor";
import PaginaFinesNoLucrativosExpositor from "@/components/publico/PaginaFinesNoLucrativosExpositor";
import PaginaRepseExpositor from "@/components/publico/PaginaRepseExpositor";
import PaginaIcsoeExpositor from "@/components/publico/PaginaIcsoeExpositor";
import PaginaSisubExpositor from "@/components/publico/PaginaSisubExpositor";
import PaginaEspecialidadServicio from "@/components/publico/PaginaEspecialidadServicio";
import EnlacePaginasPortal from "@/components/publico/EnlacePaginasPortal";
import CtaConversionHerramienta from "@/components/ui/cta-conversion-herramienta";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/metadata-publico";
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildHowToSchema,
} from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";
import { PFAE_FAQ, PFAE_PASOS_ISR } from "@/lib/pfae-expositor";
import {
  ARRENDAMIENTO_FAQ,
  ARRENDAMIENTO_PASOS_ISR,
} from "@/lib/arrendamiento-expositor";
import { SUELDOS_FAQ, SUELDOS_PASOS_ANUAL } from "@/lib/sueldos-expositor";
import { RIF_FAQ, RIF_PASOS_BIMESTRE } from "@/lib/rif-expositor";
import {
  PM_FAQ,
  PM_PASOS_ISR,
} from "@/lib/regimen-general-expositor";
import {
  FNL_FAQ,
  FNL_PASOS_TITULO,
} from "@/lib/fines-no-lucrativos-expositor";
import { REPSE_FAQ, REPSE_PASOS_PADRON } from "@/lib/repse-expositor";
import {
  ICSOE_FAQ,
  ICSOE_PASOS_DECLARACION,
} from "@/lib/icsoe-expositor";
import {
  SISUB_FAQ,
  SISUB_PASOS_DECLARACION,
} from "@/lib/sisub-expositor";
import {
  PLATAFORMAS_FAQ,
  PLATAFORMAS_PASOS_ISR,
} from "@/lib/plataformas-expositor";
import { RESICO_FAQ, RESICO_PASOS_ISR } from "@/lib/resico-expositor";
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
    if (esp.slug === "repse") {
      return buildPublicMetadata({
        title: "REPSE: padrón STPS, no es un régimen del SAT",
        description:
          "Guía REPSE: el registro se renueva cada tres años, ICSOE y SISUB vienen después, y sin padrón el cliente no deduce ni acredita IVA.",
        path: `/servicios/${esp.slug}`,
        keywords: esp.keywords,
      });
    }
    if (esp.slug === "icsoe") {
      return buildPublicMetadata({
        title: "ICSOE: declaración cuatrimestral ante el IMSS",
        description:
          "Guía ICSOE: no es un pago. Se presenta el día 17 de mayo, septiembre y enero. La plantilla debe cuadrar con el SISUB y con la nómina.",
        path: `/servicios/${esp.slug}`,
        keywords: esp.keywords,
      });
    }
    if (esp.slug === "sisub") {
      return buildPublicMetadata({
        title: "SISUB: declaración cuatrimestral ante el INFONAVIT",
        description:
          "Guía SISUB: no es un pago. Se presenta el día 17 de mayo, septiembre y enero. La plantilla debe cuadrar con el ICSOE y con la nómina.",
        path: `/servicios/${esp.slug}`,
        keywords: esp.keywords,
      });
    }
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

  if (regimen.slug === "resico") {
    return buildPublicMetadata({
      title: "RESICO persona física: qué es, tasas ISR y límites",
      description:
        "Guía RESICO (SAT 626): ISR 1% a 2.5% sobre ingresos cobrados, tope de $3.5 MDP, IVA aparte y sin deducir gastos. Para decidir si te conviene.",
      path: `/servicios/${regimen.slug}`,
      keywords: regimen.keywords,
    });
  }

  if (regimen.slug === "actividades-empresariales") {
    return buildPublicMetadata({
      title: "Actividades empresariales 612: ISR sobre utilidad y deducciones",
      description:
        "Guía SAT 612: ISR con tarifa progresiva sobre utilidad, deducciones con CFDI, pagos provisionales acumulados e IVA aparte. Para decidir si te conviene frente a RESICO.",
      path: `/servicios/${regimen.slug}`,
      keywords: regimen.keywords,
    });
  }

  if (regimen.slug === "plataformas-tecnologicas") {
    return buildPublicMetadata({
      title: "Plataformas tecnológicas 625: retenciones, ISR e IVA",
      description:
        "Guía SAT 625 para Uber, DiDi, Rappi, YouTube y marketplaces: cómo se calculan ISR e IVA, qué es la constancia de retenciones y cuándo es pago definitivo.",
      path: `/servicios/${regimen.slug}`,
      keywords: regimen.keywords,
    });
  }

  if (regimen.slug === "arrendamiento") {
    return buildPublicMetadata({
      title: "Arrendamiento 606: ISR, deducción 35% e IVA de rentas",
      description:
        "Guía SAT 606 para quien renta casa, departamento o local: el 35% es una deducción, no la tasa; IVA exento en vivienda; retención 10% si te paga una empresa.",
      path: `/servicios/${regimen.slug}`,
      keywords: regimen.keywords,
    });
  }

  if (regimen.slug === "sueldos-salarios") {
    return buildPublicMetadata({
      title: "Sueldos y salarios 605: retención del patrón y declaración anual",
      description:
        "Guía SAT 605: el patrón retiene ISR cada mes; tú declaras en abril si tuviste dos patrones, más de $400,000 u otros ingresos. El sueldo no lleva IVA.",
      path: `/servicios/${regimen.slug}`,
      keywords: regimen.keywords,
    });
  }

  if (regimen.slug === "rif") {
    return buildPublicMetadata({
      title: "RIF 621: transición, reducción bimestral y salida a RESICO",
      description:
        "Guía SAT 621: el RIF ya no admite altas. Si transitas, declaras cada bimestre con reducción según tu año de alta. El destino vigente es RESICO.",
      path: `/servicios/${regimen.slug}`,
      keywords: regimen.keywords,
    });
  }

  if (regimen.slug === "regimen-general") {
    return buildPublicMetadata({
      title: "Régimen general 601: ISR de lo facturado, IVA de lo cobrado",
      description:
        "Guía SAT 601: el ISR se calcula sobre lo facturado, el IVA sobre lo cobrado, la DIOT viaja con el IVA. Retenciones de ISR, IVA y salarios. CUFIN y CUCA en marzo.",
      path: `/servicios/${regimen.slug}`,
      keywords: regimen.keywords,
    });
  }

  if (regimen.slug === "fines-no-lucrativos") {
    return buildPublicMetadata({
      title: "Fines no lucrativos 603: Título III, donataria e IVA",
      description:
        "Guía SAT 603: el ISR del objeto social no se causa, la donataria es otra autorización y el IVA no se apaga. La anual es en febrero, no en marzo.",
      path: `/servicios/${regimen.slug}`,
      keywords: regimen.keywords,
    });
  }

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
    const esRepse = especialidad.slug === "repse";
    const esIcsoe = especialidad.slug === "icsoe";
    const esSisub = especialidad.slug === "sisub";

    return (
      <PublicShell>
        <JsonLd
          data={[
            buildBreadcrumbSchema([
              { name: "Inicio", path: "/" },
              { name: "Servicios", path: "/servicios" },
              {
                name: especialidad.titulo,
                path: `/servicios/${especialidad.slug}`,
              },
            ]),
            ...(esRepse
              ? [
                  buildFaqPageSchema([...REPSE_FAQ]),
                  buildHowToSchema({
                    name: "Cómo inscribirse en el padrón REPSE",
                    description:
                      "Pasos para entrar al Registro de Prestadoras de Servicios Especializados ante la STPS: especialización, opiniones de cumplimiento, expediente y renovación a tres años.",
                    url: `${SITE_URL}/servicios/repse`,
                    pasos: [...REPSE_PASOS_PADRON],
                  }),
                ]
              : esIcsoe
                ? [
                    buildFaqPageSchema([...ICSOE_FAQ]),
                    buildHowToSchema({
                      name: "Cómo presentar la declaración ICSOE ante el IMSS",
                      description:
                        "Pasos para cerrar el cuatrimestre: padrón vigente, plantilla NSS RFC y SDI, carga en el portal del IMSS y cruce con el SISUB.",
                      url: `${SITE_URL}/servicios/icsoe`,
                      pasos: [...ICSOE_PASOS_DECLARACION],
                    }),
                  ]
                : esSisub
                  ? [
                      buildFaqPageSchema([...SISUB_FAQ]),
                      buildHowToSchema({
                        name: "Cómo presentar la declaración SISUB ante el INFONAVIT",
                        description:
                          "Pasos para cerrar el cuatrimestre: padrón vigente, plantilla NSS RFC y SDI, carga en el portal del INFONAVIT y cruce con el ICSOE.",
                        url: `${SITE_URL}/servicios/sisub`,
                        pasos: [...SISUB_PASOS_DECLARACION],
                      }),
                    ]
                  : []),
          ]}
        />
        {esRepse ? (
          <PaginaRepseExpositor especialidad={especialidad} />
        ) : esIcsoe ? (
          <PaginaIcsoeExpositor especialidad={especialidad} />
        ) : esSisub ? (
          <PaginaSisubExpositor especialidad={especialidad} />
        ) : (
          <PaginaEspecialidadServicio especialidad={especialidad} />
        )}
        {esRepse || esIcsoe || esSisub ? null : (
          <section className="py-12 sm:py-16 bg-slate-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
              <CtaConversionHerramienta
                titulo={`¿Necesitas ayuda con ${especialidad.titulo}?`}
                subtitulo="REPSE, ICSOE y SISUB en un solo despacho. Respuesta en 24 h."
              />
            </div>
          </section>
        )}
        <EnlacePaginasPortal desde="servicios" />
      </PublicShell>
    );
  }

  const destino = REGIMEN_REDIRECTS[slug];
  if (destino) redirect(`/servicios/${destino}`);
  const regimen = regimenPorSlug(slug);
  if (!regimen) notFound();

  const esResico = regimen.slug === "resico";
  const esPfae = regimen.slug === "actividades-empresariales";
  const esPlataformas = regimen.slug === "plataformas-tecnologicas";
  const esArrendamiento = regimen.slug === "arrendamiento";
  const esSueldos = regimen.slug === "sueldos-salarios";
  const esRif = regimen.slug === "rif";
  const esRegimenGeneral = regimen.slug === "regimen-general";
  const esFinesNoLucrativos = regimen.slug === "fines-no-lucrativos";
  const schemas = [
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/servicios" },
      { name: regimen.titulo, path: `/servicios/${regimen.slug}` },
    ]),
    ...(esResico
      ? [
          buildFaqPageSchema([...RESICO_FAQ]),
          buildHowToSchema({
            name: "Cómo calcular el ISR mensual en RESICO",
            description:
              "Pasos para determinar el ISR de persona física en el Régimen Simplificado de Confianza (clave SAT 626).",
            url: `${SITE_URL}/servicios/resico`,
            pasos: [...RESICO_PASOS_ISR],
          }),
        ]
      : esPfae
        ? [
            buildFaqPageSchema([...PFAE_FAQ]),
            buildHowToSchema({
              name: "Cómo calcular el ISR provisional en actividades empresariales",
              description:
                "Pasos para determinar el pago provisional de ISR de persona física en el régimen 612.",
              url: `${SITE_URL}/servicios/actividades-empresariales`,
              pasos: [...PFAE_PASOS_ISR],
            }),
          ]
        : esPlataformas
          ? [
              buildFaqPageSchema([...PLATAFORMAS_FAQ]),
              buildHowToSchema({
                name: "Cómo conciliar el ISR mensual en plataformas tecnológicas",
                description:
                  "Pasos para conciliar constancias de retenciones de apps (Uber, DiDi, Rappi, YouTube, Mercado Libre) y cerrar el ISR del régimen 625.",
                url: `${SITE_URL}/servicios/plataformas-tecnologicas`,
                pasos: [...PLATAFORMAS_PASOS_ISR],
              }),
            ]
          : esArrendamiento
            ? [
                buildFaqPageSchema([...ARRENDAMIENTO_FAQ]),
                buildHowToSchema({
                  name: "Cómo calcular el ISR mensual en arrendamiento de inmuebles",
                  description:
                    "Pasos para determinar el ISR de persona física en el régimen 606: renta cobrada, deducción del 35% o comprobantes, y acreditamiento de la retención del inquilino.",
                  url: `${SITE_URL}/servicios/arrendamiento`,
                  pasos: [...ARRENDAMIENTO_PASOS_ISR],
                }),
              ]
            : esSueldos
              ? [
                  buildFaqPageSchema([...SUELDOS_FAQ]),
                  buildHowToSchema({
                    name: "Cómo presentar la declaración anual en sueldos y salarios",
                    description:
                      "Pasos para cerrar el ejercicio en el régimen 605: CFDI de nómina, retenciones del patrón, deducciones personales y declaración de abril.",
                    url: `${SITE_URL}/servicios/sueldos-salarios`,
                    pasos: [...SUELDOS_PASOS_ANUAL],
                  }),
                ]
              : esRif
                ? [
                    buildFaqPageSchema([...RIF_FAQ]),
                    buildHowToSchema({
                      name: "Cómo cerrar el bimestre en RIF",
                      description:
                        "Pasos para determinar el ISR del régimen 621 en transición: año de incorporación, ingresos del bimestre, tabla RIF y reducción.",
                      url: `${SITE_URL}/servicios/rif`,
                      pasos: [...RIF_PASOS_BIMESTRE],
                    }),
                  ]
                : esRegimenGeneral
                  ? [
                      buildFaqPageSchema([...PM_FAQ]),
                      buildHowToSchema({
                        name: "Cómo calcular el ISR de persona moral sobre lo facturado",
                        description:
                          "Pasos para determinar el ISR del régimen 601: ingresos facturados, coeficiente de utilidad, acreditamiento de provisionales y cierre de marzo con CUFIN y CUCA.",
                        url: `${SITE_URL}/servicios/regimen-general`,
                        pasos: [...PM_PASOS_ISR],
                      }),
                    ]
                  : esFinesNoLucrativos
                    ? [
                        buildFaqPageSchema([...FNL_FAQ]),
                        buildHowToSchema({
                          name: "Cómo cerrar el Título III en fines no lucrativos",
                          description:
                            "Pasos para el régimen 603: separar el objeto social de lo no relacionado, no repartir remanente y presentar la anual en febrero.",
                          url: `${SITE_URL}/servicios/fines-no-lucrativos`,
                          pasos: [...FNL_PASOS_TITULO],
                        }),
                      ]
                    : []),
  ];

  return (
    <PublicShell>
      <JsonLd data={schemas} />
      {esResico ? (
        <PaginaResicoExpositor regimen={regimen} />
      ) : esPfae ? (
        <PaginaPfaeExpositor regimen={regimen} />
      ) : esPlataformas ? (
        <PaginaPlataformasExpositor regimen={regimen} />
      ) : esArrendamiento ? (
        <PaginaArrendamientoExpositor regimen={regimen} />
      ) : esSueldos ? (
        <PaginaSueldosExpositor regimen={regimen} />
      ) : esRif ? (
        <PaginaRifExpositor regimen={regimen} />
      ) : esRegimenGeneral ? (
        <PaginaRegimenGeneralExpositor regimen={regimen} />
      ) : esFinesNoLucrativos ? (
        <PaginaFinesNoLucrativosExpositor regimen={regimen} />
      ) : (
        <PaginaRegimenServicio regimen={regimen} />
      )}
      {esPfae ||
      esResico ||
      esPlataformas ||
      esArrendamiento ||
      esSueldos ||
      esRif ||
      esRegimenGeneral ||
      esFinesNoLucrativos ? null : (
        <section className="py-5 bg-[#f2f2f7]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <CtaConversionHerramienta
              titulo={`¿Listo para cotizar ${regimen.titulo}?`}
              subtitulo="Respuesta en 24 h · portal incluido · sin compromiso."
            />
          </div>
        </section>
      )}
      <EnlacePaginasPortal desde="servicios" />
    </PublicShell>
  );
}

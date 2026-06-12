import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/lib/seo/json-ld";
import { SITE_URL } from "@/lib/seo/site";
import BotonesSuscripcionMundial from "@/components/publico/BotonesSuscripcionMundial";
import AgendaMundial from "@/components/publico/AgendaMundial";
import BracketMundial from "@/components/publico/BracketMundial";
import TablaGruposMundial from "@/components/publico/TablaGruposMundial";
import ConfetiMundial from "@/components/publico/ConfetiMundial";
import { PARTIDOS, ladoTexto } from "@/lib/mundial/datos";
import { obtenerResultados } from "@/lib/mundial/resultados";

export const revalidate = 600;

const URL_PAGINA = `${SITE_URL}/mundial-2026`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Calendario Mundial 2026 para tu celular (Apple, Google, Outlook)",
  description:
    "Agrega el calendario completo del Mundial 2026 a tu iPhone, Google Calendar u Outlook con un toque. 104 partidos con horarios de México, banderas y liga al marcador. Gratis, cortesía de RDC Contadores.",
  keywords: [
    "calendario mundial 2026",
    "fixture mundial 2026",
    "mundial 2026 horarios méxico",
    "agregar mundial al calendario",
    "calendario mundial iphone",
    "calendario mundial google",
  ],
  alternates: { canonical: URL_PAGINA },
  openGraph: {
    type: "website",
    url: URL_PAGINA,
    title: "Calendario Mundial 2026 — agrégalo a tu celular",
    description:
      "104 partidos con horarios de México y banderas. Suscríbete y se actualiza solo en tu iPhone, Google Calendar u Outlook.",
    siteName: "RDC Contadores",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calendario Mundial 2026 para tu celular",
    description:
      "Suscríbete y todos los partidos del Mundial 2026 aparecen en tu calendario, con banderas y horarios de México.",
  },
};

function jsonLdEventos() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Calendario Mundial 2026",
    itemListElement: PARTIDOS.filter((p) => p.local && p.visitante).map(
      (p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SportsEvent",
          name: `${ladoTexto(p.local, p.etiquetaLocal)} vs ${ladoTexto(p.visitante, p.etiquetaVisitante)} · Mundial 2026`,
          startDate: `${p.fecha}T${p.horaMex}:00-06:00`,
          sport: "Soccer",
          location: { "@type": "Place", name: p.sede },
          eventStatus: "https://schema.org/EventScheduled",
        },
      })
    ),
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo agrego el Mundial 2026 a mi iPhone?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Toca el botón Apple / iPhone. Tu celular preguntará si deseas suscribirte al calendario; acepta y todos los partidos aparecerán en tu app Calendario y se actualizarán solos.",
        },
      },
      {
        "@type": "Question",
        name: "¿Los horarios están en hora de México?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "El calendario se publica con los horarios oficiales y tu app lo muestra automáticamente en tu zona horaria. En México verás la hora del centro del país.",
        },
      },
      {
        "@type": "Question",
        name: "¿Tiene costo?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Es gratis, cortesía de RDC Contadores.",
        },
      },
    ],
  };
  return [itemList, faq];
}

export default async function MundialPage() {
  const resultados = await obtenerResultados();
  const partidos = PARTIDOS.map((p) =>
    resultados[p.n] ? { ...p, marcador: resultados[p.n] } : p
  );

  return (
    <main className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <JsonLd data={jsonLdEventos()} />

      <div className="mx-auto w-full max-w-5xl px-4 pt-14 sm:pt-20">
        {/* Recuadro estrella: agregar al calendario (idéntico al banner del inicio) */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(124,58,237,0.55)]">
          {/* Textura de fondo */}
          <Image
            src="/mundial/textura-mundial.png"
            alt=""
            fill
            className="object-cover"
            aria-hidden
            priority
          />
          <div className="absolute inset-0 bg-[#0a0a0f]/40" aria-hidden="true" />

          {/* Confeti cayendo */}
          <ConfetiMundial />

          {/* Marco de "26" de colores en el borde izquierdo */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-14" aria-hidden="true">
            <Image src="/mundial/columna-26.png" alt="" fill className="object-cover" />
          </div>

          <div className="relative flex flex-col items-center gap-9 py-12 pl-14 pr-8 text-center sm:py-16 sm:pl-24 sm:pr-12 lg:flex-row lg:gap-12 lg:text-left">
            {/* Emblema circular tipo medalla con aurora */}
            <div className="relative shrink-0">
              <div
                className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-rose-500/50 via-violet-500/50 to-orange-400/50 blur-3xl sm:h-72 sm:w-72"
                aria-hidden="true"
              />
              <div
                className="absolute -inset-2 rounded-full bg-gradient-to-tr from-rose-500 via-violet-500 to-orange-400 opacity-90 blur-[4px]"
                aria-hidden="true"
              />
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white shadow-2xl ring-1 ring-white/30 sm:h-40 sm:w-40">
                <Image
                  src="/mundial/emblema-26.png"
                  alt="Emblema del Mundial 2026"
                  width={250}
                  height={386}
                  className="h-[78%] w-auto object-contain"
                  priority
                />
              </div>
            </div>

            {/* Texto + botones de suscripción */}
            <div className="flex-1">
              <h1 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                Agregar el{" "}
                <span className="font-display bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">
                  Mundial 2026
                </span>{" "}
                a tu calendario
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60 sm:text-base lg:mx-0">
                Sincroniza los 104 partidos en tu app de calendario preferida.
                Se actualiza solo.
              </p>

              <div className="mt-9">
                <BotonesSuscripcionMundial fondoOscuro />
              </div>
            </div>
          </div>

          {/* Créditos en miniatura */}
          <p className="relative pb-6 pl-14 pr-8 text-center text-[9px] leading-relaxed text-white/25 sm:pl-24 sm:pr-12 lg:text-left">
            El emblema y la marca FIFA World Cup 26™ son propiedad de la FIFA.
            Imagen con fines ilustrativos; RDC Contadores no está afiliado ni
            patrocinado por la FIFA.
          </p>
        </section>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:pb-20">
        {/* Detalles desplegables: grupos, calendario completo y bracket */}
        <details className="group mt-8">
          <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
            Ver calendario completo y eliminatorias
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-open:rotate-180"
              aria-hidden
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>

          <div className="mt-8 space-y-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <section>
                <h2 className="mb-3 text-center text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Grupos
                </h2>
                <TablaGruposMundial partidos={partidos} />
              </section>

              <section>
                <h2 className="mb-3 text-center text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Calendario completo · 104 partidos
                </h2>
                <AgendaMundial partidos={partidos} />
              </section>
            </div>

            <section>
              <h2 className="mb-3 text-center text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Camino al título
              </h2>
              <BracketMundial partidos={partidos} />
            </section>
          </div>
        </details>

        {/* Pie / marca */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-slate-400">
            Calendario cortesía de{" "}
            <Link href="/" className="font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-300">
              RDC Contadores
            </Link>{" "}
            · Despacho contable y fiscal en México.
          </p>
        </footer>
      </div>
    </main>
  );
}

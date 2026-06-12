import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/lib/seo/json-ld";
import { SITE_URL } from "@/lib/seo/site";
import BotonesSuscripcionMundial from "@/components/publico/BotonesSuscripcionMundial";
import TiraPartidosMundial from "@/components/publico/TiraPartidosMundial";
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

      <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:py-20">
        {/* Recuadro estrella: agregar al calendario */}
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_20px_60px_-30px_rgba(15,23,42,0.3)] sm:px-10 sm:py-12 dark:border-white/10 dark:bg-slate-900">
          <span className="text-5xl" aria-hidden>
            🏆
          </span>
          <h1 className="mt-5 text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Agregar el Mundial 2026 a tu calendario
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
            Sincroniza los 104 partidos en tu app de calendario preferida. Se
            actualiza solo.
          </p>

          <div className="mt-9">
            <BotonesSuscripcionMundial />
          </div>
        </section>

        {/* Tira de partidos en miniatura, en movimiento */}
        <section className="mt-10">
          <h2 className="mb-3 text-center text-xs font-black uppercase tracking-widest text-slate-400">
            Esto es lo que se agrega · 104 partidos
          </h2>
          <TiraPartidosMundial partidos={partidos} />
        </section>

        {/* Pie / marca */}
        <footer className="mt-10 text-center">
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

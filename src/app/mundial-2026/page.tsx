import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/lib/seo/json-ld";
import { SITE_URL } from "@/lib/seo/site";
import BotonesSuscripcionMundial from "@/components/publico/BotonesSuscripcionMundial";
import {
  FASE_LABEL,
  PARTIDOS,
  bandera,
  ladoTexto,
  ligaGoogle,
  type PartidoMundial,
} from "@/lib/mundial/datos";
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

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function etiquetaFecha(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d, 12));
  const dia = DIAS[fecha.getUTCDay()];
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${d} de ${MESES[m - 1]}`;
}

function agrupadoPorFecha(
  lista: PartidoMundial[]
): { fecha: string; partidos: PartidoMundial[] }[] {
  const mapa = new Map<string, PartidoMundial[]>();
  for (const p of lista) {
    const lista = mapa.get(p.fecha) ?? [];
    lista.push(p);
    mapa.set(p.fecha, lista);
  }
  return [...mapa.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, partidos]) => ({
      fecha,
      partidos: partidos.sort((a, b) => a.horaMex.localeCompare(b.horaMex)),
    }));
}

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

function ChipFase({ p }: { p: PartidoMundial }) {
  const texto = p.fase === "grupos" && p.grupo ? `Grupo ${p.grupo}` : FASE_LABEL[p.fase];
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-400">
      {texto}
    </span>
  );
}

function FilaPartido({ p }: { p: PartidoMundial }) {
  const esMexico = p.local === "México" || p.visitante === "México";
  return (
    <a
      href={ligaGoogle(p)}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition hover:shadow-md ${
        esMexico
          ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/50"
      }`}
    >
      <div className="w-12 shrink-0 text-center">
        <p className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">
          {p.horaMex}
        </p>
        <p className="text-[9px] font-bold uppercase text-slate-400">MX</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
          {p.local ? `${bandera(p.local)} ${p.local}` : p.etiquetaLocal}
          {p.marcador ? (
            <span className="mx-1.5 rounded-md bg-slate-900 px-1.5 py-0.5 text-xs font-black tabular-nums text-white dark:bg-white dark:text-slate-900">
              {p.marcador}
            </span>
          ) : (
            <span className="mx-1.5 text-slate-400">vs</span>
          )}
          {p.visitante ? `${bandera(p.visitante)} ${p.visitante}` : p.etiquetaVisitante}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
          <ChipFase p={p} />
          <span className="truncate">{p.sede}</span>
        </p>
      </div>
      <span className="shrink-0 text-slate-300 transition group-hover:text-indigo-500 dark:text-slate-600">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
    </a>
  );
}

export default async function MundialPage() {
  const resultados = await obtenerResultados();
  const partidos = PARTIDOS.map((p) =>
    resultados[p.n] ? { ...p, marcador: resultados[p.n] } : p
  );
  const grupos = agrupadoPorFecha(partidos);

  return (
    <main className="min-h-dvh bg-white dark:bg-slate-950">
      <JsonLd data={jsonLdEventos()} />

      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
        {/* Hero */}
        <header className="flex flex-col items-center text-center">
          <span className="text-5xl" aria-hidden>
            🏆
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-[2.6rem] dark:text-white">
            Agregar el Mundial 2026 a tu calendario
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
            Sincroniza todos los partidos en tu app de calendario preferida. Se
            actualiza solo.
          </p>
        </header>

        {/* Suscripción */}
        <div className="mt-12">
          <BotonesSuscripcionMundial />
        </div>

        {/* Lista de partidos */}
        <section className="mt-20">
          <h2 className="mb-5 text-center text-sm font-black uppercase tracking-widest text-slate-400">
            Calendario completo · 104 partidos
          </h2>
          <div className="space-y-6">
            {grupos.map(({ fecha, partidos }) => (
              <div key={fecha}>
                <div className="sticky top-0 z-10 -mx-1 mb-2 bg-gradient-to-b from-white via-white/95 to-white/0 px-1 pb-1 pt-1 dark:from-slate-950 dark:via-slate-950/95">
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    {etiquetaFecha(fecha)}
                  </h3>
                </div>
                <div className="space-y-2">
                  {partidos.map((p) => (
                    <FilaPartido key={p.n} p={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pie / marca */}
        <footer className="mt-14 rounded-3xl border border-slate-200 bg-white/60 p-6 text-center dark:border-white/10 dark:bg-slate-900/40">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Calendario cortesía de RDC Contadores
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Despacho contable y fiscal en México. Mientras disfrutas el Mundial,
            nosotros mantenemos tu contabilidad y SAT al día.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Conoce RDC Contadores →
          </Link>
        </footer>
      </div>
    </main>
  );
}

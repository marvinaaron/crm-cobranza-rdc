/**
 * Cierre de página con tres cards de navegación cruzada.
 * Se usa en /nosotros, /proceso, /servicios y /preguntas-frecuentes
 * para que el visitante salte entre páginas y nunca se quede atorado.
 *
 * Recibe `desde` para personalizar las cards según la página actual.
 */

import Link from "next/link";

type Pagina = "nosotros" | "proceso" | "servicios" | "faq";
type CardKind = "faq" | "nosotros" | "proceso" | "servicios";

type Card = {
  kind: CardKind;
  badge: string;
  titulo: string;
  descripcion: string;
  href: string;
  cta: string;
};

const EYEBROW: Record<CardKind, string> = {
  proceso: "text-marca-navy",
  faq: "text-marca-acento",
  nosotros: "text-cyan-600",
  servicios: "text-marca-navy",
};

const ICON: Record<CardKind, string> = {
  proceso: "bg-marca-navy/10 text-marca-navy",
  faq: "bg-marca-acento/10 text-marca-acento",
  nosotros: "bg-cyan-50 text-cyan-600",
  servicios: "bg-marca-navy/10 text-marca-navy",
};

const BTN: Record<CardKind, string> = {
  proceso: "bg-marca-navy text-white hover:bg-marca-navy-soft",
  faq: "bg-marca-acento text-white hover:bg-[#6d28d9]",
  nosotros: "bg-cyan-500 text-white hover:bg-cyan-600",
  servicios: "bg-marca-navy text-white hover:bg-marca-navy-soft",
};

function Chevron() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="transition-transform group-hover:translate-x-0.5"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconoCard({ kind }: { kind: CardKind }) {
  const svg = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ICON[kind]}`}
    >
      {kind === "proceso" ? (
        <svg {...svg}>
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      ) : kind === "faq" ? (
        <span className="text-[15px] font-black leading-none">?</span>
      ) : kind === "servicios" ? (
        <svg {...svg}>
          <line x1="12" y1="2" x2="12" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ) : (
        <svg {...svg}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </span>
  );
}

const CARD_FAQ: Card = {
  kind: "faq",
  badge: "Resuelve dudas",
  titulo: "Preguntas frecuentes",
  descripcion:
    "Las 12 dudas más comunes antes de contratar: precios, cambio de contador, e.firma, portal, declaración anual y más.",
  href: "/preguntas-frecuentes",
  cta: "Ver preguntas",
};

const CARD_NOSOTROS: Card = {
  kind: "nosotros",
  badge: "Conoce al equipo",
  titulo: "El despacho detrás del portal",
  descripcion:
    "Más de una década acompañando personas físicas y morales. Conoce al equipo y el portal que diseñamos para ti.",
  href: "/nosotros",
  cta: "Conocer RDC",
};

const CARD_PROCESO: Card = {
  kind: "proceso",
  badge: "Siguiente lectura",
  titulo: "Nuestro proceso paso a paso",
  descripcion:
    "Del primer contacto al cierre del mes: el flujo de 7 pasos para mantener tu contabilidad al día.",
  href: "/proceso",
  cta: "Ver cómo trabajamos",
};

const CARD_SERVICIOS: Card = {
  kind: "servicios",
  badge: "Lo que hacemos",
  titulo: "Servicios y honorarios",
  descripcion:
    "Cumplimiento mensual, nómina, declaración anual y asesoría. Honorarios desde $812 al mes (IVA incluido) para RESICO PF.",
  href: "/servicios",
  cta: "Ver servicios",
};

function CardEnlace({ card }: { card: Card }) {
  return (
    <Link
      href={card.href}
      className="group flex flex-col rounded-xl bg-white ring-1 ring-black/[0.04] px-4 py-3.5 hover:shadow-md transition"
    >
      <div className="flex items-center gap-2.5">
        <IconoCard kind={card.kind} />
        <p
          className={`text-[11px] font-bold uppercase tracking-[0.22em] ${EYEBROW[card.kind]}`}
        >
          {card.badge}
        </p>
      </div>
      <h3 className="mt-3 text-[17px] font-black tracking-tight text-slate-900 leading-tight">
        {card.titulo}
      </h3>
      <p className="mt-1.5 text-[13px] text-slate-600 leading-snug">
        {card.descripcion}
      </p>
      <span className="mt-auto pt-4">
        <span
          className={`inline-flex h-9 w-full items-center justify-center gap-1 rounded-full text-[13px] font-bold ${BTN[card.kind]}`}
        >
          {card.cta}
          <Chevron />
        </span>
      </span>
    </Link>
  );
}

export default function EnlacePaginasPortal({
  desde,
  className,
}: {
  desde: Pagina;
  className?: string;
}) {
  const cards: Card[] =
    desde === "nosotros"
      ? [CARD_PROCESO, CARD_FAQ, CARD_SERVICIOS]
      : desde === "proceso"
        ? [CARD_SERVICIOS, CARD_FAQ, CARD_NOSOTROS]
        : desde === "faq"
          ? [CARD_PROCESO, CARD_SERVICIOS, CARD_NOSOTROS]
          : [CARD_PROCESO, CARD_FAQ, CARD_NOSOTROS];

  return (
    <section className={`py-6 sm:py-8 ${className ?? "bg-[#f2f2f7]"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-marca-navy">
            Sigue explorando
          </p>
          <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Más sobre el portal y cómo trabajamos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cards.map((card) => (
            <CardEnlace key={card.href} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

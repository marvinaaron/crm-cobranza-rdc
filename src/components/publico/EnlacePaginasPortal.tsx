/**
 * Cierre de página con tres cards de navegación cruzada.
 * Se usa en /nosotros, /proceso y /servicios para que el visitante salte
 * fluidamente entre las páginas relevantes y nunca se quede atorado.
 *
 * Recibe `desde` para personalizar las cards según la página actual.
 * Siempre incluye una card hacia /preguntas-frecuentes (alta conversión).
 */

import Link from "next/link";

type Pagina = "nosotros" | "proceso" | "servicios";

type Card = {
  badge: string;
  titulo: string;
  descripcion: string;
  href: string;
  cta: string;
  acentoBg: string; // gradiente del fondo
  acentoBadge: string; // color del badge superior
  preview: React.ReactNode;
};

function PreviewIconosPortal() {
  return (
    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 opacity-90">
      <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shadow-sm ring-1 ring-emerald-200">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shadow-sm ring-1 ring-indigo-200">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
        </svg>
      </span>
      <span className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shadow-sm ring-1 ring-rose-200">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>
    </div>
  );
}

function PreviewProceso() {
  return (
    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 opacity-90">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className="w-6 h-6 rounded-full bg-white text-slate-700 text-[10px] font-black flex items-center justify-center ring-2 ring-slate-100 shadow-sm"
        >
          {n}
        </span>
      ))}
      <span className="text-slate-400 text-xs font-black ml-0.5">···</span>
    </div>
  );
}

function PreviewFAQ() {
  return (
    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 opacity-90">
      <span className="w-8 h-8 rounded-full bg-amber-100 ring-2 ring-amber-200 text-amber-700 text-base font-black flex items-center justify-center shadow-sm">
        ?
      </span>
      <span className="w-7 h-7 rounded-full bg-white ring-2 ring-slate-100 text-slate-600 text-sm font-black flex items-center justify-center shadow-sm">
        ?
      </span>
      <span className="w-6 h-6 rounded-full bg-white ring-2 ring-slate-100 text-slate-400 text-xs font-black flex items-center justify-center shadow-sm">
        ?
      </span>
    </div>
  );
}

function PreviewServicios() {
  return (
    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 opacity-90">
      <span className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shadow-sm ring-1 ring-amber-200">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
          <line x1="12" y1="2" x2="12" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </span>
      <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shadow-sm ring-1 ring-emerald-200">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </span>
    </div>
  );
}

// Card de Preguntas Frecuentes - se incluye siempre porque es alto-conversión.
const CARD_FAQ: Card = {
  badge: "Resuelve dudas",
  titulo: "Preguntas frecuentes",
  descripcion:
    "Las 12 dudas más comunes antes de contratar: precios, cambio de contador, e.firma, portal, declaración anual y más. Respuestas claras y sin tecnicismos.",
  href: "/preguntas-frecuentes",
  cta: "Ver preguntas",
  acentoBg: "from-amber-50 via-white to-rose-50",
  acentoBadge: "bg-amber-100 text-amber-700",
  preview: <PreviewFAQ />,
};

// Cards reutilizables
const CARD_NOSOTROS: Card = {
  badge: "Conoce al equipo",
  titulo: "El despacho que está detrás del portal",
  descripcion:
    "Más de una década acompañando personas físicas y morales. Conoce al equipo y el portal exclusivo que diseñamos para ti.",
  href: "/nosotros",
  cta: "Conocer RDC",
  acentoBg: "from-violet-50 via-white to-indigo-50",
  acentoBadge: "bg-violet-100 text-violet-700",
  preview: <PreviewIconosPortal />,
};

const CARD_PROCESO: Card = {
  badge: "Siguiente lectura",
  titulo: "Conoce nuestro proceso paso a paso",
  descripcion:
    "Del primer contacto al cierre del mes: el flujo de 7 pasos que usamos para mantener tu contabilidad al día sin sorpresas.",
  href: "/proceso",
  cta: "Ver cómo trabajamos",
  acentoBg: "from-indigo-50 via-white to-violet-50",
  acentoBadge: "bg-indigo-100 text-indigo-700",
  preview: <PreviewProceso />,
};

const CARD_SERVICIOS: Card = {
  badge: "Lo que hacemos",
  titulo: "Servicios y honorarios",
  descripcion:
    "Cumplimiento mensual, nómina, declaración anual, asesoría y más. Honorarios desde $812 al mes (IVA incluido) para RESICO PF.",
  href: "/servicios",
  cta: "Ver servicios",
  acentoBg: "from-emerald-50 via-white to-teal-50",
  acentoBadge: "bg-emerald-100 text-emerald-700",
  preview: <PreviewServicios />,
};

function CardEnlace({ card }: { card: Card }) {
  return (
    <Link
      href={card.href}
      className={`group relative block rounded-3xl overflow-hidden p-6 sm:p-7 ring-1 ring-slate-200 hover:ring-slate-900 hover:shadow-2xl hover:-translate-y-1 transition-all bg-gradient-to-br ${card.acentoBg}`}
    >
      {card.preview}
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${card.acentoBadge}`}
      >
        {card.badge}
      </span>
      <h3 className="mt-4 text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-tight">
        {card.titulo}
      </h3>
      <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
        {card.descripcion}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-slate-900 group-hover:gap-3 transition-all">
        {card.cta}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:translate-x-0.5 transition-transform"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

export default function EnlacePaginasPortal({ desde }: { desde: Pagina }) {
  // 3 cards por página, siempre incluyendo FAQ como gancho de conversión.
  const cards: Card[] =
    desde === "nosotros"
      ? [CARD_PROCESO, CARD_FAQ, CARD_SERVICIOS]
      : desde === "proceso"
        ? [CARD_NOSOTROS, CARD_FAQ, CARD_SERVICIOS]
        : [CARD_PROCESO, CARD_FAQ, CARD_NOSOTROS];

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
            Sigue explorando
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Más sobre el portal y cómo trabajamos
          </h2>
          <p className="mt-3 text-sm text-slate-600 max-w-xl mx-auto">
            Estas son las rutas que más nos preguntan los nuevos clientes antes
            de contratar. Elige por dónde quieres seguir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => (
            <CardEnlace key={card.href} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

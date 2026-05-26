/**
 * Cierre de página con dos cards de navegación cruzada.
 * Se usa en /nosotros y /proceso para que el visitante salte fluidamente
 * entre las dos páginas que más enfatizan el portal/CRM del despacho.
 *
 * El componente recibe `desde` para personalizar el contenido de ambas cards
 * según la página actual.
 */

import Link from "next/link";

type Pagina = "nosotros" | "proceso";

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

function PreviewPortalNosotros() {
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

function CardEnlace({ card }: { card: Card }) {
  return (
    <Link
      href={card.href}
      className={`group relative block rounded-3xl overflow-hidden p-6 sm:p-8 ring-1 ring-slate-200 hover:ring-slate-900 hover:shadow-2xl hover:-translate-y-1 transition-all bg-gradient-to-br ${card.acentoBg}`}
    >
      {card.preview}
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${card.acentoBadge}`}
      >
        {card.badge}
      </span>
      <h3 className="mt-4 text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
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
  // En /nosotros: la primera card invita al proceso, la segunda al portal.
  // En /proceso: la primera card invita a Nosotros (equipo + portal), la
  // segunda al portal.
  const cards: Card[] =
    desde === "nosotros"
      ? [
          {
            badge: "Siguiente lectura",
            titulo: "Conoce nuestro proceso paso a paso",
            descripcion:
              "Del primer contacto al cierre del mes: el flujo de 7 pasos que usamos para mantener tu contabilidad al día sin sorpresas.",
            href: "/proceso",
            cta: "Ver cómo trabajamos",
            acentoBg: "from-indigo-50 via-white to-violet-50",
            acentoBadge: "bg-indigo-100 text-indigo-700",
            preview: <PreviewProceso />,
          },
          {
            badge: "Pruébalo tú",
            titulo: "Entra al portal del cliente",
            descripcion:
              "¿Ya eres cliente? Accede a tu portal y revisa tu estado. ¿Eres nuevo? Pídenos acceso y te damos un recorrido completo.",
            href: "/portal/login",
            cta: "Entrar al portal",
            acentoBg: "from-emerald-50 via-white to-indigo-50",
            acentoBadge: "bg-emerald-100 text-emerald-700",
            preview: <PreviewPortalNosotros />,
          },
        ]
      : [
          {
            badge: "Conoce al equipo",
            titulo: "El despacho que está detrás del portal",
            descripcion:
              "Más de una década acompañando personas físicas y morales. Conoce al equipo y el portal exclusivo que diseñamos para ti.",
            href: "/nosotros",
            cta: "Conocer RDC",
            acentoBg: "from-violet-50 via-white to-indigo-50",
            acentoBadge: "bg-violet-100 text-violet-700",
            preview: <PreviewPortalNosotros />,
          },
          {
            badge: "Pruébalo tú",
            titulo: "Entra al portal del cliente",
            descripcion:
              "¿Ya eres cliente? Accede a tu portal y revisa tu estado. ¿Eres nuevo? Pídenos acceso y te damos un recorrido completo.",
            href: "/portal/login",
            cta: "Entrar al portal",
            acentoBg: "from-emerald-50 via-white to-indigo-50",
            acentoBadge: "bg-emerald-100 text-emerald-700",
            preview: (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 opacity-90">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm ring-2 ring-emerald-100">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm ring-2 ring-indigo-100">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
              </div>
            ),
          },
        ];

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
            Estas son las dos rutas que más nos preguntan los nuevos clientes
            antes de contratar. Elige por dónde quieres seguir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card) => (
            <CardEnlace key={card.href} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

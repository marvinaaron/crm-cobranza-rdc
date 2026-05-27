"use client";

/**
 * Sección "Trabajamos con": carrusel infinito de tarjetas con los perfiles
 * de cliente reales del despacho. Se inspira en el ticker de divisas para
 * dar sensación de movimiento sin saturar la página.
 */

import Link from "next/link";

type Caso = {
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  tono: string; // gradiente del fondo de la card
  acento: string; // color del badge/avatar del icono
};

const CASOS: Caso[] = [
  {
    titulo: "Transportistas",
    descripcion:
      "Acreditamos el IEPS de tu diésel, controlamos comprobantes de combustible y casetas, y dejamos al día tus complementos Carta Porte.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 17h4V5H2v12h3" />
        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
    tono: "from-blue-50 to-white",
    acento: "bg-blue-100 text-blue-600 ring-blue-200",
  },
  {
    titulo: "Dentistas",
    descripcion:
      "Facturación a pacientes con CFDI de servicios médicos, RESICO PF con honorarios y declaración anual con deducciones personales.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5.5c-1.5-1.5-3.5-2.5-5.5-2-1.5.3-2.5 1.7-2.5 3.4 0 1.4.5 2.7.9 4 .8 2.4 1.4 5.6 2.6 8 .5 1 1.6 1.1 2.2.1.7-1.2 1-3 2.3-3s1.6 1.8 2.3 3c.6 1 1.7.9 2.2-.1 1.2-2.4 1.8-5.6 2.6-8 .4-1.3.9-2.6.9-4 0-1.7-1-3.1-2.5-3.4-2-.5-4 .5-5.5 2z" />
      </svg>
    ),
    tono: "from-indigo-50 to-white",
    acento: "bg-indigo-100 text-indigo-600 ring-indigo-200",
  },
  {
    titulo: "Contratistas",
    descripcion:
      "Padrón REPSE vigente, presentación de informes ICSOE y SISUB ante IMSS e Infonavit. Somos de los pocos despachos que lo hacemos mes con mes.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9v.01" />
        <path d="M9 12v.01" />
        <path d="M9 15v.01" />
        <path d="M9 18v.01" />
      </svg>
    ),
    tono: "from-slate-50 to-white",
    acento: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  {
    titulo: "Sector automotriz",
    descripcion:
      "Agencias, talleres y refaccionarias. Manejo fiscal de unidades nuevas y usadas, control de inventario, garantías y clientes flotilleros.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
        <circle cx="6.5" cy="16.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </svg>
    ),
    tono: "from-amber-50 to-white",
    acento: "bg-amber-100 text-amber-600 ring-amber-200",
  },
  {
    titulo: "Honorarios",
    descripcion:
      "Freelancers, consultores y profesionistas independientes. Optimización de retenciones, RESICO PF cuando conviene y saldo a favor maximizado.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    tono: "from-emerald-50 to-white",
    acento: "bg-emerald-100 text-emerald-600 ring-emerald-200",
  },
  {
    titulo: "Escuelas y colegios",
    descripcion:
      "Instituciones con autorización SEP. CFDI de colegiaturas deducible para padres, nómina docente con prestaciones e IMSS, Infonavit e ISN al día.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    tono: "from-violet-50 to-white",
    acento: "bg-violet-100 text-violet-600 ring-violet-200",
  },
  {
    titulo: "Fotógrafos",
    descripcion:
      "Estudios y fotógrafos independientes. Manejo de equipo deducible, retención de honorarios y facturación a empresas o particulares con CFDI 4.0.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    tono: "from-rose-50 to-white",
    acento: "bg-rose-100 text-rose-600 ring-rose-200",
  },
  {
    titulo: "Ingenieros en proyectos",
    descripcion:
      "Consultoría y proyectos por etapas. Facturación parcial por avance de obra, retenciones y comprobantes de gastos de viaje y viáticos.",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    tono: "from-teal-50 to-white",
    acento: "bg-teal-100 text-teal-600 ring-teal-200",
  },
];

function CasoCard({ caso }: { caso: Caso }) {
  return (
    <article
      className={`shrink-0 w-[280px] sm:w-[320px] mx-2.5 bg-gradient-to-br ${caso.tono} rounded-2xl p-5 ring-1 ring-slate-200 shadow-sm`}
    >
      <span
        className={`inline-flex w-10 h-10 rounded-xl items-center justify-center ring-1 ${caso.acento}`}
      >
        {caso.icono}
      </span>
      <h3 className="mt-3.5 text-[15px] font-black text-slate-900 leading-tight">
        {caso.titulo}
      </h3>
      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
        {caso.descripcion}
      </p>
    </article>
  );
}

export default function CasosDeUso() {
  const duplicados = [...CASOS, ...CASOS];

  return (
    <section className="py-10 sm:py-14 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
            Para quién trabajamos
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Llevamos la contabilidad de negocios como el tuyo
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Cada giro tiene sus particularidades fiscales. Estos son los perfiles
            de cliente que trabajamos día a día.
          </p>
        </div>
      </div>

      {/* Carrusel infinito full-width */}
      <div className="relative overflow-hidden py-1">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-slate-50 to-transparent" />

        <div className="casos-track flex will-change-transform">
          {duplicados.map((c, i) => (
            <CasoCard key={`${c.titulo}-${i}`} caso={c} />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mt-10 text-center text-sm text-slate-500">
          ¿No te ves en la lista? También trabajamos contigo —{" "}
          <Link
            href="/contacto"
            className="font-bold text-slate-900 underline underline-offset-4 hover:text-indigo-600"
          >
            cuéntanos tu caso
          </Link>
          .
        </p>
      </div>

      <style jsx>{`
        .casos-track {
          animation: casos-scroll 60s linear infinite;
          width: max-content;
        }
        .casos-track:hover {
          animation-play-state: paused;
        }
        @keyframes casos-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .casos-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
